"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useBookingStore } from "@/store/useBookingStore";
import { CheckCircle2, Calendar, Clock, MapPin, Download, ChevronRight, Activity } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { BrandName } from "@/components/brand/BrandName";

export default function ConfirmationPage() {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [servingTokenOffset, setServingTokenOffset] = useState(4);
  const [waitMinutesElapsed, setWaitMinutesElapsed] = useState(0);
  
  const token = useBookingStore(state => state.generatedToken);
  const doctor = useBookingStore(state => state.selectedDoctor);
  const resetBooking = useBookingStore(state => state.resetBooking);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;
    if (!token || !doctor) {
      router.replace("/");
    }
  }, [mounted, router, token, doctor]);

  // Simulated queue progression
  useEffect(() => {
    if (!mounted || !token) return;
    
    // Simulate token moving every 15 seconds
    const interval = setInterval(() => {
      setServingTokenOffset(prev => Math.max(0, prev - 1));
      setWaitMinutesElapsed(prev => prev + 5);
    }, 15000);

    return () => clearInterval(interval);
  }, [mounted, token]);

  if (!mounted || !token || !doctor) return <div className="min-h-screen bg-[#f7f9fc]" />;

  const currentServing = Math.max(1, (token.tokenNumber || token) - servingTokenOffset);
  const initialWait = token.estimatedWaitMinutes || 45;
  const currentWait = Math.max(0, initialWait - waitMinutesElapsed);

  return (
    <div className="bg-[#f7f9fc] min-h-screen pt-12 pb-20 relative">

      <div className="absolute top-0 left-0 w-full h-[400px] bg-gradient-to-b from-emerald-500 to-[#14532d] z-0" />
      <div className="absolute top-0 left-0 w-full h-full bg-[url('https://www.transparenttextures.com/patterns/clean-gray-paper.png')] opacity-[0.03] pointer-events-none z-0" />

      <div className="container mx-auto px-4 max-w-2xl relative z-10 fade-in-up">
        
        <div className="text-center mb-8">
          <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center mx-auto mb-4 shadow-xl shadow-emerald-900/20">
            <CheckCircle2 className="w-10 h-10 text-emerald-500" />
          </div>
          <h1 className="text-3xl md:text-4xl font-black text-white tracking-tight">Booking Confirmed!</h1>
          <p className="text-emerald-100 font-medium mt-2">Your live queue token has been generated.</p>
        </div>

        {/* Digital Ticket */}
        <div className="bg-white rounded-3xl shadow-2xl overflow-hidden ticket-cutout border border-white relative">
          
          {/* Ticket Header (Token) */}
          <div className="bg-gradient-to-br from-primary to-primary/80 p-8 text-center text-white relative">
            <div className="absolute top-0 left-0 w-full h-full bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10" />
            <p className="text-sm font-bold text-blue-200 uppercase tracking-widest mb-2 relative z-10">Your Live Token</p>
            <h2 className="text-6xl font-black relative z-10">#{token.tokenNumber || token}</h2>
            
            <div className="mt-6 inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm border border-white/20 px-4 py-2 rounded-full relative z-10">
              <Activity className="w-4 h-4 text-emerald-400" />
              <p className="text-sm font-bold">Currently Serving: <span className="text-emerald-400">#{currentServing}</span></p>
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
                <Download className="w-4 h-4 mr-2" /> Download
              </Button>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="mt-8 flex flex-col sm:flex-row gap-4 items-center justify-center">
          <Link href="/my-bookings" className="w-full sm:w-auto" onClick={resetBooking}>
            <Button className="w-full h-14 px-8 rounded-xl bg-primary hover:bg-primary/90 text-white font-black shadow-xl shadow-blue-900/20 text-lg">
              Track Live Queue <ChevronRight className="w-5 h-5 ml-1" />
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
