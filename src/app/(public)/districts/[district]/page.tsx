import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { MapPin, Stethoscope, Building2, Zap, ChevronRight, Star, ArrowRight, ShieldCheck } from "lucide-react";
import { ACTIVE_LAUNCH_DISTRICTS, FUTURE_EXPANSION_DISTRICTS, generateDistrictMetadata, capitalizeDistrict, HEALTHCARE_SPECIALTIES, BIHAR_DISTRICTS } from "@/lib/seo/metadata";
import { districtHealthcareSchema, breadcrumbSchema, faqSchema } from "@/lib/seo/jsonld";
import { JsonLd } from "@/components/seo/JsonLd";
import prisma from "@/lib/db/prisma";
import { mapPrismaDoctorToUI } from "@/lib/utils/data-utils";
import { getCanonicalImageUrl } from "@/lib/imageHelper";
import { Button } from "@/components/ui/button";
import Image from "next/image";

import { ComingSoonLeadForm } from "@/components/shared/ComingSoonLeadForm";

interface PageProps {
  params: Promise<{ district: string }>;
}

export async function generateStaticParams() {
  const all = [...ACTIVE_LAUNCH_DISTRICTS, ...FUTURE_EXPANSION_DISTRICTS];
  return all.map((d) => ({ district: d.toLowerCase().replace(/\s+/g, "-") }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { district } = await params;
  const all = [...ACTIVE_LAUNCH_DISTRICTS, ...FUTURE_EXPANSION_DISTRICTS];

  if (!all.some((d) => d.toLowerCase().replace(/\s+/g, "-") === district)) {
    return { title: "District Not Found | JivniCare" };
  }

  return generateDistrictMetadata(district);
}

export default async function DistrictPage({ params }: PageProps) {
  const { district } = await params;
  const districtKey = district.toLowerCase().replace(/\s+/g, "-");
  const all = [...ACTIVE_LAUNCH_DISTRICTS, ...FUTURE_EXPANSION_DISTRICTS];
  const isValidDistrict = all.some(
    (d) => d.toLowerCase().replace(/\s+/g, "-") === districtKey
  );

  if (!isValidDistrict) notFound();

  const districtFormatted = capitalizeDistrict(district);
  const isDeoghar = districtKey === "deoghar";
  const state = isDeoghar ? "Jharkhand" : "Bihar";
  const isActive = ACTIVE_LAUNCH_DISTRICTS.some(d => d.toLowerCase() === districtKey);

  // Fetch Real Doctors for this District
  let dbDoctors: any[] = [];
  try {
    dbDoctors = await prisma.doctor.findMany({
      where: { 
        district: { contains: districtFormatted, mode: 'insensitive' },
        verificationStatus: 'VERIFIED'
      },
      take: 6,
      include: { specialties: true, keywords: true }
    });
  } catch (err) {
    console.warn("Failed to fetch doctors in district during prerender:", err);
  }

  const districtDoctors = dbDoctors.map(mapPrismaDoctorToUI);

  const faqs = [
    {
      question: `How do I book a doctor in ${districtFormatted}, ${state}?`,
      answer: `Search for doctors on JivniCare, filter by ${districtFormatted}, choose your specialist, and book an appointment instantly — online or in-clinic.`,
    },
    {
      question: `Which are the best hospitals in ${districtFormatted}?`,
      answer: `JivniCare lists verified and top-rated hospitals in ${districtFormatted}, ${state}. Use our hospital search to find the right facility for your needs.`,
    },
    {
      question: `Is there emergency healthcare available in ${districtFormatted}?`,
      answer: `Yes. JivniCare lists hospitals in ${districtFormatted} with 24/7 emergency services. Use the Emergency filter on our hospital search page.`,
    },
    {
      question: `Can I book specialist doctors online in ${districtFormatted}?`,
      answer: `Absolutely. JivniCare lets you book Cardiologists, Dermatologists, Pediatricians, and more in ${districtFormatted} via video or in-clinic consultation.`,
    },
  ];

  return (
    <main className="min-h-screen bg-[#f7f9fc] pb-20">
      {/* JSON-LD */}
      <JsonLd schema={districtHealthcareSchema(district)} />
      <JsonLd
        schema={breadcrumbSchema([
          { name: "Home", url: "https://jivnicare.in" },
          { name: "Districts", url: "https://jivnicare.in/districts" },
          { name: `${districtFormatted}, ${state}`, url: `https://jivnicare.in/districts/${districtKey}` },
        ])}
      />
      <JsonLd schema={faqSchema(faqs)} />

      {/* Hero Section */}
      <section className="bg-gradient-to-br from-[#205E98] via-[#1a4f82] to-[#13365a] text-white py-14 md:py-20 px-4">
        <div className="container mx-auto max-w-5xl">
          {/* Breadcrumb */}
          <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 text-white/60 text-xs mb-6">
            <Link href="/" className="hover:text-white transition-colors">Home</Link>
            <ChevronRight className="w-3 h-3" />
            <Link href="/districts" className="hover:text-white transition-colors">Districts</Link>
            <ChevronRight className="w-3 h-3" />
            <span className="text-white font-medium">{districtFormatted}</span>
          </nav>

          <div className="flex items-start gap-3 mb-4">
            <div className="p-2.5 bg-white/15 rounded-2xl">
              <MapPin className="w-6 h-6 text-white" />
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2 mb-1">
                <span className="text-white/70 text-xs font-bold uppercase tracking-wider">{state} Healthcare</span>
                <span className={`text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-md border ${
                  isActive 
                    ? "bg-emerald-500/20 border-emerald-400/30 text-emerald-300" 
                    : "bg-amber-500/20 border-amber-400/30 text-amber-300"
                }`}>
                  {isActive ? "Active Launch Location" : "Upcoming Expansion"}
                </span>
              </div>
              <h1 className="text-3xl md:text-5xl font-black leading-tight">
                Doctors &amp; Hospitals in{" "}
                <span className="text-[#7EC8E3]">{districtFormatted}</span>
              </h1>
            </div>
          </div>

          <p className="text-white/80 text-base md:text-lg max-w-2xl mt-4 leading-relaxed">
            Find verified doctors, top-rated hospitals, and emergency services in{" "}
            {districtFormatted}, {state}. Book same-day appointments on JivniCare.
          </p>

          <div className="flex flex-wrap gap-3 mt-8">
            <Link href={`/doctors?district=${districtFormatted}`}>
              <Button className="bg-white text-primary hover:bg-white/90 font-bold rounded-2xl h-11 px-6">
                Find Doctors
              </Button>
            </Link>
            <Link href="/hospitals">
              <Button
                variant="outline"
                className="border-white/40 text-white hover:bg-white/10 font-semibold rounded-2xl h-11 px-6"
              >
                View Hospitals
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Quick Stats */}
      <section className="container mx-auto max-w-5xl px-4 py-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { icon: <Stethoscope className="w-5 h-5 text-primary" />, label: "Verified Doctors", value: dbDoctors.length > 0 ? `${dbDoctors.length}+` : "10+", bg: "bg-blue-50" },
            { icon: <Building2 className="w-5 h-5 text-emerald-600" />, label: "Hospitals", value: "12+", bg: "bg-emerald-50" },
            { icon: <Zap className="w-5 h-5 text-red-500" />, label: "Emergency 24/7", value: "Available", bg: "bg-red-50" },
            { icon: <ShieldCheck className="w-5 h-5 text-primary" />, label: "Verified Platform", value: "100%", bg: "bg-blue-50" },
          ].map((stat) => (
            <div key={stat.label} className={`${stat.bg} rounded-2xl p-4 text-center shadow-sm`}>
              <div className="flex justify-center mb-2">{stat.icon}</div>
              <p className="font-black text-slate-900 text-lg">{stat.value}</p>
              <p className="text-xs text-slate-500 font-medium">{stat.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Top Specialties */}
      <section className="container mx-auto max-w-5xl px-4 py-6">
        <h2 className="text-xl font-bold text-slate-900 mb-4 flex items-center gap-2">
          <Stethoscope className="w-5 h-5 text-primary" />
          Top Specialties in {districtFormatted}
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
          {HEALTHCARE_SPECIALTIES.slice(0, 8).map((specialty) => (
            <Link
              key={specialty}
              href={`/doctors?specialty=${specialty}&district=${districtFormatted}`}
              className="group bg-white border border-slate-100 rounded-2xl p-4 hover:border-primary/30 hover:shadow-md transition-all"
            >
              <p className="font-semibold text-slate-800 text-sm group-hover:text-primary transition-colors">
                {specialty}
              </p>
              <p className="text-xs text-slate-400 mt-0.5">in {districtFormatted}</p>
            </Link>
          ))}
        </div>
      </section>

      {/* Top Doctors in District */}
      <section className="container mx-auto max-w-5xl px-4 py-6">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-emerald-500" />
            Top Verified Doctors
          </h2>
          <Link
            href={`/doctors?district=${districtFormatted}`}
            className="text-sm text-primary font-semibold flex items-center gap-1 hover:underline"
          >
            View All <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {districtDoctors.length > 0 ? (
          <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-4">
            {districtDoctors.map((doctor) => (
              <Link
                key={doctor.id}
                href={`/doctors/${doctor.id}`}
                className="group bg-white rounded-3xl border border-slate-100 p-4 hover:shadow-md hover:border-primary/20 transition-all"
              >
                <div className="flex items-center gap-3 mb-3">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <Image
                    src={getCanonicalImageUrl(doctor.image, doctor.updatedAt) || ""}
                    alt={doctor.name}
                    width={48}
                    height={48}
                    className="w-12 h-12 rounded-2xl object-cover"
                  />
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-slate-900 text-sm truncate group-hover:text-primary transition-colors">
                      {doctor.name}
                    </p>
                    <p className="text-xs text-slate-500 truncate">{doctor.specialty}</p>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  {doctor.rating && doctor.rating > 0 ? (
                    <span className="flex items-center gap-1 text-xs font-semibold text-amber-600">
                      <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                      {doctor.rating.toFixed(1)}
                      {(doctor.reviews ?? 0) > 0 && ` (${doctor.reviews})`}
                    </span>
                  ) : (
                    <span className="flex items-center gap-1 text-xs font-semibold text-emerald-600">
                      <ShieldCheck className="w-3 h-3 text-emerald-500" />
                      Verified
                    </span>
                  )}
                  <span className="text-xs font-bold text-primary">{doctor.fee}</span>
                </div>
                <p className="text-xs text-slate-400 mt-1.5 flex items-center gap-1">
                  <MapPin className="w-3 h-3" /> {doctor.location}
                </p>
              </Link>
            ))}
          </div>
        ) : !isActive ? (
          <div className="max-w-md mx-auto">
            <ComingSoonLeadForm defaultCity={districtFormatted} source="coming-soon-location" />
          </div>
        ) : (
          <div className="bg-white rounded-3xl border border-slate-100 p-12 text-center">
            <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4">
              <Stethoscope className="w-8 h-8 text-slate-300" />
            </div>
            <h3 className="text-lg font-bold text-slate-900">No doctors listed yet</h3>
            <p className="text-slate-500 text-sm mt-1 max-w-xs mx-auto">
              We are currently onboarding doctors in {districtFormatted}. Check back soon or find doctors in nearby districts.
            </p>
            <Link href="/doctors">
              <Button variant="outline" className="mt-6 rounded-xl border-slate-200">
                Browse All Doctors
              </Button>
            </Link>
          </div>
        )}
      </section>

      {/* Emergency CTA */}
      <section className="container mx-auto max-w-5xl px-4 py-6">
        <div className="bg-red-50 border border-red-100 rounded-3xl p-6 flex flex-col md:flex-row items-center gap-4">
          <div className="p-3 bg-red-100 rounded-2xl shrink-0">
            <Zap className="w-7 h-7 text-red-500" />
          </div>
          <div className="flex-1 text-center md:text-left">
            <p className="font-bold text-red-800 text-lg">Emergency? Need Immediate Help?</p>
            <p className="text-red-600 text-sm mt-0.5">
              Find 24/7 emergency hospitals in {districtFormatted} available right now.
            </p>
          </div>
          <Link href="/hospitals?emergency=true">
            <Button className="bg-red-500 hover:bg-red-600 text-white font-bold rounded-2xl h-11 px-6 whitespace-nowrap">
              Emergency Hospitals
            </Button>
          </Link>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="container mx-auto max-w-5xl px-4 py-8">
        <h2 className="text-xl font-bold text-slate-900 mb-5">
          Frequently Asked Questions — {districtFormatted}
        </h2>
        <div className="space-y-3">
          {faqs.map((faq) => (
            <details
              key={faq.question}
              className="group bg-white border border-slate-100 rounded-2xl px-5 py-4 cursor-pointer"
            >
              <summary className="font-semibold text-slate-800 text-sm list-none flex items-center justify-between gap-2">
                {faq.question}
                <ChevronRight className="w-4 h-4 text-slate-400 group-open:rotate-90 transition-transform shrink-0" />
              </summary>
              <p className="text-sm text-slate-600 mt-3 leading-relaxed">{faq.answer}</p>
            </details>
          ))}
        </div>
      </section>

      {/* All Districts CTA */}
      <section className="container mx-auto max-w-5xl px-4 py-6">
        <div className="bg-white border border-slate-100 rounded-3xl p-6">
          <h2 className="font-bold text-slate-900 mb-4">Explore Healthcare in Other Districts</h2>
          <div className="flex flex-wrap gap-2">
            {BIHAR_DISTRICTS.slice(0, 15).filter((d) => d !== districtFormatted).map((d) => (
              <Link
                key={d}
                href={`/districts/${d.toLowerCase().replace(/\s+/g, "-")}`}
                className="text-xs font-medium bg-slate-50 border border-slate-200 text-slate-600 hover:bg-primary/8 hover:border-primary/30 hover:text-primary px-3 py-1.5 rounded-xl transition-all"
              >
                {d}
              </Link>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
