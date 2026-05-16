import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getCurrentLogicalDay } from "@/lib/clinic-utils";
import { redis } from "@/lib/redis";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: doctorId } = await params;
    
    const cacheKey = `queue_stats:${doctorId}`;
    let cachedStats = null;
    
    try {
      cachedStats = await redis.get(cacheKey);
    } catch (redisError) {
      console.warn("⚠️ Redis GET failed in queue-stats, skipping cache read:", redisError);
    }
    
    if (cachedStats) {
      const stats = typeof cachedStats === 'string' ? JSON.parse(cachedStats) : cachedStats;
      const response = NextResponse.json({ success: true, queue: stats });
      response.headers.set('Cache-Control', 's-maxage=10, stale-while-revalidate');
      return response;
    }

    // Use hardened logical day reset
    const today = getCurrentLogicalDay();

    const doctor = await prisma.doctor.findUnique({
      where: { id: doctorId },
      select: {
        averageConsultationTime: true,
        clinicOperations: true,
        weeklySchedule: true,
      }
    });

    if (!doctor) {
      return NextResponse.json({ error: "Doctor not found" }, { status: 404 });
    }

    const queue = await prisma.dailyQueue.findUnique({
      where: {
        doctorId_date: {
          doctorId,
          date: today,
        }
      },
      include: {
        _count: {
          select: {
            tokens: {
              where: { status: "WAITING" }
            }
          }
        }
      }
    });

    const currentActiveToken = queue?.currentActiveToken || 0;
    const totalInQueue = queue?._count.tokens || 0;
    const avgTime = doctor.averageConsultationTime || 15;
    const estimatedWait = totalInQueue * avgTime;

    const currentDayName = today.toLocaleDateString('en-US', { weekday: 'long' }).toLowerCase();
    const daySchedule: any = (doctor.weeklySchedule as any)?.[currentDayName] || { isOpen: true }; // Fallback to open if no schedule

    const queueData = {
      currentToken: currentActiveToken,
      totalInQueue,
      estimatedWait,
      avgTime,
      status: queue?.status || "NOT_STARTED",
      isClosedToday: doctor.clinicOperations?.isClosedToday || !daySchedule.isOpen,
      timings: daySchedule.isOpen ? `${daySchedule.start} - ${daySchedule.end}` : "Closed Today",
    };

    try {
      // Cache the result in Redis for 10 seconds to protect MongoDB
      await redis.setex(cacheKey, 10, JSON.stringify(queueData));
    } catch (redisError) {
      console.warn("⚠️ Redis caching failed in queue-stats, continuing without cache:", redisError);
    }

    const response = NextResponse.json({
      success: true,
      queue: queueData
    });

    response.headers.set('Cache-Control', 's-maxage=10, stale-while-revalidate');
    return response;

  } catch (error: any) {
    console.error("Queue stats error:", error);
    return NextResponse.json({ error: "Failed to fetch queue stats" }, { status: 500 });
  }
}
