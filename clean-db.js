const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log("Connecting to database for sparse index setup...");
  try {
    // 1. Unset null fields
    console.log("Unsetting leadId where it is null...");
    await prisma.$runCommandRaw({
      update: "User",
      updates: [{ q: { leadId: null }, u: { $unset: { leadId: "" } }, multi: true }]
    });

    console.log("Unsetting medicalRegistrationNumber where it is null...");
    await prisma.$runCommandRaw({
      update: "Doctor",
      updates: [{ q: { medicalRegistrationNumber: null }, u: { $unset: { medicalRegistrationNumber: "" } }, multi: true }]
    });

    // 2. Drop existing non-sparse unique indexes if they exist
    console.log("Dropping index User_leadId_key...");
    try {
      await prisma.$runCommandRaw({
        dropIndexes: "User",
        index: "User_leadId_key"
      });
      console.log("Dropped User_leadId_key successfully.");
    } catch (e) {
      console.log("User_leadId_key index might not exist or drop failed:", e.message);
    }

    console.log("Dropping index Doctor_medicalRegistrationNumber_key...");
    try {
      await prisma.$runCommandRaw({
        dropIndexes: "Doctor",
        index: "Doctor_medicalRegistrationNumber_key"
      });
      console.log("Dropped Doctor_medicalRegistrationNumber_key successfully.");
    } catch (e) {
      console.log("Doctor_medicalRegistrationNumber_key index might not exist or drop failed:", e.message);
    }

    // 3. Recreate them as unique and SPARSE indexes
    console.log("Creating unique sparse index User_leadId_key...");
    const createIndexUser = await prisma.$runCommandRaw({
      createIndexes: "User",
      indexes: [
        {
          key: { leadId: 1 },
          name: "User_leadId_key",
          unique: true,
          sparse: true
        }
      ]
    });
    console.log("Create sparse User index result:", createIndexUser);

    console.log("Creating unique sparse index Doctor_medicalRegistrationNumber_key...");
    const createIndexDoctor = await prisma.$runCommandRaw({
      createIndexes: "Doctor",
      indexes: [
        {
          key: { medicalRegistrationNumber: 1 },
          name: "Doctor_medicalRegistrationNumber_key",
          unique: true,
          sparse: true
        }
      ]
    });
    console.log("Create sparse Doctor index result:", createIndexDoctor);

    console.log("All indexes successfully updated to unique and sparse!");
  } catch (error) {
    console.error("Index modification failed:", error);
  } finally {
    await prisma.$disconnect();
  }
}

main();
