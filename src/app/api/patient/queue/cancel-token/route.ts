import { NextResponse } from "next/server";
import prisma from "@/lib/db/prisma";
import { verifyToken } from "@/lib/jwt";
import { cookies } from "next/headers";
import { checkRateLimit } from "@/lib/infrastructure/rate-limit";
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
    if (!payload || !payload.id || payload.role !== "PATIENT") {
      return NextResponse.json({ error: "Invalid token or not a patient" }, { status: 401 });
    }

    // Rate limit: prevent cancel-abuse loops
    const rateLimit = await checkRateLimit({
      identifier: `cancel_token_${payload.id}`,
      limit: 10,
      windowMs: 60 * 60 * 1000, // 10 per hour
    });

    if (!rateLimit.success) {
      return NextResponse.json({ error: "Too many cancellation attempts. Please try again later." }, { status: 429 });
    }

    const body = await request.json();
    const { tokenId } = body;

    if (!tokenId || typeof tokenId !== "string") {
      return NextResponse.json({ error: "Missing or invalid tokenId" }, { status: 400 });
    }

    // Fetch token with queue for ownership and state verification
    const queueToken = await prisma.queueToken.findUnique({
      where: { id: tokenId },
      include: { queue: true },
    });

    if (!queueToken) {
      return NextResponse.json({ error: "Token not found" }, { status: 404 });
    }

    // IDOR check: token must belong to this patient
    if (queueToken.userId !== payload.id) {
      logger.warn({
        category: "CANCELLATION",
        message: "IDOR attempt: patient tried to cancel another user's token",
        metadata: { requestingUserId: payload.id, tokenOwnerId: queueToken.userId },
      });
      return NextResponse.json({ error: "Access denied" }, { status: 403 });
    }

    const now = new Date();

    // Atomic transaction: lock token, check state, cancel, free capacity
    const result = await prisma.$transaction(async (tx) => {
      // 1. Fetch token strictly inside transaction
      const tokenInTx = await tx.queueToken.findUnique({
        where: { id: tokenId },
      });

      if (!tokenInTx || tokenInTx.status !== "WAITING") {
        throw new Error("INVALID_STATE");
      }

      // 2. Mark token as CANCELLED with audit trail
      await tx.queueToken.update({
        where: { id: tokenId },
        data: {
          status: "CANCELLED",
          cancelledAt: now,
          cancelledBy: "PATIENT",
        },
      });

      // 3. Atomically increment cancelledCount to free capacity
      await tx.dailyQueue.update({
        where: { id: queueToken.queueId },
        data: { cancelledCount: { increment: 1 } },
      });

      return true;
    });

    logger.info({
      category: "CANCELLATION",
      message: "Patient cancelled booking",
      metadata: {
        tokenId,
        tokenNumber: queueToken.tokenNumber,
        queueId: queueToken.queueId,
      },
    });

    await incrementTelemetryCounter("bookingCancelled").catch(() => {});

    return NextResponse.json({ success: true, message: "Your booking has been cancelled." });
  } catch (error: any) {
    if (error.message === "INVALID_STATE") {
      return NextResponse.json(
        { error: "This token cannot be cancelled. It may have already been processed or cancelled." },
        { status: 409 }
      );
    }
    logger.error({ category: "CANCELLATION", message: "Cancel token error", error });
    return NextResponse.json({ error: "Failed to cancel booking. Please try again." }, { status: 500 });
  }
}
