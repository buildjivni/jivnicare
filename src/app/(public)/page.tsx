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
  TrustedBySection,
  PartnerCtaSection,
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

  // Fetch all specialties that have at least one doctor
  const dbSpecialties = await prisma.specialty.findMany({
    where: { doctorIds: { isEmpty: false } },
    take: 8
  });

  const featuredDoctors: Doctor[] = dbDoctors.map(doc => ({
    id: doc.id,
    name: doc.name,
    specialty: doc.specialties.length > 0 ? doc.specialties[0].name : "General Physician",
    clinic: doc.hospitalName,
    location: doc.district,
    rating: doc.rating || 4.5,
    reviews: Math.floor(Math.random() * 50) + 20, 
    experience: `${doc.experience} Years`,
    fee: `₹${doc.fee}`,
    videoFee: `₹${doc.consultationFee || 300}`,
    image: doc.profileImage || `https://ui-avatars.com/api/?name=${encodeURIComponent(doc.name)}&background=random`,
    bgImage: "https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?q=80&w=1200", 
    available: "Today",
    tags: [...doc.specialties.map(s => s.name), ...doc.keywords.map(k => k.term)],
    about: doc.bio || "Experienced and dedicated doctor.",
    education: doc.education || "MBBS, MD",
    nextAvailable: "10:00 AM"
  }));

  const specialties = dbSpecialties.length > 0 
    ? dbSpecialties.map(s => ({ name: s.name, id: s.slug }))
    : undefined;

  return (
    <main className="flex flex-col min-h-screen w-full max-w-full overflow-x-hidden box-border">
      <HeroSection />
      <TrustedBySection />
      <div className="bg-slate-50/50">
        <SpecialtiesSection specialties={specialties} />
      </div>
      <StatsSection />
      <AvailableDoctorsSection doctors={featuredDoctors} />
      <WhyJivniCareSection />
      <HowItWorksSection />
      <div className="bg-slate-50/50">
        <ComparisonSection />
      </div>
      <TrustSection />
      <PartnerCtaSection />
      <CtaBannerSection />
    </main>
  );
}
