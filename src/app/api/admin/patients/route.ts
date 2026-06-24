import { apiResponse, apiError } from '@/lib/utils/api-response';
import { NextResponse } from "next/server";
import prisma from "@/lib/db/prisma";
import { verifyToken } from "@/lib/jwt";
import { cookies } from "next/headers";
import { decrypt, hashPhone } from "@/lib/crypto";

export async function GET(req: Request) {
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

    const url = new URL(req.url);
    const search = url.searchParams.get("search") || "";
    const page = parseInt(url.searchParams.get("page") || "1", 10);
    const limit = parseInt(url.searchParams.get("limit") || "50", 10);
    const skip = (page - 1) * limit;

    const cleanPhone = search.replace(/\D/g, "").slice(-10);
    const hashedPhone = cleanPhone.length === 10 ? hashPhone(cleanPhone) : null;

    const whereClause: any = {
      role: "PATIENT",
      ...(search && {
        OR: [
          { name: { contains: search, mode: 'insensitive' } },
          ...(hashedPhone ? [{ phoneHash: hashedPhone }] : [])
        ]
      })
    };

    const [patients, totalCount] = await Promise.all([
      prisma.user.findMany({
        where: whereClause,
        select: {
          id: true,
          name: true,
          phone: true,
          createdAt: true,
          verificationStatus: true
        },
        orderBy: {
          createdAt: 'desc'
        },
        skip,
        take: limit
      }),
      prisma.user.count({ where: whereClause })
    ]);

    const totalPages = Math.ceil(totalCount / limit);

    const decryptedPatients = patients.map(p => ({
      ...p,
      phone: decrypt(p.phone)
    }));

    return NextResponse.json({ 
      success: true, 
      patients: decryptedPatients,
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
    console.error("Admin Patients API Error:", error);
    return apiError("Internal Server Error", 500);
  }
}
