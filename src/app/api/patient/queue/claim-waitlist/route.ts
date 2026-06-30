import { apiResponse, apiError } from '@/lib/utils/api-response';
import { NextResponse } from "next/server";
import prisma from "@/lib/db/prisma";
import { verifyToken } from "@/lib/jwt";
import { cookies } from "next/headers";
import { decrypt } from "@/lib/crypto";
import { getOrCreateDailyQueue } from "@/lib/queue";
import { logger } from "@/lib/infrastructure/logger";
import { resolveClinicLogicalDay } from "@/lib/utils/clinic-utils";

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

    const body = await request.json();
    const { doctorId } = body;

    if (!doctorId || typeof doctorId !== "string") {
      return apiError("Doctor ID is required", 400);
    }

    // Check if patient is actually on the waitlist for this doctor
    const waitlistEntry = await prisma.waitlist.findFirst({
      where: {
        doctorId,
        userId: payload.id
      }
    });

    if (!waitlistEntry) {
      return apiError("Aap is doctor ki waitlist par nahi hain", 400);
    }

    // Check that patient was actually notified for the slot
    if (!waitlistEntry.notified || !waitlistEntry.notifiedAt) {
      return apiError("Aapko abhi is slot ko claim karne ki permission nahi hai", 400);
    }

    // Enforce logical-day scoping for the waitlist notification
    const todayLogicalDate = resolveClinicLogicalDay();
    const notificationLogicalDate = resolveClinicLogicalDay(waitlistEntry.notifiedAt);
    if (notificationLogicalDate.getTime() !== todayLogicalDate.getTime()) {
      return apiError("Aapki waitlist notification purani ho chuki hai. Kripya naya slot open hone ka intezar karein.", 400);
    }

    try {
      const result = await prisma.$transaction(async (tx) => {
        // 1. Fetch current daily queue inside transaction (lazy-create if needed)
        const dailyQueue = await getOrCreateDailyQueue(doctorId, "REGULAR");

        // 2. Lock the daily queue row for update to serialize concurrent claims
        await tx.$queryRaw`
          SELECT id FROM "daily_queues" WHERE id = ${dailyQueue.id} FOR UPDATE
        `;

        // 3. Count active bookings in the daily queue to verify capacity
        const activeBookingsCount = await tx.queueToken.count({
          where: {
            queueId: dailyQueue.id,
            status: { in: ['BOOKED', 'READY', 'CALLED', 'IN_CONSULTATION'] }
          }
        });

        if (activeBookingsCount >= dailyQueue.dailyLimit) {
          throw new Error("SLOT_TAKEN");
        }

        // 4. Increment totalTokens atomically on the daily queue
        const updatedQueue = await tx.dailyQueue.update({
          where: { id: dailyQueue.id },
          data: {
            totalTokens: { increment: 1 }
          },
          select: { totalTokens: true }
        });

        if (!updatedQueue) {
          throw new Error("QUEUE_NOT_FOUND");
        }

        // 5. Create the token
        const newTokenNumber = updatedQueue.totalTokens;
        const user = await tx.user.findUnique({
          where: { id: payload.id },
          select: { phone: true, name: true }
        });
        
        if (!user) {
          throw new Error("USER_NOT_FOUND");
        }

        const decryptedPhone = decrypt(user.phone);
        const claimIdKey = `claim:booking:${dailyQueue.id}:${newTokenNumber}`;
        
        const newToken = await tx.queueToken.create({
          data: {
            idempotencyKey: claimIdKey,
            queueId: dailyQueue.id,
            tokenNumber: newTokenNumber,
            patientId: payload.id,
            walkinName: user.name || "Patient",
            walkinPhone: decryptedPhone,
            status: 'BOOKED',
            type: 'ONLINE',
            bookedAt: new Date(),
            paymentVerified: true
          }
        });

        // 6. Delete waitlist entry since slot is claimed
        await tx.waitlist.delete({
          where: { id: waitlistEntry.id }
        });

        return newToken;
      });

      logger.info({
        category: "BOOKING",
        message: "Waitlist slot claimed successfully",
        metadata: { userId: payload.id, tokenId: result.id, tokenNumber: result.tokenNumber }
      });

      return apiResponse({
        success: true,
        message: "Slot claimed successfully!",
        token: result
      });

    } catch (txError: any) {
      if (txError.message === "SLOT_TAKEN") {
        // Reset the waitlist notification status so they can be notified for the next slot
        await prisma.waitlist.update({
          where: { id: waitlistEntry.id },
          data: {
            notified: false,
            notifiedAt: null
          }
        }).catch(() => {});

        return apiResponse({
          success: false,
          message: "Yeh slot abhi kisi aur ne le liya hai — you are still on the waitlist.",
          isTaken: true
        });
      }
      throw txError;
    }

  } catch (error: any) {
    logger.error({
      category: "BOOKING",
      message: "Waitlist claim error",
      error
    });
    return apiError("Failed to claim waitlist slot. Please try again.", 500);
  }
}
