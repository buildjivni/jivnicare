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

  const todaySchedule = weeklySchedule[todayKey] as
    | { isOpen?: boolean; start?: string; end?: string }
    | undefined;

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
  const clinicOps = doc.clinicOperations ?? null;
  const todayQueue = Array.isArray(doc.dailyQueues)
    ? doc.dailyQueues[0] ?? null
    : null;
  const avgConsultTime = doc.averageConsultationTime || 15;

  // Queue state — require ACTIVE or NOT_STARTED and not explicitly closed
  const isQueueActive =
    todayQueue !== null &&
    (todayQueue.status === "ACTIVE" || todayQueue.status === "NOT_STARTED") &&
    !clinicOps?.isClosedToday &&
    clinicOps?.status !== "CLINIC_CLOSED";

  const waitingCount = isQueueActive
    ? Math.max(
        0,
        (todayQueue.issuedTokensCount || 0) - (todayQueue.currentActiveToken || 0)
      )
    : 0;
  const waitMinutes = isQueueActive ? waitingCount * avgConsultTime : 0;

  // Availability from schedule (India TZ aware)
  const { isAvailableToday, available, nextSlotTime } = getAvailability(
    doc.weeklySchedule,
    clinicOps
  );

  // Human-readable availability status for DoctorCard pills
  let availabilityStatus: string;
  if (clinicOps?.isClosedToday || clinicOps?.status === "CLINIC_CLOSED") {
    availabilityStatus = "OPD Closed";
  } else if (clinicOps?.status === "SHORT_BREAK") {
    availabilityStatus = "Short Break";
  } else if (clinicOps?.status === "EMERGENCY_ONLY") {
    availabilityStatus = "Emergency Only";
  } else if (clinicOps?.status === "LIMITED_SLOTS") {
    availabilityStatus = "Limited Slots";
  } else if (isQueueActive) {
    availabilityStatus =
      waitMinutes > 0 ? `~${waitMinutes} mins wait` : "OPD Open";
  } else if (isAvailableToday) {
    availabilityStatus = nextSlotTime ? `Opens at ${nextSlotTime}` : "OPD Open";
  } else {
    availabilityStatus = "Check Schedule";
  }

  // Fee — always ₹ prefixed
  const rawFee = doc.fee ?? doc.consultationFee ?? 0;
  const feeFormatted = `₹${rawFee}`;

  // Images — never inject fake external URLs
  const profileImage = doc.profileImage || "";
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
    specialty: doc.specialties?.[0]?.name || "General Physician",
    clinic: doc.hospitalName || "",
    location: doc.district || doc.city || "",
    locality: doc.locality || "",
    landmark: doc.landmark || undefined,
    fullAddress: doc.fullAddress || undefined,
    pincode: doc.pincode || undefined,
    latitude: doc.latitude ?? null,
    longitude: doc.longitude ?? null,
    // Distance only set when provided by geo-aware search; never hardcoded
    distance: doc.distance || undefined,
    distanceStr: (doc as any).distanceStr || undefined,
    distanceKm: (doc as any).distanceKm || undefined,
    rating: doc.rating || 0,
    reviewCount: doc.reviewCount || 0,
    reviews: doc.reviewCount || 0,
    totalConsultations: doc.totalConsultations || 0,
    experience: String(doc.experience || 0),
    fee: feeFormatted,
    videoFee: feeFormatted,
    // Images: use DB values only
    image: profileImage,
    clinicImage: clinicImage || undefined,
    bgImage: clinicImage, // alias for type compat — always same as clinicImage
    available,
    availabilityStatus,
    isAvailableToday,
    isQueueActive,
    queueWaitMinutes: waitMinutes,
    patientsWaiting: waitingCount,
    nextAvailable: nextSlotTime || (isAvailableToday ? "Today" : ""),
    verifiedBadgeLabel:
      doc.verifiedBadgeLabel ||
      (doc.experience >= 10 ? "Experienced Partner" : "Verified Doctor"),
    tags: [
      ...(doc.specialties?.map((s: any) => s.name) || []),
      ...(doc.keywords?.map((k: any) => k.term) || []),
    ],
    about: doc.bio || "",
    education: doc.education || "",
    qualifications:
      doc.qualifications ||
      (doc.education ? doc.education.split(",")[0].trim() : ""),
    averageConsultationTime: avgConsultTime,
    languages,
    updatedAt: doc.updatedAt,
  };
}
