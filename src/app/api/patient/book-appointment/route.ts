import { NextResponse } from "next/server";
import prisma from "@/lib/db/prisma";
import { redis } from "@/lib/db/redis";
import { verifyToken } from "@/lib/jwt";
import { cookies } from "next/headers";
import { QueueService } from "@/features/queue/services/queueService";
import { bookAppointmentSchema, formatZodError } from "@/lib/validators/validations";
import { checkRateLimit } from '@/lib/infrastructure/rate-limit';
import { logger } from '@/lib/infrastructure/logger';
import { isTransientDbError, dbUnavailableResponse } from '@/lib/db/db-errors';
import { incrementTelemetryCounter } from '@/lib/telemetry/redis';

export async function POST(request: Request) {
  let requestIdForRollback: string | null = null;
  let userIdForRollback: string | null = null;
  
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
    const ip = request.headers.get('x-forwarded-for') || '127.0.0.1';
    userIdForRollback = payload.id;
    
    const rateLimit = await checkRateLimit({
      identifier: `book_appt_${payload.id}`, // Rate limit by patient ID
      limit: 10,
      windowMs: 60 * 60 * 1000, // 10 bookings per hour
    });

    if (!rateLimit.success) {
      logger.warn({ category: 'BOOKING', message: 'Rate limit exceeded for booking', metadata: { userId: payload.id, ip } });
      return NextResponse.json({ error: "Too many booking attempts. Please try again later." }, { status: 429 });
    }

    const body = await request.json();
    
    // Strict Payload Validation
    const validation = bookAppointmentSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        { error: "Invalid payload: " + formatZodError(validation.error) }, 
        { status: 400 }
      );
    }

    const { doctorId, date, location, isEmergency, requestId } = validation.data;

    // Idempotency Check
    if (requestId && redis) {
      requestIdForRollback = requestId;
      const idempotencyKey = `idempotency:booking:${payload.id}:${requestId}`;
      const isNewRequest = await redis.set(idempotencyKey, "PROCESSING", { nx: true, ex: 86400 });
      if (!isNewRequest) {
        logger.warn({ category: 'BOOKING', message: 'Duplicate booking request suppressed', metadata: { userId: payload.id, requestId } });
        return NextResponse.json({ error: "Booking already being processed or completed." }, { status: 409 });
      }
    }

    // Call service layer
    const newQueueToken = await QueueService.issueToken(
      doctorId, 
      new Date(date), 
      payload.id, 
      "ONLINE", 
      location,
      isEmergency
    );

    await incrementTelemetryCounter('bookingSuccess').catch(() => {});
    return NextResponse.json({ success: true, token: newQueueToken });
  } catch (error: unknown) {
    // Rollback idempotency key on failure so the user can retry safely
    if (requestIdForRollback && userIdForRollback && redis) {
      await redis.del(`idempotency:booking:${userIdForRollback}:${requestIdForRollback}`).catch(() => {});
    }
    
    const err = error as { message?: string };
    if (isTransientDbError(error)) {
      logger.warn({ category: 'BOOKING', message: 'Transient DB error during booking', error });
      const { error: msg, status } = dbUnavailableResponse();
      return NextResponse.json({ error: msg }, { status });
    }
    logger.error({ category: 'BOOKING', message: 'Booking error', error });

    // Phase 2: Explicit Error Messages for Patients
    const errorMessages: Record<string, string> = {
      "DOCTOR_NOT_VERIFIED": "This doctor is not currently verified to accept online bookings.",
      "ALREADY_BOOKED": "You already have a token for this date.",
      "QUEUE_FULL": "Queue is full for this date.",
      "CLINIC_CLOSED_TODAY": "Clinic is closed today. Please try another day.",
      "CLINIC_CLOSED_ON_THIS_DAY": "Doctor does not consult on this day.",
      "BOOKING_NOT_STARTED": "Bookings for today haven't started yet.",
      "BOOKING_FINISHED": "Bookings for today are now closed.",
      "QUEUE_PAUSED": "The doctor has temporarily paused new online bookings.",
      "EMERGENCY_FULL": "Emergency capacity is currently full. Please visit the clinic directly."
    };

    const message = errorMessages[err.message ?? ""] || "Failed to book appointment";
    const status = errorMessages[err.message ?? ""] ? 400 : 500;
    
    // Telemetry tracking for failures
    await incrementTelemetryCounter('bookingFailures').catch(() => {});

    if (status === 500) {
      await incrementTelemetryCounter('api500Errors').catch(() => {});
    }

    return NextResponse.json({ error: message }, { status });
  }
}
