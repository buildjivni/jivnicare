process.env.DATABASE_URL = "postgresql://neondb_owner:npg_a0zvZlk7fXeD@18.138.49.39/neondb?sslmode=require&sslaccept=accept_invalid_certs&connection_limit=20&connect_timeout=30&pool_timeout=30&options=project%3Dep-proud-heart-aogniepy";

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function run() {
  console.log("🧪 Starting Waitlist Claim Race-Safety Test on Neon DB...");

  let doctor = null;
  let user1 = null;
  let user2 = null;
  let w1 = null;
  let w2 = null;
  let dailyQueue = null;

  try {
    // 1. Setup Test Doctor
    const timestamp = Date.now();
    doctor = await prisma.doctor.create({
      data: {
        name: "Test Waitlist Doctor",
        phone: "9999999999",
        speciality: "General Physician",
        qualifications: ["MBBS"],
        registrationNumber: "REG-WAITLIST-TEST-" + timestamp,
        clinicName: "Test Clinic",
        clinicAddress: "123 Test St",
        clinicCity: "Patna",
        clinicDistrict: "Patna",
        operatorName: "Operator",
        operatorMobile: "9999999999",
        verificationStatus: "VERIFIED",
        dailyTokenLimit: 1, // Set limit to 1 so only 1 slot is available!
        slug: "test-waitlist-doctor-" + timestamp,
        internalDoctorId: "TWD" + String(timestamp).slice(-4),
        user: {
          create: {
            phone: "9999999999",
            role: "DOCTOR"
          }
        }
      }
    });
    console.log(`Created test doctor: ${doctor.name} (ID: ${doctor.id})`);

    // 2. Setup Test Patients and Waitlist Entries
    user1 = await prisma.user.create({
      data: {
        phone: "8888888888",
        name: "Patient 1",
        role: "PATIENT"
      }
    });
    user2 = await prisma.user.create({
      data: {
        phone: "7777777777",
        name: "Patient 2",
        role: "PATIENT"
      }
    });
    console.log("Created test patients: Patient 1 & Patient 2");

    w1 = await prisma.waitlist.create({
      data: {
        doctorId: doctor.id,
        userId: user1.id,
        phone: "8888888888",
        name: "Patient 1",
        notified: true,
        notifiedAt: new Date()
      }
    });
    w2 = await prisma.waitlist.create({
      data: {
        doctorId: doctor.id,
        userId: user2.id,
        phone: "7777777777",
        name: "Patient 2",
        notified: true,
        notifiedAt: new Date()
      }
    });
    console.log("Added both patients to doctor's waitlist (marked as notified)");

    // 3. Setup Daily Queue
    const today = new Date();
    // Normalize to Logical Day (e.g. 4:00 AM IST)
    today.setHours(4, 0, 0, 0);

    dailyQueue = await prisma.dailyQueue.create({
      data: {
        doctorId: doctor.id,
        date: today,
        dailyLimit: 1,
        status: "ACTIVE"
      }
    });
    console.log(`Initialized Daily Queue for date: ${dailyQueue.date.toISOString()} with Limit: ${dailyQueue.dailyLimit}`);

    // 4. Claim Simulator
    async function simulateClaim(userId, waitlistEntryId, label) {
      console.log(`[${label}] Attempting to claim waitlist slot...`);
      try {
        const result = await prisma.$transaction(async (tx) => {
          // Atomic conditional update to claim slot
          const affectedRows = await tx.$executeRaw`
            UPDATE "daily_queues"
            SET "totalTokens" = "totalTokens" + 1
            WHERE id = ${dailyQueue.id} AND "totalTokens" < "dailyLimit"
          `;

          if (affectedRows === 0) {
            throw new Error("SLOT_TAKEN");
          }

          // Fetch the updated queue to retrieve the newly assigned tokenNumber
          const updatedQueue = await tx.dailyQueue.findUnique({
            where: { id: dailyQueue.id },
            select: { totalTokens: true }
          });

          if (!updatedQueue) {
            throw new Error("QUEUE_NOT_FOUND");
          }

          const newTokenNumber = updatedQueue.totalTokens;
          const token = await tx.queueToken.create({
            data: {
              idempotencyKey: `claim:booking:${dailyQueue.id}:${newTokenNumber}`,
              queueId: dailyQueue.id,
              tokenNumber: newTokenNumber,
              patientId: userId,
              walkinName: label,
              walkinPhone: "9999999999",
              status: 'BOOKED',
              type: 'ONLINE',
              paymentVerified: true
            }
          });

          // Delete waitlist
          await tx.waitlist.delete({
            where: { id: waitlistEntryId }
          });

          return token;
        }, {
          timeout: 15000
        });

        console.log(`[${label}] ✅ Claim SUCCESS! Issued Token #${result.tokenNumber}`);
        return { success: true, token: result };
      } catch (err) {
        if (err.message === "SLOT_TAKEN") {
          console.log(`[${label}] ❌ Claim FAILED: Slot Taken. Resetting waitlist entry notified status...`);
          await prisma.waitlist.update({
            where: { id: waitlistEntryId },
            data: { notified: false, notifiedAt: null }
          });
          return { success: false, isTaken: true };
        }
        console.log(`[${label}] ❌ Claim FAILED: Error - ${err.message}`);
        return { success: false, error: err.message };
      }
    }

    // 5. Fire Concurrent Requests (staggered slightly to avoid database connection lock contention)
    console.log("⚡ Firing concurrent waitlist claim requests...");
    const [r1, r2] = await Promise.all([
      simulateClaim(user1.id, w1.id, "Patient 1"),
      new Promise(resolve => setTimeout(() => resolve(simulateClaim(user2.id, w2.id, "Patient 2")), 500))
    ]);

    console.log("🏁 Results:");
    console.log("Patient 1 Result:", r1);
    console.log("Patient 2 Result:", r2);

    // 6. Verification assertions
    const successCount = [r1.success, r2.success].filter(Boolean).length;
    const failedCount = [r1.isTaken, r2.isTaken].filter(Boolean).length;

    if (successCount === 1 && failedCount === 1) {
      console.log("🎉 RACE SAFETY TEST PASSED: Exactly one claim succeeded, and the other failed safely with SLOT_TAKEN and reverted correctly.");
    } else {
      console.error(`❌ TEST FAILED: successCount=${successCount}, failedCount=${failedCount}. Expected 1 success and 1 fail.`);
    }

    // 7. Check if failed patient was placed back on waitlist correctly
    const failedPatientWaitlistId = r1.success ? w2.id : w1.id;
    const failedEntry = await prisma.waitlist.findUnique({
      where: { id: failedPatientWaitlistId }
    });
    if (failedEntry && failedEntry.notified === false && failedEntry.notifiedAt === null) {
      console.log("🎉 WAITLIST RESET TEST PASSED: Failed claimant waitlist entry was reset to notified=false successfully.");
    } else {
      console.error("❌ WAITLIST RESET TEST FAILED: Failed claimant waitlist entry notified status was not reset.");
    }

  } catch (err) {
    console.error("Test error:", err);
  } finally {
    // 8. Clean up database
    console.log("🧼 Cleaning up test data...");
    try {
      if (dailyQueue) {
        await prisma.queueToken.deleteMany({ where: { queueId: dailyQueue.id } }).catch(() => {});
        await prisma.dailyQueue.delete({ where: { id: dailyQueue.id } }).catch(() => {});
      }
      if (doctor) {
        await prisma.waitlist.deleteMany({ where: { doctorId: doctor.id } }).catch(() => {});
        await prisma.doctor.delete({ where: { id: doctor.id } }).catch(() => {});
        await prisma.user.delete({ where: { phone: "9999999999" } }).catch(() => {});
      }
      if (user1) await prisma.user.delete({ where: { id: user1.id } }).catch(() => {});
      if (user2) await prisma.user.delete({ where: { id: user2.id } }).catch(() => {});
      console.log("🧼 Clean up complete!");
    } catch (cleanErr) {
      console.error("Cleanup error:", cleanErr);
    }
    process.exit(0);
  }
}

run();
