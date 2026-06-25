import { apiResponse, apiError } from '@/lib/utils/api-response';
import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db/prisma";
import { verifyToken } from "@/lib/jwt";
import { cookies } from "next/headers";
import { decrypt, hashPhone } from "@/lib/crypto";
import { resolveClinicLogicalDay } from "@/lib/utils/clinic-utils";

export async function GET(request: NextRequest) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("jivnicare_token")?.value;

    if (!token) {
      return apiError("Unauthorized", 401);
    }

    const decoded: any = await verifyToken(token);
    if (!decoded || decoded.role !== "ADMIN") {
      return apiError("Forbidden", 403);
    }

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1", 10);
    const limit = parseInt(searchParams.get("limit") || "20", 10);
    const search = searchParams.get("search") || "";
    const skip = (page - 1) * limit;

    let whereClause: any = {};
    if (search) {
      const cleanPhone = search.replace(/\D/g, "").slice(-10);
      const hashedPhone = cleanPhone.length === 10 ? hashPhone(cleanPhone) : null;

      whereClause = {
        OR: [
          { id: { contains: search, mode: "insensitive" } },
          { user: { name: { contains: search, mode: "insensitive" } } },
          { walkInEntry: { patientName: { contains: search, mode: "insensitive" } } },
          { queue: { doctor: { name: { contains: search, mode: "insensitive" } } } },
          { queue: { doctor: { clinicName: { contains: search, mode: "insensitive" } } } },
          ...(hashedPhone ? [{ user: { phoneHash: hashedPhone } }] : [])
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
        orderBy: { bookedAt: 'desc' },
        include: {
          queue: {
            include: {
              doctor: {
                select: { name: true, clinicName: true }
              }
            }
          },
          patient: { select: { name: true, phone: true } }
        }
      }),
      prisma.queueToken.count({ where: whereClause })
    ]);

    const formattedBookings = recentBookings.map(b => {
      let name = "Walk-in Patient";
      let phone = "N/A";
      if (b.type === "WALKIN") {
        name = b.walkinName || "Walk-in Patient";
        phone = b.walkinPhone || "N/A";
      } else if (b.patient) {
        name = b.patient.name || "Patient";
        if (b.patient.phone) {
          try {
            phone = decrypt(b.patient.phone);
          } catch (e) {
            phone = b.patient.phone;
          }
        }
      }
      return {
        id: b.id, // Support might need full ID
        shortId: b.id.slice(-8).toUpperCase(),
        patient: name,
        phone,
        tokenNumber: b.tokenNumber,
        doctor: b.queue.doctor.name,
        clinic: b.queue.doctor.clinicName,
        issuedAt: b.bookedAt.toISOString(),
        status: b.status,
      };
    });

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
    return apiError("Internal Server Error", 500);
  }
}
