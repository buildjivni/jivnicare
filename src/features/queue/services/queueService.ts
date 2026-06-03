import prisma from "@/lib/db/prisma";
import { resolveClinicLogicalDay, resolveClinicCurrentTime, getUnifiedQueueCapacity } from "@/lib/utils/clinic-utils";

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
    // The QueueService is the final authority on logical day enforcement.
    // We completely ignore externally provided dates for new token issuance.
    const queueDate = resolveClinicLogicalDay();

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

      let isClosedToday = clinicOps?.isClosedToday || false;
      let pauseOnlineBooking = clinicOps?.pauseOnlineBooking || false;

      // Task A4: Runtime evaluation of expiration
      if (clinicOps?.statusExpiresAt && new Date(clinicOps.statusExpiresAt) < new Date()) {
        isClosedToday = false;
        pauseOnlineBooking = false;
      }

      let isEmergencyOverride = false;
      if (isClosedToday) {
        if (isEmergency) {
          isEmergencyOverride = true;
        } else {
          throw new Error("CLINIC_CLOSED_TODAY");
        }
      }

      if (source === "ONLINE" && pauseOnlineBooking && !isEmergency) {
        throw new Error("QUEUE_PAUSED");
      }

      // Check Weekly Schedule for the given day
      if (schedule) {
        // IST weekday via central authority — never trust server UTC
        const { weekday: dayName, timeStr: currentTimeStr } = resolveClinicCurrentTime();
        const dayConfig = (schedule as any)[dayName];

        if (dayConfig && typeof dayConfig === "object") {
          if (dayConfig.isOpen === false) {
            throw new Error("CLINIC_CLOSED_ON_THIS_DAY");
          }

          // Strict Timing Enforcement for ONLINE bookings (IST window)
          if (source === "ONLINE" && !isEmergency) {
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
          where: { 
            queueId: dailyQueue.id, 
            userId,
            status: { in: ["WAITING", "IN_CONSULTATION"] }
          },
        });

        if (existingToken) throw new Error(`ALREADY_BOOKED:${existingToken.id}`);
      }

      // 4. Atomic Capacity & Token Sequencing (Unified Pool)
      let tokenNumber = 0;
      let actualEmergency = isEmergency;

      if (isEmergency) {
        // Phase 2 Fix: Atomic Sequence Generation via Redis
        const emergencyCountKey = `queue:${dailyQueue.id}:emergency`;
        const currentEmergencyCount = await tx.queueToken.count({
          where: { 
            queueId: dailyQueue.id, 
            isEmergency: true,
            status: { notIn: ["CANCELLED", "NO_SHOW"] }
          }
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

        const activeCapacity = updatedQueue.issuedTokensCount - (updatedQueue.cancelledCount ?? 0) - (updatedQueue.noShowCount ?? 0);
        
        if (activeCapacity > updatedQueue.maxCapacity) {
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

      return { token: newQueueToken, isEmergencyOverride };
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

    let isClosedToday = operations?.isClosedToday || false;
    let pauseOnlineBooking = operations?.pauseOnlineBooking || false;

    // Task A4: Runtime evaluation of expiration
    if (operations?.statusExpiresAt && new Date(operations.statusExpiresAt) < new Date()) {
      isClosedToday = false;
      pauseOnlineBooking = false;
    }

    // 1. Is it closed entirely?
    if (isClosedToday) {
      return {
        status: 'CLOSED_FOR_TODAY',
        message: 'Clinic is closed today.',
        isBookableOnline: false,
        estimatedWaitMinutes: null,
        activeTokenNumber: null
      };
    }

    // 2. Schedule Checks — weekday and time from IST central authority
    const { weekday: currentDayName, timeStr: currentTimeStr } = resolveClinicCurrentTime();
    const todaySchedule: any = schedule ? (schedule as any)[currentDayName] : null;

    if (!todaySchedule || !todaySchedule.isOpen) {
      return {
        status: 'CLOSED_FOR_TODAY',
        message: 'Doctor does not consult on this day.',
        isBookableOnline: false,
        estimatedWaitMinutes: null,
        activeTokenNumber: null
      };
    }

    // String comparison in HH:MM format is safe because both sides use the same format
    // and lexicographic order is identical to chronological order for 00:00–23:59
    if (todaySchedule.end && currentTimeStr > todaySchedule.end) {
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
      // PR-1: Active capacity = issued minus cancelled and no-shows (zero extra query)
      issuedTokens = todayQueue.issuedTokensCount
        - (todayQueue.cancelledCount ?? 0)
        - (todayQueue.noShowCount ?? 0);
      maxCapacity = todayQueue.maxCapacity;
    }

    const waitingPatients = Math.max(0, issuedTokens - activeToken);
    const estimatedWaitMinutes = waitingPatients * avgTime;

    // 4. Live Control Overrides
    if (pauseOnlineBooking) {
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
