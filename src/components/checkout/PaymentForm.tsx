"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight, ShieldCheck } from "lucide-react";
import { PatientDetailsForm } from "./PatientDetailsForm";

import { useBookingStore } from "@/store/useBookingStore";
import { getDoctorQueueStatus } from "@/lib/queue-logic";
import { Button } from "@/components/ui/button";

export function PaymentForm() {
  const router = useRouter();
  const [isProcessing, setIsProcessing] = useState(false);
  const setGeneratedToken = useBookingStore(state => state.setGeneratedToken);
  const patientDetails = useBookingStore(state => state.patientDetails);
  const selectedDoctor = useBookingStore(state => state.selectedDoctor);

  const handleJoinQueue = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate patient details before proceeding
    if (!patientDetails.name.trim()) {
      document.querySelector('[placeholder="Patient\\\'s full name"]')?.scrollIntoView({ behavior: "smooth", block: "center" });
      return;
    }
    
    const phone = patientDetails.phone.replace(/\\D/g, "");
    if (phone.length < 10) {
      document.querySelector('[placeholder="+91 98765 43210"]')?.scrollIntoView({ behavior: "smooth", block: "center" });
      return;
    }

    setIsProcessing(true);
    
    try {
      const today = new Date().toISOString().split('T')[0]; // Format: YYYY-MM-DD
      
      const response = await fetch("/api/patient/book-appointment", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          doctorId: selectedDoctor?.id,
          date: today,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to book appointment");
      }

      // Map backend token format to the frontend store format
      const token = {
        id: data.token.id,
        tokenNumber: data.token.tokenNumber,
        status: data.token.status,
        source: data.token.source,
        estimatedWaitMinutes: 15, // Currently static, can be dynamic later
        createdAt: new Date().toISOString(),
        doctorId: selectedDoctor?.id,
        doctorName: selectedDoctor?.name,
        clinic: selectedDoctor?.clinic,
        location: selectedDoctor?.location,
        patientName: patientDetails.name,
        patientPhone: patientDetails.phone,
      };
      
      setGeneratedToken(token);
      
      // Also persist to localStorage for booking history recovery
      try {
        const history = JSON.parse(localStorage.getItem("jc_booking_history") || "[]");
        history.unshift(token);
        localStorage.setItem("jc_booking_history", JSON.stringify(history.slice(0, 20)));
      } catch { /* ignore */ }
      
      router.push("/confirmation");
    } catch (err: any) {
      alert("Booking failed: " + err.message);
      setIsProcessing(false);
    }
  };

  return (
    <div className="flex-1 space-y-8">
      <PatientDetailsForm />
      
      <section>
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-2xl font-bold tracking-tight text-slate-900">Confirm Booking</h2>
        </div>

        <form onSubmit={handleJoinQueue}>
          {/* Submit Button Container */}
          <div className="fixed bottom-0 left-0 right-0 p-4 bg-white border-t border-slate-100 z-50 shadow-[0_-10px_40px_-15px_rgba(0,0,0,0.1)] md:static md:p-0 md:bg-transparent md:border-none md:shadow-none">
            <Button
              type="submit"
              disabled={isProcessing}
              className="w-full h-14 md:h-16 rounded-2xl bg-primary hover:bg-primary/90 shadow-xl shadow-primary/20 transition-all hover:scale-[1.02] text-lg font-bold group disabled:opacity-70 disabled:hover:scale-100 disabled:cursor-not-allowed overflow-hidden relative min-h-[44px]"
            >
              {isProcessing ? (
                <div className="flex items-center gap-2">
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Generating Token...
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
