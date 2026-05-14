import {
  HeroSection,
  StatsSection,
  WhyJivniCareSection,
  HowItWorksSection,
  ComparisonSection,
  TrustSection,
  CtaBannerSection,
  SpecialtiesSection,
  AvailableDoctorsSection,
} from "@/components/home";
import prisma from "@/lib/prisma";
import type { Doctor } from "@/types";

export default async function Home() {
  // Fetch Top 3 Verified Doctors
  const dbDoctors = await prisma.doctor.findMany({
    where: { verificationStatus: 'VERIFIED' },
    take: 3,
    orderBy: { rating: 'desc' },
    include: { specialties: true, keywords: true }
  });

  const featuredDoctors: Doctor[] = dbDoctors.map(doc => ({
    id: doc.id,
    name: doc.name,
    specialty: doc.specialties.length > 0 ? doc.specialties[0].name : "General Physician",
    clinic: doc.hospitalName,
    location: doc.district,
    rating: doc.rating || 4.5,
    reviews: 120, // Mock reviews since we don't have review model yet
    experience: `${doc.experience} Years`,
    fee: `₹${doc.fee}`,
    videoFee: `₹${doc.consultationFee || 300}`,
    image: doc.profileImage || `https://ui-avatars.com/api/?name=${encodeURIComponent(doc.name)}&background=random`,
    bgImage: "https://images.unsplash.com/photo-1551076805-e18690c5e53b?q=80&w=1200",
    available: "Today",
    tags: [...doc.specialties.map(s => s.name), ...doc.keywords.map(k => k.term)],
    about: doc.bio || "Experienced and dedicated doctor.",
    education: doc.education || "MBBS, MD",
    nextAvailable: "10:00 AM"
  }));

  return (
    <main className="flex flex-col min-h-screen bg-slate-50">
      <HeroSection />
      <SpecialtiesSection />
      <AvailableDoctorsSection doctors={featuredDoctors} />
      <StatsSection />
      <WhyJivniCareSection />
      <HowItWorksSection />
      <ComparisonSection />
      <TrustSection />
      <CtaBannerSection />
    </main>
  );
}
