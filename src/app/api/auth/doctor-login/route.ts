import { apiResponse, apiError } from '@/lib/utils/api-response';
import { NextResponse } from 'next/server';
import prisma from '@/lib/db/prisma';
import bcrypt from 'bcryptjs';
import { signToken } from '@/lib/jwt';
import { cookies } from 'next/headers';
import { isTestOtpModeEnabled, getTestOtpNumbers, getTestOtpCode } from '@/lib/config/test-mode';
import { logger } from '@/lib/infrastructure/logger';
import { decrypt, hashPhone } from '@/lib/crypto';

export async function POST(request: Request) {
  try {
    const { phone, password } = await request.json();

    if (!phone || !password) {
      return apiError('Phone number and password are required', 400);
    }

    // Normalize and hash the phone number for lookup
    const phone10 = phone.replace(/\D/g, '').slice(-10);
    const hashedPhone = phone10.length === 10 ? hashPhone(phone10) : hashPhone(phone);
    
    // Find the user by phoneHash
    const user = await prisma.user.findUnique({
      where: { phoneHash: hashedPhone },
      include: { doctor: true }
    });

    if (!user) {
      return apiError('Invalid phone number or password', 401);
    }

    if (user.role !== 'DOCTOR' || !user.doctor) {
      return apiError('Account is not registered as a Doctor.', 403);
    }

    // ── Lightweight Test OTP Mode for Doctors ─────────────────────────
    let passwordMatch = false;

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
        return apiError('Password not set. Please contact Administrator for verification.', 403);
      }
      passwordMatch = await bcrypt.compare(password, user.password);
    }

    if (!passwordMatch) {
      return apiError('Invalid phone number or password', 401);
    }

    // Check doctor verification status - allow unverified to log in to see status
    if (user.doctor.verificationStatus === 'SUSPENDED') {
      return apiError('Account has been suspended. Please contact support.', 403);
    }

    // Sign JWT Token
    const token = await signToken(
      {
        id: user.id,
        role: user.role,
        doctorId: user.doctor.id,
      },
      '30d'
    );

    // Set HttpOnly Cookie
    const cookieStore = await cookies();
    cookieStore.set('jivnicare_token', token, {
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
        phone: decrypt(user.phone),
        role: user.role,
        doctorId: user.doctor.id,
      }
    });

  } catch (error) {
    console.error('Doctor Login Error:', error);
    return apiError('Internal server error', 500);
  }
}
