"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Star, MapPin, Clock, ShieldCheck,
  ChevronRight, Users, Zap, Activity, Shield,
  Globe, GraduationCap, Siren
} from "lucide-react";
import type { Doctor } from "@/types";
import { cn } from "@/lib/utils/utils";
import React, { useMemo, useCallback } from 'react';
import { getStableKey } from '@/lib/getStableKey';
import { getCanonicalImageUrl } from '@/lib/imageHelper';
import DoctorMeta from '@/components/DoctorMeta';
interface DoctorCardProps {
  doctor: Doctor;
  className?: string;
  priority?: boolean;
}

// ── Helpers ────────────────────────────────────────────────────────────────────

function getAvailabilityConfig(doctor: Doctor) {
  const status = doctor.availabilityStatus || doctor.available || "";
  const lower = status.toLowerCase();

  // Emergency Mode Active
  if (lower.includes("emergency_only") || lower.includes("emergency only")) {
    return {
      label: "Emergency Only",
      pill: "text-red-700 bg-red-50 border-red-200 font-extrabold animate-pulse",
      dot: "bg-red-600",
      pulse: true,
      isClosed: false,
      isPaused: false,
      isEmergency: true,
    };
  }

  // Closed Today — highest priority
  if (lower.includes("opd closed") || lower.includes("closed today") || doctor.available?.toLowerCase().includes("closed")) {
    return {
      label: "Closed Today",
      pill: "text-red-700 bg-red-50 border-red-200",
      dot: "bg-red-500",
      pulse: false,
      isClosed: true,
      isPaused: false,
    };
  }

  // Online Booking Paused
  if (lower.includes("booking paused") || lower.includes("paused")) {
    return {
      label: "Walk-in Only",
      pill: "text-amber-700 bg-amber-50 border-amber-200",
      dot: "bg-amber-500",
      pulse: false,
      isClosed: false,
      isPaused: true,
    };
  }

  // Live queue / accepting walk-ins
  if (lower.includes("instant") || lower.includes("mins") || lower.includes("opd open") || doctor.isQueueActive) {
    return {
      label: "Accepting Walk-ins",
      pill: "text-emerald-700 bg-emerald-50 border-emerald-100",
      dot: "bg-emerald-500",
      pulse: true,
      isClosed: false,
      isPaused: false,
    };
  }

  // Available today
  if (lower.includes("today") || lower.includes("slot")) {
    return {
      label: "Next Available Today",
      pill: "text-[#205E98] bg-blue-50 border-blue-100",
      dot: "bg-[#205E98]",
      pulse: false,
      isClosed: false,
      isPaused: false,
    };
  }

  if (lower.includes("tomorrow")) {
    return {
      label: "Available Tomorrow",
      pill: "text-amber-700 bg-amber-50 border-amber-100",
      dot: "bg-amber-500",
      pulse: false,
      isClosed: false,
      isPaused: false,
    };
  }

  return {
    label: "Check Schedule",
    pill: "text-slate-600 bg-slate-50 border-slate-200",
    dot: "bg-slate-400",
    pulse: false,
    isClosed: false,
    isPaused: false,
  };
}

function formatExperience(exp: string): string {
  const years = parseInt(exp);
  if (isNaN(years)) return exp;
  return `${years}+ Years Exp.`;
}

function formatConsultations(n: number): string | null {
  if (n >= 10000) return `${Math.floor(n / 1000)}k+`;
  if (n >= 1000)  return `${(n / 1000).toFixed(1)}k+`;
  if (n > 0)      return `${n}+`;
  return null;
}

function getDoctorUrl(doctor: Doctor): string {
  const slug = doctor.publicSlug || doctor.slug;
  if (slug && !/^[0-9a-f-]{36}$/i.test(slug)) return `/doctors/${slug}`;
  return `/doctors/${doctor.id}`;
}

/** Returns display name — never double-prefixes with Dr. */
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
  const consultCount = doctor.lifetimePatientsDeclaration 
    ? formatConsultations(Number(doctor.lifetimePatientsDeclaration)) 
    : null;
  const badge = doctor.verifiedBadgeLabel ?? "JivniCare Verified";
  // Only use clinicImage from DB — never fall back to bgImage (Unsplash placeholder)
  const banner = doctor.clinicImage || undefined;
  const quals = doctor.qualifications
    || (doctor.education?.split(",").slice(0, 2).join(", "))
    || "";

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

      {/* ── Section 1: Header / Banner ── */}
      <div className="relative h-[110px] w-full overflow-hidden bg-slate-100">
        {banner && (
          <Image
            src={getCanonicalImageUrl(banner, doctor.updatedAt) || ""}
            alt={doctor.clinic}
            fill
            className="object-cover transition-transform duration-700 group-hover:scale-105"
            sizes="(max-width: 768px) 100vw, 33vw"
            priority={priority}
            quality={60}
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-black/5 to-transparent" />
        
        {/* Availability Status Chip */}
        <div className={cn(
          "absolute top-3 right-3 z-10 flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-[10px] font-bold uppercase tracking-wider backdrop-blur-md transition-colors",
          avail.pill
        )}>
          <span className={cn(
            "w-2 h-2 rounded-full shrink-0", 
            avail.dot,
            avail.pulse && "animate-pulse"
          )} />
          {avail.label}
        </div>

        {/* Live Indicator or Mode */}
        {doctor.isQueueActive && (
          <div className="absolute top-3 left-3 z-10 flex flex-col gap-0.5">
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white/95 backdrop-blur-md text-[#205E98] border border-blue-100 shadow-sm text-[11px] font-black uppercase tracking-wider">
              <Activity className="w-3 h-3 text-[#205E98] animate-pulse" />
              Live Queue
            </div>
            {doctor.queueWaitMinutes !== undefined && (
              <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-black/70 backdrop-blur-md text-white text-[9.5px] font-bold shadow-sm self-start ml-0.5 border border-white/10">
                <Clock className="w-2.5 h-2.5 text-emerald-400" />
                <span>Wait: {doctor.queueWaitMinutes === 0 ? 'None' : `${doctor.queueWaitMinutes}m`}</span>
                {doctor.patientsWaiting !== undefined && doctor.patientsWaiting > 0 && (
                  <>
                    <span className="w-1 h-1 rounded-full bg-white/30" />
                    <span className="text-white/90">{doctor.patientsWaiting} Ahead</span>
                  </>
                )}
              </div>
            )}
          </div>
        )}
      </div>

      {/* ── Section 2: Identity & Core Info ── */}
      <div className="px-4 pb-4 flex flex-col flex-1">
        {/* Avatar Overlap Row */}
        <div className="flex items-end justify-between -mt-8 mb-3 relative z-10">
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
                <div className="w-full h-full flex items-center justify-center bg-blue-50 text-[#205E98] font-bold text-xl">
                  {doctor.name.charAt(0)}
                </div>
              )}
            </div>
            {avail.pulse && (
              <span className="absolute -bottom-1 -right-1 w-4 h-4 bg-emerald-500 border-[3px] border-white rounded-full" />
            )}
          </div>

          {/* Rating Badge — only shown when real data exists */}
          {doctor.rating && doctor.rating > 0 ? (
            <div className="flex items-center gap-1.5 bg-white border border-slate-100 shadow-sm rounded-xl px-2.5 py-1.5 transition-colors group-hover:border-amber-100">
              <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
              <span className="font-bold text-[13px] text-slate-900 tabular-nums">
                {doctor.rating.toFixed(1)}
              </span>
              {(doctor.reviewCount || doctor.reviews || 0) > 0 && (
                <>
                  <span className="w-px h-3 bg-slate-200 mx-0.5" />
                  <span className="text-[11px] text-slate-500 font-medium">
                    ({(doctor.reviewCount || doctor.reviews || 0).toLocaleString()})
                  </span>
                </>
              )}
            </div>
          ) : (
            <div className="flex items-center gap-1.5 bg-emerald-50 border border-emerald-100 shadow-sm rounded-xl px-2.5 py-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
              <span className="font-bold text-[11px] text-emerald-700">Verified</span>
            </div>
          )}
        </div>

        {/* Name & Specialty Block */}
        <div className="space-y-1 mb-4">
          <div className="flex items-center gap-1.5">
            <h3 className="text-[17px] font-black text-slate-900 leading-tight group-hover:text-[#205E98] transition-colors">
              {displayName(doctor.name)}
            </h3>
            <ShieldCheck className="w-4 h-4 text-[#205E98]" />
          </div>
          <div className="flex items-center gap-1.5 text-[13px] font-bold text-[#205E98]">
            <span>{doctor.specialty}</span>
            <span className="w-1 h-1 rounded-full bg-slate-300" />
            <span className="text-slate-600">{formatExperience(doctor.experience)}</span>
          </div>
          {quals && (
            <div className="flex items-center gap-1.5 text-[11.5px] text-slate-500 font-medium line-clamp-1">
              <GraduationCap className="w-3.5 h-3.5 text-slate-400" />
              {quals}
            </div>
          )}
        </div>

        {/* Trust Chips Row */}
        <div className="flex flex-wrap gap-2 mb-5">
          <div className="flex items-center gap-1.5 px-2 py-1 rounded-lg bg-blue-50/50 border border-blue-100 text-[#205E98] text-[10.5px] font-bold">
            <Shield className="w-3 h-3" />
            {badge}
          </div>
          {doctor.emergencyAvailable && (
            <div className="flex items-center gap-1.5 px-2 py-1 rounded-lg bg-red-50 border border-red-200 text-red-600 text-[10.5px] font-bold animate-pulse">
              <Siren className="w-3 h-3 text-red-600" />
              Emergency Open
            </div>
          )}
          {consultCount && (
            <div className="flex items-center gap-1.5 px-2 py-1 rounded-lg bg-emerald-50/50 border border-emerald-100 text-emerald-700 text-[10.5px] font-bold">
              <Users className="w-3 h-3" />
              {consultCount} Happy Patients
            </div>
          )}
          {doctor.languages && doctor.languages.length > 0 && (
            <div className="flex items-center gap-1.5 px-2 py-1 rounded-lg bg-slate-50 border border-slate-100 text-slate-600 text-[10.5px] font-bold">
              <Globe className="w-3 h-3" />
              {doctor.languages[0]} {doctor.languages.length > 1 && `+${doctor.languages.length - 1}`}
            </div>
          )}
        </div>

        {/* Practice/Hospital Info */}
        <div className="mt-auto space-y-3">
          <DoctorMeta doctor={doctor} />

          {/* Pricing & CTA Block */}
          <div className="flex items-center justify-between gap-4 pt-1">
            <div className="flex flex-col">
              <span className="text-[18px] font-black text-slate-900 leading-none">{doctor.fee}</span>
              <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mt-1">
                Consultation Fee
              </span>
            </div>

            <div className="flex-1 max-w-[170px] relative z-40">
              <button
                onClick={goToDoctor}
                className={cn(
                  "w-full h-[40px] rounded-[12px] font-bold text-[13px] tracking-wide",
                  "flex items-center justify-center gap-1.5",
                  "active:scale-[0.98] transition-all duration-200 group",
                  avail.isClosed
                    ? "bg-slate-100 text-slate-400 border border-slate-200 cursor-not-allowed"
                    : (avail as any).isEmergency
                    ? "bg-red-600 text-white border-transparent hover:bg-red-700 animate-pulse"
                    : avail.isPaused
                    ? "bg-amber-50 text-amber-700 border border-amber-200 hover:bg-amber-100"
                    : cn(
                        "bg-primary text-white",
                        "shadow-sm shadow-primary/20",
                        "border border-primary/80",
                        "hover:bg-primary/90 hover:shadow-md hover:shadow-primary/30"
                      )
                )}
              >
                <span>
                  {avail.isClosed 
                    ? "Closed Today" 
                    : (avail as any).isEmergency 
                    ? "Emergency Visit" 
                    : avail.isPaused 
                    ? "Walk-in Only" 
                    : "Book Clinic Visit"}
                </span>
                {!avail.isClosed && (
                  <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform opacity-80" />
                )}
              </button>
              <p className={cn(
                "text-center mt-1.5 text-[9.5px] font-bold flex items-center justify-center gap-0.5",
                avail.isClosed ? "text-slate-400" : (avail as any).isEmergency ? "text-red-600" : avail.isPaused ? "text-amber-600" : "text-emerald-600"
              )}>
                {avail.isClosed ? (
                  "Not accepting today"
                ) : (avail as any).isEmergency ? (
                  "🚨 Emergency Cases Only"
                ) : avail.isPaused ? (
                  "Call clinic for walk-in"
                ) : (
                  <>
                    <ShieldCheck className="w-3 h-3" />
                    {doctor.nextAvailable && doctor.nextAvailable !== "Today" ? `Next Slot: ${doctor.nextAvailable}` : "Confirmed Booking"}
                  </>
                )}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
);
