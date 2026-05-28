const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function run() {
  console.log("=========================================");
  console.log("SYSTEM INTEGRITY AUDIT & TEST DATA CLEANUP");
  console.log("=========================================\n");

  // 1. Audit Doctors without valid users
  const orphanDoctors = await prisma.doctor.findMany({
    where: { user: null },
  });

  if (orphanDoctors.length > 0) {
    console.log(`[!] Found ${orphanDoctors.length} orphan Doctor records (no user attached).`);
  } else {
    console.log("[OK] All doctors have valid user relations.");
  }

  // 2. Audit Queues without valid doctors
  const orphanQueues = await prisma.dailyQueue.findMany({
    where: { doctor: null },
  });

  if (orphanQueues.length > 0) {
    console.log(`[!] Found ${orphanQueues.length} orphan Queue records (no doctor attached).`);
  } else {
    console.log("[OK] All queues have valid doctor relations.");
  }

  // 3. Audit Contradictory Emergency States
  const inconsistentEmergency = await prisma.doctor.findMany({
    where: {
      emergencyAvailable: false,
      clinicOperations: {
        isNot: null,
        emergencySlots: { gt: 0 }
      }
    },
    include: { clinicOperations: true }
  });

  if (inconsistentEmergency.length > 0) {
    console.log(`[!] Found ${inconsistentEmergency.length} Doctors with contradictory emergency states (emergencyAvailable=false, slots>0).`);
    for (const doc of inconsistentEmergency) {
       console.log(`    - Doctor: ${doc.name} (ID: ${doc.id}) | Slots: ${doc.clinicOperations.emergencySlots}`);
    }
    
    // Auto-fix if we run with --fix
    if (process.argv.includes('--fix')) {
       console.log("\n[FIX] Correcting inconsistent emergency states...");
       for (const doc of inconsistentEmergency) {
         await prisma.clinicOperations.update({
           where: { doctorId: doc.id },
           data: { emergencySlots: 0 }
         });
       }
       console.log("[FIX] Emergency states corrected.");
    }
  } else {
    console.log("[OK] All emergency states are consistent.");
  }

  // 4. Identify obvious test data
  const testDoctors = await prisma.doctor.findMany({
    where: {
      OR: [
        { name: { contains: "Test", mode: "insensitive" } },
        { hospitalName: { contains: "Test", mode: "insensitive" } },
        { clinicName: { contains: "Test", mode: "insensitive" } }
      ]
    },
    include: {
       dailyQueues: true,
       user: true
    }
  });

  if (testDoctors.length > 0) {
    console.log(`\n[!] Found ${testDoctors.length} suspected TEST Doctors/Clinics:`);
    for (const d of testDoctors) {
      console.log(`    - Dr. ${d.name} | Clinic: ${d.clinicName || d.hospitalName} | Queues: ${d.dailyQueues.length}`);
    }
    
    if (process.argv.includes('--prune-test')) {
      console.log("\n[FIX] Pruning test entities...");
      for (const d of testDoctors) {
        await prisma.doctor.delete({ where: { id: d.id } });
        if (d.user) {
           await prisma.user.delete({ where: { id: d.user.id } });
        }
      }
      console.log("[FIX] Test entities pruned.");
    } else {
      console.log("\nRun with '--prune-test' to delete test entities.");
    }
  } else {
    console.log("\n[OK] No suspected test data found.");
  }

  console.log("\nAudit Complete.");
}

run()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
