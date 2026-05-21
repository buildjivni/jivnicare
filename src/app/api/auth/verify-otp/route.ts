import { NextResponse } from 'next/server';
import { checkRateLimit } from '@/lib/rate-limit';
import { logger } from '@/lib/logger';
import { isTestOtpAllowed, isFirebaseConfigured } from '@/lib/env';
import { verifyFirebaseIdToken, normalizeIndianPhone } from '@/lib/firebase/admin';
import { createPhoneSessionResponse } from '@/lib/auth/phone-session';
import { isTransientDbError, dbUnavailableResponse } from '@/lib/db-errors';

export async function POST(request: Request) {
  try {
    const ip = request.headers.get('x-forwarded-for') || '127.0.0.1';

    const rateLimit = await checkRateLimit({
      identifier: `otp_verify_${ip}`,
      limit: 5,
      windowMs: 10 * 60 * 1000,
    });

    if (!rateLimit.success) {
      logger.warn({ category: 'OTP', message: 'Rate limit exceeded for OTP verification', metadata: { ip } });
      return NextResponse.json({ error: 'Too many attempts, please try again later.' }, { status: 429 });
    }

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

    // ── Dev-only test OTP (never in production) ───────────────────
    if (isTestOtpAllowed() && otp === '123456') {
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
