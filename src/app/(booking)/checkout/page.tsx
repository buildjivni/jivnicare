"use client";

import Link from "next/link";
import { ArrowLeft, ShieldCheck, Activity } from "lucide-react";
import { OrderSummary, PaymentForm } from "@/features/booking/components/checkout";
import { useBookingStore } from "@/features/booking/store/useBookingStore";
import { useAuthStore } from "@/features/auth/store/useAuthStore";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

// ── Structured Checkout Skeleton ────────────────────────────────
function CheckoutSkeleton() {
  return (
    <div className="bg-[#f7f9fc] min-h-screen animate-pulse">
      {/* Nav skeleton */}
      <div className="bg-white border-b border-slate-100 h-20 flex items-center px-4">
        <div className="container mx-auto max-w-5xl flex items-center justify-between">
          <div className="h-5 w-20 bg-slate-200 rounded-full" />
          <div className="h-8 w-36 bg-slate-100 rounded-full" />
        </div>
      </div>
      <div className="container mx-auto px-4 max-w-5xl mt-8 md:mt-12">
        {/* Info banner skeleton */}
        <div className="mb-6 h-16 bg-blue-50 rounded-2xl border border-blue-100" />
        <div className="flex flex-col lg:flex-row gap-8 items-start">
          {/* Form skeleton */}
          <div className="flex-1 space-y-8">
            <div className="h-8 w-44 bg-slate-200 rounded-full" />
            <div className="bg-white rounded-3xl border border-slate-100 p-6 md:p-8 space-y-5">
              {[1, 2, 3].map(i => (
                <div key={i} className="space-y-2">
                  <div className="h-4 w-24 bg-slate-200 rounded-full" />
                  <div className="h-14 bg-slate-100 rounded-2xl" />
                </div>
              ))}
            </div>
          </div>
          {/* Summary sidebar skeleton */}
          <div className="lg:w-80 shrink-0 w-full">
            <div className="bg-white rounded-3xl border border-slate-100 p-6 space-y-4">
              <div className="h-5 w-32 bg-slate-200 rounded-full" />
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-full bg-slate-200 shrink-0" />
                <div className="space-y-2 flex-1">
                  <div className="h-4 w-3/4 bg-slate-200 rounded-full" />
                  <div className="h-3 w-1/2 bg-slate-100 rounded-full" />
                </div>
              </div>
              <div className="h-px bg-slate-100" />
              <div className="h-4 w-full bg-slate-100 rounded-full" />
              <div className="h-4 w-2/3 bg-slate-100 rounded-full" />
              <div className="h-14 bg-primary/10 rounded-2xl mt-4" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function CheckoutPage() {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);

  const doctor = useBookingStore(state => state.selectedDoctor);
  const type = useBookingStore(state => state.selectedService) || "clinic";
  const isAuthenticated = useAuthStore(state => state.isAuthenticated);

  useEffect(() => {
    setMounted(true);
  }, []);

  const _hasHydrated = useAuthStore(state => state._hasHydrated);

  // After hydration: run auth + booking guards
  useEffect(() => {
    if (!mounted || !_hasHydrated) return;
    const state = useBookingStore.getState();
    if (!isAuthenticated) {
      router.replace("/login?redirect=/checkout");
    } else if (!state.selectedDoctor) {
      router.replace("/doctors");
    } else if (state.generatedToken) {
      router.replace("/confirmation");
    }
  }, [mounted, router, isAuthenticated, _hasHydrated]);

  if (!mounted || !doctor) return <CheckoutSkeleton />;

  return (
    <div className="bg-[#f7f9fc] min-h-screen pb-28 md:pb-12 relative">
      {/* Decorative background blur */}
      <div className="absolute top-0 left-0 w-full h-[300px] bg-gradient-to-b from-[#205E98]/5 to-transparent pointer-events-none" />

      {/* Top Navigation */}
      <div className="bg-white/80 backdrop-blur-xl border-b border-slate-200/60 sticky top-0 z-30">
        <div className="container mx-auto px-4 max-w-5xl h-20 flex items-center justify-between">
          <Link
            href={`/doctors/${doctor.id}`}
            className="flex items-center gap-2 text-slate-600 hover:text-primary transition-colors font-medium active:scale-95 rounded-xl p-1 -ml-1"
          >
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
          <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-primary shrink-0">
            <Activity className="w-5 h-5" />
          </div>
          <div>
            <p className="text-sm font-semibold text-blue-900">Clinic Appointment Booking</p>
            <p className="text-xs text-blue-700">You will receive a confirmed token number to see the doctor.</p>
          </div>
        </div>

        {/* State Recovery Banner */}
        {useBookingStore.getState().patientDetails?.name && (
          <div className="mb-6 p-4 rounded-2xl bg-emerald-50 border border-emerald-100 flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600 shrink-0">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <p className="text-sm font-semibold text-emerald-800">Booking Details Saved</p>
              <p className="text-xs text-emerald-600">We saved your progress so you can complete your booking easily.</p>
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
