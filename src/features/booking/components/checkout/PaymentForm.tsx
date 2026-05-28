"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight, ShieldCheck, Activity, CheckCircle2 } from "lucide-react";
import { PatientDetailsForm } from "./PatientDetailsForm";
import { trackOperationalEvent } from "@/lib/telemetry/client";

import { useBookingStore } from "@/features/booking/store/useBookingStore";
import { useAuthStore } from "@/features/auth/store/useAuthStore";
import { Button } from "@/components/ui/button";

export function PaymentForm() {
  const router = useRouter();
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [errors, setErrors] = useState<{ submit?: string }>({});
  const setGeneratedToken = useBookingStore(state => state.setGeneratedToken);
  const patientDetails = useBookingStore(state => state.patientDetails);
  const selectedDoctor = useBookingStore(state => state.selectedDoctor);

  const hasIntentRef = useRef(false);
  const isSuccessRef = useRef(false);
  const requestIdRef = useRef<string | null>(null);

  useEffect(() => {
    // Generate an idempotency key on mount
    if (typeof window !== "undefined" && !requestIdRef.current) {
      requestIdRef.current = crypto.randomUUID();
    }
    
    const timer = setTimeout(() => {
      hasIntentRef.current = true;
    }, 3000); // 3 seconds on page implies intent

    return () => {
      clearTimeout(timer);
      if (hasIntentRef.current && !isSuccessRef.current) {
        trackOperationalEvent({ metric: 'bookingAbandons' });
      }
    };
  }, []);

  const handleJoinQueue = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isProcessing || isSuccess) return;

    setErrors({});

    // Validate patient details before proceeding
    if (!patientDetails.name.trim()) {
      document.querySelector('[placeholder="Patient\\\'s full name"]')?.scrollIntoView({ behavior: "smooth", block: "center" });
      return;
    }
    
    const phone = patientDetails.phone.replace(/\D/g, "");
    if (phone.length < 10) {
      document.querySelector('[placeholder="+91 98765 43210"]')?.scrollIntoView({ behavior: "smooth", block: "center" });
      return;
    }
    
    if (!patientDetails.location.trim()) {
      document.querySelector('[placeholder="e.g. Patna, Kankarbagh, or your Village name"]')?.scrollIntoView({ behavior: "smooth", block: "center" });
      return;
    }

    setIsProcessing(true);
    
    try {
      const today = new Date().toISOString().split('T')[0]; 
      
      const response = await fetch("/api/patient/book-appointment", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          doctorId: selectedDoctor?.id,
          date: today,
          location: patientDetails.location,
          requestId: requestIdRef.current,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        // Handle specific API errors gracefully
        if (response.status === 401) {
          useAuthStore.getState().logout();
          router.push(`/login?redirect=/checkout&error=session_expired`);
          return;
        }
        throw new Error(data.error || "Failed to book appointment");
      }

      // Map backend token format to the frontend store format
      const avgConsultMinutes = selectedDoctor?.averageConsultationTime || 10;
      const token = {
        id: data.token.id,
        tokenNumber: data.token.tokenNumber,
        status: data.token.status,
        source: data.token.source,
        estimatedWaitMinutes: data.token.tokenNumber * avgConsultMinutes,
        createdAt: new Date().toISOString(),
        doctorId: selectedDoctor?.id,
        doctorName: selectedDoctor?.name,
        clinic: selectedDoctor?.clinic,
        location: selectedDoctor?.location,
        patientName: patientDetails.name,
        patientPhone: patientDetails.phone,
        patientLocation: patientDetails.location,
      };
      
      setGeneratedToken(token);
      
      // Mandatory Persistence for Recovery
      try {
        localStorage.setItem("jc_active_token", JSON.stringify(token));
        const history = JSON.parse(localStorage.getItem("jc_booking_history") || "[]");
        // Prevent duplicates in history
        if (!history.find((h: any) => h.id === token.id)) {
          history.unshift(token);
          localStorage.setItem("jc_booking_history", JSON.stringify(history.slice(0, 20)));
        }
      } catch { /* ignore local storage errors */ }
      
      isSuccessRef.current = true;
      setIsProcessing(false);
      setIsSuccess(true); // Safe optimistic UX: show success ONLY after backend confirmation
      
      trackOperationalEvent({ metric: 'bookingSuccess' });
      
      // Small delay before redirecting to allow user to see the success state
      setTimeout(() => {
        router.push("/confirmation");
      }, 500);
      
    } catch (err: any) {
      // Regenerate requestId for a clean retry if it was a server error
      requestIdRef.current = crypto.randomUUID();
      
      // Premium medical-grade error handling
      const errorMessage = err.message || "Something went wrong. Please try again.";
      setErrors({ submit: errorMessage });
      setIsProcessing(false);
      setIsSuccess(false);
      
      trackOperationalEvent({
        metric: 'bookingFailures',
        metadata: { type: errorMessage, category: 'API_ERROR' }
      });
      
      // Scroll to error
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const submitError = (errors as any).submit;

  return (
    <div className="flex-1 space-y-8">
      <PatientDetailsForm disabled={isProcessing || isSuccess} />
      
      <section>
        {submitError && (
          <div className="mb-6 p-4 rounded-2xl bg-red-50 border border-red-100 flex items-center gap-3 animate-in fade-in slide-in-from-top-2 duration-300">
            <div className="w-8 h-8 rounded-full bg-red-100 flex items-center justify-center text-red-600 shrink-0">
              <Activity className="w-5 h-5" />
            </div>
            <p className="text-sm font-bold text-red-800">{submitError}</p>
          </div>
        )}

        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-2xl font-bold tracking-tight text-slate-900">Confirm Booking</h2>
        </div>

        <form onSubmit={handleJoinQueue}>
          {/* Submit Button Container */}
          <div className="fixed bottom-0 left-0 right-0 p-4 bg-white border-t border-slate-100 z-50 shadow-[0_-10px_40px_-15px_rgba(0,0,0,0.1)] md:static md:p-0 md:bg-transparent md:border-none md:shadow-none">
            <Button
              type="submit"
              disabled={isProcessing || isSuccess}
              className={`w-full h-14 md:h-16 rounded-2xl transition-all text-lg font-bold group disabled:opacity-90 disabled:cursor-not-allowed overflow-hidden relative min-h-[44px] shadow-xl ${
                isSuccess 
                  ? "bg-emerald-500 hover:bg-emerald-600 shadow-emerald-500/20 text-white" 
                  : "bg-primary hover:bg-primary/90 hover:brightness-105 shadow-primary/20 text-white"
              }`}
            >
              {isSuccess ? (
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-6 h-6" />
                  Booking Confirmed!
                </div>
              ) : isProcessing ? (
                <div className="flex items-center gap-2">
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Processing booking...
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  Confirm & Join Queue
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </div>
              )}
            </Button>
            <p className="text-center text-xs md:text-sm text-slate-500 mt-3 md:mt-6 font-medium flex items-center justify-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-500" /> Secure Booking
            </p>
          </div>
        </form>
      </section>
    </div>
  );
}
