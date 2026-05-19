import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { cookies } from 'next/headers';
import { VerificationStatus } from '@prisma/client';
import { step1OnboardSchema, formatZodError } from '@/lib/validations';
import { generateDoctorSlug, generateAlternateSlug, generateShortCode, generateSequentialDoctorCode } from '@/lib/slug';
import { normalizeQualifications, normalizeSpecialty } from '@/lib/normalizers';

async function geocodeAddress(addressString: string): Promise<{ lat: number, lng: number } | null> {
  try {
    const query = encodeURIComponent(addressString.trim());
    if (!query) return null;
    const res = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${query}&limit=1`, {
      headers: { 'User-Agent': 'JivniCare-Geo-Sync/1.0' }
    });
    const data = await res.json();
    if (data && data.length > 0) {
      return { lat: parseFloat(data[0].lat), lng: parseFloat(data[0].lon) };
    }
  } catch(e) {
    console.error("Geocoding failed:", e);
  }
  return null;
}

export async function POST(request: Request) {
  try {
    const body = await request.json();

    // Type coercion for numbers
    if (body.experience !== undefined && body.experience !== null && body.experience !== "") {
      body.experience = parseInt(String(body.experience), 10);
    }
    if (body.registrationYear !== undefined && body.registrationYear !== null && body.registrationYear !== "") {
      body.registrationYear = parseInt(String(body.registrationYear), 10);
    }

    const validation = step1OnboardSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json({ error: 'Validation failed: ' + formatZodError(validation.error) }, { status: 400 });
    }

    const data = validation.data;

    // 1. Check if phone is already registered
    let user = await prisma.user.findUnique({ where: { phone: data.contactNumber } });
    if (user && user.role === 'DOCTOR') {
      return NextResponse.json({ error: 'Phone number is already registered as a Partner. Please login.' }, { status: 409 });
    }

    // 2. Check medical registration uniqueness
    const regNumberUpper = data.medicalRegistrationNumber.toUpperCase();
    const existingReg = await prisma.doctor.findFirst({
      where: { medicalRegistrationNumber: regNumberUpper }
    });
    if (existingReg) {
      return NextResponse.json({ error: `Medical Registration Number "${regNumberUpper}" is already registered.` }, { status: 400 });
    }

    // 3. Geocode Address - Use GPS coordinates from frontend if available, else server geocode
    let latitude: number | null = data.latitude || null;
    let longitude: number | null = data.longitude || null;
    if (!latitude || !longitude) {
      const fullAddrStr = [data.practiceAddress, data.locality, data.city, data.state, data.pincode].filter(Boolean).join(", ");
      const coords = await geocodeAddress(fullAddrStr);
      latitude = coords?.lat || null;
      longitude = coords?.lng || null;
    }

    // 4. Hash Password
    const hashedPassword = await bcrypt.hash(data.password, 10);

    // 5. Specialty Setup
    const normalizedSpec = normalizeSpecialty(data.specialization);
    const specialtySlug = normalizedSpec.toLowerCase().replace(/[^a-z0-9]+/g, '-');
    const specialtyRecord = await prisma.specialty.upsert({
      where: { name: normalizedSpec },
      update: {},
      create: { name: normalizedSpec, slug: specialtySlug }
    });

    // 5b. Auto-generate search keywords from onboarding data
    // This ensures the doctor is immediately discoverable after registration
    const rawKeywordTerms = new Set<string>();
    // From specialty
    rawKeywordTerms.add(normalizedSpec.toLowerCase());
    rawKeywordTerms.add(specialtySlug);
    // From location (for local search like "doctor in Patna", "Boring Road doctor")
    if (data.city) rawKeywordTerms.add(data.city.toLowerCase());
    if (data.locality) rawKeywordTerms.add(data.locality.toLowerCase());
    if (data.district) rawKeywordTerms.add(data.district.toLowerCase());
    if (data.state) rawKeywordTerms.add(data.state.toLowerCase());
    // From qualifications (for "MBBS doctor", "MD doctor" searches)
    const quals = normalizeQualifications(data.qualifications);
    quals.split(',').forEach(q => q.trim() && rawKeywordTerms.add(q.trim().toLowerCase()));
    // Doctor name variants
    const firstName = data.fullName.replace(/^Dr\.?\s*/i, '').split(' ')[0];
    if (firstName) rawKeywordTerms.add(firstName.toLowerCase());

    // Upsert keyword records and collect their IDs
    const keywordIds: string[] = [];
    for (const term of rawKeywordTerms) {
      if (!term || term.length < 2) continue;
      const kw = await prisma.keyword.upsert({
        where: { term },
        update: {},
        create: { term }
      });
      keywordIds.push(kw.id);
    }

    // 6. Transaction: Create/Update User and Doctor
    const result = await prisma.$transaction(async (tx) => {
      if (user) {
        user = await tx.user.update({
          where: { id: user.id },
          data: { role: 'DOCTOR', name: data.fullName, email: data.email, password: hashedPassword }
        });
      } else {
        user = await tx.user.create({
          data: { phone: data.contactNumber, role: 'DOCTOR', name: data.fullName, email: data.email, password: hashedPassword }
        });
      }

      // Generate Slugs and Codes
      const doctorCode = await generateSequentialDoctorCode(tx);
      const nameSlug = data.fullName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
      let doctorSlug = `dr-${nameSlug}-${doctorCode.toLowerCase()}`;
      
      let shortCode = generateShortCode();
      for (let attempt = 0; attempt < 5; attempt++) {
        const exists = await tx.doctor.findFirst({ where: { shortCode } });
        if (!exists) break;
        shortCode = generateShortCode();
      }

      const expYears = data.experience || 0;
      const verifiedBadgeLabel = expYears >= 15 ? 'Experienced Partner' : expYears >= 5 ? 'Verified Doctor' : 'Clinic Verified';

      const doctor = await tx.doctor.create({
        data: {
          userId: user.id,
          name: data.fullName,
          slug: doctorSlug,
          shortCode,
          doctorCode,
          experience: expYears,
          district: data.district,
          hospitalName: data.practiceName,
          clinicName: data.practiceName,
          fullAddress: data.practiceAddress,
          locality: data.locality,
          city: data.city,
          state: data.state,
          pincode: data.pincode,
          latitude,
          longitude,
          gender: data.gender,
          education: normalizeQualifications(data.qualifications),
          qualifications: normalizeQualifications(data.qualifications),
          specialtyIds: [specialtyRecord.id],
          keywordIds: keywordIds,
          verificationStatus: VerificationStatus.DRAFT,
          medicalRegistrationNumber: regNumberUpper,
          medicalCouncil: data.medicalCouncil,
          registrationYear: data.registrationYear,
          dateOfBirth: new Date(data.dateOfBirth),
          primarySpecialtyId: specialtyRecord.id,
          verifiedBadgeLabel,
        }
      });

      // Init schedules
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

      await tx.clinicOperations.create({
        data: { doctorId: doctor.id, isClosedToday: false, pauseOnlineBooking: false, walkInLimit: 15, onlineLimit: 30 }
      });

      return { user, doctor };
    });

    // 7. Generate JWT
    const jwtSecret = process.env.JWT_SECRET || 'fallback-secret';
    const token = jwt.sign(
      { id: result.user.id, role: result.user.role, doctorId: result.doctor.id },
      jwtSecret,
      { expiresIn: '7d' }
    );

    const response = NextResponse.json({
      success: true,
      message: 'Step 1 complete.',
      user: { id: result.user.id, role: result.user.role, doctorId: result.doctor.id }
    });

    const cookieStore = await cookies();
    cookieStore.set('auth-token', token, {
      httpOnly: true, secure: process.env.NODE_ENV === 'production', sameSite: 'lax', path: '/', maxAge: 7 * 24 * 60 * 60
    });

    return response;

  } catch (error: any) {
    console.error('Doctor Onboard Step 1 Error:', error);
    return NextResponse.json({ error: 'Internal server error.' }, { status: 500 });
  }
}
