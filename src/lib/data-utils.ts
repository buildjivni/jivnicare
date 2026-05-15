import type { Doctor as UIDoctor } from "@/types";

/**
 * Standard mapper to convert Prisma Doctor objects to the frontend UI Doctor type.
 * Ensures consistent handling of images, default values, and relations.
 */
export function mapPrismaDoctorToUI(doc: any): UIDoctor {
  return {
    id: doc.id,
    name: doc.name,
    specialty: doc.specialties?.[0]?.name || "General Physician",
    clinic: doc.hospitalName || "JivniCare Clinic",
    location: doc.district || "Bihar",
    rating: doc.rating || 4.5,
    reviews: Math.floor(Math.random() * 50) + 20, // Mock reviews until Review model is implemented
    experience: `${doc.experience || 0} Years`,
    fee: `₹${doc.fee || 0}`,
    videoFee: `₹${doc.consultationFee || 300}`,
    image: doc.profileImage || `https://ui-avatars.com/api/?name=${encodeURIComponent(doc.name)}&background=5298D2&color=fff`,
    bgImage: "https://images.unsplash.com/photo-1551076805-e18690c5e53b?q=80&w=1200",
    available: "Today",
    tags: [
      ...(doc.specialties?.map((s: any) => s.name) || []),
      ...(doc.keywords?.map((k: any) => k.term) || []),
    ],
    about: doc.bio || "Experienced and dedicated doctor.",
    education: doc.education || "MBBS, MD",
    averageConsultationTime: doc.averageConsultationTime || 15,
    nextAvailable: "10:00 AM", // Mock next available time
  };
}
