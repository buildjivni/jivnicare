import { apiResponse, apiError } from '@/lib/utils/api-response';
import { NextResponse } from 'next/server';
import prisma from '@/lib/db/prisma';
import { AuditAction } from '@prisma/client';

export async function GET(request: Request) {
  try {
    const authHeader = request.headers.get('authorization');
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      return apiError("Unauthorized", 401);
    }

    const ninetyDaysAgo = new Date(Date.now() - 90 * 24 * 60 * 60 * 1000);

    // Run cleanups in transaction
    const [
      expiredTokensResult,
      closedQueuesResult,
      resetDoctorsResult,
      deletedLogsResult,
      deletedAnalyticsResult
    ] = await prisma.$transaction([
      // 1. Expire stale tokens (WAITING, PAYMENT_PENDING, READY, CALLED, IN_CONSULTATION, BOOKED)
      prisma.queueToken.updateMany({
        where: {
          status: { in: ['WAITING', 'PAYMENT_PENDING', 'READY', 'CALLED', 'IN_CONSULTATION', 'BOOKED'] }
        },
        data: {
          status: 'EXPIRED',
          tokenStatus: 'EXPIRED'
        }
      }),

      // 2. Close active queues
      prisma.dailyQueue.updateMany({
        where: {
          status: 'OPEN'
        },
        data: {
          status: 'CLOSED',
          queueStatus: 'COMPLETED'
        }
      }),

      // 3. Reset doctor status (set isOnline to false)
      prisma.doctor.updateMany({
        where: {
          isOnline: true
        },
        data: {
          isOnline: false
        }
      }),

      // 4. Delete old search logs (older than 90 days)
      prisma.searchLog.deleteMany({
        where: {
          createdAt: { lt: ninetyDaysAgo }
        }
      }),

      // 5. Delete old search analytics (older than 90 days)
      prisma.searchAnalytics.deleteMany({
        where: {
          createdAt: { lt: ninetyDaysAgo }
        }
      })
    ]);

    // Record cleanup metrics in AuditLog
    await prisma.auditLog.create({
      data: {
        action: AuditAction.SYSTEM_CLEANUP,
        entityType: 'SYSTEM',
        newValue: JSON.stringify({
          expiredTokens: expiredTokensResult.count,
          closedQueues: closedQueuesResult.count,
          resetDoctors: resetDoctorsResult.count,
          deletedLogs: deletedLogsResult.count + deletedAnalyticsResult.count,
        })
      }
    });

    return apiResponse({
      success: true,
      metrics: {
        expiredTokens: expiredTokensResult.count,
        closedQueues: closedQueuesResult.count,
        resetDoctors: resetDoctorsResult.count,
        deletedLogs: deletedLogsResult.count + deletedAnalyticsResult.count,
      }
    });
  } catch (error) {
    console.error('Midnight Cleanup Cron Error:', error);
    return apiError("Internal server error", 500);
  }
}
