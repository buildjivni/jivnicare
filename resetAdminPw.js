const bcrypt = require('bcryptjs');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const hash = await bcrypt.hash('admin123', 10);
  await prisma.user.updateMany({
    where: { role: 'ADMIN' },
    data: { password: hash }
  });
  console.log("Password successfully reset to admin123");
}

main().finally(() => prisma.$disconnect());
