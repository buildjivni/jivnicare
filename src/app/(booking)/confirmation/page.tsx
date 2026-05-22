"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useBookingStore } from "@/features/booking/store/useBookingStore";
import { CheckCircle2, Calendar, MapPin, Download, ChevronRight, Activity, ShieldCheck, PhoneCall, Info } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function ConfirmationPage() {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [queueStats, setQueueStats] = useState<{ currentToken: number; totalInQueue: number; estimatedWait: number } | null>(null);
  
  const token = useBookingStore(state => state.generatedToken);
  const setGeneratedToken = useBookingStore(state => state.setGeneratedToken);
  const doctor = useBookingStore(state => state.selectedDoctor);
  const resetBooking = useBookingStore(state => state.resetBooking);

  useEffect(() => {
     
    setMounted(true);
    
    // Hydrate from localStorage if store is empty (e.g. after hard refresh)
    if (!token) {
      try {
        const savedToken = localStorage.getItem("jc_active_token");
        if (savedToken) {
          const parsed = JSON.parse(savedToken);
          setGeneratedToken(parsed);
          // If we have a token, we should have a doctor context too (usually in history or just from API later)
        }
      } catch (e) { console.error("Hydration failed", e); }
    }
  }, [setGeneratedToken]);

  useEffect(() => {
    if (!mounted) return;
    // Only redirect if hydration also failed
    if (!token && !localStorage.getItem("jc_active_token")) {
      router.replace("/");
    }
  }, [mounted, router, token]);

  // Poll real queue stats every 30 seconds
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
      } catch { /* ignore polling errors */ }
      finally {
        timeoutId = setTimeout(fetchStats, 30000);
      }
    };

    fetchStats();
    return () => clearTimeout(timeoutId);
  }, [mounted, token]);

  if (!mounted || !token || !doctor) return (
    <div className="bg-[#f7f9fc] min-h-screen">
      <div className="absolute top-0 left-0 w-full h-[400px] bg-gradient-to-b from-emerald-500 to-[#14532d]" />
      <div className="container mx-auto px-4 max-w-2xl relative z-10 pt-12 animate-pulse">
        <div className="text-center mb-8">
          <div className="w-20 h-20 bg-white/20 rounded-full mx-auto mb-4" />
          <div className="h-8 w-48 bg-white/20 rounded-full mx-auto" />
          <div className="h-4 w-40 bg-white/10 rounded-full mx-auto mt-2" />
        </div>
        <div className="bg-white rounded-3xl shadow-2xl overflow-hidden">
          <div className="bg-primary/30 h-48" />
          <div className="p-8 space-y-4">
            <div className="h-6 w-48 bg-slate-200 rounded-full" />
            <div className="h-4 w-full bg-slate-100 rounded-full" />
            <div className="h-4 w-2/3 bg-slate-100 rounded-full" />
            <div className="h-4 w-3/4 bg-slate-100 rounded-full" />
          </div>
        </div>
      </div>
    </div>
  );

  const currentServing = queueStats?.currentToken ?? Math.max(1, (token.tokenNumber || 1) - 1);
  const currentWait = queueStats?.estimatedWait ?? token.estimatedWaitMinutes ?? 45;

  return (
    <div className="bg-[#f7f9fc] min-h-screen pt-6 md:pt-12 pb-20 relative">

      <div className="absolute top-0 left-0 w-full h-[400px] bg-gradient-to-b from-emerald-500 to-[#14532d] z-0" />
      <div className="absolute top-0 left-0 w-full h-full bg-[url('https://www.transparenttextures.com/patterns/clean-gray-paper.png')] opacity-[0.03] pointer-events-none z-0" />

      <div className="container mx-auto px-4 max-w-2xl relative z-10 fade-in-up">
        
        <div className="text-center mb-8">
          <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center mx-auto mb-4 shadow-xl shadow-emerald-900/20">
            <CheckCircle2 className="w-10 h-10 text-emerald-500" />
          </div>
          <h1 className="text-3xl md:text-4xl font-black text-white tracking-tight">Booking Confirmed!</h1>
          <p className="text-emerald-100 font-medium mt-2">Your appointment token is confirmed.</p>
        </div>

        {/* Digital Ticket */}
        <div className="bg-white rounded-3xl shadow-2xl overflow-hidden ticket-cutout border border-white relative">
          
          {/* Ticket Header (Token) */}
          <div className="bg-gradient-to-br from-primary to-primary/80 p-8 text-center text-white relative">
            <div className="absolute top-0 left-0 w-full h-full bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10" />
            <p className="text-sm font-bold text-blue-200 uppercase tracking-widest mb-2 relative z-10">Your Live Token</p>
            <h2 className="text-6xl font-black relative z-10">#{token.tokenNumber}</h2>
            
            <div className="mt-6 inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm border border-white/20 px-4 py-2 rounded-full relative z-10">
              <Activity className="w-4 h-4 text-emerald-400" />
              <p className="text-sm font-bold">Doctor is currently seeing: <span className="text-emerald-400">#{currentServing}</span></p>
            </div>
          </div>

          {/* Dotted Line Divider */}
          <div className="h-0 border-t-2 border-dashed border-slate-200 w-[90%] mx-auto relative z-10" />

          {/* Ticket Body (Details) */}
          <div className="p-8">
            <h3 className="text-2xl font-black text-slate-900 mb-6">{doctor.name}</h3>
            
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <Calendar className="w-5 h-5 text-slate-400 shrink-0 mt-0.5" />
                <div>
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-0.5">Date & Time</p>
                  <p className="font-bold text-slate-900">Today, {new Date().toLocaleDateString("en-IN", { day: 'numeric', month: 'long', year: 'numeric' })}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                    <p className="text-sm text-slate-500">Est. Wait: <span className="font-bold text-slate-700">~{currentWait} mins</span></p>
                  </div>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <MapPin className="w-5 h-5 text-slate-400 shrink-0 mt-0.5" />
                <div>
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-0.5">Clinic Location</p>
                  <p className="font-bold text-slate-900">{doctor.clinic}</p>
                  <p className="text-sm text-slate-500 leading-snug">{doctor.location}</p>
                </div>
              </div>
            </div>

            <div className="mt-8 pt-6 border-t border-slate-100 flex items-center justify-between">
              <div>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Status</p>
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 bg-emerald-500 rounded-full animate-pulse" />
                  <span className="text-sm font-black text-emerald-600 uppercase">Confirmed</span>
                </div>
              </div>
              <Button variant="outline" className="rounded-xl font-bold border-slate-200 text-primary hover:bg-primary/10">
                <Download className="w-4 h-4 mr-2" /> Save Ticket
              </Button>
            </div>
          </div>
        </div>

        {/* ── Patient Confidence & Trust Layer ── */}
        <div className="mt-6 space-y-4">
          <div className="bg-white rounded-2xl p-5 shadow-lg border border-slate-100 flex items-start gap-4">
            <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center shrink-0 mt-0.5">
              <ShieldCheck className="w-5 h-5 text-[#205E98]" />
            </div>
            <div>
              <h4 className="text-[15px] font-black text-slate-900 mb-1">What Happens Next?</h4>
              <p className="text-[13px] text-slate-600 font-medium leading-relaxed">
                Your slot is locked. Please reach the clinic 10 minutes before your estimated time. If you miss your exact turn, your token will be pushed down slightly, so you don't lose your booking.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="bg-white rounded-2xl p-5 shadow-lg border border-slate-100 flex items-start gap-3">
              <Info className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
              <div>
                <h4 className="text-[13px] font-black text-slate-900 mb-1">Cancellation Policy</h4>
                <p className="text-[12px] text-slate-600 font-medium leading-relaxed">
                  You can cancel anytime before the consultation begins directly from the "Track Your Wait Time" page.
                </p>
              </div>
            </div>
            
            <div className="bg-white rounded-2xl p-5 shadow-lg border border-slate-100 flex items-start gap-3">
              <PhoneCall className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
              <div>
                <h4 className="text-[13px] font-black text-slate-900 mb-1">Need Assistance?</h4>
                <p className="text-[12px] text-slate-600 font-medium leading-relaxed mb-2">
                  Our dedicated operational support team is available to help you.
                </p>
                <a href="tel:+918000000000" className="text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-md inline-block">
                  Call Support Team
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="mt-8 flex flex-col sm:flex-row gap-4 items-center justify-center">
          <Link href="/my-bookings" className="w-full sm:w-auto" onClick={resetBooking}>
            <Button className="w-full h-14 px-8 rounded-xl bg-primary hover:bg-primary/90 text-white font-black shadow-xl shadow-blue-900/20 text-lg">
              Track Your Wait Time <ChevronRight className="w-5 h-5 ml-1" />
            </Button>
          </Link>
          <Link href="/" className="w-full sm:w-auto" onClick={resetBooking}>
            <Button variant="ghost" className="w-full h-14 px-8 rounded-xl font-bold text-slate-500 hover:text-slate-900 hover:bg-white/50">
              Return Home
            </Button>
          </Link>
        </div>

      </div>
    </div>
  );
}
