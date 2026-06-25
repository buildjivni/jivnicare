import { 
  HeroSection, 
  HowItWorksSection, 
  TrustSection, 
  CtaBannerSection, 
  SpecialtiesSection, 
  VerifiedDoctorsSection
} from "@/features/marketing/components/home";
import { HelpEcosystem } from "@/features/marketing/components/trust/HelpEcosystem";
import { ProductDemosSection } from "@/features/marketing/components/home/ProductDemosSection";
import prisma from "@/lib/db/prisma";
import { mapPrismaDoctorToUI } from "@/lib/utils/data-utils";

async function getVerifiedDoctors() {
  try {
    const dbDoctors = await prisma.doctor.findMany({
      where: {
        verificationStatus: 'VERIFIED',
        availabilityStatus: 'AVAILABLE',
      },
      include: {
        queues: true,
        platformPricing: true,
      },
      take: 6, // Show max 6 on homepage
      orderBy: {
        jivnicarePatientsServed: 'desc',
      },
    });
    return dbDoctors.map(doc => mapPrismaDoctorToUI(doc));
  } catch (err) {
    console.warn("Failed to fetch verified doctors during homepage build:", err);
    return [];
  }
}

export default async function Home() {
  const featuredDoctors = await getVerifiedDoctors();

  return (
    <main className="flex flex-col min-h-screen w-full max-w-full overflow-x-hidden box-border bg-white">
      <HeroSection featuredDoctor={featuredDoctors[0]} />
      
      {/* ── AVAILABLE DOCTORS (Now Primary Discovery) ── */}
      <VerifiedDoctorsSection doctors={featuredDoctors} />

      {/* ── TRUST & INTEGRITY ── */}
      <div className="bg-accent/30 border-y border-accent/20">
        <TrustSection />
      </div>

      {/* ── SPECIALTIES (Secondary Discovery) ── */}
      <div className="bg-slate-50/30">
        <SpecialtiesSection />
      </div>

      {/* ── HOW IT WORKS ── */}
      <HowItWorksSection />
      
      <div className="container mx-auto px-4 max-w-5xl py-8 md:py-12 mb-8">
        <HelpEcosystem />
      </div>

      <ProductDemosSection />
      
      <CtaBannerSection />
    </main>
  );
}
