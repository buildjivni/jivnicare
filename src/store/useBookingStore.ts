// =============================================================
//  JivniCare — Global Booking Store (Zustand)
//  Import from "@/store/useBookingStore" across the entire project.
// =============================================================

import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { BookingState, Doctor } from "@/types";

export const useBookingStore = create<BookingState>()(
  persist(
    (set) => ({
      isBookingOpen: false,
      selectedDoctor: null,
      selectedService: null,
      step: "service",
      patientDetails: {
        name: "",
        email: "",
        phone: "",
        location: "",
      },
      generatedToken: null,

      openBooking: (doctor: Doctor) =>
        set({
          isBookingOpen: true,
          selectedDoctor: doctor,
          step: "service",
          selectedService: null,
          generatedToken: null,
        }),

      closeBooking: () => set({ isBookingOpen: false }),

      setStep: (step) => set({ step }),

      setService: (service) => set({ selectedService: service }),

      setDoctor: (doctor: Doctor) => set({ selectedDoctor: doctor }),

      setPatientDetails: (details: Partial<{ name: string; email: string; phone: string; location: string }>) =>
        set((state) => ({
          patientDetails: { ...state.patientDetails, ...details },
        })),

      setGeneratedToken: (token: any) => set({ generatedToken: token }),

      resetBooking: () =>
        set({
          selectedDoctor: null,
          selectedService: null,
          step: "service",
          patientDetails: { name: "", email: "", phone: "", location: "" },
          generatedToken: null,
        }),
    }),
    {
      name: "jivnicare-booking-storage",
    }
  )
);
