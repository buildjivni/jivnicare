const { PrismaClient, Role, VerificationStatus, TokenSource, TokenStatus, QueueStatus } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Starting JivniCare Database Seeding (MVP Corrections)...");

  // Safety guard
  if (process.env.NODE_ENV === "production") {
    console.error("⚠️  WARNING: Seeding in production is disabled for safety. Aborting.");
    process.exit(1);
  }

  // Generate a common hashed password for test accounts
  const hashedDoctorPassword = await bcrypt.hash('doctor123', 10);
  const hashedAdminPassword = await bcrypt.hash('admin123', 10);

  // ============================================================================
  // 1. ADMIN ACCOUNT
  // ============================================================================
  console.log("👤 Seeding Admin...");
  const adminPhone = "0000000000";
  const adminUser = await prisma.user.upsert({
    where: { phone: adminPhone },
    update: { isVerified: true, role: Role.ADMIN, password: hashedAdminPassword },
    create: {
      phone: adminPhone,
      name: "Super Admin",
      role: Role.ADMIN,
      password: hashedAdminPassword,
      isVerified: true,
    },
  });

  // ============================================================================
  // 2. TAXONOMY & KEYWORDS (Bihar specifics)
  // ============================================================================
  console.log("🏥 Seeding Specialties & Keywords...");
  
  const MASTER_SPECIALTIES_LIST = [
    { name: "General Physician", slug: "general-physician" },
    { name: "Dentist", slug: "dentist" },
    { name: "Dermatologist & Cosmetologist", slug: "dermatologist-cosmetologist" },
    { name: "Gynecologist & Obstetrician", slug: "gynecologist-obstetrician" },
    { name: "Pediatrician", slug: "pediatrician" },
    { name: "Orthopedic Surgeon", slug: "orthopedic-surgeon" },
    { name: "ENT Specialist", slug: "ent-specialist" },
    { name: "Ophthalmologist", slug: "ophthalmologist" },
    { name: "Cardiologist", slug: "cardiologist" },
    { name: "Diabetologist", slug: "diabetologist" },
    { name: "Psychiatrist & Psychologist", slug: "psychiatrist-psychologist" },
    { name: "Physiotherapist", slug: "physiotherapist" },
    { name: "Neurologist", slug: "neurologist" },
    { name: "Gastroenterologist", slug: "gastroenterologist" },
    { name: "Urologist", slug: "urologist" },
    { name: "Pulmonologist", slug: "pulmonologist" },
    { name: "Endocrinologist", slug: "endocrinologist" },
    { name: "Nephrologist", slug: "nephrologist" },
    { name: "Oncologist", slug: "oncologist" },
    { name: "Rheumatologist", slug: "rheumatologist" },
    { name: "Dietitian & Nutritionist", slug: "dietitian-nutritionist" },
    { name: "Sexologist", slug: "sexologist" },
    { name: "Hair & Skin Specialist", slug: "hair-skin-specialist" },
    { name: "Ayurvedic Doctor", slug: "ayurvedic-doctor" },
    { name: "Homeopathic Doctor", slug: "homeopathic-doctor" },
    { name: "Unani Specialist", slug: "unani-specialist" },
    { name: "Siddha Specialist", slug: "siddha-specialist" },
    { name: "Naturopath", slug: "naturopath" },
    { name: "Geriatrician", slug: "geriatrician" },
    { name: "Emergency Medicine Specialist", slug: "emergency-medicine-specialist" }
  ];

  const specialtyDbMap = {};
  for (const s of MASTER_SPECIALTIES_LIST) {
    const spec = await prisma.specialty.upsert({
      where: { slug: s.slug },
      update: {},
      create: { name: s.name, slug: s.slug }
    });
    specialtyDbMap[s.slug] = spec;
  }

  const specCardio = specialtyDbMap["cardiologist"];
  const specGeneral = specialtyDbMap["general-physician"];
  const specPeds = specialtyDbMap["pediatrician"];
  const specDerm = specialtyDbMap["dermatologist-cosmetologist"];

  const keywords = ["heart specialist", "dil ka doctor", "child doctor", "skin doctor", "diabetes", "fever"];
  const keywordDocs = await Promise.all(
    keywords.map(term => prisma.keyword.upsert({
      where: { term },
      update: {},
      create: { term }
    }))
  );

  // ============================================================================
  // 3. DOCTOR ACCOUNTS (With various statuses)
  // ============================================================================
  console.log("👨‍⚕️ Seeding Doctors...");
  
  // 3a. Doctor 1: Dr. Sanctuary (Cardiologist) - APPROVED
  const doc1Phone = "9999999991";
  const userDoc1 = await prisma.user.upsert({
    where: { phone: doc1Phone },
    update: { isVerified: true, role: Role.DOCTOR, password: hashedDoctorPassword },
    create: { phone: doc1Phone, name: "Dr. Sanctuary", role: Role.DOCTOR, password: hashedDoctorPassword, isVerified: true },
  });

  const doctor1 = await prisma.doctor.upsert({
    where: { userId: userDoc1.id },
    update: {
      verificationStatus: VerificationStatus.VERIFIED,
      specialtyIds: [specCardio.id],
      keywordIds: [keywordDocs.find(k => k.term === "dil ka doctor").id, keywordDocs.find(k => k.term === "heart specialist").id],
    },
    create: {
      userId: userDoc1.id,
      name: "Dr. Sanctuary",
      slug: "dr-sanctuary",
      bio: "Senior Cardiologist with 15 years of experience in complex surgeries.",
      experience: 15,
      fee: 1000,
      district: "Patna",
      hospitalName: "JivniCare Heart Institute",
      verificationStatus: VerificationStatus.VERIFIED,
      emergencyAvailable: true,
      specialtyIds: [specCardio.id],
      keywordIds: [keywordDocs.find(k => k.term === "dil ka doctor").id, keywordDocs.find(k => k.term === "heart specialist").id],
      isAcceptingAppointments: true,
      maxAppointmentsPerDay: 40,
    }
  });

  // 3b. Doctor 2: Dr. Sharma (General Physician) - APPROVED
  const doc2Phone = "9999999992";
  const userDoc2 = await prisma.user.upsert({
    where: { phone: doc2Phone },
    update: { isVerified: true, role: Role.DOCTOR, password: hashedDoctorPassword },
    create: { phone: doc2Phone, name: "Dr. Sharma", role: Role.DOCTOR, password: hashedDoctorPassword, isVerified: true },
  });

  const doctor2 = await prisma.doctor.upsert({
    where: { userId: userDoc2.id },
    update: {
      verificationStatus: VerificationStatus.VERIFIED,
      specialtyIds: [specGeneral.id],
      keywordIds: [keywordDocs.find(k => k.term === "fever").id, keywordDocs.find(k => k.term === "diabetes").id],
    },
    create: {
      userId: userDoc2.id,
      name: "Dr. Sharma",
      slug: "dr-sharma",
      bio: "Experienced General Physician treating everyday illnesses and wellness.",
      experience: 8,
      fee: 500,
      district: "Gaya",
      hospitalName: "City Care Clinic",
      verificationStatus: VerificationStatus.VERIFIED,
      emergencyAvailable: false,
      specialtyIds: [specGeneral.id],
      keywordIds: [keywordDocs.find(k => k.term === "fever").id, keywordDocs.find(k => k.term === "diabetes").id],
      isAcceptingAppointments: true,
    }
  });

  // 3c. Doctor 3: Dr. Verma (Pediatrician) - REJECTED
  const doc3Phone = "9999999993";
  const userDoc3 = await prisma.user.upsert({
    where: { phone: doc3Phone },
    update: { isVerified: true, role: Role.DOCTOR, password: hashedDoctorPassword },
    create: { phone: doc3Phone, name: "Dr. Verma", role: Role.DOCTOR, password: hashedDoctorPassword, isVerified: true },
  });

  const doctor3 = await prisma.doctor.upsert({
    where: { userId: userDoc3.id },
    update: { verificationStatus: VerificationStatus.REJECTED },
    create: {
      userId: userDoc3.id,
      name: "Dr. Verma",
      slug: "dr-verma",
      bio: "Child Specialist. Needs proper license verification.",
      experience: 5,
      fee: 400,
      district: "Muzaffarpur",
      hospitalName: "Kids Clinic",
      verificationStatus: VerificationStatus.REJECTED,
      specialtyIds: [specPeds.id],
      keywordIds: [keywordDocs.find(k => k.term === "child doctor").id],
      isAcceptingAppointments: false,
    }
  });

  // 3d. Doctor 4: Dr. Gupta (Dermatologist & Cosmetologist) - SUSPENDED
  const doc4Phone = "9999999994";
  const userDoc4 = await prisma.user.upsert({
    where: { phone: doc4Phone },
    update: { isVerified: true, role: Role.DOCTOR, password: hashedDoctorPassword },
    create: { phone: doc4Phone, name: "Dr. Gupta", role: Role.DOCTOR, password: hashedDoctorPassword, isVerified: true },
  });

  const doctor4 = await prisma.doctor.upsert({
    where: { userId: userDoc4.id },
    update: { verificationStatus: VerificationStatus.SUSPENDED },
    create: {
      userId: userDoc4.id,
      name: "Dr. Gupta",
      slug: "dr-gupta",
      bio: "Skin specialist.",
      experience: 12,
      fee: 600,
      district: "Patna",
      hospitalName: "Skin Care Hub",
      verificationStatus: VerificationStatus.SUSPENDED,
      specialtyIds: [specDerm.id],
      keywordIds: [keywordDocs.find(k => k.term === "skin doctor").id],
      isAcceptingAppointments: false,
    }
  });

  // ============================================================================
  // 4. DOCTOR OPERATIONS & SCHEDULE
  // ============================================================================
  console.log("⏱️  Seeding Schedules...");
  
  const scheduleTemplate = { isOpen: true, start: "09:00", end: "17:00", maxPatients: 40 };
  const closedTemplate = { isOpen: false, start: "", end: "", maxPatients: 0 };

  await prisma.weeklySchedule.upsert({
    where: { doctorId: doctor1.id },
    update: {},
    create: {
      doctorId: doctor1.id,
      monday: scheduleTemplate, tuesday: scheduleTemplate, wednesday: scheduleTemplate,
      thursday: scheduleTemplate, friday: scheduleTemplate, saturday: scheduleTemplate,
      sunday: closedTemplate
    }
  });

  await prisma.clinicOperations.upsert({
    where: { doctorId: doctor1.id },
    update: {},
    create: {
      doctorId: doctor1.id,
      isClosedToday: false, pauseOnlineBooking: false, walkInLimit: 20, onlineLimit: 20, emergencySlots: 5
    }
  });

  // ============================================================================
  // 5. TEST PATIENT ACCOUNTS
  // ============================================================================
  console.log("🩺 Seeding Patients...");
  const patient1Phone = "8888888881";
  const patient1 = await prisma.user.upsert({
    where: { phone: patient1Phone },
    update: { role: Role.PATIENT },
    create: { phone: patient1Phone, name: "Rahul Verma", role: Role.PATIENT, isVerified: true }
  });

  const patient2Phone = "8888888882";
  const patient2 = await prisma.user.upsert({
    where: { phone: patient2Phone },
    update: { role: Role.PATIENT },
    create: { phone: patient2Phone, name: "Sneha Gupta", role: Role.PATIENT, isVerified: true }
  });

  const patient3Phone = "8888888883";
  const patient3 = await prisma.user.upsert({
    where: { phone: patient3Phone },
    update: { role: Role.PATIENT },
    create: { phone: patient3Phone, name: "Amit Kumar", role: Role.PATIENT, isVerified: true }
  });

  const patient4Phone = "8888888884";
  const patient4 = await prisma.user.upsert({
    where: { phone: patient4Phone },
    update: { role: Role.PATIENT },
    create: { phone: patient4Phone, name: "Pooja Singh", role: Role.PATIENT, isVerified: true }
  });

  const patient5Phone = "8888888885";
  const patient5 = await prisma.user.upsert({
    where: { phone: patient5Phone },
    update: { role: Role.PATIENT },
    create: { phone: patient5Phone, name: "Vikas Yadav", role: Role.PATIENT, isVerified: true }
  });

  // ============================================================================
  // 6. BOOKINGS, QUEUES & TOKENS (For Doctor 1)
  // ============================================================================
  console.log("📅 Seeding Queues & Booking Varieties...");
  
  // Set date to today, normalized to midnight UTC
  const today = new Date();
  today.setUTCHours(0, 0, 0, 0);

  const dailyQueue = await prisma.dailyQueue.upsert({
    where: { doctorId_date: { doctorId: doctor1.id, date: today } },
    update: { status: QueueStatus.ACTIVE, currentActiveToken: 3 },
    create: {
      doctorId: doctor1.id,
      date: today,
      status: QueueStatus.ACTIVE,
      maxCapacity: 40,
      currentActiveToken: 3,
    }
  });

  // Create WalkIn profiles safely (find or create via a unique identifier if possible, else just create new ones and accept slight bloat)
  // For safety, we will just create them. If we want idempotency we should wipe the tokens for TODAY.
  // We will wipe the tokens *for this specific queue* to avoid infinite duplication.
  await prisma.queueToken.deleteMany({ where: { queueId: dailyQueue.id } });

  const walkIn1 = await prisma.walkInEntry.create({
    data: { patientName: "Aman Singh", phoneNumber: "7777777771", symptoms: "Chest pain" }
  });

  // Generate Tokens with Variety
  // Token 1: COMPLETED (Online)
  await prisma.queueToken.create({
    data: {
      queueId: dailyQueue.id,
      tokenNumber: 1,
      source: TokenSource.ONLINE,
      status: TokenStatus.COMPLETED,
      userId: patient1.id,
      tokenIssuedAt: new Date(Date.now() - 3600000), // 1 hour ago
    }
  });

  // Token 2: CANCELLED (Online)
  await prisma.queueToken.create({
    data: {
      queueId: dailyQueue.id,
      tokenNumber: 2,
      source: TokenSource.ONLINE,
      status: TokenStatus.CANCELLED,
      userId: patient2.id,
      tokenIssuedAt: new Date(Date.now() - 3000000), 
    }
  });

  // Token 3: IN_CONSULTATION (Walk-In, Emergency)
  await prisma.queueToken.create({
    data: {
      queueId: dailyQueue.id,
      tokenNumber: 3,
      source: TokenSource.WALK_IN,
      status: TokenStatus.IN_CONSULTATION,
      walkInEntryId: walkIn1.id,
      isEmergency: true,
      tokenIssuedAt: new Date(Date.now() - 1800000), // 30 mins ago
    }
  });

  // Token 4: WAITING (Online)
  await prisma.queueToken.create({
    data: {
      queueId: dailyQueue.id,
      tokenNumber: 4,
      source: TokenSource.ONLINE,
      status: TokenStatus.WAITING,
      userId: patient3.id,
      tokenIssuedAt: new Date(Date.now() - 900000), // 15 mins ago
      estimatedTime: new Date(Date.now() + 15 * 60000), // 15 mins from now
    }
  });

  // Token 5: SKIPPED (Online)
  await prisma.queueToken.create({
    data: {
      queueId: dailyQueue.id,
      tokenNumber: 5,
      source: TokenSource.ONLINE,
      status: TokenStatus.SKIPPED,
      userId: patient4.id,
      tokenIssuedAt: new Date(Date.now() - 800000), 
    }
  });

  console.log("✅ Seeding completed successfully!");
}

main()
  .catch((e) => {
    console.error("❌ Seeding Error:");
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
