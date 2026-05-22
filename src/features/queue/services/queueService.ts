import prisma from "@/lib/db/prisma";
import { getStartOfDay, getUnifiedQueueCapacity } from "@/lib/utils/clinic-utils";

export class QueueService {
  /**
   * Generates a new token for a given doctor on a specific date.
   * Runs inside a Prisma $transaction to ensure token sequence integrity.
   */
  static async issueToken(
    doctorId: string, 
    date: Date, 
    userId: string | null, 
    source: "ONLINE" | "WALK_IN" = "ONLINE", 
    patientLocation?: string,
    isEmergency: boolean = false,
    prismaTx?: any
  ) {
    // Phase 6: Canonical Start of Day
    const queueDate = getStartOfDay(date);

    // The core logic that must run atomically
    const coreLogic = async (tx: any) => {
      // 0. Ensure Doctor exists and is VERIFIED
      const doctor = await tx.doctor.findUnique({ where: { id: doctorId } });
      if (!doctor || doctor.verificationStatus !== "VERIFIED") {
        throw new Error("DOCTOR_NOT_VERIFIED");
      }

      // 1. Check Clinic Operations & Schedule
      const clinicOps = await tx.clinicOperations.findUnique({ where: { doctorId } });
      const schedule = await tx.weeklySchedule.findUnique({ where: { doctorId } });

      if (clinicOps?.isClosedToday) {
        throw new Error("CLINIC_CLOSED_TODAY");
      }

      if (source === "ONLINE" && clinicOps?.pauseOnlineBooking && !isEmergency) {
        throw new Error("QUEUE_PAUSED");
      }

      // Check Weekly Schedule for the given day
      if (schedule) {
        const days = ["sunday", "monday", "tuesday", "wednesday", "thursday", "friday", "saturday"];
        const dayName = days[new Date(date).getDay()];
        const dayConfig = (schedule as any)[dayName];

        if (dayConfig && typeof dayConfig === "object") {
          if (dayConfig.isOpen === false) {
            throw new Error("CLINIC_CLOSED_ON_THIS_DAY");
          }

          // Strict Timing Enforcement for ONLINE bookings
          if (source === "ONLINE" && !isEmergency) {
            const now = new Date();
            const currentHour = now.getHours();
            const currentMin = now.getMinutes();
            const currentTimeStr = `${currentHour.toString().padStart(2, "0")}:${currentMin.toString().padStart(2, "0")}`;

            if (dayConfig.start && currentTimeStr < dayConfig.start) {
              throw new Error("BOOKING_NOT_STARTED");
            }
            if (dayConfig.end && currentTimeStr > dayConfig.end) {
              throw new Error("BOOKING_FINISHED");
            }
          }
        }
      }

      // 2. Fetch or Lazy-Init Daily Queue
      let dailyQueue = await tx.dailyQueue.findUnique({
        where: { doctorId_date: { doctorId, date: queueDate } },
      });

      if (!dailyQueue) {
        // Unified Capacity: Combine walkIn and online limit
        const maxCapacity = getUnifiedQueueCapacity(clinicOps);

        dailyQueue = await tx.dailyQueue.create({
          data: { 
            doctorId, 
            date: queueDate, 
            maxCapacity,
            status: "ACTIVE",
            issuedTokensCount: 0
          },
        });
      }

      // 3. Check for duplicate online booking
      if (source === "ONLINE" && userId) {
        const existingToken = await tx.queueToken.findFirst({
          where: { queueId: dailyQueue.id, userId },
        });

        if (existingToken) throw new Error("ALREADY_BOOKED");
      }

      // 4. Atomic Capacity & Token Sequencing (Unified Pool)
      let tokenNumber = 0;
      let actualEmergency = isEmergency;

      if (isEmergency) {
        // Check emergency capacity
        const emergencyCount = await tx.queueToken.count({
          where: { queueId: dailyQueue.id, isEmergency: true }
        });
        
        if (emergencyCount >= (clinicOps?.emergencySlots || 2)) {
           throw new Error("EMERGENCY_FULL");
        }
        
        // Emergency tokens get a special number like 9991, 9992 to bypass regular sequence visually,
        // or we just mark them. Let's use negative numbers or offset for now, 
        // actually just mark `isEmergency=true` and keep tokenNumber = 0 or max + 1.
        // Let's just use the counter but it doesn't increment the regular issuedTokensCount.
        tokenNumber = 9000 + emergencyCount + 1; // E.g., 9001
      } else {
        const updatedQueue = await tx.dailyQueue.update({
          where: { id: dailyQueue.id },
          data: { issuedTokensCount: { increment: 1 } }
        });

        if (updatedQueue.issuedTokensCount > updatedQueue.maxCapacity) {
          throw new Error("QUEUE_FULL");
        }
        tokenNumber = updatedQueue.issuedTokensCount;
      }

      // 5. Atomic Token Creation
      const newQueueToken = await tx.queueToken.create({
        data: {
          queueId: dailyQueue.id,
          tokenNumber,
          source,
          status: "WAITING",
          userId: source === "ONLINE" ? userId : null,
          isEmergency: actualEmergency,
          patientLocation: patientLocation || null,
        },
      });

      return newQueueToken;
    };

    // If an outer transaction is provided (e.g. from Walk-In endpoint), use it.
    // Otherwise, start a new transaction.
    if (prismaTx) {
      return await coreLogic(prismaTx);
    } else {
      return await prisma.$transaction(coreLogic);
    }
  }
}
