import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { 
      fullName, mobile, email, password, 
      gender, specialization, qualifications, experience, languages, fee, bio,
      practiceType, practiceName, practiceAddress, city, locality, contactNumber, workingDays, timings
    } = body;

    if (!fullName || !mobile || !password || !specialization || !city || !practiceName) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { phone: mobile }
    });

    if (existingUser) {
      if (existingUser.role === 'DOCTOR') {
        return NextResponse.json({ error: 'Doctor account with this mobile number already exists.' }, { status: 409 });
      }
      return NextResponse.json({ error: 'Mobile number already registered as a Patient. Please use a different number.' }, { status: 409 });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Ensure Specialty exists
    const specialtySlug = specialization.toLowerCase().replace(/[^a-z0-9]+/g, '-');
    const specialtyRecord = await prisma.specialty.upsert({
      where: { name: specialization },
      update: {},
      create: { name: specialization, slug: specialtySlug }
    });

    // Create the User & Doctor records in a Transaction
    const result = await prisma.$transaction(async (tx) => {
      const user = await tx.user.create({
        data: {
          phone: mobile,
          email: email || null,
          name: fullName,
          password: hashedPassword,
          role: 'DOCTOR',
          isVerified: true, // Auto-verify phone for now, but Doctor profile is PENDING
        }
      });

      const doctorSlug = `${fullName.toLowerCase().replace(/[^a-z0-9]+/g, '-')}-${Math.floor(Math.random() * 10000)}`;

      const doctor = await tx.doctor.create({
        data: {
          userId: user.id,
          name: fullName,
          slug: doctorSlug,
          bio: bio || null,
          experience: parseInt(experience) || 0,
          fee: parseInt(fee) || 0,
          district: city,
          hospitalName: practiceName,
          gender: gender || null,
          languages: languages ? languages.split(',').map((l: string) => l.trim()).filter(Boolean) : [],
          education: qualifications,
          specialtyIds: [specialtyRecord.id],
          verificationStatus: 'PENDING',
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

    // Generate JWT Auth Token
    const jwtSecret = process.env.JWT_SECRET;
    if (!jwtSecret) throw new Error("JWT_SECRET missing");

    const payload = { id: result.user.id, role: result.user.role };
    const token = jwt.sign(payload, jwtSecret, { expiresIn: '7d' });

    const response = NextResponse.json({
      success: true,
      message: 'Doctor profile created successfully.',
      token,
      user: {
        id: result.user.id,
        phone: result.user.phone,
        name: result.user.name,
        role: result.user.role,
        doctorId: result.doctor.id
      }
    });

    // Set secure cookie
    response.cookies.set('auth-token', token, {
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
