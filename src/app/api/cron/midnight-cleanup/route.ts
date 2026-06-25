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
      deletedLogsResult
    ] = await prisma.$transaction([
      // 1. Expire stale tokens
      prisma.queueToken.updateMany({
        where: {
          status: { in: ['PAYMENT_PENDING', 'READY', 'CALLED', 'IN_CONSULTATION', 'BOOKED'] }
        },
        data: {
          status: 'EXPIRED'
        }
      }),

      // 2. Close active/paused queues
      prisma.dailyQueue.updateMany({
        where: {
          status: { in: ['ACTIVE', 'PAUSED'] }
        },
        data: {
          status: 'CLOSED'
        }
      }),

      // 3. Reset doctor status (set availabilityStatus to OFFLINE)
      prisma.doctor.updateMany({
        where: {
          availabilityStatus: { in: ['AVAILABLE', 'ON_BREAK'] }
        },
        data: {
          availabilityStatus: 'OFFLINE'
        }
      }),

      // 4. Delete old search logs (older than 90 days)
      prisma.searchLog.deleteMany({
        where: {
          createdAt: { lt: ninetyDaysAgo }
        }
      })
    ]);

    // Record cleanup metrics in AuditLog
    await prisma.auditLog.create({
      data: {
        action: AuditAction.DELETE,
        entityType: 'SYSTEM',
        newValue: JSON.stringify({
          expiredTokens: expiredTokensResult.count,
          closedQueues: closedQueuesResult.count,
          resetDoctors: resetDoctorsResult.count,
          deletedLogs: deletedLogsResult.count,
        })
      }
    });

    return apiResponse({
      success: true,
      metrics: {
        expiredTokens: expiredTokensResult.count,
        closedQueues: closedQueuesResult.count,
        resetDoctors: resetDoctorsResult.count,
        deletedLogs: deletedLogsResult.count,
      }
    });
  } catch (error) {
    console.error('Midnight Cleanup Cron Error:', error);
    return apiError("Internal server error", 500);
  }
}
