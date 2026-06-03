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
      const token = cookieStore.get("auth-token")?.value;

      if (!token) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
      }

      const payload: any = await verifyToken(token);
      if (!payload || !payload.id || payload.role !== "DOCTOR") {
        return NextResponse.json({ error: "Invalid token or not a doctor" }, { status: 401 });
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
        return NextResponse.json({ error: "Doctor profile not found" }, { status: 404 });
      }

      // Phase 1 & 7: Use Unified Service Logic
      const today = resolveClinicLogicalDay();

      try {
        const result = await prisma.$transaction(async (tx) => {
          // Create WalkInEntry first with placeholder if empty
          const walkInEntry = await tx.walkInEntry.create({
            data: {
              patientName: patientName || "Processing...",
              phoneNumber: phoneNumber || null,
              symptoms: symptoms || null,
              age: age || null,
              gender: gender || null,
              isEmergency: isEmergency || false,
            }
          });

          // Use Service for sequential token issuing and capacity checks.
          const { token: newQueueToken, isEmergencyOverride } = await QueueService.issueToken(doctor.id, today, null, "WALK_IN", location || undefined, isEmergency || false, tx);
          
          let finalPatientName = patientName;
          let finalSymptoms = symptoms || null;

          if (!finalPatientName) {
            finalPatientName = isEmergency ? `Emergency #${newQueueToken.tokenNumber}` : `Walk-in #${newQueueToken.tokenNumber}`;
          }

          if (isEmergencyOverride) {
            finalPatientName = patientName ? `${patientName} (Emergency Override)` : `Emergency Override #${newQueueToken.tokenNumber}`;
            finalSymptoms = finalSymptoms ? `${finalSymptoms} [SYSTEM_AUDIT: CLINIC_CLOSED_OVERRIDE]` : `[SYSTEM_AUDIT: CLINIC_CLOSED_OVERRIDE]`;
          }

          // Update WalkInEntry with correct name and audit tags
          await tx.walkInEntry.update({
            where: { id: walkInEntry.id },
            data: { patientName: finalPatientName, symptoms: finalSymptoms }
          });

          // Link the walk-in entry to the token
          const updatedToken = await tx.queueToken.update({
            where: { id: newQueueToken.id },
            data: { walkInEntryId: walkInEntry.id },
            include: { walkInEntry: true }
          });

          return updatedToken;
        });

        return NextResponse.json({ success: true, token: result });
      } catch (error: any) {
        import('@/lib/telemetry/redis').then(m => m.incrementTelemetryCounter('walkInFailures').catch(() => {}));
        const errorMessages: Record<string, string> = {
          "QUEUE_FULL": "Cannot add patient. Daily capacity reached.",
          "CLINIC_CLOSED_TODAY": "Clinic is marked as closed today.",
        };
        return NextResponse.json({ error: errorMessages[error.message] || "Failed to add walk-in patient" }, { status: 400 });
      }
    } catch (error: any) {
      console.error("Walk-in booking error:", error);
      import('@/lib/telemetry/redis').then(m => m.incrementTelemetryCounter('api500Errors').catch(() => {}));
      return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
  });
}
