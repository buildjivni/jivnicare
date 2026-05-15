import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { verifyToken } from "@/lib/jwt";
import { cookies } from "next/headers";
import { getCurrentLogicalDay } from "@/lib/clinic-utils";

export async function GET() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("auth-token")?.value;

    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const decoded: any = verifyToken(token);
    if (!decoded || decoded.role !== "ADMIN") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const today = getCurrentLogicalDay();

    // 1. Doctor Counts
    const doctorStats = await prisma.doctor.groupBy({
      by: ['verificationStatus'],
      _count: true
    });

    // 2. Booking Counts (Today)
    const todayBookings = await prisma.queueToken.count({
      where: {
        tokenIssuedAt: {
          gte: today
        }
      }
    });

    // 3. User Counts
    const totalPatients = await prisma.user.count({
      where: { role: "PATIENT" }
    });

    // 4. Active Queues
    const activeQueues = await prisma.dailyQueue.count({
      where: {
        date: today,
        status: "ACTIVE"
      }
    });

    const stats = {
      doctors: {
        verified: doctorStats.find(s => s.verificationStatus === 'VERIFIED')?._count || 0,
        pending: doctorStats.find(s => s.verificationStatus === 'PENDING')?._count || 0,
        rejected: doctorStats.find(s => s.verificationStatus === 'REJECTED')?._count || 0,
        suspended: doctorStats.find(s => s.verificationStatus === 'SUSPENDED')?._count || 0,
        total: doctorStats.reduce((acc, curr) => acc + curr._count, 0)
      },
      bookings: {
        today: todayBookings
      },
      patients: {
        total: totalPatients
      },
      queues: {
        active: activeQueues
      }
    };

    return NextResponse.json({ success: true, stats });
  } catch (error) {
    console.error("Admin Stats API Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
