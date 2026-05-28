import { NextResponse } from 'next/server';
import prisma from '@/lib/db/prisma';
import bcrypt from 'bcryptjs';
import { getTwoFactorApiKey } from '@/lib/infrastructure/env';
import { logger } from '@/lib/infrastructure/logger';

export async function POST(request: Request) {
  try {
    const { phone, otp, sessionId, password } = await request.json();

    if (!phone || !password || !otp || !sessionId) {
      return NextResponse.json({ error: 'Phone, OTP, Session ID, and new password are required' }, { status: 400 });
    }

    if (password.length < 6) {
      return NextResponse.json({ error: 'Password must be at least 6 characters long' }, { status: 400 });
    }

    const phone10 = phone.replace(/\D/g, '').slice(-10);
    if (phone10.length !== 10) {
      return NextResponse.json({ error: 'Invalid phone number format' }, { status: 400 });
    }

    const user = await prisma.user.findUnique({
      where: { phone: phone10 },
      include: { doctor: true },
    });

    if (!user) {
      return NextResponse.json({ error: 'No account registered with this phone number.' }, { status: 404 });
    }

    if (user.role !== 'DOCTOR' || !user.doctor) {
      return NextResponse.json({ error: 'Account is not registered as a Doctor.' }, { status: 403 });
    }

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
        return NextResponse.json({ error: 'Verification service unavailable. Please try again.' }, { status: 503 });
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
      return NextResponse.json({ error: 'Invalid or expired verification. Please try again.' }, { status: 401 });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    await prisma.user.update({
      where: { id: user.id },
      data: { password: hashedPassword },
    });

    return NextResponse.json({ success: true, message: 'Password reset successfully.' });
  } catch (error) {
    logger.error({ category: "OTP", message: "Reset Password Error", error });
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
