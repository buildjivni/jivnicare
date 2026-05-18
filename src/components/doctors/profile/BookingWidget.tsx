"use client";

import { useState, useEffect } from "react";
import { Stethoscope, Video, Users, Clock, Activity, Shield, CheckCircle2, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import type { Doctor } from "@/types";
import { trackEvent } from "@/lib/analytics";

interface BookingWidgetProps {
  doctor: Doctor;
  selectedService: "clinic" | "video";
  onServiceChange: (service: "clinic" | "video") => void;
  onBook: () => void;
  isNavigating?: boolean;
}

export function BookingWidget({
  doctor,
  selectedService,
  onServiceChange,
  onBook,
  isNavigating = false,
}: BookingWidgetProps) {
  const [queue, setQueue] = useState({
    currentToken: 0,
    totalInQueue: 0,
    estimatedWait: 0,
    avgTime: 15,
    status: "NOT_STARTED",
    isClosedToday: false,
    pauseOnlineBooking: false,
    emergencySlots: 0,
    timings: "",
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let timeoutId: NodeJS.Timeout;
    const fetch_ = async () => {
      try {
        if (document.visibilityState === "visible") {
          const res = await fetch(`/api/public/doctor/${doctor.id}/queue-stats`);
          if (res.ok) {
            const data = await res.json();
            if (data.success) setQueue(data.queue);
          }
        }
      } catch { /* silent */ }
      finally {
        setIsLoading(false);
        timeoutId = setTimeout(fetch_, 30000); // refresh every 30s
      }
    };
    fetch_();
    return () => clearTimeout(timeoutId);
  }, [doctor.id]);

  const isClosedToday = queue.isClosedToday;
  const isPaused = queue.pauseOnlineBooking;
  const hasEmergencySlots = queue.emergencySlots > 0;
  const isAvailableToday = !isClosedToday;
  const canBook = isAvailableToday && !isPaused;
  const fee = selectedService === "video" ? doctor.videoFee : doctor.fee;
  const queueActive = queue.status === "ACTIVE" || queue.status === "NOT_STARTED";

  return (
    <Card className="border-slate-100 shadow-[0_4px_24px_rgba(0,0,0,0.08)] rounded-[22px] bg-white overflow-hidden">
      <CardContent className="p-0">

        {/* ── 1. Service Type Toggle ── */}
        <div className="p-4 border-b border-slate-50">
          <p className="text-[10.5px] font-bold text-slate-400 uppercase tracking-widest mb-3">
            Consultation Type
          </p>
          <div className="grid grid-cols-2 gap-2">
            {/* In-Clinic */}
            <button
              onClick={() => onServiceChange("clinic")}
              className={[
                "flex flex-col items-center gap-1.5 p-3 rounded-[14px] border-2 transition-all duration-200",
                selectedService === "clinic"
                  ? "border-[#205E98] bg-[#205E98]/6 text-[#205E98]"
                  : "border-slate-100 bg-slate-50/50 text-slate-500 hover:border-slate-200 hover:bg-slate-50",
              ].join(" ")}
              aria-pressed={selectedService === "clinic"}
            >
              <Stethoscope className="w-4.5 h-4.5" />
              <span className="text-[11.5px] font-bold">In-Clinic</span>
              <span className="text-[12.5px] font-black tabular-nums">{doctor.fee}</span>
            </button>

            {/* Video */}
            <button
              onClick={() => onServiceChange("video")}
              className={[
                "flex flex-col items-center gap-1.5 p-3 rounded-[14px] border-2 transition-all duration-200",
                selectedService === "video"
                  ? "border-[#205E98] bg-[#205E98]/6 text-[#205E98]"
                  : "border-slate-100 bg-slate-50/50 text-slate-500 hover:border-slate-200 hover:bg-slate-50",
              ].join(" ")}
              aria-pressed={selectedService === "video"}
            >
              <Video className="w-4.5 h-4.5" />
              <span className="text-[11.5px] font-bold">Video Call</span>
              <span className="text-[12.5px] font-black tabular-nums">{doctor.videoFee}</span>
            </button>
          </div>
        </div>

        {/* ── 2. Operational Status Banner ── */}
        {(isClosedToday || isPaused) && (
          <div className={`mx-4 mt-3 rounded-[14px] px-4 py-3 flex items-start gap-3 border ${
            isClosedToday
              ? "bg-red-50 border-red-100"
              : "bg-amber-50 border-amber-100"
          }`}>
            <span className="text-lg leading-none mt-0.5">{isClosedToday ? "🔴" : "⏸️"}</span>
            <div>
              <p className={`text-[12px] font-black ${isClosedToday ? "text-red-800" : "text-amber-800"}`}>
                {isClosedToday ? "Clinic Closed Today" : "Online Booking Paused"}
              </p>
              <p className={`text-[11px] font-medium mt-0.5 ${isClosedToday ? "text-red-700/80" : "text-amber-700/80"}`}>
                {isClosedToday
                  ? "This clinic is not accepting patients today."
                  : "Walk-in visits may still be available. Please call the clinic directly."}
              </p>
              {!isClosedToday && hasEmergencySlots && (
                <p className="text-[11px] font-bold text-emerald-700 mt-1.5 flex items-center gap-1">
                  🚨 Emergency slots available — walk-in accepted
                </p>
              )}
            </div>
          </div>
        )}

        {/* ── 3. Live Queue Status ── */}
        <div className="p-4 space-y-3">

          {/* Queue header */}
          <div className="flex items-center gap-2">
            <Activity className={`w-3.5 h-3.5 shrink-0 ${canBook && queueActive ? "text-emerald-500" : "text-slate-400"}`} />
            <span className="text-[12px] font-bold text-slate-700">Live Queue Status</span>
            <div className={`ml-auto text-[9.5px] font-bold px-2 py-0.5 rounded-full border ${
              isClosedToday
                ? "text-red-600 bg-red-50 border-red-100"
                : isPaused
                ? "text-amber-700 bg-amber-50 border-amber-200"
                : "text-emerald-700 bg-emerald-50 border-emerald-200"
            }`}>
              {isClosedToday ? "Closed" : isPaused ? "Paused" : (queue.timings || "Open Today")}
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
                value: isLoading ? null : `${queue.estimatedWait}m`,
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

          {/* ── Fee highlight ── */}
          <div className="flex items-center justify-between bg-slate-50 border border-slate-100 rounded-[14px] px-4 py-3">
            <div>
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wide">
                {selectedService === "video" ? "Video Consult" : "In-Clinic Fee"}
              </p>
              <p className="font-black text-[22px] text-[#205E98] leading-none tabular-nums mt-0.5">{fee}</p>
            </div>
            <div className="text-right">
              <p className="text-[10px] text-slate-400 font-bold">Per Visit</p>
              <p className="text-[11px] text-slate-500">~{queue.avgTime} min</p>
            </div>
          </div>

          {/* ── Book CTA — Desktop ── */}
          <div className="hidden md:block">
            <Button
              onClick={() => {
                trackEvent("booking_initiated", { doctorId: doctor.id, service: selectedService, fee });
                onBook();
              }}
              disabled={!canBook || isNavigating}
              className={[
                "w-full h-12 rounded-[14px] text-[14px] font-bold",
                canBook
                  ? "bg-[#205E98] hover:bg-[#1a4f82] text-white shadow-[0_4px_16px_rgba(32,94,152,0.28)] hover:shadow-[0_6px_20px_rgba(32,94,152,0.36)]"
                  : isPaused && !isClosedToday
                  ? "bg-amber-500 hover:bg-amber-600 text-white"
                  : "bg-slate-200 text-slate-500",
                "active:scale-[0.98] transition-all duration-200",
                "disabled:opacity-60 disabled:cursor-not-allowed disabled:shadow-none flex items-center justify-center gap-2",
              ].join(" ")}
            >
              {isNavigating
                ? "Redirecting..."
                : isClosedToday
                ? "🔴 Closed Today"
                : isPaused
                ? "⏸ Booking Paused — Walk-in Only"
                : (
                  <>
                    <Shield className="w-4 h-4 text-white/90" />
                    Confirm Clinic Visit
                  </>
                )}
            </Button>
          </div>

          {/* ── Trust signals below CTA ── */}
          <div className="grid grid-cols-2 gap-1.5 pt-0.5">
            {[
              { icon: <Shield className="w-3 h-3 text-emerald-500 shrink-0" />, text: "Secure payment" },
              { icon: <CheckCircle2 className="w-3 h-3 text-emerald-500 shrink-0" />, text: "Pay at clinic" },
            ].map(({ icon, text }) => (
              <div key={text} className="flex items-center gap-1.5">
                {icon}
                <span className="text-[10.5px] text-slate-500 font-medium">{text}</span>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
