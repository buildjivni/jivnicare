import { NextResponse } from "next/server";
import prisma from "@/lib/db/prisma";
import { verifyToken, AUTH_COOKIE } from "@/lib/jwt";
import { cookies } from "next/headers";
import { apiError } from "@/lib/utils/api-response";

export async function GET() {
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

    const unreadCount = await prisma.notification.count({
      where: {
        userId: payload.id,
        readAt: null,
      },
    });

    return NextResponse.json({ success: true, unreadCount });
  } catch (error) {
    console.error("[GET /api/notifications/unread-count]", error);
    return apiError("Internal server error", 500);
  }
}
