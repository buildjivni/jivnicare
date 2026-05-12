"use client";

import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Logo } from "@/components/brand/Logo";
import { BrandName } from "@/components/brand/BrandName";

export function CtaBannerSection() {
  return (
    <section className="py-10 md:py-16 relative overflow-hidden bg-white">
      <div className="absolute inset-0 bg-gradient-to-b from-slate-50 to-white pointer-events-none" />
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
        className="container mx-auto px-4 max-w-4xl text-center relative z-10"
      >
        <div className="inline-block mb-8">
          <Logo className="w-16 h-16" />
        </div>
        <h2 className="text-4xl md:text-6xl font-black tracking-tight mb-6 text-slate-900">
          Need to See a Doctor?
        </h2>
        <p className="text-xl text-slate-600 mb-10 max-w-2xl mx-auto leading-relaxed">
          Thousands of patients trust <BrandName />. Booking is 100% free, fast, and secure.
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link href="/doctors">
            <Button className="h-14 px-8 rounded-full bg-[#205E98] hover:bg-[#184a7a] text-white font-bold text-lg shadow-xl shadow-[#205E98]/20 transition-all hover:scale-105 group w-full sm:w-auto">
              Find a Doctor Now
              <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
            </Button>
          </Link>
          <Link href="/#specialties">
            <Button variant="outline" className="h-14 px-8 rounded-full border-slate-300 text-slate-700 font-bold text-lg hover:bg-slate-50 w-full sm:w-auto">
              Search by Specialty
            </Button>
          </Link>
        </div>
      </motion.div>
    </section>
  );
}
