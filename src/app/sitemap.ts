import type { MetadataRoute } from "next";
import { SITE_CONFIG, BIHAR_DISTRICTS, HEALTHCARE_SPECIALTIES } from "@/lib/seo/metadata";
import prisma from "@/lib/db/prisma";

const BASE = SITE_CONFIG.baseUrl;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date();

  // ── Fetch Dynamic DB Content ──────────────────────────────────
  let dbDoctors: any[] = [];
  let dbHospitals: any[] = [];
  try {
    const [doctorsRes, hospitalsRes] = await Promise.all([
      // Slug-first: select slug for SEO-primary URLs; fallback to id
      prisma.doctor.findMany({
        where: { verificationStatus: "VERIFIED" },
        select: { id: true, slug: true, updatedAt: true },
      }),
      prisma.hospital.findMany({
        where: { verificationStatus: "VERIFIED" },
        select: { slug: true, updatedAt: true },
      }),
    ]);
    dbDoctors = doctorsRes;
    dbHospitals = hospitalsRes;
  } catch (err) {
    console.warn("Failed to fetch dynamic content for sitemap during build:", err);
  }

  // ── Static Core Pages ─────────────────────────────────────────
  const staticPages: MetadataRoute.Sitemap = [
    { url: BASE,                          lastModified: now, changeFrequency: "weekly",  priority: 1.0  },
    { url: `${BASE}/doctors`,             lastModified: now, changeFrequency: "daily",   priority: 0.95 },
    { url: `${BASE}/hospitals`,           lastModified: now, changeFrequency: "daily",   priority: 0.9  },
    { url: `${BASE}/districts`,           lastModified: now, changeFrequency: "weekly",  priority: 0.85 },
    { url: `${BASE}/blog`,                lastModified: now, changeFrequency: "daily",   priority: 0.8  },
    { url: `${BASE}/about`,               lastModified: now, changeFrequency: "monthly", priority: 0.6  },
    { url: `${BASE}/partners`,            lastModified: now, changeFrequency: "monthly", priority: 0.6  },
    { url: `${BASE}/privacy`,             lastModified: now, changeFrequency: "yearly",  priority: 0.3  },
    { url: `${BASE}/terms`,               lastModified: now, changeFrequency: "yearly",  priority: 0.3  },
    { url: `${BASE}/security`,            lastModified: now, changeFrequency: "yearly",  priority: 0.3  },
  ];

  // ── All 38 Bihar District Discovery Pages ────────────────────
  const districtPages: MetadataRoute.Sitemap = BIHAR_DISTRICTS.map((district) => ({
    url: `${BASE}/districts/${district.toLowerCase().replace(/\s+/g, "-")}`,
    lastModified: now,
    changeFrequency: "weekly" as const,
    priority: 0.85,
  }));

  // ── Doctor Profile Pages (Slug-First, SEO-Primary) ────────────
  // Using human-readable slug URLs ensures Google indexes them
  // with semantic meaning. UUIDs at /doctors/{id} redirect → 308.
  // The /d/{shortCode} QR routes are intentionally excluded from
  // the sitemap — they exist as resolvers, not indexable content.
  const doctorPages: MetadataRoute.Sitemap = dbDoctors.map((doc) => ({
    url: `${BASE}/doctors/${doc.slug ?? doc.id}`,
    lastModified: doc.updatedAt,
    changeFrequency: "weekly" as const,    // availability + OPD hours update weekly
    priority: 0.85,
  }));

  // ── Hospital Pages ───────────────────────────────────────────
  const hospitalPages: MetadataRoute.Sitemap = dbHospitals.map((hosp) => ({
    url: `${BASE}/hospitals/${hosp.slug}`,
    lastModified: hosp.updatedAt,
    changeFrequency: "monthly" as const,
    priority: 0.8,
  }));

  // ── Specialty Search Pages (SEO landing pages) ────────────────
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
