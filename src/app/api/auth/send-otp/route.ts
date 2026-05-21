import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { isFirebaseConfigured, isTestOtpAllowed } from '@/lib/env';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { phone } = body;

    if (!phone || typeof phone !== 'string') {
      return NextResponse.json(
        { error: 'Valid phone number is required' },
        { status: 400 }
      );
    }

    if (!isFirebaseConfigured() && !isTestOtpAllowed()) {
      return NextResponse.json(
        { error: 'Phone verification service is not configured on the server.' },
        { status: 503 }
      );
    }

    const existingUser = await prisma.user.findUnique({
      where: { phone: phone.replace(/\D/g, '').slice(-10) },
      select: { id: true },
    });

    return NextResponse.json({
      message: 'Proceed with Firebase OTP on your device',
      userExists: !!existingUser,
    });
  } catch (error) {
    console.error('Send OTP Error:', error);
    return NextResponse.json(
      { error: 'Internal server error while checking phone number' },
      { status: 500 }
    );
  }
}
