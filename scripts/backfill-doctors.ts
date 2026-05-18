import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log("🚀 Starting JivniCare Doctor Profile Backfill...");

  // 1. Initialize or Seed the SystemCounter for doctor_code at 64000
  // So the first generated increment will be 64001 (resulting in JC64001)
  console.log("📝 Initializing SystemCounter...");
  const existingCounter = await prisma.systemCounter.findUnique({
    where: { id: "doctor_code" }
  });

  if (!existingCounter) {
    await prisma.systemCounter.create({
      data: {
        id: "doctor_code",
        count: 64000
      }
    });
    console.log("✨ Seeded SystemCounter for 'doctor_code' at base 64000.");
  } else {
    console.log(`ℹ️ SystemCounter 'doctor_code' already exists with count: ${existingCounter.count}`);
  }

  // 2. Fetch all doctors and filter in-memory to prevent MongoDB query issues with undefined fields
  console.log("🔍 Fetching all doctor profiles...");
  const allDoctors = await prisma.doctor.findMany({});
  
  const doctorsToBackfill = allDoctors.filter(doc => 
    !doc.doctorCode && doc.verificationStatus !== "DRAFT"
  );

  console.log(`📋 Found ${doctorsToBackfill.length} doctor profile(s) needing code allocation.`);

  let successCount = 0;

  // 3. Atomically allocate doctorCode for each doctor
  for (const doc of doctorsToBackfill) {
    try {
      const updatedCode = await prisma.$transaction(async (tx) => {
        // Atomic increment
        const counter = await tx.systemCounter.upsert({
          where: { id: "doctor_code" },
          update: { count: { increment: 1 } },
          create: { id: "doctor_code", count: 64001 }
        });

        const code = `JC${counter.count}`;

        await tx.doctor.update({
          where: { id: doc.id },
          data: { doctorCode: code }
        });

        return code;
      });

      console.log(`✅ Allocated code ${updatedCode} to doctor: ${doc.name} (ID: ${doc.id})`);
      successCount++;
    } catch (err) {
      console.error(`❌ Failed to allocate code for doctor ${doc.name}:`, err);
    }
  }

  console.log("\n🏁 Backfill operation completed.");
  console.log(`📊 Successfully backfilled: ${successCount}/${doctorsToBackfill.length} profiles.`);
}

main()
  .catch((e) => {
    console.error("❌ Critical error during backfill:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
