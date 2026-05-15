"use client";

import { useEffect } from "react";
import { AlertCircle, RefreshCw, Home, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="min-h-screen bg-[#f7f9fc] flex flex-col items-center justify-center p-4 fade-in">
      {/* Icon */}
      <div className="w-20 h-20 bg-red-50 rounded-3xl flex items-center justify-center mb-6 border border-red-100">
        <AlertCircle className="w-9 h-9 text-red-500" />
      </div>

      <h2 className="text-2xl font-black text-slate-900 mb-2 tracking-tight">Something went wrong</h2>
      <p className="text-slate-500 mb-3 text-center max-w-sm leading-relaxed">
        An unexpected error occurred. Please try again — your data and bookings are unaffected.
      </p>

      {/* Trust note */}
      <div className="flex items-center gap-2 text-xs text-emerald-700 bg-emerald-50 border border-emerald-100 px-4 py-2 rounded-full mb-8">
        <ShieldCheck className="w-3.5 h-3.5" />
        <span className="font-semibold">Your health data is safe</span>
      </div>

      <div className="flex items-center gap-3">
        <Button
          onClick={reset}
          className="rounded-2xl h-12 px-6 bg-primary hover:bg-primary/90 font-bold text-white flex items-center gap-2 shadow-lg shadow-primary/20"
        >
          <RefreshCw className="w-4 h-4" /> Try again
        </Button>
        <Link href="/">
          <Button
            variant="outline"
            className="rounded-2xl h-12 px-6 font-bold border-slate-200 text-slate-700 hover:bg-white flex items-center gap-2"
          >
            <Home className="w-4 h-4" /> Home
          </Button>
        </Link>
      </div>
    </div>
  );
}
