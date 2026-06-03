import { NextResponse } from "next/server";
import prisma from "@/lib/db/prisma";
import { verifyToken } from "@/lib/jwt";
import { cookies } from "next/headers";
import { resolveClinicLogicalDay } from "@/lib/utils/clinic-utils";

export async function GET() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("auth-token")?.value;

    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const decoded: any = await verifyToken(token);
    if (!decoded || decoded.role !== "ADMIN") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const today = resolveClinicLogicalDay();

    // 1. Queue Token Status Aggregations for Today
    const tokenAggregations = await prisma.queueToken.groupBy({
      by: ['status'],
      where: {
        queue: { date: today }
      },
      _count: {
        id: true,
      },
    });

    let todayWaiting = 0;
    let todayInConsultation = 0;
    let todayCompleted = 0;
    let todayNoShow = 0;
    let todayTotal = 0;

    tokenAggregations.forEach(group => {
      todayTotal += group._count.id;
      if (group.status === "WAITING") todayWaiting = group._count.id;
      if (group.status === "IN_CONSULTATION") todayInConsultation = group._count.id;
      if (group.status === "COMPLETED") todayCompleted = group._count.id;
      if (group.status === "NO_SHOW") todayNoShow = group._count.id;
    });

    const activePatientsToday = todayWaiting + todayInConsultation;

    // 2. Active Clinics / Queues today
    const activeQueues = await prisma.dailyQueue.count({
      where: { date: today, status: "ACTIVE" },
    });

    // 3. Verified Doctors
    const verifiedDoctors = await prisma.doctor.count({
      where: { verificationStatus: "VERIFIED" }
    });

    const stats = {
      operations: {
        todaysBookings: todayTotal,
        activePatients: activePatientsToday,
        completed: todayCompleted,
        noShows: todayNoShow,
        runningQueues: activeQueues,
        verifiedDoctors: verifiedDoctors
      }
    };

    return NextResponse.json({ success: true, stats });
  } catch (error) {
    console.error("Admin Stats API Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
