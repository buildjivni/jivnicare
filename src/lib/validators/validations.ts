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
  phoneNumber: z.string().regex(/^[6-9]\d{9}$/, "Patient ka phone number required hai"),
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
  contactNumber: z.string().regex(/^[6-9]\d{9}$/, "Contact number must be 10 digits starting with 6-9"),
  speciality: z.string().min(2).max(100).regex(/^[a-zA-Z\s\-\/\&]+$/, "Letters, spaces, hyphens, slashes, and ampersands only"),
});

// 4b. Doctor Onboarding Schema - Step 2 (Clinic Information)
export const step2OnboardSchema = z.object({
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

// 4c. Doctor Onboarding Schema - Step 3 (Professional Credentials)
export const step3OnboardSchema = z.object({
  qualifications: z.string()
    .min(2, "Please enter valid medical qualifications.")
    .max(200)
    .regex(/^[a-zA-Z0-9\s\.,\(\)\-\/\&]+$/, "Contains invalid characters.")
    .regex(/[a-zA-Z]/, "Please enter valid medical qualifications (must contain letters)."),
  experience: z.number().int().min(0).max(65),
  medicalRegistrationNumber: z.string().min(5, "At least 5 characters").max(30).regex(/^[a-zA-Z0-9\-\/\.\s]+$/, "Letters, numbers, hyphens, slashes, spaces and periods only"),
  medicalCouncil: z.string().min(2, "Council name is too short").max(150),
  registrationYear: z.number().int("Year must be a whole number").min(1960).max(new Date().getFullYear(), "Cannot be in the future"),
  specialization: z.string().min(2).max(100).regex(/^[a-zA-Z\s\-\/\&]+$/, "Letters, spaces, hyphens, slashes, and ampersands only"),
  degreeCertificate: z.string().url("Valid Degree Certificate URL required"),
  nmcCertificate: z.string().url("Valid NMC Certificate URL required"),
  clinicPhotos: z.array(z.string().url("Invalid URL")).max(3).optional().default([]),
  otherCertificates: z.array(z.string().url("Invalid URL")).max(10).optional().default([]),
  languages: z.string().max(200).optional().nullable(),
  bio: z.string().max(1000, "Bio is too long").optional().nullable(),
  gender: z.enum(["Male", "Female", "Other"]).optional().nullable(),
  dateOfBirth: z.string().or(z.date()).optional().nullable(),
  email: z.string().email("Valid email is required").optional().nullable(),
  lifetimePatientsDeclaration: z.number().int().min(0).max(1000000).optional().nullable(),
});

// 4d. Doctor Onboarding Schema - Step 4 (Schedule & Pricing)
export const step4OnboardSchema = z.object({
  weeklySchedule: z.object({
    monday: z.object({ isOpen: z.boolean(), start: z.string(), end: z.string(), maxPatients: z.number() }),
    tuesday: z.object({ isOpen: z.boolean(), start: z.string(), end: z.string(), maxPatients: z.number() }),
    wednesday: z.object({ isOpen: z.boolean(), start: z.string(), end: z.string(), maxPatients: z.number() }),
    thursday: z.object({ isOpen: z.boolean(), start: z.string(), end: z.string(), maxPatients: z.number() }),
    friday: z.object({ isOpen: z.boolean(), start: z.string(), end: z.string(), maxPatients: z.number() }),
    saturday: z.object({ isOpen: z.boolean(), start: z.string(), end: z.string(), maxPatients: z.number() }),
    sunday: z.object({ isOpen: z.boolean(), start: z.string(), end: z.string(), maxPatients: z.number() }),
  }),
  dailyPatientLimit: z.number().int().min(1).max(100),
  consultationFee: z.number().int().min(0).max(2000),
  emergencyAvailable: z.boolean(),
  emergencyFee: z.number().int().min(0).max(2000).optional().nullable(),
  bookingStartTime: z.string(),
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
