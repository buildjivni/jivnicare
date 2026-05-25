// Reset Admin Password - uses production Atlas DB from .env.local
// Usage: node scripts/reset-admin-password.cjs

const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

// FORCE override DATABASE_URL to Atlas before PrismaClient loads
process.env.DATABASE_URL = "mongodb+srv://jivnicare26_db_user:JIA1PCd1JSvZCjvl@jivnicare.xih0e5s.mongodb.net/jivnicare";

const prisma = new PrismaClient();

async function main() {
  const newPassword = 'JivniAdmin@2026';
  const hashedPassword = await bcrypt.hash(newPassword, 10);
  const adminEmail = 'admin@jivnicare.com';

  console.log('🔍 Connecting to Atlas DB...');

  // Find any existing admin user
  const user = await prisma.user.findFirst({
    where: { role: 'ADMIN' }
  });

  if (user) {
    await prisma.user.update({
      where: { id: user.id },
      data: {
        email: adminEmail,
        password: hashedPassword,
        isVerified: true,
      }
    });
    console.log(`\n✅ Admin password UPDATED!`);
  } else {
    await prisma.user.create({
      data: {
        email: adminEmail,
        phone: 'admin',
        password: hashedPassword,
        role: 'ADMIN',
        name: 'JivniCare Admin',
        isVerified: true
      }
    });
    console.log(`\n✅ Admin user CREATED!`);
  }

  console.log(`📧 Email   : ${adminEmail}`);
  console.log(`🔑 Password: ${newPassword}`);
}

main()
  .catch(e => { console.error('❌ Error:', e.message); process.exit(1); })
  .finally(() => prisma.$disconnect());
