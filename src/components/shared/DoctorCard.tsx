"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  Star, MapPin, Clock, BadgeCheck,
  ChevronRight, Users, Zap, Activity, Shield,
  Globe, Video, GraduationCap
} from "lucide-react";
import type { Doctor } from "@/types";
import { cn } from "@/lib/utils";

interface DoctorCardProps {
  doctor: Doctor;
  className?: string;
}

// ── Helpers ────────────────────────────────────────────────────────────────────

function getAvailabilityConfig(doctor: Doctor) {
  const status = doctor.availabilityStatus || doctor.available || "";
  const lower = status.toLowerCase();
  
  if (lower.includes("instant") || lower.includes("12 mins") || lower.includes("opd open")) {
    return { 
      label: status || "OPD Open",
      pill: "text-emerald-700 bg-emerald-50 border-emerald-100", 
      dot: "bg-emerald-500",
      pulse: true
    };
  }
  if (lower.includes("today") || lower.includes("slot")) {
    return { 
      label: status || "Available Today",
      pill: "text-[#205E98] bg-blue-50 border-blue-100", 
      dot: "bg-[#205E98]",
      pulse: false
    };
  }
  if (lower.includes("tomorrow")) {
    return { 
      label: status || "Tomorrow",
      pill: "text-amber-700 bg-amber-50 border-amber-100", 
      dot: "bg-amber-500",
      pulse: false
    };
  }
  return { 
    label: status || "Check Schedule",
    pill: "text-slate-600 bg-slate-50 border-slate-200", 
    dot: "bg-slate-400",
    pulse: false
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

// ── Component ──────────────────────────────────────────────────────────────────

export function DoctorCard({ doctor, className }: DoctorCardProps) {
  const url = getDoctorUrl(doctor);
  const avail = getAvailabilityConfig(doctor);
  const consultCount = formatConsultations(doctor.totalConsultations ?? 0);
  const badge = doctor.verifiedBadgeLabel ?? "JivniCare Verified";
  const banner = doctor.clinicImage || doctor.bgImage;
  const quals = doctor.qualifications
    || (doctor.education?.split(",").slice(0, 2).join(", "))
    || "";

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -4 }}
      className={cn(
        "relative group flex flex-col bg-card rounded-2xl overflow-hidden",
        "border border-border shadow-soft",
        "hover:shadow-premium hover:border-primary/30",
        "transition-all duration-300 ease-out h-full",
        className
      )}
    >
      {/* ── Tap Target ── */}
      <Link href={url} className="absolute inset-0 z-30" />

      {/* ── Section 1: Header / Banner ── */}
      <div className="relative h-[110px] w-full overflow-hidden bg-slate-100">
        {banner && (
          <Image
            src={banner}
            alt={doctor.clinic}
            fill
            className="object-cover transition-transform duration-700 group-hover:scale-105"
            sizes="(max-width: 768px) 100vw, 33vw"
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
          <div className="absolute top-3 left-3 z-10 flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white/90 backdrop-blur-md text-[#205E98] border border-blue-100 shadow-sm text-[11px] font-black uppercase tracking-wider">
            <Activity className="w-3 h-3" />
            Live Queue
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
                  src={doctor.image}
                  alt={doctor.name}
                  width={64}
                  height={64}
                  className="object-cover w-full h-full"
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

          {/* Rating Badge */}
          <div className="flex items-center gap-1.5 bg-white border border-slate-100 shadow-sm rounded-xl px-2.5 py-1.5 transition-colors group-hover:border-amber-100">
            <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
            <span className="font-bold text-[13px] text-slate-900 tabular-nums">
              {doctor.rating?.toFixed(1) || "4.8"}
            </span>
            <span className="w-px h-3 bg-slate-200 mx-0.5" />
            <span className="text-[11px] text-slate-500 font-medium">
              ({(doctor.reviewCount || doctor.reviews || 0).toLocaleString()})
            </span>
          </div>
        </div>

        {/* Name & Specialty Block */}
        <div className="space-y-1 mb-4">
          <div className="flex items-center gap-1.5">
            <h3 className="text-[17px] font-black text-slate-900 leading-tight group-hover:text-[#205E98] transition-colors">
              Dr. {doctor.name}
            </h3>
            <BadgeCheck className="w-4 h-4 text-[#205E98]" />
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
          <div className="flex items-start gap-2.5 p-3 rounded-2xl bg-slate-50/80 border border-slate-100/50 group-hover:bg-blue-50/30 group-hover:border-blue-100/50 transition-colors">
            <div className="w-8 h-8 rounded-lg bg-white flex items-center justify-center border border-slate-100 shrink-0">
              <MapPin className="w-4 h-4 text-[#205E98]" />
            </div>
            <div className="min-w-0">
              <p className="text-[13px] font-black text-slate-800 leading-tight line-clamp-1 mb-0.5">
                {doctor.clinic}
              </p>
              <div className="flex items-center gap-1.5 text-[11.5px] text-slate-500 font-medium">
                <span className="line-clamp-1">{doctor.locality || doctor.location}</span>
                {doctor.distance && (
                  <>
                    <span className="w-1 h-1 rounded-full bg-slate-300" />
                    <span className="text-[#205E98] font-bold">{doctor.distance}</span>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Pricing & CTA Block */}
          <div className="flex items-center justify-between gap-4 pt-1">
            <div className="flex flex-col">
              <div className="flex items-baseline gap-1">
                <span className="text-[18px] font-black text-slate-900 leading-none">{doctor.fee}</span>
                <span className="text-[11px] text-slate-400 font-bold line-through opacity-50">₹500</span>
              </div>
              <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mt-1">
                Consultation Fee
              </span>
            </div>

            <div className="flex-1 max-w-[150px] relative z-40">
              <button
                className={cn(
                  "w-full h-12 rounded-xl bg-primary text-primary-foreground font-bold text-sm",
                  "flex items-center justify-center gap-1.5 shadow-sm",
                  "hover:bg-primary/90 hover:shadow-md active:scale-[0.98]",
                  "transition-all duration-200"
                )}
              >
                Book Visit
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
