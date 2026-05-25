import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';

// Load env from .env.local to hit the production DB
dotenv.config({ path: '.env.local' });

const prisma = new PrismaClient();

async function main() {
  const newPassword = 'AdminPassword123!';
  const hashedPassword = await bcrypt.hash(newPassword, 10);
  
  const adminEmail = 'admin@jivnicare.com';

  // Find existing admin
  let user = await prisma.user.findFirst({
    where: {
      OR: [
        { email: adminEmail },
        { phone: 'admin' },
        { role: 'ADMIN' }
      ]
    }
  });

  if (user) {
    await prisma.user.update({
      where: { id: user.id },
      data: {
        email: adminEmail,
        password: hashedPassword,
        isVerified: true,
        role: 'ADMIN'
      }
    });
    console.log(`✅ Admin updated in production DB!`);
    console.log(`Email/ID: ${adminEmail}`);
    console.log(`New Password: ${newPassword}`);
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
    console.log(`✅ Admin created in production DB!`);
    console.log(`Email/ID: ${adminEmail}`);
    console.log(`New Password: ${newPassword}`);
  }
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
