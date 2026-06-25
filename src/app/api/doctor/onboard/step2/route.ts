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

    // Update Doctor record directly (clinic is flattened on Doctor model)
    const updatedDoctor = await prisma.doctor.update({
      where: { id: doctorId },
      data: {
        clinicName: data.practiceName,
        clinicAddress: data.practiceAddress,
        clinicCity: data.city,
        clinicDistrict: data.district,
        clinicPincode: data.pincode,
        clinicLatitude: data.latitude || null,
        clinicLongitude: data.longitude || null
      }
    });

    return apiResponse({
      success: true,
      message: 'Step 2 complete.',
      clinicId: updatedDoctor.id // return doctor id as clinic id placeholder to avoid breaking UI response expectations
    });

  } catch (error: any) {
    console.error('Doctor Onboard Step 2 Error:', error);
    return apiError('Internal server error.', 500);
  }
}
