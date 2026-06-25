import { apiResponse, apiError } from '@/lib/utils/api-response';
import { NextRequest } from "next/server";
import { cookies } from "next/headers";
import { verifyToken, AUTH_COOKIE } from "@/lib/jwt";
import { db } from "@/lib/db";

export const runtime = "nodejs";

export async function GET(req: NextRequest) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get(AUTH_COOKIE)?.value;
    if (!token) return apiError("Unauthorized", 401);
    const user = await verifyToken(token);

    const { searchParams } = new URL(req.url);
    const page = Math.max(1, parseInt(searchParams.get("page") ?? "1"));
    const limit = Math.min(20, parseInt(searchParams.get("limit") ?? "10"));
    const skip = (page - 1) * limit;

    const [tokens, total] = await Promise.all([
      db.queueToken.findMany({
        where: { patientId: user.id },
        orderBy: { bookedAt: "desc" },
        take: limit,
        skip,
        select: {
          id: true,
          tokenNumber: true,
          status: true,
          type: true,
          bookedAt: true,
          queue: {
            select: {
              date: true,
              doctor: {
                select: {
                  name: true,
                  slug: true,
                  clinicName: true,
                  clinicDistrict: true,
                  clinicCity: true,
                  profilePhoto: true,
                },
              },
            },
          },
        },
      }),
      db.queueToken.count({ where: { patientId: user.id } }),
    ]);

    return apiResponse({tokens,
      total,
      page,
      totalPages: Math.ceil(total / limit),});
  } catch (err) {
    console.error("[GET /api/patient/history]", err);
    return apiError("Internal server error", 500);
  }
}
