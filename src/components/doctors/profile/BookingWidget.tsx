"use client";

import { useState, useEffect } from "react";
import { Stethoscope, Video, Users, Clock, Activity, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import type { Doctor } from "@/types";

interface BookingWidgetProps {
  doctor: Doctor;
  selectedService: "clinic" | "video";
  onServiceChange: (service: "clinic" | "video") => void;
  onBook: () => void;
  isNavigating?: boolean;
}

const SERVICE_BTN = "flex flex-col items-center justify-center p-4 rounded-xl border-2 transition-all";
const ACTIVE_SERVICE = "border-primary bg-primary/5 text-primary";
const INACTIVE_SERVICE = "border-border bg-background text-muted-foreground hover:border-primary/30 hover:bg-muted";

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
    timings: "",
  });

  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let timeoutId: NodeJS.Timeout;

    const fetchQueueStats = async () => {
      try {
        if (document.visibilityState === "visible") {
          const res = await fetch(`/api/public/doctor/${doctor.id}/queue-stats`);
          if (res.ok) {
            const data = await res.json();
            if (data.success) {
              setQueue(data.queue);
            }
          }
        }
      } catch (err) {
        console.error("Failed to fetch queue stats", err);
      } finally {
        setIsLoading(false);
        timeoutId = setTimeout(fetchQueueStats, 30000);
      }
    };

    fetchQueueStats();
    return () => clearTimeout(timeoutId);
  }, [doctor.id]);

  const isAvailableToday = !queue.isClosedToday;

  return (
    <Card className="border-border/50 shadow-lg rounded-2xl bg-background overflow-hidden" id="mobile-booking-widget">
      <CardContent className="p-0">
        {/* Service Selection */}
        <div className="p-5 bg-muted/30 border-b border-border/50">
          <h3 className="font-bold text-lg mb-4">Select Consultation Type</h3>
          <div className="grid grid-cols-2 gap-3">
            <button onClick={() => onServiceChange("clinic")} className={`${SERVICE_BTN} ${selectedService === "clinic" ? ACTIVE_SERVICE : INACTIVE_SERVICE}`}>
              <Stethoscope className="w-6 h-6 mb-2" />
              <span className="font-medium text-sm">In-Clinic</span>
              <span className="text-xs font-bold mt-1">{doctor.fee}</span>
            </button>
            <button onClick={() => onServiceChange("video")} className={`${SERVICE_BTN} ${selectedService === "video" ? ACTIVE_SERVICE : INACTIVE_SERVICE}`}>
              <Video className="w-6 h-6 mb-2" />
              <span className="font-medium text-sm">Video Call</span>
              <span className="text-xs font-bold mt-1">{doctor.videoFee}</span>
            </button>
          </div>
        </div>

        {/* Live Queue Status */}
        <div className="p-5">
          <div className="flex items-center gap-2 mb-4">
            <Activity className="w-4 h-4 text-emerald-500" />
            <h3 className="font-bold text-base">Live Queue Status</h3>
            {isAvailableToday ? (
              <span className="ml-auto text-[10px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full uppercase tracking-wider">
                {queue.timings || "Open Now"}
              </span>
            ) : (
              <span className="ml-auto text-[10px] font-bold text-red-700 bg-red-50 border border-red-200 px-2 py-0.5 rounded-full uppercase tracking-wider">
                Closed
              </span>
            )}
          </div>

          <div className="grid grid-cols-3 gap-3 mb-5">
            <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 text-center">
              <p className="text-[10px] text-slate-500 font-bold uppercase mb-1">Current</p>
              {isLoading ? (
                <div className="h-7 w-12 bg-slate-200 rounded animate-pulse mx-auto" />
              ) : (
                <p className="text-xl font-black text-primary">#{queue.currentToken}</p>
              )}
            </div>
            <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 text-center">
              <p className="text-[10px] text-slate-500 font-bold uppercase mb-1">In Queue</p>
              {isLoading ? (
                <div className="flex items-center justify-center gap-1">
                  <Users className="w-3.5 h-3.5 text-amber-500 opacity-50" />
                  <div className="h-7 w-8 bg-slate-200 rounded animate-pulse" />
                </div>
              ) : (
                <div className="flex items-center justify-center gap-1">
                  <Users className="w-3.5 h-3.5 text-amber-500" />
                  <p className="text-xl font-black text-slate-800">{queue.totalInQueue}</p>
                </div>
              )}
            </div>
            <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 text-center">
              <p className="text-[10px] text-slate-500 font-bold uppercase mb-1">Est. Wait</p>
              {isLoading ? (
                <div className="flex items-center justify-center gap-1">
                  <Clock className="w-3.5 h-3.5 text-emerald-500 opacity-50" />
                  <div className="h-7 w-10 bg-slate-200 rounded animate-pulse" />
                </div>
              ) : (
                <div className="flex items-center justify-center gap-1">
                  <Clock className="w-3.5 h-3.5 text-emerald-500" />
                  <p className="text-xl font-black text-slate-800">{queue.estimatedWait}m</p>
                </div>
              )}
            </div>
          </div>

          {/* Consultation Fee Highlight */}
          <div className="bg-primary/5 border border-primary/10 rounded-xl p-4 mb-5 flex items-center justify-between">
            <div>
              <p className="text-xs text-slate-500 font-semibold">Consultation Fee</p>
              <p className="text-2xl font-black text-primary">
                {selectedService === "video" ? doctor.videoFee : doctor.fee}
              </p>
            </div>
            <div className="text-right">
              <p className="text-xs text-slate-500 font-semibold">~{queue.avgTime} min</p>
              <p className="text-xs text-slate-400">per patient</p>
            </div>
          </div>

          {/* Join Queue CTA — Desktop */}
          <div className="hidden md:block">
            <Button
              onClick={onBook}
              disabled={!isAvailableToday || isNavigating}
              className="w-full h-14 rounded-xl bg-primary hover:bg-primary/90 hover:brightness-105 hover:shadow-xl shadow-md text-base font-bold transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isNavigating ? "Redirecting..." : (!isAvailableToday ? "Closed Today" : "Join Queue — Book Now")}
            </Button>
            <p className="text-xs text-center text-muted-foreground mt-3 flex items-center justify-center gap-1.5">
              <Shield className="w-3 h-3" /> Pay online or at the clinic
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
