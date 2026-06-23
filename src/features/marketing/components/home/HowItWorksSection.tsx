"use client";

import { motion } from "framer-motion";
import { Search, Calendar, Building2, CheckCircle2, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { fadeUp, staggerContainer } from "@/animations/variants";

export function HowItWorksSection() {
  const STEPS = [
    {
      icon: <Search className="w-7 h-7" />,
      title: "1. Search Doctor",
      desc: "Find the best verified doctors in your city by specialty or hospital.",
      color: "bg-blue-50 text-primary"
    },
    {
      icon: <Calendar className="w-7 h-7" />,
      title: "2. Book Appointment",
      desc: "Select a time slot that works for you and confirm instantly.",
      color: "bg-emerald-50 text-secondary"
    },
    {
      icon: <CheckCircle2 className="w-7 h-7" />,
      title: "3. Visit Clinic",
      desc: "Go to the clinic and see your doctor. No more waiting in long lines.",
      color: "bg-amber-50 text-amber-600"
    }
  ];

  return (
    <section id="how-it-works" className="py-16 md:py-24 bg-white relative overflow-hidden scroll-mt-24">
      <div className="container mx-auto px-4 max-w-6xl relative z-10">
        <div className="text-center max-w-3xl mx-auto mb-12 md:mb-16">
          <h2 className="text-4xl md:text-6xl lg:text-7xl font-black tracking-tight text-slate-900 mb-6">
            Healthcare made <span className="text-primary">Simple.</span>
          </h2>
          <p className="text-xl md:text-2xl text-slate-700 font-bold leading-relaxed">
            Three easy steps to get the medical care you deserve.
          </p>
        </div>

        <motion.div 
          variants={staggerContainer}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true }}
          className="grid grid-cols-1 md:grid-cols-3 gap-8"
        >
          {STEPS.map((step, i) => (
            <motion.div 
              key={i}
              variants={fadeUp}
              className="relative group flex flex-col items-center text-center bg-white border border-slate-100 p-8 rounded-3xl shadow-sm hover:shadow-lg transition-all duration-300"
            >
              <div className={`w-16 h-16 rounded-2xl ${step.color} flex items-center justify-center mb-6 shadow-sm group-hover:scale-110 transition-transform duration-300`}>
                {step.icon}
              </div>
              <h3 className="text-xl font-black text-slate-900 mb-3">{step.title}</h3>
              <p className="text-sm text-slate-500 font-bold leading-relaxed">{step.desc}</p>
            </motion.div>
          ))}
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mt-24 md:mt-40 text-center"
        >
          <Link href="/doctors">
            <Button size="lg" className="h-16 px-12 rounded-2xl bg-secondary hover:bg-secondary/90 text-white font-black text-xl shadow-floating hover:shadow-premium transition-all active:scale-95 group">
              Start Searching Now
              <ArrowRight className="w-6 h-6 ml-3 group-hover:translate-x-2 transition-transform" />
            </Button>
          </Link>
        </motion.div>
      </div>
    </section>
  );
}
