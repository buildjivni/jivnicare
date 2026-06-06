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
    if (!token) return Response.json({ error: "Unauthorized" }, { status: 401 });
    const user = await verifyToken(token);

    const body = await req.json();
    const { tokenId } = body;
    if (!tokenId) {
      return Response.json({ error: "tokenId is required" }, { status: 400 });
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

    return Response.json({ token: updated });
  } catch (err) {
    return queueError(new Response(), err);
  }
}
