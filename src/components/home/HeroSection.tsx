"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { ShieldCheck, Star } from "lucide-react";
import { SmartSearchBar } from "@/components/shared/SmartSearchBar";
import { LocationSelector } from "./LocationSelector";
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
    <section className="relative w-full max-w-full pt-6 md:pt-16 pb-12 md:pb-24 overflow-hidden bg-slate-50/50 box-border" aria-label="Discovery Hero">
      {/* Soft Background Accents */}
      <div className="absolute top-0 inset-x-0 h-[400px] bg-gradient-to-b from-blue-50/80 via-blue-50/20 to-transparent -z-10" />
      
      <div className="container mx-auto px-4 w-full max-w-4xl relative z-10 box-border">
        <div className="flex flex-col items-center text-center w-full max-w-full">
          
          <motion.h1 
            initial={{ opacity: 0, y: -5 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-2xl sm:text-3xl lg:text-4xl font-black tracking-tight text-slate-900 mb-2 w-full break-words px-2"
          >
            Find & Book Top Doctors
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, y: -5 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-sm md:text-base text-slate-500 font-semibold mb-6 max-w-lg"
          >
            Verified professionals, zero waiting time, and secure bookings.
          </motion.p>

          {/* ── DISCOVERY CONTAINER ───────────────────────── */}
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
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
                  <span className="text-sm">{chip.icon}</span>
                  {chip.label}
                </Link>
              ))}
            </div>
          </motion.div>

          {/* ── OFFICIAL PLATFORM BADGE (Compact) ── */}
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="w-full max-w-sm mx-auto bg-white/70 backdrop-blur-md border border-emerald-100 rounded-2xl p-3 flex items-center justify-center gap-3 shadow-sm box-border"
          >
            <ShieldCheck className="w-5 h-5 text-emerald-500 shrink-0" />
            <span className="text-xs font-bold text-slate-700">100% Private & Verified Healthcare</span>
            <div className="flex items-center gap-1 border-l border-slate-200 pl-3">
               <Star className="w-3.5 h-3.5 text-amber-400 fill-current" />
               <span className="text-xs font-black text-slate-800">4.9</span>
            </div>
          </motion.div>

        </div>
      </div>
    </section>
  );
}
