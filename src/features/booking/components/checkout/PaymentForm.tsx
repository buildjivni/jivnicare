"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight, ShieldCheck, Activity, CheckCircle2 } from "lucide-react";
import { PatientDetailsForm } from "./PatientDetailsForm";
import { InlineOTPWidget } from "./InlineOTPWidget";
import { trackOperationalEvent } from "@/lib/telemetry/client";
import { motion, AnimatePresence } from "framer-motion";

import { useBookingStore } from "@/features/booking/store/useBookingStore";
import { useAuthStore } from "@/features/auth/store/useAuthStore";
import { Button } from "@/components/ui/button";

/**
 * PR-1: PaymentForm with AuthGate State Machine
 *
 * States:
 *   HYDRATING     → waiting for Zustand rehydration (avoids flash of auth gate to logged-in users)
 *   AUTH_GATE     → unauthenticated patient; show InlineOTPWidget
 *   AUTHED_FORM   → authenticated patient; show PatientDetailsForm + submit button
 *   PROCESSING    → API call in-flight
 *   SUCCESS       → redirect to /confirmation
 *   QUEUE_FULL    → slots are full for today
 */
type FormState = "HYDRATING" | "AUTH_GATE" | "AUTHED_FORM" | "PROCESSING" | "SUCCESS" | "QUEUE_FULL";

export function PaymentForm() {
  const router = useRouter();
  const [formState, setFormState] = useState<FormState>("HYDRATING");
  const [errors, setErrors] = useState<{ submit?: string }>({});
  const [disclaimerAgreed, setDisclaimerAgreed] = useState(false);
  const setGeneratedToken = useBookingStore((state) => state.setGeneratedToken);
  const patientDetails = useBookingStore((state) => state.patientDetails);
  const selectedDoctor = useBookingStore((state) => state.selectedDoctor);
  const { isAuthenticated, _hasHydrated } = useAuthStore();

  // Emergency Queue States
  const [isEmergencyQueue, setIsEmergencyQueue] = useState(false);
  const [emergencyFee, setEmergencyFee] = useState<number | null>(null);
  const [isEmergencyConfirmed, setIsEmergencyConfirmed] = useState(false);
  const [showEmergencyModal, setShowEmergencyModal] = useState(false);

  const hasIntentRef = useRef(false);
  const isSuccessRef = useRef(false);
  const requestIdRef = useRef<string | null>(null);

  // Generate idempotency key once
  useEffect(() => {
    if (typeof window !== "undefined" && !requestIdRef.current) {
      requestIdRef.current = crypto.randomUUID();
    }
  }, []);

  // PR-1: AuthGate — wait for Zustand hydration before deciding state
  // Prevents briefly flashing the OTP widget to already-authenticated users on slow connections
  useEffect(() => {
    if (!_hasHydrated) return; // Still rehydrating — stay in HYDRATING

    if (isAuthenticated) {
      setFormState("AUTHED_FORM");
    } else {
      setFormState("AUTH_GATE");
    }
  }, [_hasHydrated, isAuthenticated]);

  // Fetch clinic status to detect Emergency Only queue
  useEffect(() => {
    if (selectedDoctor?.slug) {
      fetch(`/api/public/clinic-status/${selectedDoctor.slug}`)
        .then((res) => res.json())
        .then((data) => {
          if (data && data.status === "EMERGENCY_ONLY") {
            setIsEmergencyQueue(true);
            if (data.emergencyFee) {
              setEmergencyFee(data.emergencyFee);
            }
          }
        })
        .catch((err) => console.error("Error fetching clinic status:", err));
    }
  }, [selectedDoctor]);

  // Track checkout started (once, after hydration resolves)
  useEffect(() => {
    if (formState === "AUTH_GATE" || formState === "AUTHED_FORM") {
      trackOperationalEvent({ metric: "checkoutStarted" });
    }
  }, [formState]);

  // Abandonment tracking on unmount
  useEffect(() => {
    const timer = setTimeout(() => { hasIntentRef.current = true; }, 3000);
    return () => {
      clearTimeout(timer);
      if (hasIntentRef.current && !isSuccessRef.current) {
        trackOperationalEvent({ metric: "bookingAbandons" });
      }
    };
  }, []);

  const handleJoinQueue = async (e: React.FormEvent) => {
    e.preventDefault();
    if (formState !== "AUTHED_FORM") return;

    setErrors({});

    // Client-side validation before hitting API
    if (!disclaimerAgreed) {
      setErrors({ submit: "Kripya Medical Disclaimer ko agree karein booking confirm karne ke liye." });
      return;
    }
    if (!patientDetails.name.trim()) {
      document.getElementById("name")?.focus();
      return;
    }
    const phone = patientDetails.phone.replace(/\D/g, "");
    if (phone.length < 10) {
      document.getElementById("phone")?.focus();
      return;
    }
    if (!patientDetails.location.trim()) {
      document.getElementById("location")?.focus();
      return;
    }

    if (isEmergencyQueue && !isEmergencyConfirmed) {
      setShowEmergencyModal(true);
      return;
    }

    await executeBooking(isEmergencyQueue);
  };

  const confirmEmergencyAndBook = async () => {
    setIsEmergencyConfirmed(true);
    setShowEmergencyModal(false);
    // Trigger the actual booking call after a tiny transition delay
    setTimeout(() => {
      executeBooking(true);
    }, 100);
  };

  const executeBooking = async (isEmergency: boolean) => {
    setFormState("PROCESSING");

    try {
      const response = await fetch("/api/patient/book-appointment", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          doctorId: selectedDoctor?.id,
          location: patientDetails.location,
          requestId: requestIdRef.current,
          isEmergency,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        if (response.status === 401) {
          // Session expired mid-checkout — drop back to AUTH_GATE (no redirect)
          useAuthStore.getState().logout();
          setFormState("AUTH_GATE");
          setErrors({ submit: "Your session expired. Please verify your number again." });
          return;
        }
        
        if (data.error === "ALREADY_BOOKED") {
          isSuccessRef.current = true;
          setErrors({ submit: "You already have an active booking. Redirecting..." });
          setTimeout(() => { router.replace("/my-bookings"); }, 2000);
          return;
        }

        throw new Error(data.error || "Failed to book appointment");
      }

      // Map backend token format to the frontend store format
      const avgConsultMinutes = selectedDoctor?.averageConsultationTime || 10;
      const tokenData = data.token || data.data?.token;
      if (!tokenData) {
        throw new Error("Invalid response format from server");
      }
      const token = {
        id: tokenData.id,
        tokenNumber: tokenData.tokenNumber,
        status: tokenData.status,
        source: tokenData.source,
        estimatedWaitMinutes: tokenData.tokenNumber * avgConsultMinutes,
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

      // Mandatory persistence for recovery
      try {
        localStorage.setItem("jc_active_token", JSON.stringify(token));
        const history = JSON.parse(localStorage.getItem("jc_booking_history") || "[]");
        if (!history.find((h: any) => h.id === token.id)) {
          history.unshift(token);
          localStorage.setItem("jc_booking_history", JSON.stringify(history.slice(0, 20)));
        }
      } catch { /* ignore localStorage errors */ }

      isSuccessRef.current = true;
      setFormState("SUCCESS");
      trackOperationalEvent({ metric: "bookingSuccess" });

      // Small delay before redirecting to allow user to see success state
      setTimeout(() => { router.replace("/confirmation"); }, 500);

    } catch (err: any) {
      // Do NOT regenerate requestId. Network drops require exact retry.
      setErrors({ submit: err.message || "Something went wrong. Please try again." });
      setFormState("AUTHED_FORM");
      trackOperationalEvent({ metric: "bookingFailures", metadata: { type: err.message, category: "API_ERROR" } });
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const isSuccess = formState === "SUCCESS";
  const isProcessing = formState === "PROCESSING";
  const submitError = errors.submit;

  // ── Render: Hydrating ────────────────────────────────────────────
  if (formState === "HYDRATING") {
    return (
      <div className="flex-1 space-y-8">
        <div className="bg-white rounded-3xl border border-slate-100 animate-pulse h-48" />
      </div>
    );
  }

  // ── Render: Auth Gate (unauthenticated patient) ──────────────────
  if (formState === "AUTH_GATE") {
    return (
      <div className="flex-1 space-y-8">
        <InlineOTPWidget onVerified={() => setFormState("AUTHED_FORM")} />
      </div>
    );
  }

  // ── Render: Queue Full ───────────────────────────────────────────
  if (formState === "QUEUE_FULL") {
    return (
      <div className="flex-1 space-y-8 animate-in fade-in zoom-in-95 duration-300">
        <div className="bg-red-50/50 rounded-[2.5rem] p-8 md:p-12 text-center border border-red-100 relative overflow-hidden">
          <div className="w-20 h-20 bg-white rounded-3xl mx-auto flex items-center justify-center mb-6 shadow-sm border border-red-100">
            <Activity className="w-10 h-10 text-red-500" />
          </div>
          <h2 className="text-2xl font-black text-slate-900 mb-2">Aaj ke slots full hain</h2>
          <p className="text-slate-500 font-medium mb-8">Kal subah available slots check karein.</p>
          <Button 
            onClick={() => router.back()} 
            className="h-14 px-8 rounded-2xl bg-white text-slate-900 hover:bg-slate-50 font-bold border border-slate-200 shadow-sm"
          >
            Go Back
          </Button>
        </div>
      </div>
    );
  }

  // ── Render: Authenticated Form ───────────────────────────────────
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
          {/* Medical Disclaimer Checkbox */}
          <div className="flex items-start gap-3 p-4 bg-amber-50/50 rounded-2xl border border-amber-100/50 mb-6">
            <input
              type="checkbox"
              id="medical-disclaimer"
              checked={disclaimerAgreed}
              onChange={(e) => setDisclaimerAgreed(e.target.checked)}
              className="w-4 h-4 rounded border-slate-300 text-primary focus:ring-primary mt-0.5 cursor-pointer"
            />
            <label htmlFor="medical-disclaimer" className="text-xs text-slate-600 leading-normal cursor-pointer select-none">
              Main samajhta hoon ki <span className="font-bold text-slate-800">JivniCare ek booking platform hai</span>, yeh direct clinical treatment nahi pradan karta. Kisi bhi medical emergency ke liye kripya nazdiki hospital se turant sampark karein.
            </label>
          </div>

          <div className="fixed bottom-0 left-0 right-0 p-4 bg-white border-t border-slate-100 z-50 shadow-[0_-10px_40px_-15px_rgba(0,0,0,0.1)] md:static md:p-0 md:bg-transparent md:border-none md:shadow-none">
            <Button
              type="submit"
              disabled={isProcessing || isSuccess || !disclaimerAgreed}
              className={`w-full h-14 md:h-16 rounded-2xl transition-all text-lg font-bold group disabled:opacity-50 disabled:cursor-not-allowed overflow-hidden relative min-h-[44px] shadow-xl ${
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
                  Confirm &amp; Join Queue
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

      {/* ── Emergency Confirmation Modal (Flow P3.1) ── */}
      <AnimatePresence>
        {showEmergencyModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowEmergencyModal(false)}
              className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
            />
            
            {/* Modal Card */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ type: "spring", duration: 0.3 }}
              className="relative w-full max-w-md bg-white rounded-3xl p-6 md:p-8 shadow-2xl border border-slate-100 text-center space-y-6 z-10"
            >
              <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mx-auto text-red-600 animate-pulse border border-red-100">
                <Activity className="w-8 h-8" />
              </div>
              
              <div className="space-y-2">
                <h3 className="text-xl md:text-2xl font-black text-slate-900 tracking-tight">
                  🚨 Emergency Booking Alert
                </h3>
                <p className="text-xs font-bold text-red-700 bg-red-50 px-3 py-1 rounded-full w-fit mx-auto">
                  Clinic is in Emergency-Only Mode
                </p>
              </div>

              <div className="text-slate-600 text-sm leading-relaxed space-y-3 px-1">
                <p>
                  Yeh doctor abhi sirf <span className="font-extrabold text-slate-900">emergency cases</span> ke liye available hain. Regular bookings temporarily closed hain.
                </p>
                <p className="text-xs text-slate-500">
                  This clinic is operating in emergency-only mode. Regular appointments are temporarily paused.
                </p>
              </div>

              <div className="p-4 bg-slate-50 border border-slate-100 rounded-2xl">
                <span className="text-slate-500 font-bold text-xs uppercase tracking-wider block">Emergency Consultation Fee</span>
                <span className="text-3xl font-black text-slate-900 block mt-1">
                  ₹{emergencyFee || (selectedDoctor?.fee ? parseInt(selectedDoctor.fee.replace(/\D/g, "")) : 0)}
                </span>
                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block mt-1">Paid directly at clinic counter</span>
              </div>

              <div className="flex flex-col sm:flex-row gap-3 pt-2">
                <Button
                  onClick={() => setShowEmergencyModal(false)}
                  variant="outline"
                  className="w-full h-12 rounded-xl font-bold border-slate-200 text-slate-700 hover:bg-slate-50 order-2 sm:order-1"
                >
                  Go Back / Cancel
                </Button>
                <Button
                  onClick={confirmEmergencyAndBook}
                  className="w-full h-12 rounded-xl font-black bg-red-600 hover:bg-red-700 text-white shadow-lg shadow-red-600/25 order-1 sm:order-2"
                >
                  Yes, Confirm &amp; Book
                </Button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
