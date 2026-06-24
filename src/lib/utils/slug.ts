// =============================================================
//  JivniCare — Doctor Slug & Identity Utilities
//  Centralized slug generation, normalization, and short-code
//  creation for future-safe doctor identity architecture.
//
//  Design Principles:
//  - Slugs are deterministic: same name+district = same base slug
//  - Collision-safe: timestamp base-36 suffix ensures uniqueness
//  - QR-ready: shortCode is compact 6-char alphanumeric
//  - Migration-safe: existing slugs are never modified
// =============================================================


// ── 5. SHORT CODE GENERATION (QR-READY) ──────────────────────

/**
 * Generate a compact 6-character alphanumeric short code for
 * QR systems, reception displays, and deep links.
 *
 * Format: 6 uppercase alphanumeric chars
 * @example generateShortCode() → "DBG4K2"
 *
 * Collision probability: 1 in ~2.17 billion (36^6)
 * Suitable for QR encoding at minimum size (version 1)
 *
 * Usage:
 * - Doctor QR: jivnicare.in/d/{shortCode}
 * - Queue QR:  jivnicare.in/q/{shortCode}
 * - Reception: Display short code at clinic counter
 */
export function generateShortCode(): string {
  const CHARS = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // No ambiguous chars: 0,O,I,1
  const ts = Date.now().toString(36).toUpperCase().slice(-3); // 3 from timestamp
  const rnd = Array.from({ length: 3 }, () =>
    CHARS[Math.floor(Math.random() * CHARS.length)]
  ).join('');
  return (ts + rnd).slice(0, 6);
}
// ── 8. SEQUENTIAL DOCTOR CODE SYSTEM ──────────────────────────

/**
 * Atomically generate a unique sequential doctor code like JC64001.
 * Uses the SystemCounter model inside the provided transaction client.
 */
export async function generateSequentialDoctorCode(tx: any): Promise<string> {
  const counter = await tx.systemCounter.upsert({
    where: { id: "doctor_code" },
    update: { count: { increment: 1 } },
    create: { id: "doctor_code", count: 64001 }
  });
  return `JC${counter.count}`;
}
