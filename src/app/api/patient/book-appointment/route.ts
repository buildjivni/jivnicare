import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { verifyToken } from "@/lib/jwt";
import { cookies } from "next/headers";
import { QueueService } from "@/services/queueService";

export async function POST(request: Request) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("auth-token")?.value;

    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const payload: any = await verifyToken(token);
    if (!payload || !payload.id) {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 });
    }

    const body = await request.json();
    const { doctorId, date } = body;

    if (!doctorId || !date) {
      return NextResponse.json({ error: "Missing doctorId or date" }, { status: 400 });
    }

    // Call service layer
    const newQueueToken = await QueueService.issueToken(doctorId, date, payload.id, "ONLINE");

    return NextResponse.json({ success: true, token: newQueueToken });
  } catch (error: any) {
    console.error("Booking error:", error);
    if (error.message === "ALREADY_BOOKED") {
      return NextResponse.json({ error: "You already have a token for this date." }, { status: 400 });
    }
    if (error.message === "QUEUE_FULL") {
      return NextResponse.json({ error: "Queue is full for this date." }, { status: 400 });
    }
    return NextResponse.json({ error: "Failed to book appointment" }, { status: 500 });
  }
}
