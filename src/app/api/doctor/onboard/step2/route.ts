import { apiResponse, apiError } from '@/lib/utils/api-response';
import { NextResponse } from 'next/server';
import prisma from '@/lib/db/prisma';
import { verifyToken } from '@/lib/jwt';
import { cookies } from 'next/headers';
import { step2OnboardSchema, formatZodError } from '@/lib/validators/validations';

export async function POST(request: Request) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('jivnicare_token')?.value;

    if (!token) {
      return apiError('Unauthorized. Please complete step 1 first.', 401);
    }

    const decoded = await verifyToken(token) as { id: string; doctorId?: string } | null;
    if (!decoded?.id || !decoded?.doctorId) {
      return apiError('Invalid or expired session. Please log in again.', 401);
    }

    const doctorId = decoded.doctorId;

    const body = await request.json();
    const validation = step2OnboardSchema.safeParse(body);
    if (!validation.success) {
      return apiError('Validation failed: ' + formatZodError(validation.error), 400);
    }

    const data = validation.data;

    // Create Clinic and link to Doctor in transaction
    const result = await prisma.$transaction(async (tx) => {
      const clinic = await tx.clinic.create({
        data: {
          name: data.practiceName,
          city: data.city,
          address: data.practiceAddress,
          isActive: true,
        }
      });

      const updatedDoctor = await tx.doctor.update({
        where: { id: doctorId },
        data: {
          clinicId: clinic.id,
          hospitalName: data.practiceName,
          clinicName: data.practiceName,
          fullAddress: data.practiceAddress,
          locality: data.locality,
          city: data.city,
          district: data.district,
          state: data.state,
          pincode: data.pincode,
          latitude: data.latitude || null,
          longitude: data.longitude || null
        }
      });

      return { clinic, updatedDoctor };
    });

    return apiResponse({
      success: true,
      message: 'Step 2 complete.',
      clinicId: result.clinic.id
    });

  } catch (error: any) {
    console.error('Doctor Onboard Step 2 Error:', error);
    return apiError('Internal server error.', 500);
  }
}
