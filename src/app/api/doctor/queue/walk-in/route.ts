import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { verifyToken } from "@/lib/jwt";
import { cookies } from "next/headers";
import { getCurrentLogicalDay } from "@/lib/clinic-utils";
import { QueueService } from "@/services/queueService";
import { walkInSchema, formatZodError } from "@/lib/validations";

export async function POST(request: Request) {
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

    const { patientName, phoneNumber, symptoms, location } = validation.data;

    const doctor = await prisma.doctor.findUnique({
      where: { userId: payload.id }
    });

    if (!doctor) {
      return NextResponse.json({ error: "Doctor profile not found" }, { status: 404 });
    }

    // Phase 1 & 7: Use Unified Service Logic
    const today = getCurrentLogicalDay();

    try {
      const result = await prisma.$transaction(async (tx) => {
        // Create WalkInEntry first
        const walkInEntry = await tx.walkInEntry.create({
          data: {
            patientName,
            phoneNumber,
            symptoms
          }
        });

        // Use Service for sequential token issuing and capacity checks.
        // Pass `tx` to ensure mathematical safety and rollback WalkInEntry if queue is full.
        const newQueueToken = await QueueService.issueToken(doctor.id, today, null, "WALK_IN", location || undefined, tx);
        
        // Link the walk-in entry to the token (Service issues generic WALK_IN tokens)
        const updatedToken = await tx.queueToken.update({
          where: { id: newQueueToken.id },
          data: { walkInEntryId: walkInEntry.id },
          include: { walkInEntry: true }
        });

        return updatedToken;
      });

      return NextResponse.json({ success: true, token: result });
    } catch (error: any) {
      const errorMessages: Record<string, string> = {
        "QUEUE_FULL": "Cannot add patient. Daily capacity reached.",
        "CLINIC_CLOSED_TODAY": "Clinic is marked as closed today.",
      };
      return NextResponse.json({ error: errorMessages[error.message] || "Failed to add walk-in patient" }, { status: 400 });
    }
  } catch (error: any) {
    console.error("Walk-in booking error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
