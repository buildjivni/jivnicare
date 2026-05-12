import type { MetadataRoute } from "next";
import { SITE_CONFIG, BIHAR_DISTRICTS, HEALTHCARE_SPECIALTIES } from "@/lib/seo/metadata";
import { DOCTORS } from "@/data/mock-data";

const BASE = SITE_CONFIG.baseUrl;

// Hospital slugs — in production, fetch from: GET /api/seo/sitemap-data
const HOSPITAL_SLUGS = ["h1"];

// Doctor slugs — from mock data; in production pull from backend
const DOCTOR_IDS = DOCTORS.map((d) => d.id);

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date();

  // ── Static Pages ──────────────────────────────────────────
  const staticPages: MetadataRoute.Sitemap = [
    {
      url: BASE,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 1.0,
    },
    {
      url: `${BASE}/doctors`,
      lastModified: now,
      changeFrequency: "daily",
      priority: 0.95,
    },
    {
      url: `${BASE}/hospitals`,
      lastModified: now,
      changeFrequency: "daily",
      priority: 0.9,
    },
    {
      url: `${BASE}/districts`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.85,
    },
  ];

  // ── District Pages (all 38 Bihar districts) ───────────────
  const districtPages: MetadataRoute.Sitemap = BIHAR_DISTRICTS.map((district) => ({
    url: `${BASE}/districts/${district.toLowerCase().replace(/\s+/g, "-")}`,
    lastModified: now,
    changeFrequency: "weekly" as const,
    priority: 0.85,
  }));

  // ── Doctor Pages ──────────────────────────────────────────
  const doctorPages: MetadataRoute.Sitemap = DOCTOR_IDS.map((id) => ({
    url: `${BASE}/doctors/${id}`,
    lastModified: now,
    changeFrequency: "monthly" as const,
    priority: 0.8,
  }));

  // ── Hospital Pages ────────────────────────────────────────
  const hospitalPages: MetadataRoute.Sitemap = HOSPITAL_SLUGS.map((id) => ({
    url: `${BASE}/hospitals/${id}`,
    lastModified: now,
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

  // ── Specialty × District Combinations (Top-value long-tail) ──
  const PRIORITY_DISTRICTS = ["Patna", "Gaya", "Muzaffarpur", "Darbhanga", "Bhagalpur"];
  const combinationPages: MetadataRoute.Sitemap = HEALTHCARE_SPECIALTIES.flatMap((s) =>
    PRIORITY_DISTRICTS.map((d) => ({
      // Use %26 to safely separate params in XML sitemap
      url: `${BASE}/doctors?specialty=${encodeURIComponent(s)}%26district=${encodeURIComponent(d)}`,
      lastModified: now,
      changeFrequency: "monthly" as const,
      priority: 0.65,
    }))
  );

  return [
    ...staticPages,
    ...districtPages,
    ...doctorPages,
    ...hospitalPages,
    ...specialtyPages,
    ...combinationPages,
  ];
}
