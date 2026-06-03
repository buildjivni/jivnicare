import { z } from "zod";

// Shared Schemas
const objectIdRegex = /^[0-9a-fA-F]{24}$/;
const uuidRegex = /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/;

// We accept both standard UUIDs and 24-char MongoDB ObjectIDs depending on how they were generated.
// Prisma uuid() creates UUIDs, but if someone injected an objectID it might still pass string validation.
// To be safe, we just validate it's a valid string of a certain length, or use exact regex.
const idSchema = z.string().min(10).max(40);

// 1. Patient Booking Schema
export const bookAppointmentSchema = z.object({
  doctorId: idSchema,
  date: z.string().or(z.date()).optional(), // Ignored by backend (Server generates logical date)
  location: z.string().min(2).max(100).optional(),
  isEmergency: z.boolean().optional().default(false),
  requestId: z.string().uuid().optional(),
});

// 2. Doctor Next Patient Schema
export const nextPatientSchema = z.object({
  currentTokenId: idSchema.optional().nullable(),
  skipCurrent: z.boolean().optional(),
});

// 3. Walk-in Schema
export const walkInSchema = z.object({
  patientName: z.string()
    .min(2, "Name must be at least 2 characters")
    .max(100)
    .regex(/^[a-zA-Z\s\.']+$/, "Name can only contain letters, spaces, dots and apostrophes")
    .optional()
    .nullable()
    .or(z.literal("")),
  phoneNumber: z.string()
    .max(15)
    .optional()
    .nullable()
    .refine((val) => !val || val.trim().length === 0 || /^\d{10}$/.test(val.trim()), {
      message: "Phone number must be exactly 10 digits",
    }),
  symptoms: z.string().max(500).optional().nullable(),
  location: z.string()
    .max(100)
    .optional()
    .nullable()
    .refine((val) => !val || val.trim().length === 0 || /^[a-zA-Z0-9\s\.,\-]+$/.test(val.trim()), {
      message: "Location contains invalid characters",
    }),
  age: z.number().int().min(0).max(150).optional().nullable(),
  gender: z.enum(["MALE", "FEMALE", "OTHER"]).optional().nullable(),
  isEmergency: z.boolean().optional(),
});

// 4. Doctor Onboarding Schema - Step 1 (Identity & Core)
export const step1OnboardSchema = z.object({
  fullName: z.string().min(3, "Name must be at least 3 characters").max(60).regex(/^[a-zA-Z\s\.]+$/, "Letters, spaces, and periods only."),
  gender: z.enum(["Male", "Female", "Other"]),
  dateOfBirth: z.string().or(z.date()).refine((val) => {
    const date = new Date(val);
    const today = new Date();
    let age = today.getFullYear() - date.getFullYear();
    const m = today.getMonth() - date.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < date.getDate())) age--;
    return age >= 22;
  }, "Must be at least 22 years of age"),
  contactNumber: z.string().regex(/^\d{10}$/, "Contact number must be exactly 10 digits"),
  email: z.string().email("Valid email is required"),
  password: z.string().min(6, "Password must be at least 6 characters").max(50),
  
  medicalRegistrationNumber: z.string().min(5, "At least 5 characters").max(30).regex(/^[a-zA-Z0-9\-\/\.\s]+$/, "Letters, numbers, hyphens, slashes, spaces and periods only"),
  medicalCouncil: z.string().min(2, "Council name is too short").max(150),
  registrationYear: z.number().int("Year must be a whole number").min(1960).max(new Date().getFullYear(), "Cannot be in the future"),
  specialization: z.string().min(2).max(100).regex(/^[a-zA-Z\s\-\/]+$/, "Letters, spaces, hyphens and slashes only"),
  experience: z.number().int().min(0).max(65),
  qualifications: z.string()
    .min(2, "Please enter valid medical qualifications.")
    .max(200)
    .regex(/^[a-zA-Z0-9\s\.,\(\)\-\/\&]+$/, "Contains invalid characters. Letters, numbers, spaces, commas, periods, hyphens, parentheses, slashes and ampersands only.")
    .regex(/[a-zA-Z]/, "Please enter valid medical qualifications (must contain letters)."),
  
  practiceName: z.string().min(2, "Practice/Hospital name is too short").max(150),
  practiceAddress: z.string().min(5, "Address is too short").max(300),
  locality: z.string().min(2, "Locality name is too short").max(100),
  district: z.string().min(2).max(100),
  city: z.string().min(2).max(100),
  state: z.string().min(2).max(100),
  pincode: z.string().regex(/^\d{6}$/, "Pincode must be exactly 6 digits"),
  latitude: z.number().optional().nullable(),
  longitude: z.number().optional().nullable(),
});

// 4b. Doctor Onboarding Schema - Step 2 (Enhancement)
export const step2OnboardSchema = z.object({
  profilePhotoUrl: z.string().url("Valid URL required").optional().nullable().or(z.literal("")),
  clinicPhotoUrl: z.string().url("Valid URL required").optional().nullable().or(z.literal("")),
  bio: z.string().max(1000, "Bio is too long").optional().nullable(),
  languages: z.string().max(200).optional().nullable(),
  fee: z.number().int().min(0).max(5000).optional(),
  emergencyAvailable: z.boolean().optional().default(false),
});

// Doctor Settings Update Schema
export const doctorSettingsSchema = z.object({
  bio: z.string().max(1000, "Bio is too long").optional().nullable(),
  fee: z.number().int("Fee must be a whole number").min(0, "Fee cannot be negative").max(5000, "Fee cannot exceed 5000 rupees").optional(),
  averageConsultationTime: z.number().int().min(5).max(180).optional(),
  name: z.string().min(3, "Name must be at least 3 characters").max(60, "Name is too long").regex(/^[a-zA-Z\s\.]+$/, "Name can only contain letters, spaces, and periods").optional(),
  regNumber: z.string().min(5, "Registration number must be at least 5 characters").max(30, "Registration number is too long").regex(/^[A-Z0-9\-]+$/, "Registration number must contain only uppercase letters, numbers, and hyphens").optional(),
  isClosedToday: z.boolean().optional(),
  maxCapacity: z.number().int().min(0).max(1000).optional(),
  pauseOnlineBooking: z.boolean().optional(),
  emergencySlots: z.number().int().min(0).max(100).optional(),
  emergencyAvailable: z.boolean().optional(),
  onlineConsultationAvailable: z.boolean().optional(),
  emergencyConsultationAvailable: z.boolean().optional(),
  status: z.enum(["AVAILABLE", "LIMITED_SLOTS", "SHORT_BREAK", "EMERGENCY_ONLY", "FULLY_BOOKED_AUTO", "CLINIC_CLOSED"]).optional(),
  statusReason: z.string().max(150, "Reason is too long").optional().nullable(),
  breakDuration: z.number().int().min(5).max(120).optional().nullable(),
  hospitalName: z.string().max(150).optional().nullable(),
  city: z.string().max(100).optional().nullable(),
  address: z.string().max(300).optional().nullable(),
  experience: z.number().int().min(0).max(65).optional().nullable(),
  qualifications: z.string()
    .max(300)
    .regex(/[a-zA-Z]/, "Please enter valid medical qualifications (must contain letters).")
    .optional()
    .nullable(),
});

export const verifyDoctorSchema = z.object({
  doctorId: idSchema,
  status: z.enum(["DRAFT", "PENDING", "PENDING_VERIFICATION", "VERIFIED", "UPDATE_PENDING", "REJECTED", "SUSPENDED"]),
  adminNotes: z.string().max(1000).optional().nullable(),
});

// 6. Admin Approve Profile Update Schema
export const approveUpdateSchema = z.object({
  logId: idSchema,
  action: z.enum(["APPROVE", "REJECT"]),
  adminNotes: z.string().max(1000).optional().nullable(),
});

// Helper for sending validation errors
export function formatZodError(error: any) {
  if (!error) return "Unknown Error";
  const issues = error.issues || error.errors;
  if (!issues || issues.length === 0) {
    if (typeof error.message === 'string') return error.message;
    return "Validation Error";
  }
  return issues.map((e: any) => `${e.path.join('.')}: ${e.message}`).join(', ');
}
