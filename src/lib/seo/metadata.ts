// ============================================================
// JivniCare SEO Utilities — Centralized metadata generation
// Single source of truth for all page metadata across the app
// ============================================================

export const SITE_CONFIG = {
  name: "JivniCare",
  tagline: "Care, On Your Time",
  baseUrl: process.env.NEXT_PUBLIC_SITE_URL || "https://www.jinnicare.com",
  description:
    "Book top doctors and hospitals in Bihar instantly. Verified specialists in Patna, Gaya, Darbhanga and across Bihar. Same-day appointments available.",
  locale: "en_IN",
  twitterHandle: "@JivniCare",
  ogImage: "/og-default.jpg",
  themeColor: "#205E98",
};

export const BIHAR_DISTRICTS = [
  "Patna", "Gaya", "Muzaffarpur", "Bhagalpur", "Darbhanga",
  "Purnia", "Araria", "Arwal", "Aurangabad", "Banka",
  "Begusarai", "Bhabua", "Bhojpur", "Buxar", "Gopalganj",
  "Jamui", "Jehanabad", "Kaimur", "Katihar", "Khagaria",
  "Kishanganj", "Lakhisarai", "Madhepura", "Madhubani",
  "Munger", "Nalanda", "Nawada", "Rohtas", "Saharsa",
  "Samastipur", "Saran", "Sheikhpura", "Sheohar", "Sitamarhi",
  "Siwan", "Supaul", "Vaishali", "West Champaran", "East Champaran",
];

export const HEALTHCARE_SPECIALTIES = [
  "Cardiologist", "Dermatologist", "Pediatrician", "Neurologist",
  "General Physician", "Orthopedist", "Gynecologist", "Dentist",
  "Ophthalmologist", "Psychiatrist", "Diabetologist", "ENT Specialist",
  "Urologist", "Gastroenterologist", "Oncologist", "Pulmonologist",
];

// ── Doctor Metadata ─────────────────────────────────────────
export function generateDoctorMetadata(doctor: {
  name: string;
  specialty: string;
  location: string;
  clinic?: string;
  rating?: number;
  reviews?: number;
  experience?: string;
  about?: string;
  image?: string;
  id: string;
}) {
  const district = extractDistrict(doctor.location);
  const title = `${doctor.name} — ${doctor.specialty} in ${district} | JivniCare`;
  const description = doctor.about
    ? `${doctor.about.slice(0, 140)}. Book appointment with ${doctor.name} on JivniCare.`
    : `Book an appointment with ${doctor.name}, ${doctor.specialty} in ${district}, Bihar. ${
        doctor.experience ? `${doctor.experience} experience.` : ""
      } Rated ${doctor.rating ?? "4.5"}⭐ by ${doctor.reviews ?? "patients"} patients.`;

  return {
    title,
    description,
    keywords: [
      `${doctor.specialty} in ${district}`,
      `${doctor.specialty} in Bihar`,
      `best ${doctor.specialty} ${district}`,
      doctor.name,
      `${doctor.name} doctor`,
      `book ${doctor.specialty}`,
      `${district} doctor`,
      "JivniCare",
    ].join(", "),
    openGraph: {
      title,
      description,
      type: "profile" as const,
      url: `${SITE_CONFIG.baseUrl}/doctors/${doctor.id}`,
      siteName: SITE_CONFIG.name,
      locale: SITE_CONFIG.locale,
      images: [
        {
          url: doctor.image || `${SITE_CONFIG.baseUrl}${SITE_CONFIG.ogImage}`,
          width: 400,
          height: 400,
          alt: `${doctor.name} — ${doctor.specialty}`,
        },
      ],
    },
    twitter: {
      card: "summary_large_image" as const,
      title,
      description,
      images: [doctor.image || `${SITE_CONFIG.baseUrl}${SITE_CONFIG.ogImage}`],
    },
    alternates: {
      canonical: `${SITE_CONFIG.baseUrl}/doctors/${doctor.id}`,
    },
  };
}

// ── Hospital Metadata ────────────────────────────────────────
export function generateHospitalMetadata(hospital: {
  name: string;
  type?: string;
  district: string;
  departments?: string[];
  emergency?: boolean;
  rating?: number;
  reviews?: number;
  about?: string;
  image?: string;
  id: string;
}) {
  const emergencyLabel = hospital.emergency ? "24/7 Emergency | " : "";
  const deptLabel = hospital.departments?.slice(0, 3).join(", ") ?? "";
  const title = `${hospital.name} — ${hospital.district}, Bihar | JivniCare`;
  const description = hospital.about
    ? `${hospital.about.slice(0, 140)}. Book appointments via JivniCare.`
    : `${emergencyLabel}${hospital.name} in ${hospital.district}, Bihar. ${hospital.type ?? "Hospital"} with ${deptLabel} and more. Rated ${hospital.rating ?? "4.5"}⭐.`;

  return {
    title,
    description,
    keywords: [
      `${hospital.type ?? "hospital"} in ${hospital.district}`,
      `best hospital in ${hospital.district}`,
      `${hospital.name}`,
      ...(hospital.departments?.slice(0, 4).map((d) => `${d} hospital ${hospital.district}`) ?? []),
      hospital.emergency ? `emergency hospital ${hospital.district}` : "",
      "JivniCare",
    ]
      .filter(Boolean)
      .join(", "),
    openGraph: {
      title,
      description,
      type: "website" as const,
      url: `${SITE_CONFIG.baseUrl}/hospitals/${hospital.id}`,
      siteName: SITE_CONFIG.name,
      locale: SITE_CONFIG.locale,
      images: [
        {
          url: hospital.image || `${SITE_CONFIG.baseUrl}${SITE_CONFIG.ogImage}`,
          width: 1200,
          height: 630,
          alt: `${hospital.name} — ${hospital.district}`,
        },
      ],
    },
    twitter: {
      card: "summary_large_image" as const,
      title,
      description,
      images: [hospital.image || `${SITE_CONFIG.baseUrl}${SITE_CONFIG.ogImage}`],
    },
    alternates: {
      canonical: `${SITE_CONFIG.baseUrl}/hospitals/${hospital.id}`,
    },
  };
}

// ── District Metadata ────────────────────────────────────────
export function generateDistrictMetadata(district: string) {
  const districtFormatted = capitalizeDistrict(district);
  const title = `Doctors & Hospitals in ${districtFormatted}, Bihar | JivniCare`;
  const description = `Find verified doctors, hospitals, and emergency services in ${districtFormatted}, Bihar. Book same-day appointments with top specialists on JivniCare.`;

  return {
    title,
    description,
    keywords: [
      `doctors in ${districtFormatted}`,
      `hospitals in ${districtFormatted}`,
      `best doctor ${districtFormatted} Bihar`,
      `healthcare ${districtFormatted}`,
      `emergency hospital ${districtFormatted}`,
      `book doctor ${districtFormatted}`,
      `${districtFormatted} specialist`,
      "JivniCare Bihar",
    ].join(", "),
    openGraph: {
      title,
      description,
      type: "website" as const,
      url: `${SITE_CONFIG.baseUrl}/districts/${district.toLowerCase()}`,
      siteName: SITE_CONFIG.name,
      locale: SITE_CONFIG.locale,
      images: [
        {
          url: `${SITE_CONFIG.baseUrl}${SITE_CONFIG.ogImage}`,
          width: 1200,
          height: 630,
          alt: `Healthcare in ${districtFormatted}, Bihar`,
        },
      ],
    },
    twitter: {
      card: "summary_large_image" as const,
      title,
      description,
    },
    alternates: {
      canonical: `${SITE_CONFIG.baseUrl}/districts/${district.toLowerCase()}`,
    },
  };
}

// ── Search Page Metadata ─────────────────────────────────────
export function generateSearchMetadata(query?: string, district?: string) {
  const qLabel = query ? `"${query}"` : "Doctors";
  const dLabel = district ? ` in ${capitalizeDistrict(district)}` : " in Bihar";
  const title = `Search: ${qLabel}${dLabel} | JivniCare`;
  const description = `Find ${query ?? "top doctors and hospitals"}${dLabel}. Book verified healthcare specialists instantly on JivniCare.`;

  return {
    title,
    description,
    // Search pages: noindex to avoid duplicate content
    robots: { index: false, follow: true },
    alternates: {
      canonical: `${SITE_CONFIG.baseUrl}/doctors`,
    },
  };
}

// ── Helpers ──────────────────────────────────────────────────
export function extractDistrict(location: string): string {
  const parts = location.split(",").map((p) => p.trim());
  return parts[parts.length - 1] || "Bihar";
}

export function capitalizeDistrict(district: string): string {
  return district
    .split("-")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
    .join(" ");
}

export function slugToTitle(slug: string): string {
  return slug
    .split("-")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
}
