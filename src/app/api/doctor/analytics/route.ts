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

    const doctor = await db.doctor.findUnique({
      where: { userId: user.id },
      select: { id: true },
    });
    if (!doctor) {
      return Response.json({ error: "Doctor profile not found" }, { status: 404 });
    }

    const { searchParams } = new URL(req.url);
    const period = Math.min(30, Math.max(1, parseInt(searchParams.get("period") ?? "7")));
    const since = new Date();
    since.setDate(since.getDate() - period);
    since.setHours(0, 0, 0, 0);

    // Today's date at midnight IST
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);

    const [todayQueue, periodTokens] = await Promise.all([
      // Today's queue summary
      db.dailyQueue.findFirst({
        where: {
          doctorId: doctor.id,
          date: { gte: todayStart },
        },
        select: {
          issuedTokensCount: true,
          cancelledCount: true,
          noShowCount: true,
          currentActiveToken: true,
          status: true,
        },
      }),
      // Last N days tokens
      db.queueToken.findMany({
        where: {
          queue: { doctorId: doctor.id },
          tokenIssuedAt: { gte: since },
        },
        select: {
          status: true,
          tokenIssuedAt: true,
          source: true,
        },
      }),
    ]);

    // Compute stats
    const completed = periodTokens.filter((t) => t.status === "COMPLETED").length;
    const noShows = periodTokens.filter((t) => t.status === "NO_SHOW").length;
    const total = periodTokens.length;

    // Average wait time is not tracked in v1 since arrivedAt was removed
    const avgWaitMinutes = null;

    // Bookings by source
    const onlineCount = periodTokens.filter((t) => t.source === "ONLINE").length;
    const walkInCount = periodTokens.filter((t) => t.source === "WALK_IN").length;

    return Response.json({
      today: {
        issued: todayQueue?.issuedTokensCount ?? 0,
        cancelled: todayQueue?.cancelledCount ?? 0,
        noShows: todayQueue?.noShowCount ?? 0,
        currentToken: todayQueue?.currentActiveToken ?? 0,
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
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}
