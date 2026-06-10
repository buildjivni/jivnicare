import { apiResponse, apiError } from '@/lib/utils/api-response';
import { NextResponse } from 'next/server';
import prisma from '@/lib/db/prisma';
import { verifyToken } from '@/lib/jwt';
import { cookies } from 'next/headers';
import { VerificationStatus } from '@prisma/client';
import { step2OnboardSchema, formatZodError } from '@/lib/validators/validations';
import { normalizeLanguages } from '@/lib/utils/normalizers';

export async function POST(request: Request) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('jivnicare_token')?.value;

    if (!token) {
      return apiError('Unauthorized. Please complete step 1 first.', 401);
    }

    const decoded = await verifyToken(token) as { id: string; doctorId?: string } | null;
    if (!decoded?.id) {
      return apiError('Invalid or expired session. Please log in again.', 401);
    }

    const doctorId = decoded.doctorId;
    if (!doctorId) {
      return apiError('Doctor profile not found in session.', 403);
    }

    const body = await request.json();
    if (body.fee) body.fee = parseInt(body.fee, 10);

    const validation = step2OnboardSchema.safeParse(body);
    if (!validation.success) {
      return apiError('Validation failed: ' + formatZodError(validation.error), 400);
    }

    const data = validation.data;

    await prisma.doctor.update({
      where: { id: doctorId },
      data: {
        profileImage: data.profilePhotoUrl || null,
        clinicImage: data.clinicPhotoUrl || null,
        bio: data.bio || null,
        fee: data.fee || 0,
        languages: data.languages ? normalizeLanguages(data.languages) : [],
        emergencyAvailable: data.emergencyAvailable || false,
        verificationStatus: VerificationStatus.PENDING_VERIFICATION,
      }
    });

    return apiResponse({success: true,
      message: 'Doctor profile submitted for verification.',});

  } catch (error: any) {
    console.error('Doctor Onboard Step 2 Error:', error);
    return apiError('Internal server error.', 500);
  }
}
