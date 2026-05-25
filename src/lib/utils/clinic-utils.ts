/**
 * Returns the current logical "Clinic Day".
 * If the current time is before 4:00 AM, it returns the previous calendar day.
 * This ensures that doctors working past midnight can finish their session
 * without the queue resetting to an empty next-day state.
 */
export function getCurrentLogicalDay(): Date {
  const now = new Date();
  const logicalDate = new Date(now);
  const localHours = now.getHours();
  
  if (localHours < 4) {
    logicalDate.setDate(logicalDate.getDate() - 1);
  }
  
  logicalDate.setHours(0, 0, 0, 0);
  return logicalDate;
}

/**
 * Normalizes any date to the start of its calendar day.
 */
export function getStartOfDay(date: Date): Date {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d;
}

/** Canonical total queue capacity from clinic operations limits. */
export function getUnifiedQueueCapacity(
  ops?: { onlineLimit?: number | null; walkInLimit?: number | null } | null
): number {
  if (!ops) return 40;
  const total = (ops.onlineLimit ?? 0) + (ops.walkInLimit ?? 0);
  return total > 0 ? total : 40;
}

export const EMERGENCY_TOKEN_BASE = 9000;

export function isEmergencyToken(t: {
  tokenNumber: number;
  isEmergency?: boolean | null;
}): boolean {
  return Boolean(t.isEmergency) || t.tokenNumber >= EMERGENCY_TOKEN_BASE;
}

/** Regular-token position ahead of the patient (0 if already serving or emergency). */
export function getRegularQueuePosition(
  regularTokens: { tokenNumber: number; status: string }[],
  currentActive: number,
  myTokenNumber: number
): number {
  if (myTokenNumber <= currentActive) return 0;
  const waitingAhead = regularTokens.filter(
    (t) =>
      t.status === "WAITING" &&
      t.tokenNumber > currentActive &&
      t.tokenNumber < myTokenNumber
  ).length;
  return waitingAhead + 1; // +1 includes the current active consultation ideally
}

/** 
 * Returns a trustworthy, approximate wait time bucket to avoid fake precision.
 * Factors in the number of emergency tokens currently waiting.
 */
export function getApproximateWaitTime(
  queuePosition: number, 
  avgConsultationTime: number, 
  emergencyTokensWaiting: number = 0
): string {
  if (queuePosition <= 0) return "Next";
  
  // Base time calculation + emergency penalty (assume each emergency adds avgConsultationTime)
  const baseMinutes = (queuePosition * avgConsultationTime) + (emergencyTokensWaiting * avgConsultationTime);
  
  if (baseMinutes <= 15) return "~15 mins";
  if (baseMinutes <= 30) return "15-30 mins";
  if (baseMinutes <= 45) return "30-45 mins";
  if (baseMinutes <= 60) return "45-60 mins";
  if (baseMinutes <= 90) return "1-1.5 hours";
  if (baseMinutes <= 120) return "1.5-2 hours";
  return "> 2 hours";
}
