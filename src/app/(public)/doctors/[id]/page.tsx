import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { DOCTORS } from "@/data/mock-data";
import { DoctorProfileView } from "@/components/doctors/profile/DoctorProfileView";
import { BookingWidgetClient } from "@/components/doctors/profile/BookingWidgetClient";
import { generateDoctorMetadata } from "@/lib/seo/metadata";
import { physicianSchema, breadcrumbSchema } from "@/lib/seo/jsonld";
import { JsonLd } from "@/components/seo/JsonLd";

interface PageProps {
  params: Promise<{ id: string }>;
}

export async function generateStaticParams() {
  return DOCTORS.map((d) => ({ id: d.id }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id } = await params;
  const doctor = DOCTORS.find((d) => d.id === id);
  if (!doctor) return { title: "Doctor Not Found | JivniCare" };

  return generateDoctorMetadata({
    ...doctor,
    image: doctor.image,
  });
}

export default async function DoctorProfilePage({ params }: PageProps) {
  const { id } = await params;
  const doctor = DOCTORS.find((d) => d.id === id);

  if (!doctor) notFound();

  const district = doctor.location.split(",").pop()?.trim() ?? "Bihar";

  return (
    <div className="bg-[#f8fafc] min-h-screen pb-24 md:pb-12">
      {/* JSON-LD Structured Data */}
      <JsonLd schema={physicianSchema({ ...doctor, image: doctor.image })} />
      <JsonLd
        schema={breadcrumbSchema([
          { name: "Home", url: "https://jivnicare.in" },
          { name: "Doctors", url: "https://jivnicare.in/doctors" },
          { name: `${doctor.specialty} in ${district}`, url: `https://jivnicare.in/doctors?specialty=${doctor.specialty}` },
          { name: doctor.name, url: `https://jivnicare.in/doctors/${doctor.id}` },
        ])}
      />

      {/* Top Navigation */}
      <div className="bg-white border-b border-slate-100 sticky top-0 z-30">
        <div className="container mx-auto px-4 max-w-7xl h-16 flex items-center">
          <Link
            href="/doctors"
            className="flex items-center gap-2 text-slate-500 hover:text-primary transition-all font-bold text-sm group"
          >
            <div className="p-1.5 rounded-lg group-hover:bg-slate-50 transition-colors">
              <ArrowLeft className="w-4 h-4" />
            </div>
            Back to Search
          </Link>
        </div>
      </div>

      <div className="container mx-auto px-4 max-w-7xl mt-6 md:mt-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Main Content Area */}
          <div className="flex-1">
            <DoctorProfileView doctor={doctor} />
            
            {/* Mobile Inline Booking Widget */}
            <div className="block lg:hidden mt-8" id="mobile-booking-widget">
              <BookingWidgetClient doctor={doctor} />
            </div>
          </div>

          {/* Sticky Booking Sidebar */}
          <div className="lg:w-[400px] shrink-0 relative hidden lg:block">
            <div className="sticky top-24">
              <BookingWidgetClient doctor={doctor} />
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Fixed CTA */}
      <div className="fixed bottom-0 left-0 right-0 p-4 bg-white/90 backdrop-blur-xl border-t border-slate-100 shadow-[0_-10px_40px_rgba(0,0,0,0.05)] lg:hidden z-50">
        <div className="container mx-auto flex items-center justify-between gap-4 max-w-md">
          <div className="shrink-0">
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Fee</p>
            <p className="font-black text-xl text-slate-900">{doctor.fee}</p>
          </div>
          <BookingWidgetClient doctor={doctor} isMobileCTA />
        </div>
      </div>
    </div>
  );
}
