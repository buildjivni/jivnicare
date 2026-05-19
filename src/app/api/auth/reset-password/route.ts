import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import bcrypt from 'bcryptjs';

export async function POST(request: Request) {
  try {
    const { phone, otp, password } = await request.json();

    if (!phone || !otp || !password) {
      return NextResponse.json({ error: 'Phone number, OTP, and new password are required' }, { status: 400 });
    }

    if (password.length < 6) {
      return NextResponse.json({ error: 'Password must be at least 6 characters long' }, { status: 400 });
    }

    // Find the user by phone
    const user = await prisma.user.findUnique({
      where: { phone },
      include: { doctor: true }
    });

    if (!user) {
      return NextResponse.json({ error: 'No account registered with this phone number.' }, { status: 404 });
    }

    if (user.role !== 'DOCTOR' || !user.doctor) {
      return NextResponse.json({ error: 'Account is not registered as a Doctor.' }, { status: 403 });
    }

    // Verify OTP (Test mode: Accept 123456)
    if (otp !== '123456') {
      return NextResponse.json({ error: 'Invalid OTP code. Please enter 123456 in test mode.' }, { status: 400 });
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Update user's password
    await prisma.user.update({
      where: { id: user.id },
      data: { password: hashedPassword }
    });

    return NextResponse.json({
      success: true,
      message: 'Password reset successfully. Please login with your new password.'
    });

  } catch (error) {
    console.error('Password Reset Error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
