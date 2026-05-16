import { 
  HeroSection, 
  HowItWorksSection, 
  TrustSection, 
  CtaBannerSection, 
  SpecialtiesSection, 
  AvailableDoctorsSection,
  TrustedBySection,
} from "@/components/home";
import { HelpEcosystem } from "@/components/trust/HelpEcosystem";
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
    <main className="flex flex-col min-h-screen w-full max-w-full overflow-x-hidden box-border bg-white">
      <HeroSection />
      
      {/* ── TRUSTED HOSPITALS ── */}
      <div className="border-y border-slate-100 bg-white">
        <TrustedBySection />
      </div>

      <div className="bg-slate-50/30">
        <SpecialtiesSection specialties={specialties} />
      </div>

      <HowItWorksSection />
      
      <AvailableDoctorsSection doctors={featuredDoctors} />
      
      <div className="bg-accent/30 py-16 md:py-24 border-y border-accent/20">
        <TrustSection />
      </div>

      <div className="container mx-auto px-4 max-w-5xl py-16 md:py-24">
        <HelpEcosystem />
      </div>

      <CtaBannerSection />
    </main>
  );
}
