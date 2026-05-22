"use client";

import { motion } from "framer-motion";
import { ArrowRight, Building2, Stethoscope, ShieldCheck, Zap } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export function PartnerCtaSection() {
  return (
    <section className="py-20 md:py-32 relative overflow-hidden bg-slate-950 w-full max-w-full box-border">
      {/* Background Accents */}
      <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-5 pointer-events-none" />
      <div className="absolute top-0 right-0 w-96 h-96 bg-primary/20 rounded-full blur-[120px] pointer-events-none -translate-y-1/2 translate-x-1/3" />
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-emerald-500/20 rounded-full blur-[120px] pointer-events-none translate-y-1/2 -translate-x-1/3" />

      <div className="container mx-auto px-4 max-w-5xl relative z-10 box-border">
        <div className="flex flex-col lg:flex-row items-center gap-10 md:gap-16">
          
          {/* Left Text Content */}
          <motion.div 
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="flex-1 text-center lg:text-left w-full"
          >
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/10 text-white border border-white/20 text-xs font-bold uppercase tracking-widest mb-6 backdrop-blur-sm shadow-xl">
              <Building2 className="w-4 h-4 text-emerald-400" />
              For Doctors & Clinics
            </div>
            
            <h2 className="text-3xl sm:text-4xl lg:text-5xl xl:text-6xl font-black tracking-tight mb-6 text-white leading-[1.1] break-words">
              Grow your practice with <br className="hidden sm:block" />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-cyan-400">
                Bihar&apos;s most trusted platform.
              </span>
            </h2>
            
            <p className="text-base sm:text-lg text-slate-300 mb-6 max-w-2xl mx-auto lg:mx-0 leading-relaxed font-medium">
              Join thousands of independent doctors and multi-specialty hospitals managing their OPD digitally. <strong className="text-white">Zero setup costs</strong>. Maximum patient reach.
            </p>

            <div className="flex flex-wrap items-center justify-center lg:justify-start gap-4 sm:gap-6 mb-8 text-sm font-bold text-slate-400">
              <span className="flex items-center gap-1.5"><ShieldCheck className="w-4 h-4 text-emerald-400" /> Verified Identity</span>
              <span className="flex items-center gap-1.5"><Zap className="w-4 h-4 text-emerald-400" /> Smart OPD Manager</span>
              <span className="flex items-center gap-1.5 bg-emerald-500/10 text-emerald-400 px-2 py-1 rounded-md border border-emerald-500/20">Free for first 50 Clinics</span>
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 w-full">
              <Link href="/partners" className="w-full sm:w-auto">
                <Button className="h-14 px-8 rounded-xl bg-white hover:bg-slate-100 text-slate-900 font-bold text-base shadow-xl transition-all hover:scale-105 group w-full">
                  Partner With Us
                  <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
                </Button>
              </Link>
              <Link href="/partners/onboard" className="w-full sm:w-auto">
                <Button className="h-14 px-8 rounded-xl border-2 border-slate-700 bg-transparent text-white font-bold text-base hover:bg-slate-800 w-full transition-all shadow-none">
                  Start Your Practice Online
                </Button>
              </Link>
            </div>
          </motion.div>

          {/* Right Floating Cards */}
          <motion.div 
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="flex-1 w-full max-w-md lg:max-w-none relative"
          >
            <div className="relative w-full aspect-square sm:aspect-video lg:aspect-square flex items-center justify-center">
              
              {/* Card 1 */}
              <div className="absolute top-10 right-0 sm:right-10 lg:right-0 w-64 bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-5 shadow-[0_8px_30px_rgba(0,0,0,0.12)] z-20 animate-float-slow">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 rounded-full bg-emerald-500 flex items-center justify-center">
                    <ShieldCheck className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <p className="text-white font-bold text-sm">Verified Doctor</p>
                    <p className="text-emerald-400 text-xs font-semibold">Trust Badge Added</p>
                  </div>
                </div>
                <div className="w-full bg-white/10 h-2 rounded-full overflow-hidden">
                  <div className="w-full bg-emerald-400 h-full rounded-full" />
                </div>
              </div>

              {/* Card 2 */}
              <div className="absolute bottom-10 left-0 sm:left-10 lg:left-0 w-64 bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-5 shadow-[0_8px_30px_rgba(0,0,0,0.12)] z-10 animate-float-delayed">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center">
                    <Stethoscope className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <p className="text-white font-bold text-sm">Smart OPD Queue</p>
                    <p className="text-blue-300 text-xs font-semibold">Live Patient Tracking</p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <div className="w-full bg-white/20 h-8 rounded-lg" />
                  <div className="w-1/3 bg-white/20 h-8 rounded-lg" />
                </div>
              </div>

            </div>
          </motion.div>

        </div>
      </div>
      
      <style dangerouslySetInnerHTML={{__html: `
        .animate-float-slow { animation: float 6s ease-in-out infinite; }
        .animate-float-delayed { animation: float 6s ease-in-out 3s infinite; }
        @keyframes float {
          0% { transform: translateY(0px); }
          50% { transform: translateY(-15px); }
          100% { transform: translateY(0px); }
        }
      `}} />
    </section>
  );
}
