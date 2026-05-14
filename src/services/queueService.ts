import prisma from "@/lib/prisma";

export class QueueService {
  /**
   * Generates a new token for a given doctor on a specific date.
   * Runs inside a Prisma $transaction to ensure token sequence integrity.
   */
  static async issueToken(doctorId: string, date: Date, userId: string, source: "ONLINE" | "WALK_IN" = "ONLINE") {
    // Parse date to start of day
    const queueDate = new Date(date);
    queueDate.setUTCHours(0, 0, 0, 0);

    return await prisma.$transaction(async (tx) => {
      let dailyQueue = await tx.dailyQueue.findUnique({
        where: { doctorId_date: { doctorId, date: queueDate } },
      });

      if (!dailyQueue) {
        dailyQueue = await tx.dailyQueue.create({
          data: { doctorId, date: queueDate, maxCapacity: 50 },
        });
      }

      // Check for duplicate online booking
      if (source === "ONLINE") {
        const existingToken = await tx.queueToken.findFirst({
          where: { queueId: dailyQueue.id, userId },
        });

        if (existingToken) throw new Error("ALREADY_BOOKED");
      }

      const tokensCount = await tx.queueToken.count({
        where: { queueId: dailyQueue.id },
      });

      if (tokensCount >= dailyQueue.maxCapacity) {
        throw new Error("QUEUE_FULL");
      }

      const newQueueToken = await tx.queueToken.create({
        data: {
          queueId: dailyQueue.id,
          tokenNumber: tokensCount + 1,
          source,
          status: "WAITING",
          userId: source === "ONLINE" ? userId : null,
        },
      });

      return newQueueToken;
    });
  }
}
