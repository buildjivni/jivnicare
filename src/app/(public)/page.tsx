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

export default function Home() {
  return (
    <main className="flex flex-col min-h-screen bg-slate-50">
      <HeroSection />
      <SpecialtiesSection />
      <AvailableDoctorsSection />
      <StatsSection />
      <WhyJivniCareSection />
      <HowItWorksSection />
      <ComparisonSection />
      <TrustSection />
      <CtaBannerSection />
    </main>
  );
}
