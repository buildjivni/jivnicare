"use client";

import Link from "next/link";
import { ArrowLeft, ShieldCheck, Activity } from "lucide-react";
import { OrderSummary, PaymentForm } from "@/components/checkout";
import { useBookingStore } from "@/store/useBookingStore";
import { useAuthStore } from "@/store/useAuthStore";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function CheckoutPage() {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);

  const doctor = useBookingStore(state => state.selectedDoctor);
  const type = useBookingStore(state => state.selectedService) || "clinic";
  const isAuthenticated = useAuthStore(state => state.isAuthenticated);

  useEffect(() => {
    setMounted(true);
  }, []);

  // After hydration: run auth + booking guards
  useEffect(() => {
    if (!mounted) return;
    const state = useBookingStore.getState();
    if (!isAuthenticated) {
      router.replace("/login?redirect=/checkout");
    } else if (!state.selectedDoctor) {
      router.replace("/doctors");
    } else if (state.generatedToken) {
      router.replace("/confirmation");
    }
  }, [mounted, router, isAuthenticated]);

  if (!mounted || !doctor) {
    return <div className="min-h-screen bg-[#f7f9fc] flex items-center justify-center">Loading...</div>;
  }

  return (
    <div className="bg-[#f7f9fc] min-h-screen pb-20 relative">
        {/* Decorative background blur */}
        <div className="absolute top-0 left-0 w-full h-[300px] bg-gradient-to-b from-[#205E98]/5 to-transparent pointer-events-none" />

        {/* Top Navigation */}
        <div className="bg-white/80 backdrop-blur-xl border-b border-slate-200/60 sticky top-0 z-30">
          <div className="container mx-auto px-4 max-w-5xl h-20 flex items-center justify-between">
            <Link href={`/doctors/${doctor.id}`} className="flex items-center gap-2 text-slate-600 hover:text-primary transition-colors font-medium">
              <ArrowLeft className="w-5 h-5" /> Back
            </Link>
            <div className="flex items-center gap-2 text-emerald-600 bg-emerald-50 px-3 py-1.5 rounded-full text-sm font-semibold border border-emerald-100">
              <ShieldCheck className="w-4 h-4" /> Secure Checkout
            </div>
          </div>
        </div>

        <div className="container mx-auto px-4 max-w-5xl mt-8 md:mt-12 relative z-10">
          
          {/* Queue Warning Banner */}
          <div className="mb-6 p-4 rounded-2xl bg-blue-50 border border-blue-100 flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-primary">
              <Activity className="w-5 h-5" />
            </div>
            <div>
              <p className="text-sm font-semibold text-blue-900">Live OPD Queue Enrollment</p>
              <p className="text-xs text-blue-700">You are about to join a live physical queue. A sequential Token Number will be generated.</p>
            </div>
          </div>

          {/* State Recovery Banner */}
          {useBookingStore.getState().patientDetails?.name && (
            <div className="mb-6 p-4 rounded-2xl bg-emerald-50 border border-emerald-100 flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div>
                <p className="text-sm font-semibold text-emerald-800">Booking Draft Restored</p>
                <p className="text-xs text-emerald-600">Your previous progress has been automatically recovered.</p>
              </div>
            </div>
          )}

          <div className="flex flex-col lg:flex-row gap-8 items-start">
            <PaymentForm />
            <OrderSummary doctor={doctor} type={type} />
          </div>
        </div>
      </div>
  );
}
