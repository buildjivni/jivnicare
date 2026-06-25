import { apiResponse, apiError } from '@/lib/utils/api-response';
import { NextResponse } from "next/server";
import prisma from "@/lib/db/prisma";
import { verifyToken } from "@/lib/jwt";
import { cookies } from "next/headers";
import { logger } from "@/lib/infrastructure/logger";
import { incrementTelemetryCounter } from "@/lib/telemetry/redis";

export async function POST(request: Request) {
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
    const { tokenId } = body;

    if (!tokenId || typeof tokenId !== "string") {
      return apiError("Missing or invalid tokenId", 400);
    }

    // Fetch doctor profile for ownership check
    const doctor = await prisma.doctor.findUnique({ where: { userId: payload.id } });
    if (!doctor) {
      return apiError("Doctor profile not found", 404);
    }

    // Fetch token with queue for ownership and state verification
    const queueToken = await prisma.queueToken.findUnique({
      where: { id: tokenId },
      include: { queue: true },
    });

    if (!queueToken) {
      return apiError("Token not found", 404);
    }

    // Ownership check: token must belong to this doctor's queue
    if (queueToken.queue.doctorId !== doctor.id) {
      return apiError("Access denied", 403);
    }

    const now = new Date();

    // Atomic transaction: lock token, check state, mark NO_SHOW, free capacity
    const result = await prisma.$transaction(async (tx) => {
      // 1. Fetch token strictly inside transaction
      const tokenInTx = await tx.queueToken.findUnique({
        where: { id: tokenId },
      });

      if (!tokenInTx) {
        throw new Error("INVALID_STATE");
      }

      const validFromStates = ["BOOKED", "READY", "CALLED", "IN_CONSULTATION"];
      if (!validFromStates.includes(tokenInTx.status)) {
        throw new Error("INVALID_STATE");
      }

      // 2. Mark token as NO_SHOW
      await tx.queueToken.update({
        where: { id: tokenId },
        data: {
          status: "NO_SHOW",
        },
      });

      return true;
    });

    logger.info({
      category: "NO_SHOW",
      message: "Doctor marked patient as no-show",
      metadata: {
        tokenId,
        tokenNumber: queueToken.tokenNumber,
        queueId: queueToken.queueId,
        doctorId: doctor.id,
      },
    });

    await incrementTelemetryCounter("noShowEvents").catch(() => {});

    // Response deliberately omits undoToken — NO_SHOW is terminal and irreversible
    return NextResponse.json({
      success: true,
      message: `Token #${queueToken.tokenNumber} marked as no-show. Slot released.`,
    });
  } catch (error: any) {
    if (error.message === "INVALID_STATE") {
      return NextResponse.json(
        { error: "Cannot mark as No-Show. Token is no longer in a valid state." },
        { status: 409 }
      );
    }
    logger.error({ category: "NO_SHOW", message: "No-show error", error });
    return apiError("Failed to mark no-show. Please try again.", 500);
  }
}
