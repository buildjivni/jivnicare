import type { Doctor as UIDoctor } from "@/types";

/**
 * Standard mapper to convert Prisma Doctor objects to the frontend UI Doctor type.
 * Ensures consistent handling of images, default values, and relations.
 */
export function mapPrismaDoctorToUI(doc: any): UIDoctor {
  const isQueueActive = doc.dailyQueues?.[0]?.status === 'ACTIVE';
  const waitMinutes = isQueueActive ? (doc.dailyQueues[0].issuedTokensCount - doc.dailyQueues[0].currentActiveToken) * (doc.averageConsultationTime || 15) : 0;
  
  return {
    id: doc.id,
    name: doc.name,
    slug: doc.slug || doc.id,
    specialty: doc.specialties?.[0]?.name || "General Physician",
    clinic: doc.hospitalName || "JivniCare Clinic",
    location: doc.district || "Jamui",
    locality: doc.locality || doc.district,
    fullAddress: doc.fullAddress,
    landmark: doc.landmark,
    pincode: doc.pincode,
    latitude: doc.latitude,
    longitude: doc.longitude,
    distance: doc.distance || "1.2 km away",
    rating: doc.rating || 4.5,
    reviewCount: doc.reviewCount || 20,
    reviews: doc.reviewCount || 20,
    totalConsultations: doc.totalConsultations || 100,
    experience: String(doc.experience || 0),
    fee: `₹${doc.fee || 0}`,
    videoFee: `₹${doc.consultationFee || 300}`,
    image: doc.profileImage || `https://ui-avatars.com/api/?name=${encodeURIComponent(doc.name)}&background=5298D2&color=fff`,
    clinicImage: doc.clinicImage,
    bgImage: "https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?q=80&w=1200",
    available: doc.clinicOperations?.isClosedToday ? "Closed Today" : "Available Today",
    availabilityStatus: doc.clinicOperations?.isClosedToday 
      ? "OPD Closed" 
      : doc.clinicOperations?.pauseOnlineBooking 
        ? "Online Booking Paused" 
        : isQueueActive ? `Available in ${waitMinutes} mins` : "OPD Open",
    isQueueActive,
    queueWaitMinutes: waitMinutes,
    verifiedBadgeLabel: doc.verifiedBadgeLabel || (doc.experience >= 10 ? "Experienced Partner" : "Verified Doctor"),
    tags: [
      ...(doc.specialties?.map((s: any) => s.name) || []),
      ...(doc.keywords?.map((k: any) => k.term) || []),
    ],
    about: doc.bio || "Experienced and dedicated doctor.",
    education: doc.education || "MBBS, MD",
    qualifications: doc.qualifications || (doc.education ? doc.education.split(',')[0] : 'MBBS'),
    averageConsultationTime: doc.averageConsultationTime || 15,
    languages: doc.languages || ["Hindi", "English"],
    nextAvailable: "Today",
  };
}
