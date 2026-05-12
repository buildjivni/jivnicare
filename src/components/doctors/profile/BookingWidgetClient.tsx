"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { BookingWidget } from "./BookingWidget";
import { Button } from "@/components/ui/button";
import { useBookingStore } from "@/store/useBookingStore";
import type { Doctor } from "@/types";

export interface DateItem {
  date: string;
  day: string;
  fullDate: string;
  monthYear: string;
}

function generateNextDays(count: number): DateItem[] {
  const days = [];
  const today = new Date();
  for (let i = 0; i < count; i++) {
    const nextDate = new Date(today);
    nextDate.setDate(today.getDate() + i);
    days.push({
      date: nextDate.getDate().toString(),
      day: nextDate.toLocaleDateString("en-US", { weekday: "short" }),
      fullDate: nextDate.toLocaleDateString("en-US", { day: "numeric", month: "short", year: "numeric" }),
      monthYear: nextDate.toLocaleDateString("en-US", { month: "long", year: "numeric" })
    });
  }
  return days;
}

interface BookingWidgetClientProps {
  doctor: Doctor;
  isMobileCTA?: boolean;
}

export function BookingWidgetClient({ doctor, isMobileCTA = false }: BookingWidgetClientProps) {
  const router = useRouter();
  const availableDates = generateNextDays(5);
  const [selectedSlot, setSelectedSlot] = useState<string | null>(null);
  const [selectedService, setSelectedService] = useState<"clinic" | "video">("clinic");
  const [selectedDate, setSelectedDate] = useState<DateItem>(availableDates[0]);

  const { setDoctor, setTime, setService, setDate } = useBookingStore();

  const handleBook = () => {
    if (!selectedSlot) return;
    setDoctor(doctor);
    setTime(selectedSlot);
    setService(selectedService);
    setDate(selectedDate.fullDate);
    router.push("/checkout");
  };

  if (isMobileCTA) {
    return (
      <Button
        onClick={() => {
          if (!selectedSlot) {
            const widget = document.getElementById("mobile-booking-widget");
            if (widget) {
              widget.scrollIntoView({ behavior: "smooth", block: "center" });
            } else {
              window.scrollTo({ top: 0, behavior: "smooth" });
            }
          } else {
            handleBook();
          }
        }}
        className={`flex-1 h-12 rounded-xl text-base font-bold shadow-md transition-all ${
          selectedSlot 
            ? "bg-[#205E98] hover:bg-[#1a4b7a] text-white" 
            : "bg-slate-100 text-slate-500 hover:bg-slate-200"
        }`}
      >
        {selectedSlot ? "Continue to Checkout" : "Select Slot"}
      </Button>
    );
  }

  return (
    <BookingWidget
      doctor={doctor}
      selectedService={selectedService}
      onServiceChange={setSelectedService}
      selectedSlot={selectedSlot}
      onSlotChange={setSelectedSlot}
      availableDates={availableDates}
      selectedDate={selectedDate}
      onDateChange={setSelectedDate}
      onBook={handleBook}
    />
  );
}
