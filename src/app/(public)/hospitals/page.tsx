import Link from "next/link";
import { Building2, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SITE_CONFIG } from "@/lib/seo/metadata";

export const metadata = {
  title: "Hospitals & Clinics | JivniCare",
  description: "Hospital listings on JivniCare are coming soon. Find verified doctors and clinics available today.",
};

export default function HospitalsPage() {
  return (
    <div className="container mx-auto px-4 py-16 md:py-24 max-w-3xl text-center">
      <div className="w-16 h-16 rounded-2xl bg-sky-100 text-sky-600 flex items-center justify-center mx-auto mb-6">
        <Building2 className="w-8 h-8" />
      </div>
      <h1 className="text-3xl md:text-4xl font-black text-slate-900 tracking-tight mb-4">
        Hospital Directory — Coming Soon
      </h1>
      <p className="text-slate-600 font-medium leading-relaxed mb-8">
        {SITE_CONFIG.name} is focused on verified doctor discovery and live OPD queues across active regions.
        Full hospital listings will be added in a future release.
      </p>
      <div className="flex flex-col sm:flex-row gap-3 justify-center">
        <Link href="/doctors">
          <Button className="h-12 px-8 rounded-xl font-bold">
            Find Doctors <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        </Link>
        <Link href="/districts">
          <Button variant="outline" className="h-12 px-8 rounded-xl font-bold">
            Browse Locations
          </Button>
        </Link>
      </div>
    </div>
  );
}
