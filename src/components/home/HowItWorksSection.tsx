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
    <section id="how-it-works" className="py-20 md:py-32 bg-white relative overflow-hidden">
      <div className="container mx-auto px-4 max-w-6xl relative z-10">
        <div className="text-center max-w-3xl mx-auto mb-16 md:mb-24">
          <h2 className="text-4xl md:text-6xl font-black tracking-tight text-slate-900 mb-6">
            Healthcare made <span className="text-primary">Simple.</span>
          </h2>
          <p className="text-lg md:text-xl text-slate-500 font-medium leading-relaxed">
            Three easy steps to get the medical care you deserve.
          </p>
        </div>

        <motion.div 
          variants={staggerContainer}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true }}
          className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-12"
        >
          {STEPS.map((step, i) => (
            <motion.div 
              key={i}
              variants={fadeUp}
              className="relative group flex flex-col items-center text-center"
            >
              <div className={`w-20 h-20 rounded-[2rem] ${step.color} flex items-center justify-center mb-8 shadow-sm group-hover:scale-110 group-hover:-rotate-3 transition-all duration-500`}>
                {step.icon}
              </div>
              <h3 className="text-2xl font-black text-slate-900 mb-4">{step.title}</h3>
              <p className="text-slate-500 font-medium leading-relaxed px-4">{step.desc}</p>
              
              {i < 2 && (
                <div className="hidden md:block absolute top-10 left-[70%] w-full h-[2px] bg-gradient-to-r from-slate-100 via-slate-200 to-transparent -z-10" />
              )}
            </motion.div>
          ))}
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mt-20 md:mt-32 text-center"
        >
          <Link href="/doctors">
            <Button size="lg" className="h-14 px-10 rounded-2xl bg-primary hover:bg-primary/90 text-white font-black text-lg shadow-floating hover:shadow-premium transition-all active:scale-95 group">
              Start Searching Now
              <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
            </Button>
          </Link>
        </motion.div>
      </div>
    </section>
  );
}
