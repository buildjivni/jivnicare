"use client";

import { motion } from "framer-motion";
import { ShieldCheck } from "lucide-react";

export function TrustedBySection() {
  const HOSPITALS = [
    "Ruban Memorial",
    "Paras HMRI",
    "Medanta Patna",
    "Ford Hospital",
    "Apollo Clinic",
    "Kurji Holy Family"
  ];

  return (
    <div className="w-full bg-white py-10 md:py-16 overflow-hidden border-b border-slate-50">
      <div className="container mx-auto px-4 max-w-6xl">
        <div className="flex flex-col items-center gap-10">
          <div className="flex items-center gap-2 px-4 py-1.5 rounded-full bg-slate-50 border border-slate-100 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">
            <ShieldCheck className="w-3.5 h-3.5 text-primary" />
            Empowering Bihar&apos;s Top Medical Centers
          </div>
          
          <div className="w-full relative">
             {/* Scrolling container or static grid */}
             <div className="flex flex-wrap items-center justify-center gap-x-12 gap-y-8 md:gap-x-20">
               {HOSPITALS.map((name) => (
                 <div key={name} className="group">
                    <span className="text-lg md:text-2xl font-black text-slate-200 group-hover:text-slate-900 transition-all duration-500 cursor-default select-none tracking-tight">
                      {name}
                    </span>
                 </div>
               ))}
             </div>
          </div>
          
          <p className="text-xs font-bold text-slate-400 italic">
            Connecting you to 500+ Verified Doctors across Bihar
          </p>
        </div>
      </div>
    </div>
  );
}
