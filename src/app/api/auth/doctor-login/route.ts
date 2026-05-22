import { NextResponse } from 'next/server';
import prisma from '@/lib/db/prisma';
import bcrypt from 'bcryptjs';
import { signToken } from '@/lib/jwt';
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
      '7d'
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
