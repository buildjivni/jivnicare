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

    const doctor = await db.doctor.findUnique({
      where: { userId: user.id },
      select: { id: true },
    });
    if (!doctor) {
      return apiError("Doctor profile not found", 404);
    }

    const { searchParams } = new URL(req.url);
    const period = Math.min(30, Math.max(1, parseInt(searchParams.get("period") ?? "7")));
    const since = new Date();
    since.setDate(since.getDate() - period);
    since.setHours(0, 0, 0, 0);

    // Today's date at midnight IST
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);

    const todayQueue = await db.dailyQueue.findFirst({
      where: {
        doctorId: doctor.id,
        date: { gte: todayStart },
      },
      select: {
        id: true,
        totalTokens: true,
        currentToken: true,
        status: true,
      },
    });

    const [todayTokens, periodTokens] = await Promise.all([
      todayQueue
        ? db.queueToken.findMany({
            where: { queueId: todayQueue.id },
            select: { status: true },
          })
        : Promise.resolve([]),
      db.queueToken.findMany({
        where: {
          queue: { doctorId: doctor.id },
          bookedAt: { gte: since },
        },
        select: {
          status: true,
          bookedAt: true,
          type: true,
        },
      }),
    ]);

    const todayIssued = todayQueue?.totalTokens ?? 0;
    const todayCancelled = todayTokens.filter((t) => t.status === "CANCELLED").length;
    const todayNoShows = todayTokens.filter((t) => t.status === "NO_SHOW").length;
    const todayCurrent = todayQueue?.currentToken ?? 0;

    // Compute stats
    const completed = periodTokens.filter((t) => t.status === "COMPLETED").length;
    const noShows = periodTokens.filter((t) => t.status === "NO_SHOW").length;
    const total = periodTokens.length;

    // Average wait time is not tracked in v1 since arrivedAt was removed
    const avgWaitMinutes = null;

    // Bookings by source
    const onlineCount = periodTokens.filter((t) => t.type === "ONLINE").length;
    const walkInCount = periodTokens.filter((t) => t.type === "WALKIN").length;

    return Response.json({
      today: {
        issued: todayIssued,
        cancelled: todayCancelled,
        noShows: todayNoShows,
        currentToken: todayCurrent,
        queueStatus: todayQueue?.status ?? "NOT_STARTED",
      },
      period: {
        days: period,
        totalBookings: total,
        completed,
        noShows,
        noShowRatePercent:
          total > 0 ? Math.round((noShows / total) * 100) : 0,
        avgWaitMinutes,
        onlineBookings: onlineCount,
        walkInBookings: walkInCount,
      },
    });
  } catch (err) {
    console.error("[GET /api/doctor/analytics]", err);
    return apiError("Internal server error", 500);
  }
}
