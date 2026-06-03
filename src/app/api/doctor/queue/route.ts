import { NextResponse } from "next/server";
import prisma from "@/lib/db/prisma";
import { verifyToken } from "@/lib/jwt";
import { cookies } from "next/headers";
import {
  resolveClinicLogicalDay,
  parseHistoricalClinicDate,
  getUnifiedQueueCapacity,
  isEmergencyToken,
} from "@/lib/utils/clinic-utils";

export async function GET(request: Request) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("auth-token")?.value;

    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const payload: any = await verifyToken(token);
    if (!payload || !payload.id || payload.role !== "DOCTOR") {
      return NextResponse.json({ error: "Invalid token or not a doctor" }, { status: 401 });
    }

    // Get doctor record for this user
    const doctor = await prisma.doctor.findUnique({
      where: { userId: payload.id }
    });

    if (!doctor) {
      return NextResponse.json({ error: "Doctor profile not found" }, { status: 404 });
    }

    // Parse date from query params or default to logical today
    const url = new URL(request.url);
    const dateParam = url.searchParams.get("date");
    
    const queueDate = dateParam ? parseHistoricalClinicDate(dateParam) : resolveClinicLogicalDay();

    // Fetch the daily queue for this doctor on this date
    let dailyQueue = await prisma.dailyQueue.findUnique({
      where: {
        doctorId_date: {
          doctorId: doctor.id,
          date: queueDate,
        },
      },
      include: {
        tokens: {
          include: {
            user: { select: { name: true, phone: true } },
            walkInEntry: true
          },
          orderBy: [
            { tokenNumber: 'asc' }
          ]
        }
      }
    });

    // If it doesn't exist, they haven't had any bookings yet today. We can lazy-initialize it.
    if (!dailyQueue) {
      // Find operations to get max capacity
      const clinicOps = await prisma.clinicOperations.findUnique({ where: { doctorId: doctor.id } });
      const maxCapacity = getUnifiedQueueCapacity(clinicOps);

      dailyQueue = await prisma.dailyQueue.create({
        data: {
          doctorId: doctor.id,
          date: queueDate,
          status: "ACTIVE",
          maxCapacity,
          issuedTokensCount: 0
        },
        include: {
          tokens: {
            include: {
              user: { select: { name: true, phone: true } },
              walkInEntry: true
            },
            orderBy: { tokenNumber: 'asc' }
          }
        }
      });
    }

    // Phase 4: Real-time Stats Aggregation (regular tokens only for capacity metrics)
    const tokens = dailyQueue.tokens || [];
    const regularTokens = tokens.filter((t) => !isEmergencyToken(t));
    const waitingRegular = regularTokens.filter((t) => t.status === "WAITING");
    const stats = {
      total: regularTokens.length,
      waiting: waitingRegular.length,
      emergencyWaiting: tokens.filter(
        (t) => isEmergencyToken(t) && t.status === "WAITING"
      ).length,
      completed: tokens.filter((t) => t.status === "COMPLETED").length,
      currentActive: dailyQueue.currentActiveToken || 0,
      avgWaitTime:
        waitingRegular.length * (doctor.averageConsultationTime || 15),
    };

    return NextResponse.json({ 
      success: true, 
      queue: dailyQueue, 
      tokens,
      stats,
      doctor: {
        averageConsultationTime: doctor.averageConsultationTime
      }
    });
  } catch (error: any) {
    console.error("Fetch doctor queue error:", error);
    return NextResponse.json({ error: "Failed to fetch queue" }, { status: 500 });
  }
}
