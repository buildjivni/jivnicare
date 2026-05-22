import { NextResponse } from "next/server";
import prisma from "@/lib/db/prisma";
import { verifyToken } from "@/lib/jwt";
import { cookies } from "next/headers";
import { logger } from "@/lib/infrastructure/logger";
import { isTransientDbError, dbUnavailableResponse } from "@/lib/db/db-errors";

export async function GET(request: Request) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("auth-token")?.value;

    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const payload: any = await verifyToken(token);
    if (!payload || !payload.id) {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 });
    }

    const tokens = await prisma.queueToken.findMany({
      where: {
        userId: payload.id,
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
        tokenIssuedAt: "desc",
      },
    });

    return NextResponse.json({ success: true, bookings: tokens });
  } catch (error: unknown) {
    if (isTransientDbError(error)) {
      logger.warn({ category: "BOOKING", message: "Transient DB error fetching bookings", error });
      const { error: msg, status } = dbUnavailableResponse();
      return NextResponse.json({ error: msg }, { status });
    }
    logger.error({ category: "API_EXCEPTION", message: "Fetch bookings error", error });
    return NextResponse.json({ error: "Failed to fetch bookings" }, { status: 500 });
  }
}
