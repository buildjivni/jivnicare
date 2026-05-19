import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import jwt from 'jsonwebtoken';
import { cookies } from 'next/headers';
import { VerificationStatus } from '@prisma/client';

import { generateDoctorSlug, generateAlternateSlug, generateShortCode, generateSequentialDoctorCode } from '@/lib/slug';
import { doctorOnboardSchema, formatZodError } from '@/lib/validations';
import { z } from 'zod';
import { normalizeQualifications, normalizeSpecialty, normalizeLanguages } from '@/lib/normalizers';

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

const draftSchema = z.object({
  fullName: z.string().min(2, "Name must be at least 2 characters").max(100).regex(/^[a-zA-Z\s\.]+$/, "Letters, spaces, and periods only").optional(),
  gender: z.enum(["Male", "Female", "Other", ""]).optional(),
  specialization: z.string().max(100).optional(),
  qualifications: z.string().max(200).optional(),
  experience: z.number().int().min(0).max(65).optional(),
  languages: z.string().max(200).optional(),
  fee: z.number().int().min(0).max(5000).optional(),
  bio: z.string().max(1000).optional().nullable(),
  practiceType: z.enum(["clinic", "hospital"]).optional(),
  practiceName: z.string().max(150).optional(),
  practiceAddress: z.string().max(300).optional().nullable(),
  landmark: z.string().max(150).optional().nullable(),
  city: z.string().max(100).optional(),
  district: z.string().max(100).optional(),
  state: z.string().max(100).optional(),
  pincode: z.string().max(10).optional(),
  locality: z.string().max(100).optional(),
  contactNumber: z.string().regex(/^\d{10}$/, "10-digit number only").optional().nullable().or(z.literal("")),
  profilePhotoUrl: z.string().url("Valid URL required").optional().nullable().or(z.literal("")),
  medicalRegistrationUrl: z.string().min(2).optional().nullable().or(z.literal("")),
  medicalRegistrationNumber: z.string().max(30).optional().nullable(),
  medicalCouncil: z.string().max(150).optional().nullable(),
  registrationYear: z.number().int().optional().nullable(),
  dateOfBirth: z.string().or(z.date()).optional().nullable(),
  primarySpecialtyId: z.string().optional().nullable(),
  govtIdentityReference: z.string().max(50).optional().nullable(),
  clinicPhotoUrl: z.string().url("Valid URL required").optional().nullable().or(z.literal("")),
});

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

    // 2. Parse and Validate Payload strictly
    const body = await request.json();
    const isDraft = body.isDraft === true;

    // Safely preprocess numeric fields to prevent string-to-number type mismatch,
    // while keeping strict validation (invalid strings convert to NaN and get rejected)
    if (body.experience !== undefined && body.experience !== null && body.experience !== "") {
      body.experience = parseInt(body.experience, 10);
    } else if (body.experience === "") {
      body.experience = undefined;
    }
    if (body.fee !== undefined && body.fee !== null && body.fee !== "") {
      body.fee = parseInt(body.fee, 10);
    } else if (body.fee === "") {
      body.fee = undefined;
    }
    if (body.registrationYear !== undefined && body.registrationYear !== null && body.registrationYear !== "") {
      body.registrationYear = parseInt(body.registrationYear, 10);
    } else if (body.registrationYear === "") {
      body.registrationYear = undefined;
    }

    let validatedData: any;
    if (isDraft) {
      const validation = draftSchema.safeParse(body);
      if (!validation.success) {
        return NextResponse.json(
          { error: 'Invalid draft payload: ' + formatZodError(validation.error) },
          { status: 400 }
        );
      }
      validatedData = validation.data;
    } else {
      const validation = doctorOnboardSchema.safeParse(body);
      if (!validation.success) {
        return NextResponse.json(
          { error: 'Invalid onboarding payload: ' + formatZodError(validation.error) },
          { status: 400 }
        );
      }
      validatedData = validation.data;
    }

    // 3. Find if a Doctor profile already exists to prevent duplicate profiles
    const existingDoctor = await prisma.doctor.findUnique({
      where: { userId }
    });

    if (existingDoctor && existingDoctor.verificationStatus === 'VERIFIED') {
      return NextResponse.json({ error: 'You are already registered and verified as a Doctor.' }, { status: 409 });
    }

    // 4. Enforce strict uniqueness check for medicalRegistrationNumber on non-draft submissions
    if (!isDraft && validatedData.medicalRegistrationNumber) {
      const regNumberUpper = validatedData.medicalRegistrationNumber.toUpperCase();
      const existingReg = await prisma.doctor.findFirst({
        where: {
          medicalRegistrationNumber: regNumberUpper,
          NOT: { userId }
        }
      });
      if (existingReg) {
        return NextResponse.json(
          { error: `Medical Registration Number "${regNumberUpper}" is already registered by another doctor. Please double-check your credentials.` },
          { status: 400 }
        );
      }
    }

    // Process specialty if specialization is provided
    let specialtyRecordId: string | undefined;
    if (validatedData.specialization) {
      const normalizedSpec = normalizeSpecialty(validatedData.specialization);
      const specialtySlug = normalizedSpec.toLowerCase().replace(/[^a-z0-9]+/g, '-');
      const specialtyRecord = await prisma.specialty.upsert({
        where: { name: normalizedSpec },
        update: {},
        create: { name: normalizedSpec, slug: specialtySlug }
      });
      specialtyRecordId = specialtyRecord.id;
    }

    // Process Geocoding (Real Geocoding API via OpenStreetMap)
    let latitude = null;
    let longitude = null;
    if (!isDraft && validatedData.city) {
      const addrComponents = [
        validatedData.practiceAddress,
        validatedData.locality,
        validatedData.city,
        validatedData.state || "Bihar",
        validatedData.pincode
      ].filter(Boolean);
      
      const fullAddrStr = addrComponents.join(", ");
      const coords = await geocodeAddress(fullAddrStr);
      if (coords) {
        latitude = coords.lat;
        longitude = coords.lng;
      }
    }

    // 5. Create or Update Doctor Record & Upgrade User in a transaction
    const result = await prisma.$transaction(async (tx) => {
      // Upgrade User Role and update Name if provided
      const user = await tx.user.update({
        where: { id: userId },
        data: {
          role: 'DOCTOR',
          ...(validatedData.fullName ? { name: validatedData.fullName } : {})
        }
      });

      const safeName = validatedData.fullName || existingUser.name || "doctor";
      const targetCity = validatedData.city || "default";

      // Atomic Doctor Code generation when finalizing (not draft) and doesn't exist yet
      let doctorCode = existingDoctor?.doctorCode;
      if (!isDraft && !doctorCode) {
        doctorCode = await generateSequentialDoctorCode(tx);
      }

      // Premium SEO-friendly URL slug generation using sequential doctor code
      let doctorSlug = existingDoctor?.slug;
      if (!isDraft && doctorCode) {
        const nameSlug = safeName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
        doctorSlug = `dr-${nameSlug}-${doctorCode.toLowerCase()}`;
      } else if (!doctorSlug) {
        doctorSlug = generateDoctorSlug(safeName, targetCity);
        for (let attempt = 0; attempt < 3; attempt++) {
          const exists = await tx.doctor.findUnique({ where: { slug: doctorSlug } });
          if (!exists) break;
          doctorSlug = generateAlternateSlug(doctorSlug);
        }
      }

      // QR-ready short code generation
      let shortCode = existingDoctor?.shortCode;
      if (!shortCode) {
        shortCode = generateShortCode();
        for (let attempt = 0; attempt < 5; attempt++) {
          const exists = await tx.doctor.findFirst({ where: { shortCode } });
          if (!exists) break;
          shortCode = generateShortCode();
        }
      }

      // Derive badge label from experience
      const expYears = validatedData.experience || 0;
      const verifiedBadgeLabel = expYears >= 15
        ? 'Experienced Partner'
        : expYears >= 5
        ? 'Verified Doctor'
        : 'Clinic Verified';

      const verificationStatus = isDraft
        ? VerificationStatus.DRAFT
        : VerificationStatus.PENDING_VERIFICATION;

      const doctorDataPayload = {
        name: safeName,
        slug: doctorSlug!,
        shortCode: shortCode!,
        doctorCode: doctorCode || null,
        bio: validatedData.bio || null,
        experience: validatedData.experience || 0,
        fee: validatedData.fee || 0,
        district: validatedData.city || "",
        hospitalName: validatedData.practiceName || "",
        clinicName: validatedData.practiceName || "",
        fullAddress: validatedData.practiceAddress || "",
        landmark: validatedData.landmark || "",
        locality: validatedData.locality || "",
        city: validatedData.city || "",
        state: validatedData.state || "Bihar",
        pincode: validatedData.pincode || "",
        latitude: latitude,
        longitude: longitude,
        gender: validatedData.gender || null,
        languages: normalizeLanguages(validatedData.languages),
        education: normalizeQualifications(validatedData.qualifications),
        qualifications: normalizeQualifications(validatedData.qualifications),
        specialtyIds: specialtyRecordId ? [specialtyRecordId] : [],
        verificationStatus,
        profileImage: validatedData.profilePhotoUrl || null,
        clinicImage: validatedData.clinicPhotoUrl || null,
        medicalRegistrationNumber: validatedData.medicalRegistrationNumber ? validatedData.medicalRegistrationNumber.toUpperCase() : null,
        medicalCouncil: validatedData.medicalCouncil || null,
        registrationYear: validatedData.registrationYear || null,
        dateOfBirth: validatedData.dateOfBirth ? new Date(validatedData.dateOfBirth) : null,
        primarySpecialtyId: validatedData.primarySpecialtyId || specialtyRecordId || null,
        govtIdentityReference: validatedData.govtIdentityReference || null,
        verifiedBadgeLabel,
      };

      let doctor;
      if (existingDoctor) {
        // Update existing record to avoid duplication
        doctor = await tx.doctor.update({
          where: { id: existingDoctor.id },
          data: doctorDataPayload
        });
      } else {
        // Create new record
        doctor = await tx.doctor.create({
          data: {
            userId: user.id,
            ...doctorDataPayload
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
      }

      return { user, doctor };
    });

    // Generate NEW JWT Auth Token with upgraded DOCTOR role
    const payload = { id: result.user.id, role: result.user.role };
    const newToken = jwt.sign(payload, jwtSecret, { expiresIn: '7d' });

    const response = NextResponse.json({
      success: true,
      message: isDraft ? 'Doctor profile draft saved.' : 'Doctor profile submitted for verification.',
      token: newToken,
      user: {
        id: result.user.id,
        phone: result.user.phone,
        name: result.user.name,
        role: result.user.role,
        doctorId: result.doctor.id
      },
      doctor: {
        id: result.doctor.id,
        doctorCode: result.doctor.doctorCode,
        verificationStatus: result.doctor.verificationStatus
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
