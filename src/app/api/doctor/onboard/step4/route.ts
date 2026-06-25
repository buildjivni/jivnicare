import { apiResponse, apiError } from '@/lib/utils/api-response';
import { NextResponse } from 'next/server';
import prisma from '@/lib/db/prisma';
import { verifyToken } from '@/lib/jwt';
import { cookies } from 'next/headers';
import { step4OnboardSchema, formatZodError } from '@/lib/validators/validations';
import { VerificationStatus } from '@prisma/client';

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
    if (body.dailyPatientLimit !== undefined && body.dailyPatientLimit !== null) {
      body.dailyPatientLimit = parseInt(String(body.dailyPatientLimit), 10);
    }
    if (body.consultationFee !== undefined && body.consultationFee !== null) {
      body.consultationFee = parseInt(String(body.consultationFee), 10);
    }
    if (body.emergencyFee !== undefined && body.emergencyFee !== null && body.emergencyFee !== "") {
      body.emergencyFee = parseInt(String(body.emergencyFee), 10);
    } else {
      body.emergencyFee = null;
    }

    const validation = step4OnboardSchema.safeParse(body);
    if (!validation.success) {
      return apiError('Validation failed: ' + formatZodError(validation.error), 400);
    }

    const data = validation.data;

    // Update in transaction
    await prisma.$transaction(async (tx) => {
      // 1. Update Doctor record
      await tx.doctor.update({
        where: { id: doctorId },
        data: {
          consultationFee: data.consultationFee,
          dailyTokenLimit: data.dailyPatientLimit,
          isEmergencyEnabled: data.emergencyAvailable,
          offersEmergency: data.emergencyAvailable,
          emergencyFee: data.emergencyFee || 0,
          bookingWindowStart: data.bookingStartTime,
          weeklySchedule: data.weeklySchedule as any,
          verificationStatus: VerificationStatus.PENDING_REVIEW,
          registrationComplete: true, // Mark registration complete on step 4 submit
        }
      });

      // 2. Upsert default PlatformPricing
      await tx.platformPricing.upsert({
        where: { doctorId: doctorId },
        update: {},
        create: {
          doctorId: doctorId,
          monthlyFee: 2999,
          perBookingFee: 29,
          discountPercent: 100,
          partnerTier: "EARLY_PARTNER",
        }
      });
    });

    return apiResponse({
      success: true,
      message: 'Registration complete. Our team will verify your profile within 24-48 hours.'
    });

  } catch (error: any) {
    console.error('Doctor Onboard Step 4 Error:', error);
    return apiError('Internal server error.', 500);
  }
}
