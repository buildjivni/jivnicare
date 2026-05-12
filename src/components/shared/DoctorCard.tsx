"use client";

import Image from "next/image";
import Link from "next/link";
import { Star, MapPin, Clock, Zap, GraduationCap, BadgeCheck, CheckCircle2, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import type { Doctor } from "@/types";

interface DoctorCardProps {
  doctor: Doctor;
}

function getAvailabilityColor(available: string) {
  if (available.toLowerCase().includes("today")) return "text-emerald-700 bg-emerald-50/80 border-emerald-200/50";
  if (available.toLowerCase().includes("tomorrow")) return "text-amber-700 bg-amber-50/80 border-amber-200/50";
  return "text-slate-600 bg-slate-50 border-slate-200/50";
}

export function DoctorCard({ doctor }: DoctorCardProps) {
  const isAvailableToday = doctor.available?.toLowerCase().includes("today");
  const availColorClass = getAvailabilityColor(doctor.available || "");

  return (
    <Link href={`/doctors/${doctor.id}`} className="block h-full group outline-none" aria-label={`View profile of ${doctor.name}, ${doctor.specialty}`}>
      <Card className="relative overflow-hidden border border-slate-200/60 shadow-[0_4px_20px_rgba(0,0,0,0.03)] hover:shadow-[0_20px_40px_rgba(32,94,152,0.1)] hover:border-[#205E98]/30 hover:-translate-y-1 transition-all duration-300 bg-white rounded-[24px] h-full flex flex-col group-focus-visible:ring-2 group-focus-visible:ring-[#205E98] group-focus-visible:ring-offset-2">

        {/* 1. Clinic Banner Image */}
        <div className="relative h-28 md:h-32 w-full overflow-hidden shrink-0 bg-slate-100">
          {/* Refined gradient overlay for text readability and premium fade */}
          <div className="absolute inset-0 bg-gradient-to-t from-slate-900/60 via-slate-900/10 to-transparent z-10 transition-opacity duration-300" />
          <Image
            src={doctor.bgImage}
            alt={`${doctor.clinic} facility`}
            fill
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            className="object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
            onError={(e) => { e.currentTarget.style.display = "none"; }}
          />
          
          {/* Emergency / Availability Banner Badge */}
          {isAvailableToday && (
            <div className="absolute top-4 right-4 z-20 flex items-center gap-1.5 bg-white/90 backdrop-blur-md text-red-600 text-[11px] font-bold px-3 py-1.5 rounded-full shadow-sm border border-red-100/50 transition-transform group-hover:scale-105">
              <Zap className="w-3.5 h-3.5 fill-red-500 text-red-500" />
              EMERGENCY
            </div>
          )}
        </div>

        {/* Content Wrapper */}
        <div className="px-5 pb-5 md:px-6 md:pb-6 relative flex-1 flex flex-col">
          
          {/* 2. Overlapping Avatar & Trust Score */}
          <div className="relative flex justify-between items-end -mt-12 mb-4 z-20">
            {/* Avatar Container */}
            <div className="relative group-hover:-translate-y-1 transition-transform duration-300">
              <Avatar className="h-24 w-24 border-[4px] border-white shadow-sm bg-white ring-1 ring-slate-100/50">
                <AvatarImage src={doctor.image} alt={doctor.name} className="object-cover" />
                <AvatarFallback className="bg-slate-50 text-[#205E98] font-bold text-2xl">
                  {doctor.name.charAt(0)}
                </AvatarFallback>
              </Avatar>
              
              {/* Modern Glassmorphic Online Indicator */}
              <div className="absolute bottom-1 right-1 flex h-4 w-4 items-center justify-center rounded-full border-2 border-white bg-emerald-500 shadow-sm z-30">
                <div className="h-full w-full rounded-full animate-ping bg-emerald-400 opacity-75" />
              </div>
            </div>

            {/* Trust Score Pill */}
            <div className="flex flex-col items-end mb-1">
               <div className="flex items-center gap-1.5 bg-white shadow-sm px-2.5 py-1 rounded-lg border border-slate-100">
                 <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                 <span className="font-bold text-[13px] text-slate-800 leading-none">{doctor.rating}</span>
                 <div className="w-[1px] h-3 bg-slate-200 mx-0.5" />
                 <span className="text-[11px] text-slate-500 font-medium leading-none">{doctor.reviews} reviews</span>
               </div>
            </div>
          </div>

          <div className="flex-1 flex flex-col">
            {/* 3. Doctor Identity & Specialization */}
            <div className="mb-4">
              <div className="flex items-center gap-1.5 mb-1">
                <h3 className="font-bold text-xl text-slate-900 group-hover:text-[#205E98] transition-colors leading-tight line-clamp-1">
                  {doctor.name}
                </h3>
                <BadgeCheck className="w-5 h-5 text-[#205E98] shrink-0" aria-label="Verified Doctor" />
              </div>
              <p className="text-[#205E98] font-medium text-[14px]">{doctor.specialty}</p>
            </div>

            {/* 4. Experience & Education Row (Clean Pill format) */}
            <div className="flex flex-wrap items-center gap-2 mb-4">
              <div className="flex items-center gap-1.5 bg-slate-50/80 px-2.5 py-1.5 rounded-lg border border-slate-100/60 text-[12px]">
                <Clock className="w-3.5 h-3.5 text-slate-400" />
                <span className="text-slate-600"><span className="font-semibold text-slate-800">{doctor.experience}</span> exp</span>
              </div>
              <div className="flex items-center gap-1.5 bg-slate-50/80 px-2.5 py-1.5 rounded-lg border border-slate-100/60 text-[12px] min-w-0 max-w-[60%]">
                <GraduationCap className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                <span className="line-clamp-1 text-slate-600" title={doctor.education}>{doctor.education}</span>
              </div>
            </div>

            {/* 5. Expertise Tags */}
            {doctor.tags && doctor.tags.length > 0 && (
              <div className="flex flex-wrap gap-1.5 mb-5">
                {doctor.tags.slice(0, 3).map((tag) => (
                  <span key={tag} className="text-[11px] font-medium text-slate-500 bg-white border border-slate-200 px-2.5 py-1 rounded-md cursor-default">
                    {tag}
                  </span>
                ))}
              </div>
            )}

            {/* Spacer to push logistics to the bottom */}
            <div className="mt-auto" />

            {/* 6. Decision Zone: Logistics (Location, Fee, Availability) */}
            <div className="bg-slate-50/60 rounded-xl p-3 md:p-4 border border-slate-100/60 mb-5 space-y-3">
              <div className="flex items-start gap-3">
                <div className="mt-0.5 p-1.5 bg-white rounded-lg shadow-sm border border-slate-100 shrink-0">
                  <MapPin className="w-4 h-4 text-[#205E98]" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-[13px] text-slate-800 line-clamp-1">{doctor.clinic}</p>
                  <p className="text-[12px] text-slate-500 line-clamp-1 mt-0.5">{doctor.location}</p>
                </div>
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-slate-200/60">
                {/* Modern Availability Badge */}
                <div className={`flex items-center gap-1.5 text-[11px] font-semibold px-2 py-1 rounded-md border ${availColorClass}`}>
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  {doctor.available}
                </div>

                {/* Consultation Fee */}
                <div className="text-right flex flex-col items-end">
                  <span className="font-black text-slate-900 text-[17px] leading-none">{doctor.fee}</span>
                  <span className="text-[10px] text-slate-400 font-medium mt-0.5">Consultation Fee</span>
                </div>
              </div>
            </div>

            {/* 7. Booking CTA */}
            <Button
              className="w-full h-12 rounded-xl bg-[#205E98] text-white hover:bg-[#184a7a] active:scale-[0.98] font-bold text-[15px] shadow-sm hover:shadow-[0_8px_20px_rgba(32,94,152,0.25)] transition-all duration-300 flex items-center justify-center gap-2 group/btn"
              aria-label={`Book appointment with ${doctor.name}`}
            >
              Book Appointment
              <ChevronRight className="w-4 h-4 text-white/70 group-hover/btn:translate-x-1 transition-transform" />
            </Button>
          </div>
        </div>
      </Card>
    </Link>
  );
}
