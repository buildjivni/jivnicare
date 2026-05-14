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
        { error: 'OTP has expired' },
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
      return NextResponse.json(
        { error: 'Invalid OTP' },
        { status: 401 }
      );
    }

    // OTP is valid. Remove it from store to prevent reuse.
    await prisma.otpToken.delete({ where: { phone } });

    // Find or create user
    let user = await prisma.user.findUnique({
      where: { phone },
    });

    if (!user) {
      user = await prisma.user.create({
        data: {
          phone,
          name: name?.trim() || null,
          isVerified: true,
          role: 'PATIENT',
        },
      });
      console.log(`Created new user with phone ${phone}`);
    } else if (!user.isVerified || (name?.trim() && !user.name)) {
      user = await prisma.user.update({
        where: { id: user.id },
        data: {
          isVerified: true,
          // Only update name if user doesn't have one yet
          ...(name?.trim() && !user.name ? { name: name.trim() } : {}),
        },
      });
    }

    // Generate JWT
    const payload = { id: user.id, role: user.role };
    const jwtSecret = process.env.JWT_SECRET;
    
    if (!jwtSecret) {
      throw new Error('JWT_SECRET is not configured in environment variables');
    }

    const token = jwt.sign(payload, jwtSecret, { expiresIn: '7d' });

    const response = NextResponse.json({
      message: 'OTP verified successfully',
      token,
      user: {
        id: user.id,
        phone: user.phone,
        name: user.name,
        role: user.role,
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
