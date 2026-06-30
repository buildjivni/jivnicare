"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DoctorCard } from "@/components/shared/DoctorCard";
import { staggerContainer, itemVariants } from "@/animations/variants";
import type { Doctor } from "@/types";
import { getStableKey } from "@/lib/getStableKey";

interface VerifiedDoctorsSectionProps {
  doctors: Doctor[];
}

export function VerifiedDoctorsSection({ doctors }: VerifiedDoctorsSectionProps) {
  return (
    <section className="py-12 md:py-20 bg-white relative overflow-hidden">
      <div className="absolute inset-0 bg-slate-50/50 pointer-events-none" />
      <div className="container mx-auto px-4 max-w-6xl relative z-10">
        <div className="flex flex-col md:flex-row items-center justify-between mb-8 md:mb-12 gap-6">
          <div className="max-w-3xl text-center md:text-left">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-100 border border-slate-200 text-slate-600 text-[10px] font-black uppercase tracking-widest mb-4">
              🩺 Featured Specialists
            </div>
            <h2 className="text-3xl md:text-4xl font-black tracking-tight text-slate-900 leading-tight">
              Featured Doctors
            </h2>
            <p className="text-sm md:text-base text-slate-500 font-bold mt-2">
              Top-rated verified professionals available for bookings in Bihar.
            </p>
          </div>
          <Link href="/doctors" className="hidden md:flex text-sm font-black text-white items-center gap-2 bg-[#5696C7] hover:bg-[#184a7a] px-6 py-4 rounded-xl shadow-md hover:shadow-lg transition-all">
            View All Doctors <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        <motion.div
          variants={staggerContainer} initial="hidden"
          whileInView="show" viewport={{ once: true, amount: 0.1 }}
          className="flex overflow-x-auto gap-6 pb-6 snap-x snap-mandatory scrollbar-hide -mx-4 px-4 md:mx-0 md:px-0 md:grid md:grid-cols-2 lg:grid-cols-3 md:gap-8 md:pb-0"
        >
          {doctors.map((doctor, idx) => (
            <motion.div 
              key={getStableKey(doctor, idx)} 
              variants={itemVariants}
              className="shrink-0 snap-start w-[85%] sm:w-[350px] md:w-auto"
            >
              <DoctorCard doctor={doctor} />
            </motion.div>
          ))}
        </motion.div>

        <div className="mt-8 md:hidden">
          <Link href="/doctors">
            <Button variant="outline" className="w-full h-14 rounded-2xl border-slate-200 text-slate-700 font-bold text-base shadow-sm">
              View All Doctors
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
}
