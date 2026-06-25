import { apiResponse, apiError } from '@/lib/utils/api-response';
import { NextResponse } from "next/server";
import prisma from "@/lib/db/prisma";
import { verifyToken } from "@/lib/jwt";
import { cookies } from "next/headers";
import { resolveClinicLogicalDay } from "@/lib/utils/clinic-utils";
import { QueueService } from "@/features/queue/services/queueService";
import { walkInSchema, formatZodError } from "@/lib/validators/validations";
import { withIdempotency } from "@/lib/infrastructure/idempotency";

export async function POST(request: Request) {
  const idempotencyKey = request.headers.get("Idempotency-Key");

  return await withIdempotency(idempotencyKey, 86400, async () => {
    try {
      const cookieStore = await cookies();
      const token = cookieStore.get("jivnicare_token")?.value;

      if (!token) {
        return apiError("Unauthorized", 401);
      }

      const payload: any = await verifyToken(token);
      if (!payload || !payload.id || payload.role !== "DOCTOR") {
        return apiError("Invalid token or not a doctor", 401);
      }

      const body = await request.json();
      
      // Strict Payload Validation
      const validation = walkInSchema.safeParse(body);
      if (!validation.success) {
        return NextResponse.json(
          { error: "Invalid payload: " + formatZodError(validation.error) }, 
          { status: 400 }
        );
      }

      const { patientName, phoneNumber, symptoms, location, age, gender, isEmergency } = validation.data;

      const doctor = await prisma.doctor.findUnique({
        where: { userId: payload.id }
      });

      if (!doctor) {
        return apiError("Doctor profile not found", 404);
      }

      // Phase 1 & 7: Use Unified Service Logic
      const today = resolveClinicLogicalDay();

      try {
        const result = await prisma.$transaction(async (tx) => {
          // Use Service for sequential token issuing and capacity checks.
          const { token: newQueueToken } = await QueueService.issueToken(
            doctor.id, 
            null, 
            phoneNumber || "", 
            isEmergency ? "EMERGENCY" : "WALKIN", 
            patientName || undefined, 
            tx
          );
          
          const notesObj = {
            symptoms: symptoms || null,
            age: age || null,
            gender: gender || null,
          };

          // Link the walk-in details to the token
          const updatedToken = await tx.queueToken.update({
            where: { id: newQueueToken.id },
            data: {
              walkinAddress: location || null,
              internalNotes: JSON.stringify(notesObj)
            }
          });

          return updatedToken;
        });

        return apiResponse({success: true, token: result});
      } catch (error: any) {
        import('@/lib/telemetry/redis').then(m => m.incrementTelemetryCounter('walkInFailures').catch(() => {}));
        const errorMessages: Record<string, string> = {
          "QUEUE_FULL": "Cannot add patient. Daily capacity reached.",
          "CLINIC_CLOSED_TODAY": "Clinic is marked as closed today.",
        };
        return apiError(errorMessages[error.message] || "Failed to add walk-in patient", 400);
      }
    } catch (error: any) {
      console.error("Walk-in booking error:", error);
      import('@/lib/telemetry/redis').then(m => m.incrementTelemetryCounter('api500Errors').catch(() => {}));
      return apiError("Internal server error", 500);
    }
  });
}
