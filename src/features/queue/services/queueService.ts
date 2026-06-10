import prisma from "@/lib/db/prisma";
import { resolveClinicCurrentTime } from "@/lib/utils/clinic-utils";
import { getOrCreateDailyQueue, getLogicalDate } from "@/lib/queue";

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
      // 0. Ensure Doctor exists and is VERIFIED
      const doctor = await tx.doctor.findUnique({ where: { id: doctorId } });
      if (!doctor || doctor.verificationStatus !== 'VERIFIED') {
        throw new Error("DOCTOR_NOT_VERIFIED");
      }

      if (!doctor.isOnline && tokenType === "ONLINE") {
        throw new Error("DOCTOR_NOT_ACCEPTING");
      }

      // 1. Fetch or Lazy-Init Daily Queue
      const dailyQueue = await getOrCreateDailyQueue(doctorId);

      // 2. Check for duplicate token
      const existingToken = await tx.queueToken.findFirst({
        where: {
          queueId: dailyQueue.id,
          patientPhone,
          status: { in: ['BOOKED', 'READY', 'CALLED', 'IN_CONSULTATION'] },
        },
      });

      if (existingToken) {
        throw new Error(`ALREADY_BOOKED:${existingToken.tokenNumber}`);
      }

      // 3. Atomic increment and issuance
      const updatedQueue = await tx.dailyQueue.update({
        where: { id: dailyQueue.id },
        data: { currentTokenNumber: { increment: 1 } },
      });

      const newTokenNumber = updatedQueue.currentTokenNumber;

      // 4. Check daily limit
      if (newTokenNumber > updatedQueue.dailyLimit && tokenType !== "EMERGENCY") {
        throw new Error('DAILY_LIMIT_REACHED');
      }

      // 5. Create token
      const token = await tx.queueToken.create({
        data: {
          queueId: dailyQueue.id,
          tokenNumber: newTokenNumber,
          patientPhone,
          patientId: userId,
          patientName,
          tokenType,
          status: 'BOOKED',
          bookedAt: new Date(),
          isWaitlist: false,
        },
      });

      return { token };
    };

    if (prismaTx) {
      return await coreLogic(prismaTx);
    } else {
      return await prisma.$transaction(coreLogic);
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
    const isOnline = doctor.isOnline;
    const dailyLimit = doctor.dailyTokenLimit || 50;
    const avgTime = doctor.averageConsultationMinutes || 10;

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
      currentToken = todayQueue.currentTokenNumber;
      servedToken = todayQueue.currentServingToken;
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
