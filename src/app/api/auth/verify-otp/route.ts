import { NextResponse } from 'next/server';
import { checkRateLimit } from '@/lib/infrastructure/rate-limit';
import { logger } from '@/lib/infrastructure/logger';
import { isTestOtpAllowed, isFirebaseConfigured, isTestOtpModeEnabled, getTestOtpNumbers, getTestOtpCode } from '@/lib/infrastructure/env';
import { verifyFirebaseIdToken, normalizeIndianPhone } from '@/lib/firebase/admin';
import { createPhoneSessionResponse } from '@/lib/auth/phone-session';
import { isTransientDbError, dbUnavailableResponse } from '@/lib/db/db-errors';
import {
  isPilotOtpModeActive,
  isPhoneWhitelisted,
  PILOT_TEST_OTP,
} from '@/lib/auth/pilot-otp';

const VERIFY_LIMIT = 5;
const VERIFY_WINDOW_MS = 10 * 60 * 1000;

export async function POST(request: Request) {
  try {
    const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || '127.0.0.1';

    const body = await request.json();
    const { phone, otp, firebaseIdToken, name, location } = body;

    if (!phone) {
      return NextResponse.json({ error: 'Phone number is required' }, { status: 400 });
    }

    let phone10: string;
    try {
      phone10 = normalizeIndianPhone(phone);
    } catch {
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

    // ── Pilot test OTP (whitelist + fixed code) ───────────────────
    if (isPilotOtpModeActive()) {
      if (!isPhoneWhitelisted(phone10)) {
        return NextResponse.json(
          { error: 'This number is not enabled for the pilot.' },
          { status: 403 }
        );
      }
      if (otp !== PILOT_TEST_OTP) {
        return NextResponse.json({ error: 'Invalid OTP. Please try again.' }, { status: 401 });
      }

      logger.info({
        category: 'OTP',
        message: 'Pilot OTP verified',
        metadata: { phoneSuffix: phone10.slice(-4) },
      });

      return createPhoneSessionResponse({
        phone10,
        firebaseUid: `pilot_${phone10}`,
        name,
        location,
      });
    }

    // ── Lightweight Test OTP Mode ──────────────────────────────────────
    if (isTestOtpModeEnabled() && getTestOtpNumbers().includes(phone10)) {
      if (otp !== getTestOtpCode()) {
        return NextResponse.json({ error: 'Invalid test OTP code.' }, { status: 401 });
      }
      
      logger.info({
        category: 'OTP',
        message: 'Test OTP Mode verified',
        metadata: { phoneSuffix: phone10.slice(-4) },
      });

      return createPhoneSessionResponse({
        phone10,
        firebaseUid: `test_booking_${phone10}`,
        name,
        location,
      });
    }

    // ── Firebase Phone Auth (production path) ─────────────────────
    if (firebaseIdToken) {
      if (!isFirebaseConfigured()) {
        return NextResponse.json(
          { error: 'Phone verification service is not configured.' },
          { status: 503 }
        );
      }

      try {
        const verified = await verifyFirebaseIdToken(firebaseIdToken);
        if (verified.phone10 !== phone10) {
          return NextResponse.json(
            { error: 'Phone number does not match verified identity.' },
            { status: 400 }
          );
        }

        return createPhoneSessionResponse({
          phone10,
          firebaseUid: verified.uid,
          name,
          location,
        });
      } catch (err) {
        logger.error({ category: 'OTP', message: 'Firebase token verification failed', error: err });
        return NextResponse.json({ error: 'Invalid or expired verification. Please try again.' }, { status: 401 });
      }
    }

    // ── Dev-only test OTP (local ALLOW_TEST_OTP) ──────────────────
    if (isTestOtpAllowed() && otp === PILOT_TEST_OTP) {
      return createPhoneSessionResponse({
        phone10,
        firebaseUid: `test_${phone10}`,
        name,
        location,
      });
    }

    return NextResponse.json(
      { error: 'Verification required. Please complete OTP via Firebase.' },
      { status: 401 }
    );
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
