import { redirect } from "next/navigation";
import { notFound } from "next/navigation";
import prisma from "@/lib/prisma";

interface PageProps {
  params: Promise<{ shortCode: string }>;
}

/**
 * QR Deep-Link Redirect Route
 * ─────────────────────────────────────────────────────────────────
 * Route:   /d/[shortCode]
 * Purpose: Resolve a 6-char QR shortCode to the canonical doctor
 *          profile slug URL and issue a permanent 308 redirect.
 *
 * Use cases:
 *   - Clinic reception QR codes  →  /d/DBG4K2
 *   - Patient WhatsApp deep links →  /d/DBG4K2
 *   - Printed prescription cards  →  /d/DBG4K2
 *   - SMS booking confirmations   →  /d/DBG4K2
 *
 * Resolution order:
 *   1. Find doctor by exact shortCode match (case-insensitive)
 *   2. Redirect to /doctors/{slug} with 308 Permanent
 *   3. If not found → 404
 *
 * SEO Note:
 *   This route is intentionally excluded from sitemap and robots
 *   (it exists solely as a deep-link resolver, not an indexable page).
 */

// Validate shortCode format: 5–7 alphanumeric uppercase chars
const SHORT_CODE_REGEX = /^[A-Z0-9]{5,7}$/i;

export default async function QRRedirectPage({ params }: PageProps) {
  const { shortCode } = await params;

  // Guard: reject clearly malformed inputs immediately
  if (!SHORT_CODE_REGEX.test(shortCode)) {
    notFound();
  }

  // Resolve shortCode → doctor slug (case-insensitive lookup)
  const doctor = await prisma.doctor.findUnique({
    where: { shortCode: shortCode.toUpperCase() },
    select: { slug: true, verificationStatus: true },
  });

  // Not found or not a verified doctor
  if (!doctor || !doctor.slug) {
    notFound();
  }

  // 308 Permanent Redirect → canonical SEO profile URL
  redirect(`/doctors/${doctor.slug}`);
}

/**
 * Generate static params for verified doctors with shortCodes.
 * This pre-renders the redirect at build time for instant response.
 */
export async function generateStaticParams() {
  try {
    const doctors = await prisma.doctor.findMany({
      where: {
        verificationStatus: "VERIFIED",
        shortCode: { not: null },
      },
      select: { shortCode: true },
    });
    return doctors
      .filter((d): d is { shortCode: string } => d.shortCode !== null)
      .map(d => ({ shortCode: d.shortCode }));
  } catch {
    return [];
  }
}
