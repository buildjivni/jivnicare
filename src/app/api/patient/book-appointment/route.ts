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
    const { doctorId, date, location } = body;

    if (!doctorId || !date) {
      return NextResponse.json({ error: "Missing doctorId or date" }, { status: 400 });
    }

    // Call service layer
    const newQueueToken = await QueueService.issueToken(doctorId, date, payload.id, "ONLINE", location);

    return NextResponse.json({ success: true, token: newQueueToken });
  } catch (error: any) {
    console.error("Booking error:", error);
    
    // Phase 2: Explicit Error Messages for Patients
    const errorMessages: Record<string, string> = {
      "ALREADY_BOOKED": "You already have a token for this date.",
      "QUEUE_FULL": "Queue is full for this date.",
      "CLINIC_CLOSED_TODAY": "Clinic is closed today. Please try another day.",
      "CLINIC_CLOSED_ON_THIS_DAY": "Doctor does not consult on this day.",
      "BOOKING_NOT_STARTED": "Bookings for today haven't started yet.",
      "BOOKING_FINISHED": "Bookings for today are now closed."
    };

    const message = errorMessages[error.message] || "Failed to book appointment";
    const status = errorMessages[error.message] ? 400 : 500;

    return NextResponse.json({ error: message }, { status });
  }
}
