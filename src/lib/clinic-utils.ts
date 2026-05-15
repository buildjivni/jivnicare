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
