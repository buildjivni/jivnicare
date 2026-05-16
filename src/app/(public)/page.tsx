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
  FeaturedArticlesSection,
} from "@/components/home";
import prisma from "@/lib/prisma";
import type { Doctor } from "@/types";
import { mapPrismaDoctorToUI } from "@/lib/data-utils";

export default async function Home() {
  // Fetch Top 3 Verified Doctors
  const dbDoctors = await prisma.doctor.findMany({
    where: { verificationStatus: 'VERIFIED' },
    take: 3,
    orderBy: { rating: 'desc' },
    include: { specialties: true, keywords: true, dailyQueues: true }
  });

  // Fetch all specialties that have at least one doctor
  const dbSpecialties = await prisma.specialty.findMany({
    where: { doctorIds: { isEmpty: false } },
    take: 8
  });

  const featuredDoctors: Doctor[] = dbDoctors.map(doc => mapPrismaDoctorToUI(doc));

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
      <FeaturedArticlesSection />
      <PartnerCtaSection />
      <CtaBannerSection />
    </main>
  );
}
