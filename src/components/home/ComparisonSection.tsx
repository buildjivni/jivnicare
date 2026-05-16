"use client";

import { motion } from "framer-motion";
import { CheckCircle2, XCircle } from "lucide-react";
import { Logo } from "@/components/brand/Logo";

export function ComparisonSection() {
  return (
    <section className="py-10 md:py-16 bg-white border-t border-slate-100">
      <div className="container mx-auto px-4 max-w-5xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center max-w-3xl mx-auto mb-16"
        >
          <h2 className="text-3xl md:text-5xl font-bold tracking-tight text-slate-900 mb-6">
            The <strong className="text-primary">JivniCare</strong> Advantage
          </h2>
          <p className="text-lg text-slate-600 leading-relaxed">
            See the difference between standing in clinic queues and smart booking with <strong className="text-slate-900">JivniCare</strong>.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
          className="rounded-3xl border border-slate-200/80 bg-white overflow-hidden shadow-xl shadow-slate-200/40"
        >
          {/* Header */}
            <div className="grid grid-cols-3 bg-slate-50 border-b border-slate-200/80 items-center">
              <div className="p-6 md:p-8 text-sm font-bold text-slate-400 uppercase tracking-widest hidden md:block">Experience</div>
              <div className="p-6 md:p-8 text-sm font-bold text-slate-400 uppercase tracking-widest md:hidden">Feature</div>
              <div className="p-6 md:p-8 text-center font-bold text-slate-500 flex flex-col items-center gap-2">
                <span className="bg-slate-200/50 p-2 rounded-full hidden md:flex"><XCircle className="w-5 h-5" /></span>
                The Old Way
              </div>
              <div className="p-6 md:p-8 text-center font-black text-primary flex flex-col items-center gap-2 bg-primary/5 border-x border-primary/10 relative overflow-hidden">
                <div className="absolute top-0 inset-x-0 h-1 bg-[#258C54]" />
                <Logo className="h-6 w-auto" />
              </div>
            </div>
          
          {/* Rows */}
          <div className="divide-y divide-slate-100">
            {[
              { label: "Booking Process", old: "Calling or visiting the clinic", new: "Confirmed booking in 1 click" },
              { label: "Wait Times", old: "Waiting in line for hours", new: "Direct entry at your time" },
              { label: "Doctor Verification", old: "Uncertain about the doctor's quality", new: "100% Verified and top-rated" },
              { label: "Fee Transparency", old: "Revealed only at the clinic", new: "Clear fees upfront, no hidden charges" },
              { label: "Urgent Care", old: "Stressing to find a doctor", new: "Instantly view today's availability" },
            ].map((row, i) => (
              <div key={i} className="grid grid-cols-3 items-stretch border-b border-slate-100 last:border-0 hover:bg-slate-50/50 transition-colors group">
                <div className="p-6 md:p-8 font-semibold text-slate-800 text-sm md:text-base flex items-center">{row.label}</div>
                <div className="p-6 md:p-8 text-center text-slate-500 text-sm md:text-base flex items-center justify-center">{row.old}</div>
                <div className="p-6 md:p-8 text-center font-semibold text-[#258C54] text-sm md:text-base flex items-center justify-center gap-2 bg-primary/5 border-x border-primary/10 group-hover:bg-primary/10 transition-colors">
                  <CheckCircle2 className="w-5 h-5 hidden sm:block text-[#258C54]" /> {row.new}
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
}
