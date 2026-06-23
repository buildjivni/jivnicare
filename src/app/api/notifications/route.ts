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
    if (!payload || !payload.id) {
      return apiError("Unauthorized", 401);
    }

    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get("limit") || "15", 10);

    const notifications = await prisma.notification.findMany({
      where: {
        userId: payload.id,
      },
      orderBy: {
        createdAt: "desc",
      },
      take: limit,
    });

    return NextResponse.json({ success: true, notifications });
  } catch (error) {
    console.error("[GET /api/notifications]", error);
    return apiError("Internal server error", 500);
  }
}
