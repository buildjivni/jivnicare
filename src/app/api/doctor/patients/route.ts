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
        { walkinName: { contains: search, mode: "insensitive" } },
        { walkinPhone: { contains: search } },
        {
          patient: {
            OR: [
              { name: { contains: search, mode: "insensitive" } },
              { phone: { contains: search } }
            ]
          }
        }
      ];
    }

    const [tokens, total] = await Promise.all([
      prisma.queueToken.findMany({
        where: whereClause,
        include: {
          queue: {
            select: {
              date: true
            }
          },
          patient: {
            select: {
              name: true,
              phone: true
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

    const { decrypt } = require("@/lib/crypto");
    const patients = tokens.map(t => {
      let name = "Walk-in Patient";
      let phone = "";
      if (t.type === "WALKIN") {
        name = t.walkinName || "Walk-in Patient";
        phone = t.walkinPhone || "";
      } else if (t.patient) {
        name = t.patient.name || "Patient";
        if (t.patient.phone) {
          try {
            phone = decrypt(t.patient.phone);
          } catch (e) {
            phone = t.patient.phone;
          }
        }
      }
      return {
        id: t.id,
        tokenNumber: t.tokenNumber,
        patientName: name,
        patientPhone: phone,
        status: t.status,
        type: t.type,
        date: t.queue.date,
        bookedAt: t.bookedAt.toISOString(),
        completedAt: t.completedAt ? t.completedAt.toISOString() : null,
      };
    });

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
