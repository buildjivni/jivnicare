import { NextResponse } from "next/server";
import prisma from "@/lib/db/prisma";
import { verifyToken, AUTH_COOKIE } from "@/lib/jwt";
import { cookies } from "next/headers";
import { apiError } from "@/lib/utils/api-response";

export async function PATCH(request: Request) {
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

    let body: any = {};
    try {
      body = await request.json();
    } catch {
      // Allow empty request bodies
    }

    const { ids } = body;

    const updateData = {
      isRead: true,
      readAt: new Date(),
    };

    if (Array.isArray(ids) && ids.length > 0) {
      await prisma.notification.updateMany({
        where: {
          userId: payload.id,
          id: { in: ids },
        },
        data: updateData,
      });
    } else {
      await prisma.notification.updateMany({
        where: {
          userId: payload.id,
          isRead: false,
        },
        data: updateData,
      });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[PATCH /api/notifications/mark-read]", error);
    return apiError("Internal server error", 500);
  }
}
