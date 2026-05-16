"use client";

import Link from "next/link";
import { ShieldCheck, ArrowLeft, HeartPulse } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-[#f7f9fc] flex flex-col items-center justify-center p-4 fade-in-up">
      {/* Brand mark */}
      <div className="w-20 h-20 bg-primary/8 rounded-3xl flex items-center justify-center mb-6 border border-primary/12 shadow-sm">
        <HeartPulse className="w-9 h-9 text-primary" />
      </div>

      {/* Error code */}
      <p className="text-sm font-bold text-primary/60 uppercase tracking-[0.2em] mb-2">Error 404</p>
      <h1 className="text-4xl font-black text-slate-900 mb-2 tracking-tight">Page Not Found</h1>
      <p className="text-slate-500 mb-8 text-center max-w-sm leading-relaxed">
        The page you are looking for doesn&apos;t exist or may have moved.
        Your health data and bookings are safe.
      </p>

      {/* Trust note */}
      <div className="flex items-center gap-2 text-xs text-emerald-700 bg-emerald-50 border border-emerald-100 px-4 py-2 rounded-full mb-8">
        <ShieldCheck className="w-3.5 h-3.5" />
        <span className="font-semibold">Your data is secure</span>
      </div>

      <Link href="/">
        <Button
          aria-label="Return to JivniCare home"
          className="rounded-2xl h-12 px-8 bg-primary hover:bg-primary/90 font-bold text-white flex items-center gap-2 shadow-lg shadow-primary/20"
        >
          <ArrowLeft className="w-4 h-4" /> Return to JivniCare
        </Button>
      </Link>
    </div>
  );
}
