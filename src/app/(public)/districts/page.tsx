import type { Metadata } from "next";
import Link from "next/link";
import { MapPin, Search } from "lucide-react";
import { BIHAR_DISTRICTS, SITE_CONFIG } from "@/lib/seo/metadata";

export const metadata: Metadata = {
  title: "Healthcare by District in Bihar | JivniCare",
  description:
    "Explore doctors, hospitals, and healthcare services across all districts of Bihar. Find the best medical care in Patna, Gaya, Muzaffarpur, Darbhanga and more.",
  keywords:
    "Bihar healthcare districts, doctors in Bihar, hospitals Bihar, Patna doctors, Gaya hospitals, Muzaffarpur specialist, JivniCare Bihar",
  openGraph: {
    title: "Healthcare by District in Bihar | JivniCare",
    description:
      "Explore healthcare across all districts of Bihar. Book doctors and hospitals near you.",
    url: `${SITE_CONFIG.baseUrl}/districts`,
    siteName: SITE_CONFIG.name,
    images: [{ url: "/og-default.jpg", width: 1200, height: 630 }],
  },
  alternates: { canonical: `${SITE_CONFIG.baseUrl}/districts` },
};

const FEATURED_DISTRICTS = ["Patna", "Gaya", "Muzaffarpur", "Bhagalpur", "Darbhanga", "Purnia"];

export default function DistrictsIndexPage() {
  return (
    <main className="min-h-screen bg-[#f7f9fc] pb-20">
      {/* Hero */}
      <section className="bg-gradient-to-br from-[#205E98] to-[#13365a] text-white py-14 px-4">
        <div className="container mx-auto max-w-4xl text-center">
          <div className="inline-flex items-center gap-2 bg-white/15 px-4 py-1.5 rounded-full text-sm font-medium mb-5">
            <MapPin className="w-4 h-4" /> Bihar Healthcare Network
          </div>
          <h1 className="text-3xl md:text-5xl font-black mb-4">
            Healthcare Across <span className="text-[#7EC8E3]">All Bihar</span> Districts
          </h1>
          <p className="text-white/80 text-base md:text-lg max-w-2xl mx-auto">
            Discover verified doctors, hospitals, and emergency care in every district of Bihar.
          </p>
        </div>
      </section>

      <div className="container mx-auto max-w-5xl px-4 py-10">
        {/* Featured Districts */}
        <h2 className="text-xl font-bold text-slate-900 mb-5">Featured Districts</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-10">
          {FEATURED_DISTRICTS.map((district) => (
            <Link
              key={district}
              href={`/districts/${district.toLowerCase()}`}
              className="group bg-white border border-slate-100 rounded-3xl p-5 hover:shadow-md hover:border-primary/25 transition-all"
            >
              <div className="w-10 h-10 bg-primary/8 rounded-2xl flex items-center justify-center mb-3">
                <MapPin className="w-5 h-5 text-primary" />
              </div>
              <p className="font-bold text-slate-900 group-hover:text-primary transition-colors">
                {district}
              </p>
              <p className="text-xs text-slate-400 mt-0.5">Bihar</p>
            </Link>
          ))}
        </div>

        {/* All Districts */}
        <h2 className="text-xl font-bold text-slate-900 mb-5 flex items-center gap-2">
          <Search className="w-5 h-5 text-primary" /> All Districts
        </h2>
        <div className="bg-white border border-slate-100 rounded-3xl p-6">
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
            {BIHAR_DISTRICTS.map((district) => (
              <Link
                key={district}
                href={`/districts/${district.toLowerCase().replace(/\s+/g, "-")}`}
                className="text-sm font-medium text-slate-700 hover:text-primary hover:bg-primary/5 px-3 py-2.5 rounded-xl transition-all"
              >
                {district}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </main>
  );
}
