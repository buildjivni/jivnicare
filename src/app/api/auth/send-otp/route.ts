import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

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

    // ── TEST AUTH MODE ──────────────────────────────────────────
    // Immediately return success without hitting Fast2SMS or creating OTP records.
    // The user will proceed to the verify-otp step where `123456` will be accepted.

    const existingUser = await prisma.user.findUnique({
      where: { phone },
      select: { id: true }
    });

    return NextResponse.json({
      message: 'OTP sent successfully (TEST MODE)',
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
