import { apiResponse, apiError } from '@/lib/utils/api-response';
import { NextResponse } from "next/server";
import prisma from "@/lib/db/prisma";
import { verifyToken } from "@/lib/jwt";
import { cookies } from "next/headers";
import { decrypt } from "@/lib/crypto";

export async function GET(req: Request) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("jivnicare_token")?.value;

    if (!token) {
      return apiError("Unauthorized", 401);
    }

    const decoded: any = await verifyToken(token);
    if (!decoded || decoded.role !== "ADMIN") {
      return apiError("Forbidden: Admin access only", 403);
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
          }
        },
        orderBy: { createdAt: "desc" },
        skip,
        take: limit,
      }),
      prisma.doctor.count({ where: whereClause })
    ]);

    // Fetch moderation logs (from AuditLog) separately and merge ONLY for the paginated subset
    const doctorIds = doctors.map((d) => d.id);
    const logsByDoctor: Record<string, any[]> = {};

    if (doctorIds.length > 0) {
      const moderationLogs = await prisma.auditLog.findMany({
        where: { entityId: { in: doctorIds }, entityType: "Doctor" },
        orderBy: { createdAt: "desc" },
        include: { user: { select: { name: true } } },
      });

      for (const log of moderationLogs) {
        if (log.entityId) {
          if (!logsByDoctor[log.entityId]) logsByDoctor[log.entityId] = [];
          if (logsByDoctor[log.entityId].length < 3) {
            logsByDoctor[log.entityId].push({
              action: log.action,
              reason: log.newValue ? String(log.newValue) : "",
              createdAt: log.createdAt,
              adminName: log.user?.name || "Admin",
            });
          }
        }
      }
    }

    const enrichedDoctors = doctors.map((d) => ({
      ...d,
      user: d.user ? { ...d.user, phone: decrypt(d.user.phone) } : null,
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
        hasPrevPage: page > 1
      }
    });
  } catch (error) {
    console.error("Admin Doctors API Error:", error);
    return apiError("Internal Server Error", 500);
  }
}
