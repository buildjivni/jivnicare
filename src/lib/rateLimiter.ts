// src/lib/rateLimiter.ts
/**
 * Simple in‑memory rate limiting utilities for OTP, bookings and generic IP throttling.
 * No external dependencies – suitable for low‑end Android & lightweight deployment.
 */

type Timestamp = number;

// Helper to get the current time in ms
const now = () => Date.now();

/** OTP send limits per phone and per IP (per hour) */
interface OtpSendEntry {
  count: number;
  resetAt: Timestamp; // when the hour window expires
  lastSent: Timestamp; // timestamp of last successful send (for cooldown)
}

/** OTP verify limits per session */
interface OtpVerifyEntry {
  attempts: number;
  locked: boolean;
  expiresAt: Timestamp; // session expiry (10 min)
}

/** Booking limits per user (per hour) */
interface BookingUserEntry {
  count: number;
  resetAt: Timestamp;
}

/** Generic IP request counters (per minute) */
interface IpEntry {
  count: number;
  resetAt: Timestamp;
}

// In‑memory stores – will be cleared on server restart (acceptable for MVP).
const otpSendPhoneMap = new Map<string, OtpSendEntry>();
const otpSendIpMap = new Map<string, IpEntry>();
const otpVerifyMap = new Map<string, OtpVerifyEntry>();
const bookingUserMap = new Map<string, BookingUserEntry>();
const bookingIpMap = new Map<string, IpEntry>();

// Cleanup intervals (optional but helpful)
setInterval(() => {
  const t = now();
  for (const [k, v] of otpSendPhoneMap.entries()) if (v.resetAt <= t) otpSendPhoneMap.delete(k);
  for (const [k, v] of otpSendIpMap.entries()) if (v.resetAt <= t) otpSendIpMap.delete(k);
  for (const [k, v] of otpVerifyMap.entries()) if (v.expiresAt <= t) otpVerifyMap.delete(k);
  for (const [k, v] of bookingUserMap.entries()) if (v.resetAt <= t) bookingUserMap.delete(k);
  for (const [k, v] of bookingIpMap.entries()) if (v.resetAt <= t) bookingIpMap.delete(k);
}, 60_000);

/** OTP send limiter */
export function canSendOtp({ phone, ip }: { phone: string; ip: string }) {
  const hour = 60 * 60 * 1000;
  // per phone
  const phoneKey = phone;
  let phoneEntry = otpSendPhoneMap.get(phoneKey);
  if (!phoneEntry) {
    phoneEntry = { count: 0, resetAt: now() + hour, lastSent: 0 };
    otpSendPhoneMap.set(phoneKey, phoneEntry);
  }
  // per IP (hourly)
  const ipKey = ip;
  let ipEntry = otpSendIpMap.get(ipKey);
  if (!ipEntry) {
    ipEntry = { count: 0, resetAt: now() + hour };
    otpSendIpMap.set(ipKey, ipEntry);
  }

  // Check cooldown (30 s)
  if (now() - phoneEntry.lastSent < 30_000) {
    return { allowed: false, reason: 'cooldown' };
  }

  if (phoneEntry.count >= 5 || ipEntry.count >= 5) {
    return { allowed: false, reason: 'limit' };
  }

  // Update counters
  phoneEntry.count++;
  phoneEntry.lastSent = now();
  ipEntry.count++;
  return { allowed: true };
}

/** OTP verify limiter */
export function canVerifyOtp(sessionId: string) {
  const tenMin = 10 * 60 * 1000;
  let entry = otpVerifyMap.get(sessionId);
  const current = now();
  if (!entry) {
    entry = { attempts: 0, locked: false, expiresAt: current + tenMin };
    otpVerifyMap.set(sessionId, entry);
  }
  if (entry.locked || current > entry.expiresAt) {
    return { allowed: false, reason: 'locked' };
  }
  if (entry.attempts >= 5) {
    entry.locked = true;
    return { allowed: false, reason: 'attempts' };
  }
  // Caller should increment attempts after a failed verify.
  return { allowed: true, entry };
}

export function recordOtpVerifyAttempt(sessionId: string, success: boolean) {
  const entry = otpVerifyMap.get(sessionId);
  if (!entry) return;
  if (!success) {
    entry.attempts++;
    if (entry.attempts >= 5) entry.locked = true;
  } else {
    // Successful verification clears the entry.
    otpVerifyMap.delete(sessionId);
  }
}

/** Booking limiter per user */
export function canCreateBooking({ userId }: { userId: string }) {
  const hour = 60 * 60 * 1000;
  let entry = bookingUserMap.get(userId);
  const current = now();
  if (!entry) {
    entry = { count: 0, resetAt: current + hour };
    bookingUserMap.set(userId, entry);
  }
  if (entry.count >= 5) {
    return { allowed: false, reason: 'limit' };
  }
  entry.count++;
  return { allowed: true };
}

/** IP booking limiter (per minute) */
export function canBookFromIp({ ip }: { ip: string }) {
  const minute = 60 * 1000;
  let entry = bookingIpMap.get(ip);
  const current = now();
  if (!entry) {
    entry = { count: 0, resetAt: current + minute };
    bookingIpMap.set(ip, entry);
  }
  if (entry.count >= 15) {
    return { allowed: false, reason: 'ip_limit' };
  }
  entry.count++;
  return { allowed: true };
}

/** Helper to reset OTP verify entry after a successful verification */
export function clearOtpSession(sessionId: string) {
  otpVerifyMap.delete(sessionId);
}
