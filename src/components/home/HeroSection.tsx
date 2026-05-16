"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { ShieldCheck, Thermometer, HeartPulse, Stethoscope, Baby, Activity, Siren, Calendar } from "lucide-react";
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
    <section className="relative w-full max-w-full pt-8 md:pt-20 pb-12 md:pb-32 overflow-hidden bg-white box-border" aria-label="Find Doctors">
      {/* Calm Medical Accents */}
      <div className="absolute top-0 inset-x-0 h-[500px] bg-gradient-to-b from-primary/5 via-primary/2 to-transparent -z-10" />
      <div className="absolute top-[10%] right-[-5%] w-64 h-64 bg-secondary/5 rounded-full blur-3xl -z-10" />
      
      <div className="container mx-auto px-4 w-full max-w-6xl relative z-10 box-border">
        <div className="flex flex-col items-center text-center w-full max-w-full">
          
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6 flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-50 border border-emerald-100 text-secondary text-[11px] font-black uppercase tracking-widest shadow-sm"
          >
            <ShieldCheck className="w-4 h-4" />
            Bihar&apos;s Trusted Healthcare Network
          </motion.div>

          <motion.h1 
            initial={{ opacity: 0, y: -5 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-4xl sm:text-5xl lg:text-7xl font-black tracking-tight text-slate-900 mb-6 w-full break-words leading-[1.05]"
          >
            Book Doctor <br className="hidden sm:block" /> 
            <span className="text-primary">Appointments.</span>
          </motion.h1>
          
          <motion.p 
            initial={{ opacity: 0, y: -5 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
            className="text-base md:text-xl text-slate-500 font-medium mb-12 max-w-2xl leading-relaxed"
          >
            Book your appointment from your phone and skip the long hospital lines. Easy, safe, and 100% verified.
          </motion.p>

          {/* ── DISCOVERY CONTAINER ───────────────────────── */}
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="w-full max-w-3xl bg-white p-2 md:p-3 rounded-[2.5rem] shadow-floating border border-slate-100 flex flex-col md:flex-row gap-2 mb-10"
          >
            <LocationSelector className="w-full md:w-auto md:min-w-[180px] shrink-0" />
            <div className="flex-1 w-full min-w-0">
              <SmartSearchBar
                district="Patna"
                placeholder="Search doctors, symptoms..."
                className="w-full"
                innerClassName="border-transparent shadow-none hover:shadow-none hover:border-transparent bg-slate-50 md:h-[60px]"
              />
            </div>
          </motion.div>

          {/* ── QUICK SHORTCUTS ─────────────────────── */}
          <div className="w-full max-w-full overflow-hidden mb-12">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-5">Common Specialties</p>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="flex flex-wrap items-center justify-center gap-2.5 md:gap-3"
            >
              {QUICK_CHIPS.map((chip) => (
                <Link
                  key={chip.label}
                  href={`/doctors?q=${encodeURIComponent(chip.label)}`}
                  className="px-4 py-2.5 text-xs md:text-sm font-bold text-slate-600 bg-white hover:bg-primary hover:text-white border border-slate-200 rounded-2xl transition-all flex items-center gap-2 shadow-sm shrink-0 active:scale-95 group"
                >
                  <span className="text-slate-400 group-hover:text-white transition-colors">{chip.icon}</span>
                  {chip.label}
                </Link>
              ))}
            </motion.div>
          </div>

          {/* ── TRUST SIGNALS ── */}
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="flex flex-wrap items-center justify-center gap-6 md:gap-10 pt-8 border-t border-slate-50 w-full"
          >
            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center text-primary">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div className="text-left">
                <p className="text-xs font-black text-slate-900 uppercase">100% Verified</p>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">Medical Degrees Checked</p>
              </div>
            </div>
            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-full bg-emerald-50 flex items-center justify-center text-secondary">
                <Calendar className="w-5 h-5" />
              </div>
              <div className="text-left">
                <p className="text-xs font-black text-slate-900 uppercase">Easy Booking</p>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">Confirm in 2 Minutes</p>
              </div>
            </div>
            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-full bg-amber-50 flex items-center justify-center text-amber-600">
                <Siren className="w-5 h-5" />
              </div>
              <div className="text-left">
                <p className="text-xs font-black text-slate-900 uppercase">No Waiting</p>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">Live Queue Tracking</p>
              </div>
            </div>
          </motion.div>

        </div>
      </div>
    </section>
  );
}
