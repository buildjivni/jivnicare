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

    if (queueToken.status !== "BOOKED") {
      return Response.json(
        {
          error: `Token is not in BOOKED status. Current status: ${queueToken.status}`,
        },
        { status: 409 }
      );
    }

    const updated = await db.$transaction(async (tx) => {
      return tx.queueToken.update({
        where: { id: tokenId },
        data: {
          status: "AWAITING_ARRIVAL",
        },
      });
    });

    return apiResponse({token: updated});
  } catch (err) {
    return queueError(new Response(), err);
  }
}
