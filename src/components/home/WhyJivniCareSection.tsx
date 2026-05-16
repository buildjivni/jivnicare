"use client";

import { motion } from "framer-motion";
import { Shield, ShieldCheck, Zap, Clock, HeartHandshake, Users, Activity } from "lucide-react";
import { Logo } from "@/components/brand/Logo";
import Image from "next/image";
import { fadeUp, staggerContainer } from "@/animations/variants";

export function WhyJivniCareSection() {
  return (
    <section className="py-10 md:py-20 bg-slate-50/50">
      <div className="container mx-auto px-4 max-w-6xl">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/5 text-primary text-xs font-bold uppercase tracking-widest mb-6">
              <Shield className="w-4 h-4" /> Trusted Healthcare
            </span>
            <h2 className="text-3xl md:text-5xl font-black tracking-tight text-slate-900 mb-6 leading-tight">
              Why Choose <br className="hidden md:block" />
              <span className="inline-block relative text-primary">
                JivniCare
              </span>
            </h2>
            <p className="text-base md:text-lg text-slate-600 leading-relaxed font-medium">
              Say goodbye to long clinic queues. <strong className="text-slate-900">JivniCare</strong> connects you with the best and most trusted doctors in your city, completely hassle-free.
            </p>
          </motion.div>
        </div>

        <div className="flex flex-col lg:flex-row gap-12 lg:gap-20 items-center">
          {/* ── LEFT: VISUAL ──────────────────────────────── */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
            className="lg:w-[40%] relative hidden lg:block"
          >
            <div className="absolute inset-0 bg-gradient-to-tr from-emerald-100/30 to-[#205E98]/10 rounded-[3rem] transform -rotate-3 scale-105" />
            <div className="relative rounded-[3rem] overflow-hidden shadow-2xl border-4 border-white h-[700px]">
              <Image 
                src="https://images.unsplash.com/photo-1551076805-e1869033e561?q=80&w=1000&auto=format&fit=crop" 
                alt="Trusted JivniCare Doctor" 
                fill
                className="object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-900/60 via-transparent to-transparent" />
              
              <div className="absolute bottom-8 left-8 right-8 text-white">
                <div className="bg-white/90 w-fit px-4 py-2 rounded-xl mb-4 backdrop-blur-sm">
                  <Logo className="h-8 w-auto drop-shadow-md" />
                </div>
                <h3 className="text-2xl font-bold mb-2">Care You Can Trust</h3>
                <p className="text-white/80 text-sm">Join thousands of patients who trust our verified medical professionals.</p>
              </div>
            </div>
          </motion.div>

          {/* ── RIGHT: CARDS ──────────────────────────────── */}
          <motion.div
            variants={staggerContainer}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, amount: 0.1 }}
            className="lg:w-[60%] grid grid-cols-1 sm:grid-cols-2 gap-6 items-start"
          >
            {[
              {
                icon: <Zap className="w-6 h-6 text-primary" />,
                bg: "bg-blue-50/80",
                title: "Confirmed Appointments",
                desc: "Your slot is booked instantly without any confusion or waiting. 100% confirmed bookings.",
              },
              {
                icon: <ShieldCheck className="w-6 h-6 text-[#258C54]" />,
                bg: "bg-emerald-50/80",
                title: "100% Verified Doctors",
                desc: <>We strictly verify the credentials of every doctor on <strong>JivniCare</strong>. Your safety and health are our top priorities.</>,
              },
              {
                icon: <Clock className="w-6 h-6 text-amber-500" />,
                bg: "bg-amber-50/80",
                title: "Zero Waiting Time",
                desc: "Walk into the clinic and consult your doctor immediately. Your time is valuable, so we eliminate the wait.",
              },
              {
                icon: <HeartHandshake className="w-6 h-6 text-rose-500" />,
                bg: "bg-rose-50/80",
                title: "Transparent Pricing",
                desc: "Check the doctor's consultation fee upfront. No extra or hidden charges at the clinic.",
              },
              {
                icon: <Users className="w-6 h-6 text-indigo-500" />,
                bg: "bg-indigo-50/80",
                title: "One App for the Whole Family",
                desc: "Manage appointments for your parents and children easily from a single account.",
              },
              {
                icon: <Activity className="w-6 h-6 text-sky-500" />,
                bg: "bg-sky-50/80",
                title: "All Health Records in One Place",
                desc: "Keep your past prescriptions and health records safe on your phone. Never worry about losing physical files again.",
              },
            ].map((feature, idx) => (
              <motion.div 
                key={idx} 
                variants={fadeUp}
                className={`${idx % 2 !== 0 ? 'sm:mt-12' : ''}`}
              >
                <div className="group bg-white p-6 md:p-8 rounded-3xl md:rounded-[2rem] shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-200/60 hover:shadow-2xl hover:shadow-primary/10 hover:-translate-y-2 hover:border-primary/30 transition-all duration-300 h-full">
                  <div className={`w-12 h-12 md:w-14 md:h-14 rounded-2xl ${feature.bg} flex items-center justify-center mb-5 md:mb-6 group-hover:scale-110 transition-transform duration-300`}>
                    {feature.icon}
                  </div>
                  <h3 className="text-lg md:text-xl font-bold text-slate-900 mb-2 md:mb-3 group-hover:text-primary transition-colors">{feature.title}</h3>
                  <p className="text-slate-500 leading-relaxed text-xs md:text-sm font-medium">{feature.desc}</p>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </div>
    </section>
  );
}
