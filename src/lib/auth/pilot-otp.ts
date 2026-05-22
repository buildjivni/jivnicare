/**
 * Temporary pilot OTP mode — whitelist + fixed OTP, no Firebase SMS.
 * Set PILOT_OTP_MODE=true and ALLOWED_TEST_NUMBERS to enable.
 * Restore Firebase later by disabling PILOT_OTP_MODE.
 */

import { normalizeIndianPhone } from "@/lib/firebase/admin";

export const PILOT_TEST_OTP = "123456";

export function isPilotOtpMode(): boolean {
  return process.env.PILOT_OTP_MODE === "true";
}

/** Server + build: pilot mode is fully configured. */
export function isPilotOtpModeActive(): boolean {
  return isPilotOtpMode() && getAllowedTestNumbers().length > 0;
}

/** Client flag (must match server intent at build time). */
export function getAllowedTestNumbers(): string[] {
  const raw = process.env.ALLOWED_TEST_NUMBERS ?? "";
  return raw
    .split(/[,;\s]+/)
    .map((s) => s.replace(/\D/g, "").slice(-10))
    .filter((s) => s.length === 10);
}

export function normalizePhone10(input: string): string {
  return normalizeIndianPhone(input);
}

export function isPhoneWhitelisted(phone10: string): boolean {
  return getAllowedTestNumbers().includes(phone10);
}

export function getPilotSessionMaxAgeSec(): number {
  const days = parseInt(process.env.PILOT_SESSION_DAYS ?? "7", 10);
  const safe = Number.isFinite(days) && days > 0 && days <= 30 ? days : 7;
  return safe * 24 * 60 * 60;
}
