import type { Metadata } from "next";
import Link from "next/link";
import { MapPin, Search } from "lucide-react";
import { ACTIVE_LAUNCH_DISTRICTS, FUTURE_EXPANSION_DISTRICTS, SITE_CONFIG } from "@/lib/seo/metadata";

export const metadata: Metadata = {
  title: "Healthcare by District | JivniCare",
  description:
    "Explore doctors, hospitals, and healthcare services in currently active and future districts. Find verified care in Jamui and Deoghar.",
  keywords:
    "JivniCare districts, doctors in Jamui, doctors in Deoghar, JivniCare active locations, Bihar healthcare expansion",
  openGraph: {
    title: "Healthcare by District | JivniCare",
    description:
      "Explore JivniCare launch geographies and planned expansion districts.",
    url: `${SITE_CONFIG.baseUrl}/districts`,
    siteName: SITE_CONFIG.name,
    images: [{ url: "/og-default.jpg", width: 1200, height: 630 }],
  },
  alternates: { canonical: `${SITE_CONFIG.baseUrl}/districts` },
};

export default function DistrictsIndexPage() {
  return (
    <main className="min-h-screen bg-[#f7f9fc] pb-20">
      {/* Hero */}
      <section className="bg-gradient-to-br from-[#5696C7] to-[#13365a] text-white py-14 px-4">
        <div className="container mx-auto max-w-4xl text-center">
          <div className="inline-flex items-center gap-2 bg-white/15 px-4 py-1.5 rounded-full text-sm font-medium mb-5">
            <MapPin className="w-4 h-4" /> Operational Status
          </div>
          <h1 className="text-3xl md:text-5xl font-black mb-4">
            Active Launch &amp; <span className="text-[#7EC8E3]">Future Expansion</span> Districts
          </h1>
          <p className="text-white/80 text-base md:text-lg max-w-2xl mx-auto">
            Book same-day appointments in active locations, or browse planned locations for our next rollout.
          </p>
        </div>
      </section>

      <div className="container mx-auto max-w-5xl px-4 py-10">
        {/* Active Launch Locations */}
        <h2 className="text-xl font-bold text-slate-900 mb-5 flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
          Currently Active Locations (Launch Geographies)
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-10">
          {ACTIVE_LAUNCH_DISTRICTS.map((district) => (
            <Link
              key={district}
              href={`/districts/${district.toLowerCase()}`}
              className="group bg-white border border-emerald-100 rounded-3xl p-5 hover:shadow-md hover:border-emerald-300 transition-all flex items-center justify-between"
            >
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-emerald-50 rounded-2xl flex items-center justify-center">
                  <MapPin className="w-6 h-6 text-emerald-600" />
                </div>
                <div>
                  <p className="font-bold text-slate-900 group-hover:text-primary transition-colors">
                    {district}
                  </p>
                  <p className="text-xs text-slate-500 font-medium">
                    {district === "Deoghar" ? "Jharkhand" : "Bihar"}
                  </p>
                </div>
              </div>
              <span className="text-xs bg-emerald-50 text-emerald-700 px-3 py-1.5 rounded-xl font-bold border border-emerald-100">
                Currently Active
              </span>
            </Link>
          ))}
        </div>

        {/* Future Expansion Districts */}
        <h2 className="text-xl font-bold text-slate-900 mb-5 flex items-center gap-2">
          <Search className="w-5 h-5 text-primary" /> Future Expansion Districts (Coming Soon)
        </h2>
        <div className="bg-white border border-slate-100 rounded-3xl p-6">
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
            {FUTURE_EXPANSION_DISTRICTS.map((district) => (
              <Link
                key={district}
                href={`/districts/${district.toLowerCase().replace(/\s+/g, "-")}`}
                className="group flex items-center justify-between text-sm font-medium text-slate-700 hover:text-primary hover:bg-primary/5 px-3 py-2.5 rounded-xl transition-all border border-transparent hover:border-slate-100"
              >
                <span>{district}</span>
                <span className="text-[10px] bg-slate-100 text-slate-500 px-1.5 py-0.5 rounded-md font-semibold opacity-70 group-hover:opacity-100">
                  Soon
                </span>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </main>
  );
}
