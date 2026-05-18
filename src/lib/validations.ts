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

// 4. Doctor Onboarding/Update Schema (Safety limits)
export const doctorOnboardSchema = z.object({
  name: z.string().min(2).max(100),
  hospitalName: z.string().min(2).max(150),
  district: z.string().min(2).max(100),
  experience: z.number().int().min(0).max(100).optional(),
  fee: z.number().int().min(0).max(100000).optional(),
  bio: z.string().max(1000).optional().nullable(),
  gender: z.enum(["Male", "Female", "Other"]).optional().nullable(),
  specialtyIds: z.array(z.string()).max(10).optional(),
  treatmentFocus: z.array(z.string().max(100)).max(20).optional(),
});

// Helper for sending validation errors
export function formatZodError(error: any) {
  if (!error || !error.errors) return "Validation Error";
  return error.errors.map((e: any) => `${e.path.join('.')}: ${e.message}`).join(', ');
}
