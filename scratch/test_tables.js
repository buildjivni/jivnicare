const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function run() {
  console.log("Listing all tables in the neondb public schema...");
  try {
    const tables = await prisma.$queryRaw`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema='public'
    `;
    console.log("Tables found:", tables);
  } catch (err) {
    console.error("Error querying information_schema:", err);
  } finally {
    await prisma.$disconnect();
  }
}

run();
