const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function cleanup() {
  console.log('=== JIVNICARE PRE-PILOT CLEANUP ===\n');
  console.log('Deleting ALL patient and doctor data...\n');

  // Step 1: Delete QueueTokens (linked to users & queues)
  const d1 = await prisma.queueToken.deleteMany({});
  console.log(`[1/14] Deleted QueueTokens:        ${d1.count}`);

  // Step 2: Delete WalkInEntries
  const d2 = await prisma.walkInEntry.deleteMany({});
  console.log(`[2/14] Deleted WalkInEntries:       ${d2.count}`);

  // Step 3: Delete DailyQueues (linked to doctors)
  const d3 = await prisma.dailyQueue.deleteMany({});
  console.log(`[3/14] Deleted DailyQueues:         ${d3.count}`);

  // Step 4: Delete SavedDoctors
  const d4 = await prisma.savedDoctor.deleteMany({});
  console.log(`[4/14] Deleted SavedDoctors:        ${d4.count}`);

  // Step 5: Delete Notifications for patients and doctors
  const d5 = await prisma.notification.deleteMany({
    where: {
      user: { role: { in: ['PATIENT', 'DOCTOR'] } }
    }
  });
  console.log(`[5/14] Deleted Notifications:       ${d5.count}`);

  // Step 6: Delete ProfileUpdateLogs (linked to doctors)
  const d6 = await prisma.profileUpdateLog.deleteMany({});
  console.log(`[6/14] Deleted ProfileUpdateLogs:   ${d6.count}`);

  // Step 7: Delete ClinicOperations (linked to doctors)
  const d7 = await prisma.clinicOperations.deleteMany({});
  console.log(`[7/14] Deleted ClinicOperations:    ${d7.count}`);

  // Step 8: Delete WeeklySchedules (linked to doctors)
  const d8 = await prisma.weeklySchedule.deleteMany({});
  console.log(`[8/14] Deleted WeeklySchedules:     ${d8.count}`);

  // Step 9: Delete PatientProfiles
  const d9 = await prisma.patientProfile.deleteMany({});
  console.log(`[9/14] Deleted PatientProfiles:     ${d9.count}`);

  // Step 10: Delete Media (for doctors/patients)
  const d10 = await prisma.media.deleteMany({
    where: {
      user: { role: { in: ['PATIENT', 'DOCTOR'] } }
    }
  });
  console.log(`[10/14] Deleted Media:              ${d10.count}`);

  // Step 11: Delete NotificationPreferences
  const d11 = await prisma.notificationPreference.deleteMany({
    where: {
      user: { role: { in: ['PATIENT', 'DOCTOR'] } }
    }
  });
  console.log(`[11/14] Deleted NotifPreferences:   ${d11.count}`);

  // Step 12: Delete Doctor records (before deleting User rows)
  const d12 = await prisma.doctor.deleteMany({});
  console.log(`[12/14] Deleted Doctor records:     ${d12.count}`);

  // Step 13: Delete all Patient Users
  const d13 = await prisma.user.deleteMany({
    where: { role: 'PATIENT' }
  });
  console.log(`[13/14] Deleted Patient Users:      ${d13.count}`);

  // Step 14: Delete all Doctor Users (User row)
  const d14 = await prisma.user.deleteMany({
    where: { role: 'DOCTOR' }
  });
  console.log(`[14/14] Deleted Doctor Users:       ${d14.count}`);

  console.log('\n=== CLEANUP COMPLETE ===\n');

  // Post-cleanup verification
  console.log('=== POST-CLEANUP COUNTS ===');
  const [users, doctors, patients, queues, tokens, walkIns, otps, specialties, keywords, systemCounters, clinicOps, weeklySchedules, notifications, analytics] = await Promise.all([
    prisma.user.count(),
    prisma.doctor.count(),
    prisma.patientProfile.count(),
    prisma.dailyQueue.count(),
    prisma.queueToken.count(),
    prisma.walkInEntry.count(),
    prisma.otpToken.count(),
    prisma.specialty.count(),
    prisma.keyword.count(),
    prisma.systemCounter.count(),
    prisma.clinicOperations.count(),
    prisma.weeklySchedule.count(),
    prisma.notification.count(),
    prisma.searchAnalytics.count(),
  ]);

  console.log(`Users (remaining):         ${users}`);
  console.log(`Doctors:                   ${doctors}`);
  console.log(`Patient Profiles:          ${patients}`);
  console.log(`Daily Queues:              ${queues}`);
  console.log(`Queue Tokens:              ${tokens}`);
  console.log(`Walk-in Entries:           ${walkIns}`);
  console.log(`OTP Records (kept):        ${otps}`);
  console.log(`Specialties (kept):        ${specialties}`);
  console.log(`Keywords (kept):           ${keywords}`);
  console.log(`System Counters (kept):    ${systemCounters}`);
  console.log(`Clinic Operations:         ${clinicOps}`);
  console.log(`Weekly Schedules:          ${weeklySchedules}`);
  console.log(`Notifications:             ${notifications}`);
  console.log(`Search Analytics:          ${analytics}`);

  // Print remaining users
  console.log('\n=== REMAINING USERS ===');
  const remaining = await prisma.user.findMany({
    select: { id: true, name: true, phone: true, role: true, email: true }
  });
  remaining.forEach(u => {
    console.log(`[${u.role}] ${u.name || 'NO_NAME'} | Phone: ${u.phone} | Email: ${u.email || 'N/A'}`);
  });

  await prisma.$disconnect();
  console.log('\n=== DATABASE RESET COMPLETE ===');
}

cleanup().catch(e => {
  console.error('Cleanup failed:', e.message);
  process.exit(1);
});
