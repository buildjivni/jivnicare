import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import bcrypt from 'bcryptjs';
import { isTestOtpAllowed, isFirebaseConfigured } from '@/lib/env';
import { verifyFirebaseIdToken, normalizeIndianPhone } from '@/lib/firebase/admin';

export async function POST(request: Request) {
  try {
    const { phone, otp, password, firebaseIdToken } = await request.json();

    if (!phone || !password) {
      return NextResponse.json({ error: 'Phone number and new password are required' }, { status: 400 });
    }

    if (password.length < 6) {
      return NextResponse.json({ error: 'Password must be at least 6 characters long' }, { status: 400 });
    }

    let phone10: string;
    try {
      phone10 = normalizeIndianPhone(phone);
    } catch {
      return NextResponse.json({ error: 'Invalid phone number' }, { status: 400 });
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

    let verified = false;

    if (firebaseIdToken && isFirebaseConfigured()) {
      try {
        const fb = await verifyFirebaseIdToken(firebaseIdToken);
        verified = fb.phone10 === phone10;
      } catch {
        verified = false;
      }
    } else if (isTestOtpAllowed() && otp === '123456') {
      verified = true;
    }

    if (!verified) {
      return NextResponse.json({ error: 'Invalid or expired OTP verification.' }, { status: 401 });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    await prisma.user.update({
      where: { id: user.id },
      data: { password: hashedPassword },
    });

    return NextResponse.json({ success: true, message: 'Password reset successfully.' });
  } catch (error) {
    console.error('Reset Password Error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
