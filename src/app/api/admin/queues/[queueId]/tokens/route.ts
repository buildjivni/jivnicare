import { apiResponse, apiError } from '@/lib/utils/api-response';
import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db/prisma";
import { verifyToken } from "@/lib/jwt";
import { cookies } from "next/headers";
import { decrypt } from "@/lib/crypto";

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
          select: { name: true, clinicName: true }
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
        patient: { select: { name: true, phone: true } }
      }
    });

    const formattedTokens = tokens.map(t => {
      let name = "Walk-in Patient";
      let phone = "N/A";
      if (t.type === "WALKIN") {
        name = t.walkinName || "Walk-in Patient";
        phone = t.walkinPhone || "N/A";
      } else if (t.patient) {
        name = t.patient.name || "Patient";
        if (t.patient.phone) {
          try {
            phone = decrypt(t.patient.phone);
          } catch (e) {
            phone = t.patient.phone;
          }
        }
      }
      return {
        id: t.id,
        tokenNumber: t.tokenNumber,
        patientName: name,
        phone,
        status: t.status,
        type: t.type,
        issuedAt: t.bookedAt.toISOString(),
        isEmergency: dailyQueue.type === "EMERGENCY",
      };
    });

    // Identify the exact current active token record if it exists
    const currentActiveRecord = formattedTokens.find(
      t => t.tokenNumber === dailyQueue.currentToken && 
           (t.status === "BOOKED" || t.status === "READY" || t.status === "IN_CONSULTATION")
    );

    return NextResponse.json({
      success: true,
      queue: {
        id: dailyQueue.id,
        doctorName: dailyQueue.doctor.name,
        clinicName: dailyQueue.doctor.clinicName,
        currentActiveToken: dailyQueue.currentToken,
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
