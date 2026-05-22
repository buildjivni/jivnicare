import { NextResponse } from "next/server";
import prisma from "@/lib/db/prisma";
import { verifyToken } from "@/lib/jwt";
import { cookies } from "next/headers";
import { getCurrentLogicalDay } from "@/lib/utils/clinic-utils";

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

    // 1. Doctor Counts by verification status
    const doctorStats = await prisma.doctor.groupBy({
      by: ["verificationStatus"],
      _count: true,
    });

    // 2. Today's bookings
    const todayBookings = await prisma.queueToken.count({
      where: { tokenIssuedAt: { gte: today } },
    });

    // 3. Total patients
    const totalPatients = await prisma.user.count({ where: { role: "PATIENT" } });

    // 4. Active queues today
    const activeQueues = await prisma.dailyQueue.count({
      where: { date: today, status: "ACTIVE" },
    });

    // 5. Emergency-enabled clinics (has emergencySlots > 0)
    const emergencyEnabledClinics = await prisma.clinicOperations.count({
      where: { emergencySlots: { gt: 0 } },
    });

    // 6. Lead counts (graceful — returns 0 if table is empty)
    let totalLeads = 0;
    let doctorLeads = 0;
    let patientLeads = 0;
    let newLeads7d = 0;
    try {
      const sevenDaysAgo = new Date(today);
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

      [totalLeads, doctorLeads, patientLeads, newLeads7d] = await Promise.all([
        prisma.leadCapture.count(),
        prisma.leadCapture.count({ where: { roleInterest: "DOCTOR" } }),
        prisma.leadCapture.count({ where: { roleInterest: "PATIENT" } }),
        prisma.leadCapture.count({ where: { createdAt: { gte: sevenDaysAgo } } }),
      ]);
    } catch { /* LeadCapture table may be empty */ }

    // 7. Recent moderation actions (last 7 days)
    const recentModerations = await prisma.moderationLog.count({
      where: { createdAt: { gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) } },
    });

    const stats = {
      doctors: {
        verified: doctorStats.find((s) => s.verificationStatus === "VERIFIED")?._count || 0,
        pending: doctorStats.find((s) => s.verificationStatus === "PENDING")?._count || 0,
        rejected: doctorStats.find((s) => s.verificationStatus === "REJECTED")?._count || 0,
        suspended: doctorStats.find((s) => s.verificationStatus === "SUSPENDED")?._count || 0,
        total: doctorStats.reduce((acc, curr) => acc + curr._count, 0),
      },
      bookings: { today: todayBookings },
      patients: { total: totalPatients },
      queues: { active: activeQueues },
      emergency: { enabledClinics: emergencyEnabledClinics },
      leads: {
        total: totalLeads,
        doctorLeads,
        patientLeads,
        newLast7Days: newLeads7d,
      },
      moderation: { recentActions: recentModerations },
    };

    return NextResponse.json({ success: true, stats });
  } catch (error) {
    console.error("Admin Stats API Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
