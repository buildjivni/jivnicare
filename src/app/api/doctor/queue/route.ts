import { apiResponse, apiError } from '@/lib/utils/api-response';
import { NextResponse } from "next/server";
import prisma from "@/lib/db/prisma";
import { verifyToken } from "@/lib/jwt";
import { cookies } from "next/headers";
import { decrypt } from "@/lib/crypto";
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
        patient: { select: { name: true, phone: true } }
      },
      orderBy: { tokenNumber: 'asc' }
    });

    // V1 Stats
    const stats = {
      total: dailyQueue.totalTokens,
      waiting: tokens.filter(t => t.status === "BOOKED" || t.status === "READY").length,
      emergencyWaiting: dailyQueue.type === "EMERGENCY" ? tokens.filter(t => t.status === "BOOKED" || t.status === "READY").length : 0,
      completed: tokens.filter(t => t.status === "COMPLETED").length,
      currentActive: dailyQueue.currentToken,
      avgWaitTime: tokens.filter(t => t.status === "BOOKED").length * 10,
    };

    const decryptedTokens = tokens.map(t => ({
      ...t,
      patient: t.patient ? { ...t.patient, phone: decrypt(t.patient.phone) } : null
    }));

    return NextResponse.json({ 
      success: true, 
      queue: dailyQueue, 
      tokens: decryptedTokens,
      stats,
      doctor: {
        averageConsultationTime: 10
      }
    });
  } catch (error: any) {
    console.error("Fetch doctor queue error:", error);
    return apiError("Failed to fetch queue", 500);
  }
}
