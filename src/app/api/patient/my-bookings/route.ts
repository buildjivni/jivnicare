import { apiResponse, apiError } from '@/lib/utils/api-response';
import { NextResponse } from "next/server";
import prisma from "@/lib/db/prisma";
import { verifyToken } from "@/lib/jwt";
import { cookies } from "next/headers";
import { logger } from "@/lib/infrastructure/logger";
import { isTransientDbError, dbUnavailableResponse } from "@/lib/db/db-errors";

export async function GET(request: Request) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("jivnicare_token")?.value;

    if (!token) {
      return apiError("Unauthorized", 401);
    }

    const payload: any = await verifyToken(token);
    if (!payload || !payload.id) {
      return apiError("Invalid token", 401);
    }

    const tokens = await prisma.queueToken.findMany({
      where: {
        patientId: payload.id,
      },
      include: {
        queue: {
          include: {
            doctor: {
              select: {
                slug: true,
                clinicName: true,
                district: true,
                averageConsultationTime: true,
                user: { select: { name: true } },
              },
            },
            tokens: {
              where: { status: "WAITING" },
              select: { tokenNumber: true, status: true, isEmergency: true },
            },
          },
        },
      },
      orderBy: {
        bookedAt: "desc",
      },
    });

    return apiResponse({success: true, bookings: tokens});
  } catch (error: unknown) {
    if (isTransientDbError(error)) {
      logger.warn({ category: "BOOKING", message: "Transient DB error fetching bookings", error });
      const { error: msg, status } = dbUnavailableResponse();
      return NextResponse.json({ error: msg }, { status });
    }
    logger.error({ category: "API_EXCEPTION", message: "Fetch bookings error", error });
    return apiError("Failed to fetch bookings", 500);
  }
}
