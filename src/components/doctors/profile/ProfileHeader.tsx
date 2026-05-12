"use client";

import {
  ShieldCheck, Star, Award, MapPin, Phone, Languages,
  GraduationCap, BadgeCheck, Zap, Clock, Users
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import type { Doctor } from "@/types";

interface ProfileHeaderProps {
  doctor: Doctor;
}

const isAvailableToday = (available: string) => available?.toLowerCase().includes("today");

export function ProfileHeader({ doctor }: ProfileHeaderProps) {
  const availableToday = isAvailableToday(doctor.available || "");

  return (
    <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
      {/* Hero Banner */}
      <div className="h-32 md:h-40 bg-gradient-to-br from-[#205E98]/15 via-blue-50 to-emerald-50 relative">
        <div className="absolute inset-0 opacity-30 bg-[radial-gradient(circle_at_70%_50%,#205E98_0%,transparent_60%)]" />
        {/* Trust Badges Top Right */}
        <div className="absolute top-4 right-4 flex gap-2">
          <div className="flex items-center gap-1 bg-white/90 backdrop-blur-md text-emerald-700 text-[10px] font-bold px-2.5 py-1 rounded-full shadow-sm border border-emerald-100">
            <BadgeCheck className="w-3 h-3" />
            Verified Doctor
          </div>
          {availableToday && (
            <div className="flex items-center gap-1 bg-[#205E98]/90 text-white text-[10px] font-bold px-2.5 py-1 rounded-full shadow-sm">
              <Zap className="w-3 h-3" />
              Emergency
            </div>
          )}
        </div>
      </div>

      <div className="px-5 md:px-8 pb-6 relative">
        {/* Avatar - overlapping the banner */}
        <div className="absolute -top-14 left-5 md:left-8">
          <Avatar className="h-24 w-24 md:h-28 md:w-28 border-[5px] border-white shadow-xl bg-white ring-2 ring-slate-100">
            <AvatarImage src={doctor.image} alt={`Profile photo of ${doctor.name}`} className="object-cover" />
            <AvatarFallback className="bg-[#205E98]/10 text-[#205E98] font-bold text-2xl">
              {doctor.name.charAt(0)}
            </AvatarFallback>
          </Avatar>
          <div className={`absolute bottom-2 right-1 w-4 h-4 rounded-full border-2 border-white shadow ${availableToday ? "bg-emerald-500" : "bg-slate-300"}`} />
        </div>

        {/* Space for avatar */}
        <div className="h-12 md:h-14" />

        {/* Name + Specialty + Verified */}
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
          <div>
            <div className="flex flex-wrap items-center gap-2 mb-2">
              <Badge className="bg-[#205E98]/10 text-[#205E98] hover:bg-[#205E98]/15 border-transparent text-xs font-bold rounded-lg px-2.5">
                {doctor.specialty}
              </Badge>
              <Badge variant="outline" className="text-emerald-700 border-emerald-200 text-xs font-bold rounded-lg px-2.5 flex items-center gap-1">
                <ShieldCheck className="w-3 h-3" /> NMC Verified
              </Badge>
            </div>
            <h1 className="text-2xl md:text-3xl font-black tracking-tight text-slate-900">{doctor.name}</h1>
            <p className="text-slate-500 font-medium mt-1 text-sm flex items-center gap-1.5">
              <GraduationCap className="w-4 h-4 text-slate-400 shrink-0" />
              {doctor.education}
            </p>
          </div>

          {/* Rating Box */}
          <div className="bg-amber-50 border border-amber-100 rounded-2xl px-4 py-3 text-center shrink-0 min-w-[100px]">
            <div className="flex items-center justify-center gap-1 mb-0.5">
              <Star className="w-4 h-4 fill-amber-500 text-amber-500" />
              <span className="font-black text-xl text-amber-700">{doctor.rating}</span>
            </div>
            <p className="text-[10px] text-amber-600 font-medium">{doctor.reviews} Reviews</p>
          </div>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-5 pt-5 border-t border-slate-100">
          <div className="text-center bg-slate-50 rounded-2xl py-3">
            <Award className="w-5 h-5 text-[#205E98] mx-auto mb-1" aria-hidden />
            <p className="font-black text-slate-900 text-sm">{doctor.experience}</p>
            <p className="text-[10px] text-slate-400 font-medium mt-0.5">Experience</p>
          </div>
          <div className="text-center bg-slate-50 rounded-2xl py-3">
            <Users className="w-5 h-5 text-[#205E98] mx-auto mb-1" aria-hidden />
            <p className="font-black text-slate-900 text-sm">{doctor.reviews}+</p>
            <p className="text-[10px] text-slate-400 font-medium mt-0.5">Patients</p>
          </div>
          <div className="text-center bg-slate-50 rounded-2xl py-3">
            <Clock className="w-5 h-5 text-emerald-500 mx-auto mb-1" aria-hidden />
            <p className="font-black text-slate-900 text-sm text-xs leading-tight">{doctor.available}</p>
            <p className="text-[10px] text-slate-400 font-medium mt-0.5">Availability</p>
          </div>
          <div className="text-center bg-slate-50 rounded-2xl py-3">
            <ShieldCheck className="w-5 h-5 text-emerald-500 mx-auto mb-1" aria-hidden />
            <p className="font-black text-slate-900 text-sm">{doctor.fee}</p>
            <p className="text-[10px] text-slate-400 font-medium mt-0.5">Consult Fee</p>
          </div>
        </div>

        {/* Specialty / Expertise Tags */}
        {doctor.tags && doctor.tags.length > 0 && (
          <div className="mt-4 flex flex-wrap gap-2">
            {doctor.tags.map((tag) => (
              <span key={tag} className="text-xs font-semibold text-[#205E98] bg-[#205E98]/6 px-3 py-1 rounded-full border border-[#205E98]/10">
                {tag}
              </span>
            ))}
          </div>
        )}

        {/* Location + Languages Row */}
        <div className="mt-4 flex flex-wrap gap-4 text-xs text-slate-500">
          <div className="flex items-center gap-1.5">
            <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            <span>{doctor.clinic}, {doctor.location}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Languages className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            <span>Hindi, English</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Phone className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            <span>Contact via JivniCare</span>
          </div>
        </div>
      </div>
    </div>
  );
}
