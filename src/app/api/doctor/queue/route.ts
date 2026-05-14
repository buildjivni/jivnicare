import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { verifyToken } from "@/lib/jwt";
import { cookies } from "next/headers";

export async function GET(request: Request) {
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

    // Get doctor record for this user
    const doctor = await prisma.doctor.findUnique({
      where: { userId: payload.id }
    });

    if (!doctor) {
      return NextResponse.json({ error: "Doctor profile not found" }, { status: 404 });
    }

    // Parse date from query params or default to today
    const url = new URL(request.url);
    const dateParam = url.searchParams.get("date");
    
    const queueDate = dateParam ? new Date(dateParam) : new Date();
    queueDate.setUTCHours(0, 0, 0, 0);

    // Fetch the daily queue for this doctor on this date
    let dailyQueue = await prisma.dailyQueue.findUnique({
      where: {
        doctorId_date: {
          doctorId: doctor.id,
          date: queueDate,
        },
      },
      include: {
        tokens: {
          include: {
            user: { select: { name: true, phone: true } },
            walkInEntry: true
          },
          orderBy: [
            { isEmergency: 'desc' },
            { tokenNumber: 'asc' }
          ]
        }
      }
    });

    // If it doesn't exist, they haven't had any bookings yet today. We can lazy-initialize it.
    if (!dailyQueue) {
      // Find operations to get max capacity
      const clinicOps = await prisma.clinicOperations.findUnique({ where: { doctorId: doctor.id } });
      const maxCapacity = clinicOps ? (clinicOps.walkInLimit + clinicOps.onlineLimit) : 40;

      dailyQueue = await prisma.dailyQueue.create({
        data: {
          doctorId: doctor.id,
          date: queueDate,
          status: "ACTIVE",
          maxCapacity
        },
        include: {
          tokens: {
            include: {
              user: { select: { name: true, phone: true } },
              walkInEntry: true
            }
          }
        }
      });
    }

    return NextResponse.json({ success: true, queue: dailyQueue, tokens: dailyQueue.tokens || [] });
  } catch (error: any) {
    console.error("Fetch doctor queue error:", error);
    return NextResponse.json({ error: "Failed to fetch queue" }, { status: 500 });
  }
}
