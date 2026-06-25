"use client";

import { useState, useRef } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { 
  Building2, Stethoscope, ArrowRight, ShieldCheck, Zap, CheckCircle2,
  Sparkles, Activity, Award, Clock, Check, Users, Eye, Monitor, Search, MapPin
} from "lucide-react";
import { Button } from "@/components/ui/button";

export default function PartnersPage() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

  // 3D Parallax Mouse movement handler (subtle interactive feel)
  const handleMouseMove = (e: React.MouseEvent) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / rect.height - 0.5;
    setMousePos({ x, y });
  };

  const handleMouseLeave = () => {
    setMousePos({ x: 0, y: 0 });
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#F4F9FD] via-[#FBFDFE] to-[#F4F9FD] text-slate-800 font-sans selection:bg-[#205E98]/20 selection:text-[#205E98] relative overflow-hidden">
      
      {/* ── BACKGROUND SYSTEM ──────────────────────────────────────────────── */}
      <div className="absolute inset-0 w-full h-full overflow-hidden pointer-events-none z-0">
        {/* Soft Healthcare Grid Texture */}
        <svg className="absolute inset-0 w-full h-full stroke-slate-900/[0.02] [mask-image:radial-gradient(100%_80%_at_top_right,white,transparent)]" aria-hidden="true">
          <defs>
            <pattern id="medical-grid" width="32" height="32" patternUnits="userSpaceOnUse" x="100%">
              <path d="M.5 32V.5H32" fill="none" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#medical-grid)" />
        </svg>

        {/* Ambient Calming Glow Orbs */}
        <div className="absolute top-[-10%] right-[-10%] w-[800px] h-[800px] rounded-full bg-gradient-to-br from-[#205E98]/8 to-[#4A8C4A]/4 blur-[130px] opacity-70 animate-pulse duration-[8000ms]" />
        <div className="absolute bottom-[10%] left-[-15%] w-[700px] h-[700px] rounded-full bg-gradient-to-tr from-[#205E98]/6 to-emerald-500/3 blur-[120px] opacity-60 animate-pulse duration-[12000ms]" />
      </div>

      {/* ── HERO SECTION ──────────────────────────────────────────────────── */}
      <section 
        ref={containerRef}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        className="relative pt-10 pb-20 md:pt-20 md:pb-28 overflow-hidden px-4 sm:px-6 z-10"
      >
        <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
          
          {/* LEFT SIDE: Copywriting & High-Trust Positioning */}
          <div className="lg:col-span-6 space-y-8 z-10 relative text-left">
            
            {/* Trust Badge */}
            <motion.div 
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#205E98]/8 border border-[#205E98]/15 text-[#205E98] text-[10px] font-black uppercase tracking-[0.2em] shadow-sm bg-white/50 backdrop-blur-sm"
            >
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#205E98] opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-[#205E98]"></span>
              </span>
              Verified Clinical Infrastructure Network
            </motion.div>

            {/* Typography Hierarchy */}
            <div className="space-y-4">
              <motion.h1 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.1 }}
                className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight leading-[1.1] text-slate-900"
              >
                A Modern Platform <br />
                for <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#205E98] to-[#4A8C4A] drop-shadow-sm">Trusted Doctors.</span>
              </motion.h1>
              
              <motion.p 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
                className="text-slate-600 text-base sm:text-lg max-w-xl leading-relaxed font-medium"
              >
                Modernize your waiting rooms, streamline dynamic OPD flows, and publish verified clinical profiles. Built on regional healthcare infrastructure designed to optimize patient trust and operational simplicity.
              </motion.p>
            </div>

            {/* Premium CTA Buttons */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="flex flex-col sm:flex-row gap-4 pt-2 max-w-md sm:max-w-none"
            >
              <Link href="/partners/onboard" className="flex-1 sm:flex-initial">
                <Button className="w-full sm:min-w-[220px] h-14 rounded-2xl bg-gradient-to-r from-[#205E98] to-[#4A8C4A] hover:from-[#1a4c7a] hover:to-[#3c723c] text-white font-bold text-sm shadow-lg shadow-emerald-500/10 hover:shadow-emerald-500/15 transition-all hover:-translate-y-0.5 active:translate-y-0 duration-300 flex items-center justify-center gap-2 border-none">
                  Join Partner Network
                  <ArrowRight className="w-4 h-4" />
                </Button>
              </Link>
              <Link href="/partners/login" className="flex-1 sm:flex-initial">
                <Button className="w-full sm:min-w-[185px] h-14 rounded-2xl bg-white/80 hover:bg-white border border-[#205E98]/20 hover:border-[#205E98]/35 text-[#205E98] font-bold text-sm hover:-translate-y-0.5 active:translate-y-0 transition-all duration-300 flex items-center justify-center gap-2 shadow-sm backdrop-blur-md">
                  Doctor Sign In
                </Button>
              </Link>
            </motion.div>

            {/* Quick Trust Signals */}
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="flex flex-wrap items-center gap-6 text-[10px] font-black text-slate-500 uppercase tracking-widest pt-2"
            >
              <div className="flex items-center gap-2"><CheckCircle2 className="w-3.5 h-3.5 text-[#4A8C4A]" /> Unified Doctor Onboarding</div>
              <div className="flex items-center gap-2"><CheckCircle2 className="w-3.5 h-3.5 text-[#4A8C4A]" /> Professional Queue Suite</div>
            </motion.div>

          </div>

          {/* RIGHT SIDE: Layered Premium Product Preview Mockups */}
          <div className="lg:col-span-6 relative flex items-center justify-center min-h-[460px] lg:min-h-[500px]">
            
            {/* 3D Coordinate Parallax Box with Responsive Scale Wrapper */}
            <div className="relative w-full max-w-[440px] aspect-square flex items-center justify-center scale-90 sm:scale-100 origin-center transition-all duration-300">
              <div 
                className="relative w-full h-[440px] transition-transform duration-500 ease-out"
                style={{
                  transform: `rotateY(${mousePos.x * 8}deg) rotateX(${-mousePos.y * 8}deg)`,
                  transformStyle: "preserve-3d"
                }}
              >
                {/* Radial Blur Backdrop */}
                <div className="absolute top-[25%] left-[25%] w-[200px] h-[200px] rounded-full bg-[#205E98]/15 blur-[45px] -z-10 animate-pulse" />

                {/* Decorative Circle Orbits */}
                <div className="absolute inset-[-10px] rounded-full border border-dashed border-slate-200/40 animate-[spin_100s_linear_infinite] pointer-events-none" />
                <div className="absolute inset-[-30px] rounded-full border border-dotted border-[#205E98]/8 animate-[spin_150s_linear_infinite] pointer-events-none" />

                {/* LAYER 1: Verified Doctor Profile Card (Center Layer) */}
                <motion.div 
                  initial={{ opacity: 0, scale: 0.95, y: 15 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  transition={{ duration: 0.8, delay: 0.1 }}
                  className="absolute top-[12%] left-[8%] w-[84%] bg-white/90 backdrop-blur-2xl rounded-3xl border border-white/60 p-6 shadow-[0_25px_50px_rgba(32,94,152,0.08)] z-20 hover:border-[#205E98]/20 transition-colors"
                  style={{ transform: "translateZ(30px)" }}
                >
                  <div className="flex items-center gap-4">
                    <div className="relative">
                      <div className="w-14 h-14 rounded-2xl bg-blue-50 flex items-center justify-center border border-[#205E98]/10">
                        <Stethoscope className="w-6 h-6 text-[#205E98]" />
                      </div>
                      <span className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-emerald-500 border-2 border-white rounded-full" />
                    </div>
                    <div>
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <h3 className="font-bold text-slate-800 text-sm sm:text-base tracking-tight leading-none">
                          Dr. Aman Raj, MD
                        </h3>
                        <span className="inline-flex items-center justify-center w-4 h-4 bg-[#205E98]/10 rounded-full shrink-0">
                          <Check className="w-2.5 h-2.5 text-[#205E98]" />
                        </span>
                      </div>
                      <p className="text-slate-500 text-[10px] sm:text-xs font-semibold mt-1">General Medicine &bull; Patna City</p>
                    </div>
                  </div>

                  {/* Registry Details */}
                  <div className="mt-5 pt-4 border-t border-slate-100/80 flex items-center justify-between text-[11px] sm:text-xs text-slate-500">
                    <div className="flex items-center gap-1.5">
                      <Award className="w-3.5 h-3.5 text-[#205E98]" />
                      <span>NMC ID: <span className="font-bold text-slate-700">84729-BR</span></span>
                    </div>
                    <span className="px-2 py-0.5 bg-emerald-50 border border-emerald-100 text-[#4A8C4A] rounded text-[9px] font-bold">
                      ACTIVE REGISTRY
                    </span>
                  </div>
                </motion.div>

                {/* LAYER 2: Floating Live OPD Queue Panel (Top Right - High Depth) */}
                <motion.div 
                  initial={{ opacity: 0, x: 25, y: -15 }}
                  animate={{ opacity: 1, x: 0, y: 0 }}
                  transition={{ duration: 0.8, delay: 0.3 }}
                  className="absolute top-[2%] right-[-4%] w-[200px] bg-white/95 backdrop-blur-xl rounded-2xl border border-white/60 p-4 shadow-[0_20px_40px_rgba(82,152,210,0.06)] z-30"
                  style={{ transform: "translateZ(80px)" }}
                >
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">OPD Queue</span>
                    <span className="px-2 py-0.5 bg-[#205E98]/10 border border-[#205E98]/20 text-[#205E98] rounded-full text-[9px] font-bold flex items-center gap-1">
                      <span className="relative flex h-1.5 w-1.5">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#205E98] opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-[#205E98]"></span>
                      </span>
                      LIVE
                    </span>
                  </div>
                  
                  <div className="space-y-2 text-left">
                    {[
                      { token: "T-14", name: "R. K. Sharma", time: "Waiting", active: false },
                      { token: "T-15", name: "Anjali Sinha", time: "Next In", active: true }
                    ].map((p, idx) => (
                      <div key={idx} className={`p-2 rounded-xl border flex items-center justify-between transition-all duration-200 ${p.active ? 'bg-sky-50/40 border-sky-100' : 'bg-slate-50/50 border-slate-100/85'}`}>
                        <div className="flex items-center gap-1.5 min-w-0">
                          <span className={`text-[8px] sm:text-[9px] font-bold px-1 py-0.5 rounded shrink-0 ${p.active ? 'bg-[#205E98]/10 text-[#205E98]' : 'bg-slate-200/50 text-slate-500'}`}>{p.token}</span>
                          <span className={`text-[10px] sm:text-[11px] font-bold truncate ${p.active ? 'text-slate-800' : 'text-slate-500'}`}>{p.name}</span>
                        </div>
                        <span className={`text-[8px] sm:text-[9px] font-bold shrink-0 ${p.active ? 'text-[#4A8C4A] animate-pulse' : 'text-slate-400'}`}>{p.time}</span>
                      </div>
                    ))}
                  </div>
                </motion.div>

                {/* LAYER 3: Clinic Operations Card (Bottom Left - Moderate Depth) */}
                <motion.div 
                  initial={{ opacity: 0, x: -25, y: 15 }}
                  animate={{ opacity: 1, x: 0, y: 0 }}
                  transition={{ duration: 0.8, delay: 0.4 }}
                  className="absolute bottom-[2%] left-[-4%] w-[220px] bg-white/95 backdrop-blur-xl rounded-2xl border border-white/60 p-4 shadow-[0_20px_40px_rgba(82,152,210,0.06)] z-30"
                  style={{ transform: "translateZ(40px)" }}
                >
                  <div className="flex items-center justify-between mb-3 pb-2 border-b border-slate-100">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">OPD Load</span>
                    <span className="text-[10px] font-bold text-[#4A8C4A] flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3 text-[#4A8C4A]" /> Balanced
                    </span>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div className="p-2 rounded-xl bg-slate-50/60 border border-slate-100 text-left">
                      <p className="text-[8px] text-slate-450 font-bold uppercase">Avg Wait</p>
                      <p className="text-xs font-extrabold text-[#205E98] mt-0.5">8 Mins</p>
                    </div>
                    <div className="p-2 rounded-xl bg-slate-50/60 border border-slate-100 text-left">
                      <p className="text-[8px] text-slate-450 font-bold uppercase">Patient Flow</p>
                      <p className="text-xs font-extrabold text-slate-800 mt-0.5">48 Daily</p>
                    </div>
                  </div>
                </motion.div>

                {/* LAYER 4: JivniCare Platform Seal */}
                <motion.div 
                  initial={{ opacity: 0, scale: 0.85 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.8, delay: 0.5 }}
                  className="absolute bottom-[18%] right-[-6%] z-40 bg-white border border-[#205E98]/20 backdrop-blur-2xl rounded-2xl p-3 flex items-center gap-2.5 shadow-lg text-left"
                  style={{ transform: "translateZ(90px)" }}
                >
                  <div className="w-8 h-8 rounded-xl bg-sky-50 border border-sky-100 flex items-center justify-center">
                    <ShieldCheck className="w-4 h-4 text-[#205E98]" />
                  </div>
                  <div>
                    <p className="text-[8px] font-bold text-[#205E98] uppercase tracking-wider">Verification</p>
                    <p className="text-[10px] font-bold text-slate-800">State Validated</p>
                  </div>
                </motion.div>

              </div>
            </div>

          </div>

        </div>
      </section>

      {/* ── SECTION TRANSITION BANNER ──────────────────────────────────────── */}
      <section className="border-y border-[#5298D2]/10 bg-white/40 backdrop-blur-md relative z-10 py-6 px-4">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row justify-between items-center gap-4">
          <span className="text-xs font-black text-slate-500 uppercase tracking-[0.2em] flex items-center gap-2">
            <Zap className="w-4 h-4 text-[#5298D2]" /> CLINICAL CAPABILITIES
          </span>
          <div className="flex flex-wrap justify-center sm:justify-end items-center gap-6 md:gap-10">
            {[
              "Dynamic OPD Schedulers",
              "Patient Origin Geo-Mapping",
              "NMC Guidelines Compliance",
              "Wait Time Optimization"
            ].map((capability, idx) => (
              <div key={idx} className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 bg-[#5298D2] rounded-full" />
                <span className="text-xs font-bold text-slate-700">{capability}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── WHY PARTNER WITH JIVNICARE ───────────────────────────────────── */}
      <section id="why-partner" className="py-20 md:py-28 relative z-10 px-4 border-b border-slate-100/80 bg-white/20">
        <div className="max-w-6xl mx-auto">
          <div className="text-center max-w-2xl mx-auto mb-16 space-y-4">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-blue-50 border border-blue-200/50 text-[#205E98] rounded-full text-[10px] font-bold uppercase tracking-widest bg-white">
              WHY DOCTORS CHOOSE JIVNICARE
            </span>
            <h2 className="text-3xl md:text-5xl font-black text-slate-900 tracking-tight leading-tight">
              Built Around Your Clinic's Real Problems.
            </h2>
            <p className="text-slate-600 text-base md:text-lg font-medium leading-relaxed">
              Stop managing chaos. JivniCare provides clinic owners and practitioners with clean, modern utility to run an efficient OPD.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-8">
            {[
              {
                icon: <Users className="w-5 h-5 text-[#205E98]" />,
                title: "Quiet Your Front Desk",
                desc: "End the constant barrage of phone calls and check-in chaos. Our automated patient flow keeps your lobby peaceful and organized.",
                iconBg: "bg-blue-50 border-blue-100"
              },
              {
                icon: <Eye className="w-5 h-5 text-[#4A8C4A]" />,
                title: "Your Entire Day, in One Click",
                desc: "Never ask your receptionist for patient updates again. See your complete, live OPD queue at a glance, directly from your screen.",
                iconBg: "bg-emerald-50 border-emerald-100"
              },
              {
                icon: <Monitor className="w-5 h-5 text-indigo-600" />,
                title: "Monitor Your Clinic From Anywhere",
                desc: "Step away without losing touch. Keep a real-time eye on patient check-ins, consultation speeds, and wait times from your phone.",
                iconBg: "bg-indigo-50 border-indigo-100"
              },
              {
                icon: <MapPin className="w-5 h-5 text-amber-600" />,
                title: "Know Exactly Where Your Patients Travel From",
                desc: "Discover which neighborhoods your patients live in. Make smarter decisions about clinic hours, staffing, and community outreach.",
                iconBg: "bg-amber-50 border-amber-100"
              },
              {
                icon: <Search className="w-5 h-5 text-pink-600" />,
                title: "Get Found by Nearby Patients",
                desc: "Stand out to patients actively searching for your specialty in your district. Fill open slots and grow your patient base naturally.",
                iconBg: "bg-pink-50 border-pink-100"
              }
            ].slice(0, 3).map((benefit, i) => (
              <motion.div 
                key={i}
                initial={{ opacity: 0, y: 15 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-80px" }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                className="lg:col-span-2 group rounded-[2rem] p-8 bg-white border border-slate-100/90 shadow-[0_12px_30px_rgba(82,152,210,0.03)] hover:shadow-[0_20px_45px_rgba(82,152,210,0.08)] transition-all duration-300 text-left"
              >
                <div className={"w-10 h-10 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-[1.03] transition-transform border " + benefit.iconBg}>
                  {benefit.icon}
                </div>
                <h3 className="text-lg font-bold text-slate-900 mb-2.5 tracking-tight leading-snug">{benefit.title}</h3>
                <p className="text-slate-600 text-sm leading-relaxed font-semibold">{benefit.desc}</p>
              </motion.div>
            ))}
            {[
              {
                icon: <Users className="w-5 h-5 text-[#205E98]" />,
                title: "Quiet Your Front Desk",
                desc: "End the constant barrage of phone calls and check-in chaos. Our automated patient flow keeps your lobby peaceful and organized.",
                iconBg: "bg-blue-50 border-blue-100"
              },
              {
                icon: <Eye className="w-5 h-5 text-[#4A8C4A]" />,
                title: "Your Entire Day, in One Click",
                desc: "Never ask your receptionist for patient updates again. See your complete, live OPD queue at a glance, directly from your screen.",
                iconBg: "bg-emerald-50 border-emerald-100"
              },
              {
                icon: <Monitor className="w-5 h-5 text-indigo-600" />,
                title: "Monitor Your Clinic From Anywhere",
                desc: "Step away without losing touch. Keep a real-time eye on patient check-ins, consultation speeds, and wait times from your phone.",
                iconBg: "bg-indigo-50 border-indigo-100"
              },
              {
                icon: <MapPin className="w-5 h-5 text-amber-600" />,
                title: "Know Exactly Where Your Patients Travel From",
                desc: "Discover which neighborhoods your patients live in. Make smarter decisions about clinic hours, staffing, and community outreach.",
                iconBg: "bg-amber-50 border-amber-100"
              },
              {
                icon: <Search className="w-5 h-5 text-pink-600" />,
                title: "Get Found by Nearby Patients",
                desc: "Stand out to patients actively searching for your specialty in your district. Fill open slots and grow your patient base naturally.",
                iconBg: "bg-pink-50 border-pink-100"
              }
            ].slice(3).map((benefit, i) => (
              <motion.div 
                key={i + 3}
                initial={{ opacity: 0, y: 15 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-80px" }}
                transition={{ duration: 0.5, delay: (i + 3) * 0.1 }}
                className="lg:col-span-2 lg:first:col-start-2 group rounded-[2rem] p-8 bg-white border border-slate-100/90 shadow-[0_12px_30px_rgba(82,152,210,0.03)] hover:shadow-[0_20px_45px_rgba(82,152,210,0.08)] transition-all duration-300 text-left"
              >
                <div className={"w-10 h-10 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-[1.03] transition-transform border " + benefit.iconBg}>
                  {benefit.icon}
                </div>
                <h3 className="text-lg font-bold text-slate-900 mb-2.5 tracking-tight leading-snug">{benefit.title}</h3>
                <p className="text-slate-600 text-sm leading-relaxed font-semibold">{benefit.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── VALUE PROPOSITIONS & INFRASTRUCTURE ────────────────────────────── */}
      <section id="infrastructure" className="py-20 md:py-28 relative z-10 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center max-w-2xl mx-auto mb-16 space-y-4">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-blue-50/50 border border-blue-200/50 text-[#205E98] rounded-full text-[10px] font-bold uppercase tracking-widest bg-white">
              <Sparkles className="w-3.5 h-3.5 text-[#205E98]" /> Platform Architecture
            </span>
            <h2 className="text-3xl md:text-5xl font-black text-slate-900 tracking-tight leading-tight">
              Clinical infrastructure, digital simplicity.
            </h2>
            <p className="text-slate-650 text-base md:text-lg font-medium leading-relaxed">
              Modern doctors need robust, lightweight operational software to scale practice discovery without compromising clinical safety.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                icon: <Building2 className="w-5 h-5 text-[#205E98]" />,
                title: "Practice Discoverability",
                desc: "Appear immediately in search indices. Let patients in your city locate you based on specific specializations and OPD availability.",
                border: "hover:border-[#205E98]/35"
              },
              {
                icon: <Activity className="w-5 h-5 text-[#4A8C4A]" />,
                title: "Live Queue Engine",
                desc: "Synchronize online appointments and physical walk-ins. Update wait times in real time to avoid crowding in clinic waiting rooms.",
                border: "hover:border-[#4A8C4A]/35"
              },
              {
                icon: <ShieldCheck className="w-5 h-5 text-[#4A8C4A]" />,
                title: "B2B Trust Verified",
                desc: "Display credentials confidently. Self-declared registration profiles are structured cleanly to establish instant patient trust.",
                border: "hover:border-[#4A8C4A]/35"
              }
            ].map((prop, i) => (
              <motion.div 
                key={i}
                initial={{ opacity: 0, y: 15 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-80px" }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                className={`group rounded-[2rem] p-8 bg-white border border-slate-100/90 shadow-[0_12px_30px_rgba(32,94,152,0.03)] hover:shadow-[0_20px_45px_rgba(32,94,152,0.08)] transition-all duration-300 ${prop.border} text-left`}
              >
                <div className="w-10 h-10 rounded-2xl bg-sky-50 border border-sky-100/80 flex items-center justify-center mb-6 group-hover:scale-[1.03] transition-transform">
                  {prop.icon}
                </div>
                <h3 className="text-lg font-bold text-slate-805 mb-2.5 tracking-tight">{prop.title}</h3>
                <p className="text-slate-600 text-sm leading-relaxed font-semibold">{prop.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── IMMERSIVE PROCESS TIMELINE ────────────────────────────────────── */}
      <section id="how-it-works" className="py-20 md:py-28 border-t border-[#205E98]/10 bg-gradient-to-b from-[#F7FBFE] to-[#F1F7FC] relative z-10 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center max-w-2xl mx-auto mb-16 space-y-4">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-50 border border-[#4A8C4A]/20 text-[#4A8C4A] rounded-full text-[10px] font-bold uppercase tracking-widest bg-white">
              <Clock className="w-3.5 h-3.5 text-[#4A8C4A]" /> Simple Onboarding Flow
            </span>
            <h2 className="text-3xl md:text-5xl font-black text-slate-900 tracking-tight">
              Enter the partner ecosystem.
            </h2>
            <p className="text-slate-650 text-base md:text-lg font-medium">
              A structured 3-step setup designed to activate your digital clinic credentials cleanly within minutes.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-12 md:gap-8 relative">
            {/* Connection axis line */}
            <div className="hidden md:block absolute top-8 left-[16%] right-[16%] h-[1px] bg-gradient-to-r from-[#205E98]/15 via-[#4A8C4A]/15 to-transparent -z-10" />

            {[
              { num: "01", title: "Submit Credentials", desc: "Share basic clinical parameters, name, qualifications, and state council registration details." },
              { num: "02", title: "Setup Clinic Parameters", desc: "Set consulting charges, operating hours, emergency parameters, and profile photos." },
              { num: "03", title: "Activate Dashboard", desc: "Unlock dynamic B2B clinic scheduler capabilities, launch live queues, and welcome patients." }
            ].map((stepItem, i) => (
              <motion.div 
                key={i}
                initial={{ opacity: 0, y: 15 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-80px" }}
                transition={{ duration: 0.5, delay: i * 0.12 }}
                className="text-center space-y-4"
              >
                <div className="w-16 h-16 mx-auto bg-white border border-[#205E98]/20 rounded-2xl flex items-center justify-center shadow-sm">
                  <span className="text-lg font-black text-transparent bg-clip-text bg-gradient-to-br from-[#205E98] to-[#4A8C4A]">{stepItem.num}</span>
                </div>
                <h3 className="text-base font-bold text-slate-800 tracking-tight">{stepItem.title}</h3>
                <p className="text-slate-600 text-sm leading-relaxed px-4 font-semibold">{stepItem.desc}</p>
              </motion.div>
            ))}
          </div>

          <div className="mt-16 text-center">
            <Link href="/partners/onboard">
              <Button className="h-16 px-10 rounded-2xl bg-gradient-to-r from-[#205E98] to-[#4A8C4A] hover:from-[#1a4c7a] hover:to-[#3c723c] text-white font-bold text-sm shadow-xl shadow-emerald-500/10 hover:shadow-emerald-500/15 transition-all hover:-translate-y-0.5 active:translate-y-0 duration-300 border-none">
                Start Partner Verification Flow
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* ── FOOTER DISCLAIMER ────────────────────────────────────────────── */}
      <footer className="py-12 border-t border-[#205E98]/10 bg-[#E8F2FA] text-center relative z-10 px-4">
        <div className="max-w-6xl mx-auto flex flex-col items-center gap-4 text-slate-650">
          <div className="flex items-center gap-1.5 justify-center">
            <ShieldCheck className="w-4 h-4 text-[#205E98] shrink-0" />
            <span className="text-[10px] font-black uppercase tracking-wider text-slate-500">JivniCare B2B Platform Infrastructure</span>
          </div>
          <p className="text-[10px] text-slate-550 leading-relaxed max-w-2xl mx-auto font-medium">
            JivniCare is a digital OPD and clinic queue optimization tool provider. Medical license registries and council numbers (NMC / State Councils) are self-declared by registering doctors under their own medical responsibility. JivniCare does not act as a licensing registry or certify practitioners.
          </p>
          <div className="text-[10px] text-slate-550 font-bold mt-2">
            &copy; {new Date().getFullYear()} JivniCare. All rights reserved. &bull; <Link href="/privacy" className="hover:text-[#205E98] transition-colors">Privacy Policy</Link> &bull; <Link href="/terms" className="hover:text-[#205E98] transition-colors">Terms of Service</Link>
          </div>
        </div>
      </footer>

    </div>
  );
}
