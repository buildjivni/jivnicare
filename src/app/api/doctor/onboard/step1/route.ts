import { apiResponse, apiError } from '@/lib/utils/api-response';
import { NextResponse } from 'next/server';
import prisma from '@/lib/db/prisma';
import { isTestOtpModeEnabled } from '@/lib/config/test-mode';
import { signToken } from '@/lib/jwt';
import { cookies } from 'next/headers';
import { encrypt, hashPhone } from '@/lib/crypto';
import { VerificationStatus } from '@prisma/client';
import { step1OnboardSchema, formatZodError } from '@/lib/validators/validations';
import { generateSequentialDoctorCode, generateShortCode } from '@/lib/utils/slug';

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const validation = step1OnboardSchema.safeParse(body);
    if (!validation.success) {
      return apiError('Validation failed: ' + formatZodError(validation.error), 400);
    }

    const data = validation.data;
    const phone10 = data.contactNumber.replace(/\D/g, "").slice(-10);

    // 1. Check if phone is already registered
    const hashedPhone = hashPhone(phone10);
    let user = await prisma.user.findUnique({ where: { phoneHash: hashedPhone } });
    if (user && user.role === 'DOCTOR') {
      return apiError('Phone number is already registered as a Partner. Please login.', 409);
    }

    // 3. Transaction: Create/Update User and Doctor
    const result = await prisma.$transaction(async (tx) => {
      if (user) {
        user = await tx.user.update({
          where: { id: user.id },
          data: { role: 'DOCTOR', name: data.fullName, phone: encrypt(phone10), phoneHash: hashedPhone }
        });
      } else {
        user = await tx.user.create({
          data: { phone: encrypt(phone10), phoneHash: hashedPhone, role: 'DOCTOR', name: data.fullName }
        });
      }

      // Generate Slugs and Codes
      const doctorCode = await generateSequentialDoctorCode(tx);
      const cleanName = data.fullName.replace(/^(dr\.?\s*|prof\.?\s*|mr\.?\s*|ms\.?\s*|mrs\.?\s*)/i, '');
      const nameSlug = cleanName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
      let doctorSlug = `dr-${nameSlug}-${doctorCode.toLowerCase()}`;
      
      let shortCode = generateShortCode();
      for (let attempt = 0; attempt < 5; attempt++) {
        const exists = await tx.doctor.findFirst({ where: { shortCode } });
        if (!exists) break;
        shortCode = generateShortCode();
      }

      const doctor = await tx.doctor.create({
        data: {
          userId: user.id,
          name: data.fullName,
          phone: phone10,
          speciality: data.speciality,
          qualification: "Pending",
          slug: doctorSlug,
          shortCode,
          doctorCode,
          experience: 0,
          experienceYears: 0,
          district: "Pending", // Required non-nullable field
          hospitalName: "Pending",
          clinicName: "Pending",
          fullAddress: "",
          locality: "",
          city: "Pending",
          state: "Bihar",
          pincode: "",
          verificationStatus: VerificationStatus.DRAFT,
          isOnline: false,
          jivnicarePatientsServed: 0,
          averageConsultationMinutes: 10,
          dailyTokenLimit: 50,
        }
      });

      return { user, doctor };
    });

    // 4. Generate JWT
    const token = await signToken(
      { id: result.user.id, role: result.user.role, doctorId: result.doctor.id },
      '30d'
    );

    const response = NextResponse.json({
      success: true,
      message: 'Step 1 complete.',
      user: { id: result.user.id, role: result.user.role, doctorId: result.doctor.id }
    });

    const cookieStore = await cookies();
    cookieStore.set('jivnicare_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production' && !isTestOtpModeEnabled(),
      sameSite: 'lax',
      path: '/',
      maxAge: 30 * 24 * 60 * 60
    });

    return response;

  } catch (error: any) {
    console.error('Doctor Onboard Step 1 Error:', error);
    return apiError('Internal server error.', 500);
  }
}
