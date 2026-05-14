"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DoctorCard } from "@/components/shared/DoctorCard";
import { DOCTORS as PATNA_DOCTORS } from "@/data/mock-data";
import { staggerContainer, itemVariants } from "@/animations/variants";


export function AvailableDoctorsSection() {
  return (
    <section className="py-10 md:py-16 bg-slate-50 border-b border-slate-100">
      <div className="container mx-auto px-4 max-w-6xl">
        <div className="flex flex-col md:flex-row items-start md:items-end justify-between mb-12 gap-4">
          <div className="max-w-2xl">
            <h2 className="text-3xl md:text-5xl font-bold tracking-tight text-slate-900 mb-4">Consult a Doctor Today</h2>
            <p className="text-lg text-slate-600">Don&apos;t wait. Book an available appointment for today and get on the path to recovery sooner.</p>
          </div>
          <Link href="/doctors" className="hidden md:flex text-base font-bold text-primary hover:text-[#184a7a] items-center gap-2 bg-white px-6 py-3 rounded-full border border-slate-200 shadow-sm hover:shadow-md transition-all">
          View All Doctors <ArrowRight className="w-4 h-4" />
        </Link>
      </div>

      <motion.div
        variants={staggerContainer} initial="hidden"
        whileInView="show" viewport={{ once: true, margin: "-100px" }}
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
      >
        {PATNA_DOCTORS.slice(0, 3).map((doctor) => (
          <motion.div key={doctor.id} variants={itemVariants}>
            <DoctorCard doctor={doctor} />
          </motion.div>
        ))}
      </motion.div>

      <div className="mt-8 md:hidden">
        <Link href="/doctors">
          <Button variant="outline" className="w-full h-14 rounded-2xl border-slate-200 text-slate-700 font-bold text-base shadow-sm">
            View All Doctors in Patna
          </Button>
        </Link>
      </div>
    </div>
    </section >
  );
}
