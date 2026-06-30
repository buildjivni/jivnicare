process.env.DATABASE_URL = "postgresql://neondb_owner:npg_a0zvZlk7fXeD@18.138.49.39/neondb?sslmode=require&sslaccept=accept_invalid_certs&connection_limit=5&connect_timeout=30&options=project%3Dep-proud-heart-aogniepy";

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function testConn() {
  try {
    console.log("Connecting to Neon DB...");
    const doctorCount = await prisma.doctor.count();
    console.log(`Connection successful! Total Doctors: ${doctorCount}`);
    
    const sampleDoctors = await prisma.doctor.findMany({ take: 2 });
    console.log("Sample Doctors:", sampleDoctors.map(d => ({ id: d.id, name: d.name, speciality: d.speciality })));
  } catch (err) {
    console.error("Connection failed:", err);
  } finally {
    await prisma.$disconnect();
  }
}

testConn();
