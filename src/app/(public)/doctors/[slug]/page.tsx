import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { redirect } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import prisma from "@/lib/prisma";
import { DoctorProfileView } from "@/components/doctors/profile/DoctorProfileView";
import { BookingWidgetClient } from "@/components/doctors/profile/BookingWidgetClient";
import { SITE_CONFIG, generateDoctorMetadata } from "@/lib/seo/metadata";
import { physicianSchema, breadcrumbSchema } from "@/lib/seo/jsonld";
import { JsonLd } from "@/components/seo/JsonLd";
import type { Doctor } from "@/types";
import { mapPrismaDoctorToUI } from "@/lib/data-utils";

interface PageProps {
  params: Promise<{ slug: string }>;
}

// ── UUID detection ─────────────────────────────────────────────
const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/**
 * Unified doctor profile route.
 */

// Fetch all verified doctor slugs + IDs for static generation
export async function generateStaticParams() {
  try {
    const doctors = await prisma.doctor.findMany({
      where: { verificationStatus: "VERIFIED" },
      select: { id: true, slug: true },
    });
    const params: { slug: string }[] = [];
    for (const d of doctors) {
      if (d.slug) params.push({ slug: d.slug });
      if (d.id && d.id !== d.slug) params.push({ slug: d.id });
    }
    return params;
  } catch {
    return [];
  }
}

// ── Metadata ─────────────────────────────────────────────────────────────────
export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  try {
    let doc = await prisma.doctor.findUnique({
      where: { slug },
      include: { specialties: true, dailyQueues: true },
    });
    if (!doc && UUID_REGEX.test(slug)) {
      doc = await prisma.doctor.findUnique({
        where: { id: slug },
        include: { specialties: true, dailyQueues: true },
      });
    }
    if (!doc) return { title: "Doctor Not Found | JivniCare" };
    const mappedDoctor = mapPrismaDoctorToUI(doc);
    const meta = generateDoctorMetadata({ ...mappedDoctor, image: mappedDoctor.image });
    return {
      ...meta,
      alternates: { canonical: `${SITE_CONFIG.baseUrl}/doctors/${doc.slug}` },
      openGraph: { ...meta.openGraph, url: `${SITE_CONFIG.baseUrl}/doctors/${doc.slug}` },
    };
  } catch {
    return { title: "Doctor | JivniCare" };
  }
}

// ── Page ──────────────────────────────────────────────────────────────────────
export default async function DoctorProfilePage({ params }: PageProps) {
  const { slug } = await params;

  // ── 1. Try finding by slug first ──────────────────────────────────────────
  let doc = await prisma.doctor.findUnique({
    where: { slug },
    include: {
      specialties: true,
      keywords: true,
      weeklySchedule: true,
      clinicOperations: true,
      dailyQueues: true,
    },
  });

  // ── 2. Fallback: if slug param looks like a UUID, look up by ID ───────────
  if (!doc && UUID_REGEX.test(slug)) {
    const docById = await prisma.doctor.findUnique({
      where: { id: slug },
      select: { slug: true },
    });
    if (docById?.slug) {
      redirect(`/doctors/${docById.slug}`);
    }
  }

  if (!doc) notFound();

  // Fetch up to 3 related verified doctors under the same specialty
  const relatedPrismaDoctors = await prisma.doctor.findMany({
    where: {
      verificationStatus: "VERIFIED",
      id: { not: doc.id },
      specialties: {
        some: {
          id: { in: doc.specialtyIds }
        }
      }
    },
    take: 3,
    include: {
      specialties: true,
      keywords: true,
      weeklySchedule: true,
      clinicOperations: true,
      dailyQueues: {
        where: {
          date: {
            gte: new Date(new Date().setHours(0, 0, 0, 0)),
            lt:  new Date(new Date().setHours(23, 59, 59, 999)),
          }
        },
        select: {
          status: true,
          issuedTokensCount: true,
          currentActiveToken: true,
          maxCapacity: true,
        },
        take: 1,
      }
    }
  });

  const relatedDoctors = relatedPrismaDoctors.map(mapPrismaDoctorToUI);
  const doctor = mapPrismaDoctorToUI(doc);
  const district = doctor.location.split(",").pop()?.trim() ?? "Bihar";
  const availableToday = doctor.available?.toLowerCase().includes("available today");

  return (
    <div className="bg-[#f7f9fc] min-h-screen pb-28 md:pb-8">
      {/* JSON-LD Structured Data */}
      <JsonLd schema={physicianSchema({ ...doctor, image: doctor.image })} />
      <JsonLd
        schema={breadcrumbSchema([
          { name: "Home", url: SITE_CONFIG.baseUrl },
          { name: "Doctors", url: `${SITE_CONFIG.baseUrl}/doctors` },
          {
            name: `${doctor.specialty} in ${district}`,
            url: `${SITE_CONFIG.baseUrl}/doctors?specialty=${doctor.specialty}`,
          },
          { name: doctor.name, url: `${SITE_CONFIG.baseUrl}/doctors/${doc.slug}` },
        ])}
      />

      {/* ── Sticky Top Nav ── */}
      <div className="bg-white/95 backdrop-blur-xl border-b border-slate-100/90 sticky top-0 z-30 shadow-[0_1px_8px_rgba(0,0,0,0.04)]">
        <div className="container mx-auto px-4 max-w-5xl h-14 flex items-center justify-between">
          <Link
            href="/doctors"
            className="flex items-center gap-2 text-slate-500 hover:text-[#205E98] transition-all font-bold text-sm group"
          >
            <div className="p-1.5 rounded-lg group-hover:bg-[#205E98]/6 transition-colors">
              <ArrowLeft className="w-4 h-4" />
            </div>
            <span className="hidden sm:block">Find Doctors</span>
          </Link>

          {/* Profile breadcrumb context */}
          <div className="flex items-center gap-2 text-center">
            <div className="hidden sm:flex flex-col items-center">
              <p className="text-[11px] font-bold text-slate-900 leading-tight line-clamp-1">{doctor.name}</p>
              <p className="text-[10px] text-slate-400">{doctor.specialty} · {district}</p>
            </div>
          </div>

          {/* Availability dot */}
          <div className={`flex items-center gap-1.5 text-[11px] font-bold px-2.5 py-1 rounded-full border ${
            availableToday
              ? "text-emerald-700 bg-emerald-50 border-emerald-200"
              : "text-slate-500 bg-slate-50 border-slate-200"
          }`}>
            <span className={`w-1.5 h-1.5 rounded-full ${availableToday ? "bg-emerald-500 animate-pulse" : "bg-slate-400"}`} />
            {availableToday ? "Available" : "Check"}
          </div>
        </div>
      </div>

      {/* ── Main Content ── */}
      <div className="container mx-auto px-3 sm:px-4 max-w-5xl mt-4 md:mt-6">
        <div className="flex flex-col lg:flex-row gap-5 lg:gap-6">

          {/* Left: Profile content */}
          <div className="flex-1 min-w-0">
            <DoctorProfileView doctor={doctor} relatedDoctors={relatedDoctors} />

            {/* Mobile booking widget (inline, above fixed CTA) */}
            <div className="block lg:hidden mt-4" id="mobile-booking-widget">
              <div className="mb-2">
                <p className="text-[10.5px] font-bold text-slate-400 uppercase tracking-widest px-1">Book Appointment</p>
              </div>
              <BookingWidgetClient doctor={doctor} />
            </div>
          </div>

          {/* Right: Sticky booking sidebar (desktop only) */}
          <div className="lg:w-[340px] xl:w-[360px] shrink-0 hidden lg:block">
            <div className="sticky top-20">
              <div className="mb-2.5">
                <p className="text-[10.5px] font-bold text-slate-400 uppercase tracking-widest">Book Appointment</p>
              </div>
              <BookingWidgetClient doctor={doctor} />
            </div>
          </div>
        </div>
      </div>

      {/* ── Mobile Fixed Bottom CTA bar ── */}
      <div className="fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-xl border-t border-slate-100 shadow-[0_-8px_30px_rgba(0,0,0,0.06)] lg:hidden z-50">
        <div className="container mx-auto px-4 max-w-md py-3 flex items-center gap-3">

          {/* Fee + availability */}
          <div className="shrink-0">
            <p className="text-[9px] text-slate-400 font-bold uppercase tracking-widest leading-none">Consult Fee</p>
            <p className="font-black text-[20px] text-slate-900 leading-tight tabular-nums mt-0.5">
              {doctor.fee}
            </p>
            <div className="flex items-center gap-1 mt-0.5">
              <span className={`w-1.5 h-1.5 rounded-full ${availableToday ? "bg-emerald-500 animate-pulse" : "bg-slate-300"}`} />
              <span className={`text-[9.5px] font-bold ${availableToday ? "text-emerald-600" : "text-slate-400"}`}>
                {availableToday ? "OPD Open Today" : "Check Schedule"}
              </span>
            </div>
          </div>

          {/* CTA */}
          <BookingWidgetClient doctor={doctor} isMobileCTA />
        </div>
      </div>
    </div>
  );
}

