const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function auditDatabase() {
  console.log('=== JIVNICARE PRE-PILOT DATABASE AUDIT ===\n');

  // Count all entities
  const [
    totalUsers,
    totalDoctors,
    totalPatientProfiles,
    totalDailyQueues,
    totalQueueTokens,
    totalWalkInEntries,
    totalOtpTokens,
    totalLeadCaptures,
    totalSavedDoctors,
    totalNotifications,
    totalSearchAnalytics,
    totalProfileAnalytics,
    totalModerationLogs,
    totalProfileUpdateLogs,
    totalMedia,
    totalSpecialties,
    totalKeywords,
    totalHospitals,
    totalReports,
    totalRateLimits,
    totalSystemCounters,
    totalClinicOperations,
    totalWeeklySchedules,
  ] = await Promise.all([
    prisma.user.count(),
    prisma.doctor.count(),
    prisma.patientProfile.count(),
    prisma.dailyQueue.count(),
    prisma.queueToken.count(),
    prisma.walkInEntry.count(),
    prisma.otpToken.count(),
    prisma.leadCapture.count(),
    prisma.savedDoctor.count(),
    prisma.notification.count(),
    prisma.searchAnalytics.count(),
    prisma.profileAnalytics.count(),
    prisma.moderationLog.count(),
    prisma.profileUpdateLog.count(),
    prisma.media.count(),
    prisma.specialty.count(),
    prisma.keyword.count(),
    prisma.hospital.count(),
    prisma.report.count(),
    prisma.rateLimit.count(),
    prisma.systemCounter.count(),
    prisma.clinicOperations.count(),
    prisma.weeklySchedule.count(),
  ]);

  console.log('=== ENTITY COUNTS ===');
  console.log(`Users (All Roles):         ${totalUsers}`);
  console.log(`Doctors:                   ${totalDoctors}`);
  console.log(`Patient Profiles:          ${totalPatientProfiles}`);
  console.log(`Daily Queues:              ${totalDailyQueues}`);
  console.log(`Queue Tokens:              ${totalQueueTokens}`);
  console.log(`Walk-in Entries:           ${totalWalkInEntries}`);
  console.log(`OTP Records:               ${totalOtpTokens}`);
  console.log(`Lead Captures:             ${totalLeadCaptures}`);
  console.log(`Saved Doctors:             ${totalSavedDoctors}`);
  console.log(`Notifications:             ${totalNotifications}`);
  console.log(`Search Analytics:          ${totalSearchAnalytics}`);
  console.log(`Profile Analytics:         ${totalProfileAnalytics}`);
  console.log(`Moderation Logs:           ${totalModerationLogs}`);
  console.log(`Profile Update Logs:       ${totalProfileUpdateLogs}`);
  console.log(`Media Files:               ${totalMedia}`);
  console.log(`Specialties (KEEP):        ${totalSpecialties}`);
  console.log(`Keywords (KEEP):           ${totalKeywords}`);
  console.log(`Hospitals:                 ${totalHospitals}`);
  console.log(`Reports:                   ${totalReports}`);
  console.log(`Rate Limits:               ${totalRateLimits}`);
  console.log(`System Counters (KEEP):    ${totalSystemCounters}`);
  console.log(`Clinic Operations:         ${totalClinicOperations}`);
  console.log(`Weekly Schedules:          ${totalWeeklySchedules}`);

  // Fetch all users with role info
  console.log('\n=== ALL USERS (for classification) ===');
  const allUsers = await prisma.user.findMany({
    select: {
      id: true,
      phone: true,
      name: true,
      role: true,
      email: true,
      createdAt: true,
      doctor: {
        select: {
          name: true,
          slug: true,
          verificationStatus: true,
          district: true,
          hospitalName: true,
          medicalRegistrationNumber: true,
          experience: true,
        }
      }
    },
    orderBy: { createdAt: 'desc' }
  });

  allUsers.forEach(u => {
    const doctorInfo = u.doctor ? ` | Doctor: ${u.doctor.name} | Status: ${u.doctor.verificationStatus} | Reg: ${u.doctor.medicalRegistrationNumber || 'N/A'} | Hospital: ${u.doctor.hospitalName} | District: ${u.doctor.district}` : '';
    console.log(`[${u.role}] ${u.name || 'NO_NAME'} | Phone: ${u.phone} | Email: ${u.email || 'N/A'} | Created: ${u.createdAt.toISOString().split('T')[0]}${doctorInfo}`);
  });

  // Fetch all daily queues
  console.log('\n=== ALL DAILY QUEUES ===');
  const allQueues = await prisma.dailyQueue.findMany({
    select: {
      id: true,
      date: true,
      status: true,
      issuedTokensCount: true,
      cancelledCount: true,
      noShowCount: true,
      doctor: {
        select: { name: true }
      }
    },
    orderBy: { date: 'desc' }
  });
  allQueues.forEach(q => {
    console.log(`Doctor: ${q.doctor.name} | Date: ${q.date.toISOString().split('T')[0]} | Status: ${q.status} | Issued: ${q.issuedTokensCount} | Cancelled: ${q.cancelledCount} | NoShow: ${q.noShowCount}`);
  });

  // Fetch lead captures
  console.log('\n=== ALL LEAD CAPTURES ===');
  const allLeads = await prisma.leadCapture.findMany({
    select: {
      id: true,
      phone: true,
      name: true,
      city: true,
      roleInterest: true,
      specialty: true,
      clinicName: true,
      source: true,
      status: true,
      createdAt: true,
    },
    orderBy: { createdAt: 'desc' }
  });
  allLeads.forEach(l => {
    console.log(`[${l.status}] ${l.name || 'NO_NAME'} | Phone: ${l.phone} | City: ${l.city || 'N/A'} | Role: ${l.roleInterest || 'N/A'} | Specialty: ${l.specialty || 'N/A'} | Clinic: ${l.clinicName || 'N/A'} | Source: ${l.source || 'N/A'} | Created: ${l.createdAt.toISOString().split('T')[0]}`);
  });

  // Walk-in entries
  console.log('\n=== WALK-IN ENTRIES ===');
  const walkIns = await prisma.walkInEntry.findMany({
    select: {
      id: true,
      patientName: true,
      phoneNumber: true,
      symptoms: true,
      isEmergency: true,
      createdAt: true,
    },
    orderBy: { createdAt: 'desc' }
  });
  walkIns.forEach(w => {
    console.log(`Name: ${w.patientName} | Phone: ${w.phoneNumber || 'N/A'} | Symptoms: ${w.symptoms || 'N/A'} | Emergency: ${w.isEmergency} | Created: ${w.createdAt.toISOString().split('T')[0]}`);
  });

  await prisma.$disconnect();
  console.log('\n=== AUDIT COMPLETE ===');
}

auditDatabase().catch(e => {
  console.error('Audit failed:', e);
  process.exit(1);
});
