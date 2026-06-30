import type { Doctor as UIDoctor } from "@/types";

/**
 * Single canonical mapper — Prisma Doctor → Frontend UI Doctor type.
 * Used on landing page, search results, and doctor profile pages.
 * Never add independent transforms elsewhere.
 */

/** Format "HH:MM" 24h to "H:MM AM/PM" */
function formatTime12h(t: string): string {
  if (!t) return "";
  const [h, m] = t.split(":");
  const hh = parseInt(h, 10);
  return `${hh % 12 || 12}:${m} ${hh >= 12 ? "PM" : "AM"}`;
}

/**
 * Compute today's availability from weeklySchedule JSON + clinicOperations.
 * India timezone safe — uses "Asia/Kolkata" locale to determine current weekday.
 */
function getAvailability(
  weeklySchedule: Record<string, any> | null | undefined,
  clinicOps: {
    isClosedToday?: boolean | null;
    status?: string | null;
  } | null | undefined
): { isAvailableToday: boolean; available: string; nextSlotTime: string } {
  // Clinic explicitly closed — highest priority
  if (clinicOps?.isClosedToday || clinicOps?.status === "CLINIC_CLOSED") {
    return { isAvailableToday: false, available: "Closed Today", nextSlotTime: "" };
  }

  // No schedule at all — default open (prevents over-filtering unset doctors)
  if (!weeklySchedule) {
    return { isAvailableToday: true, available: "Available Today", nextSlotTime: "" };
  }

  // weeklySchedule is a JSON object keyed by day name: { monday: { isOpen, start, end }, ... }
  const todayKey = new Date()
    .toLocaleDateString("en-US", { weekday: "long", timeZone: "Asia/Kolkata" })
    .toLowerCase(); // e.g. "monday"

  let todaySchedule: { isOpen?: boolean; start?: string; end?: string } | undefined;

  if (weeklySchedule && typeof weeklySchedule === "object") {
    // Normalize keys to lowercase to ensure case-insensitive matching
    const normalizedSchedule: Record<string, any> = {};
    for (const key in weeklySchedule) {
      if (Object.prototype.hasOwnProperty.call(weeklySchedule, key)) {
        normalizedSchedule[key.toLowerCase()] = weeklySchedule[key];
      }
    }
    todaySchedule = normalizedSchedule[todayKey];
  }

  if (!todaySchedule) {
    // Key missing — treat as available (schedule not fully configured)
    return { isAvailableToday: true, available: "Available Today", nextSlotTime: "" };
  }

  if (todaySchedule.isOpen === false) {
    return { isAvailableToday: false, available: "Closed Today", nextSlotTime: "" };
  }

  const nextSlotTime = todaySchedule.start ? formatTime12h(todaySchedule.start) : "";
  return { isAvailableToday: true, available: "Available Today", nextSlotTime };
}

export function mapPrismaDoctorToUI(doc: any): UIDoctor {
  const isEmergencyOnly = !doc.isAcceptingBookings && doc.isEmergencyEnabled;
  const isClosedToday = doc.availabilityStatus === "OFFLINE";
  const clinicOps = {
    isClosedToday,
    status: isEmergencyOnly ? "EMERGENCY_ONLY" : (isClosedToday ? "CLINIC_CLOSED" : doc.availabilityStatus),
    pauseOnlineBooking: !doc.isAcceptingBookings,
    emergencySlots: doc.emergencyCapacity || 0,
  };

  const todayQueue = Array.isArray(doc.queues)
    ? doc.queues[0] ?? null
    : null;
  const avgConsultTime = doc.averageConsultationMinutes || doc.averageConsultationTime || 15;

  // Queue state — V1 use isOnline
  const isQueueActive = doc.isEmergencyEnabled || doc.availabilityStatus === "AVAILABLE";

  // Availability from schedule (India TZ aware)
  const { isAvailableToday, available, nextSlotTime } = getAvailability(
    doc.weeklySchedule,
    clinicOps
  );

  let availableSlots = 0;
  if (isAvailableToday && todayQueue) {
    availableSlots = Math.max(0, (doc.dailyTokenLimit || 50) - (todayQueue.totalTokens || 0));
  } else if (isAvailableToday && !todayQueue) {
    availableSlots = doc.dailyTokenLimit || 50; 
  }

  // Human-readable availability status for DoctorCard pills
  let availabilityStatus: string;
  if (isQueueActive) {
    availabilityStatus = "OPD Open";
  } else if (isAvailableToday) {
    availabilityStatus = nextSlotTime ? `Opens at ${nextSlotTime}` : "OPD Open";
  } else {
    availabilityStatus = "Check Schedule";
  }

  // Fee — always ₹ prefixed
  const rawFee = doc.consultationFee || doc.fee || 0;
  const feeFormatted = `₹${rawFee}`;

  // Images — never inject fake external URLs
  const profileImage = doc.profilePhoto || doc.profileImage || "";
  const clinicImage = doc.clinicImage || "";

  // Languages — handle both string CSV and array
  const rawLangs = doc.languages;
  const languages: string[] = Array.isArray(rawLangs)
    ? rawLangs
    : rawLangs
    ? String(rawLangs)
        .split(",")
        .map((l: string) => l.trim())
        .filter(Boolean)
    : ["Hindi", "English"];

  return {
    id: doc.id,
    name: doc.name,
    slug: doc.slug || doc.id,
    specialty: doc.speciality || "General Physician",
    clinic: doc.clinicName || doc.hospitalName || "",
    location: doc.clinicCity || doc.city || doc.district || "",
    locality: doc.locality || "",
    landmark: doc.landmark || undefined,
    fullAddress: doc.clinicAddress || undefined,
    pincode: doc.clinicPincode || doc.pincode || undefined,
    latitude: doc.clinicLatitude ?? doc.latitude ?? null,
    longitude: doc.clinicLongitude ?? doc.longitude ?? null,
    // Distance only set when provided by geo-aware search; never hardcoded
    distance: doc.distance || undefined,
    distanceStr: (doc as any).distanceStr || undefined,
    distanceKm: (doc as any).distanceKm || undefined,
    rating: 0, // No rating in V1
    reviewCount: 0, // No reviews in V1
    reviews: 0,
    totalConsultations: doc.jivnicarePatientsServed || doc.lifetimePatientsServed || 0,
    lifetimePatientsDeclaration: doc.lifetimePatientsDeclaration || undefined,
    experience: String(doc.experienceYears || doc.experience || 0),
    fee: feeFormatted,
    videoFee: feeFormatted,
    // Images: use DB values only
    image: profileImage,
    clinicImage: clinicImage || undefined,
    bgImage: clinicImage, // alias for type compat — always same as clinicImage
    available,
    availabilityStatus,
    isAvailableToday,
    availableSlots,
    isQueueActive,
    queueWaitMinutes: 0, // wait time logic will be refined in Phase 3
    patientsWaiting: 0,
    nextAvailable: nextSlotTime || (isAvailableToday ? "Today" : ""),
    verifiedBadgeLabel:
      doc.verifiedBadgeLabel ||
      ((doc.experienceYears || doc.experience || 0) >= 10 ? "Experienced Partner" : "Verified Doctor"),
    tags: [
      doc.speciality,
    ].filter(Boolean),
    diseases: doc.diseases || [],
    procedures: doc.procedures || [],
    about: doc.bio || "",
    education: doc.education || "",
    qualifications: Array.isArray(doc.qualifications)
      ? doc.qualifications.join(", ")
      : (doc.qualifications || doc.qualification || (doc.education ? doc.education.split(",")[0].trim() : "")),
    averageConsultationTime: avgConsultTime,
    languages,
    partnerTier: doc.platformPricing?.partnerTier || doc.partnerTier || undefined,
    gender: doc.gender || undefined,
    emergencyAvailable: doc.isEmergencyEnabled || false,
    isEmergencySupported: doc.isEmergencyEnabled || false,
    verificationStatus: doc.verificationStatus,
    updatedAt: doc.updatedAt,
  };
}
