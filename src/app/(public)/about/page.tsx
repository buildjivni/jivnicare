import type { Metadata } from "next";
import { ShieldCheck, Heart, Stethoscope, MapPin, Users, Zap, Target, Eye } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = {
  title: "About JivniCare — Our Mission & Story",
  description: "JivniCare is Bihar's emerging digital healthcare platform on a mission to make quality, verified healthcare accessible to every family across Patna and beyond.",
};

const MISSION_PILLARS = [
  {
    icon: <Heart className="w-6 h-6" />,
    color: "text-rose-500 bg-rose-50 border-rose-100",
    title: "Patient-First, Always",
    desc: "Every decision we make begins with one question: 'Does this make it easier for a patient to get quality care?' From booking to billing, we obsess over reducing friction.",
  },
  {
    icon: <ShieldCheck className="w-6 h-6" />,
    color: "text-emerald-600 bg-emerald-50 border-emerald-100",
    title: "Verified Trust",
    desc: "Every doctor on JivniCare is manually verified by our clinical team. We don't list anyone with unverified credentials — your family's health is not a space for compromise.",
  },
  {
    icon: <Zap className="w-6 h-6" />,
    color: "text-amber-500 bg-amber-50 border-amber-100",
    title: "Speed & Simplicity",
    desc: "Healthcare in India is complicated enough. We believe booking a verified doctor should take less than 2 minutes — from search to confirmation.",
  },
  {
    icon: <MapPin className="w-6 h-6" />,
    color: "text-blue-500 bg-blue-50 border-blue-100",
    title: "Bihar First",
    desc: "We are building for Bihar's reality — low-bandwidth devices, tier-2 city needs, and the unique trust dynamics of our healthcare ecosystem. This isn't a copy-paste startup.",
  },
];

const STATS = [
  { value: "500+", label: "Verified Doctors" },
  { value: "38+", label: "Districts Covered" },
  { value: "10k+", label: "Appointments Facilitated" },
  { value: "4.8★", label: "Average Patient Rating" },
];

export default function AboutPage() {
  return (
    <div className="bg-white min-h-screen">

      {/* Hero */}
      <section className="relative pt-24 pb-20 md:pt-32 md:pb-28 overflow-hidden bg-slate-950 text-white">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-2xl h-64 bg-primary/20 blur-[120px] pointer-events-none rounded-full" />
        <div className="container mx-auto px-4 md:px-6 max-w-4xl text-center relative z-10">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 border border-white/15 text-xs font-bold uppercase tracking-widest mb-8 backdrop-blur-sm">
            <Heart className="w-4 h-4 text-rose-400" /> Our Story
          </div>
          <h1 className="text-4xl md:text-6xl font-black tracking-tight leading-tight mb-8">
            We're building Bihar's <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-cyan-400">healthcare future.</span>
          </h1>
          <p className="text-lg md:text-xl text-slate-300 leading-relaxed max-w-2xl mx-auto font-medium">
            JivniCare was born from a simple frustration: why should a family in Muzaffarpur have to wait 3 hours to see a doctor when the right tool can fix this in minutes?
          </p>
        </div>
      </section>

      {/* Stats */}
      <section className="py-16 bg-slate-50 border-b border-slate-200">
        <div className="container mx-auto px-4 md:px-6 max-w-5xl">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {STATS.map((stat) => (
              <div key={stat.label} className="text-center p-6 bg-white rounded-3xl border border-slate-200 shadow-sm">
                <p className="text-4xl md:text-5xl font-black text-slate-900 mb-2">{stat.value}</p>
                <p className="text-sm font-bold text-slate-500 uppercase tracking-wider">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Our Story */}
      <section className="py-20 md:py-28">
        <div className="container mx-auto px-4 md:px-6 max-w-3xl">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-100 text-slate-600 text-xs font-bold uppercase tracking-widest mb-8">
            <Eye className="w-3.5 h-3.5" /> The Problem We Saw
          </div>
          <h2 className="text-3xl md:text-4xl font-black text-slate-900 tracking-tight mb-8">
            Bihar has world-class doctors. The system fails to connect them with patients.
          </h2>
          <div className="space-y-6 text-slate-600 leading-relaxed text-lg">
            <p>
              In Bihar's tier-2 cities, a routine specialist appointment can mean an entire day lost. Patients travel for hours, wait in crowded OPDs, and often leave without the care they needed — simply because they couldn't reach the right doctor at the right time.
            </p>
            <p>
              Meanwhile, talented, qualified doctors struggle to build their digital reputation. Their only channel for new patients is word-of-mouth and physical footfall — both unpredictable and hard to scale.
            </p>
            <p>
              JivniCare bridges this gap. We give patients a single trusted destination to find, verify, and book real doctors. We give doctors a professional digital home that works while they focus on what they do best — healing people.
            </p>
          </div>
        </div>
      </section>

      {/* Mission Pillars */}
      <section id="mission" className="py-20 md:py-28 bg-slate-50 border-t border-slate-100 scroll-mt-24">
        <div className="container mx-auto px-4 md:px-6 max-w-6xl">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-50 border border-emerald-100 text-emerald-700 text-xs font-bold uppercase tracking-widest mb-6">
              <Target className="w-3.5 h-3.5" /> Our Core Principles
            </div>
            <h2 className="text-3xl md:text-5xl font-black text-slate-900 tracking-tight">What drives every decision we make.</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {MISSION_PILLARS.map((pillar) => (
              <div key={pillar.title} className={`rounded-3xl p-8 border ${pillar.color} flex gap-5`}>
                <div className={`w-12 h-12 rounded-2xl border flex items-center justify-center shrink-0 bg-white ${pillar.color}`}>
                  {pillar.icon}
                </div>
                <div>
                  <h3 className="text-xl font-bold text-slate-900 mb-2">{pillar.title}</h3>
                  <p className="text-slate-600 leading-relaxed">{pillar.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Digital OPD Vision */}
      <section id="vision" className="py-20 md:py-28 bg-slate-900 text-white overflow-hidden relative scroll-mt-24">
        <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-500/10 rounded-full blur-[100px] pointer-events-none" />
        <div className="container mx-auto px-4 md:px-6 max-w-4xl text-center relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/10 border border-white/15 text-xs font-bold uppercase tracking-widest mb-8">
            <Stethoscope className="w-3.5 h-3.5 text-emerald-400" /> Digital OPD Vision
          </div>
          <h2 className="text-3xl md:text-5xl font-black tracking-tight mb-8">
            Imagine a Bihar where <span className="text-emerald-400">no patient ever waits unnecessarily.</span>
          </h2>
          <p className="text-lg text-slate-300 leading-relaxed max-w-2xl mx-auto mb-12 font-medium">
            That's our vision. A digitally connected healthcare system where smart queues, live token tracking, and verified doctor profiles mean that patients get care faster, and doctors practice more efficiently. JivniCare is the infrastructure that makes this real — one verified appointment at a time.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/doctors">
              <Button className="h-14 px-8 rounded-2xl bg-white hover:bg-slate-100 text-slate-900 font-black text-base shadow-xl transition-all">
                Find a Doctor
              </Button>
            </Link>
            <Link href="/partners">
              <Button variant="outline" className="h-14 px-8 rounded-2xl border-white/20 text-white bg-white/5 hover:bg-white/10 font-bold text-base">
                Join as a Partner
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Team/Hiring Placeholder */}
      <section id="careers" className="py-20 md:py-24 bg-white border-t border-slate-100 scroll-mt-24">
        <div className="container mx-auto px-4 md:px-6 max-w-3xl text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-50 border border-blue-100 text-blue-700 text-xs font-bold uppercase tracking-widest mb-6">
            <Users className="w-3.5 h-3.5" /> Join the Team
          </div>
          <h2 className="text-3xl md:text-4xl font-black text-slate-900 tracking-tight mb-6">
            We're hiring people who care about healthcare.
          </h2>
          <p className="text-lg text-slate-600 leading-relaxed mb-10">
            We're a small but passionate team building at the intersection of healthcare, technology, and social impact. If you believe quality healthcare is a right and not a privilege — let's talk.
          </p>
          <a href="mailto:careers@jivnicare.com" className="inline-flex items-center gap-2 px-8 py-4 rounded-2xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-base transition-all shadow-md hover:shadow-lg">
            View Open Roles
          </a>
        </div>
      </section>

    </div>
  );
}
