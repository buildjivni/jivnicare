import { apiResponse, apiError } from '@/lib/utils/api-response';
import { NextResponse } from "next/server";
import prisma from "@/lib/db/prisma";
import { verifyToken } from "@/lib/jwt";
import { cookies } from "next/headers";

export async function PUT(request: Request) {
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

    const body = await request.json();
    const { tokenId, status } = body;

    if (!tokenId || !status) {
      return apiError("Missing tokenId or status", 400);
    }

    // Ensure the token belongs to a queue owned by this doctor
    const doctor = await prisma.doctor.findUnique({
      where: { userId: payload.id }
    });

    if (!doctor) {
      return apiError("Doctor profile not found", 404);
    }

    const queueToken = await prisma.queueToken.findUnique({
      where: { id: tokenId },
      include: { queue: true }
    });

    if (!queueToken) {
      return apiError("Token not found", 404);
    }

    if (queueToken.queue.doctorId !== doctor.id) {
      return apiError("Unauthorized access to this token", 403);
    }

    // Use Prisma transaction to atomically update both the token status and the daily queue's active token
    const result = await prisma.$transaction(async (tx) => {
      // Phase 5: Strict Transition Validation
      const currentStatusMap: Record<string, string> = {
        "BOOKED": "WAITING",
        "AWAITING_ARRIVAL": "SKIPPED",
        "IN_CONSULTATION": "IN_CONSULTATION",
        "COMPLETED": "COMPLETED",
        "CANCELLED": "CANCELLED",
        "NO_SHOW": "NO_SHOW",
        "READY": "WAITING",
      };

      const currentStatus = currentStatusMap[queueToken.status] || queueToken.status;
      const allowedTransitions: Record<string, string[]> = {
        "WAITING": ["IN_CONSULTATION", "SKIPPED", "CANCELLED", "NO_SHOW"],
        "IN_CONSULTATION": ["COMPLETED", "SKIPPED", "WAITING"], // Allow reverting to WAITING if accidental
        "SKIPPED": ["WAITING", "IN_CONSULTATION", "NO_SHOW"],
        "COMPLETED": [], // Final state
        "CANCELLED": [],  // Final state
        "NO_SHOW": [],    // PR-1: Final state — doctor confirmed patient did not arrive
      };

      if (!allowedTransitions[currentStatus]?.includes(status)) {
        throw new Error(`Invalid status transition from ${currentStatus} to ${status}`);
      }

      // Map incoming status to DB status
      let dbStatus = status;
      if (status === "WAITING") dbStatus = "BOOKED";
      if (status === "SKIPPED") dbStatus = "AWAITING_ARRIVAL";

      // 1. Update the token status
      const updatedToken = await tx.queueToken.update({
        where: { id: tokenId },
        data: { status: dbStatus as any }
      });

      // Increment patients served counter if status resolves to COMPLETED
      if (status === "COMPLETED") {
        await tx.doctor.update({
          where: { id: doctor.id },
          data: { jivnicarePatientsServed: { increment: 1 } }
        });
      }

      // 2. If marked as IN_CONSULTATION, atomically update the currentToken in DailyQueue
      if (status === "IN_CONSULTATION") {
        await tx.dailyQueue.update({
          where: { id: queueToken.queueId },
          data: { currentToken: updatedToken.tokenNumber }
        });
      }
      
      return updatedToken;
    });

    return apiResponse({success: true, token: result});
  } catch (error: any) {
    console.error("Update token status error:", error);
    if (error.message && error.message.includes("Invalid status transition")) {
      return apiError(error.message, 400);
    }
    return apiError("Failed to update token status", 500);
  }
}
