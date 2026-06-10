import { apiResponse, apiError } from '@/lib/utils/api-response';
import { NextResponse } from 'next/server';
import { otpRatelimit, checkUpstashRateLimit } from '@/lib/ratelimit';
import { logger } from '@/lib/infrastructure/logger';
import { getTwoFactorApiKey } from '@/lib/infrastructure/env';
import { createPhoneSessionResponse } from '@/lib/auth/phone-session';
import { isTransientDbError, dbUnavailableResponse } from '@/lib/db/db-errors';
import { isTestOtpModeEnabled, getTestOtpNumbers, getTestOtpCode } from '@/lib/config/test-mode';
import { incrementTelemetryCounter } from '@/lib/telemetry/redis';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { phone, otp, sessionId, name, location } = body;

    if (!phone) {
      return apiError('Phone number is required', 400);
    }

    if (!otp || !sessionId) {
      return apiError('OTP and Session ID are required', 400);
    }

    const phone10 = phone.replace(/\D/g, '').slice(-10);
    if (phone10.length !== 10) {
      return apiError('Invalid phone number format', 400);
    }

    // --- Upstash Rate Limiting ---
    const { success } = await checkUpstashRateLimit(
      otpRatelimit, 
      `otp_verify_${phone10}`
    );

    if (!success) {
      return apiError("Bahut zyada requests. Thodi der mein try karein.", 429);
    }

    const apiKey = getTwoFactorApiKey();
    if (!apiKey) {
      return NextResponse.json(
        { error: 'Phone verification service is not configured.' },
        { status: 503 }
      );
    }

    if (isTestOtpModeEnabled() && getTestOtpNumbers().includes(phone10)) {
      if (otp !== getTestOtpCode()) {
        await incrementTelemetryCounter('otpFailures');
        return NextResponse.json(
          { error: 'Invalid or expired OTP. Please try again.' },
          { status: 401 }
        );
      }
      return createPhoneSessionResponse({
        phone10,
        firebaseUid: `test_user_${phone10}`,
        name,
        location,
      });
    }

    try {
      // Call 2Factor VERIFY API
      const res = await fetch(`https://2factor.in/API/V1/${apiKey}/SMS/VERIFY/${sessionId}/${otp}`, {
        method: 'GET',
      });

      if (!res.ok) {
        logger.error({ category: 'OTP', message: '2Factor verify HTTP error', error: `status ${res.status}` });
        return apiError('Verification service unavailable. Please try again.', 503);
      }

      const data = await res.json();
      
      if (data.Status !== 'Success' || data.Details !== 'OTP Matched') {
        logger.info({ category: 'OTP', message: 'Invalid OTP entered', metadata: { phoneSuffix: phone10.slice(-4) } });
        await incrementTelemetryCounter('otpFailures');
        return NextResponse.json(
          { error: 'Invalid or expired OTP. Please try again.' },
          { status: 401 }
        );
      }

      return createPhoneSessionResponse({
        phone10,
        firebaseUid: `2factor_${phone10}`,
        name,
        location,
      });
    } catch (err) {
      logger.error({ category: 'OTP', message: '2Factor token verification failed', error: err });
      await incrementTelemetryCounter('otpFailures');
      return apiError('Invalid or expired verification. Please try again.', 401);
    }

  } catch (error) {
    if (isTransientDbError(error)) {
      logger.warn({ category: 'OTP', message: 'Transient DB error during OTP verify', error });
      const { error: msg, status } = dbUnavailableResponse();
      return NextResponse.json({ error: msg }, { status });
    }
    logger.error({ category: 'API_EXCEPTION', message: 'Internal server error while verifying OTP', error });
    return NextResponse.json(
      { error: 'Internal server error while verifying OTP' },
      { status: 500 }
    );
  }
}
