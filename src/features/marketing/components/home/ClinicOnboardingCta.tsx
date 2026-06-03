"use client";

import { motion } from "framer-motion";
import { ArrowRight, Stethoscope, Building2, TrendingUp, CheckCircle2 } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export function ClinicOnboardingCta() {
  return (
    <section className="py-16 md:py-24 bg-slate-900 relative overflow-hidden" aria-label="For Clinics">
      {/* Decorative */}
      <div className="absolute inset-0 bg-gradient-to-tr from-slate-900 via-blue-900/20 to-slate-900" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-4xl h-96 bg-primary/20 blur-[120px] rounded-full mix-blend-screen pointer-events-none" />

      <div className="container mx-auto px-4 max-w-6xl relative z-10">
        <div className="flex flex-col lg:flex-row items-center gap-12 lg:gap-20">
          
          <div className="flex-1 text-center lg:text-left">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-900/50 border border-blue-800 text-blue-300 text-xs font-black uppercase tracking-widest mb-6">
              <Building2 className="w-4 h-4" />
              For Doctors & Clinics
            </div>
            
            <h2 className="text-4xl md:text-5xl font-black text-white mb-6 leading-tight">
              Grow Your Practice with <br className="hidden md:block" />
              <span className="text-blue-400">JivniCare Partner</span>
            </h2>
            
            <p className="text-lg text-slate-300 mb-8 max-w-xl mx-auto lg:mx-0">
              Join Bihar's fastest-growing healthcare network. Manage your queue, increase visibility, and reduce patient wait times with our powerful clinic dashboard.
            </p>

            <ul className="space-y-4 mb-10 text-left max-w-sm mx-auto lg:mx-0">
              <li className="flex items-center gap-3 text-slate-200 font-medium">
                <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" /> Zero setup cost. Go live in 24 hours.
              </li>
              <li className="flex items-center gap-3 text-slate-200 font-medium">
                <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" /> Smart queue management system.
              </li>
              <li className="flex items-center gap-3 text-slate-200 font-medium">
                <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" /> Reach thousands of new patients.
              </li>
            </ul>

            <Link href="/onboarding">
              <Button className="h-14 px-8 rounded-full bg-white text-slate-900 hover:bg-blue-50 font-black text-lg w-full sm:w-auto shadow-xl shadow-white/10 group transition-all">
                Partner With Us
                <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
              </Button>
            </Link>
          </div>

          <div className="flex-1 w-full max-w-md mx-auto relative">
            <div className="bg-slate-800 rounded-3xl border border-slate-700 p-6 shadow-2xl relative z-10 transform lg:rotate-2 hover:rotate-0 transition-transform duration-500">
              <div className="flex items-center justify-between mb-8">
                <div>
                  <h3 className="text-white font-bold">Today's Queue</h3>
                  <p className="text-sm text-slate-400">Dr. Sharma Clinic</p>
                </div>
                <div className="w-12 h-12 bg-blue-500/20 rounded-full flex items-center justify-center">
                  <TrendingUp className="w-6 h-6 text-blue-400" />
                </div>
              </div>

              <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="flex items-center justify-between bg-slate-900 p-4 rounded-2xl border border-slate-800">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-slate-300 font-bold">
                        {i + 14}
                      </div>
                      <div>
                        <p className="text-slate-200 font-bold text-sm">Patient {i}</p>
                        <p className="text-xs text-emerald-400">Waiting</p>
                      </div>
                    </div>
                    {i === 1 && <span className="text-xs font-bold bg-blue-500 text-white px-2 py-1 rounded-md">Next</span>}
                  </div>
                ))}
              </div>
            </div>
            {/* Background accent */}
            <div className="absolute top-10 -right-10 w-full h-full bg-blue-600/20 rounded-3xl -z-10 blur-2xl" />
          </div>

        </div>
      </div>
    </section>
  );
}
