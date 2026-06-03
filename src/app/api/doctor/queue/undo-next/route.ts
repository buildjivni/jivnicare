import { NextResponse } from "next/server";
import prisma from "@/lib/db/prisma";
import { verifyToken } from "@/lib/jwt";
import { cookies } from "next/headers";

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
    const { undoToken } = body;

    if (!undoToken) {
      return NextResponse.json({ error: "Missing undoToken" }, { status: 400 });
    }

    // Verify the undo token
    const undoPayload: any = await verifyToken(undoToken);
    if (!undoPayload || !undoPayload.queueId) {
      return NextResponse.json({ error: "Undo time window expired or invalid token" }, { status: 400 });
    }

    const { action, queueId, fromTokenId, fromTokenNumber, toTokenId, toTokenNumber } = undoPayload;

    // We only support reversing CALL_NEXT and SKIP_NEXT
    if (action !== "CALL_NEXT" && action !== "SKIP_NEXT") {
      return NextResponse.json({ error: "Unsupported undo action" }, { status: 400 });
    }

    // Atomic transaction for strict undo
    const result = await prisma.$transaction(async (tx) => {
      // 1. Fetch current queue state
      const dailyQueue = await tx.dailyQueue.findUnique({
        where: { id: queueId }
      });

      if (!dailyQueue) {
        throw new Error("QUEUE_NOT_FOUND");
      }

      // 2. Strict validation: Ensure NO newer queue transition exists.
      // If the doctor has already called someone else after the mistake, we cannot undo.
      if (dailyQueue.currentActiveToken !== toTokenNumber) {
        throw new Error("CONCURRENCY_CONFLICT_RETRY");
      }

      // 3. Revert the "new" patient (toTokenId) from IN_CONSULTATION back to WAITING
      const revertActiveResult = await tx.queueToken.updateMany({
        where: { 
          id: toTokenId,
          status: "IN_CONSULTATION" 
        },
        data: { status: "WAITING" }
      });

      if (revertActiveResult.count === 0) {
        throw new Error("CONCURRENCY_CONFLICT_RETRY");
      }

      // 4. Revert the "old" patient (fromTokenId) from COMPLETED/SKIPPED back to IN_CONSULTATION
      const expectedOldStatus = action === "CALL_NEXT" ? "COMPLETED" : "SKIPPED";
      const revertOldResult = await tx.queueToken.updateMany({
        where: { 
          id: fromTokenId,
          status: expectedOldStatus
        },
        data: { status: "IN_CONSULTATION" }
      });

      if (revertOldResult.count === 0) {
        throw new Error("CONCURRENCY_CONFLICT_RETRY");
      }

      // 5. Revert DailyQueue active token
      await tx.dailyQueue.update({
        where: { id: queueId },
        data: { currentActiveToken: fromTokenNumber }
      });

      return { success: true };
    });

    return NextResponse.json({ success: true, data: result });
  } catch (error: any) {
    console.error("Undo next operation error:", error);
    if (error.message === "CONCURRENCY_CONFLICT_RETRY") {
      return NextResponse.json({ error: "Newer queue transition detected. Undo is no longer valid." }, { status: 409 });
    }
    if (error.message === "QUEUE_NOT_FOUND") {
      return NextResponse.json({ error: "Queue not found" }, { status: 404 });
    }
    return NextResponse.json({ error: "An unexpected error occurred while undoing the action" }, { status: 500 });
  }
}
