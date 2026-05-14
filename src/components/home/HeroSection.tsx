"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { ShieldCheck, HeartPulse, Stethoscope, CalendarDays } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { Logo } from "@/components/brand/Logo";
import { BrandName } from "@/components/brand/BrandName";
import { SmartSearchBar } from "@/components/shared/SmartSearchBar";
import { useAuthStore } from "@/store/useAuthStore";
import { Button } from "@/components/ui/button";

const QUICK_CHIPS = [
  { label: "Fever", icon: "🌡️" },
  { label: "Heart", icon: "❤️" },
  { label: "Skin Specialist", icon: "🩺" },
  { label: "Child Specialist", icon: "👶" },
  { label: "Dentist", icon: "🦷" },
  { label: "Emergency", icon: "🚨" },
];

export function HeroSection() {
  const { isAuthenticated, user } = useAuthStore();
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  const isLoggedIn = mounted ? isAuthenticated : false;

  // Prevent UI flash if a doctor or admin momentarily hits the homepage before redirect
  if (isLoggedIn && (user?.role === "DOCTOR" || user?.role === "ADMIN")) {
    return null;
  }

  return (
    <section className="relative pt-2 pb-10 md:pt-6 md:pb-16 overflow-hidden bg-white border-b border-slate-100" aria-label="Hero search section">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-blue-50/80 via-white to-white -z-10" />
      <div className="absolute top-0 right-0 -mr-20 -mt-20 w-[40rem] h-[40rem] bg-blue-100/50 rounded-full blur-3xl -z-10 opacity-70" />
      <div className="absolute top-40 left-0 -ml-20 w-[30rem] h-[30rem] bg-emerald-50/50 rounded-full blur-3xl -z-10 opacity-60" />

      <div className="container mx-auto px-4 max-w-7xl relative z-10">
        <div className="flex flex-col lg:flex-row items-center gap-8 md:gap-12 lg:gap-16">

          {/* ── LEFT: CONTENT ───────────────────────────── */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
            className="lg:w-[55%] space-y-6 text-center lg:text-left pt-2 lg:pt-4"
          >
            {isLoggedIn ? (
              <>
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-bold uppercase tracking-widest shadow-sm">
                  Welcome back, {user?.name?.split(' ')[0] || 'Patient'}
                </div>

                <h1 className="text-4xl leading-[1.2] md:text-5xl lg:text-[4rem] font-black tracking-tighter md:leading-[1.05] text-slate-900">
                  Manage your health, <br />
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#1E5285] to-[#20814D]">
                    All in one place.
                  </span>
                </h1>

                <p className="text-base md:text-xl text-slate-600 max-w-2xl mx-auto lg:mx-0 leading-relaxed font-medium px-2 md:px-0">
                  Track your upcoming appointments, access your medical records, or quickly book a new consultation.
                </p>

                <div className="flex flex-col sm:flex-row items-center gap-3 mt-6 justify-center lg:justify-start">
                  <Link href="/my-bookings" className="w-full sm:w-auto">
                    <Button className="w-full h-12 px-6 rounded-xl bg-primary text-white hover:bg-primary/90 font-bold shadow-md shadow-primary/20 flex items-center gap-2">
                      <CalendarDays className="w-4 h-4" />
                      View My Bookings
                    </Button>
                  </Link>
                  <Link href="/doctors" className="w-full sm:w-auto">
                    <Button variant="outline" className="w-full h-12 px-6 rounded-xl font-bold border-slate-200 flex items-center gap-2">
                      <Stethoscope className="w-4 h-4" />
                      Find a Doctor
                    </Button>
                  </Link>
                </div>

                {/* ── SMART SEARCH BAR ─────────────────────── */}
                <div className="mt-8 max-w-3xl mx-auto lg:mx-0">
                  <SmartSearchBar
                    district="Patna"
                    placeholder="Search for another doctor, specialty…"
                  />
                </div>
              </>
            ) : (
              <>
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-50/80 backdrop-blur-sm border border-emerald-100/50 text-emerald-700 text-xs font-bold uppercase tracking-widest shadow-sm">
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-500 opacity-75" />
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
                  </span>
                  Top Doctors in Bihar
                </div>

                <h1 className="text-4xl leading-[1.2] md:text-6xl lg:text-[5rem] font-black tracking-tighter md:leading-[1.05] text-slate-900">
                  Top Doctors, <br />
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#1E5285] to-[#20814D]">
                    Now on Your Phone.
                  </span>
                </h1>

                <p className="text-base md:text-xl text-slate-600 max-w-2xl mx-auto lg:mx-0 leading-relaxed font-medium px-2 md:px-0">
                  Skip the hospital waiting rooms. Book confirmed appointments with the most trusted and verified doctors in your city from the comfort of your home.
                </p>

                {/* ── SMART SEARCH BAR ─────────────────────── */}
                <div className="mt-6 md:mt-8 max-w-3xl mx-auto lg:mx-0">
                  <SmartSearchBar
                    district="Patna"
                    placeholder="Search doctor, specialty, symptom… (bukhar, pet dard, emergency)"
                  />
                </div>

                {/* ── QUICK CHIP SHORTCUTS ──────────────────── */}
                <div className="flex overflow-x-auto lg:flex-wrap items-center gap-2 pt-2 pb-2 scrollbar-hide -mx-4 px-4 lg:mx-0 lg:px-0" role="list" aria-label="Quick search chips">
                  <span className="text-xs text-slate-400 font-semibold mr-1 uppercase tracking-wider shrink-0">Quick:</span>
                  {QUICK_CHIPS.map((chip) => (
                    <a
                      key={chip.label}
                      role="listitem"
                      href={`/doctors?q=${encodeURIComponent(chip.label)}`}
                      className="px-3.5 py-2 text-xs font-semibold text-slate-600 bg-white hover:bg-white border border-slate-200/60 rounded-full transition-all hover:border-primary/40 hover:text-primary hover:shadow-sm shadow-sm shrink-0 whitespace-nowrap flex items-center gap-1.5"
                      aria-label={`Search for ${chip.label}`}
                    >
                      <span>{chip.icon}</span>
                      {chip.label}
                    </a>
                  ))}
                </div>

                {/* Trust Logos */}
                <div className="pt-8 md:pt-10 mt-2 md:mt-4 border-t border-slate-100/60 flex flex-col items-center lg:items-start">
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">Trusted by Top Hospitals</p>
                  <div className="flex flex-wrap justify-center items-center gap-6 md:gap-16 opacity-60 grayscale hover:grayscale-0 transition-all duration-500">
                    <div className="flex items-center gap-1.5 md:gap-2 font-black text-lg md:text-xl text-slate-800"><ShieldCheck className="w-5 h-5 md:w-6 md:h-6 text-emerald-600" /> PARAS</div>
                    <div className="flex items-center gap-1.5 md:gap-2 font-black text-lg md:text-xl text-slate-800"><HeartPulse className="w-5 h-5 md:w-6 md:h-6 text-blue-600" /> MEDANTA</div>
                    <div className="flex items-center gap-1.5 md:gap-2 font-black text-lg md:text-xl text-slate-800"><Stethoscope className="w-5 h-5 md:w-6 md:h-6 text-indigo-600" /> RUBAN</div>
                  </div>
                </div>
              </>
            )}
          </motion.div>

          {/* ── MOBILE TRUST WIDGET ──────────────────── */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="md:hidden w-full flex justify-center mt-2 mb-4"
          >
            <div className="bg-white/95 backdrop-blur-xl p-4 rounded-[1.5rem] shadow-xl border border-slate-100 flex items-center gap-4 w-[90%] max-w-sm">
              <div className="bg-primary/5 p-2.5 rounded-2xl shrink-0">
                <Logo className="w-8 h-8" />
              </div>
              <div className="text-left">
                <div className="flex items-center gap-1 mb-0.5">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
                  <p className="text-[10px] font-bold text-emerald-600 uppercase tracking-wider">Official Platform</p>
                </div>
                <p className="font-bold text-slate-900 text-sm leading-tight">Instant bookings via <BrandName /></p>
              </div>
            </div>
          </motion.div>

          {/* ── RIGHT: VISUAL STORYTELLING ─────────── */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, x: 30 }}
            animate={{ opacity: 1, scale: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
            className="lg:w-[45%] relative hidden md:block"
          >
            <div className="absolute inset-0 bg-gradient-to-tr from-[#205E98]/10 to-emerald-100/20 rounded-[3rem] transform rotate-3 scale-105" />
            <div className="relative h-[600px] rounded-[3rem] overflow-hidden shadow-2xl border-4 border-white group">
              <Image
                src="https://images.unsplash.com/photo-1638202993928-7267aad84c31?q=80&w=1000&auto=format&fit=crop"
                alt="Modern Healthcare Consultation - Doctor with Patient"
                fill
                className="object-cover transition-transform duration-1000 group-hover:scale-105"
                priority
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-900/40 via-transparent to-transparent pointer-events-none z-10" />
            </div>
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.6, duration: 0.5 }}
              className="absolute -bottom-8 -left-8 bg-white/95 backdrop-blur-xl p-5 rounded-3xl shadow-2xl border border-white/50 flex items-center gap-4 w-72"
            >
              <div className="bg-primary/5 p-2 rounded-2xl shrink-0">
                <Logo className="w-12 h-12" />
              </div>
              <div>
                <div className="flex items-center gap-1 mb-1">
                  <ShieldCheck className="w-4 h-4 text-emerald-500" />
                  <p className="text-xs font-bold text-emerald-600 uppercase tracking-wider">Confirmed</p>
                </div>
                <p className="font-bold text-slate-900 text-sm leading-tight">Your appointment is booked via <BrandName /></p>
              </div>
            </motion.div>
          </motion.div>

        </div>
      </div>
    </section>
  );
}
