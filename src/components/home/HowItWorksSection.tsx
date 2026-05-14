"use client";

import { motion } from "framer-motion";
import { CheckCircle2, Search, UserCheck, Calendar, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import { Logo } from "@/components/brand/Logo";
import { fadeUp, staggerContainer } from "@/animations/variants";

export function HowItWorksSection() {
  return (
    <section className="py-10 md:py-16 relative overflow-hidden border-t border-slate-100">
      <div className="absolute inset-0 bg-gradient-to-b from-white to-slate-50/50 pointer-events-none" />
      <div className="container mx-auto px-4 max-w-6xl relative z-10">
        <div className="flex flex-col lg:flex-row items-center gap-12 lg:gap-20">
          <motion.div 
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="lg:w-5/12 space-y-6"
          >
            <h2 className="text-3xl md:text-5xl font-bold tracking-tight text-slate-900 leading-tight">
              Booking an Appointment <br className="hidden lg:block" />
              is Now <span className="text-primary">Effortless</span>.
            </h2>
            <p className="text-lg text-slate-600 leading-relaxed">
              Book an appointment with the best doctors from your phone in just 2 minutes. No tension, no confusion.
            </p>
            
            <div className="relative h-64 sm:h-80 w-full rounded-3xl overflow-hidden shadow-2xl mt-8 border border-slate-200/50">
              <Image 
                src="https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?q=80&w=800&auto=format&fit=crop" 
                alt="Patient interacting with doctor" 
                fill
                className="object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-900/60 to-transparent" />
              <div className="absolute bottom-6 left-6 right-6">
                <div className="bg-white/95 backdrop-blur-md p-4 rounded-2xl shadow-lg flex items-center gap-4">
                  <div className="bg-primary/10 p-2.5 rounded-xl shrink-0">
                    <Logo className="w-6 h-6" />
                  </div>
                  <div>
                    <div className="flex items-center gap-1">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                      <p className="font-bold text-slate-900 text-sm">Appointment Confirmed</p>
                    </div>
                    <p className="text-xs text-slate-500">Dr. Priya Sharma • Today, 10:30 AM</p>
                  </div>
                </div>
              </div>
            </div>
            
            <Button className="mt-8 h-12 px-8 rounded-full bg-primary hover:bg-primary/90 shadow-lg shadow-primary/20 transition-all font-semibold hidden lg:inline-flex text-white">
              Book Now
            </Button>
          </motion.div>

          <motion.div 
            variants={staggerContainer}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, margin: "-100px" }}
            className="lg:w-7/12 grid grid-cols-1 sm:grid-cols-2 gap-6 w-full"
          >
            {[
              { step: "01", icon: <Search className="w-6 h-6 text-primary" />, title: "Search by Health Concern", desc: "Select a doctor or department based on the health issue you need treated." },
              { step: "02", icon: <UserCheck className="w-6 h-6 text-primary" />, title: "Choose the Right Doctor", desc: "Choose the best doctor for you by reviewing their qualifications, experience, and patient feedback." },
              { step: "03", icon: <Calendar className="w-6 h-6 text-primary" />, title: "Pick a Convenient Time", desc: "Book a slot for when you are free. Morning, afternoon, or evening." },
              { step: "04", icon: <ShieldCheck className="w-6 h-6 text-primary" />, title: "Appointment Confirmed!", desc: "Confirm your booking with one click. You will receive the appointment details via SMS instantly." },
            ].map((step, i) => (
              <motion.div key={i} variants={fadeUp} className="relative p-6 md:p-8 rounded-3xl bg-white border border-slate-200/60 shadow-sm hover:border-primary/30 transition-all hover:shadow-lg group">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 rounded-full bg-blue-50 flex items-center justify-center group-hover:scale-110 transition-transform">
                    {step.icon}
                  </div>
                  <div className="text-4xl font-black text-slate-100 tracking-tighter group-hover:text-primary/10 transition-colors">{step.step}</div>
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-2">{step.title}</h3>
                <p className="text-slate-600 leading-relaxed text-sm md:text-base">{step.desc}</p>
              </motion.div>
            ))}
          </motion.div>
          
          <Button className="w-full h-14 rounded-full bg-primary hover:bg-primary/90 shadow-lg shadow-primary/20 transition-all font-semibold lg:hidden text-white">
            Book Now
          </Button>
        </div>
      </div>
    </section>
  );
}
