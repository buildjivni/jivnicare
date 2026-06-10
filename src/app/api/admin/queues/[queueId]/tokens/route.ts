import { apiResponse, apiError } from '@/lib/utils/api-response';
import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db/prisma";
import { verifyToken } from "@/lib/jwt";
import { cookies } from "next/headers";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ queueId: string }> }
) {
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

    const { queueId } = await params;

    const dailyQueue = await prisma.dailyQueue.findUnique({
      where: { id: queueId },
      include: {
        doctor: {
          select: { name: true, clinicName: true, hospitalName: true }
        }
      }
    });

    if (!dailyQueue) {
      return apiError("Queue not found", 404);
    }

    const tokens = await prisma.queueToken.findMany({
      where: { queueId },
      orderBy: { tokenNumber: 'asc' },
      include: {
        patient: { select: { name: true, phone: true } },
        walkInEntry: { select: { patientName: true, phoneNumber: true } }
      }
    });

    const formattedTokens = tokens.map(t => ({
      id: t.id,
      tokenNumber: t.tokenNumber,
      patientName: t.patient?.name || t.walkInEntry?.patientName || "Walk-in Patient",
      phone: t.patient?.phone || t.walkInEntry?.phoneNumber || "N/A",
      status: t.status,
      type: t.tokenType,
      issuedAt: t.bookedAt.toISOString(),
      isEmergency: t.tokenType === "EMERGENCY",
    }));

    // Identify the exact current active token record if it exists
    const currentActiveRecord = formattedTokens.find(
      t => t.tokenNumber === dailyQueue.currentActiveToken && 
           (t.status === "WAITING" || t.status === "IN_CONSULTATION")
    );

    return NextResponse.json({
      success: true,
      queue: {
        id: dailyQueue.id,
        doctorName: dailyQueue.doctor.name,
        clinicName: dailyQueue.doctor.clinicName || dailyQueue.doctor.hospitalName,
        currentActiveToken: dailyQueue.currentActiveToken,
        status: dailyQueue.status,
        date: dailyQueue.date.toISOString(),
      },
      currentActiveRecord: currentActiveRecord || null,
      tokens: formattedTokens
    });
  } catch (error) {
    console.error("Queue Inspector API Error:", error);
    return apiError("Internal Server Error", 500);
  }
}
