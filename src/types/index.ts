// =============================================================
//  JivniCare — Central Type Definitions
//  All shared TypeScript interfaces live here.
//  Import from "@/types" across the entire project.
// =============================================================

// ── Doctor & Medical Data ─────────────────────────────────────

export interface Doctor {
  // ── Core Identity ──────────────────────────────────────────
  id: string;
  uniqueDoctorId?: string;  // For internal system mapping
  name: string;
  slug?: string;            // URL-safe SEO slug: "dr-rajesh-kumar-pat-1k9z2x"
  publicSlug?: string;      // Public profile URL part
  shortCode?: string;       // QR-ready 6-char code: "DBG4K2"
  qrCodeReady?: boolean;    // Flag for QR service generation

  // ── Medical Credentials ────────────────────────────────────
  specialty: string;        // Primary specialization
  qualifications?: string;  // Degree pills: "MBBS, MD Medicine"
  experience: string;       // "12 Years"
  education: string;        // Full education string (profile page)
  verificationStatus?: 'Verified' | 'Pending' | 'GovtRegistered' | 'JivniCareVerified';
  registrationNumber?: string;

  // ── Practice & Location ────────────────────────────────────
  clinic: string;           // Hospital/clinic name
  hospitalSlug?: string;    // Link to hospital profile
  hospitalType?: string;    // "Multi-speciality", "Clinic", etc.
  location: string;         // District / city
  locality?: string;        // Specific area: "Anisabad"
  landmark?: string;        // Nearby landmark
  distance?: string;        // "1.2 km away"
  
  // ── Media ─────────────────────────────────────────────────
  image: string;            // Doctor profile photo URL
  bgImage: string;          // Clinic/facility banner image (legacy)
  clinicImage?: string;     // Clinic photo URL (new, preferred over bgImage)

  // ── Trust & Social Proof ───────────────────────────────────
  rating: number;
  reviews: number;          // Legacy review count
  reviewCount?: number;     // Real verified review count
  totalConsultations?: number; // "5k+ Consultations" social proof
  verifiedBadgeLabel?: string; // "Verified Doctor" / "Clinic Verified"
  patientTrustLabel?: string;  // "Trusted by 500+ patients"

  // ── Availability & Queue ───────────────────────────────────
  available: string;        // "Today" / "Tomorrow" / "Check Schedule"
  availabilityStatus?: string; // "Available in 12 mins", "Next Slot: 4:30 PM", "OPD Open"
  nextAvailable?: string;   // Time string: "9:00 AM"
  isQueueActive?: boolean;  // Whether today's live queue is running
  queueWaitMinutes?: number; // Approx wait time in minutes
  patientsWaiting?: number;  // "7 Patients Waiting"
  onboardingStage?: string;
  isAvailableToday?: boolean;

  // ── Fees & Modes ──────────────────────────────────────────
  fee: string;              // "₹400"
  videoFee?: string;        // "₹300" (online)
  consultationModes?: ('OPD' | 'Video' | 'HomeVisit')[];
  languages?: string[];     // ["Hindi", "English"]

  // ── Discovery & Search ────────────────────────────────────
  tags: string[];           // Specialty + keyword tags for search
  searchableKeywords?: string[];
  about: string;            // Bio / description
  averageConsultationTime?: number; // minutes
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
    location: string;
  };
  generatedToken: QueueToken | null; // Will store the QueueToken from backend

  // Actions
  openBooking: (doctor: Doctor) => void;
  closeBooking: () => void;
  setStep: (step: BookingState["step"]) => void;
  setService: (service: string | null) => void;
  setDoctor: (doctor: Doctor) => void;
  setPatientDetails: (details: Partial<{ name: string; email: string; phone: string; location: string }>) => void;
  setGeneratedToken: (token: QueueToken | null) => void;
  resetBooking: () => void;
}

// ── UI / Component Props ──────────────────────────────────────

export interface LogoProps {
  className?: string;
}
