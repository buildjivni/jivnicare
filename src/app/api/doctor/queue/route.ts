import { apiResponse, apiError } from '@/lib/utils/api-response';
import { NextResponse } from "next/server";
import prisma from "@/lib/db/prisma";
import { verifyToken } from "@/lib/jwt";
import { cookies } from "next/headers";
import { getOrCreateDailyQueue, getLogicalDate } from "@/lib/queue";
import {
  resolveClinicLogicalDay,
  parseHistoricalClinicDate,
  getUnifiedQueueCapacity,
  isEmergencyToken,
} from "@/lib/utils/clinic-utils";

export async function GET(request: Request) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("jivnicare_token")?.value;

    if (!token) {
      return apiError("Unauthorized", 401);
    }

    const payload: any = await verifyToken(token);
    if (!payload || !payload.id || payload.role !== "DOCTOR") {
      return apiError("Invalid token or not a doctor", 401);
    }

    // Get doctor record for this user
    const doctor = await prisma.doctor.findUnique({
      where: { userId: payload.id }
    });

    if (!doctor) {
      return apiError("Doctor profile not found", 404);
    }

    // Parse date from query params or default to logical today
    const url = new URL(request.url);
    const dateParam = url.searchParams.get("date");
    
    const queueDate = dateParam ? dateParam : getLogicalDate();

    // Fetch or lazy-init the daily queue
    const dailyQueue = await getOrCreateDailyQueue(doctor.id);

    // Fetch tokens with patient details
    const tokens = await prisma.queueToken.findMany({
      where: { queueId: dailyQueue.id },
      include: {
        patient: { select: { name: true, phone: true } },
        walkInEntry: true
      },
      orderBy: { tokenNumber: 'asc' }
    });

    // V1 Stats
    const stats = {
      total: dailyQueue.currentTokenNumber,
      waiting: tokens.filter(t => t.status === "WAITING" || t.status === "READY").length,
      emergencyWaiting: tokens.filter(t => t.tokenType === "EMERGENCY" && t.status === "WAITING").length,
      completed: tokens.filter(t => t.status === "COMPLETED").length,
      currentActive: dailyQueue.currentServingToken,
      avgWaitTime: tokens.filter(t => t.status === "WAITING").length * (doctor.averageConsultationMinutes || 10),
    };

    return NextResponse.json({ 
      success: true, 
      queue: dailyQueue, 
      tokens,
      stats,
      doctor: {
        averageConsultationTime: doctor.averageConsultationMinutes
      }
    });
  } catch (error: any) {
    console.error("Fetch doctor queue error:", error);
    return apiError("Failed to fetch queue", 500);
  }
}
