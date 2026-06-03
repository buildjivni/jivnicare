import { NextResponse } from "next/server";
import prisma from "@/lib/db/prisma";
import { verifyToken } from "@/lib/jwt";
import { cookies } from "next/headers";
import { logger } from "@/lib/infrastructure/logger";
import { incrementTelemetryCounter } from "@/lib/telemetry/redis";

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

    const body = await request.json();
    const { tokenId } = body;

    if (!tokenId || typeof tokenId !== "string") {
      return NextResponse.json({ error: "Missing or invalid tokenId" }, { status: 400 });
    }

    // Fetch doctor profile for ownership check
    const doctor = await prisma.doctor.findUnique({ where: { userId: payload.id } });
    if (!doctor) {
      return NextResponse.json({ error: "Doctor profile not found" }, { status: 404 });
    }

    // Fetch token with queue for ownership and state verification
    const queueToken = await prisma.queueToken.findUnique({
      where: { id: tokenId },
      include: { queue: true },
    });

    if (!queueToken) {
      return NextResponse.json({ error: "Token not found" }, { status: 404 });
    }

    // Ownership check: token must belong to this doctor's queue
    if (queueToken.queue.doctorId !== doctor.id) {
      return NextResponse.json({ error: "Access denied" }, { status: 403 });
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

      const validFromStates = ["WAITING", "SKIPPED"];
      if (!validFromStates.includes(tokenInTx.status)) {
        throw new Error("INVALID_STATE");
      }

      // 2. Mark token as NO_SHOW with full audit trail
      await tx.queueToken.update({
        where: { id: tokenId },
        data: {
          status: "NO_SHOW",
          noShowAt: now,
          noShowBy: doctor.id, // Accountability: which doctor's session triggered it
        },
      });

      // 3. Atomically increment noShowCount to free capacity
      await tx.dailyQueue.update({
        where: { id: queueToken.queueId },
        data: { noShowCount: { increment: 1 } },
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
    return NextResponse.json({ error: "Failed to mark no-show. Please try again." }, { status: 500 });
  }
}
