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
        // Phase 2 Fix: Atomic Sequence Generation via Redis
        const emergencyCountKey = `queue:${dailyQueue.id}:emergency`;
        const currentEmergencyCount = await tx.queueToken.count({
          where: { queueId: dailyQueue.id, isEmergency: true }
        });
        
        if (currentEmergencyCount >= (clinicOps?.emergencySlots || 2)) {
           throw new Error("EMERGENCY_FULL");
        }
        
        try {
          const redis = (await import('@/lib/db/redis')).redis;
          const seq = await redis.incr(emergencyCountKey);
          if (seq === 1) await redis.expire(emergencyCountKey, 86400); // 24h TTL
          tokenNumber = 9000 + seq; 
          import('@/lib/telemetry/redis').then(m => m.incrementTelemetryCounter('emergencyQueueInsertions').catch(() => {}));
        } catch (error) {
          // Fallback if Redis is down (degraded mode, uses count + 1 which has race condition but keeps system alive)
          import('@/lib/telemetry/redis').then(m => m.incrementTelemetryCounter('emergencyQueueConflicts').catch(() => {}));
          tokenNumber = 9000 + currentEmergencyCount + 1;
        }
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

  static calculateDynamicStatus({ doctor, todayQueue }: { doctor: any, todayQueue: any | null }): {
    status: 'AVAILABLE_NOW' | 'FAST_FILLING' | 'BREAK_ACTIVE' | 'OPD_FULL' | 'EMERGENCY_ONLY' | 'CLOSED_FOR_TODAY' | 'NEXT_AVAILABLE_TOMORROW' | 'UNKNOWN';
    message: string;
    isBookableOnline: boolean;
    estimatedWaitMinutes: number | null;
    activeTokenNumber: number | null;
  } {
    const operations = doctor.clinicOperations;
    const schedule = doctor.weeklySchedule;
    const avgTime = doctor.averageConsultationTime || 15; // minutes

    // 1. Is it closed entirely?
    if (operations?.isClosedToday) {
      return {
        status: 'CLOSED_FOR_TODAY',
        message: 'Clinic is closed today.',
        isBookableOnline: false,
        estimatedWaitMinutes: null,
        activeTokenNumber: null
      };
    }

    // 2. Schedule Checks
    const currentDayName = new Date().toLocaleDateString('en-US', { weekday: 'long' }).toLowerCase();
    const todaySchedule: any = schedule ? schedule[currentDayName] : null;

    if (!todaySchedule || !todaySchedule.isOpen) {
      return {
        status: 'CLOSED_FOR_TODAY',
        message: 'Doctor does not consult on this day.',
        isBookableOnline: false,
        estimatedWaitMinutes: null,
        activeTokenNumber: null
      };
    }

    const now = new Date();
    const [startHour, startMin] = todaySchedule.start.split(':').map(Number);
    const [endHour, endMin] = todaySchedule.end.split(':').map(Number);
    
    const startTime = new Date();
    startTime.setHours(startHour, startMin, 0, 0);
    
    const endTime = new Date();
    endTime.setHours(endHour, endMin, 0, 0);

    if (now > endTime) {
      return {
        status: 'NEXT_AVAILABLE_TOMORROW',
        message: 'OPD hours have ended for today.',
        isBookableOnline: false,
        estimatedWaitMinutes: null,
        activeTokenNumber: null
      };
    }

    // 3. Queue Calculations
    let activeToken = 0;
    let issuedTokens = 0;
    let maxCapacity = todaySchedule.maxPatients || getUnifiedQueueCapacity(operations) || 50;

    if (todayQueue) {
      activeToken = todayQueue.currentActiveToken;
      issuedTokens = todayQueue.issuedTokensCount;
      maxCapacity = todayQueue.maxCapacity;
    }

    const waitingPatients = Math.max(0, issuedTokens - activeToken);
    const estimatedWaitMinutes = waitingPatients * avgTime;

    // 4. Live Control Overrides
    if (operations?.pauseOnlineBooking) {
      return {
        status: 'BREAK_ACTIVE',
        message: 'Online booking is temporarily paused.',
        isBookableOnline: false,
        estimatedWaitMinutes,
        activeTokenNumber: activeToken
      };
    }

    if (doctor.emergencyAvailable && operations?.emergencySlots > 0 && issuedTokens >= maxCapacity) {
      return {
        status: 'EMERGENCY_ONLY',
        message: 'Regular OPD is full. Only accepting emergency cases.',
        isBookableOnline: false,
        estimatedWaitMinutes,
        activeTokenNumber: activeToken
      };
    }

    // 5. Capacity Checks
    if (issuedTokens >= maxCapacity) {
      return {
        status: 'OPD_FULL',
        message: 'Tokens are full for today.',
        isBookableOnline: false,
        estimatedWaitMinutes,
        activeTokenNumber: activeToken
      };
    }

    if (issuedTokens >= maxCapacity * 0.8) {
      return {
        status: 'FAST_FILLING',
        message: 'Few slots remaining.',
        isBookableOnline: true,
        estimatedWaitMinutes,
        activeTokenNumber: activeToken
      };
    }

    return {
      status: 'AVAILABLE_NOW',
      message: 'Accepting appointments.',
      isBookableOnline: true,
      estimatedWaitMinutes,
      activeTokenNumber: activeToken
    };
  }
}
