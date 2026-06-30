const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

async function check() {
  const docs = await prisma.doctor.findMany({
    where: { speciality: "Gastroenterologist" }
  });
  console.log("Gastroenterologists found:", JSON.stringify(docs, null, 2));
  await prisma.$disconnect();
}

check().catch(console.error);
