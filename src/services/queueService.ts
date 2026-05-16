import prisma from "@/lib/prisma";
import { getStartOfDay } from "@/lib/clinic-utils";

export class QueueService {
  /**
   * Generates a new token for a given doctor on a specific date.
   * Runs inside a Prisma $transaction to ensure token sequence integrity.
   */
  static async issueToken(doctorId: string, date: Date, userId: string | null, source: "ONLINE" | "WALK_IN" = "ONLINE", patientLocation?: string) {
    // Phase 6: Canonical Start of Day
    const queueDate = getStartOfDay(date);

    return await prisma.$transaction(async (tx) => {
      // 1. Check Clinic Operations & Schedule
      const clinicOps = await tx.clinicOperations.findUnique({ where: { doctorId } });
      const schedule = await tx.weeklySchedule.findUnique({ where: { doctorId } });

      if (clinicOps?.isClosedToday) {
        throw new Error("CLINIC_CLOSED_TODAY");
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
          if (source === "ONLINE") {
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
        // Unified Capacity: Use walkInLimit as the single source of truth for total capacity
        const maxCapacity = clinicOps ? clinicOps.walkInLimit : 40;

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
      // Perform an atomic increment and retrieve the NEW value in a single operation.
      // This prevents the Read-After-Write TOCTOU race condition where two concurrent
      // requests might read the exact same snapshot value and generate duplicate tokens.
      const updatedQueue = await tx.dailyQueue.update({
        where: { id: dailyQueue.id },
        data: { issuedTokensCount: { increment: 1 } }
      });

      if (updatedQueue.issuedTokensCount > updatedQueue.maxCapacity) {
        // Automatically rolls back the transaction and the increment if capacity is exceeded
        throw new Error("QUEUE_FULL");
      }

      // 5. Atomic Token Creation
      const newQueueToken = await tx.queueToken.create({
        data: {
          queueId: dailyQueue.id,
          tokenNumber: updatedQueue.issuedTokensCount,
          source,
          status: "WAITING",
          userId: source === "ONLINE" ? userId : null,
          isEmergency: false,
          patientLocation: patientLocation || null,
        },
      });

      return newQueueToken;
    });
  }
}
