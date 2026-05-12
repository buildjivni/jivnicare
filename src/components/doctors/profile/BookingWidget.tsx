"use client";

import { Stethoscope, Video } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import type { Doctor } from "@/types";

import type { DateItem } from "./BookingWidgetClient";

const TIME_SLOTS = ["09:00 AM", "10:30 AM", "01:15 PM", "02:45 PM", "04:00 PM"];

interface BookingWidgetProps {
  doctor: Doctor;
  selectedService: "clinic" | "video";
  onServiceChange: (service: "clinic" | "video") => void;
  selectedSlot: string | null;
  onSlotChange: (slot: string) => void;
  availableDates: DateItem[];
  selectedDate: DateItem;
  onDateChange: (date: DateItem) => void;
  onBook: () => void;
}

const SERVICE_BTN = "flex flex-col items-center justify-center p-4 rounded-xl border-2 transition-all";
const ACTIVE_SERVICE = "border-[#205E98] bg-[#205E98]/5 text-[#205E98]";
const INACTIVE_SERVICE = "border-border bg-background text-muted-foreground hover:border-[#205E98]/30 hover:bg-muted";

export function BookingWidget({
  doctor,
  selectedService,
  onServiceChange,
  selectedSlot,
  onSlotChange,
  availableDates,
  selectedDate,
  onDateChange,
  onBook,
}: BookingWidgetProps) {
  return (
    <Card className="border-border/50 shadow-lg rounded-2xl bg-background overflow-hidden">
      <CardContent className="p-0">
        {/* Service Selection */}
        <div className="p-5 bg-muted/30 border-b border-border/50">
          <h3 className="font-bold text-lg mb-4">Select Consultation Type</h3>
          <div className="grid grid-cols-2 gap-3">
            <button onClick={() => onServiceChange("clinic")} className={`${SERVICE_BTN} ${selectedService === "clinic" ? ACTIVE_SERVICE : INACTIVE_SERVICE}`}>
              <Stethoscope className="w-6 h-6 mb-2" />
              <span className="font-medium text-sm">In-Clinic</span>
              <span className="text-xs font-bold mt-1">{doctor.fee}</span>
            </button>
            <button onClick={() => onServiceChange("video")} className={`${SERVICE_BTN} ${selectedService === "video" ? ACTIVE_SERVICE : INACTIVE_SERVICE}`}>
              <Video className="w-6 h-6 mb-2" />
              <span className="font-medium text-sm">Video Call</span>
              <span className="text-xs font-bold mt-1">{doctor.videoFee}</span>
            </button>
          </div>
        </div>

        {/* Date & Slot Selection */}
        <div className="p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-base">Select Date</h3>
            <span className="text-xs font-medium text-[#205E98]">{selectedDate.monthYear}</span>
          </div>

          <div className="flex justify-between gap-2 mb-6">
            {availableDates.map((d) => {
              const isActive = selectedDate.fullDate === d.fullDate;
              return (
                <button
                  key={d.fullDate}
                  onClick={() => onDateChange(d)}
                  className={`flex flex-col items-center p-2 rounded-xl border min-w-[3.5rem] transition-all ${isActive ? "bg-[#205E98] text-white border-[#205E98] shadow-md" : "border-border hover:border-[#205E98]/50 text-foreground"}`}
                >
                  <span className={`text-xs ${isActive ? "text-blue-100" : "text-muted-foreground"}`}>{d.day}</span>
                  <span className="font-bold text-lg mt-0.5">{d.date}</span>
                </button>
              );
            })}
          </div>

          <h3 className="font-bold text-base mb-4">Available Slots</h3>
          <div className="grid grid-cols-3 gap-2">
            {TIME_SLOTS.map((time) => (
              <button
                key={time}
                onClick={() => onSlotChange(time)}
                className={`py-2 px-1 text-xs font-medium rounded-lg border transition-all ${selectedSlot === time ? "bg-[#258C54] text-white border-[#258C54]" : "border-border text-foreground hover:border-[#258C54]/50"}`}
              >
                {time}
              </button>
            ))}
          </div>

          <div className="hidden md:block mt-8">
            <Button
              onClick={onBook}
              disabled={!selectedSlot}
              className="w-full h-14 rounded-xl bg-[#205E98] hover:bg-[#1a4b7a] shadow-md text-base font-semibold transition-all hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
            >
              Continue to Book
            </Button>
            <p className="text-xs text-center text-muted-foreground mt-3">You won&apos;t be charged yet</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
