"use client";

import { Suspense, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { CheckCircle2, Calendar, Clock, MapPin, Download, Home, Video } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { BrandName } from "@/components/brand/BrandName";
import Image from "next/image";
import { useBookingStore } from "@/store/useBookingStore";
import type { Doctor } from "@/types";

function ConfirmationContent() {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [bookingData, setBookingData] = useState<{ doctor: Doctor | null; type: string; tokenNumber: number; estimatedWaitMinutes: number }>({
    doctor: null,
    type: "clinic",
    tokenNumber: 0,
    estimatedWaitMinutes: 0
  });

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMounted(true);
    const storeState = useBookingStore.getState();
    if (storeState.selectedDoctor && storeState.generatedToken) {
      setBookingData({
        doctor: storeState.selectedDoctor,
        type: storeState.selectedService || "clinic",
        tokenNumber: storeState.generatedToken.tokenNumber || 1,
        estimatedWaitMinutes: storeState.generatedToken.estimatedWaitMinutes || 15
      });
      // Clear the store so it's fresh for next time
      setTimeout(() => storeState.resetBooking(), 500);
    } else {
      router.push("/doctors");
    }
  }, [router]);

  if (!mounted || !bookingData.doctor) {
    return <div className="min-h-screen bg-[#0B2136] flex items-center justify-center text-white">Loading confirmation...</div>;
  }

  const { doctor, type, tokenNumber, estimatedWaitMinutes } = bookingData;

  return (
    <div className="bg-[#0B2136] min-h-screen py-12 md:py-20 flex items-center justify-center relative overflow-hidden">
      {/* Background Ambience */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-[#205E98] rounded-full blur-[120px] opacity-30 translate-x-1/3 -translate-y-1/3" />
      <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-[#258C54] rounded-full blur-[120px] opacity-20 -translate-x-1/3 translate-y-1/3" />
      
      <div className="container mx-auto px-4 max-w-lg relative z-10">
        
        <div className="text-center mb-8">
          <div className="w-24 h-24 bg-emerald-500/20 rounded-full flex items-center justify-center mx-auto mb-6 relative animate-in zoom-in duration-700 spring-bounce">
            <div className="absolute inset-0 bg-emerald-400/20 rounded-full animate-ping opacity-75 duration-1000 delay-300" />
            <div className="w-16 h-16 bg-emerald-500 rounded-full flex items-center justify-center shadow-[0_0_40px_rgba(16,185,129,0.4)]">
              <CheckCircle2 className="w-8 h-8 text-white" />
            </div>
          </div>
          <h1 className="text-3xl md:text-4xl font-black tracking-tight mb-2 text-white animate-in slide-in-from-bottom-4 duration-500 delay-100">Booking Confirmed!</h1>
          <p className="text-blue-100/70 text-lg animate-in slide-in-from-bottom-4 duration-500 delay-200">Your appointment is locked in securely.</p>
        </div>

        {/* Premium Ticket UI */}
        <div className="relative animate-in slide-in-from-bottom-8 duration-700 delay-300">
          <Card className="border-0 shadow-2xl bg-white rounded-3xl relative">
            
            {/* Top Section */}
            <div className="p-8 pb-10 flex flex-col items-center text-center">
              <div className="w-16 h-16 rounded-full overflow-hidden border-4 border-white shadow-lg -mt-16 mb-4 bg-slate-100">
                <Image src={doctor.image} alt={doctor.name} fill className="object-cover" />
              </div>
              <h2 className="font-black text-2xl text-slate-900 mb-1">{doctor.name}</h2>
              <p className="text-[#205E98] font-bold text-sm uppercase tracking-widest">{doctor.specialty}</p>
              
              <div className="mt-5 inline-flex items-center justify-center px-5 py-2 rounded-full bg-emerald-50 border border-emerald-100 text-emerald-700 text-xs font-bold tracking-widest uppercase shadow-sm">
                <span className="w-2 h-2 rounded-full bg-emerald-500 mr-2 animate-pulse" />
                Status: Confirmed
              </div>
            </div>

            {/* Ticket Tear/Divider line */}
            <div className="relative h-0 border-t-2 border-dashed border-slate-200 w-full my-0">
              <div className="absolute -left-3 -top-3 w-6 h-6 rounded-full bg-[#0B2136]" />
              <div className="absolute -right-3 -top-3 w-6 h-6 rounded-full bg-[#0B2136]" />
            </div>
            
            {/* Bottom Details Section */}
            <CardContent className="p-8 pt-10 space-y-8 bg-slate-50/50 rounded-b-3xl">
              <div className="grid grid-cols-2 gap-6 bg-white p-4 rounded-2xl border border-slate-200/60 shadow-sm">
                <div className="text-center border-r border-slate-100">
                  <p className="text-[10px] font-bold text-slate-400 mb-1 uppercase tracking-widest">Token Number</p>
                  <div className="text-[#205E98] font-black text-4xl">
                    {tokenNumber}
                  </div>
                </div>
                <div className="text-center flex flex-col items-center justify-center">
                  <p className="text-[10px] font-bold text-slate-400 mb-1 uppercase tracking-widest">Est. Wait</p>
                  <div className="flex items-center gap-1 text-slate-900 font-bold text-xl">
                    <Clock className="w-5 h-5 text-emerald-500" /> ~{estimatedWaitMinutes}m
                  </div>
                </div>
              </div>

              {type === "clinic" ? (
                <div className="bg-white p-4 rounded-2xl border border-slate-200/60 shadow-sm">
                  <p className="text-[10px] font-bold text-slate-400 mb-2 uppercase tracking-widest">Clinic Location</p>
                  <div className="flex items-start gap-3">
                    <div className="p-2 bg-blue-50 rounded-lg text-[#205E98] mt-0.5">
                      <MapPin className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="font-bold text-slate-900">{doctor.clinic || <><BrandName /> Clinic</>}</p>
                      <p className="text-sm text-slate-500 mt-1 leading-relaxed">{doctor.location || "Patna, Bihar"}</p>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="bg-white p-4 rounded-2xl border border-slate-200/60 shadow-sm">
                  <p className="text-[10px] font-bold text-slate-400 mb-2 uppercase tracking-widest">Video Link</p>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-blue-50 rounded-lg text-[#205E98]">
                        <Video className="w-4 h-4" />
                      </div>
                      <p className="font-bold text-[#205E98] underline cursor-pointer truncate max-w-[200px]">meet.jivnicare.com/abc-defg</p>
                    </div>
                  </div>
                </div>
              )}

              <div className="flex items-center justify-between pt-4 border-t border-slate-200">
                <span className="text-slate-500 font-medium text-sm">Session ID</span>
                <span className="font-mono font-bold text-slate-900 bg-slate-200/50 px-2 py-1 rounded">#JIV-{doctor.id.substring(0, 6).toUpperCase()}</span>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4 animate-in slide-in-from-bottom-4 duration-500 delay-500">
          <Link href="/" className="w-full sm:w-auto">
            <Button className="w-full sm:w-auto h-14 px-8 rounded-full font-bold text-slate-900 bg-white hover:bg-slate-100 gap-2 shadow-lg hover:scale-105 transition-all">
              <Home className="w-4 h-4" /> Go to Dashboard
            </Button>
          </Link>
          <Button variant="outline" className="w-full sm:w-auto h-14 px-8 rounded-full bg-transparent border-blue-200/30 text-blue-100 hover:bg-white/10 hover:text-white font-bold gap-2">
            <Download className="w-4 h-4" /> Save Receipt
          </Button>
        </div>

      </div>
    </div>
  );
}

export default function ConfirmationPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#0B2136] flex items-center justify-center text-white">Loading confirmation...</div>}>
      <ConfirmationContent />
    </Suspense>
  )
}
