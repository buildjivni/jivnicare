"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { ShieldCheck, CalendarDays, Zap, Star } from "lucide-react";
import { SmartSearchBar } from "@/components/shared/SmartSearchBar";
import { useAuthStore } from "@/store/useAuthStore";
import { cn } from "@/lib/utils";

const QUICK_CHIPS = [
  { label: "Fever", icon: "🌡️" },
  { label: "Heart", icon: "❤️" },
  { label: "Skin", icon: "🩺" },
  { label: "Child", icon: "👶" },
  { label: "Dentist", icon: "🦷" },
  { label: "Emergency", icon: "🚨" },
];

export function HeroSection() {
  const { isAuthenticated, user } = useAuthStore();
  const [mounted, setMounted] = useState(false);
  
  useEffect(() => setMounted(true), []);
  const isLoggedIn = mounted ? isAuthenticated : false;

  if (isLoggedIn && (user?.role === "DOCTOR" || user?.role === "ADMIN")) return null;

  return (
    <section className="relative w-full max-w-full pt-10 md:pt-24 pb-12 md:pb-32 overflow-hidden bg-white box-border" aria-label="Hero">
      {/* Soft Background Accents */}
      <div className="absolute top-0 inset-x-0 h-96 bg-gradient-to-b from-blue-50/50 to-transparent -z-10" />
      <div className="absolute top-20 right-0 w-72 h-72 bg-blue-100/30 rounded-full blur-[100px] -z-10" />
      
      <div className="container mx-auto px-4 w-full max-w-5xl relative z-10 box-border">
        <div className="flex flex-col items-center text-center w-full max-w-full">
          
          {/* Trust Badge */}
          <motion.div 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-50/70 backdrop-blur-md border border-emerald-200/50 text-emerald-800 text-[10px] md:text-xs font-bold uppercase tracking-widest mb-6 shadow-[0_4px_14px_rgba(16,185,129,0.1)] max-w-full overflow-hidden"
          >
            <ShieldCheck className="w-3 h-3 md:w-4 md:h-4 text-emerald-500 shrink-0" />
            <span className="truncate">Top Doctors in Bihar</span>
          </motion.div>

          <motion.h1 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-3xl sm:text-4xl lg:text-5xl xl:text-6xl font-black tracking-tight leading-[1.1] text-slate-900 mb-5 w-full break-words px-2"
          >
            Top Doctors, <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary via-blue-600 to-emerald-600">
              Now on Your Phone.
            </span>
          </motion.h1>

          <motion.p 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-[13px] sm:text-sm md:text-base lg:text-lg text-slate-600 w-full font-medium leading-relaxed mb-6 md:mb-8 break-words px-2 sm:px-4"
          >
            Skip the hospital waiting rooms. Book confirmed appointments with the 
            most trusted doctors in your city from the comfort of your home.
          </motion.p>

          {/* ── SEARCH SYSTEM ───────────────────────── */}
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.3 }}
            className="w-full max-w-full md:max-w-2xl mb-4 px-1 box-border"
          >
            <SmartSearchBar
              district="Patna"
              placeholder="Search doctor, specialty..."
              className="w-full shadow-xl shadow-primary/5 border-slate-200"
            />
          </motion.div>

          {/* ── QUICK SHORTCUTS ─────────────────────── */}
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="w-full max-w-full overflow-x-auto scrollbar-hide py-2 mb-6"
          >
            <div className="flex items-center justify-start md:justify-center gap-2 min-w-max px-2 md:px-0">
              <span className="text-[9px] md:text-[10px] font-bold text-slate-400 uppercase tracking-widest mr-1 shrink-0">Quick:</span>
              {QUICK_CHIPS.map((chip) => (
                <Link
                  key={chip.label}
                  href={`/doctors?q=${encodeURIComponent(chip.label)}`}
                  className="px-2.5 py-1.5 md:px-3.5 md:py-2 text-[10px] md:text-xs font-bold text-slate-600 bg-white hover:bg-slate-50 border border-slate-200 rounded-lg transition-all flex items-center gap-1 shadow-sm shrink-0"
                >
                  <span>{chip.icon}</span>
                  {chip.label}
                </Link>
              ))}
            </div>
          </motion.div>

          {/* ── OFFICIAL PLATFORM BADGE (Compact) ── */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="w-full max-w-full md:max-w-md bg-white/70 backdrop-blur-xl border border-slate-200/50 rounded-2xl p-4 flex items-center gap-4 shadow-[0_8px_30px_rgb(0,0,0,0.04)] box-border mx-2 md:mx-0"
          >
            <div className="w-10 h-10 md:w-12 md:h-12 rounded-xl bg-white flex items-center justify-center shrink-0 shadow-sm">
              <Zap className="w-5 h-5 md:w-6 md:h-6 text-primary animate-pulse shrink-0" />
            </div>
            <div className="text-left flex-1 min-w-0">
              <div className="flex items-center gap-1.5 text-[9px] md:text-[10px] font-bold text-emerald-600 uppercase tracking-wider mb-0.5 truncate">
                <ShieldCheck className="w-3 h-3 shrink-0" /> <span className="truncate">Official Platform</span>
              </div>
              <p className="text-[11px] md:text-sm font-bold text-slate-800 leading-tight truncate">
                Instant bookings via JivniCare
              </p>
            </div>
            <div className="ml-auto flex items-center gap-1 bg-white px-2 py-1 rounded-lg border border-slate-200 shrink-0">
               <Star className="w-3 h-3 text-amber-400 fill-current shrink-0" />
               <span className="text-[10px] font-black text-slate-800 shrink-0">4.9</span>
            </div>
          </motion.div>

        </div>
      </div>
    </section>
  );
}
