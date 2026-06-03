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

    const decoded: any = await verifyToken(token);
    if (!decoded || decoded.role !== "ADMIN") {
      return NextResponse.json({ error: "Forbidden: Admin access only" }, { status: 403 });
    }

    const url = new URL(req.url);
    const status = url.searchParams.get("status") || "ALL";
    const page = parseInt(url.searchParams.get("page") || "1", 10);
    const limit = parseInt(url.searchParams.get("limit") || "50", 10); // Standard dashboard limit
    const skip = (page - 1) * limit;

    const whereClause: any = {};
    if (status !== "ALL") {
      whereClause.verificationStatus = status;
    }

    // Parallel fetch for paginated items and total count
    const [doctors, totalCount] = await Promise.all([
      prisma.doctor.findMany({
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
        skip,
        take: limit,
      }),
      prisma.doctor.count({ where: whereClause })
    ]);

    // Fetch moderation logs separately and merge ONLY for the paginated subset
    const doctorIds = doctors.map((d) => d.id);
    const logsByDoctor: Record<string, any[]> = {};

    if (doctorIds.length > 0) {
      const moderationLogs = await prisma.moderationLog.findMany({
        where: { targetId: { in: doctorIds }, targetType: "DOCTOR" },
        orderBy: { createdAt: "desc" },
        include: { admin: { select: { name: true } } },
      });

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
    }

    const enrichedDoctors = doctors.map((d) => ({
      ...d,
      moderationHistory: logsByDoctor[d.id] || [],
    }));

    const totalPages = Math.ceil(totalCount / limit);

    return NextResponse.json({ 
      success: true,
      doctors: enrichedDoctors,
      pagination: {
        page,
        limit,
        totalCount,
        totalPages,
        hasNextPage: page < totalPages,
        hasPreviousPage: page > 1
      }
    });
  } catch (error) {
    console.error("GET Admin Doctors Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
