import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { DOCTORS } from "@/data/mock-data";
import { ProfileHeader, ClinicDetails } from "@/components/doctors/profile";
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
    <div className="bg-[#f7f9fc] min-h-screen pb-24 md:pb-12">
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
      <div className="bg-white border-b border-slate-200 sticky top-0 z-30">
        <div className="container mx-auto px-4 max-w-5xl h-16 flex items-center">
          <Link
            href="/doctors"
            className="flex items-center gap-2 text-slate-600 hover:text-[#205E98] transition-colors font-medium"
          >
            <ArrowLeft className="w-5 h-5" /> Back to Search
          </Link>
        </div>
      </div>

      <div className="container mx-auto px-4 max-w-5xl mt-6 md:mt-10">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Main Content Area */}
          <div className="flex-1 space-y-8">
            <ProfileHeader doctor={doctor} />
            <hr className="border-slate-200" />

            <section aria-label="About the doctor">
              <h2 className="text-xl font-bold mb-4">About</h2>
              <p className="text-slate-600 leading-relaxed text-lg">{doctor.about}</p>
            </section>

            <ClinicDetails doctor={doctor} />

            {/* Mobile Inline Booking Widget */}
            <div className="block lg:hidden mt-8" id="mobile-booking-widget">
              <BookingWidgetClient doctor={doctor} />
            </div>
          </div>

          {/* Sticky Booking Sidebar */}
          <div className="lg:w-96 shrink-0 relative hidden lg:block">
            <div className="sticky top-24">
              <BookingWidgetClient doctor={doctor} />
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Fixed CTA */}
      <div className="fixed bottom-0 left-0 right-0 p-4 bg-white border-t border-slate-200 shadow-[0_-10px_40px_rgba(0,0,0,0.05)] lg:hidden z-50">
        <div className="container mx-auto flex items-center justify-between gap-4">
          <div className="shrink-0">
            <p className="text-xs text-slate-500 font-medium">Consultation Fee</p>
            <p className="font-black text-lg text-slate-900">{doctor.fee}</p>
          </div>
          <BookingWidgetClient doctor={doctor} isMobileCTA />
        </div>
      </div>
    </div>
  );
}
