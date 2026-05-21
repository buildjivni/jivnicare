import { PrismaClient, Doctor, ClinicOperations, WeeklySchedule, DailyQueue } from '@prisma/client';
import { getUnifiedQueueCapacity } from '@/lib/clinic-utils';

export type DynamicStatus = 
  | 'AVAILABLE_NOW'
  | 'FAST_FILLING'
  | 'BREAK_ACTIVE'
  | 'OPD_FULL'
  | 'EMERGENCY_ONLY'
  | 'CLOSED_FOR_TODAY'
  | 'NEXT_AVAILABLE_TOMORROW'
  | 'UNKNOWN';

interface StatusInput {
  doctor: any; // includes ClinicOperations, WeeklySchedule
  todayQueue: any | null; // DailyQueue
}

interface StatusResult {
  status: DynamicStatus;
  message: string;
  isBookableOnline: boolean;
  estimatedWaitMinutes: number | null;
  activeTokenNumber: number | null;
}

export function calculateDynamicStatus({ doctor, todayQueue }: StatusInput): StatusResult {
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
  const currentDayName = new Date().toLocaleDateString('en-US', { weekday: 'long' }).toLowerCase() as keyof WeeklySchedule;
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

  if (operations?.emergencySlots > 0 && issuedTokens >= maxCapacity) {
    return {
      status: 'EMERGENCY_ONLY',
      message: 'Regular OPD is full. Only accepting emergency cases.',
      isBookableOnline: false, // UI should handle emergency flow separately
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
