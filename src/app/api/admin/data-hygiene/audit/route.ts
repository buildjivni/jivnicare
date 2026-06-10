import { apiResponse, apiError } from '@/lib/utils/api-response';
import { NextResponse } from 'next/server';
import { verifyToken } from '@/lib/jwt';
import { cookies } from 'next/headers';
import prisma from '@/lib/db/prisma';

export async function GET(request: Request) {
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

    const now = new Date();
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    const ninetyDaysAgo = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);

    // 1. Audit OTPs
    const expiredOtps = await prisma.otpToken.count({
      where: { expiresAt: { lt: now } }
    });

    // 2. Audit Rate Limits
    const expiredRateLimits = await prisma.rateLimit.count({
      where: { resetTime: { lt: now } }
    });

    // 3. Audit Walk-In Entries (> 30 days)
    const orphanWalkIns = await prisma.walkInEntry.count({
      where: { createdAt: { lt: thirtyDaysAgo } }
    });

    // 4. Audit Historical Queues (> 90 days)
    const historicalQueues = await prisma.dailyQueue.count({
      where: { date: { lt: ninetyDaysAgo } }
    });
    
    // Count historic tokens specifically tied to those old queues
    const historicalTokens = await prisma.queueToken.count({
      where: { queue: { date: { lt: ninetyDaysAgo } } }
    });

    return NextResponse.json({
      success: true,
      audit: {
        timestamp: now.toISOString(),
        risks: {
          expiredOtps,
          expiredRateLimits,
          orphanWalkIns,
          historicalQueues,
          historicalTokens
        },
        estimatedStorageWaste: `${(expiredOtps * 0.5 + expiredRateLimits * 0.3 + historicalTokens * 1.2) / 1024} MB` // Rough estimation
      }
    });
  } catch (error) {
    console.error("Data Hygiene Audit Error:", error);
    return apiError("Internal Server Error", 500);
  }
}
