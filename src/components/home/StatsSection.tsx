"use client";

import { motion } from "framer-motion";
import { Clock, ShieldCheck, Zap, HeartPulse } from "lucide-react";
import { fadeUp, staggerContainer } from "@/animations/variants";

const STATS = [
  { value: "2 Min", label: "Booking Time", icon: <Zap className="w-6 h-6 text-amber-300" /> },
  { value: "500+", label: "Top Trusted Doctors", icon: <ShieldCheck className="w-6 h-6 text-emerald-300" /> },
  { value: "80%", label: "Reduced Wait Times", icon: <Clock className="w-6 h-6 text-sky-300" /> },
  { value: "50k+", label: "Happy Patients", icon: <HeartPulse className="w-6 h-6 text-rose-300" /> },
];

export function StatsSection() {
  return (
    <section className="py-14 md:py-24 bg-primary relative overflow-hidden">
      {/* Decorative Wave */}
      <div className="absolute inset-0 opacity-10 pointer-events-none">
        <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="absolute w-full h-full">
          <defs>
            <linearGradient id="stat-gradient" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#ffffff" stopOpacity="0.8" />
              <stop offset="100%" stopColor="#ffffff" stopOpacity="0.2" />
            </linearGradient>
          </defs>
          <path d="M0 100 C 20 0 50 0 100 100 Z" fill="url(#stat-gradient)" />
        </svg>
      </div>

      <div className="container mx-auto px-4 max-w-6xl relative z-10">
        <motion.div
          variants={staggerContainer}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, amount: 0.1 }}
          className="grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-12"
        >
          {STATS.map((s) => (
            <motion.div key={s.label} variants={fadeUp} className="flex flex-col items-center text-center text-white">
              <div className="flex items-center justify-center w-12 h-12 md:w-16 md:h-16 rounded-2xl md:rounded-3xl bg-white/10 backdrop-blur-sm mb-5 border border-white/10 shadow-inner">
                {s.icon}
              </div>
              <span className="text-4xl md:text-5xl font-black tracking-tight mb-1">{s.value}</span>
              <span className="text-xs md:text-sm text-blue-100 font-bold uppercase tracking-[0.1em]">{s.label}</span>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
