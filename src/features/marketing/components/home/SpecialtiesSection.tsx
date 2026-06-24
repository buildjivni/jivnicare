"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Stethoscope, ArrowRight } from "lucide-react";
import { staggerContainer, itemVariants } from "@/animations/variants";

const PRIORITY_SPECIALTIES = [
  { name: 'General Physician', icon: '🩺', id: 'general-physician', color: 'bg-blue-50 text-blue-600 border-blue-100/50' },
  { name: 'Dentist', icon: '🦷', id: 'dentist', color: 'bg-sky-50 text-sky-600 border-sky-100/50' },
  { name: 'Dermatologist & Cosmetologist', icon: '🔬', id: 'dermatologist-cosmetologist', color: 'bg-purple-50 text-purple-600 border-purple-100/50' },
  { name: 'Gynecologist & Obstetrician', icon: '🤱', id: 'gynecologist-obstetrician', color: 'bg-rose-50 text-rose-600 border-rose-100/50' },
  { name: 'Pediatrician', icon: '👶', id: 'pediatrician', color: 'bg-amber-50 text-amber-600 border-amber-100/50' },
  { name: 'Orthopedic Surgeon', icon: '🦴', id: 'orthopedic-surgeon', color: 'bg-orange-50 text-orange-600 border-orange-100/50' },
  { name: 'ENT Specialist', icon: '👂', id: 'ent-specialist', color: 'bg-indigo-50 text-indigo-600 border-indigo-100/50' },
  { name: 'Ophthalmologist', icon: '👁️', id: 'ophthalmologist', color: 'bg-teal-50 text-teal-600 border-teal-100/50' },
  { name: 'Cardiologist', icon: '❤️', id: 'cardiologist', color: 'bg-red-50 text-red-600 border-red-100/50' },
  { name: 'Diabetologist', icon: '💉', id: 'diabetologist', color: 'bg-emerald-50 text-emerald-600 border-emerald-100/50' },
  { name: 'Psychiatrist & Psychologist', icon: '💭', id: 'psychiatrist-psychologist', color: 'bg-pink-50 text-pink-600 border-pink-100/50' },
  { name: 'Physiotherapist', icon: '🏃', id: 'physiotherapist', color: 'bg-lime-50 text-lime-600 border-lime-100/50' },
  { name: 'Neurologist', icon: '🧠', id: 'neurologist', color: 'bg-violet-50 text-violet-600 border-violet-100/50' },
  { name: 'Gastroenterologist', icon: '🫁', id: 'gastroenterologist', color: 'bg-yellow-50 text-yellow-700 border-yellow-100/50' },
  { name: 'Urologist', icon: '🧬', id: 'urologist', color: 'bg-cyan-50 text-cyan-600 border-cyan-100/50' },
  { name: 'Pulmonologist', icon: '🫀', id: 'pulmonologist', color: 'bg-rose-50 text-rose-600 border-rose-100/50' },
  { name: 'Endocrinologist', icon: '⚗️', id: 'endocrinologist', color: 'bg-purple-50 text-purple-600 border-purple-100/50' },
  { name: 'Nephrologist', icon: '💊', id: 'nephrologist', color: 'bg-emerald-50 text-emerald-600 border-emerald-100/50' },
  { name: 'Oncologist', icon: '🎗️', id: 'oncologist', color: 'bg-red-50 text-red-600 border-red-100/50' },
  { name: 'Rheumatologist', icon: '🦵', id: 'rheumatologist', color: 'bg-orange-50 text-orange-600 border-orange-100/50' },
  { name: 'Dietitian & Nutritionist', icon: '🥗', id: 'dietitian-nutritionist', color: 'bg-green-50 text-green-600 border-green-100/50' },
  { name: 'Sexologist', icon: '🔥', id: 'sexologist', color: 'bg-pink-50 text-pink-600 border-pink-100/50' },
  { name: 'Hair & Skin Specialist', icon: '💇', id: 'hair-skin-specialist', color: 'bg-purple-50 text-purple-600 border-purple-100/50' },
  { name: 'Ayurvedic Doctor', icon: '🌿', id: 'ayurvedic-doctor', color: 'bg-emerald-50 text-emerald-700 border-emerald-100/50' },
  { name: 'Homeopathic Doctor', icon: '💧', id: 'homeopathic-doctor', color: 'bg-sky-50 text-sky-600 border-sky-100/50' },
  { name: 'Unani Specialist', icon: '🏺', id: 'unani-specialist', color: 'bg-amber-50 text-amber-700 border-amber-100/50' },
  { name: 'Siddha Specialist', icon: '🍂', id: 'siddha-specialist', color: 'bg-orange-50 text-orange-700 border-orange-100/50' },
  { name: 'Naturopath', icon: '🧘', id: 'naturopath', color: 'bg-green-50 text-green-700 border-green-100/50' },
  { name: 'Geriatrician', icon: '🧓', id: 'geriatrician', color: 'bg-indigo-50 text-indigo-600 border-indigo-100/50' },
  { name: 'Emergency Medicine Specialist', icon: '🚨', id: 'emergency-medicine-specialist', color: 'bg-red-50 text-red-600 border-red-100/50' },
];

import { useState } from "react";

export function SpecialtiesSection() {
  const [isExpanded, setIsExpanded] = useState(false);
  const displayedSpecialties = isExpanded ? PRIORITY_SPECIALTIES : PRIORITY_SPECIALTIES.slice(0, 8);

  return (
    <section className="py-12 md:py-20 bg-white border-b border-slate-100 relative" id="specialties">
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
            href="/specialties"
            className="hidden md:inline-flex shrink-0 items-center gap-2 font-bold text-primary hover:text-[#184a7a] transition-colors group"
          >
            Explore Specialty Guide
            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform duration-200" />
          </Link>
        </div>

        {/* Specialties Grid */}
        <motion.div
          variants={staggerContainer}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, amount: 0.05 }}
          className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4"
        >
          {displayedSpecialties.map((spec, i) => (
            <motion.div
              key={spec.id}
              variants={itemVariants}
              className="group"
            >
              <Link href={`/doctors?speciality=${encodeURIComponent(spec.name)}`}>
                <div
                  className="flex items-center p-4 rounded-2xl border border-slate-100 bg-white transition-all duration-300 hover:shadow-md hover:border-primary/10 cursor-pointer h-full"
                >
                  <div
                    className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 transition-transform duration-300 group-hover:scale-105 shadow-sm text-lg ${spec.color}`}
                  >
                    {spec.icon}
                  </div>
                  <div className="ml-3 min-w-0 flex-1">
                    <h3 className="font-bold text-sm text-slate-800 group-hover:text-primary transition-colors leading-tight whitespace-normal break-words">
                      {spec.name}
                    </h3>
                    <p className="text-[10px] font-semibold text-slate-400 mt-0.5">
                      Book Visit
                    </p>
                  </div>
                </div>
              </Link>
            </motion.div>
          ))}
        </motion.div>

        {/* Action Buttons */}
        <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 font-black text-sm text-primary hover:text-white bg-blue-50/50 hover:bg-primary px-8 py-4 rounded-2xl border border-blue-100/50 transition-all duration-300 shadow-sm"
          >
            {isExpanded ? "Show Less" : "View All 30 Specialties"}
          </button>
          
          <Link
            href="/specialties"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 font-black text-sm text-slate-600 hover:text-slate-950 bg-slate-50 hover:bg-slate-100 px-8 py-4 rounded-2xl border border-slate-200/50 transition-all duration-300"
          >
            Explore Specialty Guide <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </section>
  );
}
