import { apiResponse, apiError } from '@/lib/utils/api-response';
import { NextResponse } from "next/server";
import prisma from "@/lib/db/prisma";
import { redis } from "@/lib/db/redis";
import { verifyToken } from "@/lib/jwt";
import { cookies } from "next/headers";
import { decrypt } from "@/lib/crypto";
import { QueueService } from "@/features/queue/services/queueService";
import { bookAppointmentSchema, formatZodError } from "@/lib/validators/validations";
import { bookingRatelimit, checkUpstashRateLimit } from "@/lib/ratelimit";
import { logger } from '@/lib/infrastructure/logger';
import { isTransientDbError, dbUnavailableResponse } from '@/lib/db/db-errors';
import { incrementTelemetryCounter } from '@/lib/telemetry/redis';
import { resolveClinicLogicalDay } from '@/lib/utils/clinic-utils';

export async function POST(request: Request) {
  let requestIdForRollback: string | null = null;
  let userIdForRollback: string | null = null;
  
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("jivnicare_token")?.value;

    if (!token) {
      return apiError("Unauthorized", 401);
    }

    const payload: any = await verifyToken(token);
    if (!payload || !payload.id) {
      return apiError("Invalid token", 401);
    }
    userIdForRollback = payload.id;
    
    // --- Upstash Rate Limiting ---
    const { success } = await checkUpstashRateLimit(
      bookingRatelimit, 
      `book_appt_${payload.id}`
    );

    if (!success) {
      return apiError("Bahut zyada requests. Thodi der mein try karein.", 429);
    }

    const body = await request.json();
    
    // Strict Payload Validation
    const validation = bookAppointmentSchema.safeParse(body);
    if (!validation.success) {
      return apiError("Invalid payload: " + formatZodError(validation.error), 400);
    }

    const { doctorId, date, location, isEmergency, requestId } = validation.data;

    // Idempotency Check
    if (requestId && redis) {
      requestIdForRollback = requestId;
      const idempotencyKey = `idempotency:booking:${payload.id}:${requestId}`;
      const isNewRequest = await redis.set(idempotencyKey, "PROCESSING", { nx: true, ex: 86400 });
      if (!isNewRequest) {
        logger.warn({ category: 'BOOKING', message: 'Duplicate booking request suppressed', metadata: { userId: payload.id, requestId } });
        return apiError("Booking already being processed or completed.", 409);
      }
    }

    // Get patient details
    const user = await prisma.user.findUnique({
      where: { id: payload.id },
      select: { phone: true, name: true }
    });

    if (!user) {
      return apiError("User not found", 404);
    }

    const decryptedPhone = decrypt(user.phone);

    // Call service layer (V1 refactored)
    const { token: newQueueToken } = await QueueService.issueToken(
      doctorId, 
      payload.id, 
      decryptedPhone,
      isEmergency ? "EMERGENCY" : "ONLINE",
      user.name || undefined
    );

    // Trigger confirmation notification and SMS
    try {
      const { sendTransactionalSms } = require("@/lib/sms");
      const doctorDetails = await prisma.doctor.findUnique({
        where: { id: doctorId },
        select: { name: true, clinicName: true, hospitalName: true }
      });
      const doctorName = doctorDetails?.name || "Doctor";
      const clinicName = doctorDetails?.clinicName || doctorDetails?.hospitalName || "Clinic";

      // 1. Create in-app notification
      await prisma.notification.create({
        data: {
          userId: payload.id,
          type: "PLATFORM_ALERT",
          title: "Booking Confirmed!",
          message: `Token #${newQueueToken.tokenNumber} with Dr. ${doctorName}. Visit ${clinicName} today.`,
        }
      }).catch((err: any) => {
        logger.error({ category: 'BOOKING', message: 'In-app notification trigger failed', error: err });
      });

      // 2. Send SMS
      const smsMessage = `Good news — your slot with Dr. ${doctorName} is confirmed today, Token #${newQueueToken.tokenNumber}. Cancel from the app if you can't make it.`;
      await sendTransactionalSms(user.phone, smsMessage).catch((err: any) => {
        logger.error({ category: 'BOOKING', message: 'SMS confirmation trigger failed', error: err });
      });
    } catch (notifErr) {
      logger.error({ category: 'BOOKING', message: 'Notification trigger exception', error: notifErr });
    }

    await incrementTelemetryCounter('bookingSuccess').catch(() => {});
    return apiResponse({ success: true, token: newQueueToken });
  } catch (error: unknown) {
    // Rollback idempotency key on failure so the user can retry safely
    if (requestIdForRollback && userIdForRollback && redis) {
      await redis.del(`idempotency:booking:${userIdForRollback}:${requestIdForRollback}`).catch(() => {});
    }
    
    const err = error as { message?: string };
    if (isTransientDbError(error)) {
      logger.warn({ category: 'BOOKING', message: 'Transient DB error during booking', error });
      const { error: msg, status } = dbUnavailableResponse();
      return apiError(msg, status);
    }
    logger.error({ category: 'BOOKING', message: 'Booking error', error });

    // Phase 2: Explicit Error Messages for Patients
    const errorMessages: Record<string, string> = {
      "DOCTOR_NOT_VERIFIED": "Doctor abhi verified nahi hain online bookings ke liye.",
      "DOCTOR_NOT_ACCEPTING": "Doctor abhi appointments nahi le rahe hain",
      "ALREADY_BOOKED": "Aapka token pehle se booked hai.",
      "QUEUE_FULL": "Aaj ke slots full ho gaye hain.",
      "DAILY_LIMIT_REACHED": "Aaj ke saare slots full ho gaye hain",
      "CLINIC_CLOSED_TODAY": "Clinic aaj band hai. Kripya kisi aur din try karein.",
      "CLINIC_CLOSED_ON_THIS_DAY": "Doctor aaj ke din nahi baithte hain.",
      "BOOKING_NOT_STARTED": "Aaj ki bookings abhi shuru nahi hui hain.",
      "BOOKING_FINISHED": "Aaj ki bookings band ho chuki hain.",
      "QUEUE_PAUSED": "Doctor ne abhi online bookings rok di hain.",
      "EMERGENCY_FULL": "Emergency slots bhi full ho gaye hain",
      "EMERGENCY_ONLY_ACTIVE": "Clinic abhi sirf emergency patients ke liye khula hai."
    };

    const errMsg = err.message ?? "";
    
    // Check for ALREADY_BOOKED with attached token number
    if (errMsg.startsWith("ALREADY_BOOKED:")) {
      const tokenNumber = errMsg.split(":")[1];
      return apiError(`Aapka token pehle se hai: #${tokenNumber}`, 409);
    }

    const message = errorMessages[errMsg] || "Booking fail ho gayi. Dobara try karein.";
    const status = errorMessages[errMsg] ? 400 : 500;
    
    // Telemetry tracking for failures
    await incrementTelemetryCounter('bookingFailures').catch(() => {});

    if (status === 500) {
      await incrementTelemetryCounter('api500Errors').catch(() => {});
    }

    return apiError(message, status);
  }
}
