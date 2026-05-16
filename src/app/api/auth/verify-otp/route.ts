import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const MAX_ATTEMPTS = 3;

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { phone, otp, name } = body;

    if (!phone || !otp) {
      return NextResponse.json(
        { error: 'Phone and OTP are required' },
        { status: 400 }
      );
    }

    // ── OTP lookup ──────────────────────────────────────────────
    const storedData = await prisma.otpToken.findUnique({
      where: { phone },
    });

    if (!storedData) {
      return NextResponse.json(
        { error: 'OTP not requested or expired' },
        { status: 400 }
      );
    }

    if (new Date() > storedData.expiresAt) {
      await prisma.otpToken.delete({ where: { phone } });
      return NextResponse.json(
        { error: 'OTP has expired. Please request a new one.' },
        { status: 400 }
      );
    }

    if (storedData.attempts >= MAX_ATTEMPTS) {
      await prisma.otpToken.delete({ where: { phone } });
      return NextResponse.json(
        { error: 'Too many failed attempts. Please request a new OTP.' },
        { status: 429 }
      );
    }

    const isMatch = await bcrypt.compare(otp.toString(), storedData.hashedOtp);

    if (!isMatch) {
      await prisma.otpToken.update({
        where: { phone },
        data: { attempts: storedData.attempts + 1 },
      });
      const remaining = MAX_ATTEMPTS - storedData.attempts - 1;
      return NextResponse.json(
        { error: `Invalid OTP. ${remaining} attempt${remaining !== 1 ? 's' : ''} remaining.` },
        { status: 401 }
      );
    }

    // ── OTP valid — consume it immediately ───────────────────────
    await prisma.otpToken.delete({ where: { phone } });

    // ── Find or create user (identity deduplication) ─────────────
    // findOrCreate ensures one identity per phone number.
    // name is only written if the user has no name yet (returning users keep their existing name).
    let user = await prisma.user.findUnique({ where: { phone } });

    if (!user) {
      // First-time user — create with provided name
      user = await prisma.user.create({
        data: {
          phone,
          name: name?.trim() || null,
          isVerified: true,
          role: 'PATIENT',
        },
      });
    } else {
      // Returning user — only patch if missing fields
      const needsUpdate = !user.isVerified || (name?.trim() && !user.name);
      if (needsUpdate) {
        user = await prisma.user.update({
          where: { id: user.id },
          data: {
            isVerified: true,
            ...(name?.trim() && !user.name ? { name: name.trim() } : {}),
          },
        });
      }
    }

    // ── Resolve linked doctor record (if any) ────────────────────
    // This allows the client to know the doctorId immediately after
    // login without a separate /api/auth/me call.
    let linkedDoctor: { id: string } | null = null;
    if (user.role === 'DOCTOR') {
      linkedDoctor = await prisma.doctor.findUnique({
        where: { userId: user.id },
        select: { id: true },
      });
    }

    // ── Generate JWT ─────────────────────────────────────────────
    const jwtSecret = process.env.JWT_SECRET;
    if (!jwtSecret) {
      throw new Error('JWT_SECRET is not configured');
    }

    const payload = { id: user.id, role: user.role };
    const token = jwt.sign(payload, jwtSecret, { expiresIn: '7d' });

    const response = NextResponse.json({
      message: 'OTP verified successfully',
      token,
      user: {
        id: user.id,
        phone: user.phone,
        name: user.name,
        role: user.role,
        // Populated for DOCTOR users — null for PATIENT/ADMIN
        doctorId: linkedDoctor?.id ?? null,
        // True if this phone number already existed in the DB before this OTP
        isReturning: !!user.createdAt && (Date.now() - user.createdAt.getTime()) > 60_000,
      },
    });

    response.cookies.set('auth-token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60, // 7 days
      path: '/',
    });

    return response;
  } catch (error) {
    console.error('Verify OTP Error:', error);
    return NextResponse.json(
      { error: 'Internal server error while verifying OTP' },
      { status: 500 }
    );
  }
}
