// ============================================================
// JivniCare JSON-LD Structured Data Generators
// Schema.org healthcare types for Google rich results
// ============================================================

import { SITE_CONFIG } from "./metadata";

// ── Organization Schema ──────────────────────────────────────
export function organizationSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: SITE_CONFIG.name,
    url: SITE_CONFIG.baseUrl,
    logo: `${SITE_CONFIG.baseUrl}/brand/primary-logo.svg`,
    description: SITE_CONFIG.description,
    contactPoint: {
      "@type": "ContactPoint",
      contactType: "customer support",
      availableLanguage: ["Hindi", "English"],
    },
    sameAs: [],
    areaServed: {
      "@type": "State",
      name: "Bihar",
      addressCountry: "IN",
    },
  };
}

// ── Website + Sitelinks Searchbox Schema ─────────────────────
export function websiteSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: SITE_CONFIG.name,
    url: SITE_CONFIG.baseUrl,
    description: SITE_CONFIG.description,
    potentialAction: {
      "@type": "SearchAction",
      target: {
        "@type": "EntryPoint",
        urlTemplate: `${SITE_CONFIG.baseUrl}/doctors?query={search_term_string}`,
      },
      "query-input": "required name=search_term_string",
    },
    publisher: {
      "@type": "Organization",
      name: SITE_CONFIG.name,
      logo: {
        "@type": "ImageObject",
        url: `${SITE_CONFIG.baseUrl}/logo.png`,
      },
    },
  };
}

// ── Physician (Doctor) Schema ─────────────────────────────────
export function physicianSchema(doctor: {
  name: string;
  specialty: string;
  location: string;
  clinic?: string;
  rating?: number;
  reviews?: number;
  experience?: string;
  education?: string;
  image?: string;
  id: string;
}) {
  const district = doctor.location.split(",").pop()?.trim() || "Bihar";

  return {
    "@context": "https://schema.org",
    "@type": "Physician",
    name: doctor.name,
    url: `${SITE_CONFIG.baseUrl}/doctors/${doctor.id}`,
    image: doctor.image,
    description: `${doctor.specialty} in ${district}, Bihar. ${doctor.experience ? `${doctor.experience} experience.` : ""}`,
    medicalSpecialty: doctor.specialty,
    hasCredential: doctor.education
      ? {
          "@type": "EducationalOccupationalCredential",
          credentialCategory: "degree",
          name: doctor.education,
        }
      : undefined,
    aggregateRating: doctor.rating
      ? {
          "@type": "AggregateRating",
          ratingValue: doctor.rating,
          reviewCount: doctor.reviews ?? 10,
          bestRating: 5,
          worstRating: 1,
        }
      : undefined,
    worksFor: doctor.clinic
      ? {
          "@type": "MedicalOrganization",
          name: doctor.clinic,
        }
      : undefined,
    address: {
      "@type": "PostalAddress",
      streetAddress: doctor.location,
      addressRegion: "Bihar",
      addressCountry: "IN",
    },
    availableService: {
      "@type": "MedicalProcedure",
      name: `${doctor.specialty} Consultation`,
    },
  };
}

// ── Hospital Schema ──────────────────────────────────────────
export function hospitalSchema(hospital: {
  name: string;
  type?: string;
  district: string;
  location: string;
  departments?: string[];
  emergency?: boolean;
  rating?: number;
  reviews?: number;
  beds?: number;
  phone?: string;
  image?: string;
  about?: string;
  id: string;
}) {
  return {
    "@context": "https://schema.org",
    "@type": "Hospital",
    name: hospital.name,
    url: `${SITE_CONFIG.baseUrl}/hospitals/${hospital.id}`,
    image: hospital.image,
    description: hospital.about,
    telephone: hospital.phone,
    medicalSpecialty: hospital.departments ?? [],
    hasEmergencyService: hospital.emergency ?? false,
    numberOfBeds: hospital.beds,
    aggregateRating: hospital.rating
      ? {
          "@type": "AggregateRating",
          ratingValue: hospital.rating,
          reviewCount: hospital.reviews ?? 10,
          bestRating: 5,
          worstRating: 1,
        }
      : undefined,
    address: {
      "@type": "PostalAddress",
      streetAddress: hospital.location,
      addressLocality: hospital.district,
      addressRegion: "Bihar",
      addressCountry: "IN",
    },
    openingHours: "Mo-Sa 08:00-20:00",
    ...(hospital.emergency ? { openingHoursSpecification: { "@type": "OpeningHoursSpecification", opens: "00:00", closes: "23:59", dayOfWeek: ["Monday","Tuesday","Wednesday","Thursday","Friday","Saturday","Sunday"] } } : {}),
  };
}

// ── Breadcrumb Schema ────────────────────────────────────────
export function breadcrumbSchema(
  items: { name: string; url: string }[]
) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: item.url,
    })),
  };
}

// ── District / Local Business Area Schema ────────────────────
export function districtHealthcareSchema(district: string) {
  const districtFormatted =
    district.charAt(0).toUpperCase() + district.slice(1).toLowerCase();

  return {
    "@context": "https://schema.org",
    "@type": "WebPage",
    name: `Healthcare in ${districtFormatted}, Bihar`,
    url: `${SITE_CONFIG.baseUrl}/districts/${district.toLowerCase()}`,
    description: `Find verified doctors, hospitals, and healthcare services in ${districtFormatted}, Bihar via JivniCare.`,
    about: {
      "@type": "AdministrativeArea",
      name: districtFormatted,
      containedInPlace: {
        "@type": "State",
        name: "Bihar",
        addressCountry: "IN",
      },
    },
    provider: {
      "@type": "Organization",
      name: SITE_CONFIG.name,
      url: SITE_CONFIG.baseUrl,
    },
  };
}

// ── FAQ Schema (reusable) ────────────────────────────────────
export function faqSchema(faqs: { question: string; answer: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((faq) => ({
      "@type": "Question",
      name: faq.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: faq.answer,
      },
    })),
  };
}
