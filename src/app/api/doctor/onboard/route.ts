import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import jwt from 'jsonwebtoken';
import { cookies } from 'next/headers';
import { generateDoctorSlug, generateAlternateSlug, generateShortCode } from '@/lib/slug';

export async function POST(request: Request) {
  try {
    // 1. Authenticate user from JWT
    const cookieStore = await cookies();
    const token = cookieStore.get('auth-token')?.value;

    if (!token) {
      return NextResponse.json({ error: 'Unauthorized. Please verify your phone number first.' }, { status: 401 });
    }

    const jwtSecret = process.env.JWT_SECRET;
    if (!jwtSecret) throw new Error("JWT_SECRET missing");

    let decoded: any;
    try {
      decoded = jwt.verify(token, jwtSecret);
    } catch (err) {
      return NextResponse.json({ error: 'Invalid or expired session. Please log in again.' }, { status: 401 });
    }

    const userId = decoded.id;

    const existingUser = await prisma.user.findUnique({
      where: { id: userId }
    });

    if (!existingUser) {
      return NextResponse.json({ error: 'User account not found.' }, { status: 404 });
    }

    if (existingUser.role === 'DOCTOR') {
      return NextResponse.json({ error: 'You are already registered as a Doctor.' }, { status: 409 });
    }

    // 2. Parse Payload
    const body = await request.json();
    const { 
      fullName, gender, specialization, qualifications, experience, languages, fee, bio,
      practiceType, practiceName, practiceAddress, city, locality, contactNumber, workingDays, timings,
      profilePhotoUrl, medicalRegistrationUrl, clinicPhotoUrl
    } = body;

    if (!specialization || !city || !practiceName) {
      return NextResponse.json({ error: 'Missing required professional fields' }, { status: 400 });
    }

    // Ensure Specialty exists
    const specialtySlug = specialization.toLowerCase().replace(/[^a-z0-9]+/g, '-');
    const specialtyRecord = await prisma.specialty.upsert({
      where: { name: specialization },
      update: {},
      create: { name: specialization, slug: specialtySlug }
    });

    // 3. Create Doctor Record & Upgrade User in a Transaction
    const result = await prisma.$transaction(async (tx) => {
      // Upgrade User Role and update Name if provided
      const user = await tx.user.update({
        where: { id: userId },
        data: {
          role: 'DOCTOR',
          ...(fullName ? { name: fullName } : {})
        }
      });

      const safeName = fullName || existingUser.name || "doctor";
      
      // ── Deterministic + collision-safe slug generation ─────
      let doctorSlug = generateDoctorSlug(safeName, city);
      // Collision recovery: up to 3 retries with alternate suffixes
      for (let attempt = 0; attempt < 3; attempt++) {
        const exists = await tx.doctor.findUnique({ where: { slug: doctorSlug } });
        if (!exists) break;
        doctorSlug = generateAlternateSlug(doctorSlug);
      }

      // ── QR-ready short code generation ────────────────────
      let shortCode = generateShortCode();
      // Short code collision recovery
      for (let attempt = 0; attempt < 5; attempt++) {
        const exists = await tx.doctor.findFirst({ where: { shortCode } });
        if (!exists) break;
        shortCode = generateShortCode();
      }

      // ── Derive badge label from experience ─────────────────
      const expYears = parseInt(experience) || 0;
      const verifiedBadgeLabel = expYears >= 15
        ? 'Experienced Partner'
        : expYears >= 5
        ? 'Verified Doctor'
        : 'Clinic Verified';

      const doctor = await tx.doctor.create({
        data: {
          userId: user.id,
          name: safeName,
          slug: doctorSlug,
          shortCode,
          bio: bio || null,
          experience: parseInt(experience) || 0,
          fee: parseInt(fee) || 0,
          district: city,
          hospitalName: practiceName,
          gender: gender || null,
          languages: languages ? languages.split(',').map((l: string) => l.trim()).filter(Boolean) : [],
          education: qualifications,
          qualifications: qualifications,
          specialtyIds: [specialtyRecord.id],
          verificationStatus: 'PENDING',
          profileImage: profilePhotoUrl || null,
          clinicImage: clinicPhotoUrl || null,
          medicalRegistrationNumber: medicalRegistrationUrl || null,
          verifiedBadgeLabel,
        }
      });

      // Initialize Weekly Schedule based on timings (simple initialization)
      await tx.weeklySchedule.create({
        data: {
          doctorId: doctor.id,
          monday: { isOpen: true, start: "09:00", end: "17:00", maxPatients: 20 },
          tuesday: { isOpen: true, start: "09:00", end: "17:00", maxPatients: 20 },
          wednesday: { isOpen: true, start: "09:00", end: "17:00", maxPatients: 20 },
          thursday: { isOpen: true, start: "09:00", end: "17:00", maxPatients: 20 },
          friday: { isOpen: true, start: "09:00", end: "17:00", maxPatients: 20 },
          saturday: { isOpen: true, start: "09:00", end: "17:00", maxPatients: 20 },
          sunday: { isOpen: false, start: "00:00", end: "00:00", maxPatients: 0 }
        }
      });

      // Initialize Clinic Operations
      await tx.clinicOperations.create({
        data: {
          doctorId: doctor.id,
          isClosedToday: false,
          pauseOnlineBooking: false,
          walkInLimit: 15,
          onlineLimit: 30
        }
      });

      return { user, doctor };
    });

    // Generate NEW JWT Auth Token with DOCTOR role
    const payload = { id: result.user.id, role: result.user.role };
    const newToken = jwt.sign(payload, jwtSecret, { expiresIn: '7d' });

    const response = NextResponse.json({
      success: true,
      message: 'Doctor profile created successfully.',
      token: newToken,
      user: {
        id: result.user.id,
        phone: result.user.phone,
        name: result.user.name,
        role: result.user.role,
        doctorId: result.doctor.id
      }
    });

    // Set secure cookie with upgraded token
    response.cookies.set('auth-token', newToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60, // 7 days
      path: '/',
    });

    return response;
  } catch (error: any) {
    console.error('Doctor Onboarding Error:', error);
    return NextResponse.json(
      { error: 'Internal server error during onboarding.' },
      { status: 500 }
    );
  }
}
