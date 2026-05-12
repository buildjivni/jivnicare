"use client";

import { MapPin, Clock, Phone, Building2, CalendarCheck, Stethoscope } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import type { Doctor } from "@/types";
import Image from "next/image";

interface ClinicDetailsProps {
  doctor: Doctor;
}

const TIMINGS = [
  { day: "Mon – Fri", hours: "9:00 AM – 5:00 PM", open: true },
  { day: "Saturday", hours: "9:00 AM – 2:00 PM", open: true },
  { day: "Sunday", hours: "Closed", open: false },
];

export function ClinicDetails({ doctor }: ClinicDetailsProps) {
  return (
    <section aria-labelledby="clinic-section-title">
      <h2 id="clinic-section-title" className="text-xl font-bold mb-4 text-slate-900">Clinic Details</h2>
      <div className="space-y-4">

        {/* Clinic Card */}
        <Card className="border-slate-100 shadow-sm bg-white overflow-hidden rounded-3xl">
          {/* Clinic Image */}
          <div className="h-44 bg-gradient-to-br from-[#205E98]/10 to-slate-100 relative overflow-hidden">
            <Image
              src={doctor.bgImage}
              alt={`${doctor.clinic} clinic exterior`}
              fill
              className="object-cover opacity-70"
              onError={(e) => { e.currentTarget.style.display = "none"; }}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-900/50 to-transparent" />
            <div className="absolute bottom-4 left-4 right-4 z-10">
              <p className="text-white font-bold text-base leading-tight">{doctor.clinic}</p>
              <p className="text-white/80 text-xs mt-0.5 flex items-center gap-1">
                <MapPin className="w-3 h-3" /> {doctor.location}
              </p>
            </div>
          </div>
          <CardContent className="p-5 space-y-4">
            {/* Address */}
            <div className="flex items-start gap-3">
              <div className="p-2 bg-[#205E98]/8 rounded-xl shrink-0">
                <MapPin className="w-4 h-4 text-[#205E98]" aria-hidden />
              </div>
              <div>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-0.5">Address</p>
                <p className="text-sm font-medium text-slate-700">{doctor.clinic}</p>
                <p className="text-xs text-slate-500 mt-0.5">{doctor.location}, Patna, Bihar</p>
              </div>
            </div>

            {/* Phone */}
            <div className="flex items-start gap-3">
              <div className="p-2 bg-emerald-50 rounded-xl shrink-0">
                <Phone className="w-4 h-4 text-emerald-600" aria-hidden />
              </div>
              <div>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-0.5">Contact</p>
                <p className="text-sm font-medium text-slate-700">Book via JivniCare</p>
                <p className="text-xs text-slate-500 mt-0.5">Private number — revealed after booking</p>
              </div>
            </div>

            {/* Timings */}
            <div className="flex items-start gap-3">
              <div className="p-2 bg-amber-50 rounded-xl shrink-0">
                <Clock className="w-4 h-4 text-amber-600" aria-hidden />
              </div>
              <div className="flex-1">
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Clinic Timings</p>
                <div className="space-y-1.5">
                  {TIMINGS.map((t) => (
                    <div key={t.day} className="flex items-center justify-between text-xs">
                      <span className="text-slate-600 font-medium">{t.day}</span>
                      <span className={`font-bold ${t.open ? "text-emerald-600" : "text-red-400"}`}>
                        {t.hours}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Hospital Association Card */}
        <Card className="border-slate-100 shadow-sm bg-white rounded-3xl overflow-hidden">
          <CardContent className="p-5">
            <h3 className="text-sm font-bold text-slate-900 mb-4 flex items-center gap-2">
              <Building2 className="w-4 h-4 text-[#205E98]" aria-hidden />
              Hospital Association
            </h3>
            <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-2xl">
              <div className="w-10 h-10 rounded-xl bg-[#205E98]/10 flex items-center justify-center shrink-0">
                <Stethoscope className="w-5 h-5 text-[#205E98]" aria-hidden />
              </div>
              <div>
                <p className="text-sm font-bold text-slate-900">{doctor.clinic}</p>
                <p className="text-xs text-slate-500">{doctor.location}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Booking Info */}
        <Card className="border-[#205E98]/15 shadow-sm bg-[#205E98]/3 rounded-3xl overflow-hidden">
          <CardContent className="p-5">
            <div className="flex items-start gap-3">
              <div className="p-2 bg-[#205E98]/10 rounded-xl shrink-0">
                <CalendarCheck className="w-4 h-4 text-[#205E98]" aria-hidden />
              </div>
              <div>
                <p className="text-sm font-bold text-slate-900">How Booking Works</p>
                <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                  Book your appointment online via JivniCare. You'll receive a confirmation instantly. The clinic team will contact you to confirm the slot.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </section>
  );
}
