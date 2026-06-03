import { NextResponse } from 'next/server';
import prisma from '@/lib/db/prisma';
import bcrypt from 'bcryptjs';
import { signToken } from '@/lib/jwt';
import { cookies } from 'next/headers';
import { isTestOtpModeEnabled, getTestOtpNumbers, getTestOtpCode } from '@/lib/config/test-mode';
import { logger } from '@/lib/infrastructure/logger';

export async function POST(request: Request) {
  try {
    const { phone, password } = await request.json();

    if (!phone || !password) {
      return NextResponse.json({ error: 'Phone number and password are required' }, { status: 400 });
    }

    // Find the user by phone
    const user = await prisma.user.findUnique({
      where: { phone },
      include: { doctor: true }
    });

    if (!user) {
      return NextResponse.json({ error: 'Invalid phone number or password' }, { status: 401 });
    }

    if (user.role !== 'DOCTOR' || !user.doctor) {
      return NextResponse.json({ error: 'Account is not registered as a Doctor.' }, { status: 403 });
    }

    // ── Lightweight Test OTP Mode for Doctors ─────────────────────────
    let passwordMatch = false;
    const phone10 = phone.replace(/\D/g, '').slice(-10);

    if (isTestOtpModeEnabled() && getTestOtpNumbers().includes(phone10)) {
      if (password === getTestOtpCode()) {
        passwordMatch = true;
        logger.info({
          category: 'AUTH',
          message: 'Test Mode doctor login verified',
          metadata: { phoneSuffix: phone.slice(-4) },
        });
      }
    }

    // ── Real Password Verification ────────────────────────────────────
    if (!passwordMatch) {
      if (!user.password) {
        return NextResponse.json({ error: 'Password not set. Please contact Administrator for verification.' }, { status: 403 });
      }
      passwordMatch = await bcrypt.compare(password, user.password);
    }

    if (!passwordMatch) {
      return NextResponse.json({ error: 'Invalid phone number or password' }, { status: 401 });
    }

    // Check doctor verification status - allow unverified to log in to see status
    if (user.doctor.verificationStatus === 'SUSPENDED') {
      return NextResponse.json({ error: 'Account has been suspended. Please contact support.' }, { status: 403 });
    }

    // Sign JWT Token
    const token = signToken(
      {
        id: user.id,
        role: user.role,
        doctorId: user.doctor.id,
      },
      '30d'
    );

    // Set HttpOnly Cookie
    const cookieStore = await cookies();
    cookieStore.set('auth-token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production' && !isTestOtpModeEnabled(),
      sameSite: 'lax',
      path: '/',
      maxAge: 30 * 24 * 60 * 60, // 30 days in seconds
    });

    // Return User Data
    return NextResponse.json({
      success: true,
      user: {
        id: user.id,
        name: user.name,
        phone: user.phone,
        role: user.role,
        doctorId: user.doctor.id,
      }
    });

  } catch (error) {
    console.error('Doctor Login Error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
