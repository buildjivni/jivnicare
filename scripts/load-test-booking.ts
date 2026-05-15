// @ts-nocheck
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function runLoadTest() {
  console.log('--- Starting JivniCare Concurrency Load Test ---');
  
  // 1. Find or create a mock doctor
  let doctor = await prisma.user.findFirst({
    where: { role: 'DOCTOR' },
    include: { doctor: true }
  });

  if (!doctor) {
    console.log('No doctor found. Creating mock doctor...');
    doctor = await prisma.user.create({
      data: {
        name: 'Dr. Load Tester',
        phone: '9999999999',
        role: 'DOCTOR',
        isVerified: true,
        password: 'mock',
        doctor: {
          create: {
            specialization: 'Testing',
            qualifications: 'PhD',
            experience: 10,
            fee: 500,
            practiceType: 'clinic',
            practiceName: 'Load Clinic',
            city: 'Patna',
            locality: 'Test Area'
          }
        }
      },
      include: { doctor: true }
    });
  }

  const doctorId = doctor.id;
  const clinicId = doctor.doctor?.id;
  
  if (!clinicId) {
    throw new Error("Doctor profile not found");
  }

  // 2. Mock 50 Patients
  console.log('Setting up 50 mock patients...');
  const patientIds: string[] = [];
  for (let i = 0; i < 50; i++) {
    const p = await prisma.user.upsert({
      where: { phone: `88888000${i.toString().padStart(2, '0')}` },
      update: {},
      create: {
        name: `Test Patient ${i}`,
        phone: `88888000${i.toString().padStart(2, '0')}`,
        role: 'PATIENT',
        password: 'mock'
      }
    });
    patientIds.push(p.id);
  }

  const startOfDay = new Date();
  startOfDay.setHours(0,0,0,0);

  // Ensure DailyQueue exists for today
  let dailyQueue = await prisma.dailyQueue.findFirst({
    where: { doctorId, date: startOfDay }
  });

  if (!dailyQueue) {
    dailyQueue = await prisma.dailyQueue.create({
      data: {
        doctorId,
        date: startOfDay,
        status: 'ACTIVE',
        maxCapacity: 100,
        currentActiveToken: 0,
        issuedTokensCount: 0
      }
    });
  }

  // Clear existing queue tokens for this queue
  await prisma.queueToken.deleteMany({
    where: { queueId: dailyQueue.id }
  });

  // Reset token counter
  await prisma.dailyQueue.update({
    where: { id: dailyQueue.id },
    data: { issuedTokensCount: 0, currentActiveToken: 0 }
  });

  console.log(`Starting concurrent booking requests for Doctor: ${doctor.name}...`);
  
  // 3. Fire 50 simultaneous booking requests using raw internal logic
  const promises = patientIds.map(async (pid) => {
    try {
      const result = await prisma.$transaction(async (tx) => {
        // Find existing
        const existing = await tx.queueToken.findFirst({
          where: { queueId: dailyQueue!.id, userId: pid, status: { in: ['WAITING', 'IN_CONSULTATION'] } }
        });
        if (existing) return { success: false, error: 'Already in queue' };

        // Atomically increment the issuedTokensCount
        const updatedQueue = await tx.dailyQueue.update({
          where: { id: dailyQueue!.id },
          data: { issuedTokensCount: { increment: 1 } },
        });

        const nextTokenNumber = updatedQueue.issuedTokensCount;

        // Create token
        const token = await tx.queueToken.create({
          data: {
            queueId: dailyQueue!.id,
            userId: pid,
            tokenNumber: nextTokenNumber,
            status: 'WAITING',
            source: 'ONLINE',
            estimatedTime: new Date(Date.now() + nextTokenNumber * 15 * 60000)
          }
        });
        return { success: true, token };
      });
      return result;
    } catch (error) {
      return { success: false, error: error instanceof Error ? error.message : 'Transaction failed' };
    }
  });

  const results = await Promise.all(promises);
  
  const successCount = results.filter(r => r.success).length;
  const failCount = results.filter(r => !r.success).length;

  console.log(`\n--- Results ---`);
  console.log(`Total Requests: 50`);
  console.log(`Successful Bookings: ${successCount}`);
  console.log(`Failed Bookings: ${failCount}`);

  if (failCount > 0) {
    const firstFail = results.find(r => !r.success);
    console.log(`First Failure Reason: ${firstFail?.error}`);
  }

  // Verify DB state
  const finalTokens = await prisma.queueToken.findMany({
    where: { queueId: dailyQueue.id },
    orderBy: { tokenNumber: 'asc' }
  });

  console.log(`Total Tokens created in DB: ${finalTokens.length}`);
  
  // Check for duplicates
  const numbers = finalTokens.map(t => t.tokenNumber);
  const uniqueNumbers = new Set(numbers);
  
  if (numbers.length === uniqueNumbers.size) {
    console.log('✅ PASS: No duplicate token numbers assigned.');
  } else {
    console.log('❌ FAIL: Duplicate token numbers detected!');
  }

  // Cleanup mocked patients
  // await prisma.user.deleteMany({ where: { phone: { startsWith: '88888' } } });

  console.log('--- Test Complete ---');
}

runLoadTest()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
