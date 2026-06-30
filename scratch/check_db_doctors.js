const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

async function main() {
  const doctors = await prisma.doctor.findMany({
    select: {
      id: true,
      name: true,
      speciality: true,
      clinicDistrict: true,
      verificationStatus: true,
      availabilityStatus: true,
      isAcceptingBookings: true,
    }
  });
  console.log("DB Doctors:", JSON.stringify(doctors, null, 2));
}

main().catch(console.error).finally(() => prisma.$disconnect());
