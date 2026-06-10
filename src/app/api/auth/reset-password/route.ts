import { apiResponse, apiError } from '@/lib/utils/api-response';
import { NextResponse } from 'next/server';
import prisma from '@/lib/db/prisma';
import bcrypt from 'bcryptjs';
import { getTwoFactorApiKey } from '@/lib/infrastructure/env';
import { logger } from '@/lib/infrastructure/logger';
import { isTestOtpModeEnabled, getTestOtpNumbers, getTestOtpCode } from '@/lib/config/test-mode';

export async function POST(request: Request) {
  try {
    const { phone, otp, sessionId, password } = await request.json();

    if (!phone || !password || !otp || !sessionId) {
      return NextResponse.json({ error: 'Phone, OTP, Session ID, and new password are required' }, { status: 400 });
    }

    if (password.length < 6) {
      return apiError('Password must be at least 6 characters long', 400);
    }

    const phone10 = phone.replace(/\D/g, '').slice(-10);
    if (phone10.length !== 10) {
      return apiError('Invalid phone number format', 400);
    }

    const user = await prisma.user.findUnique({
      where: { phone: phone10 },
      include: { doctor: true },
    });

    if (!user) {
      return apiError('No account registered with this phone number.', 404);
    }

    if (user.role !== 'DOCTOR' || !user.doctor) {
      return apiError('Account is not registered as a Doctor.', 403);
    }

    let otpVerified = false;

    // ── Test Mode OTP Bypass ─────────────────────────
    if (isTestOtpModeEnabled() && getTestOtpNumbers().includes(phone10)) {
      if (otp === getTestOtpCode()) {
        otpVerified = true;
        logger.info({ category: 'OTP', message: 'Test mode OTP matched for reset password', metadata: { phoneSuffix: phone10.slice(-4) } });
      } else {
        return apiError('Invalid test OTP.', 401);
      }
    }

    if (!otpVerified) {
      const apiKey = getTwoFactorApiKey();
      if (!apiKey) {
        return NextResponse.json(
          { error: 'Phone verification service is not configured.' },
          { status: 503 }
        );
      }

      // Call 2Factor VERIFY API
      try {
        const res = await fetch(`https://2factor.in/API/V1/${apiKey}/SMS/VERIFY/${sessionId}/${otp}`, {
          method: 'GET',
        });

        if (!res.ok) {
          logger.error({ category: 'OTP', message: '2Factor verify HTTP error in reset password', error: `status ${res.status}` });
          return apiError('Verification service unavailable. Please try again.', 503);
        }

        const data = await res.json();
        
        if (data.Status !== 'Success' || data.Details !== 'OTP Matched') {
          logger.info({ category: 'OTP', message: 'Invalid OTP entered in password reset', metadata: { phoneSuffix: phone10.slice(-4) } });
          return NextResponse.json(
            { error: 'Invalid or expired OTP. Please try again.' },
            { status: 401 }
          );
        }
      } catch (err) {
        logger.error({ category: 'OTP', message: '2Factor token verification failed', error: err });
        return apiError('Invalid or expired verification. Please try again.', 401);
      }
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    await prisma.user.update({
      where: { id: user.id },
      data: { password: hashedPassword },
    });

    return apiResponse({success: true, message: 'Password reset successfully.'});
  } catch (error) {
    logger.error({ category: "OTP", message: "Reset Password Error", error });
    return apiError('Internal server error', 500);
  }
}
