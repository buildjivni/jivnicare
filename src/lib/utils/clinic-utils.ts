/**
 * RESOLVES THE EXACT CURRENT LOGICAL CLINIC DAY (IST)
 * Enforces 04:00 AM IST Rollover Boundary.
 * Do NOT use any other method for queue-date generation.
 */
export function resolveClinicLogicalDay(customDate?: Date): Date {
  const now = customDate || new Date();
  
  // Format the time explicitly to Asia/Kolkata
  const formatter = new Intl.DateTimeFormat('en-US', {
    timeZone: 'Asia/Kolkata',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    hour12: false,
  });

  const parts = formatter.formatToParts(now);
  const getPart = (type: string) => parts.find(p => p.type === type)?.value || "";
  
  const year = parseInt(getPart("year"));
  const month = parseInt(getPart("month")) - 1; // 0-indexed
  const day = parseInt(getPart("day"));
  const hour = parseInt(getPart("hour"));

  // We create a date representing the local IST date (at midnight UTC for simple storage)
  const logicalDate = new Date(Date.UTC(year, month, day, 0, 0, 0, 0));

  // The 4 AM Rollover Rule
  if (hour < 4) {
    logicalDate.setUTCDate(logicalDate.getUTCDate() - 1);
  }

  return logicalDate;
}

/**
 * RESOLVES THE EXACT CURRENT IST CLOCK TIME.
 * Returns hour, minute, weekday (lowercase), and a comparable HH:MM string —
 * all derived exclusively from Asia/Kolkata, never from server UTC.
 *
 * This is the ONLY approved source for booking-window and clinic-status time checks.
 */
export function resolveClinicCurrentTime(): {
  hour: number;
  minute: number;
  weekday: string;          // e.g. "monday", "sunday"
  timeStr: string;          // e.g. "09:05" — for direct string comparison with schedule times
} {
  const now = new Date();

  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone: 'Asia/Kolkata',
    hour: '2-digit',
    minute: '2-digit',
    weekday: 'long',
    hour12: false,
  }).formatToParts(now);

  const getPart = (type: string) => parts.find(p => p.type === type)?.value ?? '';

  const rawHour = getPart('hour');
  const rawMin  = getPart('minute');
  // Intl can return "24" for midnight on some runtimes; normalise to "00"
  const hour    = parseInt(rawHour) % 24;
  const minute  = parseInt(rawMin);
  const weekday = getPart('weekday').toLowerCase();    // "monday" … "sunday"

  const hh      = hour.toString().padStart(2, '0');
  const mm      = minute.toString().padStart(2, '0');

  return { hour, minute, weekday, timeStr: `${hh}:${mm}` };
}

/**
 * Parses an externally provided string or Date into a strict historical queue date.
 * Does NOT apply the 4 AM rollover rule (because the historical date is absolute).
 */
export function parseHistoricalClinicDate(inputDate: Date | string): Date {
  const d = new Date(inputDate);
  // Ensure it's pinned to UTC midnight for consistency in the database
  return new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate(), 0, 0, 0, 0));
}



/** Canonical total queue capacity from clinic operations limits. */
export function getUnifiedQueueCapacity(
  ops?: { onlineLimit?: number | null; walkInLimit?: number | null } | null
): number {
  if (!ops) return 40;
  const total = (ops.onlineLimit ?? 0) + (ops.walkInLimit ?? 0);
  return total > 0 ? total : 40;
}

const EMERGENCY_TOKEN_BASE = 9000;

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

