import { db } from "@/lib/db";
import { JivniPayload } from "@/lib/jwt";

/**
 * Verifies that the authenticated doctor owns the given DailyQueue.
 * Returns the DailyQueue with its doctor relation, or throws with HTTP status.
 */
export async function verifyQueueOwnership(
  queueId: string,
  user: JivniPayload
): Promise<{ doctorId: string; maxCapacity: number; status: string }> {
  const queue = await db.dailyQueue.findUnique({
    where: { id: queueId },
    select: { doctorId: true, maxCapacity: true, status: true },
  });
  if (!queue) {
    throw { status: 404, message: "Queue not found" };
  }
  const doctor = await db.doctor.findUnique({
    where: { userId: user.id },
    select: { id: true },
  });
  if (!doctor || queue.doctorId !== doctor.id) {
    throw { status: 403, message: "You do not own this queue" };
  }
  return { ...queue };
}

/**
 * Verifies that the given token belongs to a queue owned by this doctor.
 * Returns the full token with queueId, or throws with HTTP status.
 */
export async function verifyTokenOwnership(
  tokenId: string,
  user: JivniPayload
) {
  const token = await db.queueToken.findUnique({
    where: { id: tokenId },
    include: {
      queue: { select: { doctorId: true, id: true } },
    },
  });
  if (!token) {
    throw { status: 404, message: "Token not found" };
  }
  const doctor = await db.doctor.findUnique({
    where: { userId: user.id },
    select: { id: true },
  });
  if (!doctor || token.queue.doctorId !== doctor.id) {
    throw { status: 403, message: "You do not own this token" };
  }
  return token;
}

/** Standard error response helper */
export function queueError(res: Response, err: unknown): Response {
  if (
    typeof err === "object" &&
    err !== null &&
    "status" in err &&
    "message" in err
  ) {
    const e = err as { status: number; message: string };
    return Response.json({ error: e.message }, { status: e.status });
  }
  console.error("[queue-auth]", err);
  return Response.json({ error: "Internal server error" }, { status: 500 });
}
