"use client";

import Link from "next/link";
import { ShieldCheck, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { BrandName } from "@/components/brand/BrandName";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-[#f7f9fc] flex flex-col items-center justify-center p-4">
      <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mb-6 border border-primary/20">
        <ShieldCheck className="w-8 h-8 text-primary" />
      </div>
      <h1 className="text-4xl font-black text-slate-900 mb-2">404</h1>
      <h2 className="text-xl font-bold text-slate-700 mb-4">Page Not Found</h2>
      <p className="text-slate-500 mb-8 text-center max-w-sm">
        The page you are looking for doesn't exist or has been moved.
      </p>
      <Link href="/">
        <Button className="rounded-xl h-12 px-6 bg-primary hover:bg-primary/90 font-bold text-white flex items-center gap-2">
          <ArrowLeft className="w-4 h-4" /> Return to <BrandName />
        </Button>
      </Link>
    </div>
  );
}
