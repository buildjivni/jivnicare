import { NextRequest } from "next/server";
import { cookies } from "next/headers";
import { verifyToken, AUTH_COOKIE } from "@/lib/jwt";
import { db } from "@/lib/db";
import { verifyQueueOwnership, queueError } from "@/lib/queue-auth";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get(AUTH_COOKIE)?.value;
    if (!token) return Response.json({ error: "Unauthorized" }, { status: 401 });
    const user = await verifyToken(token);

    const body = await req.json();
    const { queueId } = body;
    if (!queueId) {
      return Response.json({ error: "queueId is required" }, { status: 400 });
    }

    await verifyQueueOwnership(queueId, user);

    const result = await db.$transaction(async (tx) => {
      const updated = await tx.queueToken.updateMany({
        where: {
          queueId,
          status: "WAITING",
        },
        data: {
          status: "EXPIRED",
          expiredAt: new Date(),
        },
      });
      return updated;
    });

    return Response.json({
      message: `${result.count} token(s) expired successfully`,
      expiredCount: result.count,
    });
  } catch (err) {
    return queueError(new Response(), err);
  }
}
