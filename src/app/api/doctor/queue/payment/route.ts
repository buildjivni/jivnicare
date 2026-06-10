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
    const rawToken = cookieStore.get(AUTH_COOKIE)?.value;
    if (!rawToken) {
      return apiError("Unauthorized", 401);
    }
    const user = await verifyToken(rawToken);

    const body = await req.json();
    const { tokenId, action } = body;

    if (!tokenId || !action) {
      return Response.json(
        { error: "tokenId and action are required" },
        { status: 400 }
      );
    }
    if (action !== "request" && action !== "approve") {
      return Response.json(
        { error: "action must be 'request' or 'approve'" },
        { status: 400 }
      );
    }

    const queueToken = await verifyTokenOwnership(tokenId, user);

    // Check clinic payment config (hardcoded to true for v1 since config is removed)
    const collectPayment = true;

    // ── action: "request" ──────────────────────────────────────────────────
    if (action === "request") {
      if (queueToken.status !== "AWAITING_ARRIVAL") {
        return Response.json(
          {
            error: `Expected AWAITING_ARRIVAL. Current status: ${queueToken.status}`,
          },
          { status: 409 }
        );
      }

      if (!collectPayment) {
        // Skip payment — go directly to READY
        const updated = await db.$transaction(async (tx) => {
          return tx.queueToken.update({
            where: { id: tokenId },
            data: {
              status: "READY",
            },
          });
        });
        return apiResponse({token: updated,
          message: "Payment step skipped — clinic does not collect payment",});
      }

      const updated = await db.$transaction(async (tx) => {
        return tx.queueToken.update({
          where: { id: tokenId },
          data: {
            status: "PAYMENT_PENDING",
          },
        });
      });
      return apiResponse({token: updated});
    }

    // ── action: "approve" ──────────────────────────────────────────────────
    if (queueToken.status !== "PAYMENT_PENDING") {
      return Response.json(
        {
          error: `Expected PAYMENT_PENDING. Current status: ${queueToken.status}`,
        },
        { status: 409 }
      );
    }

    const updated = await db.$transaction(async (tx) => {
      return tx.queueToken.update({
        where: { id: tokenId },
        data: {
          status: "READY",
        },
      });
    });
    return apiResponse({token: updated});
  } catch (err) {
    return queueError(new Response(), err);
  }
}
