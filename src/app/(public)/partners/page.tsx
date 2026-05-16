import Link from "next/link";
import { Building2, Stethoscope, ArrowRight, ShieldCheck, Zap, Users, CheckCircle2, TrendingUp, CalendarCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Logo } from "@/components/brand/Logo";

export default function PartnersPage() {
  return (
    <div className="min-h-screen bg-slate-50 font-sans selection:bg-emerald-100 selection:text-emerald-900">
      
      {/* ── HERO SECTION ─────────────────────────────────────────────────── */}
      <section className="relative pt-24 pb-20 md:pt-32 md:pb-40 overflow-hidden bg-slate-950">
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-[0.02] -z-10" />
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary/10 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/3 -z-10" />
        <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-emerald-500/10 rounded-full blur-[100px] translate-y-1/2 -translate-x-1/3 -z-10" />

        <div className="max-w-6xl mx-auto px-4 md:px-6 relative z-10 text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 border border-white/10 text-slate-300 text-[11px] font-bold uppercase tracking-widest mb-8 backdrop-blur-md shadow-2xl">
            <Building2 className="w-3.5 h-3.5 text-emerald-400" />
            JivniCare Healthcare Infrastructure
          </div>
          
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-black text-white tracking-tight leading-[1.1] mb-6 max-w-4xl mx-auto">
            Digitize your clinic. <br className="hidden md:block" />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-cyan-400">Scale your practice.</span>
          </h1>
          
          <p className="text-lg md:text-xl text-slate-400 mb-10 max-w-2xl mx-auto font-medium leading-relaxed">
            Join the premium network of verified doctors. Manage appointments, live queues, and patient records from one medical-grade dashboard.
          </p>
          
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link href="/partners/onboard" className="w-full sm:w-auto">
              <Button className="h-14 px-8 rounded-xl bg-white hover:bg-slate-100 text-slate-900 font-bold text-sm w-full transition-all shadow-xl hover:scale-105 group">
                Begin Practice Verification
                <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
              </Button>
            </Link>
          </div>
          
          <div className="mt-10 flex flex-wrap justify-center items-center gap-6 text-[13px] font-bold text-slate-500">
            <div className="flex items-center gap-2"><ShieldCheck className="w-4 h-4 text-emerald-500" /> Bank-Grade Encryption</div>
            <div className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-500" /> Free Setup</div>
            <div className="flex items-center gap-2"><Users className="w-4 h-4 text-emerald-500" /> Instant Patient Access</div>
          </div>

          {/* DASHBOARD PREVIEW UI */}
          <div className="relative mt-20 max-w-5xl mx-auto rounded-2xl border border-white/10 bg-slate-900/50 backdrop-blur-3xl shadow-[0_32px_64px_-16px_rgba(0,0,0,0.5)] overflow-hidden p-2 translate-y-8 hover:translate-y-6 transition-transform duration-500">
            <div className="flex gap-2 p-3 border-b border-white/5">
               <div className="w-3 h-3 rounded-full bg-rose-500/80"/>
               <div className="w-3 h-3 rounded-full bg-amber-500/80"/>
               <div className="w-3 h-3 rounded-full bg-emerald-500/80"/>
            </div>
            <div className="flex bg-slate-950 rounded-lg overflow-hidden h-[300px] md:h-[400px]">
               {/* Sidebar */}
               <div className="w-48 border-r border-white/5 p-4 hidden md:block">
                  <div className="w-24 h-4 bg-white/20 rounded mb-8"/>
                  <div className="space-y-3">
                    <div className="w-full h-8 bg-primary/20 border border-primary/30 rounded flex items-center px-3 gap-2">
                       <CalendarCheck className="w-4 h-4 text-primary" />
                       <div className="w-16 h-2 bg-primary/50 rounded" />
                    </div>
                    <div className="w-3/4 h-8 bg-white/5 rounded flex items-center px-3 gap-2">
                       <Users className="w-4 h-4 text-slate-500" />
                       <div className="w-12 h-2 bg-slate-600 rounded" />
                    </div>
                    <div className="w-5/6 h-8 bg-white/5 rounded flex items-center px-3 gap-2">
                       <TrendingUp className="w-4 h-4 text-slate-500" />
                       <div className="w-14 h-2 bg-slate-600 rounded" />
                    </div>
                  </div>
               </div>
               {/* Content */}
               <div className="flex-1 p-6 text-left">
                  <div className="flex justify-between items-center mb-8">
                    <div className="space-y-2">
                      <div className="w-32 h-5 bg-white/20 rounded"/>
                      <div className="w-20 h-3 bg-white/10 rounded"/>
                    </div>
                    <div className="px-3 py-1 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-full flex items-center gap-1.5 text-[10px] font-bold tracking-widest uppercase">
                      <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse" />
                      Live OPD
                    </div>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
                    <div className="h-24 bg-white/5 rounded-xl border border-white/5 p-4 flex flex-col justify-between">
                       <span className="text-slate-500 text-[10px] font-bold uppercase tracking-widest">Today's Patients</span>
                       <span className="text-white text-3xl font-black">24</span>
                    </div>
                    <div className="h-24 bg-white/5 rounded-xl border border-white/5 p-4 flex flex-col justify-between">
                       <span className="text-slate-500 text-[10px] font-bold uppercase tracking-widest">Online Booking</span>
                       <span className="text-white text-3xl font-black">12</span>
                    </div>
                    <div className="h-24 bg-white/5 rounded-xl border border-white/5 p-4 flex flex-col justify-between relative overflow-hidden">
                       <div className="absolute top-0 right-0 p-4 opacity-10"><TrendingUp className="w-12 h-12 text-emerald-400" /></div>
                       <span className="text-slate-500 text-[10px] font-bold uppercase tracking-widest relative z-10">Revenue</span>
                       <span className="text-emerald-400 text-3xl font-black relative z-10">₹12,500</span>
                    </div>
                  </div>
               </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── VALUE PROPOSITIONS ───────────────────────────────────────────── */}
      <section className="py-24 md:py-32 bg-slate-50 relative">
        <div className="max-w-6xl mx-auto px-4 md:px-6">
          <div className="text-center max-w-3xl mx-auto mb-16 md:mb-24">
            <h2 className="text-3xl md:text-5xl font-black text-slate-900 tracking-tight mb-6">
              Operational infrastructure for modern clinics.
            </h2>
            <p className="text-lg text-slate-500 font-medium leading-relaxed">
              We provide the medical-grade tools required to modernize your clinic, organize patient flow, and secure your digital reputation.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                icon: <TrendingUp className="w-6 h-6 text-primary" />,
                title: "Patient Discovery",
                desc: "Appear in targeted regional searches when patients look for your specific medical expertise and locality.",
                color: "bg-white border-border shadow-soft hover:shadow-premium hover:border-primary/20",
                iconBg: "bg-primary/10 border-primary/20"
              },
              {
                icon: <CalendarCheck className="w-6 h-6 text-amber-600" />,
                title: "Live Queue Control",
                desc: "Digitize your waiting room. Manage walk-ins and online appointments from a single synchronized dashboard.",
                color: "bg-white border-border shadow-soft hover:shadow-premium hover:border-amber-500/20",
                iconBg: "bg-amber-50 border-amber-100"
              },
              {
                icon: <ShieldCheck className="w-6 h-6 text-emerald-600" />,
                title: "Medical Verification",
                desc: "Earn the JivniCare Verified Shield. Authentic patient reviews and council verifications establish immediate trust.",
                color: "bg-white border-border shadow-soft hover:shadow-premium hover:border-emerald-500/20",
                iconBg: "bg-emerald-50 border-emerald-100"
              }
            ].map((feature, i) => (
              <div key={i} className={`rounded-2xl p-8 border transition-all duration-300 ${feature.color}`}>
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center border mb-6 ${feature.iconBg}`}>
                  {feature.icon}
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-3 tracking-tight">{feature.title}</h3>
                <p className="text-sm text-slate-500 leading-relaxed font-medium">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── SIMPLE 3-STEP PROCESS ────────────────────────────────────────── */}
      <section className="py-24 md:py-32 bg-slate-950 text-white relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-[0.02] pointer-events-none" />
        
        <div className="max-w-6xl mx-auto px-4 md:px-6 relative z-10">
          <div className="text-center max-w-3xl mx-auto mb-16 md:mb-24">
            <h2 className="text-3xl md:text-5xl font-black tracking-tight mb-6">
              Medical Verification Process.
            </h2>
            <p className="text-lg text-slate-400 font-medium">
              We uphold strict quality standards. Our onboarding flow ensures that only verified professionals join the JivniCare network.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
            {/* Connecting Line (Desktop) */}
            <div className="hidden md:block absolute top-8 left-[16%] right-[16%] h-px bg-slate-800 -z-10" />

            {[
              { step: "01", title: "Identity Submission", desc: "Submit your professional clinical details, qualifications, and operational parameters." },
              { step: "02", title: "Protocol Verification", desc: "Our administrative team verifies your credentials against medical registry standards." },
              { step: "03", title: "Dashboard Activation", desc: "Receive immediate access to your JivniCare Dashboard to manage live OPD flows." }
            ].map((item, i) => (
              <div key={i} className="text-center relative">
                <div className="w-16 h-16 mx-auto bg-slate-900 border border-slate-800 rounded-2xl flex items-center justify-center mb-6 shadow-xl">
                  <span className="text-xl font-black text-primary">{item.step}</span>
                </div>
                <h3 className="text-lg font-bold mb-3">{item.title}</h3>
                <p className="text-sm text-slate-400 font-medium leading-relaxed px-4">{item.desc}</p>
              </div>
            ))}
          </div>

          <div className="mt-20 text-center">
            <Link href="/partners/onboard">
              <Button className="h-12 px-8 rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground font-bold text-sm shadow-md transition-all active:scale-95">
                Start Verification Flow
              </Button>
            </Link>
          </div>
        </div>
      </section>

    </div>
  );
}
