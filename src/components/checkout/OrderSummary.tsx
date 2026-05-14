"use client";

import { MapPin, CalendarDays, Lock } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { Card, CardContent } from "@/components/ui/card";
import { BrandName } from "@/components/brand/BrandName";
import { Doctor } from "@/types";

interface OrderSummaryProps {
  doctor: Doctor;
  type: string;
}

export function OrderSummary({ doctor, type }: OrderSummaryProps) {
  const isVideo = type === "video";
  const consultationFee = isVideo ? doctor.videoFee : doctor.fee;

  return (
    <div className="lg:w-[400px] shrink-0 space-y-6">
      <Card className="border-slate-200/60 shadow-xl shadow-slate-200/40 rounded-3xl overflow-hidden bg-white/60 backdrop-blur-xl">
        <div className="bg-primary p-6 text-white">
          <h3 className="font-bold text-lg">Order Summary</h3>
          <p className="text-blue-100 text-sm mt-1">Review your consultation details</p>
        </div>
        
        <CardContent className="p-6">
          <div className="flex gap-4 items-center mb-6">
            <Avatar className="h-16 w-16 border-2 border-white shadow-sm shrink-0">
              <AvatarImage src={doctor.image} alt={doctor.name} className="object-cover" />
              <AvatarFallback>{doctor.name.charAt(0)}</AvatarFallback>
            </Avatar>
            <div>
              <h4 className="font-bold text-slate-900">{doctor.name}</h4>
              <p className="text-sm text-slate-500">{doctor.specialty}</p>
            </div>
          </div>
          
          <Separator className="bg-slate-100 my-6" />
          
          <div className="space-y-4">
            <div className="flex justify-between text-sm">
              <span className="text-slate-500 flex items-center gap-2">
                <CalendarDays className="w-4 h-4" /> Queue Date
              </span>
              <span className="font-bold text-slate-900 text-right">
                Today (Live)
              </span>
            </div>
            
            <div className="flex justify-between text-sm">
              <span className="text-slate-500 flex items-center gap-2">
                <MapPin className="w-4 h-4" /> Consultation Type
              </span>
              <span className="font-bold text-slate-900">
                {isVideo ? "Video Call" : "In-Clinic (Walk-in Base)"}
              </span>
            </div>
          </div>

          <Separator className="bg-slate-100 my-6" />
          
          <div className="space-y-3">
            <div className="flex justify-between text-sm">
              <span className="text-slate-500">Consultation Fee</span>
              <span className="font-medium text-slate-900">{consultationFee}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-slate-500">Service Charge</span>
              <span className="font-medium text-slate-900 line-through opacity-50">₹50</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-slate-500">Discount</span>
              <span className="font-medium text-emerald-600">-₹50</span>
            </div>
            <Separator className="bg-slate-100 my-3" />
            <div className="flex justify-between items-center">
              <span className="font-bold text-slate-900">Total Amount</span>
              <span className="font-black text-2xl text-primary">{consultationFee}</span>
            </div>
          </div>
        </CardContent>
      </Card>
      <div className="flex items-center gap-3 p-4 rounded-2xl bg-emerald-50 border border-emerald-100 text-emerald-700 text-sm">
        <Lock className="w-5 h-5 shrink-0" />
        <p>Your booking is secure. <BrandName /> will instantly reserve your place in the clinic's live queue.</p>
      </div>
    </div>
  );
}
