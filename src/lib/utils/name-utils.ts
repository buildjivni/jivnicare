/**
 * JivniCare — Name Formatting Utilities
 */

/**
 * Ensures a doctor's name has exactly one "Dr. " prefix.
 * @example formatDoctorName("Rajesh") -> "Dr. Rajesh"
 * @example formatDoctorName("Dr. Rajesh") -> "Dr. Rajesh"
 */
export function formatDoctorName(name: string): string {
  const trimmed = (name || "").trim();
  if (!trimmed) return "Doctor Profile";
  return /^Dr\.?\s/i.test(trimmed) ? trimmed : `Dr. ${trimmed}`;
}
