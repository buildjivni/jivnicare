"use client";

import { 
  ShieldCheck, Star, Award, MapPin, Phone, Languages, 
  GraduationCap, BadgeCheck, Zap, Clock, Users, Activity,
  Building2, CalendarCheck, Stethoscope, Share2, Heart
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import type { Doctor } from "@/types";
import Image from "next/image";

interface DoctorProfileViewProps {
  doctor: Doctor;
}

// Helper to format 24h to 12h for UI
const formatTime = (time: string) => {
  if (!time) return "--:--";
  const [h, m] = time.split(':');
  const hh = parseInt(h);
  const ampm = hh >= 12 ? 'PM' : 'AM';
  const h12 = hh % 12 || 12;
  return `${h12}:${m} ${ampm}`;
};

export function DoctorProfileView({ doctor }: DoctorProfileViewProps) {
  const availableToday = doctor.available?.toLowerCase().includes("today");

  return (
    <div className="space-y-6">
      {/* ── MAIN PROFILE CARD ─────────────────── */}
      <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm overflow-hidden">
        {/* Banner with modern glass effect */}
        <div className="h-40 md:h-52 bg-gradient-to-br from-[#205E98]/20 via-blue-50 to-emerald-50 relative">
          <div className="absolute inset-0 opacity-40 bg-[radial-gradient(circle_at_70%_50%,#205E98_0%,transparent_60%)]" />
          
          {/* Quick Actions Float */}
          <div className="absolute top-6 right-6 flex gap-3">
            <Button variant="secondary" size="icon" className="rounded-full bg-white/80 backdrop-blur-md border-white/50 shadow-sm hover:bg-white transition-all">
              <Share2 className="w-4 h-4 text-slate-600" />
            </Button>
            <Button variant="secondary" size="icon" className="rounded-full bg-white/80 backdrop-blur-md border-white/50 shadow-sm hover:bg-white transition-all">
              <Heart className="w-4 h-4 text-slate-600" />
            </Button>
          </div>
        </div>

        <div className="px-6 md:px-10 pb-8 relative">
          {/* Overlapping Profile Info */}
          <div className="flex flex-col md:flex-row gap-6 md:items-end -mt-16 relative z-10">
            <div className="relative shrink-0">
              <Avatar className="h-32 w-32 md:h-40 md:w-40 border-[6px] border-white shadow-2xl bg-white ring-1 ring-slate-100">
                <AvatarImage src={doctor.image} alt={doctor.name} className="object-cover" />
                <AvatarFallback className="text-3xl font-black bg-primary/10 text-primary">
                  {doctor.name.charAt(0)}
                </AvatarFallback>
              </Avatar>
              <div className={`absolute bottom-3 right-3 w-6 h-6 rounded-full border-4 border-white shadow-lg ${availableToday ? "bg-emerald-500" : "bg-slate-300"}`} />
            </div>

            <div className="flex-1 pb-2">
              <div className="flex flex-wrap items-center gap-2 mb-3">
                <Badge className="bg-primary text-white hover:bg-primary/90 border-transparent text-xs font-bold rounded-full px-4 py-1">
                  {doctor.specialty}
                </Badge>
                <Badge variant="outline" className="text-emerald-700 border-emerald-200 bg-emerald-50/50 text-xs font-bold rounded-full px-4 py-1 flex items-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5" /> Verified Specialist
                </Badge>
              </div>
              <h1 className="text-3xl md:text-4xl font-black tracking-tight text-slate-900 mb-1">{doctor.name}</h1>
              <div className="flex flex-wrap items-center gap-4 text-slate-500 font-medium">
                <p className="flex items-center gap-1.5 text-sm">
                  <GraduationCap className="w-4 h-4 text-primary" />
                  {doctor.education}
                </p>
                <p className="flex items-center gap-1.5 text-sm">
                  <Award className="w-4 h-4 text-primary" />
                  {doctor.experience} Experience
                </p>
              </div>
            </div>

            {/* Premium Rating Card */}
            <div className="bg-slate-900 rounded-3xl p-5 text-center shrink-0 min-w-[120px] shadow-xl shadow-slate-900/10 mb-2">
              <div className="flex items-center justify-center gap-1.5 mb-1">
                <Star className="w-5 h-5 fill-amber-400 text-amber-400" />
                <span className="font-black text-2xl text-white">{doctor.rating}</span>
              </div>
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">{doctor.reviews} Patient Reviews</p>
            </div>
          </div>

          {/* ── STATS GRID ─────────────────────── */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mt-10">
            <div className="p-4 rounded-3xl bg-blue-50/50 border border-blue-100/50 flex flex-col items-center justify-center text-center">
              <Activity className="w-6 h-6 text-primary mb-2" />
              <p className="font-black text-slate-900 text-lg leading-none">Live</p>
              <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mt-2">Queue Status</p>
            </div>
            <div className="p-4 rounded-3xl bg-emerald-50/50 border border-emerald-100/50 flex flex-col items-center justify-center text-center">
              <Clock className="w-6 h-6 text-emerald-600 mb-2" />
              <p className="font-black text-slate-900 text-lg leading-none">{doctor.available}</p>
              <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mt-2">Availability</p>
            </div>
            <div className="p-4 rounded-3xl bg-amber-50/50 border border-amber-100/50 flex flex-col items-center justify-center text-center">
              <ShieldCheck className="w-6 h-6 text-amber-600 mb-2" />
              <p className="font-black text-slate-900 text-lg leading-none">{doctor.fee}</p>
              <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mt-2">Consultation Fee</p>
            </div>
            <div className="p-4 rounded-3xl bg-slate-50 border border-slate-100 flex flex-col items-center justify-center text-center">
              <Users className="w-6 h-6 text-slate-400 mb-2" />
              <p className="font-black text-slate-900 text-lg leading-none">500+</p>
              <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mt-2">Happy Patients</p>
            </div>
          </div>
        </div>
      </div>

      {/* ── PROFESSIONAL DETAILS GRID ────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left: About & Expertise */}
        <div className="space-y-6">
          <Card className="rounded-[2rem] border-slate-100 shadow-sm overflow-hidden">
            <CardContent className="p-8">
              <h2 className="text-xl font-black text-slate-900 mb-4 flex items-center gap-2">
                <BadgeCheck className="w-5 h-5 text-primary" /> Professional Summary
              </h2>
              <p className="text-slate-600 leading-relaxed text-lg font-medium">
                {doctor.about || `${doctor.name} is a highly skilled ${doctor.specialty} based in ${doctor.location}. With over ${doctor.experience} of dedicated practice, they specialize in providing comprehensive care at ${doctor.clinic}.`}
              </p>
              
              <div className="mt-8">
                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">Core Expertise</h3>
                <div className="flex flex-wrap gap-2">
                  {(doctor.tags || [doctor.specialty, "Healthcare", "Patient Care"]).map((tag) => (
                    <span key={tag} className="px-4 py-2 rounded-xl bg-slate-50 text-slate-700 text-sm font-bold border border-slate-100 hover:border-primary/20 hover:bg-white transition-all cursor-default">
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="rounded-[2rem] border-slate-100 shadow-sm overflow-hidden bg-slate-900 text-white">
            <CardContent className="p-8">
              <div className="flex items-start gap-4">
                <div className="p-3 bg-white/10 rounded-2xl">
                  <CalendarCheck className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="text-lg font-bold mb-2">How Booking Works</h3>
                  <p className="text-slate-400 text-sm leading-relaxed">
                    Choose a convenient date and book your token instantly. JivniCare ensures a verified slot and real-time queue tracking, so you spend less time in the waiting room.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right: Clinic & Timings */}
        <div className="space-y-6">
          <Card className="rounded-[2rem] border-slate-100 shadow-sm overflow-hidden">
            {/* Clinic Mini Hero */}
            <div className="h-32 bg-slate-100 relative">
              <Image 
                src={doctor.bgImage || "https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?q=80&w=1000&auto=format&fit=crop"} 
                alt="Clinic" 
                fill 
                className="object-cover opacity-60"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-white via-white/40 to-transparent" />
              <div className="absolute bottom-4 left-6">
                <h3 className="font-black text-slate-900 text-lg leading-tight">{doctor.clinic}</h3>
                <p className="text-slate-500 text-xs font-bold flex items-center gap-1 mt-0.5">
                  <MapPin className="w-3 h-3" /> {doctor.location}
                </p>
              </div>
            </div>
            
            <CardContent className="p-8 space-y-6">
              <div className="flex items-start gap-4">
                <div className="p-3 bg-emerald-50 rounded-2xl">
                  <Stethoscope className="w-6 h-6 text-emerald-600" />
                </div>
                <div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Facility Type</p>
                  <p className="font-bold text-slate-900">Advanced Diagnostic & Consultation Center</p>
                  <p className="text-sm text-slate-500 mt-1">Equipped with modern medical infrastructure for comprehensive checkups.</p>
                </div>
              </div>

              <div className="h-[1px] bg-slate-100 w-full" />

              <div className="flex items-start gap-4">
                <div className="p-3 bg-amber-50 rounded-2xl">
                  <Clock className="w-6 h-6 text-amber-600" />
                </div>
                <div className="flex-1">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3">Operating Hours</p>
                  <div className="space-y-3">
                    {[
                      { id: 'monday', label: 'Monday' },
                      { id: 'tuesday', label: 'Tuesday' },
                      { id: 'wednesday', label: 'Wednesday' },
                      { id: 'thursday', label: 'Thursday' },
                      { id: 'friday', label: 'Friday' },
                      { id: 'saturday', label: 'Saturday' },
                      { id: 'sunday', label: 'Sunday' },
                    ].map((d) => {
                      const daySched = (doctor as any).weeklySchedule?.[d.id] || { isOpen: false };
                      return (
                        <div key={d.id} className="flex items-center justify-between group">
                          <span className="text-sm font-bold text-slate-600 group-hover:text-slate-900 transition-colors">{d.label}</span>
                          <div className="flex items-center gap-2">
                             <span className={`h-1.5 w-1.5 rounded-full ${daySched.isOpen ? 'bg-emerald-500' : 'bg-slate-300'}`} />
                             <span className={`text-sm font-black ${daySched.isOpen ? 'text-slate-900' : 'text-slate-400'}`}>
                              {daySched.isOpen ? `${formatTime(daySched.start)} – ${formatTime(daySched.end)}` : 'Closed'}
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-primary/5 border border-primary/10 flex items-center gap-3">
                <Phone className="w-4 h-4 text-primary" />
                <p className="text-xs font-bold text-primary">Verified Contact via JivniCare Platform</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
