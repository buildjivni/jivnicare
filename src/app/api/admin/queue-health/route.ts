import { apiResponse, apiError } from '@/lib/utils/api-response';
import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db/prisma";
import { verifyToken } from "@/lib/jwt";
import { cookies } from "next/headers";
import { resolveClinicLogicalDay } from "@/lib/utils/clinic-utils";
import { QueueService } from "@/features/queue/services/queueService";

export async function GET(request: NextRequest) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("jivnicare_token")?.value;

    if (!token) {
      return apiError("Unauthorized", 401);
    }

    const decoded: any = await verifyToken(token);
    if (!decoded || decoded.role !== "ADMIN") {
      return apiError("Forbidden", 403);
    }

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1", 10);
    const limit = parseInt(searchParams.get("limit") || "20", 10);
    const search = searchParams.get("search") || "";
    const skip = (page - 1) * limit;

    const today = resolveClinicLogicalDay();

    let doctorWhereClause: any = {};
    if (search) {
      doctorWhereClause = {
        OR: [
          { clinicName: { contains: search, mode: "insensitive" } },
          { hospitalName: { contains: search, mode: "insensitive" } },
          { name: { contains: search, mode: "insensitive" } },
        ]
      };
    }

    const whereClause = {
      date: today,
      ...(search && { doctor: doctorWhereClause })
    };

    const [activeQueues, total] = await Promise.all([
      prisma.dailyQueue.findMany({
        where: whereClause,
        include: {
          doctor: {
            select: {
              id: true,
              name: true,
              hospitalName: true,
              clinicName: true,
              district: true,
              averageConsultationTime: true,
              verificationStatus: true,
              clinicOperations: true,
              weeklySchedule: true,
              user: { select: { name: true } }
            }
          },
          _count: {
            select: {
              tokens: {
                where: { status: "WAITING" }
              }
            }
          }
        },
        orderBy: {
          updatedAt: 'desc'
        },
        skip,
        take: limit,
      }),
      prisma.dailyQueue.count({ where: whereClause })
    ]);

    const formattedQueues = activeQueues.map(q => {
      // PR-ADMIN-1: Admin must consume QueueService truth only
      const dynamicStatus = QueueService.calculateDynamicStatus({ doctor: q.doctor, todayQueue: q });
      const waiting = q._count.tokens;
      
      return {
        id: q.id,
        clinicName: q.doctor.clinicName || q.doctor.hospitalName || "N/A",
        doctorName: q.doctor.name,
        verificationStatus: q.doctor.verificationStatus,
        servingToken: dynamicStatus.activeTokenNumber || q.currentActiveToken,
        waitingCount: waiting,
        estimatedWait: dynamicStatus.estimatedWaitMinutes || 0,
        status: dynamicStatus.status, 
        district: q.doctor.district,
        isHighLoad: waiting > 15
      };
    });

    return NextResponse.json({ 
      success: true, 
      queues: formattedQueues,
      pagination: {
        total,
        pages: Math.ceil(total / limit),
        current: page
      }
    });
  } catch (error) {
    console.error("Queue Health API Error:", error);
    return apiError("Internal Server Error", 500);
  }
}
