import { apiResponse, apiError } from '@/lib/utils/api-response';
import { NextResponse } from "next/server";
import prisma from "@/lib/db/prisma";
import { resolveClinicLogicalDay, getUnifiedQueueCapacity, isEmergencyToken } from "@/lib/utils/clinic-utils";
import { redis } from "@/lib/db/redis";

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
      const response = apiResponse({success: true, queue: stats});
      response.headers.set('Cache-Control', 's-maxage=10, stale-while-revalidate');
      return response;
    }

    // Use hardened logical day reset
    const today = resolveClinicLogicalDay();

    const doctor = await prisma.doctor.findUnique({
      where: { id: doctorId },
      select: {
        weeklySchedule: true,
        isAcceptingBookings: true,
        isEmergencyEnabled: true,
        emergencyCapacity: true,
        availabilityStatus: true,
      }
    });

    if (!doctor) {
      return apiError("Doctor not found", 404);
    }

    const queue = await prisma.dailyQueue.findUnique({
      where: {
        doctorId_date_type: {
          doctorId,
          date: today,
          type: "REGULAR",
        }
      },
      include: {
        _count: {
          select: {
            tokens: {
              where: { status: "BOOKED" }
            }
          }
        }
      }
    });

    const totalInQueue = queue?._count.tokens || 0;
    
    // Import dynamically so it's isolated
    const { QueueService } = require('@/features/queue/services/queueService');
    const dynamicData = QueueService.calculateDynamicStatus({ doctor, todayQueue: queue });

    const currentDayName = today.toLocaleDateString('en-US', { weekday: 'long' }).toLowerCase();
    const daySchedule: any = (doctor.weeklySchedule as any)?.[currentDayName] || { isOpen: true };

    const isEmergencyOnly = !doctor.isAcceptingBookings && doctor.isEmergencyEnabled;
    const isClosedToday = doctor.availabilityStatus === "OFFLINE" || !daySchedule.isOpen;

    const queueData = {
      currentToken: dynamicData.activeTokenNumber || 0,
      totalInQueue,
      estimatedWait: dynamicData.estimatedWaitMinutes || 0,
      avgTime: 15,
      status: dynamicData.status,
      message: dynamicData.message,
      isBookableOnline: dynamicData.isBookableOnline,
      isClosedToday,
      pauseOnlineBooking: !doctor.isAcceptingBookings,
      emergencySlots: doctor.emergencyCapacity || 0,
      timings: daySchedule.isOpen ? `${daySchedule.start} - ${daySchedule.end}` : "Closed Today",
    };

    try {
      // Cache the result in Redis for 10 seconds to protect MongoDB
      await redis.set(cacheKey, JSON.stringify(queueData), { ex: 10 });
    } catch (redisError) {
      console.warn("⚠️ Redis caching failed in queue-stats, continuing without cache:", redisError);
    }

    const response = apiResponse({success: true,
      queue: queueData});

    response.headers.set('Cache-Control', 's-maxage=10, stale-while-revalidate');
    return response;

  } catch (error: any) {
    console.error("Queue stats error:", error);
    return apiError("Failed to fetch queue stats", 500);
  }
}
