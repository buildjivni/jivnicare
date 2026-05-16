"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import {
  Stethoscope, HeartPulse, Sparkles, Baby, Bone, Brain, ArrowRight
} from "lucide-react";
import { SPECIALTIES } from "@/lib/constants";
import { staggerContainer, itemVariants } from "@/animations/variants";

interface SpecialtiesSectionProps {
  specialties?: Array<{ name: string; id: string }>;
}

const ICONS = [
  <Stethoscope key={0} className="w-6 h-6" />,
  <HeartPulse  key={1} className="w-6 h-6" />,
  <Sparkles    key={2} className="w-6 h-6" />,
  <Baby        key={3} className="w-6 h-6" />,
  <Bone        key={4} className="w-6 h-6" />,
  <Brain       key={5} className="w-6 h-6" />,
  <Stethoscope key={6} className="w-6 h-6" />,
];

const COLOR_SETS = [
  { icon: "bg-blue-50 text-primary",   border: "border-blue-100/50"   },
  { icon: "bg-emerald-50 text-[#258C54]", border: "border-emerald-100/50" },
  { icon: "bg-amber-50 text-amber-600",   border: "border-amber-100/50"   },
  { icon: "bg-purple-50 text-purple-600", border: "border-purple-100/50"  },
  { icon: "bg-orange-50 text-orange-600", border: "border-orange-100/50"  },
  { icon: "bg-indigo-50 text-indigo-600", border: "border-indigo-100/50"  },
  { icon: "bg-blue-50 text-primary",   border: "border-blue-100/50"   },
];

export function SpecialtiesSection({ specialties }: SpecialtiesSectionProps) {
  const displaySpecialties = specialties || SPECIALTIES;

  return (
    <section className="py-10 md:py-16 bg-white border-b border-slate-100 relative" id="specialties">
      <div className="container mx-auto px-4 max-w-6xl">
        <div className="flex flex-col md:flex-row items-start md:items-end justify-between mb-12 gap-6">
          <div className="max-w-xl">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-50/80 text-primary text-xs font-bold uppercase tracking-widest mb-4">
              <Stethoscope className="w-4 h-4" /> Medical Departments
            </div>
            <h2 className="text-3xl md:text-5xl font-black tracking-tight text-slate-900 mb-4 leading-tight">
              Which Specialist Do You <br className="hidden md:block" />Need to See?
            </h2>
            <p className="text-lg md:text-xl text-slate-700 font-bold leading-relaxed">
              We have top specialists for every health concern. Select a department based on your needs and book an appointment instantly.
            </p>
          </div>
          <Link
            href="/doctors"
            className="hidden md:inline-flex shrink-0 items-center gap-2 font-bold text-primary hover:text-[#184a7a] transition-colors group"
          >
            View All Departments
            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform duration-200" />
          </Link>
        </div>

        {/* Horizontal scroll — uses global scrollbar-hide utility from globals.css */}
        <motion.div
          variants={staggerContainer}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, amount: 0.1 }}
          className="flex overflow-x-auto gap-4 md:gap-5 pb-4 md:pb-6 snap-x snap-mandatory scrollbar-hide -mx-4 px-4 md:mx-0 md:px-0"
        >
          {displaySpecialties.map((spec, i) => {
            const colors = COLOR_SETS[i % COLOR_SETS.length];
            const icon   = ICONS[i % ICONS.length];

            return (
              <motion.div
                key={spec.id ?? i}
                variants={itemVariants}
                className="shrink-0 snap-start w-[85%] sm:w-[320px] md:w-[300px]"
              >
                <Link href={`/doctors?specialty=${spec.id}`}>
                  <div
                    className={`group flex items-center p-4 md:p-5 rounded-2xl border bg-white transition-all duration-300 hover:shadow-lg hover:-translate-y-1 hover:border-transparent cursor-pointer ${colors.border}`}
                  >
                    <div
                      className={`w-12 h-12 md:w-14 md:h-14 rounded-2xl flex items-center justify-center shrink-0 transition-transform duration-300 group-hover:scale-110 shadow-sm ${colors.icon}`}
                    >
                      {icon}
                    </div>
                    <div className="ml-4 md:ml-5">
                      <h3 className="font-bold text-base md:text-lg text-slate-800 group-hover:text-slate-900 mb-0.5 md:mb-1">
                        {spec.name}
                      </h3>
                      <p className="text-[10px] md:text-xs font-semibold text-slate-500 flex items-center gap-1">
                        Book Now
                        <ArrowRight className="w-3 h-3 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all text-primary" />
                      </p>
                    </div>
                  </div>
                </Link>
              </motion.div>
            );
          })}
        </motion.div>

        {/* Mobile "View All" CTA */}
        <div className="mt-8 md:hidden flex justify-center">
          <Link
            href="/doctors"
            className="inline-flex items-center gap-2 font-bold text-primary bg-blue-50 hover:bg-blue-100 px-6 py-3 rounded-full transition-colors"
          >
            View All Departments <ArrowRight className="w-5 h-5" />
          </Link>
        </div>
      </div>
    </section>
  );
}
