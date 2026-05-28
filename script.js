const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function run() {
  const doctors = await prisma.doctor.findMany({ include: { clinicOperations: true } });
  console.log('Doctors:', JSON.stringify(doctors.map(d => ({id: d.id, name: d.name, hospitalName: d.hospitalName, clinicName: d.clinicName, status: d.verificationStatus})), null, 2));

  const queues = await prisma.dailyQueue.findMany({ include: { doctor: { include: { clinicOperations: true } } } });
  console.log('Queues:', JSON.stringify(queues.map(q => ({id: q.id, date: q.date, docName: q.doctor.name, hospitalName: q.doctor.hospitalName, docStatus: q.doctor.verificationStatus})), null, 2));
}

run().finally(() => prisma.$disconnect());
