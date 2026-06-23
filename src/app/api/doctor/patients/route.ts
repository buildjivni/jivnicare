import { NextResponse, NextRequest } from "next/server";
import prisma from "@/lib/db/prisma";
import { verifyToken, AUTH_COOKIE } from "@/lib/jwt";
import { cookies } from "next/headers";
import { apiError } from "@/lib/utils/api-response";

export async function GET(request: NextRequest) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get(AUTH_COOKIE)?.value;

    if (!token) {
      return apiError("Unauthorized", 401);
    }

    const payload = await verifyToken(token);
    if (!payload || !payload.id || payload.role !== "DOCTOR") {
      return apiError("Unauthorized", 401);
    }

    const doctor = await prisma.doctor.findUnique({
      where: { userId: payload.id },
      select: { id: true }
    });

    if (!doctor) {
      return apiError("Doctor profile not found", 404);
    }

    const { searchParams } = new URL(request.url);
    const search = searchParams.get("search") || "";
    const page = parseInt(searchParams.get("page") || "1", 10);
    const limit = parseInt(searchParams.get("limit") || "10", 10);
    const skip = (page - 1) * limit;

    const whereClause: any = {
      queue: { doctorId: doctor.id },
    };

    if (search) {
      whereClause.OR = [
        { patientName: { contains: search, mode: "insensitive" } },
        { patientPhone: { contains: search } }
      ];
    }

    const [tokens, total] = await Promise.all([
      prisma.queueToken.findMany({
        where: whereClause,
        include: {
          queue: {
            select: {
              logicalDate: true
            }
          }
        },
        orderBy: {
          bookedAt: "desc"
        },
        skip,
        take: limit
      }),
      prisma.queueToken.count({ where: whereClause })
    ]);

    const patients = tokens.map(t => ({
      id: t.id,
      tokenNumber: t.tokenNumber,
      patientName: t.patientName || "Walk-in Patient",
      patientPhone: t.patientPhone,
      status: t.status,
      type: t.tokenType,
      date: t.queue.logicalDate,
      bookedAt: t.bookedAt.toISOString(),
      completedAt: t.completedAt ? t.completedAt.toISOString() : null,
    }));

    return NextResponse.json({
      success: true,
      patients,
      pagination: {
        total,
        page,
        limit,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error("[GET /api/doctor/patients]", error);
    return apiError("Internal server error", 500);
  }
}
