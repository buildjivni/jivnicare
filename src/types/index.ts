// =============================================================
//  JivniCare — Central Type Definitions
//  All shared TypeScript interfaces live here.
//  Import from "@/types" across the entire project.
// =============================================================

// ── Doctor & Medical Data ─────────────────────────────────────

export interface Doctor {
  id: string;
  name: string;
  specialty: string;
  clinic: string;
  location: string;
  rating: number;
  reviews: number;
  experience: string;
  fee: string;
  videoFee: string;
  image: string;
  bgImage: string;
  available: string;
  tags: string[];
  about: string;
  education: string;
  averageConsultationTime?: number;
  nextAvailable?: string;
}

export interface Specialty {
  name: string;
  id: string;
}

// ── Booking Store ─────────────────────────────────────────────

export interface BookingDetails {
  doctorId: string;
  doctorName: string;
  specialty: string;
  date: string;
  time: string;
  service: string;
  fee: string;
  clinic: string;
  patientName: string;
  patientPhone: string;
}

export interface QueueToken {
  id: string;
  tokenNumber: number;
  status: string;
  createdAt: string;
  tokenIssuedAt?: string;
  source?: string;
  estimatedWaitMinutes?: number;
  doctorId?: string;
  doctorName?: string;
  clinic?: string;
  location?: string;
  patientName?: string;
  patientPhone?: string;
  queuePosition?: number;
}

export interface BookingState {
  isBookingOpen: boolean;
  selectedDoctor: Doctor | null;
  selectedService: string | null;
  step: "service" | "confirm" | "success";
  patientDetails: {
    name: string;
    email: string;
    phone: string;
  };
  generatedToken: QueueToken | null; // Will store the QueueToken from backend

  // Actions
  openBooking: (doctor: Doctor) => void;
  closeBooking: () => void;
  setStep: (step: BookingState["step"]) => void;
  setService: (service: string | null) => void;
  setDoctor: (doctor: Doctor) => void;
  setPatientDetails: (details: Partial<{ name: string; email: string; phone: string }>) => void;
  setGeneratedToken: (token: QueueToken | null) => void;
  resetBooking: () => void;
}

// ── UI / Component Props ──────────────────────────────────────

export interface LogoProps {
  className?: string;
}
