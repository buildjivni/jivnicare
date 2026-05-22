"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { ShieldCheck, HeartPulse, Stethoscope, Baby, Activity, Siren, Calendar, ArrowRight } from "lucide-react";
import { SmartSearchBar } from "@/components/shared/SmartSearchBar";
import { LocationSelector } from "./LocationSelector";
import { TrustBadge } from "@/features/marketing/components/trust/TrustBadge";
import { OperationalProof } from "@/features/marketing/components/trust/OperationalProof";
import { useAuthStore } from "@/features/auth/store/useAuthStore";
import { cn } from "@/lib/utils/utils";

const SPECIALTIES_CARDS = [
  {
    label: "General Physician",
    icon: <Stethoscope className="w-6 h-6" />,
    iconBg: "bg-blue-50 text-[#5298D2] border border-blue-100",
    actionText: "Book Now",
    href: "/doctors?q=General%20Physician"
  },
  {
    label: "Cardiologist",
    icon: <HeartPulse className="w-6 h-6" />,
    iconBg: "bg-emerald-50 text-[#489C66] border border-emerald-100",
    actionText: "Book Now",
    href: "/doctors?q=Cardiologist"
  },
  {
    label: "Dermatologist",
    icon: <Activity className="w-6 h-6" />,
    iconBg: "bg-purple-50 text-purple-600 border border-purple-100",
    actionText: "Book Now",
    href: "/doctors?q=Dermatologist"
  },
  {
    label: "Pediatrician",
    icon: <Baby className="w-6 h-6" />,
    iconBg: "bg-amber-50 text-amber-600 border border-amber-100",
    actionText: "Book Now",
    href: "/doctors?q=Pediatrician"
  },
  {
    label: "Dentist",
    icon: <Stethoscope className="w-6 h-6" />,
    iconBg: "bg-sky-50 text-sky-600 border border-sky-100",
    actionText: "Book Now",
    href: "/doctors?q=Dentist"
  },
  {
    label: "Emergency Support",
    icon: <Siren className="w-6 h-6 text-rose-500 animate-pulse" />,
    iconBg: "bg-rose-50 text-rose-600 border border-rose-100",
    actionText: "Get Care Now",
    href: "/doctors?emergency=true"
  }
];

export function HeroSection() {
  const { isAuthenticated, user } = useAuthStore();
  const [mounted, setMounted] = useState(false);
  
  useEffect(() => setMounted(true), []);
  const isLoggedIn = mounted ? isAuthenticated : false;

  if (isLoggedIn && (user?.role === "DOCTOR" || user?.role === "ADMIN")) return null;

  return (
    <section className="relative w-full max-w-full pt-8 md:pt-20 pb-4 md:pb-12 overflow-hidden bg-white box-border" aria-label="Find Doctors">
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
            className="w-full max-w-4xl bg-white p-2 md:p-3 rounded-[2.5rem] shadow-[0_20px_60px_-15px_rgba(0,0,0,0.08)] border border-slate-200 flex flex-col md:flex-row items-center gap-0 mb-10 relative z-20"
          >
            <LocationSelector 
              className="w-full md:w-auto md:min-w-[220px] shrink-0" 
              buttonClassName="border-transparent shadow-none hover:shadow-none hover:border-transparent bg-transparent hover:bg-slate-50/50"
            />
            
            {/* Desktop Divider */}
            <div className="hidden md:block w-px h-12 bg-slate-200 mx-2 shrink-0" />
            
            {/* Mobile Divider */}
            <div className="md:hidden w-full h-px bg-slate-100 my-2" />

            <div className="flex-1 w-full min-w-0 relative">
              <SmartSearchBar
                district="Patna"
                placeholder="Search doctors, symptoms..."
                className="w-full"
                innerClassName="border-transparent shadow-none hover:shadow-none hover:border-transparent bg-transparent md:h-[60px]"
                disableFocusStyles={true}
              />
            </div>
          </motion.div>

          {/* ── NEW PREMIUM CTA CARD SPECIALTIES GRID ─────────────────────── */}
          <div className="w-full max-w-5xl mt-4 md:mt-6 mb-4 md:mb-12">
            <motion.p 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.25 }}
              className="text-[11px] font-black text-slate-400 uppercase tracking-[0.2em] mb-4 md:mb-6 text-center"
            >
              Common Specialties
            </motion.p>
            
            <motion.div 
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.5 }}
              className="flex overflow-x-auto pb-3 gap-4 px-4 snap-x snap-mandatory md:grid md:grid-cols-2 lg:grid-cols-3 md:gap-6 w-full [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]"
            >
              {SPECIALTIES_CARDS.map((card) => (
                <Link
                  key={card.label}
                  href={card.href}
                  className="w-[260px] sm:w-[280px] shrink-0 snap-start bg-white border border-slate-100 hover:border-slate-200/80 rounded-full p-3.5 md:p-4 flex items-center gap-4.5 shadow-soft hover:shadow-premium hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.98] transition-all duration-300 group cursor-pointer md:w-auto md:shrink"
                >
                  <div className={cn("w-14 h-14 rounded-full flex items-center justify-center shrink-0 transition-all duration-300 shadow-sm", card.iconBg)}>
                    {card.icon}
                  </div>
                  <div className="flex flex-col text-left min-w-0">
                    <span className="text-base md:text-[17px] font-bold text-slate-800 tracking-tight leading-snug truncate">
                      {card.label}
                    </span>
                    <span className="text-[13px] font-bold text-[#5298D2] flex items-center gap-1 mt-0.5 group-hover:text-[#4383be] transition-colors">
                      {card.actionText} <ArrowRight className="w-3.5 h-3.5 transform group-hover:translate-x-1 transition-transform duration-200" />
                    </span>
                  </div>
                </Link>
              ))}
            </motion.div>

            {/* View All Departments Button */}
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="flex justify-center mt-4 md:mt-8"
            >
              <Link href="/doctors">
                <button className="bg-[#5298D2]/10 hover:bg-[#5298D2]/15 text-[#5298D2] font-black text-sm md:text-base px-8 py-3.5 rounded-full flex items-center gap-2 transition-all duration-200 active:scale-[0.97] shadow-sm select-none shrink-0 outline-none">
                  View All Departments <ArrowRight className="w-4 h-4" />
                </button>
              </Link>
            </motion.div>
          </div>

          {/* ── TRUST SIGNALS ── */}
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="flex flex-wrap items-center justify-center gap-6 md:gap-10 pt-5 md:pt-8 border-t border-slate-100 w-full"
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
