import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { cookies } from 'next/headers';

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

    if (!user.password) {
      return NextResponse.json({ error: 'Password not set. Please contact Administrator for verification.' }, { status: 403 });
    }

    // Verify password
    const passwordMatch = await bcrypt.compare(password, user.password);
    if (!passwordMatch) {
      return NextResponse.json({ error: 'Invalid phone number or password' }, { status: 401 });
    }

    // Check doctor verification status
    if (user.doctor.verificationStatus !== 'VERIFIED') {
      let msg = 'Account is not verified yet.';
      if (user.doctor.verificationStatus === 'SUSPENDED') msg = 'Account has been suspended.';
      else if (user.doctor.verificationStatus === 'REJECTED') msg = 'Registration was rejected.';
      return NextResponse.json({ error: msg }, { status: 403 });
    }

    // Sign JWT Token
    const jwtSecret = process.env.JWT_SECRET || 'fallback-secret';
    const token = jwt.sign(
      {
        id: user.id,
        role: user.role,
        doctorId: user.doctor.id,
      },
      jwtSecret,
      { expiresIn: '7d' } // 7 day session
    );

    // Set HttpOnly Cookie
    const cookieStore = await cookies();
    cookieStore.set('auth-token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 7 * 24 * 60 * 60, // 7 days in seconds
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
