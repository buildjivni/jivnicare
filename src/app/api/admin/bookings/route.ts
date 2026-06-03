import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db/prisma";
import { verifyToken } from "@/lib/jwt";
import { cookies } from "next/headers";
import { resolveClinicLogicalDay } from "@/lib/utils/clinic-utils";

export async function GET(request: NextRequest) {
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

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1", 10);
    const limit = parseInt(searchParams.get("limit") || "20", 10);
    const search = searchParams.get("search") || "";
    const skip = (page - 1) * limit;

    let whereClause: any = {};
    if (search) {
      whereClause = {
        OR: [
          { id: { contains: search, mode: "insensitive" } },
          { user: { phone: { contains: search, mode: "insensitive" } } },
          { user: { name: { contains: search, mode: "insensitive" } } },
          { walkInEntry: { patientName: { contains: search, mode: "insensitive" } } },
          { queue: { doctor: { name: { contains: search, mode: "insensitive" } } } },
          { queue: { doctor: { clinicName: { contains: search, mode: "insensitive" } } } },
        ]
      };
      
      // If search is a pure number it might be a tokenNumber
      if (!isNaN(Number(search))) {
         whereClause.OR.push({ tokenNumber: Number(search) });
      }
    }

    const [recentBookings, total] = await Promise.all([
      prisma.queueToken.findMany({
        where: whereClause,
        skip,
        take: limit,
        orderBy: { tokenIssuedAt: 'desc' },
        include: {
          queue: {
            include: {
              doctor: {
                select: { name: true, hospitalName: true, clinicName: true }
              }
            }
          },
          user: { select: { name: true, phone: true } },
          walkInEntry: { select: { patientName: true } }
        }
      }),
      prisma.queueToken.count({ where: whereClause })
    ]);

    const formattedBookings = recentBookings.map(b => ({
      id: b.id, // Support might need full ID
      shortId: b.id.slice(-8).toUpperCase(),
      patient: b.user?.name || b.walkInEntry?.patientName || "Walk-in Patient",
      phone: b.user?.phone || "N/A",
      tokenNumber: b.tokenNumber,
      doctor: b.queue.doctor.name,
      clinic: b.queue.doctor.clinicName || b.queue.doctor.hospitalName,
      issuedAt: b.tokenIssuedAt.toISOString(),
      status: b.status,
    }));

    return NextResponse.json({ 
      success: true, 
      bookings: formattedBookings,
      pagination: {
        total,
        pages: Math.ceil(total / limit),
        current: page
      }
    });
  } catch (error) {
    console.error("Admin Bookings API Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
