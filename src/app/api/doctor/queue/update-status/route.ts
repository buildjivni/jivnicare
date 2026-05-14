import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
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

    // Update status
    const updatedToken = await prisma.queueToken.update({
      where: { id: tokenId },
      data: { status }
    });

    // If marked as IN_CONSULTATION, update the currentActiveToken in DailyQueue
    if (status === "IN_CONSULTATION") {
      await prisma.dailyQueue.update({
        where: { id: queueToken.queueId },
        data: { currentActiveToken: updatedToken.tokenNumber }
      });
    }

    return NextResponse.json({ success: true, token: updatedToken });
  } catch (error: any) {
    console.error("Update token status error:", error);
    return NextResponse.json({ error: "Failed to update token status" }, { status: 500 });
  }
}
