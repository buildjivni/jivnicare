const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

async function check() {
  const docs = await prisma.doctor.findMany({
    where: { 
      verificationStatus: "VERIFIED",
      canShowOnPublic: true
    },
    select: {
      name: true,
      speciality: true,
      clinicCity: true,
      clinicDistrict: true,
      canShowOnPublic: true
    }
  });
  console.log("Public Verified Doctors:", JSON.stringify(docs, null, 2));
  await prisma.$disconnect();
}

check().catch(console.error);
