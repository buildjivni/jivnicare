import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const docs = await prisma.doctor.findMany({});
  console.log(`🔍 Total Doctors in DB: ${docs.length}`);
  for (const d of docs) {
    console.log(`- ${d.name} | Status: ${d.verificationStatus} | Code: ${JSON.stringify(d.doctorCode)}`);
  }
}

main().catch(console.error).finally(() => prisma.$disconnect());
