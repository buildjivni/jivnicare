"use client";

import { useState, useEffect } from "react";
import { Stethoscope, Users, Clock, Activity, Shield, CheckCircle2, Zap, CalendarCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import type { Doctor } from "@/types";
import { trackEvent } from "@/lib/infrastructure/analytics";

interface BookingWidgetProps {
  doctor: Doctor;
  onBook: () => void;
  isNavigating?: boolean;
}

export function BookingWidget({
  doctor,
  onBook,
  isNavigating = false,
}: BookingWidgetProps) {
  const [queue, setQueue] = useState({
    currentToken: 0,
    totalInQueue: 0,
    estimatedWait: 0,
    avgTime: 0,
    status: "NOT_STARTED",
    isClosedToday: false,
    emergencySlots: 0,
    timings: "",
  });
  const [isLoading, setIsLoading] = useState(true);
  // Track if real queue data was ever received
  const [hasQueueData, setHasQueueData] = useState(false);

  useEffect(() => {
    let timeoutId: NodeJS.Timeout;
    const fetch_ = async () => {
      try {
        if (document.visibilityState === "visible") {
          const res = await fetch(`/api/public/doctor/${doctor.id}/queue-stats`);
          if (res.ok) {
            const data = await res.json();
            if (data.success && data.queue) {
              setQueue({
                currentToken: data.queue.currentToken ?? 0,
                totalInQueue: data.queue.totalInQueue ?? 0,
                estimatedWait: data.queue.estimatedWait ?? 0,
                avgTime: data.queue.avgTime ?? 0,
                status: data.queue.status ?? "NOT_STARTED",
                isClosedToday: data.queue.isClosedToday ?? false,
                emergencySlots: data.queue.emergencySlots ?? 0,
                timings: data.queue.timings ?? "",
              });
              setHasQueueData(true);
            }
          }
        }
      } catch { /* silent */ }
      finally {
        setIsLoading(false);
        timeoutId = setTimeout(fetch_, 30000);
      }
    };
    fetch_();
    return () => clearTimeout(timeoutId);
  }, [doctor.id]);

  const isClosedToday = queue?.isClosedToday ?? false;
  const hasEmergencySlots = (queue?.emergencySlots ?? 0) > 0;
  const canBook = !isClosedToday;
  const queueActive = queue?.status === "ACTIVE";

  return (
    <Card className="border-slate-100 shadow-[0_4px_24px_rgba(0,0,0,0.08)] rounded-[22px] bg-white overflow-hidden">
      <CardContent className="p-0">

        {/* ── 1. Consultation Type Header ── */}
        <div className="px-4 pt-4 pb-3 border-b border-slate-50 flex items-center gap-2">
          <div className="p-2 rounded-xl bg-[#205E98]/8 shrink-0">
            <Stethoscope className="w-4 h-4 text-[#205E98]" />
          </div>
          <div>
            <p className="text-[12px] font-black text-slate-900 leading-tight">In-Clinic Consultation</p>
            <p className="text-[10.5px] text-slate-500 font-medium mt-0.5">Pay at clinic · No advance required</p>
          </div>
          <div className="ml-auto">
            <p className="font-black text-[20px] text-[#205E98] leading-none tabular-nums">{doctor.fee}</p>
            <p className="text-[9px] text-slate-600 font-bold uppercase tracking-wide text-right mt-0.5">Per Visit</p>
          </div>
        </div>

        {/* ── 2. Operational Status Banner ── */}
        {isClosedToday && (
          <div className="mx-4 mt-3 rounded-[14px] px-4 py-3 flex items-start gap-3 border bg-red-50 border-red-100">
            <span className="text-lg leading-none mt-0.5">🔴</span>
            <div>
              <p className="text-[12px] font-black text-red-800">Clinic Closed Today</p>
              <p className="text-[11px] font-medium mt-0.5 text-red-700/80">
                This clinic is not accepting patients today.
              </p>
              {hasEmergencySlots && (
                <p className="text-[11px] font-bold text-emerald-700 mt-1.5">
                  🚨 Emergency slots available — walk-in accepted
                </p>
              )}
            </div>
          </div>
        )}

        {/* ── 3. Live Queue Status (only when real data available) ── */}
        <div className="p-4 space-y-3">

          {hasQueueData && (
            <>
              {/* Queue header */}
              <div className="flex items-center gap-2">
                <Activity className={`w-3.5 h-3.5 shrink-0 ${queueActive ? "text-emerald-500" : "text-slate-600"}`} />
                <span className="text-[12px] font-bold text-slate-700">Live Queue</span>
                <div className={`ml-auto text-[9.5px] font-bold px-2 py-0.5 rounded-full border ${
                  isClosedToday
                    ? "text-red-600 bg-red-50 border-red-100"
                    : "text-emerald-700 bg-emerald-50 border-emerald-200"
                }`}>
                  {isClosedToday ? "Closed" : (queue.timings || "Open Today")}
                </div>
              </div>

              {/* Queue metrics — 3-col */}
              <div className="grid grid-cols-3 gap-2">
                {[
                  {
                    label: "Token",
                    value: isLoading ? null : `#${queue.currentToken}`,
                    icon: <Zap className="w-3 h-3 text-[#205E98]" />,
                    bg: "bg-[#205E98]/6 border-[#205E98]/15",
                  },
                  {
                    label: "In Queue",
                    value: isLoading ? null : String(queue.totalInQueue),
                    icon: <Users className="w-3 h-3 text-amber-500" />,
                    bg: "bg-amber-50/70 border-amber-100",
                  },
                  {
                    label: "Est. Wait",
                    // Only show if a real non-zero wait exists
                    value: isLoading ? null : (queue.estimatedWait > 0 ? `${queue.estimatedWait}m` : "–"),
                    icon: <Clock className="w-3 h-3 text-emerald-500" />,
                    bg: "bg-emerald-50/70 border-emerald-100",
                  },
                ].map(({ label, value, icon, bg }) => (
                  <div key={label} className={`flex flex-col items-center p-2.5 rounded-[12px] border ${bg} text-center`}>
                    <div className="mb-1">{icon}</div>
                    {value === null ? (
                      <div className="h-5 w-8 bg-slate-200 rounded animate-pulse mx-auto" />
                    ) : (
                      <span className="font-black text-[15px] text-slate-900 leading-none tabular-nums">
                        {value}
                      </span>
                    )}
                    <span className="text-[9px] text-slate-500 font-bold uppercase tracking-wide mt-1">
                      {label}
                    </span>
                  </div>
                ))}
              </div>
            </>
          )}

          {/* ── Book CTA — Desktop ── */}
          <div className="hidden md:block">
            <Button
              onClick={() => {
                trackEvent("booking_initiated", { doctorId: doctor.id, service: "clinic", fee: doctor.fee });
                onBook();
              }}
              disabled={!canBook || isNavigating}
              className={[
                "w-full h-[52px] rounded-[16px] text-[15px] font-black tracking-wide",
                canBook
                  ? "bg-gradient-to-b from-[#2366a8] to-[#1a4e87] hover:from-[#1a5898] hover:to-[#153e6e] text-white shadow-[0_6px_24px_rgba(32,94,152,0.35)] hover:shadow-[0_8px_28px_rgba(32,94,152,0.45)]"
                  : "bg-slate-200 text-slate-500",
                "active:scale-[0.97] transition-all duration-200",
                "disabled:opacity-60 disabled:cursor-not-allowed disabled:shadow-none flex items-center justify-center gap-2.5",
              ].join(" ")}
            >
              {isNavigating ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                  Booking...
                </>
              ) : isClosedToday ? (
                "🔴 Clinic Closed Today"
              ) : (
                <>
                  <CalendarCheck className="w-4 h-4 text-white/90" />
                  Book Appointment Now
                </>
              )}
            </Button>
          </div>

          {/* ── Trust indicators (real-data-only, hidden when unavailable) ── */}
          <div className="space-y-2 pt-0.5">
            {/* Always-visible verified badges */}
            <div className="grid grid-cols-2 gap-1.5">
              <div className="flex items-center gap-1.5 p-2 rounded-xl bg-blue-50/60 border border-blue-100/60">
                <Shield className="w-3 h-3 text-[#205E98] shrink-0" />
                <span className="text-[10px] text-[#205E98] font-bold leading-tight">JivniCare Verified</span>
              </div>
              <div className="flex items-center gap-1.5 p-2 rounded-xl bg-emerald-50/60 border border-emerald-100/60">
                <CheckCircle2 className="w-3 h-3 text-emerald-600 shrink-0" />
                <span className="text-[10px] text-emerald-700 font-bold leading-tight">Reg. Verified</span>
              </div>
            </div>

            {/* Contextual row — show only when real data exists */}
            {(doctor.languages && doctor.languages.length > 0) || (!isLoading && hasQueueData && queue.avgTime > 0) ? (
              <div className="grid grid-cols-2 gap-1.5">
                {doctor.languages && doctor.languages.length > 0 && (
                  <div className="flex items-center gap-1.5 p-2 rounded-xl bg-slate-50 border border-slate-100">
                    <span className="text-[10px] shrink-0">🗣️</span>
                    <span className="text-[10px] text-slate-600 font-bold leading-tight truncate">
                      {doctor.languages.slice(0, 2).join(", ")}
                    </span>
                  </div>
                )}
                {!isLoading && hasQueueData && queue.avgTime > 0 && (
                  <div className="flex items-center gap-1.5 p-2 rounded-xl bg-slate-50 border border-slate-100">
                    <Clock className="w-3 h-3 text-slate-600 shrink-0" />
                    <span className="text-[10px] text-slate-600 font-bold leading-tight">~{queue.avgTime}m avg</span>
                  </div>
                )}
              </div>
            ) : null}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
