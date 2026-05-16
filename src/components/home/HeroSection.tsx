"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { ShieldCheck, Thermometer, HeartPulse, Stethoscope, Baby, Activity, Siren } from "lucide-react";
import { SmartSearchBar } from "@/components/shared/SmartSearchBar";
import { LocationSelector } from "./LocationSelector";
import { TrustBadge } from "@/components/trust/TrustBadge";
import { OperationalProof } from "@/components/trust/OperationalProof";
import { useAuthStore } from "@/store/useAuthStore";
import { cn } from "@/lib/utils";

const QUICK_CHIPS = [
  { label: "General Physician", icon: <Thermometer className="w-3.5 h-3.5" /> },
  { label: "Cardiologist", icon: <HeartPulse className="w-3.5 h-3.5" /> },
  { label: "Dermatologist", icon: <Activity className="w-3.5 h-3.5" /> },
  { label: "Pediatrician", icon: <Baby className="w-3.5 h-3.5" /> },
  { label: "Dentist", icon: <Stethoscope className="w-3.5 h-3.5" /> },
  { label: "Emergency", icon: <Siren className="w-3.5 h-3.5 text-destructive" /> },
];

export function HeroSection() {
  const { isAuthenticated, user } = useAuthStore();
  const [mounted, setMounted] = useState(false);
  
  useEffect(() => setMounted(true), []);
  const isLoggedIn = mounted ? isAuthenticated : false;

  if (isLoggedIn && (user?.role === "DOCTOR" || user?.role === "ADMIN")) return null;

  return (
    <section className="relative w-full max-w-full pt-6 md:pt-16 pb-12 md:pb-24 overflow-hidden bg-slate-50/50 box-border" aria-label="Discovery Hero">
      {/* Soft Background Accents */}
      <div className="absolute top-0 inset-x-0 h-[400px] bg-gradient-to-b from-blue-50/80 via-blue-50/20 to-transparent -z-10" />
      
      <div className="container mx-auto px-4 w-full max-w-5xl relative z-10 box-border">
        <div className="flex flex-col items-center text-center w-full max-w-full">
          
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6"
          >
            <TrustBadge type="privacy" text="HIPAA-Grade Privacy & Security" />
          </motion.div>

          <motion.h1 
            initial={{ opacity: 0, y: -5 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight text-slate-900 mb-4 w-full break-words px-2 leading-tight"
          >
            Premium Healthcare, <br className="hidden sm:block" /> Instantly Accessible.
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, y: -5 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
            className="text-base md:text-lg text-slate-600 font-medium mb-10 max-w-2xl"
          >
            Connect with strictly verified medical professionals and skip the waiting room with live, real-time OPD tracking.
          </motion.p>

          {/* ── DISCOVERY CONTAINER ───────────────────────── */}
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="w-full max-w-2xl bg-white p-3 md:p-4 rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.06)] border border-slate-100 flex flex-col md:flex-row gap-3 mb-6"
          >
            <LocationSelector className="w-full md:w-auto md:max-w-[200px] shrink-0" />
            <div className="flex-1 w-full min-w-0">
              <SmartSearchBar
                district="Patna"
                placeholder="Search doctors, symptoms..."
                className="w-full border-transparent shadow-none hover:shadow-none hover:border-transparent bg-slate-50 md:h-14 rounded-2xl"
              />
            </div>
          </motion.div>

          {/* ── QUICK SHORTCUTS ─────────────────────── */}
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="w-full max-w-full overflow-x-auto scrollbar-hide py-2 mb-8"
          >
            <div className="flex items-center justify-start md:justify-center gap-2 min-w-max px-2 md:px-0">
              {QUICK_CHIPS.map((chip) => (
                <Link
                  key={chip.label}
                  href={`/doctors?q=${encodeURIComponent(chip.label)}`}
                  className="px-3 py-2 text-xs font-bold text-slate-600 bg-white hover:bg-slate-50 border border-slate-200 rounded-xl transition-all flex items-center gap-1.5 shadow-sm shrink-0 active:scale-95"
                >
                  <span className="text-muted-foreground">{chip.icon}</span>
                  {chip.label}
                </Link>
              ))}
            </div>
          </motion.div>

          {/* ── OPERATIONAL PROOF ── */}
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="w-full mt-4"
          >
            <OperationalProof />
          </motion.div>

        </div>
      </div>
    </section>
  );
}
