"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  MapPin, Clock, ShieldCheck, ChevronRight, Activity, Shield, Globe, GraduationCap
} from "lucide-react";
import type { Doctor } from "@/types";
import { cn } from "@/lib/utils/utils";
import React, { useMemo, useCallback } from 'react';
import { getCanonicalImageUrl } from '@/lib/imageHelper';

interface DoctorCardProps {
  doctor: Doctor;
  className?: string;
  priority?: boolean;
}

// ── Helpers ────────────────────────────────────────────────────────────────────

function getAvailabilityConfig(doctor: Doctor) {
  const isQueueActive = !!doctor.isQueueActive;
  const isAvailableToday = !!doctor.isAvailableToday;
  const isClosed = doctor.availabilityStatus === "OFFLINE";
  const isEmergencyOnly = doctor.availabilityStatus === "EMERGENCY_ONLY" || !!doctor.emergencyAvailable;

  if (isEmergencyOnly) {
    return {
      label: "EMERGENCY ONLY",
      pill: "bg-red-50 text-red-700 border-red-100",
      dot: "bg-red-500",
      pulse: true,
      isClosed: false,
      isPaused: false,
      isEmergency: true,
    };
  }

  if (isClosed) {
    return {
      label: "CLOSED TODAY",
      pill: "bg-red-50 text-red-700 border-red-100",
      dot: "bg-red-500",
      pulse: false,
      isClosed: true,
      isPaused: false,
      isEmergency: false,
    };
  }

  if (doctor.availabilityStatus === "ON_BREAK") {
    return {
      label: "WALK-IN PAUSED",
      pill: "bg-amber-50 text-amber-800 border-amber-150",
      dot: "bg-amber-500",
      pulse: false,
      isClosed: false,
      isPaused: true,
      isEmergency: false,
    };
  }

  if (isQueueActive) {
    return {
      label: "ACCEPTING WALK-INS",
      pill: "bg-emerald-50 text-emerald-800 border-emerald-100",
      dot: "bg-emerald-500",
      pulse: true,
      isClosed: false,
      isPaused: false,
      isEmergency: false,
    };
  }

  if (isAvailableToday) {
    return {
      label: "AVAILABLE TODAY",
      pill: "bg-blue-50 text-blue-800 border-blue-100",
      dot: "bg-blue-500",
      pulse: false,
      isClosed: false,
      isPaused: false,
      isEmergency: false,
    };
  }

  return {
    label: doctor.nextAvailable ? `NEXT SLOT: ${doctor.nextAvailable.toUpperCase()}` : "CHECK SCHEDULE",
    pill: "bg-slate-50 text-slate-600 border-slate-200",
    dot: "bg-slate-400",
    pulse: false,
    isClosed: false,
    isPaused: false,
    isEmergency: false,
  };
}

function formatExperience(exp: string): string {
  const years = parseInt(exp);
  if (isNaN(years)) return exp;
  return `${years}+ Years Exp.`;
}

function getDoctorUrl(doctor: Doctor): string {
  const slug = doctor.publicSlug || doctor.slug;
  if (slug && !/^[0-9a-f-]{36}$/i.test(slug)) return `/doctors/${slug}`;
  return `/doctors/${doctor.id}`;
}

function displayName(name: string): string {
  if (!name) return "";
  const trimmed = name.trim();
  return /^Dr\.?\s/i.test(trimmed) ? trimmed : `Dr. ${trimmed}`;
}

// ── Component ──────────────────────────────────────────────────────────────────

export const DoctorCard = React.memo(function DoctorCard({ doctor, className, priority = false }: DoctorCardProps) {
  const router = useRouter();
  const url = getDoctorUrl(doctor);
  const goToDoctor = useCallback(() => router.push(url), [router, url]);
  const avail = useMemo(() => getAvailabilityConfig(doctor), [doctor]);

  const quals = doctor.qualifications || 
    (doctor.education ? doctor.education.split(",")[0].trim() : "");
  
  const isVerified = doctor.verificationStatus === 'VERIFIED';
  
  const primaryLanguage = doctor.languages && doctor.languages.length > 0 ? doctor.languages[0] : null;
  const extraLanguagesCount = doctor.languages && doctor.languages.length > 1 ? doctor.languages.length - 1 : 0;
  
  const waitMinutes = doctor.queueWaitMinutes ?? 0;
  const waitText = waitMinutes > 0 ? `Wait: ${waitMinutes} mins` : "Wait: None";

  return (
    <div
      className={cn(
        "relative group flex flex-col bg-card rounded-2xl overflow-hidden",
        "border border-border shadow-sm",
        "hover:shadow-md hover:border-primary/20 hover:-translate-y-0.5",
        "transition-all duration-300 ease-out h-full will-change-auto",
        className
      )}
    >
      {/* ── Tap Target ── */}
      <Link href={url} className="absolute inset-0 z-30" />

      {/* ── 4.1 Cover Banner ── */}
      <div className="relative h-[120px] w-full overflow-hidden bg-slate-100 shrink-0">
        {doctor.clinicImage ? (
          <>
            <Image
              src={getCanonicalImageUrl(doctor.clinicImage, doctor.updatedAt) || ""}
              alt={doctor.clinic || "Clinic Cover"}
              fill
              className="object-cover transition-transform duration-700 group-hover:scale-105"
              sizes="(max-width: 768px) 100vw, 33vw"
              priority={priority}
              quality={60}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/45 via-black/5 to-transparent" />
          </>
        ) : (
          <div className="absolute inset-0 bg-gradient-to-tr from-[#5696C7] to-[#529C60] flex flex-col justify-between p-3 select-none">
            {/* Subtle tech dots pattern */}
            <div className="absolute inset-0 opacity-[0.08] bg-[radial-gradient(#fff_1px,transparent_1px)] [background-size:12px_12px]" />
            <div className="flex justify-between items-start z-10 w-full">
              <span className="text-[8.5px] font-black tracking-widest text-white/50 uppercase">JivniCare Partner Clinic</span>
            </div>
            <div className="z-10 mt-auto">
              <p className="text-white text-xs font-black leading-tight truncate drop-shadow-sm">
                {doctor.clinic || "Partner Clinic"}
              </p>
              <p className="text-white/80 text-[10px] font-bold leading-tight mt-0.5 truncate flex items-center gap-1">
                <MapPin className="w-2.5 h-2.5 text-white/50 shrink-0" />
                {doctor.location || "Jamui"}
              </p>
            </div>
          </div>
        )}
        
        {/* Top-Left Stacked Badges */}
        {doctor.isQueueActive && (
          <div className="absolute top-3 left-3 z-10 flex flex-col gap-1 items-start">
            {/* Live Queue Pulse Badge */}
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-900/90 backdrop-blur-md text-white border border-slate-800 shadow-sm text-[10px] font-black uppercase tracking-wider">
              <Activity className="w-3 h-3 text-white animate-pulse" />
              Live Queue
            </div>
            {/* Wait Clock Badge */}
            <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-slate-950/80 backdrop-blur-md text-white text-[9.5px] font-bold shadow-sm border border-white/10">
              <Clock className="w-2.5 h-2.5 text-emerald-400" />
              <span>{waitText}</span>
            </div>
          </div>
        )}

        {/* Top-Right Status Badge */}
        <div className={cn(
          "absolute top-3 right-3 z-10 flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-[10px] font-black uppercase tracking-wider backdrop-blur-md transition-colors",
          avail.pill
        )}>
          <span className={cn(
            "w-2 h-2 rounded-full shrink-0", 
            avail.dot,
            avail.pulse && "animate-pulse"
          )} />
          {avail.label}
        </div>
      </div>

      {/* ── 4.2 Avatar + Verified Row ── */}
      <div className="px-4 relative z-10 -mt-8 flex items-end justify-between">
        <div className="relative">
          <div className="w-16 h-16 rounded-2xl border-[3px] border-card shadow-premium bg-card overflow-hidden ring-1 ring-border">
            {doctor.image ? (
              <Image
                src={getCanonicalImageUrl(doctor.image, doctor.updatedAt) || ""}
                alt={doctor.name}
                width={64}
                height={64}
                className="object-cover w-full h-full"
                quality={60}
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-blue-50 text-[#5696C7] font-bold text-xl">
                {doctor.name.charAt(0)}
              </div>
            )}
          </div>
          {/* Active indicator dot */}
          <span className={cn(
            "absolute -bottom-1 -right-1 w-4 h-4 border-[3px] border-card rounded-full shadow-sm",
            avail.isClosed ? "bg-red-500" : "bg-emerald-500"
          )} />
        </div>

        {/* Verified Pill Badge (Avatar Row) */}
        {isVerified && (
          <div className="flex items-center gap-1 bg-emerald-50 border border-emerald-100/80 text-emerald-700 font-bold text-[10px] rounded-full px-2.5 py-1 shadow-sm">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
            <span>✓ Verified</span>
          </div>
        )}
      </div>

      {/* ── Card Content Block ── */}
      <div className="px-4 pb-4 pt-3 flex flex-col flex-1">
        {/* ── 4.3 Name & Credentials Block ── */}
        <div className="space-y-1 mb-4">
          <div className="flex items-center gap-1.5">
            <h3 className="text-lg font-black text-slate-900 leading-tight truncate">
              {displayName(doctor.name)}
            </h3>
            {isVerified && (
              <ShieldCheck className="w-4 h-4 text-[#5696C7] shrink-0" />
            )}
          </div>
          <div className="text-xs font-bold text-[#5696C7] flex items-center gap-1 flex-wrap">
            <span>{doctor.specialty}</span>
            <span className="w-1 h-1 rounded-full bg-slate-300" />
            <span className="text-slate-600">{formatExperience(doctor.experience)}</span>
          </div>
          {quals && (
            <div className="flex items-center gap-1.5 text-[11px] text-slate-500 font-medium truncate pt-0.5">
              <GraduationCap className="w-3.5 h-3.5 text-slate-400" />
              <span>🎓 {quals}</span>
            </div>
          )}
        </div>

        {/* ── 4.4 Tag Chips Row ── */}
        <div className="flex flex-wrap gap-1.5 mb-4">
          {isVerified && (
            <div className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-blue-50/50 border border-blue-100 text-[#5696C7] text-[10px] font-bold">
              <ShieldCheck className="w-3 h-3 text-[#5696C7] shrink-0" />
              <span>Verified Doctor</span>
            </div>
          )}
          {primaryLanguage && (
            <div className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-50 border border-slate-100 text-slate-600 text-[10px] font-bold">
              <Globe className="w-3 h-3 text-slate-400" />
              🌐 {primaryLanguage}{extraLanguagesCount > 0 ? ` +${extraLanguagesCount}` : ''}
            </div>
          )}
        </div>

        {/* ── 4.5 Location Block ── */}
        <div className="bg-slate-50 border border-slate-100 rounded-xl p-3 flex items-start gap-3 w-full mb-4 mt-auto">
          <div className="bg-[#5696C7]/10 text-[#5696C7] p-2 rounded-full flex items-center justify-center shrink-0">
            <MapPin className="w-4 h-4" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-xs font-black text-slate-800 leading-tight truncate">
              {doctor.clinic || "Clinic Partner"}
            </p>
            <p className="text-[11px] text-slate-500 leading-tight mt-0.5 truncate">
              {doctor.location || "OPD Clinic"}
            </p>
          </div>
        </div>

        {/* ── 4.6 Footer Row (Fee + CTA) ── */}
        <div className="flex items-center justify-between gap-3 border-t border-slate-100 pt-3">
          <div className="flex flex-col">
            <span className="text-lg font-black text-slate-900 leading-none">{doctor.fee}</span>
            <span className="text-[9px] text-slate-400 font-black uppercase tracking-wider mt-1">
              Consultation Fee
            </span>
          </div>

          <div className="flex-1 max-w-[155px] relative z-40">
            <button
              onClick={goToDoctor}
              disabled={avail.isClosed}
              className={cn(
                "w-full h-10 rounded-xl font-bold text-xs tracking-wide",
                "flex items-center justify-center gap-1",
                "active:scale-[0.98] transition-all duration-200 group border",
                avail.isClosed
                  ? "bg-slate-100 text-slate-400 border-slate-200 cursor-not-allowed"
                  : avail.isEmergency
                  ? "bg-red-600 text-white border-transparent hover:bg-red-700"
                  : avail.isPaused
                  ? "bg-amber-50 text-amber-700 border-amber-200 hover:bg-amber-100"
                  : "bg-[#5696C7] text-white border-transparent hover:bg-[#184a7a]"
              )}
            >
              <span>
                {avail.isClosed
                  ? "Closed Today"
                  : avail.isEmergency
                  ? "Emergency Only"
                  : avail.isPaused
                  ? "Walk-in Only"
                  : "Book Clinic Visit"}
              </span>
              {!avail.isClosed && (
                <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
              )}
            </button>
            <div className="text-center mt-1 text-[9.5px] font-bold flex items-center justify-center gap-0.5 text-emerald-600">
              <ShieldCheck className="w-3 h-3 text-emerald-600" />
              <span>Confirmed Booking</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
});
