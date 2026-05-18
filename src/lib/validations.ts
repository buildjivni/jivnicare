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
  date: z.string().datetime().or(z.date()), // Next.js API parses it as a string usually
  location: z.string().min(2).max(100).optional(),
  isEmergency: z.boolean().optional().default(false),
});

// 2. Doctor Next Patient Schema
export const nextPatientSchema = z.object({
  currentTokenId: idSchema.optional().nullable(),
  skipCurrent: z.boolean().optional(),
});

// 3. Walk-in Schema
export const walkInSchema = z.object({
  patientName: z.string().min(2).max(100),
  phoneNumber: z.string().min(10).max(15).optional().nullable(),
  symptoms: z.string().max(500).optional().nullable(),
  location: z.string().max(100).optional().nullable(),
});

// 4. Doctor Onboarding Schema
export const doctorOnboardSchema = z.object({
  fullName: z.string().min(2, "Name must be at least 2 characters").max(100, "Name is too long").regex(/^[a-zA-Z\s\.]+$/, "Name must contain only letters, spaces, and periods"),
  gender: z.enum(["Male", "Female", "Other", ""]),
  specialization: z.string().min(2, "Specialization must be at least 2 characters").max(100).regex(/^[a-zA-Z\s\-]+$/, "Specialization must contain only letters, spaces, and hyphens"),
  qualifications: z.string().min(2, "Qualifications must be at least 2 characters").max(200).regex(/^[a-zA-Z\s\.,\(\)]+$/, "Qualifications must contain only letters, spaces, commas, and parentheses"),
  experience: z.number().int("Experience must be a whole number").min(0, "Experience cannot be negative").max(80, "Experience cannot exceed 80 years"),
  languages: z.string().min(2, "Languages list is required").max(200),
  fee: z.number().int("Fee must be a whole number").min(0, "Fee cannot be negative").max(100000, "Fee is too high"),
  bio: z.string().max(1000, "Bio is too long").optional().nullable(),
  practiceType: z.enum(["clinic", "hospital"]),
  practiceName: z.string().min(2, "Practice/Hospital name is too short").max(150),
  practiceAddress: z.string().max(300).optional().nullable(),
  city: z.string().min(2, "City name is too short").max(100),
  locality: z.string().min(2, "Locality name is too short").max(100),
  contactNumber: z.string().regex(/^\d{10}$/, "Contact number must be exactly 10 digits").optional().nullable().or(z.literal("")),
  profilePhotoUrl: z.string().url("Profile photo must be a valid URL").optional().nullable().or(z.literal("")),
  medicalRegistrationUrl: z.string().min(2, "Registration identifier is required").optional().nullable().or(z.literal("")),
  clinicPhotoUrl: z.string().url("Clinic photo must be a valid URL").optional().nullable().or(z.literal("")),
});

// Doctor Settings Update Schema
export const doctorSettingsSchema = z.object({
  bio: z.string().max(1000, "Bio is too long").optional().nullable(),
  fee: z.number().int("Fee must be a whole number").min(0, "Fee cannot be negative").max(100000).optional(),
  averageConsultationTime: z.number().int().min(5).max(180).optional(),
  name: z.string().min(2, "Name must be at least 2 characters").max(100).regex(/^[a-zA-Z\s\.]+$/, "Name can only contain letters, spaces, and periods").optional(),
  regNumber: z.string().min(2, "Registration number must be at least 2 characters").max(100).optional(),
  isClosedToday: z.boolean().optional(),
  maxCapacity: z.number().int().min(0).max(1000).optional(),
  pauseOnlineBooking: z.boolean().optional(),
  emergencySlots: z.number().int().min(0).max(100).optional(),
  emergencyAvailable: z.boolean().optional(),
  onlineConsultationAvailable: z.boolean().optional(),
  emergencyConsultationAvailable: z.boolean().optional(),
});

// 5. Admin Verify Doctor Schema
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
  if (!error || !error.errors) return "Validation Error";
  return error.errors.map((e: any) => `${e.path.join('.')}: ${e.message}`).join(', ');
}
