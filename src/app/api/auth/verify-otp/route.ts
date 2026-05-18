import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import jwt from 'jsonwebtoken';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { phone, otp, name, location } = body;

    if (!phone || !otp) {
      return NextResponse.json(
        { error: 'Phone and OTP are required' },
        { status: 400 }
      );
    }

    // ── TEST AUTH MODE ──────────────────────────────────────────────
    // Accept "123456" for ALL users. 
    // Assign DOCTOR role to specific test numbers, PATIENT to others.
    if (otp !== "123456") {
      return NextResponse.json(
        { error: 'Invalid OTP. Use 123456 for test mode.' },
        { status: 401 }
      );
    }

    // Determine Role
    const isDoctorNumber = phone === "2222222222" || phone === "9430067927";
    const role = isDoctorNumber ? 'DOCTOR' : 'PATIENT';

    // Find or create user
    let user = await prisma.user.findUnique({
      where: { phone },
      include: { doctor: true }
    });

    if (!user) {
      user = await prisma.user.create({
        data: {
          phone,
          name: name?.trim() || (isDoctorNumber ? "Test Doctor" : "Test Patient"),
          location: location?.trim() || "Test Location",
          isVerified: true,
          role,
        },
        include: { doctor: true }
      });
    } else {
      // Returning user patch
      const needsUpdate = !user.isVerified || (name?.trim() && !user.name) || (location?.trim() && !user.location);
      if (needsUpdate) {
        user = await prisma.user.update({
          where: { id: user.id },
          data: {
            isVerified: true,
            ...(name?.trim() && !user.name ? { name: name.trim() } : {}),
            ...(location?.trim() && !user.location ? { location: location.trim() } : {}),
          },
          include: { doctor: true }
        });
      }
    }

    // Generate JWT
    const jwtSecret = process.env.JWT_SECRET || 'fallback-secret';
    const payload = { id: user.id, role: user.role };
    const token = jwt.sign(payload, jwtSecret, { expiresIn: '7d' });

    const response = NextResponse.json({
      message: 'OTP verified successfully (TEST MODE)',
      token,
      user: {
        id: user.id,
        phone: user.phone,
        name: user.name,
        role: user.role,
        doctorId: user.doctor?.id || null,
        isReturning: !!user.createdAt && (Date.now() - user.createdAt.getTime()) > 60_000,
      },
    });

    response.cookies.set('auth-token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
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
