"use client";

import { Loader2 } from "lucide-react";

export default function DoctorsLoading() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
      <Loader2 className="w-8 h-8 animate-spin text-[#205E98]" />
      <p className="text-slate-500 font-medium animate-pulse">Loading doctors...</p>
    </div>
  );
}
