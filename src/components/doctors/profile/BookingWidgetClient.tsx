"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { BookingWidget } from "./BookingWidget";
import { Button } from "@/components/ui/button";
import { useBookingStore } from "@/store/useBookingStore";
import { useAuthStore } from "@/store/useAuthStore";
import type { Doctor } from "@/types";

interface BookingWidgetClientProps {
  doctor: Doctor;
  isMobileCTA?: boolean;
}

export function BookingWidgetClient({ doctor, isMobileCTA = false }: BookingWidgetClientProps) {
  const router = useRouter();
  const [selectedService, setSelectedService] = useState<"clinic" | "video">("clinic");

  const { setDoctor, setService } = useBookingStore();
  const { isAuthenticated } = useAuthStore();

  const handleBook = () => {
    setDoctor(doctor);
    setService(selectedService);
    
    if (!isAuthenticated) {
      router.push("/login?redirect=/checkout");
    } else {
      router.push("/checkout");
    }
  };

  if (isMobileCTA) {
    return (
      <Button
        onClick={handleBook}
        className="flex-1 h-12 rounded-xl text-base font-bold shadow-md transition-all bg-primary hover:bg-[#1a4b7a] text-white"
      >
        Join Queue — Book Now
      </Button>
    );
  }

  return (
    <BookingWidget
      doctor={doctor}
      selectedService={selectedService}
      onServiceChange={setSelectedService}
      onBook={handleBook}
    />
  );
}
