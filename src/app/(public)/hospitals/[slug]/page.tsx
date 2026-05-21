import Link from "next/link";
import { Building2, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

export default async function HospitalDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  return (
    <div className="container mx-auto px-4 py-16 md:py-24 max-w-3xl">
      <Link
        href="/hospitals"
        className="inline-flex items-center gap-2 text-sm font-bold text-slate-500 hover:text-primary mb-8"
      >
        <ArrowLeft className="w-4 h-4" /> All Hospitals
      </Link>
      <div className="bg-white rounded-3xl border border-slate-200 p-8 md:p-10 shadow-sm text-center">
        <div className="w-14 h-14 rounded-2xl bg-sky-100 text-sky-600 flex items-center justify-center mx-auto mb-5">
          <Building2 className="w-7 h-7" />
        </div>
        <h1 className="text-2xl font-black text-slate-900 mb-3 capitalize">
          {slug.replace(/-/g, " ")}
        </h1>
        <p className="text-slate-600 font-medium leading-relaxed mb-6">
          This hospital profile is not published yet. Please use doctor search to book care in your area.
        </p>
        <Link href="/doctors">
          <Button className="h-12 px-8 rounded-xl font-bold">Find Available Doctors</Button>
        </Link>
      </div>
    </div>
  );
}
