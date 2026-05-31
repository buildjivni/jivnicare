import { NextResponse } from 'next/server';
import { verifyToken } from '@/lib/jwt';
import { cookies } from 'next/headers';
import prisma from '@/lib/db/prisma';
import { logOperationalError } from '@/lib/telemetry/redis';

export async function POST(request: Request) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("auth-token")?.value;

    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const payload: any = await verifyToken(token);
    if (!payload || !payload.id || payload.role !== "ADMIN") {
      return NextResponse.json({ error: "Forbidden: Admin access only" }, { status: 403 });
    }

    const { target } = await request.json();
    const now = new Date();

    let deletedCount = 0;
    let message = "";

    switch (target) {
      case "EXPIRED_OTPS": {
        const result = await prisma.otpToken.deleteMany({
          where: { expiresAt: { lt: now } }
        });
        deletedCount = result.count;
        message = `Deleted ${deletedCount} expired OTP records.`;
        break;
      }
      case "EXPIRED_RATE_LIMITS": {
        const result = await prisma.rateLimit.deleteMany({
          where: { resetTime: { lt: now } }
        });
        deletedCount = result.count;
        message = `Deleted ${deletedCount} expired Rate Limit records.`;
        break;
      }
      case "ORPHAN_WALK_INS": {
        const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        const result = await prisma.walkInEntry.deleteMany({
          where: { createdAt: { lt: thirtyDaysAgo } }
        });
        deletedCount = result.count;
        message = `Deleted ${deletedCount} walk-in records older than 30 days.`;
        break;
      }
      case "HISTORICAL_QUEUES": {
        const ninetyDaysAgo = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
        // Note: QueueToken deletes cascade from DailyQueue automatically if set up correctly, 
        // but it's safer to delete tokens first or rely on MongoDB constraints
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
        return NextResponse.json({ error: "Invalid target specified." }, { status: 400 });
    }

    // Log the cleanup action operationally for security/audit trail
    await logOperationalError({
      type: 'DATA_HYGIENE_CLEANUP',
      route: '/api/admin/data-hygiene/cleanup',
      category: 'ADMIN_ACTION',
      timestamp: new Date().toISOString(),
      // Adding target/count as part of category text just to fit existing schema
    }).catch(() => {});

    return NextResponse.json({
      success: true,
      message,
      deletedCount
    });

  } catch (error) {
    console.error("Data Hygiene Cleanup Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
