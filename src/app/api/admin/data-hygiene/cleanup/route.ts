import { apiResponse, apiError } from '@/lib/utils/api-response';
import { NextResponse } from 'next/server';
import { verifyToken } from '@/lib/jwt';
import { cookies } from 'next/headers';
import prisma from '@/lib/db/prisma';

export async function POST(request: Request) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("jivnicare_token")?.value;

    if (!token) {
      return apiError("Unauthorized", 401);
    }

    const payload: any = await verifyToken(token);
    if (!payload || !payload.id || payload.role !== "ADMIN") {
      return apiError("Forbidden: Admin access only", 403);
    }

    const { target } = await request.json();
    const now = new Date();

    let deletedCount = 0;
    let message = "";

    switch (target) {
      case "EXPIRED_OTPS": {
        deletedCount = 0;
        message = `Simulated delete. 0 OTP records deleted (not stored in database).`;
        break;
      }
      case "EXPIRED_RATE_LIMITS": {
        const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);
        const result = await prisma.rateLimitLog.deleteMany({
          where: { windowStart: { lt: oneDayAgo } }
        });
        deletedCount = result.count;
        message = `Deleted ${deletedCount} expired Rate Limit records.`;
        break;
      }
      case "ORPHAN_WALK_INS": {
        const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        const result = await prisma.queueToken.deleteMany({
          where: { type: 'WALKIN', bookedAt: { lt: thirtyDaysAgo } }
        });
        deletedCount = result.count;
        message = `Deleted ${deletedCount} walk-in records older than 30 days.`;
        break;
      }
      case "HISTORICAL_QUEUES": {
        const ninetyDaysAgo = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
        const tokenResult = await prisma.queueToken.deleteMany({
          where: { queue: { date: { lt: ninetyDaysAgo } } }
        });
        const queueResult = await prisma.dailyQueue.deleteMany({
          where: { date: { lt: ninetyDaysAgo } }
        });
        deletedCount = queueResult.count;
        message = `Deleted ${queueResult.count} queues and ${tokenResult.count} tokens older than 90 days.`;
        break;
      }
      default:
        return apiError("Invalid target specified.", 400);
    }

    return apiResponse({
      success: true,
      message,
      deletedCount
    });

  } catch (error) {
    console.error("Data Hygiene Cleanup Error:", error);
    return apiError("Internal Server Error", 500);
  }
}
