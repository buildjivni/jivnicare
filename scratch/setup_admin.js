const { PrismaClient, Role } = require('@prisma/client');
const prisma = new PrismaClient();

async function run() {
  console.log("Checking database for Admin users...");
  try {
    const adminUsers = await prisma.user.findMany({
      where: { role: Role.ADMIN }
    });

    console.log("Current admin users in database:", adminUsers);

    // Let's upsert the admin user with email jivnicare@gmail.com
    console.log("Upserting admin user for jivnicare@gmail.com...");
    const targetEmail = "jivnicare@gmail.com";
    
    // Check if user already exists by email
    let user = await prisma.user.findFirst({
      where: { email: targetEmail }
    });

    if (user) {
      console.log("User already exists. Updating role to ADMIN...");
      user = await prisma.user.update({
        where: { id: user.id },
        data: {
          role: Role.ADMIN,
          name: "JivniCare Admin",
          isVerified: true,
          totpEnabled: false // Disable 2FA initially so they can setup cleanly
        }
      });
    } else {
      // Check if there is a seeded admin with null email to reuse
      const adminWithoutEmail = await prisma.user.findFirst({
        where: { role: Role.ADMIN, email: null }
      });

      if (adminWithoutEmail) {
        console.log("Found seeded admin without email. Updating with email...");
        user = await prisma.user.update({
          where: { id: adminWithoutEmail.id },
          data: {
            email: targetEmail,
            name: "JivniCare Admin",
            isVerified: true,
            totpEnabled: false
          }
        });
      } else {
        console.log("No seeded admin found. Creating new admin user...");
        user = await prisma.user.create({
          data: {
            phone: "8235351897", // Standard helpline phone
            email: targetEmail,
            name: "JivniCare Admin",
            role: Role.ADMIN,
            isVerified: true,
            totpEnabled: false
          }
        });
      }
    }

    console.log("Admin setup successful! Details:", user);
  } catch (err) {
    console.error("Error setting up admin in database:", err);
  } finally {
    await prisma.$disconnect();
  }
}

run();
