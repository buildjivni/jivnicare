import { apiResponse, apiError } from '@/lib/utils/api-response';
import { NextResponse } from 'next/server';
import prisma from '@/lib/db/prisma';
import { verifyToken } from '@/lib/jwt';
import { cookies } from 'next/headers';
import { step3OnboardSchema, formatZodError } from '@/lib/validators/validations';
import { normalizeQualifications, normalizeSpecialty } from '@/lib/utils/normalizers';

export async function POST(request: Request) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('jivnicare_token')?.value;

    if (!token) {
      return apiError('Unauthorized. Please complete previous steps.', 401);
    }

    const decoded = await verifyToken(token) as { id: string; doctorId?: string } | null;
    if (!decoded?.id || !decoded?.doctorId) {
      return apiError('Invalid or expired session. Please log in again.', 401);
    }

    const doctorId = decoded.doctorId;

    const body = await request.json();
    if (body.experience !== undefined && body.experience !== null && body.experience !== "") {
      body.experience = parseInt(String(body.experience), 10);
    }
    if (body.registrationYear !== undefined && body.registrationYear !== null && body.registrationYear !== "") {
      body.registrationYear = parseInt(String(body.registrationYear), 10);
    }
    if (body.lifetimePatientsDeclaration !== undefined && body.lifetimePatientsDeclaration !== null && body.lifetimePatientsDeclaration !== "") {
      body.lifetimePatientsDeclaration = parseInt(String(body.lifetimePatientsDeclaration), 10);
    } else if (body.lifetimePatientsDeclaration === "") {
      body.lifetimePatientsDeclaration = null;
    }

    const validation = step3OnboardSchema.safeParse(body);
    if (!validation.success) {
      return apiError('Validation failed: ' + formatZodError(validation.error), 400);
    }

    const data = validation.data;

    // Check unique registration number
    const regNumberUpper = data.medicalRegistrationNumber.toUpperCase();
    const existingReg = await prisma.doctor.findFirst({
      where: {
        medicalRegistrationNumber: regNumberUpper,
        id: { not: doctorId }
      }
    });
    if (existingReg) {
      return apiError(`Medical Registration Number "${regNumberUpper}" is already registered.`, 400);
    }

    // Setup specialty
    const normalizedSpec = normalizeSpecialty(data.specialization);
    const specialtySlug = normalizedSpec.toLowerCase().replace(/[^a-z0-9]+/g, '-');
    
    // Setup keywords
    const rawKeywordTerms = new Set<string>();
    rawKeywordTerms.add(normalizedSpec.toLowerCase());
    rawKeywordTerms.add(specialtySlug);
    
    const quals = normalizeQualifications(data.qualifications);
    quals.split(',').forEach(q => q.trim() && rawKeywordTerms.add(q.trim().toLowerCase()));

    const doctorRecord = await prisma.doctor.findUnique({
      where: { id: doctorId },
      select: { name: true, city: true, district: true, state: true, locality: true }
    });

    if (doctorRecord) {
      if (doctorRecord.city) rawKeywordTerms.add(doctorRecord.city.toLowerCase());
      if (doctorRecord.district) rawKeywordTerms.add(doctorRecord.district.toLowerCase());
      if (doctorRecord.locality) rawKeywordTerms.add(doctorRecord.locality.toLowerCase());
      if (doctorRecord.state) rawKeywordTerms.add(doctorRecord.state.toLowerCase());

      const firstName = doctorRecord.name.replace(/^Dr\.?\s*/i, '').split(' ')[0];
      if (firstName) rawKeywordTerms.add(firstName.toLowerCase());
    }

    // Combine documents into verificationDocuments array
    const documentsArray = [
      data.degreeCertificate,
      data.nmcCertificate,
      ...(data.otherCertificates || [])
    ].filter(Boolean);

    // Save in transaction
    await prisma.$transaction(async (tx) => {
      const specialtyRecord = await tx.specialty.upsert({
        where: { name: normalizedSpec },
        update: {},
        create: { name: normalizedSpec, slug: specialtySlug }
      });

      const keywordIds: string[] = [];
      for (const term of rawKeywordTerms) {
        if (!term || term.length < 2) continue;
        const kw = await tx.keyword.upsert({
          where: { term },
          update: {},
          create: { term }
        });
        keywordIds.push(kw.id);
      }

      await tx.doctor.update({
        where: { id: doctorId },
        data: {
          speciality: normalizedSpec,
          qualification: quals,
          qualifications: quals,
          education: quals,
          experience: data.experience,
          experienceYears: data.experience,
          medicalRegistrationNumber: regNumberUpper,
          medicalCouncil: data.medicalCouncil,
          registrationYear: data.registrationYear,
          languages: data.languages ? data.languages.split(',').map(l => l.trim()).filter(Boolean) : [],
          bio: data.bio || "",
          clinicPhotos: data.clinicPhotos || [],
          clinicImage: data.clinicPhotos && data.clinicPhotos.length > 0 ? data.clinicPhotos[0] : null,
          verificationDocuments: documentsArray,
          specialties: {
            connect: [{ id: specialtyRecord.id }],
          },
          keywords: {
            connect: keywordIds.map(id => ({ id })),
          },
          gender: data.gender || undefined,
          dateOfBirth: data.dateOfBirth ? new Date(data.dateOfBirth) : undefined,
          lifetimePatientsDeclaration: data.lifetimePatientsDeclaration !== undefined ? (data.lifetimePatientsDeclaration !== null ? String(data.lifetimePatientsDeclaration) : null) : undefined,
        }
      });

      if (data.email && await resultEmailIsAvailable(data.email, doctorId)) {
        await tx.user.update({
          where: { id: decoded.id },
          data: { email: data.email }
        });
      }
    });

    return apiResponse({
      success: true,
      message: 'Step 3 complete.'
    });

  } catch (error: any) {
    console.error('Doctor Onboard Step 3 Error:', error);
    return apiError('Internal server error.', 500);
  }
}

async function resultEmailIsAvailable(email: string, doctorId: string) {
  const existing = await prisma.user.findFirst({
    where: {
      email,
      doctor: { id: { not: doctorId } }
    }
  });
  return !existing;
}
