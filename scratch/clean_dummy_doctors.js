const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

const DUMMY_IDS = [
  "c26f2694-3875-4d15-afd2-def87e94e5e3", // Dr. Test Concurrency
  "73f78b44-5981-49fa-a71c-c960b31a8807", // Dr. Concurrency 1
  "f6a1b73d-091a-4c18-9512-23d3c4b26902", // Dr. Concurrency 2
  "02ea22dd-b465-48ce-b12b-aaa8bec94050", // Dr. Concurrency 3
  "a1897009-e420-4454-948a-843fd9618f62", // Dr. Concurrency 4
  "3fe02184-edbf-490c-9c8e-38ff14c1b8b1", // Dr. Concurrency 5
  "546e353d-2d68-41b2-b320-4f33b58574c1", // Dr. Walkin Cap
  "f9fcd61b-57a6-4105-8b70-57e612b475b0", // Dr. Suspended
  "c4949ba6-84a2-4d1d-9bfd-71e0d302a72c"  // Dr. Active
];

async function main() {
  console.log("🧹 Beginning database cleanup: deleting test/dummy doctors...");

  for (const doctorId of DUMMY_IDS) {
    // Check if doctor exists
    const doctor = await prisma.doctor.findUnique({
      where: { id: doctorId }
    });

    if (!doctor) {
      console.log(`⚠️ Doctor with ID ${doctorId} not found or already deleted.`);
      continue;
    }

    console.log(`🗑️ Deleting doctor: ${doctor.name} (${doctor.id})`);

    // 1. Delete PlatformPricing
    await prisma.platformPricing.deleteMany({
      where: { doctorId }
    });

    // 2. Delete QueueTokens associated with doctor's DailyQueues
    const queues = await prisma.dailyQueue.findMany({
      where: { doctorId },
      select: { id: true }
    });
    const queueIds = queues.map(q => q.id);

    if (queueIds.length > 0) {
      await prisma.queueToken.deleteMany({
        where: { queueId: { in: queueIds } }
      });
    }

    // 3. Delete DailyQueues
    await prisma.dailyQueue.deleteMany({
      where: { doctorId }
    });

    // 4. Delete Waitlists
    await prisma.waitlist.deleteMany({
      where: { doctorId }
    });

    // 5. Delete Doctor record
    await prisma.doctor.delete({
      where: { id: doctorId }
    });

    // 5.5 Delete User relations
    await prisma.authSession.deleteMany({ where: { userId: doctor.userId } });
    
    // Check and delete audit logs, consent logs, notifications (using try-catch in case they don't exist or use different fields)
    try {
      await prisma.auditLog.deleteMany({ where: { userId: doctor.userId } });
    } catch (e) {}
    try {
      await prisma.consentLog.deleteMany({ where: { userId: doctor.userId } });
    } catch (e) {}
    try {
      await prisma.notification.deleteMany({ where: { userId: doctor.userId } });
    } catch (e) {}

    // 6. Delete associated User record
    await prisma.user.delete({
      where: { id: doctor.userId }
    });

    console.log(`✅ Successfully deleted ${doctor.name} and all its relations.`);
  }

  console.log("🎉 Database cleanup complete!");
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
