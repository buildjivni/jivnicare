import { NextRequest } from "next/server";
import { cookies } from "next/headers";
import { verifyToken, AUTH_COOKIE } from "@/lib/jwt";
import { db } from "@/lib/db";

export const runtime = "nodejs";

export async function GET(req: NextRequest) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get(AUTH_COOKIE)?.value;
    if (!token) return Response.json({ error: "Unauthorized" }, { status: 401 });
    const user = await verifyToken(token);

    const { searchParams } = new URL(req.url);
    const page = Math.max(1, parseInt(searchParams.get("page") ?? "1"));
    const limit = Math.min(20, parseInt(searchParams.get("limit") ?? "10"));
    const skip = (page - 1) * limit;

    const [tokens, total] = await Promise.all([
      db.queueToken.findMany({
        where: { userId: user.id },
        orderBy: { tokenIssuedAt: "desc" },
        take: limit,
        skip,
        select: {
          id: true,
          tokenNumber: true,
          status: true,
          source: true,
          tokenIssuedAt: true,
          arrivedAt: true,
          paymentApprovedAt: true,
          calledAt: true,
          isEmergency: true,
          queue: {
            select: {
              date: true,
              doctor: {
                select: {
                  name: true,
                  slug: true,
                  clinicName: true,
                  district: true,
                  city: true,
                  profileImage: true,
                },
              },
            },
          },
        },
      }),
      db.queueToken.count({ where: { userId: user.id } }),
    ]);

    return Response.json({
      tokens,
      total,
      page,
      totalPages: Math.ceil(total / limit),
    });
  } catch (err) {
    console.error("[GET /api/patient/history]", err);
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}
