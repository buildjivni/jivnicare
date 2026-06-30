"use client";

import { motion } from "framer-motion";
import { ArrowRight, ShieldCheck, Star, Users, Stethoscope, Building2 } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Logo } from "@/features/marketing/components/brand/Logo";

const TRUST_STATS = [
  { icon: <Users className="w-4 h-4 text-emerald-500" />, value: "Verified", label: "Patient Network" },
  { icon: <Star className="w-4 h-4 text-amber-400" />, value: "4.9/5", label: "Average Rating" },
  { icon: <ShieldCheck className="w-4 h-4 text-blue-500" />, value: "100%", label: "Verified Doctors" },
];

export function CtaBannerSection() {
  return (
    <section className="py-16 md:py-24 relative overflow-hidden bg-white border-t border-slate-100">
      <div className="absolute inset-0 bg-gradient-to-b from-slate-50/50 to-white pointer-events-none" />
      
      <div className="container mx-auto px-4 max-w-6xl relative z-10 space-y-12">
        
        {/* Eyebrow centered logo placement */}
        <div className="flex justify-center">
          <div className="bg-slate-50 border border-slate-100 rounded-3xl p-3 shadow-sm select-none">
            <Logo variant="full" className="h-10 md:h-12 w-auto" />
          </div>
        </div>

        {/* Separated Audience Cards */}
        <div className="grid md:grid-cols-2 gap-8 items-stretch">
          
          {/* Card 1: Patients Block */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="bg-white border border-slate-100/80 rounded-[2rem] p-8 shadow-soft flex flex-col justify-between space-y-8"
          >
            <div className="space-y-4">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 border border-blue-100 text-primary text-xs font-black uppercase tracking-wider">
                <Stethoscope className="w-3.5 h-3.5" /> For Patients
              </span>
              <h3 className="text-3xl font-black text-slate-900 tracking-tight leading-tight">
                Ready to See a <br />Doctor Today?
              </h3>
              <p className="text-slate-500 font-medium text-sm md:text-base leading-relaxed">
                Find local verified doctors, view real-time availability, and book your appointment instantly. Free, fast, and secure.
              </p>
            </div>

            <div className="space-y-6 pt-4 border-t border-slate-50">
              <div className="flex flex-col sm:flex-row gap-3">
                <Link href="/doctors" className="flex-1">
                  <Button className="w-full h-12 rounded-xl bg-primary hover:bg-primary/95 text-white font-bold text-sm shadow-md transition-all">
                    Find a Doctor Now
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </Link>
                <Link href="/doctors" className="flex-1">
                  <Button variant="outline" className="w-full h-12 rounded-xl border-slate-200 text-slate-700 font-bold text-sm hover:bg-slate-50">
                    Browse Specialties
                  </Button>
                </Link>
              </div>

              {/* Patient Trust strip */}
              <div className="flex flex-wrap items-center justify-between gap-4 pt-2">
                {TRUST_STATS.map((s, i) => (
                  <div key={i} className="flex items-center gap-1.5">
                    {s.icon}
                    <span className="font-extrabold text-slate-800 text-xs">{s.value}</span>
                    <span className="text-slate-400 text-[10px] font-bold uppercase tracking-wider">{s.label}</span>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>

          {/* Card 2: Clinics / Doctors Block */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="bg-[#F4F9F4] border border-emerald-100/50 rounded-[2rem] p-8 shadow-soft flex flex-col justify-between space-y-8"
          >
            <div className="space-y-4">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-100 text-[#529C60] text-xs font-black uppercase tracking-wider">
                <Building2 className="w-3.5 h-3.5" /> For Clinics & Doctors
              </span>
              <h3 className="text-3xl font-black text-slate-900 tracking-tight leading-tight">
                Are You a Clinic? <br />Digitize Your OPD.
              </h3>
              <p className="text-slate-500 font-medium text-sm md:text-base leading-relaxed">
                Reduce patient wait times, manage live walk-in queues from a tablet, digitize prescriptions, and grow your clinic's patient bookings.
              </p>
            </div>

            <div className="space-y-4 pt-4 border-t border-emerald-100/40">
              <Link href="/partners/onboard" className="block w-full">
                <Button className="w-full h-12 rounded-xl bg-[#529C60] hover:bg-[#3c723c] text-white font-bold text-sm shadow-md transition-all">
                  Partner With Us
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </Link>
              <p className="text-center text-[11px] text-slate-400 font-bold uppercase tracking-wider">
                Zero setup cost for early partners
              </p>
            </div>
          </motion.div>

        </div>
      </div>
    </section>
  );
}
