import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { verifyToken } from "@/lib/jwt";
import { cookies } from "next/headers";
import { getCurrentLogicalDay } from "@/lib/clinic-utils";

export async function POST(request: Request) {
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

    const doctor = await prisma.doctor.findUnique({
      where: { userId: payload.id }
    });

    if (!doctor) {
      return NextResponse.json({ error: "Doctor profile not found" }, { status: 404 });
    }

    const body = await request.json();
    const { currentTokenId, skipCurrent } = body;

    // Atomic transaction for queue progression
    const result = await prisma.$transaction(async (tx) => {
      // 1. Complete or Skip the current patient if ID provided
      if (currentTokenId) {
        // Strict verification: must be IN_CONSULTATION to be completed/skipped
        const currentToken = await tx.queueToken.findUnique({
          where: { id: currentTokenId }
        });

        if (currentToken && currentToken.status === "IN_CONSULTATION") {
          await tx.queueToken.update({
            where: { id: currentTokenId },
            data: { status: skipCurrent ? "SKIPPED" : "COMPLETED" }
          });
        }
      }

      // 2. Find the next WAITING patient in strict sequential order
      const today = getCurrentLogicalDay();

      const dailyQueue = await tx.dailyQueue.findUnique({
        where: { doctorId_date: { doctorId: doctor.id, date: today } }
      });

      if (!dailyQueue) {
        throw new Error("QUEUE_NOT_FOUND");
      }

      const nextPatient = await tx.queueToken.findFirst({
        where: { 
          queueId: dailyQueue.id, 
          status: "WAITING" 
        },
        orderBy: { tokenNumber: "asc" }
      });

      // 3. Mark the next patient as IN_CONSULTATION and update active token
      if (nextPatient) {
        const updatedNext = await tx.queueToken.update({
          where: { id: nextPatient.id },
          data: { status: "IN_CONSULTATION" }
        });

        await tx.dailyQueue.update({
          where: { id: dailyQueue.id },
          data: { currentActiveToken: updatedNext.tokenNumber }
        });

        return { nextPatient: updatedNext };
      }

      return { nextPatient: null };
    });

    return NextResponse.json({ success: true, data: result });
  } catch (error: any) {
    console.error("Next patient operation error:", error);
    return NextResponse.json({ error: error.message || "Failed to progress queue" }, { status: 500 });
  }
}
