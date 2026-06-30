import prisma from "@/lib/db/prisma";
import { resolveClinicCurrentTime, resolveClinicLogicalDay } from "@/lib/utils/clinic-utils";
import { getOrCreateDailyQueue } from "@/lib/queue";
import { hashPhone } from "@/lib/crypto";

export class QueueService {
  /**
   * Generates a new token for a given doctor on a specific date.
   * Uses JivniCare V1 logic: atomic increment inside transaction.
   */
  static async issueToken(
    doctorId: string, 
    userId: string | null, 
    patientPhone: string,
    tokenType: "ONLINE" | "WALKIN" | "EMERGENCY" = "ONLINE",
    patientName?: string,
    prismaTx?: any
  ) {
    const coreLogic = async (tx: any) => {
      // Walk-in Auto-linking: Lookup user by phoneHash if userId is null
      let resolvedUserId = userId;
      if (!resolvedUserId && patientPhone) {
        const phone10 = patientPhone.replace(/\D/g, "").slice(-10);
        if (phone10.length === 10) {
          const hashedPhone = hashPhone(phone10);
          const matchedUser = await tx.user.findUnique({
            where: { phoneHash: hashedPhone },
            select: { id: true }
          });
          if (matchedUser) {
            resolvedUserId = matchedUser.id;
          }
        }
      }

      // 0. Ensure Doctor exists and is VERIFIED
      const doctor = await tx.doctor.findUnique({ 
        where: { id: doctorId }
      });
      if (!doctor || doctor.verificationStatus !== 'VERIFIED') {
        throw new Error("DOCTOR_NOT_VERIFIED");
      }

      const isEmergencyOnly = !doctor.isAcceptingBookings && doctor.isEmergencyEnabled;
      const isClosedToday = doctor.availabilityStatus === "OFFLINE";
      const isShortBreak = doctor.availabilityStatus === "ON_BREAK";

      // 0b. Enforce clinic closed, paused, and EMERGENCY_ONLY validations
      if (isClosedToday) {
        throw new Error("CLINIC_CLOSED_TODAY");
      }
      if (tokenType !== "EMERGENCY") {
        if (isEmergencyOnly) {
          throw new Error("EMERGENCY_ONLY_ACTIVE");
        }
        if (isShortBreak || !doctor.isAcceptingBookings) {
          throw new Error("QUEUE_PAUSED");
        }
      }

      if (!doctor.isAcceptingBookings && tokenType === "ONLINE") {
        throw new Error("DOCTOR_NOT_ACCEPTING");
      }

      // 1. Fetch or Lazy-Init Daily Queue
      const dailyQueue = await getOrCreateDailyQueue(doctorId, tokenType === "EMERGENCY" ? "EMERGENCY" : "REGULAR");

      // 2. Check for duplicate token: match phone AND name (case-insensitive) to support shared family phone numbers
      if (tokenType === "ONLINE") {
        const nameCondition = patientName && patientName.trim()
          ? { walkinName: { equals: patientName.trim(), mode: 'insensitive' as const } }
          : { OR: [{ walkinName: null }, { walkinName: "" }] };

        const existingToken = await tx.queueToken.findFirst({
          where: {
            queueId: dailyQueue.id,
            walkinPhone: patientPhone,
            ...nameCondition,
            status: { in: ['BOOKED', 'READY', 'CALLED', 'IN_CONSULTATION'] },
          },
        });

        if (existingToken) {
          throw new Error(`ALREADY_BOOKED:${existingToken.tokenNumber}`);
        }
      }

      // 3. Count active bookings to verify capacity
      const activeBookingsCount = await tx.queueToken.count({
        where: {
          queueId: dailyQueue.id,
          status: { in: ['BOOKED', 'READY', 'CALLED', 'IN_CONSULTATION'] }
        }
      });

      if (tokenType !== "EMERGENCY") {
        if (activeBookingsCount >= dailyQueue.dailyLimit) {
          throw new Error('DAILY_LIMIT_REACHED');
        }

        // If this is a standard online booking, check if there are notified waitlist entries for today's logical day
        if (tokenType === "ONLINE") {
          const notifiedWaitlistEntries = await tx.waitlist.findMany({
            where: {
              doctorId,
              notified: true
            }
          });

          const todayLogicalDate = dailyQueue.date;
          const activeNotified = notifiedWaitlistEntries.filter((entry: any) => {
            if (!entry.notifiedAt) return false;
            const entryLogicalDate = resolveClinicLogicalDay(entry.notifiedAt);
            return entryLogicalDate.getTime() === todayLogicalDate.getTime();
          });

          if (activeNotified.length > 0) {
            throw new Error('WAITLIST_RESERVED');
          }
        }
      } else {
        if (activeBookingsCount >= dailyQueue.emergencySlots) {
          throw new Error('EMERGENCY_FULL');
        }
      }

      // 4. Atomic increment and issuance
      const updatedQueue = await tx.dailyQueue.update({
        where: { id: dailyQueue.id },
        data: {
          totalTokens: { increment: 1 }
        },
      });

      const newTokenNumber = updatedQueue.totalTokens;

      // 5. Create token
      const claimIdKey = `booking:${dailyQueue.id}:${newTokenNumber}`;
      const token = await tx.queueToken.create({
        data: {
          idempotencyKey: claimIdKey,
          queueId: dailyQueue.id,
          tokenNumber: newTokenNumber,
          walkinPhone: patientPhone,
          patientId: resolvedUserId,
          walkinName: patientName || "Patient",
          type: tokenType === "EMERGENCY" ? "ONLINE" : tokenType,
          status: 'BOOKED',
          bookedAt: new Date(),
        },
      });

      return { token };
    };

    if (prismaTx) {
      return await coreLogic(prismaTx);
    } else {
      return await prisma.$transaction(coreLogic, { timeout: 15000 });
    }
  }

  // Calculate dynamic status — refactored for V1
  static calculateDynamicStatus({ doctor, todayQueue }: { doctor: any, todayQueue: any | null }): {
    status: 'AVAILABLE_NOW' | 'FAST_FILLING' | 'OPD_FULL' | 'CLOSED_FOR_TODAY' | 'UNKNOWN';
    message: string;
    isBookableOnline: boolean;
    activeTokenNumber: number | null;
    estimatedWaitMinutes: number | null;
  } {
    const isOnline = doctor.availabilityStatus === "AVAILABLE" || doctor.isAcceptingBookings;
    const dailyLimit = doctor.dailyTokenLimit || 30;
    const avgTime = 15;

    if (!isOnline) {
      return {
        status: 'CLOSED_FOR_TODAY',
        message: 'Clinic is closed today.',
        isBookableOnline: false,
        activeTokenNumber: null,
        estimatedWaitMinutes: null
      };
    }

    let currentToken = 0;
    let servedToken = 0;

    if (todayQueue) {
      currentToken = todayQueue.totalTokens;
      servedToken = todayQueue.currentToken;
    }

    const waiting = Math.max(0, currentToken - servedToken);
    const estimatedWaitMinutes = waiting * avgTime;

    if (currentToken >= dailyLimit) {
      return {
        status: 'OPD_FULL',
        message: 'Tokens are full for today.',
        isBookableOnline: false,
        activeTokenNumber: servedToken,
        estimatedWaitMinutes
      };
    }

    if (currentToken >= dailyLimit * 0.8) {
      return {
        status: 'FAST_FILLING',
        message: 'Few slots remaining.',
        isBookableOnline: true,
        activeTokenNumber: servedToken,
        estimatedWaitMinutes
      };
    }

    return {
      status: 'AVAILABLE_NOW',
      message: 'Accepting appointments.',
      isBookableOnline: true,
      activeTokenNumber: servedToken,
      estimatedWaitMinutes
    };
  }
}
