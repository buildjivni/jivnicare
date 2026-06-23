import { NextResponse } from "next/server";
import prisma from "@/lib/db/prisma";
import { verifyToken, AUTH_COOKIE } from "@/lib/jwt";
import { cookies } from "next/headers";
import { apiError } from "@/lib/utils/api-response";

export async function POST() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get(AUTH_COOKIE)?.value;

    if (!token) {
      return apiError("Unauthorized", 401);
    }

    const payload = await verifyToken(token);
    if (!payload || !payload.id || payload.role !== "PATIENT") {
      return apiError("Unauthorized", 401);
    }

    await prisma.$transaction(async (tx) => {
      // 1. Log the data deletion request in audit logs
      await tx.auditLog.create({
        data: {
          userId: payload.id,
          role: "PATIENT",
          action: "UPDATE_PROFILE",
          entityType: "User",
          entityId: payload.id,
          newValue: "REQUEST_DATA_DELETION",
        },
      });

      // 2. Deactivate the user profile immediately to prevent further access
      await tx.user.update({
        where: { id: payload.id },
        data: { isActive: false },
      });
    });

    const response = NextResponse.json({
      success: true,
      message: "Data deletion request recorded. Account deactivated successfully.",
    });

    // 3. Delete auth cookie to log the user out
    response.cookies.delete(AUTH_COOKIE);

    return response;
  } catch (error) {
    console.error("[POST /api/patient/delete-data]", error);
    return apiError("Internal server error", 500);
  }
}
