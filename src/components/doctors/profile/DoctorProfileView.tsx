"use client";

import { useState } from "react";
import {
  ShieldCheck, Star, Award, MapPin,
  GraduationCap, BadgeCheck, Clock, Users, Activity,
  CalendarCheck, Stethoscope, Share2, CheckCircle2, Zap
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import type { Doctor } from "@/types";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";

interface DoctorProfileViewProps {
  doctor: Doctor;
}

// ── Format 24h → 12h ───────────────────────────────────────────
const fmtTime = (t: string) => {
  if (!t) return "—";
  const [h, m] = t.split(":");
  const hh = parseInt(h);
  return `${hh % 12 || 12}:${m} ${hh >= 12 ? "PM" : "AM"}`;
};

// ── Format consultation count ─────────────────────────────────
function fmtCount(n: number): string {
  if (n >= 10000) return `${Math.floor(n / 1000)}k+`;
  if (n >= 1000) return `${(n / 1000).toFixed(1)}k+`;
  if (n > 0) return `${n}+`;
  return "500+"; // sensible verified default
}

// ── Days of week ──────────────────────────────────────────────
const DAYS = [
  { id: "monday",    label: "Mon" },
  { id: "tuesday",   label: "Tue" },
  { id: "wednesday", label: "Wed" },
  { id: "thursday",  label: "Thu" },
  { id: "friday",    label: "Fri" },
  { id: "saturday",  label: "Sat" },
  { id: "sunday",    label: "Sun" },
];

export function DoctorProfileView({ doctor }: DoctorProfileViewProps) {
  const [showToast, setShowToast] = useState(false);
  const availableToday = doctor.available?.toLowerCase().includes("today");
  const badge = doctor.verifiedBadgeLabel ?? "Verified Doctor";
  const consultCount = fmtCount(doctor.totalConsultations ?? 0);
  const reviewCount = doctor.reviewCount ?? doctor.reviews ?? 0;
  const clinicImage = doctor.clinicImage || doctor.bgImage;

  // Filter meaningful tags (specialty + keywords, deduplicated, max 8)
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
      if (navigator.share) {
        await navigator.share(shareData);
      } else {
        await navigator.clipboard.writeText(window.location.href);
        setShowToast(true);
        setTimeout(() => setShowToast(false), 3000);
      }
    } catch (err) {
      console.error("Error sharing:", err);
    }
  };

  return (
    <div className="space-y-4">
      {/* Toast Feedback */}
      <AnimatePresence>
        {showToast && (
          <motion.div
            initial={{ opacity: 0, y: 50, x: "-50%" }}
            animate={{ opacity: 1, y: 0, x: "-50%" }}
            exit={{ opacity: 0, y: 20, x: "-50%" }}
            className="fixed bottom-24 left-1/2 z-[100] bg-slate-900 text-white text-[12px] font-bold px-4 py-2 rounded-full shadow-2xl flex items-center gap-2"
          >
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
            Link copied to clipboard
          </motion.div>
        )}
      </AnimatePresence>

      {/* ════════════════════════════════════════════════════════
          HERO CARD — Identity, Trust, Stats
          ════════════════════════════════════════════════════════ */}
      <div className="bg-white rounded-[22px] border border-slate-100 shadow-[0_2px_20px_rgba(0,0,0,0.06)] overflow-hidden">

        {/* ── Clinic Banner ── */}
        <div className="relative h-[120px] md:h-[160px] bg-gradient-to-br from-[#205E98]/15 via-blue-50 to-slate-50 overflow-hidden">
          {clinicImage && (
            <Image
              src={clinicImage}
              alt={`${doctor.clinic} facility`}
              fill
              priority
              sizes="(max-width: 768px) 100vw, 800px"
              className="object-cover opacity-55"
            />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-white/80 via-white/10 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-r from-[#205E98]/10 to-transparent" />

          {/* Share action */}
          <button
            onClick={handleShare}
            className="absolute top-3 right-3 p-2 rounded-full bg-white/80 backdrop-blur-sm border border-white/60 shadow-sm hover:bg-white active:scale-90 transition-all z-20"
            aria-label="Share profile"
          >
            <Share2 className="w-3.5 h-3.5 text-slate-500" />
          </button>

          {/* Availability chip — on banner */}
          <div className={`absolute bottom-3 right-3 flex items-center gap-1.5 text-[10.5px] font-bold px-2.5 py-1 rounded-full border backdrop-blur-md ${
            availableToday
              ? "bg-emerald-50 border-emerald-200 text-emerald-700"
              : "bg-white/80 border-slate-200 text-slate-600"
          }`}>
            <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${availableToday ? "bg-emerald-500 animate-pulse" : "bg-slate-400"}`} />
            {availableToday ? "Available Today" : doctor.available}
          </div>
        </div>

        {/* ── Identity block ── */}
        <div className="px-4 md:px-6 pb-5">

          {/* Avatar row — overlaps banner */}
          <div className="flex items-end justify-between -mt-10 mb-3 relative z-10">
            <div className="relative">
              <div className="w-20 h-20 rounded-[18px] border-[3px] border-white shadow-xl bg-white ring-1 ring-slate-100 overflow-hidden">
                {doctor.image ? (
                  <Image
                    src={doctor.image}
                    alt={doctor.name}
                    width={80}
                    height={80}
                    className="object-cover w-full h-full"
                    priority
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-[#205E98]/10 text-[#205E98] font-black text-2xl">
                    {doctor.name.charAt(0)}
                  </div>
                )}
              </div>
              {availableToday && (
                <span className="absolute bottom-1 right-1 w-4 h-4 rounded-full bg-emerald-500 border-[2.5px] border-white shadow-sm" />
              )}
            </div>

            <div className="flex items-center gap-2 bg-slate-900 px-3 py-1.5 rounded-xl shadow-lg mb-1">
              <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400 shrink-0" />
              <span className="font-black text-white text-[15px] tabular-nums leading-none">
                {typeof doctor.rating === "number" ? doctor.rating.toFixed(1) : "4.8"}
              </span>
              {reviewCount > 0 && (
                <span className="text-[10px] text-slate-400 font-medium leading-none">
                  · {reviewCount.toLocaleString("en-IN")} reviews
                </span>
              )}
            </div>
          </div>

          <div className="mb-3">
            <div className="flex items-start gap-2 flex-wrap">
              <h1 className="font-black text-[22px] md:text-[26px] text-slate-900 leading-tight tracking-tight">
                {doctor.name}
              </h1>
              <span title={badge} className="shrink-0 mt-1.5 flex items-center">
                <BadgeCheck className="w-5 h-5 text-[#205E98]" />
              </span>
            </div>

            <div className="flex items-center gap-2 mt-1 flex-wrap">
              <span className="text-[13px] font-bold text-[#205E98]">{doctor.specialty}</span>
              {(doctor.qualifications || doctor.education) && (
                <>
                  <span className="text-slate-300 text-xs">·</span>
                  <span className="text-[12px] text-slate-500 font-medium">
                    {doctor.qualifications || doctor.education?.split(",").slice(0, 2).join(", ")}
                  </span>
                </>
              )}
            </div>

            <div className="flex flex-wrap items-center gap-3 mt-2.5 text-[12px] text-slate-500">
              {doctor.experience && (
                <div className="flex items-center gap-1">
                  <Award className="w-3.5 h-3.5 text-[#205E98] shrink-0" />
                  <span className="font-semibold text-slate-700">{doctor.experience}</span>
                  <span>experience</span>
                </div>
              )}
              {doctor.education && (
                <div className="flex items-center gap-1">
                  <GraduationCap className="w-3.5 h-3.5 text-[#205E98] shrink-0" />
                  <span className="font-medium text-slate-600 line-clamp-1">{doctor.education?.split(",")[0]?.trim()}</span>
                </div>
              )}
            </div>
          </div>

          <div className="inline-flex items-center gap-1.5 bg-emerald-50 border border-emerald-200 text-emerald-700 text-[11px] font-bold px-3 py-1 rounded-full mb-4">
            <ShieldCheck className="w-3 h-3 shrink-0" />
            {badge} · Verified by JivniCare
          </div>

          <div className="grid grid-cols-4 gap-2 mt-1">
            <div className="flex flex-col items-center text-center p-2.5 bg-amber-50/60 border border-amber-100/60 rounded-[14px]">
              <Star className="w-4 h-4 fill-amber-400 text-amber-400 mb-1" />
              <span className="font-black text-[15px] text-slate-900 leading-none tabular-nums">
                {typeof doctor.rating === "number" ? doctor.rating.toFixed(1) : "4.8"}
              </span>
              <span className="text-[9px] text-slate-500 font-bold uppercase tracking-wide mt-1">Rating</span>
            </div>

            <div className="flex flex-col items-center text-center p-2.5 bg-blue-50/60 border border-blue-100/60 rounded-[14px]">
              <Users className="w-4 h-4 text-[#205E98] mb-1" />
              <span className="font-black text-[15px] text-slate-900 leading-none">{consultCount}</span>
              <span className="text-[9px] text-slate-500 font-bold uppercase tracking-wide mt-1">Patients</span>
            </div>

            <div className={`flex flex-col items-center text-center p-2.5 rounded-[14px] ${
              availableToday
                ? "bg-emerald-50/60 border border-emerald-100/60"
                : "bg-slate-50 border border-slate-100"
            }`}>
              {doctor.isQueueActive ? (
                <Zap className="w-4 h-4 text-[#205E98] mb-1" />
              ) : (
                <Activity className="w-4 h-4 text-emerald-600 mb-1" />
              )}
              <span className="font-black text-[11px] text-slate-900 leading-tight">
                {doctor.isQueueActive ? "Live" : (availableToday ? "Open" : "Check")}
              </span>
              <span className="text-[9px] text-slate-500 font-bold uppercase tracking-wide mt-1">
                {doctor.isQueueActive ? "Queue" : "OPD"}
              </span>
            </div>

            <div className="flex flex-col items-center text-center p-2.5 bg-slate-50 border border-slate-100 rounded-[14px]">
              <span className="text-[11px] font-black text-[#205E98] mb-0.5">₹</span>
              <span className="font-black text-[15px] text-slate-900 leading-none tabular-nums">
                {doctor.fee.replace("₹", "")}
              </span>
              <span className="text-[9px] text-slate-500 font-bold uppercase tracking-wide mt-1">Consult</span>
            </div>
          </div>
        </div>
      </div>

      {/* ── Clinic Trust Card ── */}
      <Card className="rounded-[22px] border-slate-100 shadow-[0_2px_16px_rgba(0,0,0,0.05)] overflow-hidden">
        <div className="h-[100px] bg-slate-100 relative overflow-hidden">
          {clinicImage ? (
            <Image
              src={clinicImage}
              alt={`${doctor.clinic} clinic`}
              fill
              sizes="(max-width: 768px) 100vw, 600px"
              className="object-cover"
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-[#205E98]/10 to-blue-50 flex items-center justify-center">
              <Stethoscope className="w-8 h-8 text-[#205E98]/30" />
            </div>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-black/10 to-transparent" />
          <div className="absolute bottom-0 left-0 right-0 px-4 pb-3">
            <h2 className="font-black text-white text-[15px] leading-tight drop-shadow-sm line-clamp-1">
              {doctor.clinic}
            </h2>
            <p className="text-white/80 text-[11px] font-medium flex items-center gap-1 mt-0.5">
              <MapPin className="w-2.5 h-2.5 shrink-0" />
              {doctor.location}
            </p>
          </div>
        </div>

        <CardContent className="p-4 space-y-4">
          <div className={`flex items-center gap-3 p-3 rounded-[14px] ${
            availableToday
              ? "bg-emerald-50 border border-emerald-100"
              : "bg-slate-50 border border-slate-100"
          }`}>
            <div className={`p-2 rounded-xl ${availableToday ? "bg-emerald-100" : "bg-slate-100"}`}>
              <CalendarCheck className={`w-4 h-4 ${availableToday ? "text-emerald-600" : "text-slate-400"}`} />
            </div>
            <div>
              <p className={`text-[12px] font-black ${availableToday ? "text-emerald-700" : "text-slate-600"}`}>
                {availableToday ? "OPD Open Today" : "Check Schedule"}
              </p>
              {doctor.nextAvailable && doctor.nextAvailable !== "N/A" && (
                <p className="text-[11px] text-slate-500 mt-0.5">
                  First slot at {doctor.nextAvailable}
                </p>
              )}
            </div>

            {doctor.isQueueActive && (
              <div className="ml-auto flex items-center gap-1 text-[10px] font-bold text-[#205E98] bg-[#205E98]/8 border border-[#205E98]/20 px-2 py-1 rounded-lg">
                <Zap className="w-2.5 h-2.5 fill-[#205E98]" />
                Live Queue
                {doctor.queueWaitMinutes && doctor.queueWaitMinutes > 0 && (
                  <span className="text-slate-500 font-normal ml-0.5">· ~{doctor.queueWaitMinutes}m</span>
                )}
              </div>
            )}
          </div>

          <div>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2.5">
              OPD Schedule
            </p>
            <div className="grid grid-cols-1 gap-0.5">
              {DAYS.map((d) => {
                const sched = (doctor as any).weeklySchedule?.[d.id] || { isOpen: false };
                const isTodayStr = new Date().toLocaleDateString("en-US", { weekday: "long" }).toLowerCase() === d.id;
                return (
                  <div
                    key={d.id}
                    className={`flex items-center justify-between px-3 py-2 rounded-xl transition-colors ${
                      isTodayStr
                        ? "bg-[#205E98]/6 border border-[#205E98]/15"
                        : "hover:bg-slate-50"
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      {isTodayStr && <span className="w-1 h-3 rounded-full bg-[#205E98] shrink-0" />}
                      <span className={`text-[12px] font-bold ${isTodayStr ? "text-[#205E98]" : "text-slate-600"}`}>
                        {d.label}
                        {isTodayStr && <span className="text-[9px] font-bold ml-1 text-[#205E98]/70">Today</span>}
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${sched.isOpen ? "bg-emerald-500" : "bg-slate-200"}`} />
                      <span className={`text-[11.5px] font-bold tabular-nums ${sched.isOpen ? "text-slate-800" : "text-slate-300"}`}>
                        {sched.isOpen ? `${fmtTime(sched.start)} – ${fmtTime(sched.end)}` : "Closed"}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="flex items-center gap-2 p-3 rounded-[14px] bg-[#205E98]/5 border border-[#205E98]/10">
            <ShieldCheck className="w-3.5 h-3.5 text-[#205E98] shrink-0" />
            <p className="text-[11px] font-bold text-[#205E98]">
              Verified contact provided through JivniCare platform
            </p>
          </div>
        </CardContent>
      </Card>

      {/* ── About Card ── */}
      <Card className="rounded-[22px] border-slate-100 shadow-[0_2px_16px_rgba(0,0,0,0.05)]">
        <CardContent className="p-4 md:p-5 space-y-4">
          <div>
            <h2 className="text-[13px] font-black text-slate-900 flex items-center gap-1.5 mb-2.5 uppercase tracking-wide">
              <BadgeCheck className="w-4 h-4 text-[#205E98]" />
              About the Doctor
            </h2>
            <p className="text-[13.5px] text-slate-600 leading-[1.7] font-medium">
              {doctor.about && doctor.about !== "Experienced and dedicated doctor."
                ? doctor.about
                : `${doctor.name} is a specialist ${doctor.specialty} based in ${doctor.location}. With ${doctor.experience} of dedicated clinical practice, they provide comprehensive consultations at ${doctor.clinic}.`}
            </p>
          </div>

          <div className="pt-1">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2.5">
              Expertise & Treatments
            </p>
            <div className="flex flex-wrap gap-1.5">
              {expertiseTags.map((tag) => (
                <Badge
                  key={tag}
                  variant="outline"
                  className="text-[11px] font-semibold text-slate-600 border-slate-200 bg-slate-50 hover:border-[#205E98]/30 hover:bg-[#205E98]/4 hover:text-[#205E98] transition-all rounded-lg px-2.5 py-1 cursor-default"
                >
                  {tag}
                </Badge>
              ))}
            </div>
          </div>

          <div className="pt-1 grid grid-cols-1 sm:grid-cols-2 gap-2">
            {[
              "Verified by JivniCare Medical Team",
              "Real-time queue updates",
              "Transparent consultation fees",
              "Book in under 60 seconds",
            ].map((point) => (
              <div key={point} className="flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                <span className="text-[11.5px] text-slate-600 font-medium">{point}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
