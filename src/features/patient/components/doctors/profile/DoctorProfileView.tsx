"use client";

import { useState } from "react";
import {
  ShieldCheck, Star, Award, MapPin,
  GraduationCap, Clock, Users, Activity,
  CalendarCheck, Share2, CheckCircle2, Zap,
  ChevronDown, ChevronUp
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import type { Doctor } from "@/types";
import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { getCanonicalImageUrl } from "@/lib/imageHelper";

interface DoctorProfileViewProps {
  doctor: Doctor;
  relatedDoctors?: Doctor[];
}

const fmtTime = (t: string) => {
  if (!t) return "—";
  const [h, m] = t.split(":");
  const hh = parseInt(h);
  return `${hh % 12 || 12}:${m} ${hh >= 12 ? "PM" : "AM"}`;
};

function fmtCount(n: number): string | null {
  if (n >= 10000) return `${Math.floor(n / 1000)}k+`;
  if (n >= 1000) return `${(n / 1000).toFixed(1)}k+`;
  if (n > 0) return `${n}+`;
  return null;
}

const DAYS = [
  { id: "monday",    label: "Mon" },
  { id: "tuesday",   label: "Tue" },
  { id: "wednesday", label: "Wed" },
  { id: "thursday",  label: "Thu" },
  { id: "friday",    label: "Fri" },
  { id: "saturday",  label: "Sat" },
  { id: "sunday",    label: "Sun" },
];

function displayName(name: string): string {
  if (!name) return "";
  const trimmed = name.trim();
  return /^Dr\.?\s/i.test(trimmed) ? trimmed : `Dr. ${trimmed}`;
}

export function DoctorProfileView({ doctor, relatedDoctors }: DoctorProfileViewProps) {
  const [showToast, setShowToast] = useState(false);
  const [isBioExpanded, setIsBioExpanded] = useState(false);
  const [imgLoaded, setImgLoaded] = useState(false);
  const [clinicImgLoaded, setClinicImgLoaded] = useState(false);

  const availableToday = doctor.available?.toLowerCase() === "available today";
  const isClosedToday = doctor.available?.toLowerCase().includes("closed");
  const isBookingPaused = doctor.availabilityStatus?.toLowerCase().includes("paused");
  const badge = doctor.verifiedBadgeLabel ?? "Verified Doctor";
  const consultCount = fmtCount(doctor.totalConsultations ?? 0);
  const clinicImage = doctor.clinicImage || doctor.bgImage;

  const expertiseTags = Array.from(
    new Set([
      doctor.specialty,
      ...(doctor.tags || []).filter(t => t.length > 2 && t.length < 40),
    ])
  ).slice(0, 8);

  const handleShare = async () => {
    const shareData = {
      title: `Dr. ${doctor.name} | ${doctor.specialty} on JivniCare`,
      text: `Check out Dr. ${doctor.name}, ${doctor.specialty} at ${doctor.clinic}.`,
      url: window.location.href,
    };
    try {
      if (navigator.share) await navigator.share(shareData);
      else {
        await navigator.clipboard.writeText(window.location.href);
        setShowToast(true);
        setTimeout(() => setShowToast(false), 3000);
      }
    } catch (err) {}
  };

  const bioText = doctor.about || `${doctor.name} is a ${doctor.specialty} specialist${doctor.clinic ? ` at ${doctor.clinic}` : ""}${doctor.location ? ` in ${doctor.location}` : ""}${doctor.experience && doctor.experience !== "0" ? ` with ${doctor.experience} years of clinical experience` : ""}.`;
  const isLongBio = bioText.length > 150;

  return (
    <div className="space-y-6">
      <div
        aria-live="polite"
        className={[
          "fixed bottom-24 left-1/2 -translate-x-1/2 z-[100] bg-slate-900 text-white text-sm font-bold px-5 py-2.5 rounded-full shadow-2xl flex items-center gap-2 transition-all duration-300",
          showToast ? "opacity-100 translate-y-0 pointer-events-auto" : "opacity-0 translate-y-4 pointer-events-none",
        ].join(" ")}
      >
        <CheckCircle2 className="w-4 h-4 text-emerald-400" />
        Link copied to clipboard
      </div>

      {/* HERO CARD */}
      <div className="bg-white rounded-3xl border border-slate-100 shadow-premium overflow-hidden">
        {/* Banner */}
        <div className="relative h-[160px] md:h-[200px] bg-gradient-to-br from-[#205E98]/10 via-blue-50/50 to-slate-50 overflow-hidden">
          {!clinicImgLoaded && clinicImage && <div className="absolute inset-0 skeleton-shimmer" />}
          {clinicImage && (
            <Image
              src={getCanonicalImageUrl(clinicImage, doctor.updatedAt) || ""}
              alt={`${doctor.clinic} facility`}
              width={800}
              height={200}
              priority
              onLoad={() => setClinicImgLoaded(true)}
              className={`w-full h-full object-cover transition-opacity duration-500 ${clinicImgLoaded ? "opacity-60" : "opacity-0"}`}
            />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-white via-white/20 to-transparent" />
          
          <button
            onClick={handleShare}
            className="absolute top-4 right-4 p-2.5 rounded-full bg-white/90 backdrop-blur-md shadow-sm hover:bg-white active:scale-95 transition-all z-20"
            aria-label="Share profile"
          >
            <Share2 className="w-4 h-4 text-slate-600" />
          </button>
        </div>

        {/* Identity block */}
        <div className="px-5 md:px-8 pb-6">
          <div className="flex flex-col md:flex-row md:items-end md:justify-between -mt-12 mb-4 relative z-10">
            <div className="flex justify-between items-end">
              <div className="relative">
                <div className={`w-24 h-24 md:w-28 md:h-28 rounded-2xl border-4 border-white shadow-lg bg-white overflow-hidden relative ${!imgLoaded ? 'skeleton-shimmer' : ''}`}>
                  {doctor.image ? (
                    <Image
                      src={getCanonicalImageUrl(doctor.image, doctor.updatedAt) || ""}
                      alt={doctor.name}
                      width={112}
                      height={112}
                      className={`w-full h-full object-cover transition-opacity duration-300 ${imgLoaded ? 'opacity-100' : 'opacity-0'}`}
                      onLoad={() => setImgLoaded(true)}
                      priority
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-[#205E98]/10 text-[#205E98] font-black text-3xl">
                      {doctor.name.charAt(0)}
                    </div>
                  )}
                </div>
                {availableToday && (
                  <span className="absolute bottom-1 right-1 w-5 h-5 rounded-full bg-emerald-500 border-4 border-white shadow-sm" />
                )}
              </div>
              
              {/* Mobile Rating Badge */}
              <div className="md:hidden flex items-center gap-1.5 bg-slate-900 px-3 py-1.5 rounded-xl shadow-md mb-2 ml-4">
                <Star className="w-4 h-4 fill-amber-400 text-amber-400 shrink-0" />
                <span className="font-black text-white text-sm tabular-nums">
                  {doctor.rating ? doctor.rating.toFixed(1) : "New"}
                </span>
              </div>
            </div>

            {/* Desktop Rating Badge */}
            <div className="hidden md:flex items-center gap-2 bg-slate-900 px-4 py-2 rounded-xl shadow-md mb-2">
              <Star className="w-4 h-4 fill-amber-400 text-amber-400 shrink-0" />
              <span className="font-black text-white text-base tabular-nums">
                {doctor.rating ? doctor.rating.toFixed(1) : "New"}
              </span>
              {(doctor.reviewCount ?? doctor.reviews ?? 0) > 0 && (
                <span className="text-xs text-slate-500 font-medium">
                  · {(doctor.reviewCount ?? doctor.reviews ?? 0).toLocaleString("en-IN")} reviews
                </span>
              )}
            </div>
          </div>

          <div className="mb-4">
            <div className="flex flex-wrap items-center gap-2 mb-1">
              <h1 className="font-black text-2xl md:text-3xl text-slate-900 tracking-tight flex items-center gap-2">
                {doctor.name}
                <ShieldCheck className="w-6 h-6 text-[#205E98] shrink-0" />
              </h1>
              {((doctor as any).clinicOperations?.emergencySlots > 0 || (doctor as any).emergencySlots > 0) && (
                <div className="flex items-center gap-1 bg-red-50 text-red-700 border border-red-200 px-2.5 py-0.5 rounded-full shadow-sm">
                  <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
                  <span className="text-[10px] font-black uppercase tracking-wider">Emergency Available</span>
                </div>
              )}
            </div>
            <p className="text-base font-bold text-[#205E98] mt-1">{doctor.specialty}</p>
          </div>

          {/* Trust Block */}
          <div className="grid grid-cols-2 md:flex md:flex-wrap items-center gap-4 text-sm text-slate-600 mb-6 bg-slate-50 p-4 rounded-2xl border border-slate-100">
             <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                <span className="font-bold text-emerald-700">{badge}</span>
             </div>
             {doctor.experience && (
               <div className="flex items-center gap-2">
                 <Award className="w-4 h-4 text-slate-500 shrink-0" />
                 <span className="font-medium">{doctor.experience} Experience</span>
               </div>
             )}
             {doctor.languages && doctor.languages.length > 0 && (
               <div className="flex items-center gap-2">
                 <span className="w-4 h-4 flex items-center justify-center text-slate-500 shrink-0">🗣️</span>
                 <span className="font-medium">{doctor.languages.slice(0, 3).join(", ")}</span>
               </div>
             )}
          </div>

          {(isClosedToday || isBookingPaused) && (
            <div className={`mb-6 rounded-2xl px-5 py-4 flex items-start gap-3 border ${
              isClosedToday ? "bg-red-50 border-red-200" : "bg-amber-50 border-amber-200"
            }`}>
              <span className="text-xl leading-none">{isClosedToday ? "🔴" : "⏸️"}</span>
              <div>
                <p className={`text-sm font-black ${isClosedToday ? "text-red-800" : "text-amber-800"}`}>
                  {isClosedToday ? "Clinic Closed Today" : "Online Booking Paused"}
                </p>
                <p className={`text-xs md:text-sm font-medium mt-1 leading-relaxed ${isClosedToday ? "text-red-700/80" : "text-amber-700/80"}`}>
                  {isClosedToday
                    ? "This clinic is not accepting appointments today. Please check back tomorrow."
                    : "Online booking is temporarily paused. Walk-in visits may still be available."}
                </p>
              </div>
            </div>
          )}

          {/* Stats grid */}
          <div className="grid grid-cols-3 gap-3 mt-2">
            {consultCount ? (
              <div className="flex flex-col items-center justify-center text-center p-3 md:p-4 bg-blue-50/50 border border-blue-100/60 rounded-2xl">
                <Users className="w-5 h-5 text-[#205E98] mb-1.5" />
                <span className="font-black text-lg md:text-xl text-slate-900">{consultCount}</span>
                <span className="text-[9px] md:text-[10px] text-slate-500 font-bold uppercase tracking-wide mt-1 leading-tight">Via JivniCare</span>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center text-center p-3 md:p-4 bg-slate-50/50 border border-slate-100/40 rounded-2xl opacity-40">
                <Users className="w-5 h-5 text-slate-400 mb-1.5" />
                <span className="font-black text-lg md:text-xl text-slate-400">New</span>
                <span className="text-[9px] md:text-[10px] text-slate-400 font-bold uppercase tracking-wide mt-1 leading-tight">Partner</span>
              </div>
            )}

            <div className={`flex flex-col items-center justify-center text-center p-3 md:p-4 rounded-2xl ${
              availableToday ? "bg-emerald-50/50 border border-emerald-100/60" : "bg-slate-50 border border-slate-100"
            }`}>
              {doctor.isQueueActive ? (
                <Zap className="w-5 h-5 text-emerald-600 mb-1.5" />
              ) : (
                <Activity className="w-5 h-5 text-slate-500 mb-1.5" />
              )}
              <span className="font-black text-lg md:text-xl text-slate-900">
                {doctor.isQueueActive ? "Live" : (availableToday ? "Open" : "Closed")}
              </span>
              <span className="text-[9px] md:text-[10px] text-slate-500 font-bold uppercase tracking-wide mt-1 leading-tight">Queue</span>
            </div>

            <div className="flex flex-col items-center justify-center text-center p-3 md:p-4 bg-slate-50 border border-slate-100 rounded-2xl">
              <span className="text-sm font-black text-[#205E98] mb-1">₹</span>
              <span className="font-black text-lg md:text-xl text-slate-900 tabular-nums">
                {doctor.fee.replace("₹", "")}
              </span>
              <span className="text-[9px] md:text-[10px] text-slate-500 font-bold uppercase tracking-wide mt-1 leading-tight">Consult</span>
            </div>
          </div>

          {doctor.lifetimePatientsDeclaration && (
            <div className="mt-3 text-center px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl">
              <p className="text-sm font-black text-slate-700">{doctor.lifetimePatientsDeclaration} Patients Served</p>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">Doctor Declared (Not Verified by JivniCare)</p>
            </div>
          )}
        </div>
      </div>

      {/* OPD SCHEDULE */}
      <Card className="rounded-3xl border-slate-100 shadow-soft">
        <CardContent className="p-5 md:p-6 space-y-5">
          <div className={`flex items-center gap-4 p-4 rounded-2xl ${
            !availableToday ? "bg-slate-50 border border-slate-100" 
            : (doctor.availableSlots || 0) > 0 ? "bg-emerald-50/50 border border-emerald-100" 
            : "bg-red-50/50 border border-red-100"
          }`}>
            <div className={`p-3 rounded-xl ${
              !availableToday ? "bg-slate-200 text-slate-500"
              : (doctor.availableSlots || 0) > 0 ? "bg-emerald-100 text-emerald-600"
              : "bg-red-100 text-red-600"
            }`}>
              <CalendarCheck className="w-5 h-5" />
            </div>
            <div>
              <p className={`text-sm md:text-base font-black ${
                !availableToday ? "text-slate-700"
                : (doctor.availableSlots || 0) > 0 ? "text-emerald-800"
                : "text-red-800"
              }`}>
                {!availableToday ? "Not available today" : (doctor.availableSlots || 0) > 0 ? `${doctor.availableSlots} slots available today` : "Slots full today"}
              </p>
              {doctor.nextAvailable && doctor.nextAvailable !== "N/A" && doctor.nextAvailable !== "Today" && (
                <p className="text-xs md:text-sm text-slate-500 font-medium mt-0.5">
                  First slot at {doctor.nextAvailable}
                </p>
              )}
            </div>
          </div>

          <div>
            <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-3">OPD Schedule</p>
            <div className="space-y-1">
              {DAYS.map((d) => {
                const sched = (doctor as any).weeklySchedule?.[d.id] || { isOpen: false };
                const isTodayStr = new Date().toLocaleDateString("en-US", { weekday: "long", timeZone: "Asia/Kolkata" }).toLowerCase() === d.id;
                return (
                  <div key={d.id} className={`flex items-center justify-between px-4 py-3 rounded-xl ${
                    isTodayStr ? "bg-[#205E98]/5 border border-[#205E98]/10" : "hover:bg-slate-50"
                  }`}>
                    <div className="flex items-center gap-3">
                      {isTodayStr && <span className="w-1.5 h-4 rounded-full bg-[#205E98] shrink-0" />}
                      <span className={`text-sm font-bold ${isTodayStr ? "text-[#205E98]" : "text-slate-600"}`}>
                        {d.label} {isTodayStr && <span className="text-[10px] font-black ml-1 text-[#205E98]">TODAY</span>}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`w-2 h-2 rounded-full shrink-0 ${sched.isOpen ? "bg-emerald-500" : "bg-slate-300"}`} />
                      <span className={`text-sm font-bold tabular-nums ${sched.isOpen ? "text-slate-800" : "text-slate-600"}`}>
                        {sched.isOpen ? `${fmtTime(sched.start)} – ${fmtTime(sched.end)}` : "Closed"}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="flex items-center gap-2 px-4 py-3 rounded-xl bg-blue-50/50 border border-blue-100 text-sm font-medium text-slate-700">
            <MapPin className="w-4 h-4 text-[#205E98] shrink-0" />
            <span className="line-clamp-2">{doctor.clinic}, {doctor.location}</span>
          </div>
        </CardContent>
      </Card>

      {/* ABOUT CARD */}
      <Card className="rounded-3xl border-slate-100 shadow-soft">
        <CardContent className="p-5 md:p-6 space-y-5">
          <div>
            <h2 className="text-sm font-bold text-slate-500 uppercase tracking-widest flex items-center gap-2 mb-3">
              About the Doctor
            </h2>
            <div className={`text-sm md:text-base text-slate-600 leading-relaxed font-medium transition-all ${isBioExpanded ? "" : "line-clamp-3"}`}>
              {bioText}
            </div>
            {isLongBio && (
              <button 
                onClick={() => setIsBioExpanded(!isBioExpanded)}
                className="text-[#205E98] text-sm font-bold mt-2 flex items-center gap-1 hover:underline focus:outline-none"
              >
                {isBioExpanded ? "Show less" : "Read more"}
                {isBioExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
              </button>
            )}
          </div>

          <div className="pt-2">
            <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-3">Expertise & Tags</p>
            <div className="flex flex-wrap gap-2">
              {expertiseTags.map((tag) => (
                <Badge
                  key={tag}
                  variant="outline"
                  className="text-xs font-semibold text-slate-600 border-slate-200 bg-slate-50 hover:bg-slate-100 rounded-xl px-3 py-1.5"
                >
                  {tag}
                </Badge>
              ))}
            </div>
          </div>

          {(doctor.education || doctor.qualifications) && (
            <div className="pt-4 border-t border-slate-100 mt-4">
              <h2 className="text-sm font-bold text-slate-500 uppercase tracking-widest flex items-center gap-2 mb-3">
                <GraduationCap className="w-4 h-4" />
                Education & Qualifications
              </h2>
              <div className="text-sm md:text-base text-slate-700 font-medium bg-slate-50 p-4 rounded-2xl border border-slate-100">
                {doctor.education || doctor.qualifications}
              </div>
            </div>
          )}

          {doctor.languages && doctor.languages.length > 0 && (
            <div className="pt-4 border-t border-slate-100 mt-4">
              <h2 className="text-sm font-bold text-slate-500 uppercase tracking-widest flex items-center gap-2 mb-3">
                <span className="w-4 h-4 flex items-center justify-center">🗣️</span>
                Languages Spoken
              </h2>
              <div className="flex flex-wrap gap-2">
                {doctor.languages.map((lang: string) => (
                  <Badge
                    key={lang}
                    variant="secondary"
                    className="text-xs font-bold text-[#205E98] bg-blue-50 border border-blue-100 rounded-lg px-3 py-1.5"
                  >
                    {lang}
                  </Badge>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* RELATED DOCTORS */}
      {relatedDoctors && relatedDoctors.length > 0 && (
        <div className="pt-4">
          <div className="mb-4">
            <h3 className="text-sm font-bold text-slate-500 uppercase tracking-widest">Similar Specialists</h3>
          </div>
          <div className="flex overflow-x-auto gap-4 pb-4 snap-x snap-mandatory scrollbar-hide -mx-4 px-4 md:mx-0 md:px-0 md:grid md:grid-cols-3">
            {relatedDoctors.map((relDoc) => (
              <Link 
                href={`/doctors/${relDoc.slug}`} 
                key={relDoc.id}
                className="shrink-0 snap-start w-[85%] sm:w-[320px] md:w-auto bg-white rounded-3xl border border-slate-100 p-5 shadow-soft hover:shadow-premium hover:-translate-y-1 transition-all flex flex-col group"
              >
                <div className="flex items-start gap-4">
                  <div className="relative w-14 h-14 rounded-2xl bg-slate-50 overflow-hidden shrink-0 border border-slate-100">
                    {relDoc.image ? (
                      <Image src={getCanonicalImageUrl(relDoc.image, relDoc.updatedAt) || ""} alt={relDoc.name} width={400} height={300} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-[#205E98] font-bold text-xl">{relDoc.name.charAt(0)}</div>
                    )}
                  </div>
                  <div>
                    <h4 className="font-black text-base text-slate-900 group-hover:text-[#205E98] transition-colors">{displayName(relDoc.name)}</h4>
                    <p className="text-sm font-bold text-[#205E98]">{relDoc.specialty}</p>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
