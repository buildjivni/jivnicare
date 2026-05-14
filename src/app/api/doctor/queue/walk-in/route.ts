import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { verifyToken } from "@/lib/jwt";
import { cookies } from "next/headers";

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
    const { patientName, phoneNumber, symptoms } = body;

    if (!patientName) {
      return NextResponse.json({ error: "Patient name is required" }, { status: 400 });
    }

    const doctor = await prisma.doctor.findUnique({
      where: { userId: payload.id }
    });

    if (!doctor) {
      return NextResponse.json({ error: "Doctor profile not found" }, { status: 404 });
    }

    // Queue logic runs in a transaction
    const today = new Date();
    today.setUTCHours(0, 0, 0, 0);

    const result = await prisma.$transaction(async (tx) => {
      let dailyQueue = await tx.dailyQueue.findUnique({
        where: {
          doctorId_date: {
            doctorId: doctor.id,
            date: today,
          },
        },
      });

      if (!dailyQueue) {
        dailyQueue = await tx.dailyQueue.create({
          data: {
            doctorId: doctor.id,
            date: today,
            maxCapacity: 50,
          },
        });
      }

      const tokensCount = await tx.queueToken.count({
        where: { queueId: dailyQueue.id },
      });

      const nextTokenNumber = tokensCount + 1;

      // Create WalkInEntry
      const walkInEntry = await tx.walkInEntry.create({
        data: {
          patientName,
          phoneNumber,
          symptoms
        }
      });

      // Create QueueToken
      const newQueueToken = await tx.queueToken.create({
        data: {
          queueId: dailyQueue.id,
          tokenNumber: nextTokenNumber,
          source: "WALK_IN",
          status: "WAITING",
          walkInEntryId: walkInEntry.id,
        },
        include: {
          walkInEntry: true
        }
      });

      return newQueueToken;
    });

    return NextResponse.json({ success: true, token: result });
  } catch (error: any) {
    console.error("Walk-in booking error:", error);
    return NextResponse.json({ error: "Failed to add walk-in patient" }, { status: 500 });
  }
}
