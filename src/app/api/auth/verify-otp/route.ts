import { NextResponse } from 'next/server';
import { checkRateLimit } from '@/lib/infrastructure/rate-limit';
import { logger } from '@/lib/infrastructure/logger';
import { getTwoFactorApiKey } from '@/lib/infrastructure/env';
import { createPhoneSessionResponse } from '@/lib/auth/phone-session';
import { isTransientDbError, dbUnavailableResponse } from '@/lib/db/db-errors';

const VERIFY_LIMIT = 5;
const VERIFY_WINDOW_MS = 10 * 60 * 1000;

export async function POST(request: Request) {
  try {
    const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || '127.0.0.1';

    const body = await request.json();
    const { phone, otp, sessionId, name, location } = body;

    if (!phone) {
      return NextResponse.json({ error: 'Phone number is required' }, { status: 400 });
    }

    if (!otp || !sessionId) {
      return NextResponse.json({ error: 'OTP and Session ID are required' }, { status: 400 });
    }

    const phone10 = phone.replace(/\D/g, '').slice(-10);
    if (phone10.length !== 10) {
      return NextResponse.json({ error: 'Invalid phone number format' }, { status: 400 });
    }

    const rateLimit = await checkRateLimit({
      identifier: `otp_verify_ip_${ip}`,
      limit: VERIFY_LIMIT,
      windowMs: VERIFY_WINDOW_MS,
    });

    if (!rateLimit.success) {
      logger.warn({ category: 'OTP', message: 'Rate limit exceeded for OTP verification', metadata: { ip } });
      return NextResponse.json(
        {
          error: 'Too many attempts, please try again later.',
          retryAfterSec: Math.max(
            0,
            Math.ceil((rateLimit.resetTime.getTime() - Date.now()) / 1000)
          ),
        },
        { status: 429 }
      );
    }

    const phoneRateLimit = await checkRateLimit({
      identifier: `otp_verify_phone_${phone10}`,
      limit: VERIFY_LIMIT,
      windowMs: VERIFY_WINDOW_MS,
    });

    if (!phoneRateLimit.success) {
      return NextResponse.json(
        {
          error: 'Too many attempts for this number. Please wait and try again.',
          retryAfterSec: Math.max(
            0,
            Math.ceil((phoneRateLimit.resetTime.getTime() - Date.now()) / 1000)
          ),
        },
        { status: 429 }
      );
    }

    const apiKey = getTwoFactorApiKey();
    if (!apiKey) {
      return NextResponse.json(
        { error: 'Phone verification service is not configured.' },
        { status: 503 }
      );
    }

    try {
      // Call 2Factor VERIFY API
      const res = await fetch(`https://2factor.in/API/V1/${apiKey}/SMS/VERIFY/${sessionId}/${otp}`, {
        method: 'GET',
      });

      if (!res.ok) {
        logger.error({ category: 'OTP', message: '2Factor verify HTTP error', error: `status ${res.status}` });
        return NextResponse.json({ error: 'Verification service unavailable. Please try again.' }, { status: 503 });
      }

      const data = await res.json();
      
      if (data.Status !== 'Success' || data.Details !== 'OTP Matched') {
        logger.info({ category: 'OTP', message: 'Invalid OTP entered', metadata: { phoneSuffix: phone10.slice(-4) } });
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
      return NextResponse.json({ error: 'Invalid or expired verification. Please try again.' }, { status: 401 });
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
