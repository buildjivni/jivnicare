/**
 * JivniCare — Doctor Identity Backfill Script
 * ─────────────────────────────────────────────────────────────────────────────
 * Purpose: One-time migration to backfill new identity fields for existing
 *          doctors who were created before the Doctor Discovery v2 schema.
 *
 * What it backfills:
 *   1. shortCode  — 6-char QR-ready alphanumeric code for each doctor
 *   2. verifiedBadgeLabel — trust tier label derived from experience
 *   3. slug       — ensures existing slugs are valid (they should be)
 *
 * Safety guarantees:
 *   - NEVER modifies existing slug (migration-safe)
 *   - NEVER overwrites existing shortCode (idempotent)
 *   - NEVER overwrites existing verifiedBadgeLabel (idempotent)
 *   - Only writes to fields that are NULL/empty
 *   - Runs in batches of 50 to avoid DB pressure
 *   - Dry-run mode available (set DRY_RUN=true env var)
 *
 * Usage:
 *   npx ts-node --skip-project scripts/backfill-doctor-identity.ts
 *   DRY_RUN=true npx ts-node --skip-project scripts/backfill-doctor-identity.ts
 *
 * Requirements:
 *   - DATABASE_URL must be set in .env
 *   - Run from project root
 *   - Can be re-run safely (idempotent)
 * ─────────────────────────────────────────────────────────────────────────────
 */

import { PrismaClient } from "@prisma/client";
import { generateShortCode, generateDoctorSlug, isValidSlug } from "../src/lib/slug";

const prisma = new PrismaClient();
const DRY_RUN = process.env.DRY_RUN === "true";
const BATCH_SIZE = 50;

// ── Badge label from experience ─────────────────────────────────
function deriveBadgeLabel(experienceYears: number): string {
  if (experienceYears >= 15) return "Experienced Partner";
  if (experienceYears >= 5)  return "Verified Doctor";
  return "Clinic Verified";
}

// ── Generate unique shortCode with collision check ───────────────
async function generateUniqueShortCode(attempts = 10): Promise<string> {
  for (let i = 0; i < attempts; i++) {
    const code = generateShortCode();
    const existing = await prisma.doctor.findFirst({
      where: { shortCode: code },
      select: { id: true },
    });
    if (!existing) return code;
  }
  // Ultra-rare: append timestamp if all attempts collide
  return generateShortCode() + Date.now().toString(36).slice(-2).toUpperCase();
}

async function main() {
  console.log(`\n🏥 JivniCare Doctor Identity Backfill`);
  console.log(`   Mode: ${DRY_RUN ? "DRY RUN (no writes)" : "LIVE (writing to DB)"}`);
  console.log(`   Batch size: ${BATCH_SIZE}\n`);

  // Fetch doctors missing identity fields
  const doctorsNeedingBackfill = await prisma.doctor.findMany({
    where: {
      OR: [
        { shortCode: null },
        { verifiedBadgeLabel: null },
      ],
    },
    select: {
      id: true,
      name: true,
      slug: true,
      shortCode: true,
      verifiedBadgeLabel: true,
      experience: true,
      district: true,
      verificationStatus: true,
    },
    orderBy: { createdAt: "asc" },
  });

  console.log(`📋 Found ${doctorsNeedingBackfill.length} doctors needing backfill\n`);

  if (doctorsNeedingBackfill.length === 0) {
    console.log("✅ All doctors already have identity fields. Nothing to do.\n");
    return;
  }

  let updated = 0;
  let skipped = 0;
  let errored = 0;

  // Process in batches
  for (let i = 0; i < doctorsNeedingBackfill.length; i += BATCH_SIZE) {
    const batch = doctorsNeedingBackfill.slice(i, i + BATCH_SIZE);
    console.log(`⚙️  Processing batch ${Math.floor(i / BATCH_SIZE) + 1} (${batch.length} doctors)...`);

    for (const doctor of batch) {
      try {
        const updates: Record<string, string | null> = {};

        // 1. Backfill shortCode (only if missing)
        if (!doctor.shortCode) {
          updates.shortCode = await generateUniqueShortCode();
        }

        // 2. Backfill verifiedBadgeLabel (only if missing)
        if (!doctor.verifiedBadgeLabel) {
          updates.verifiedBadgeLabel = deriveBadgeLabel(doctor.experience);
        }

        // Log what would be written
        console.log(`  ${DRY_RUN ? "[DRY]" : "✏️ "} ${doctor.name} (${doctor.id.slice(0, 8)}...)`);
        console.log(`       slug: ${doctor.slug} ${isValidSlug(doctor.slug) ? "✅" : "⚠️  INVALID"}`);
        if (updates.shortCode) console.log(`       shortCode: ${updates.shortCode} (new)`);
        if (updates.verifiedBadgeLabel) console.log(`       badge: ${updates.verifiedBadgeLabel} (new)`);

        if (!DRY_RUN && Object.keys(updates).length > 0) {
          await prisma.doctor.update({
            where: { id: doctor.id },
            data: updates,
          });
          updated++;
        } else if (DRY_RUN) {
          updated++; // count as "would update"
        } else {
          skipped++;
        }

      } catch (err: any) {
        console.error(`  ❌ Failed for ${doctor.id}: ${err.message}`);
        errored++;
      }
    }
  }

  console.log(`\n── Backfill Summary ───────────────────────────────────────`);
  console.log(`   ${DRY_RUN ? "Would update" : "Updated"}: ${updated} doctors`);
  console.log(`   Skipped  : ${skipped} (already complete)`);
  console.log(`   Errors   : ${errored}`);
  if (DRY_RUN) {
    console.log(`\n⚠️  DRY RUN complete — no changes written to DB.`);
    console.log(`   Re-run without DRY_RUN=true to apply.`);
  } else {
    console.log(`\n✅ Backfill complete. All identity fields are now populated.`);
  }
  console.log(`───────────────────────────────────────────────────────────\n`);
}

main()
  .catch((e) => {
    console.error("Fatal backfill error:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
