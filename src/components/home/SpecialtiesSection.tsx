"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import {
  Stethoscope, HeartPulse, Sparkles, Baby, Bone, Brain, ArrowRight
} from "lucide-react";
import { SPECIALTIES } from "@/lib/constants";
import { staggerContainer, itemVariants } from "@/animations/variants";


export function SpecialtiesSection() {
  return (
    <section className="py-10 md:py-16 bg-white border-b border-slate-100 relative" id="specialties">
      <div className="container mx-auto px-4 max-w-5xl">
        <div className="flex flex-col md:flex-row items-end justify-between mb-12 gap-6">
          <div className="max-w-xl">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-50/80 text-primary text-xs font-bold uppercase tracking-widest mb-4">
              <Stethoscope className="w-4 h-4" /> Medical Departments
            </div>
            <h2 className="text-3xl md:text-5xl font-bold tracking-tight text-slate-900 mb-4">
              Which Specialist Do You <br className="hidden md:block" />Need to See?
            </h2>
            <p className="text-lg text-slate-600 font-medium">
              We have top specialists for every health concern. Select a department based on your needs and book an appointment instantly.
            </p>
          </div>
          <Link href="/doctors" className="hidden md:inline-flex shrink-0 items-center gap-2 font-bold text-primary hover:text-[#184a7a] transition-colors">
            View All Departments <ArrowRight className="w-5 h-5" />
          </Link>
        </div>

        <motion.div
          variants={staggerContainer} initial="hidden"
          whileInView="show" viewport={{ once: true, margin: "-100px" }}
          className="flex overflow-x-auto gap-4 md:gap-5 pb-4 md:pb-6 snap-x snap-mandatory hide-scrollbar -mx-4 px-4 md:mx-0 md:px-0"
        >
          {SPECIALTIES.map((spec, i) => {
            const icons = [
              <Stethoscope key={0} className="w-6 h-6" />,
              <HeartPulse key={1} className="w-6 h-6" />,
              <Sparkles key={2} className="w-6 h-6" />,
              <Baby key={3} className="w-6 h-6" />,
              <Bone key={4} className="w-6 h-6" />,
              <Brain key={5} className="w-6 h-6" />,
              <Stethoscope key={6} className="w-6 h-6" />,
            ];
            const colors = [
              "bg-blue-50 text-primary border-blue-100/50",
              "bg-emerald-50 text-[#258C54] border-emerald-100/50",
              "bg-amber-50 text-amber-600 border-amber-100/50",
              "bg-purple-50 text-purple-600 border-purple-100/50",
              "bg-orange-50 text-orange-600 border-orange-100/50",
              "bg-indigo-50 text-indigo-600 border-indigo-100/50",
              "bg-blue-50 text-primary border-blue-100/50",
            ];

            return (
            <motion.div key={i} variants={itemVariants} className="shrink-0 snap-start w-[85%] sm:w-[320px] md:w-[300px]">
              <Link href={`/doctors?specialty=${spec.id}`}>
                <div className={`group flex items-center p-4 md:p-5 rounded-2xl border transition-all duration-300 hover:shadow-lg hover:-translate-y-1 cursor-pointer bg-white hover:border-transparent ${colors[i % colors.length].split(" ")[2]}`}>
                  <div className={`w-12 h-12 md:w-14 md:h-14 rounded-2xl flex items-center justify-center shrink-0 transition-transform duration-300 group-hover:scale-110 shadow-sm ${colors[i % colors.length].split(" ").slice(0,2).join(" ")}`}>
                    {icons[i % icons.length]}
                  </div>
                  <div className="ml-4 md:ml-5">
                    <h3 className="font-bold text-base md:text-lg text-slate-800 group-hover:text-slate-900 mb-0.5 md:mb-1">{spec.name}</h3>
                    <p className="text-[10px] md:text-xs font-semibold text-slate-500 flex items-center gap-1">
                      Book Now <ArrowRight className="w-3 h-3 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all text-primary" />
                    </p>
                  </div>
                </div>
              </Link>
            </motion.div>
          )})}
        </motion.div>
        
        <div className="mt-8 md:hidden flex justify-center">
          <Link href="/doctors" className="inline-flex items-center gap-2 font-bold text-primary bg-blue-50 px-6 py-3 rounded-full">
            View All Departments <ArrowRight className="w-5 h-5" />
          </Link>
        </div>
      </div>

      <style jsx global>{`
        .hide-scrollbar::-webkit-scrollbar {
          display: none;
        }
        .hide-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
    </section>
  );
}
