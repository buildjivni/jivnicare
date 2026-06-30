const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function check() {
  try {
    const rows = await prisma.$queryRawUnsafe(`
      SELECT pid, usename, application_name, client_addr, state, query 
      FROM pg_stat_activity
    `);
    
    console.log("\n--- Active Database Connections ---");
    console.log(rows);
  } catch (err) {
    console.error("Prisma query error:", err);
  } finally {
    await prisma.$disconnect();
  }
}

check();
