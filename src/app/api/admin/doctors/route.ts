import { NextResponse } from "next/server";
import prisma from "@/lib/db/prisma";
import { verifyToken } from "@/lib/jwt";
import { cookies } from "next/headers";

export async function GET(req: Request) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("auth-token")?.value;

    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const decoded: any = verifyToken(token);
    if (!decoded || decoded.role !== "ADMIN") {
      return NextResponse.json({ error: "Forbidden: Admin access only" }, { status: 403 });
    }

    const url = new URL(req.url);
    const status = url.searchParams.get("status") || "ALL";

    const whereClause: any = {};
    if (status !== "ALL") {
      whereClause.verificationStatus = status;
    }

    const doctors = await prisma.doctor.findMany({
      where: whereClause,
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
            role: true,
          },
        },
        clinicOperations: true,
        specialties: { select: { name: true, slug: true } },
        updateLogs: {
          where: { status: "PENDING" }
        }
      },
      orderBy: { createdAt: "desc" },
    });

    // Fetch moderation logs separately and merge (avoids prisma nested relation conflict)
    const doctorIds = doctors.map((d) => d.id);
    const moderationLogs = await prisma.moderationLog.findMany({
      where: { targetId: { in: doctorIds }, targetType: "DOCTOR" },
      orderBy: { createdAt: "desc" },
      include: { admin: { select: { name: true } } },
    });

    // Build a map of doctorId → latest moderation logs
    const logsByDoctor: Record<string, any[]> = {};
    for (const log of moderationLogs) {
      if (!logsByDoctor[log.targetId]) logsByDoctor[log.targetId] = [];
      if (logsByDoctor[log.targetId].length < 3) {
        logsByDoctor[log.targetId].push({
          action: log.action,
          reason: log.reason,
          createdAt: log.createdAt,
          adminName: log.admin?.name || "Admin",
        });
      }
    }

    const enrichedDoctors = doctors.map((d) => ({
      ...d,
      moderationHistory: logsByDoctor[d.id] || [],
    }));

    return NextResponse.json({ doctors: enrichedDoctors });
  } catch (error) {
    console.error("GET Admin Doctors Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
