import { apiResponse, apiError } from '@/lib/utils/api-response';
import { NextRequest } from "next/server";
import { cookies } from "next/headers";
import { verifyToken, AUTH_COOKIE } from "@/lib/jwt";
import { db } from "@/lib/db";
import { verifyTokenOwnership, queueError } from "@/lib/queue-auth";

export const runtime = "nodejs";

export async function PATCH(req: NextRequest) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get(AUTH_COOKIE)?.value;
    if (!token) return apiError("Unauthorized", 401);
    const user = await verifyToken(token);

    const body = await req.json();
    const { tokenId } = body;
    if (!tokenId) {
      return apiError("tokenId is required", 400);
    }

    const queueToken = await verifyTokenOwnership(tokenId, user);

    if (queueToken.status !== "READY") {
      return Response.json(
        {
          error: `Expected READY. Current status: ${queueToken.status}`,
        },
        { status: 409 }
      );
    }

    const updated = await db.$transaction(async (tx) => {
      const updatedToken = await tx.queueToken.update({
        where: { id: tokenId },
        data: {
          status: "CALLED",
        },
      });

      await tx.dailyQueue.update({
        where: { id: queueToken.queueId },
        data: {
          currentActiveToken: updatedToken.tokenNumber,
        },
      });

      return updatedToken;
    });

    // Trigger queue alerts
    if (updated) {
      try {
        const { triggerQueueAlerts } = require("@/lib/notifications");
        triggerQueueAlerts(
          queueToken.queueId,
          {
            tokenNumber: updated.tokenNumber,
            patientPhone: updated.patientPhone,
            patientId: updated.patientId,
          },
          queueToken.queue.doctorId
        ).catch((err: any) => console.error("Error triggering queue alerts:", err));
      } catch (triggerErr) {
        console.error("Queue alerts trigger exception:", triggerErr);
      }
    }

    return apiResponse({token: updated});
  } catch (err) {
    return queueError(new Response(), err);
  }
}
