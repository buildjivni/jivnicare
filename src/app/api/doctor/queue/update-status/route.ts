import { NextResponse } from "next/server";
import prisma from "@/lib/db/prisma";
import { verifyToken } from "@/lib/jwt";
import { cookies } from "next/headers";

export async function PUT(request: Request) {
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
    const { tokenId, status } = body;

    if (!tokenId || !status) {
      return NextResponse.json({ error: "Missing tokenId or status" }, { status: 400 });
    }

    // Ensure the token belongs to a queue owned by this doctor
    const doctor = await prisma.doctor.findUnique({
      where: { userId: payload.id }
    });

    if (!doctor) {
      return NextResponse.json({ error: "Doctor profile not found" }, { status: 404 });
    }

    const queueToken = await prisma.queueToken.findUnique({
      where: { id: tokenId },
      include: { queue: true }
    });

    if (!queueToken) {
      return NextResponse.json({ error: "Token not found" }, { status: 404 });
    }

    if (queueToken.queue.doctorId !== doctor.id) {
      return NextResponse.json({ error: "Unauthorized access to this token" }, { status: 403 });
    }

    // Use Prisma transaction to atomically update both the token status and the daily queue's active token
    const result = await prisma.$transaction(async (tx) => {
      // Phase 5: Strict Transition Validation
      const currentStatus = queueToken.status;
      const allowedTransitions: Record<string, string[]> = {
        "WAITING": ["IN_CONSULTATION", "SKIPPED", "CANCELLED"],
        "IN_CONSULTATION": ["COMPLETED", "SKIPPED", "WAITING"], // Allow reverting to WAITING if accidental
        "SKIPPED": ["WAITING", "IN_CONSULTATION"],
        "COMPLETED": [], // Final state
        "CANCELLED": []  // Final state
      };

      if (!allowedTransitions[currentStatus]?.includes(status)) {
        throw new Error(`Invalid status transition from ${currentStatus} to ${status}`);
      }

      // 1. Update the token status
      const updatedToken = await tx.queueToken.update({
        where: { id: tokenId },
        data: { status }
      });

      // 2. If marked as IN_CONSULTATION, atomically update the currentActiveToken in DailyQueue
      if (status === "IN_CONSULTATION") {
        await tx.dailyQueue.update({
          where: { id: queueToken.queueId },
          data: { currentActiveToken: updatedToken.tokenNumber }
        });
      }
      
      return updatedToken;
    });

    return NextResponse.json({ success: true, token: result });
  } catch (error: any) {
    console.error("Update token status error:", error);
    return NextResponse.json({ error: "Failed to update token status" }, { status: 500 });
  }
}
