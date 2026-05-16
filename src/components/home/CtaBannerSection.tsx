"use client";

import { motion } from "framer-motion";
import { ArrowRight, ShieldCheck, Star, Users } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Logo } from "@/components/brand/Logo";

const TRUST_STATS = [
  { icon: <Users className="w-4 h-4 text-emerald-500" />, value: "15,000+", label: "Verified Patients" },
  { icon: <Star className="w-4 h-4 text-amber-400" />, value: "4.9/5", label: "Average Rating" },
  { icon: <ShieldCheck className="w-4 h-4 text-blue-500" />, value: "100%", label: "Verified Doctors" },
];

export function CtaBannerSection() {
  return (
    <section className="py-12 md:py-20 relative overflow-hidden bg-white">
      <div className="absolute inset-0 bg-gradient-to-b from-slate-50 to-white pointer-events-none" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_rgba(32,94,152,0.04)_0%,_transparent_70%)] pointer-events-none" />

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
        className="container mx-auto px-4 max-w-4xl text-center relative z-10"
      >
        <div className="inline-block mb-6">
          <Logo className="h-10 md:h-14 w-auto" />
        </div>

        {/* Social proof bar */}
        <div className="flex flex-wrap items-center justify-center gap-4 md:gap-8 mb-8">
          {TRUST_STATS.map((s, i) => (
            <div key={i} className="flex items-center gap-2">
              {s.icon}
              <span className="font-black text-slate-900 text-sm">{s.value}</span>
              <span className="text-slate-400 text-xs font-medium">{s.label}</span>
            </div>
          ))}
        </div>

        <h2 className="text-4xl md:text-6xl font-black tracking-tight mb-5 text-slate-900 leading-[1.1]">
          Ready to See a Doctor<br className="hidden md:block" /> Today?
        </h2>
        <p className="text-lg md:text-xl text-slate-600 mb-3 max-w-2xl mx-auto leading-relaxed">
          Join <strong className="text-slate-900">15,000+ patients</strong> who trust <span className="text-primary font-black">Jivni</span><span className="text-secondary font-black">Care</span>. Book in under 60 seconds — free, fast, and fully secure.
        </p>
        <p className="text-sm text-emerald-700 font-bold mb-10 flex items-center justify-center gap-2">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse inline-block" />
          Doctors accepting appointments right now
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link href="/doctors">
            <Button className="h-14 px-10 rounded-full bg-primary hover:bg-primary/90 text-white font-bold text-lg shadow-xl shadow-primary/20 transition-all hover:scale-105 group w-full sm:w-auto">
              Find a Doctor Now
              <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
            </Button>
          </Link>
          <Link href="/#specialties">
            <Button variant="outline" className="h-14 px-8 rounded-full border-slate-200 text-slate-700 font-bold text-base hover:bg-slate-50 w-full sm:w-auto">
              Browse by Specialty
            </Button>
          </Link>
        </div>

        <p className="mt-6 text-xs text-slate-400 font-medium">
          No registration required for browsing. Book with OTP verification in 60 seconds.
        </p>
      </motion.div>
    </section>
  );
}
