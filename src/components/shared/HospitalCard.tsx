"use client";

import { Building2, BadgeCheck, Zap, MapPin, Star, Phone, Stethoscope } from "lucide-react";
import Link from "next/link";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export interface Hospital {
  id: string;
  name: string;
  type: string;
  district: string;
  location: string;
  rating: number;
  reviews: number;
  departments: string[];
  emergency: boolean;
  verified: boolean;
  image: string;
  phone?: string;
  beds?: number;
}

interface HospitalCardProps {
  hospital: Hospital;
}

export function HospitalCard({ hospital }: HospitalCardProps) {
  return (
    <Link href={`/hospitals/${hospital.id}`} className="block group" aria-label={`View details of ${hospital.name}`}>
      <Card className="overflow-hidden border border-slate-100 shadow-[0_4px_20px_rgb(0,0,0,0.05)] hover:shadow-[0_16px_40px_rgb(32,94,152,0.12)] hover:border-blue-100 hover:-translate-y-1.5 transition-all duration-500 bg-white rounded-3xl flex flex-col">
        
        {/* Header Banner */}
        <div className="relative bg-gradient-to-br from-[#205E98]/10 via-blue-50 to-emerald-50 p-5 pb-4 border-b border-slate-100">
          <div className="flex items-start gap-4">
            {/* Hospital Icon */}
            <div className="w-14 h-14 rounded-2xl bg-white border border-slate-100 shadow-sm flex items-center justify-center shrink-0">
              <Building2 className="w-7 h-7 text-primary" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-1.5 mb-1 flex-wrap">
                {hospital.verified && (
                  <div className="flex items-center gap-1 text-[10px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-100 px-2 py-0.5 rounded-full">
                    <BadgeCheck className="w-3 h-3" /> Verified
                  </div>
                )}
                {hospital.emergency && (
                  <div className="flex items-center gap-1 text-[10px] font-bold text-red-600 bg-red-50 border border-red-100 px-2 py-0.5 rounded-full">
                    <Zap className="w-3 h-3" /> 24/7 Emergency
                  </div>
                )}
              </div>
              <h3 className="font-bold text-slate-900 text-base leading-tight group-hover:text-primary transition-colors line-clamp-2">
                {hospital.name}
              </h3>
              <p className="text-xs text-slate-500 mt-0.5 font-medium">{hospital.type}</p>
            </div>
          </div>

          {/* Rating */}
          <div className="absolute top-4 right-4 flex items-center gap-1 bg-amber-50 border border-amber-100 px-2 py-1 rounded-xl">
            <Star className="w-3 h-3 fill-amber-500 text-amber-500" />
            <span className="font-bold text-xs text-amber-700">{hospital.rating}</span>
            <span className="text-[10px] text-amber-600">({hospital.reviews})</span>
          </div>
        </div>

        {/* Body */}
        <div className="p-4 flex-1 flex flex-col gap-3">
          {/* Location */}
          <div className="flex items-start gap-2 text-xs text-slate-500">
            <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0 mt-0.5" />
            <span className="line-clamp-1">{hospital.location}, {hospital.district} District</span>
          </div>

          {/* Departments */}
          {hospital.departments && hospital.departments.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              <div className="flex items-center gap-1 text-[10px] text-slate-500 mr-1">
                <Stethoscope className="w-3 h-3" />
              </div>
              {hospital.departments.slice(0, 3).map((dept) => (
                <span key={dept} className="text-[10px] font-medium text-primary bg-primary/6 px-2 py-0.5 rounded-full border border-primary/10">
                  {dept}
                </span>
              ))}
              {hospital.departments.length > 3 && (
                <span className="text-[10px] font-medium text-slate-400 px-2 py-0.5 rounded-full border border-slate-100 bg-slate-50">
                  +{hospital.departments.length - 3} more
                </span>
              )}
            </div>
          )}

          {/* Stats */}
          {hospital.beds && (
            <div className="flex items-center gap-4 text-xs text-slate-500 pt-1 border-t border-slate-50">
              <span className="font-medium">{hospital.beds}+ Beds</span>
            </div>
          )}

          {/* Phone (optional) */}
          {hospital.phone && (
            <div className="flex items-center gap-2 text-xs text-slate-500">
              <Phone className="w-3.5 h-3.5 text-slate-400 shrink-0" />
              <span>{hospital.phone}</span>
            </div>
          )}
        </div>

        {/* Footer CTA */}
        <div className="px-4 pb-4">
          <Button
            className="w-full h-10 rounded-2xl bg-slate-50 text-slate-700 hover:bg-primary hover:text-white border border-slate-200/60 hover:border-transparent font-bold text-sm transition-all duration-300"
            aria-label={`View details for ${hospital.name}`}
          >
            View Hospital
          </Button>
        </div>
      </Card>
    </Link>
  );
}
