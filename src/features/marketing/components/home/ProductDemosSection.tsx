"use client";

import { motion } from "framer-motion";
import { Clock, Users, ArrowRight, Activity, CheckCircle2 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

export function ProductDemosSection() {
  return (
    <section className="py-20 bg-slate-50 relative overflow-hidden" aria-label="Product Demos">
      {/* Decorative background accent */}
      <div className="absolute top-0 right-0 w-1/2 h-full bg-blue-50/30 rounded-l-[100px] -z-10 pointer-events-none" />
      
      <div className="container mx-auto px-4 max-w-6xl">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-5xl font-black text-slate-900 tracking-tight mb-4">
            See JivniCare in Action
          </h2>
          <p className="text-lg text-slate-500 font-medium max-w-2xl mx-auto">
            Experience the actual product interfaces used by patients and clinics every day.
          </p>
        </div>

        <div className="grid md:grid-cols-12 gap-12 items-center">
          
          {/* Left: Text & Features List */}
          <div className="md:col-span-5 space-y-6">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-50 border border-blue-100 text-primary text-xs font-black uppercase tracking-wider">
              <Activity className="w-4 h-4 text-primary" /> Live Queue Tracking
            </div>
            <h3 className="text-2xl md:text-3xl font-black text-slate-900 leading-tight">
              Know Exactly When It's Your Turn
            </h3>
            <p className="text-slate-600 font-medium leading-relaxed">
              No more waiting in crowded clinic waiting rooms. Track your exact token status in real-time from your phone, and arrive exactly when the doctor is ready to see you.
            </p>
            
            <ul className="space-y-4 pt-2">
              {[
                "Real-time token updates as doctor consults",
                "Dynamic estimated wait time calculation",
                "Peace of mind with remote queue tracking"
              ].map((text, i) => (
                <li key={i} className="flex items-center gap-3 text-slate-700 font-bold text-sm">
                  <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" />
                  {text}
                </li>
              ))}
            </ul>
          </div>

          {/* Right: Redesigned Showcase (Cabin Illustration + Queue Card) */}
          <div className="md:col-span-7 flex justify-center">
            <motion.div 
              initial={{ opacity: 0, scale: 0.98 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
              className="relative w-full max-w-lg bg-white p-6 rounded-[2.5rem] shadow-xl border border-slate-100/80 overflow-hidden flex flex-col items-stretch gap-6"
            >
              
              {/* Doctor Cabin Scene SVG */}
              <div className="w-full bg-slate-50/60 rounded-3xl p-4 border border-slate-100 relative overflow-hidden flex items-center justify-center min-h-[220px]">
                <svg viewBox="0 0 400 220" fill="none" className="w-full h-auto max-w-[360px] text-slate-400">
                  {/* Floor Line */}
                  <line x1="20" y1="190" x2="380" y2="190" stroke="#E2E8F0" strokeWidth="3" strokeLinecap="round" />
                  
                  {/* Desk */}
                  <rect x="150" y="125" width="100" height="55" rx="6" fill="#E2E8F0" />
                  <rect x="140" y="115" width="120" height="10" rx="4" fill="#94A3B8" />
                  
                  {/* Laptop */}
                  <rect x="188" y="100" width="24" height="15" rx="2" fill="#475569" />
                  <line x1="183" y1="115" x2="217" y2="115" stroke="#475569" strokeWidth="2" />
                  
                  {/* Wall Token Display (TOKEN 11) */}
                  <rect x="165" y="20" width="70" height="34" rx="6" fill="#1E293B" />
                  <text x="200" y="32" fill="#10B981" fontSize="8" fontWeight="bold" textAnchor="middle" letterSpacing="0.5">CURRENT</text>
                  <text x="200" y="47" fill="#10B981" fontSize="13" fontWeight="900" textAnchor="middle">11</text>
                  
                  {/* Doctor Chair */}
                  <rect x="100" y="115" width="28" height="6" rx="3" fill="#64748B" />
                  <line x1="114" y1="121" x2="114" y2="190" stroke="#64748B" strokeWidth="3" />
                  <line x1="100" y1="190" x2="128" y2="190" stroke="#64748B" strokeWidth="3" strokeLinecap="round" />
                  
                  {/* Doctor */}
                  {/* Head */}
                  <circle cx="114" cy="72" r="9" fill="#F1F5F9" stroke="#5696C7" strokeWidth="2" />
                  {/* Body/Coat */}
                  <path d="M102,90 C102,90 106,81 114,81 C122,81 126,90 126,90 L123,130 L105,130 Z" fill="white" stroke="#5696C7" strokeWidth="1.8" />
                  {/* Stethoscope */}
                  <path d="M110,79 C110,86 118,86 118,79" stroke="#3B82F6" strokeWidth="1.5" fill="none" />
                  <line x1="114" y1="84" x2="114" y2="88" stroke="#3B82F6" strokeWidth="1.5" />
                  
                  {/* Patient Chair */}
                  <rect x="272" y="115" width="28" height="6" rx="3" fill="#64748B" />
                  <line x1="286" y1="121" x2="286" y2="190" stroke="#64748B" strokeWidth="3" />
                  <line x1="272" y1="190" x2="300" y2="190" stroke="#64748B" strokeWidth="3" strokeLinecap="round" />
                  
                  {/* Patient */}
                  {/* Head */}
                  <circle cx="286" cy="74" r="8.5" fill="#F1F5F9" stroke="#475569" strokeWidth="1.8" />
                  {/* Body */}
                  <path d="M275,92 C275,92 279,84 286,84 C293,84 297,92 297,92 L293,130 L279,130 Z" fill="#94A3B8" stroke="#475569" strokeWidth="1.8" />
                </svg>
                
                {/* Floating Badge Indicator on Scene */}
                <div className="absolute top-4 right-4 bg-emerald-50 text-emerald-700 font-black text-[9px] uppercase tracking-wider px-2 py-0.5 border border-emerald-100 rounded-full flex items-center gap-1 shadow-sm">
                  <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-ping" />
                  Doctor Consulting
                </div>
              </div>

              {/* Live Queue Status Card (Matches Cabin Current Token: 11) */}
              <div className="bg-white border border-slate-100 rounded-2xl p-5 shadow-lg relative flex flex-col items-stretch text-center">
                <div className="flex items-center justify-between border-b border-slate-50 pb-3 mb-4">
                  <div className="text-left">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">OPD Location</p>
                    <h4 className="text-sm font-black text-slate-800">Dr. Sharma Clinic</h4>
                  </div>
                  <div className="flex items-center gap-1 bg-blue-50 text-primary text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-full border border-blue-100">
                    <span className="w-1.5 h-1.5 bg-primary rounded-full animate-pulse" /> Live Tracking
                  </div>
                </div>
                
                {/* Token Circle */}
                <div className="w-24 h-24 rounded-full border-4 border-primary flex items-center justify-center mx-auto mb-4 bg-blue-50/50 relative">
                  <div className="absolute inset-0 rounded-full border-[6px] border-primary/10 animate-pulse" />
                  <div className="text-center">
                    <span className="block text-3xl font-black text-primary">14</span>
                    <span className="text-[9px] font-black text-slate-400 uppercase tracking-wider">Your Token</span>
                  </div>
                </div>

                {/* Queue Summary Grid */}
                <div className="grid grid-cols-2 gap-3 bg-slate-50 p-3.5 rounded-xl mb-4 border border-slate-100">
                  <div className="text-center">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-wider">Now Consulting</p>
                    <p className="text-base font-black text-slate-900">11</p>
                  </div>
                  <div className="text-center border-l border-slate-200">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-wider">Est. Wait Time</p>
                    <p className="text-base font-black text-slate-900">45 mins</p>
                  </div>
                </div>

                <button 
                  disabled 
                  className="w-full py-3 rounded-xl bg-slate-100 text-slate-400 font-bold text-xs cursor-not-allowed border border-slate-200/50 transition-all select-none"
                >
                  Cancel Booking
                </button>
              </div>

            </motion.div>
          </div>

        </div>
      </div>
    </section>
  );
}
