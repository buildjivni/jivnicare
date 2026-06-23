import prisma from "@/lib/db/prisma";
import { sendTransactionalSms } from "@/lib/sms";
import { logger } from "./infrastructure/logger";
import { getLogicalDate } from "./queue";

/**
 * Triggers alerts for patients when the queue progresses.
 * - Called Patient: "Your turn has arrived!"
 * - Next Patient (1st waiting): "You are next! (1 patient ahead)"
 * - Third Patient (2nd waiting): "Your turn is coming! (2 patients ahead)"
 */
export async function triggerQueueAlerts(
  queueId: string,
  activeToken: { tokenNumber: number; patientPhone: string; patientId: string | null },
  doctorId: string
) {
  try {
    const doctor = await prisma.doctor.findUnique({
      where: { id: doctorId },
      select: { name: true }
    });
    const doctorName = doctor?.name || "Doctor";

    // 1. Notify the called patient
    const calledMessage = `Aapka token #${activeToken.tokenNumber} call kiya gaya hai Dr. ${doctorName} ke dwara. Kripya clinic room mein prashthan karein.`;
    if (activeToken.patientId) {
      await prisma.notification.create({
        data: {
          userId: activeToken.patientId,
          type: "PLATFORM_ALERT",
          title: "Your turn has arrived!",
          message: calledMessage
        }
      }).catch(() => {});
    }
    await sendTransactionalSms(activeToken.patientPhone, calledMessage).catch(() => {});

    // 2. Fetch the next waiting/ready tokens in the queue
    const waitingTokens = await prisma.queueToken.findMany({
      where: {
        queueId: queueId,
        status: { in: ["WAITING", "READY"] }
      },
      orderBy: { tokenNumber: "asc" },
      take: 2
    });

    // 3. Notify the next patient
    if (waitingTokens.length > 0) {
      const nextToken = waitingTokens[0];
      const nextMessage = `Aap agle hain! Token #${nextToken.tokenNumber} — 1 patient aapke aage hain Dr. ${doctorName} ke paas. Kripya ready rahein.`;
      if (nextToken.patientId) {
        await prisma.notification.create({
          data: {
            userId: nextToken.patientId,
            type: "ENGAGEMENT_ALERT",
            title: "You are next!",
            message: nextMessage
          }
        }).catch(() => {});
      }
      await sendTransactionalSms(nextToken.patientPhone, nextMessage).catch(() => {});
    }

    // 4. Notify the third patient (2 patients ahead)
    if (waitingTokens.length > 1) {
      const thirdToken = waitingTokens[1];
      const thirdMessage = `Aapka turn aane wala hai! Token #${thirdToken.tokenNumber} — 2 patients aapke aage hain Dr. ${doctorName} ke paas. Kripya prepare rahein.`;
      if (thirdToken.patientId) {
        await prisma.notification.create({
          data: {
            userId: thirdToken.patientId,
            type: "ENGAGEMENT_ALERT",
            title: "Your turn is coming!",
            message: thirdMessage
          }
        }).catch(() => {});
      }
      await sendTransactionalSms(thirdToken.patientPhone, thirdMessage).catch(() => {});
    }
  } catch (error) {
    logger.error({ category: "QUEUE", message: "Failed to trigger queue progression alerts", error });
  }
}

/**
 * Triggers alerts to all booked patients when the clinic status changes.
 * - SHORT_BREAK: "Doctor is on a break. Your token is still valid."
 * - CLINIC_CLOSED: "Doctor is offline today."
 */
export async function triggerClinicStatusAlerts(
  doctorId: string,
  status: "SHORT_BREAK" | "CLINIC_CLOSED" | string,
  statusReason?: string
) {
  try {
    const doctor = await prisma.doctor.findUnique({
      where: { id: doctorId },
      select: { name: true }
    });
    if (!doctor) return;

    const doctorName = doctor.name;
    const logicalDate = getLogicalDate();

    // Find the daily queue for today
    const dailyQueue = await prisma.dailyQueue.findUnique({
      where: { doctorId_logicalDate: { doctorId, logicalDate } }
    });

    if (!dailyQueue) return;

    // Fetch all active tokens for today
    const activeTokens = await prisma.queueToken.findMany({
      where: {
        queueId: dailyQueue.id,
        status: { in: ["WAITING", "READY"] }
      }
    });

    if (activeTokens.length === 0) return;

    // Setup templates based on status
    let title = "";
    let messageTemplate = "";

    if (status === "SHORT_BREAK") {
      title = `Dr. ${doctorName} is on a break`;
      messageTemplate = `Dr. ${doctorName} thodi der ke liye break pe hain (${statusReason || "short break"}). Aapka token #[TOKEN] abhi bhi valid hai. Queue jaldi hi shuru hogi.`;
    } else if (status === "CLINIC_CLOSED") {
      title = `Dr. ${doctorName} is offline today`;
      messageTemplate = `Kripya dhyan dein: Dr. ${doctorName} aaj clinic mein nahi hain. Aapka token #[TOKEN] active hai, aap chahein toh app se cancel kar sakte hain.`;
    } else {
      return; // Do not alert for standard AVAILABLE or limited slots status
    }

    logger.info({
      category: "SYSTEM",
      message: `Broadcasting clinic status alerts to ${activeTokens.length} active tokens`,
      metadata: { doctorId, status }
    });

    // Send notifications to all active patients
    for (const token of activeTokens) {
      const message = messageTemplate.replace("#[TOKEN]", token.tokenNumber.toString());

      if (token.patientId) {
        await prisma.notification.create({
          data: {
            userId: token.patientId,
            type: "PLATFORM_ALERT",
            title,
            message
          }
        }).catch(() => {});
      }

      await sendTransactionalSms(token.patientPhone, message).catch(() => {});
    }
  } catch (error) {
    logger.error({ category: "SYSTEM", message: "Failed to trigger clinic status alerts", error });
  }
}
