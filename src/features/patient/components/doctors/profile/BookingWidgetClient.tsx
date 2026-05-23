"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { BookingWidget } from "./BookingWidget";
import { Button } from "@/components/ui/button";
import { useBookingStore } from "@/features/booking/store/useBookingStore";
import { useAuthStore } from "@/features/auth/store/useAuthStore";
import type { Doctor } from "@/types";
import { trackEvent } from "@/lib/infrastructure/analytics";

interface BookingWidgetClientProps {
  doctor: Doctor;
  isMobileCTA?: boolean;
  isClosedToday?: boolean;
}

export function BookingWidgetClient({ doctor, isMobileCTA = false, isClosedToday = false }: BookingWidgetClientProps) {
  const router = useRouter();
  const [selectedService, setSelectedService] = useState<"clinic" | "video">("clinic");
  const [isNavigating, setIsNavigating] = useState(false);

  const { setDoctor, setService } = useBookingStore();
  const { isAuthenticated, _hasHydrated } = useAuthStore();

  const handleBook = () => {
    if (isNavigating) return;
    trackEvent("booking_initiated", { doctorId: doctor.id, service: selectedService, isMobile: isMobileCTA });
    setIsNavigating(true);
    setDoctor(doctor);
    setService(selectedService);
    
    if (!isAuthenticated) {
      router.push("/login?redirect=/checkout");
    } else {
      router.push("/checkout");
    }
  };

  useEffect(() => {
    if (typeof window !== "undefined" && _hasHydrated) {
      const params = new URLSearchParams(window.location.search);
      if (params.get("autoBook") === "true") {
        // Strip parameter from history immediately
        const newUrl = window.location.pathname;
        window.history.replaceState({}, document.title, newUrl);
        // Direct execution
        handleBook();
      }
    }
  }, [isAuthenticated, _hasHydrated]);

  if (isMobileCTA) {
    return (
      <Button
        onClick={handleBook}
        disabled={isNavigating || isClosedToday}
        className="flex-1 h-[52px] rounded-xl text-[15px] font-black tracking-wide shadow-lg transition-all bg-gradient-to-b from-[#2366a8] to-[#1a4e87] hover:from-[#1a5898] hover:to-[#153e6e] text-white disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2 active:scale-[0.97]"
      >
        {isNavigating ? (
          <>
            <div className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
            Booking...
          </>
        ) : isClosedToday ? (
          "🔴 Clinic Closed Today"
        ) : (
          <>
            <svg className="w-4 h-4 text-white/90" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/></svg>
            Book Appointment Now
          </>
        )}
      </Button>
    );
  }

  return (
    <BookingWidget
      doctor={doctor}
      selectedService={selectedService}
      onServiceChange={setSelectedService}
      onBook={handleBook}
      isNavigating={isNavigating}
    />
  );
}
