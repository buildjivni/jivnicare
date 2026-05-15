import Link from "next/link";
import { Building2, Stethoscope, ArrowRight, ShieldCheck, Zap, Users, CheckCircle2, TrendingUp, CalendarCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Logo } from "@/components/brand/Logo";

export default function PartnersPage() {
  return (
    <div className="min-h-screen bg-slate-50 font-sans selection:bg-emerald-100 selection:text-emerald-900">
      
      {/* ── HERO SECTION ─────────────────────────────────────────────────── */}
      <section className="relative pt-24 pb-20 md:pt-32 md:pb-32 overflow-hidden">
        {/* Background Gradients */}
        <div className="absolute inset-0 bg-slate-900 -z-20" />
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-5 -z-10" />
        <div className="absolute top-0 right-0 w-72 md:w-[500px] h-72 md:h-[500px] bg-primary/20 rounded-full blur-[80px] md:blur-[120px] -translate-y-1/2 translate-x-1/3 -z-10" />
        <div className="absolute bottom-0 left-0 w-72 md:w-[500px] h-72 md:h-[500px] bg-emerald-500/20 rounded-full blur-[80px] md:blur-[120px] translate-y-1/2 -translate-x-1/3 -z-10" />

        <div className="max-w-6xl mx-auto px-4 md:px-6 relative z-10 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 text-white border border-white/20 text-xs font-bold uppercase tracking-widest mb-8 backdrop-blur-md shadow-2xl">
            <Building2 className="w-4 h-4 text-emerald-400" />
            JivniCare for Healthcare Partners
          </div>
          
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-black text-white tracking-tight leading-[1.1] mb-8 max-w-4xl mx-auto drop-shadow-sm">
            Grow your practice with Bihar's most trusted <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-cyan-400">digital healthcare platform.</span>
          </h1>
          
          <p className="text-lg md:text-xl text-slate-300 mb-12 max-w-2xl mx-auto font-medium leading-relaxed">
            Join thousands of independent doctors and multi-specialty hospitals managing their OPD digitally. Zero setup costs. Maximum patient reach.
          </p>
          
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link href="/partners/onboard" className="w-full sm:w-auto">
              <Button className="h-16 px-10 rounded-2xl bg-white hover:bg-slate-100 text-slate-900 font-black text-lg w-full transition-all shadow-xl hover:scale-105 group">
                Start Your Practice Online
                <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
              </Button>
            </Link>
          </div>
          
          <div className="mt-12 flex flex-wrap justify-center items-center gap-6 text-sm font-bold text-slate-400">
            <div className="flex items-center gap-2"><CheckCircle2 className="w-5 h-5 text-emerald-400" /> 100% Free Setup</div>
            <div className="flex items-center gap-2"><CheckCircle2 className="w-5 h-5 text-emerald-400" /> Dedicated Dashboard</div>
            <div className="flex items-center gap-2"><CheckCircle2 className="w-5 h-5 text-emerald-400" /> Verified Trust Badge</div>
          </div>
        </div>
      </section>

      {/* ── VALUE PROPOSITIONS ───────────────────────────────────────────── */}
      <section className="py-20 md:py-32 bg-white relative">
        <div className="max-w-6xl mx-auto px-4 md:px-6">
          <div className="text-center max-w-3xl mx-auto mb-16 md:mb-24">
            <h2 className="text-3xl md:text-5xl font-black text-slate-900 tracking-tight mb-6">
              Why partner with JivniCare?
            </h2>
            <p className="text-lg text-slate-600 font-medium">
              We provide the tools you need to modernize your clinic, reduce patient wait times, and build a powerful online reputation.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                icon: <TrendingUp className="w-8 h-8 text-primary" />,
                title: "Reach More Patients",
                desc: "Get discovered by thousands of patients in your district actively searching for your exact specialty.",
                color: "bg-blue-50 border-blue-100",
                iconBg: "bg-white"
              },
              {
                icon: <CalendarCheck className="w-8 h-8 text-amber-500" />,
                title: "Smart OPD Management",
                desc: "Say goodbye to crowded waiting rooms. Manage walk-ins and online bookings from one simple dashboard.",
                color: "bg-amber-50 border-amber-100",
                iconBg: "bg-white"
              },
              {
                icon: <ShieldCheck className="w-8 h-8 text-emerald-500" />,
                title: "Build Verified Trust",
                desc: "Establish your digital reputation. Authentic patient reviews and verified badges help you stand out instantly.",
                color: "bg-emerald-50 border-emerald-100",
                iconBg: "bg-white"
              }
            ].map((feature, i) => (
              <div key={i} className={`rounded-[2rem] p-8 md:p-10 border transition-all duration-300 hover:shadow-xl hover:-translate-y-1 ${feature.color}`}>
                <div className={`w-16 h-16 rounded-2xl flex items-center justify-center mb-8 shadow-sm ${feature.iconBg}`}>
                  {feature.icon}
                </div>
                <h3 className="text-2xl font-black text-slate-900 mb-4 tracking-tight">{feature.title}</h3>
                <p className="text-slate-600 leading-relaxed font-medium">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── SIMPLE 3-STEP PROCESS ────────────────────────────────────────── */}
      <section className="py-20 md:py-32 bg-slate-900 text-white relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-5 pointer-events-none" />
        
        <div className="max-w-6xl mx-auto px-4 md:px-6 relative z-10">
          <div className="text-center max-w-3xl mx-auto mb-16 md:mb-24">
            <h2 className="text-3xl md:text-5xl font-black tracking-tight mb-6">
              Go live in under 5 minutes.
            </h2>
            <p className="text-lg text-slate-300 font-medium">
              We've stripped away the complexity. Our onboarding flow is designed for busy doctors.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
            {/* Connecting Line (Desktop) */}
            <div className="hidden md:block absolute top-12 left-[16%] right-[16%] h-0.5 bg-slate-800 -z-10" />

            {[
              { step: "01", title: "Create Profile", desc: "Fill in your basic details, qualifications, and practice location." },
              { step: "02", title: "Admin Verification", desc: "Our team quickly verifies your credentials to ensure platform trust." },
              { step: "03", title: "Start Accepting Patients", desc: "Access your dashboard and watch your daily appointments roll in." }
            ].map((item, i) => (
              <div key={i} className="text-center relative">
                <div className="w-24 h-24 mx-auto bg-slate-800 border-4 border-slate-900 rounded-full flex items-center justify-center mb-8 shadow-xl">
                  <span className="text-3xl font-black text-emerald-400">{item.step}</span>
                </div>
                <h3 className="text-2xl font-bold mb-4">{item.title}</h3>
                <p className="text-slate-400 font-medium leading-relaxed px-4">{item.desc}</p>
              </div>
            ))}
          </div>

          <div className="mt-20 text-center">
            <Link href="/partners/onboard">
              <Button className="h-14 px-10 rounded-2xl bg-emerald-500 hover:bg-emerald-400 text-slate-900 font-black text-lg shadow-xl hover:scale-105 transition-all">
                Begin Onboarding Now
              </Button>
            </Link>
          </div>
        </div>
      </section>

    </div>
  );
}
