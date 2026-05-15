import type { MetadataRoute } from "next";
import { SITE_CONFIG, BIHAR_DISTRICTS, HEALTHCARE_SPECIALTIES } from "@/lib/seo/metadata";
import prisma from "@/lib/prisma";

const BASE = SITE_CONFIG.baseUrl;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date();

  // 1. Fetch Dynamic Content from DB
  const [dbDoctors, dbHospitals] = await Promise.all([
    prisma.doctor.findMany({
      where: { verificationStatus: "VERIFIED" },
      select: { id: true, updatedAt: true }
    }),
    prisma.hospital.findMany({
      where: { verificationStatus: "VERIFIED" },
      select: { slug: true, updatedAt: true }
    })
  ]);

  // ── Static Pages ──────────────────────────────────────────
  const staticPages: MetadataRoute.Sitemap = [
    { url: BASE, lastModified: now, changeFrequency: "weekly", priority: 1.0 },
    { url: `${BASE}/doctors`, lastModified: now, changeFrequency: "daily", priority: 0.95 },
    { url: `${BASE}/hospitals`, lastModified: now, changeFrequency: "daily", priority: 0.9 },
    { url: `${BASE}/districts`, lastModified: now, changeFrequency: "weekly", priority: 0.85 },
  ];

  // ── District Pages (all 38 Bihar districts) ───────────────
  const districtPages: MetadataRoute.Sitemap = BIHAR_DISTRICTS.map((district) => ({
    url: `${BASE}/districts/${district.toLowerCase().replace(/\s+/g, "-")}`,
    lastModified: now,
    changeFrequency: "weekly" as const,
    priority: 0.85,
  }));

  // ── Doctor Pages (Dynamic) ────────────────────────────────
  const doctorPages: MetadataRoute.Sitemap = dbDoctors.map((doc) => ({
    url: `${BASE}/doctors/${doc.id}`,
    lastModified: doc.updatedAt,
    changeFrequency: "monthly" as const,
    priority: 0.8,
  }));

  // ── Hospital Pages (Dynamic) ──────────────────────────────
  const hospitalPages: MetadataRoute.Sitemap = dbHospitals.map((hosp) => ({
    url: `${BASE}/hospitals/${hosp.slug}`,
    lastModified: hosp.updatedAt,
    changeFrequency: "monthly" as const,
    priority: 0.8,
  }));

  // ── Specialty Search Pages ────────────────────────────────
  const specialtyPages: MetadataRoute.Sitemap = HEALTHCARE_SPECIALTIES.map((s) => ({
    url: `${BASE}/doctors?specialty=${encodeURIComponent(s)}`,
    lastModified: now,
    changeFrequency: "weekly" as const,
    priority: 0.7,
  }));

  return [
    ...staticPages,
    ...districtPages,
    ...doctorPages,
    ...hospitalPages,
    ...specialtyPages,
  ];
}
