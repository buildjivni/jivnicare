import { apiResponse, apiError } from '@/lib/utils/api-response';
import { NextResponse } from "next/server";
import prisma from "@/lib/db/prisma";
import { verifyToken } from "@/lib/jwt";
import { cookies } from "next/headers";
import { checkRateLimit } from "@/lib/infrastructure/rate-limit";
import { logger } from "@/lib/infrastructure/logger";
import { incrementTelemetryCounter } from "@/lib/telemetry/redis";
import { decrypt } from "@/lib/crypto";

export async function POST(request: Request) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("jivnicare_token")?.value;

    if (!token) {
      return apiError("Unauthorized", 401);
    }

    const payload: any = await verifyToken(token);
    if (!payload || !payload.id || payload.role !== "PATIENT") {
      return apiError("Invalid token or not a patient", 401);
    }

    // Rate limit: prevent cancel-abuse loops
    const rateLimit = await checkRateLimit({
      identifier: `cancel_token_${payload.id}`,
      limit: 10,
      windowMs: 60 * 60 * 1000, // 10 per hour
    });

    if (!rateLimit.success) {
      return apiError("Bahut zyada cancellation attempts. Kripya baad mein try karein.", 429);
    }

    const body = await request.json();
    const { tokenId } = body;

    if (!tokenId || typeof tokenId !== "string") {
      return apiError("Token ID missing hai ya galat hai", 400);
    }

    // Fetch token with queue for ownership and state verification
    const queueToken = await prisma.queueToken.findUnique({
      where: { id: tokenId },
      include: { queue: true },
    });

    if (!queueToken) {
      return apiError("Token nahi mila", 404);
    }

    // IDOR check: token must belong to this patient
    if (queueToken.patientId !== payload.id) {
      logger.warn({
        category: "CANCELLATION",
        message: "IDOR attempt: patient tried to cancel another user's token",
        metadata: { requestingUserId: payload.id, tokenOwnerId: queueToken.patientId },
      });
      return apiError("Aapko iska access nahi hai", 403);
    }

    // Fetch doctor name for notification context
    const doctor = await prisma.doctor.findUnique({
      where: { id: queueToken.queue.doctorId },
      select: { name: true }
    });
    const doctorName = doctor?.name || "Doctor";

    // Atomic transaction: cancel token and mark top 2 waitlisted entries as notified
    const cancelResult = await prisma.$transaction(async (tx) => {
      // 1. Fetch token strictly inside transaction
      const tokenInTx = await tx.queueToken.findUnique({
        where: { id: tokenId },
      });

      if (!tokenInTx || tokenInTx.status !== "BOOKED") {
        throw new Error("INVALID_STATE");
      }

      // 2. Mark token as CANCELLED
      await tx.queueToken.update({
        where: { id: tokenId },
        data: {
          status: "CANCELLED",
          cancelledAt: new Date(),
        },
      });

      // 3. Find top 2 waitlisted patients (notified: false) in FIFO order
      const waitlistEntries = await tx.waitlist.findMany({
        where: {
          doctorId: queueToken.queue.doctorId,
          notified: false
        },
        orderBy: { createdAt: "asc" },
        take: 2,
        include: { user: { select: { phone: true } } }
      });

      // 4. Mark waitlisted patients as notified in the DB
      const notifiedEntries = [];
      for (const entry of waitlistEntries) {
        const updatedEntry = await tx.waitlist.update({
          where: { id: entry.id },
          data: {
            notified: true,
            notifiedAt: new Date()
          }
        });
        notifiedEntries.push({
          ...updatedEntry,
          user: entry.user
        });
      }

      return { notifiedEntries };
    });

    // Send transactional claiming SMS to notified waitlist patients (outside transaction)
    if (cancelResult.notifiedEntries.length > 0) {
      try {
        const { sendTransactionalSms } = require("@/lib/sms");
        const broadcastMessage = `A slot just opened with Dr. ${doctorName}. Tap to book it now — first to confirm gets it.`;

        for (const entry of cancelResult.notifiedEntries) {
          let phone = entry.phone;
          if (entry.user?.phone) {
            try {
              phone = decrypt(entry.user.phone);
            } catch (e) {
              phone = entry.phone;
            }
          }
          if (phone) {
            await sendTransactionalSms(phone, broadcastMessage).catch((err: any) => {
              logger.error({ category: "CANCELLATION", message: "Failed to send waitlist claiming SMS alert", error: err });
            });
          }
        }
      } catch (smsErr) {
        logger.error({ category: "CANCELLATION", message: "SMS dispatch failed during waitlist broadcast", error: smsErr });
      }
    }

    logger.info({
      category: "CANCELLATION",
      message: "Patient cancelled booking and waitlist was broadcasted",
      metadata: {
        tokenId,
        tokenNumber: queueToken.tokenNumber,
        queueId: queueToken.queueId,
        notifiedCount: cancelResult.notifiedEntries.length,
      },
    });

    await incrementTelemetryCounter("bookingCancelled").catch(() => {});

    return apiResponse({ success: true, message: "Aapka booking cancel kar diya gaya hai." });
  } catch (error: any) {
    if (error.message === "INVALID_STATE") {
      return apiError("Token cancel nahi ho sakta — aapki baari aa gayi hai ya consultation complete ho chuka hai", 409);
    }
    logger.error({ category: "CANCELLATION", message: "Cancel token error", error });
    return apiError("Booking cancel karne mein dikat hui. Dobara try karein.", 500);
  }
}
