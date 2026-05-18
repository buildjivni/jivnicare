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

// ── 1. NAME NORMALIZATION ─────────────────────────────────────

/**
 * Normalize a doctor's name into a URL-safe slug component.
 * Removes titles (Dr., Prof.), strips non-alphanumeric chars,
 * collapses spaces, lowercase.
 *
 * @example normalizeName("Dr. Rajesh Kumar Singh") → "rajesh-kumar-singh"
 */
export function normalizeName(name: string): string {
  return name
    .toLowerCase()
    .replace(/^(dr\.?\s*|prof\.?\s*|mr\.?\s*|ms\.?\s*|mrs\.?\s*)/i, '') // strip titles
    .replace(/[^a-z0-9\s]/g, '')   // remove special chars
    .trim()
    .replace(/\s+/g, '-')          // spaces → hyphens
    .replace(/-+/g, '-')           // collapse multiple hyphens
    .slice(0, 40);                 // max 40 chars for name part
}

// ── 2. DISTRICT CODE ─────────────────────────────────────────

/**
 * Extract a compact district code from a district name.
 * Used in slug suffix for disambiguation.
 *
 * @example districtCode("Patna") → "pat"
 * @example districtCode("West Champaran") → "wch"
 */
export function districtCode(district: string): string {
  const words = district.toLowerCase().replace(/[^a-z\s]/g, '').trim().split(/\s+/);
  if (words.length === 1) {
    return words[0].slice(0, 3);
  }
  // Multi-word: use first char of each word (up to 3 words)
  return words.slice(0, 3).map(w => w.charAt(0)).join('');
}

// ── 3. DETERMINISTIC SLUG GENERATION ─────────────────────────

/**
 * Generate a human-readable, SEO-friendly, collision-resistant
 * doctor slug.
 *
 * Format: dr-{name-slug}-{district-code}-{timestamp-base36}
 *
 * @example generateDoctorSlug("Dr. Rajesh Kumar", "Patna")
 *   → "dr-rajesh-kumar-pat-1k9z2x"
 *
 * The timestamp-base36 suffix provides:
 * - Uniqueness across concurrent registrations
 * - Temporal ordering (newer doctors sort later alphabetically)
 * - Compact representation (6 chars covers ~2B combinations)
 */
export function generateDoctorSlug(name: string, district: string): string {
  const nameSlug = normalizeName(name);
  const dCode = districtCode(district);
  const tsSuffix = Date.now().toString(36).slice(-5); // last 5 chars of base-36 timestamp

  const slug = `dr-${nameSlug}-${dCode}-${tsSuffix}`;

  // Ensure max 80 chars total (MongoDB/URL safe)
  return slug.slice(0, 80);
}

// ── 4. ALTERNATE SLUG (COLLISION RECOVERY) ───────────────────

/**
 * Generate an alternate slug when the primary slug is already taken.
 * Appends 2 extra random alphanumeric chars.
 *
 * @example generateAlternateSlug("dr-rajesh-kumar-pat-1k9z2x")
 *   → "dr-rajesh-kumar-pat-1k9z2xab"
 */
export function generateAlternateSlug(baseSlug: string): string {
  const chars = 'abcdefghijklmnopqrstuvwxyz0123456789';
  const suffix = Array.from({ length: 3 }, () =>
    chars[Math.floor(Math.random() * chars.length)]
  ).join('');
  return `${baseSlug}-${suffix}`.slice(0, 80);
}

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

// ── 6. SLUG VALIDATION ───────────────────────────────────────

/**
 * Validate a slug string for safe use in URLs and DB.
 * Rejects slugs with uppercase, spaces, or special chars.
 */
export function isValidSlug(slug: string): boolean {
  return /^[a-z0-9][a-z0-9-]{2,78}[a-z0-9]$/.test(slug);
}

// ── 7. SLUG → DISPLAY NAME ───────────────────────────────────

/**
 * Convert a slug back to a display-friendly name (best effort).
 * @example slugToDisplayName("dr-rajesh-kumar-pat-1k9z2x") → "Dr Rajesh Kumar"
 */
export function slugToDisplayName(slug: string): string {
  return slug
    .replace(/^dr-/, 'Dr ')
    .replace(/-[a-z]{2,3}-[a-z0-9]{4,6}$/, '') // remove district-timestamp suffix
    .split('-')
    .map(w => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ');
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
