import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { verifyToken } from "@/lib/jwt";
import { cookies } from "next/headers";
import { getCurrentLogicalDay } from "@/lib/clinic-utils";
import { nextPatientSchema, formatZodError } from "@/lib/validations";

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

    const doctor = await prisma.doctor.findUnique({
      where: { userId: payload.id }
    });

    if (!doctor) {
      return NextResponse.json({ error: "Doctor profile not found" }, { status: 404 });
    }

    const body = await request.json();
    
    // Strict Payload Validation
    const validation = nextPatientSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        { error: "Invalid payload: " + formatZodError(validation.error) }, 
        { status: 400 }
      );
    }

    const { currentTokenId, skipCurrent } = validation.data;

    // Atomic transaction for strict queue progression
    const result = await prisma.$transaction(async (tx) => {
      // 1. Complete or Skip the current patient if ID provided
      if (currentTokenId) {
        // Strict verification: updateMany allows atomic where clauses on non-unique fields
        await tx.queueToken.updateMany({
          where: { 
            id: currentTokenId,
            status: "IN_CONSULTATION" // Must currently be in consultation
          },
          data: { status: skipCurrent ? "SKIPPED" : "COMPLETED" }
        });
      }

      // 2. Find the next WAITING patient in strict sequential order
      const today = getCurrentLogicalDay();

      const dailyQueue = await tx.dailyQueue.findUnique({
        where: { doctorId_date: { doctorId: doctor.id, date: today } }
      });

      if (!dailyQueue) {
        throw new Error("QUEUE_NOT_FOUND");
      }

      const nextPatient = await tx.queueToken.findFirst({
        where: { 
          queueId: dailyQueue.id, 
          status: "WAITING" 
        },
        orderBy: { tokenNumber: "asc" }
      });

      // 3. Atomically lock and mark the next patient as IN_CONSULTATION
      if (nextPatient) {
        // Use updateMany to ensure we only update if NO OTHER concurrent request already changed it
        const updateResult = await tx.queueToken.updateMany({
          where: { 
            id: nextPatient.id,
            status: "WAITING" // Crucial concurrency lock
          },
          data: { status: "IN_CONSULTATION" }
        });

        // Only update dailyQueue if we successfully acquired the lock
        if (updateResult.count > 0) {
          await tx.dailyQueue.update({
            where: { id: dailyQueue.id },
            data: { currentActiveToken: nextPatient.tokenNumber }
          });
          
          return { nextPatient: { ...nextPatient, status: "IN_CONSULTATION" } };
        } else {
          // A concurrent request beat us to it, throw an error to retry or abort cleanly
          throw new Error("CONCURRENCY_CONFLICT_RETRY");
        }
      }

      return { nextPatient: null };
    });

    return NextResponse.json({ success: true, data: result });
  } catch (error: any) {
    console.error("Next patient operation error:", error);
    if (error.message === "CONCURRENCY_CONFLICT_RETRY") {
      return NextResponse.json({ error: "Queue was updated concurrently, please refresh" }, { status: 409 });
    }
    return NextResponse.json({ error: error.message || "Failed to progress queue" }, { status: 500 });
  }
}
