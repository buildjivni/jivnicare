"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useBookingStore } from "@/features/booking/store/useBookingStore";
import { CheckCircle2, MapPin, ChevronRight, Activity, ShieldCheck, PhoneCall, Info, Navigation, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function ConfirmationPage() {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [eta, setEta] = useState("");
  const [queueStats, setQueueStats] = useState<{ currentToken: number; totalInQueue: number; estimatedWait: number } | null>(null);
  
  const token = useBookingStore(state => state.generatedToken);
  const setGeneratedToken = useBookingStore(state => state.setGeneratedToken);
  const doctor = useBookingStore(state => state.selectedDoctor);
  const resetBooking = useBookingStore(state => state.resetBooking);

  useEffect(() => {
    setMounted(true);
    if (!token) {
      try {
        const savedToken = localStorage.getItem("jc_active_token");
        if (savedToken) {
          const parsed = JSON.parse(savedToken);
          setGeneratedToken(parsed);
        }
      } catch (e) { console.error("Hydration failed", e); }
    }
  }, [setGeneratedToken]);

  useEffect(() => {
    if (!mounted) return;
    if (!token && !localStorage.getItem("jc_active_token")) {
      router.replace("/");
    }
  }, [mounted, router, token]);

  // Poll real queue stats every 15 seconds
  useEffect(() => {
    if (!mounted || !token?.doctorId) return;
    let timeoutId: NodeJS.Timeout;
    const fetchStats = async () => {
      try {
        if (document.visibilityState === "visible") {
          const res = await fetch(`/api/public/doctor/${token.doctorId}/queue-stats`);
          const data = await res.json();
          if (data.success) setQueueStats(data.queue);
        }
      } catch {} finally {
        timeoutId = setTimeout(fetchStats, 15000);
      }
    };
    fetchStats();
    return () => clearTimeout(timeoutId);
  }, [mounted, token]);

  const currentServing = queueStats?.currentToken ?? Math.max(1, (token?.tokenNumber || 1) - 1);
  const currentWait = queueStats?.estimatedWait ?? token?.estimatedWaitMinutes ?? 45;
  const myToken = token?.tokenNumber || 1;
  
  // Calculate progress for the visual timeline
  const tokensAhead = Math.max(0, myToken - currentServing);
  const progressPercent = myToken === 1 ? 100 : Math.min(100, Math.max(5, (currentServing / myToken) * 100));

  useEffect(() => {
    if (mounted) {
      setEta(new Date(Date.now() + currentWait * 60000).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}));
    }
  }, [mounted, currentWait]);

  if (!mounted || !token || !doctor) return (
    <div className="bg-slate-50 min-h-screen pt-12">
      <div className="container mx-auto px-4 max-w-lg relative z-10 animate-pulse">
        <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
          <div className="h-64 bg-slate-100" />
          <div className="p-8 space-y-4">
            <div className="h-6 w-48 bg-slate-200 rounded-full" />
            <div className="h-4 w-full bg-slate-100 rounded-full" />
            <div className="h-4 w-3/4 bg-slate-100 rounded-full" />
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="bg-slate-50 min-h-screen pt-6 md:pt-12 pb-24 relative">
      
      {/* Calm Header */}
      <div className="container mx-auto px-4 max-w-lg relative z-10 fade-in-up">
        
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-emerald-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <CheckCircle2 className="w-8 h-8 text-emerald-500" />
          </div>
          <h1 className="text-2xl md:text-3xl font-black text-slate-900 tracking-tight">Booking Confirmed</h1>
          <p className="text-slate-500 font-medium mt-1.5">Your place in the queue is secured.</p>
        </div>

        {/* Live Tracking Card */}
        <div className="bg-white rounded-[32px] shadow-premium border border-slate-100 relative overflow-hidden mb-6">
          
          <div className="absolute top-5 right-5 flex items-center gap-1.5 bg-emerald-50 text-emerald-700 px-2.5 py-1 rounded-full border border-emerald-100">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-[10px] font-bold uppercase tracking-wide">Live</span>
          </div>

          <div className="p-6 md:p-8 text-center border-b border-slate-50">
            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Your Token</p>
            <h2 className="text-7xl font-black text-slate-900 tracking-tighter leading-none mb-4">#{myToken}</h2>
            
            <div className="inline-flex items-center gap-2 bg-[#205E98]/5 border border-[#205E98]/10 px-4 py-2 rounded-xl">
              <Activity className="w-4 h-4 text-[#205E98]" />
              <p className="text-sm font-bold text-slate-700">Currently Serving: <span className="text-[#205E98] text-base">#{currentServing}</span></p>
            </div>
          </div>

          {/* Visual Timeline Bar */}
          <div className="px-6 md:px-8 py-6 bg-slate-50/50">
            <div className="flex justify-between text-xs font-bold text-slate-500 mb-3">
              <span>Token #1</span>
              <span>Your Turn</span>
            </div>
            
            <div className="h-3 w-full bg-slate-200 rounded-full overflow-hidden relative">
              <div 
                className="absolute top-0 left-0 h-full bg-[#205E98] rounded-full transition-all duration-1000 ease-out"
                style={{ width: `${progressPercent}%` }}
              />
              {/* Pulse effect on the leading edge */}
              <div 
                className="absolute top-0 h-full w-4 bg-white/40 blur-[2px] animate-pulse transition-all duration-1000 ease-out"
                style={{ left: `calc(${progressPercent}% - 8px)` }}
              />
            </div>
            
            <div className="mt-4 flex items-center justify-center gap-2 text-sm text-slate-600 font-medium">
              <span className="font-bold text-slate-900">{tokensAhead}</span> {tokensAhead === 1 ? 'person' : 'people'} ahead of you
            </div>
          </div>

          {/* Arrival Window */}
          <div className="p-6 md:p-8 border-t border-slate-50">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-2xl bg-amber-50 flex items-center justify-center shrink-0 border border-amber-100">
                <Clock className="w-6 h-6 text-amber-500" />
              </div>
              <div>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Estimated Arrival</p>
                <p className="font-black text-xl text-slate-900">In ~{currentWait} mins</p>
                <p className="text-sm text-slate-500 font-medium leading-snug mt-1">
                  Please aim to reach the clinic by <strong className="text-slate-700">{eta}</strong>
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Clinic Info & Directions */}
        <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100 mb-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-start gap-3">
            <MapPin className="w-5 h-5 text-slate-400 shrink-0 mt-0.5" />
            <div>
              <p className="font-bold text-slate-900">{doctor.clinic || "Clinic"}</p>
              <p className="text-sm text-slate-500 line-clamp-2">{doctor.location}</p>
            </div>
          </div>
          <a 
            href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${doctor.clinic} ${doctor.location}`)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full sm:w-auto shrink-0"
          >
            <Button variant="outline" className="w-full rounded-xl font-bold border-slate-200 text-[#205E98] hover:bg-[#205E98]/5">
              <Navigation className="w-4 h-4 mr-2" /> Get Directions
            </Button>
          </a>
        </div>

        {/* Guidance Blocks */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100 flex items-start gap-3">
            <Info className="w-5 h-5 text-slate-400 shrink-0 mt-0.5" />
            <div>
              <h4 className="text-[13px] font-bold text-slate-900 mb-1">Missing your turn?</h4>
              <p className="text-xs text-slate-500 font-medium leading-relaxed">
                If you arrive late, your token will be pushed down slightly so you don't lose your booking entirely.
              </p>
            </div>
          </div>
          
          <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100 flex items-start gap-3">
            <PhoneCall className="w-5 h-5 text-slate-400 shrink-0 mt-0.5" />
            <div>
              <h4 className="text-[13px] font-bold text-slate-900 mb-1">Need to cancel?</h4>
              <p className="text-xs text-slate-500 font-medium leading-relaxed mb-2">
                Release your token so another patient can take the slot.
              </p>
              <Link href="/my-bookings" className="text-[11px] font-bold text-red-600 hover:underline">
                Cancel Booking
              </Link>
            </div>
          </div>
        </div>

        <div className="mt-8 text-center">
          <Link href="/" onClick={resetBooking}>
            <Button variant="ghost" className="h-14 px-8 rounded-xl font-bold text-slate-500 hover:text-slate-900">
              Return to Home
            </Button>
          </Link>
        </div>

      </div>
    </div>
  );
}
