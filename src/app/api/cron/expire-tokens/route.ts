import { apiResponse, apiError } from '@/lib/utils/api-response';
import { NextResponse } from 'next/server';
import prisma from '@/lib/db/prisma';

export async function GET(request: Request) {
  try {
    const authHeader = request.headers.get('authorization');
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      return apiError("Unauthorized", 401);
    }

    const now = new Date();
    const cutoffDate = new Date(Date.now() - 4 * 60 * 60 * 1000); // 4 hours buffer

    const result = await prisma.queueToken.updateMany({
      where: {
        status: { in: ['BOOKED', 'PAYMENT_PENDING', 'READY'] as any },
        bookedAt: { lt: cutoffDate }
      },
      data: { status: 'EXPIRED' }
    });

    return apiResponse({ success: true, expiredCount: result.count });
  } catch (error) {
    console.error('Auto-Expire Tokens Error:', error);
    return apiError("Internal server error", 500);
  }
}
