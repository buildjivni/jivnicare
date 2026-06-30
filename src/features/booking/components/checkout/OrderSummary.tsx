"use client";

import { useState } from "react";
import { MapPin, CalendarDays, Lock, ChevronDown, ChevronUp, AlertCircle } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { Card, CardContent } from "@/components/ui/card";
import { Doctor } from "@/types";

interface OrderSummaryProps {
  doctor: Doctor;
  type: string;
}

export function OrderSummary({ doctor, type }: OrderSummaryProps) {
  const consultationFee = doctor.fee;
  const [isExpandedMobile, setIsExpandedMobile] = useState(false);

  return (
    <div className="w-full lg:w-[400px] shrink-0 lg:sticky lg:top-28 space-y-6">
      <Card className="border-slate-100 shadow-premium rounded-3xl overflow-hidden bg-white">
        {/* Header - Clickable on mobile to toggle */}
        <div 
          className="bg-slate-900 p-5 md:p-6 text-white cursor-pointer lg:cursor-default flex items-center justify-between"
          onClick={() => setIsExpandedMobile(!isExpandedMobile)}
        >
          <div>
            <h3 className="font-black text-lg md:text-xl">Order Summary</h3>
            <p className="text-slate-400 text-xs md:text-sm mt-0.5 font-medium">Review your consultation details</p>
          </div>
          <div className="lg:hidden text-slate-400 bg-white/10 p-2 rounded-full">
            {isExpandedMobile ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
          </div>
        </div>
        
        <div className={`transition-all duration-300 ease-in-out ${isExpandedMobile ? "max-h-[800px] opacity-100" : "max-h-0 opacity-0 lg:max-h-none lg:opacity-100"}`}>
          <CardContent className="p-5 md:p-6">
            <div className="flex gap-4 items-center mb-6">
              <Avatar className="h-16 w-16 border-2 border-white shadow-md shrink-0">
                <AvatarImage src={doctor.image} alt={doctor.name} className="object-cover" />
                <AvatarFallback>{doctor.name.charAt(0)}</AvatarFallback>
              </Avatar>
              <div>
                <h4 className="font-black text-slate-900 text-lg leading-tight">{doctor.name}</h4>
                <p className="text-sm font-bold text-[#5696C7] mt-0.5">{doctor.specialty}</p>
              </div>
            </div>
            
            <Separator className="bg-slate-100 my-5" />
            
            <div className="space-y-4">
              <div className="flex justify-between text-sm">
                <span className="text-slate-500 font-medium flex items-center gap-2">
                  <CalendarDays className="w-4 h-4 text-slate-400" /> Queue Date
                </span>
                <span className="font-bold text-slate-900 text-right bg-emerald-50 text-emerald-700 px-2.5 py-0.5 rounded-lg border border-emerald-100">
                  Today (Live)
                </span>
              </div>
              
              <div className="flex justify-between text-sm">
                <span className="text-slate-500 font-medium flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-slate-400" /> Consult Type
                </span>
                <span className="font-bold text-slate-900">
                  In-Clinic Visit
                </span>
              </div>
            </div>
 
            <Separator className="bg-slate-100 my-5" />
            
            <div className="space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-slate-500 font-medium">Consultation Fee</span>
                <span className="font-bold text-slate-900">{consultationFee}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-slate-500 font-medium">Service Charge</span>
                <span className="font-bold text-slate-900 line-through opacity-40">₹29</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-slate-500 font-medium">Platform Discount</span>
                <span className="font-bold text-emerald-600 bg-emerald-50 px-2 rounded-md">FREE 🎉</span>
              </div>
              <Separator className="bg-slate-100 my-4" />
              <div className="flex justify-between items-center">
                <span className="font-black text-slate-900 text-base">Total Amount</span>
                <span className="font-black text-2xl text-[#5696C7] tabular-nums">{consultationFee}</span>
              </div>
            </div>
          </CardContent>
        </div>
      </Card>
      
      <div className="flex items-start gap-3 p-4 rounded-2xl bg-[#5696C7]/5 border border-[#5696C7]/10 text-sm">
        <Lock className="w-5 h-5 text-[#5696C7] shrink-0 mt-0.5" />
        <p className="text-slate-600 font-medium leading-relaxed">
          Your booking is <strong className="font-bold text-slate-900">100% secure</strong>. JivniCare guarantees your exact place in the live clinic queue.
        </p>
      </div>

      <div className="flex items-start gap-3 p-4 rounded-2xl bg-amber-50 border border-amber-200 text-sm">
        <AlertCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
        <p className="text-amber-800 font-bold leading-relaxed">
          Pay at Clinic / Hospital. No online payment required. Pay directly when you visit.
        </p>
      </div>
    </div>
  );
}
