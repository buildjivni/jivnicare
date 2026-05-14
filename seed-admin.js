// Run this script ONCE to create/update the admin user in MongoDB
// Usage: node seed-admin.js

const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function seedAdmin() {
  const adminPhone = 'admin'; // Special identifier for admin
  const password = 'Admin@JivniCare2024';
  const name = 'JivniCare Admin';

  const hashedPassword = await bcrypt.hash(password, 10);

  const existing = await prisma.user.findFirst({ where: { role: 'ADMIN' } });

  if (existing) {
    const updated = await prisma.user.update({
      where: { id: existing.id },
      data: { 
        name,
        password: hashedPassword,
        isVerified: true,
      },
    });
    console.log('✅ Admin user UPDATED, id:', updated.id, '| name:', updated.name);
  } else {
    const created = await prisma.user.create({
      data: {
        phone: adminPhone,
        name,
        password: hashedPassword,
        role: 'ADMIN',
        isVerified: true,
      },
    });
    console.log('✅ Admin user CREATED, id:', created.id);
  }

  await prisma.$disconnect();
}

seedAdmin().catch(e => {
  console.error('❌ Error:', e);
  process.exit(1);
});
