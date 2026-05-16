import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import bcrypt from 'bcryptjs';
import { sendSMS } from '@/lib/sms';

declare global {
  var otpRateLimitMap: Map<string, { count: number; resetTime: number }> | undefined;
}

// OTP expiry in milliseconds (5 minutes)
const OTP_EXPIRY_MS = 5 * 60 * 1000;

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

    // IP-based Rate Limiting (Database-backed for scale/serverless)
    const ip = request.headers.get('x-forwarded-for') || 'unknown';
    const now = new Date();
    const windowMs = 5 * 60 * 1000; // 5 minutes
    const maxRequests = 5; // Allow 5 requests per 5 minutes

    const rateLimit = await prisma.rateLimit.upsert({
      where: { ip },
      update: {},
      create: {
        ip,
        count: 0,
        resetTime: new Date(now.getTime() + windowMs),
      },
    });

    if (now > rateLimit.resetTime) {
      // Reset window
      await prisma.rateLimit.update({
        where: { id: rateLimit.id },
        data: { count: 1, resetTime: new Date(now.getTime() + windowMs) },
      });
    } else {
      if (rateLimit.count >= maxRequests) {
        return NextResponse.json({ 
          error: 'Too many requests from this IP. Please try again later.',
          retryAfter: Math.ceil((rateLimit.resetTime.getTime() - now.getTime()) / 1000)
        }, { status: 429 });
      }
      
      // Increment count
      await prisma.rateLimit.update({
        where: { id: rateLimit.id },
        data: { count: { increment: 1 } },
      });
    }

    // Check rate limits/cooldown: prevent spamming OTPs within 60 seconds for the same phone
    const existingOtp = await prisma.otpToken.findUnique({
      where: { phone },
    });

    if (existingOtp && existingOtp.createdAt.getTime() > Date.now() - 60000) {
      return NextResponse.json(
        { 
          error: 'Please wait 60 seconds before requesting another OTP',
          retryAfter: Math.ceil((existingOtp.createdAt.getTime() + 60000 - Date.now()) / 1000)
        },
        { status: 429 } // Too Many Requests
      );
    }

    // Generate a 6-digit OTP (use '123456' for dev/MVP testing)
    const otp = process.env.NODE_ENV === 'development' ? '123456' : Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + OTP_EXPIRY_MS);

    // Hash the OTP before storing it
    const saltRounds = 10;
    const hashedOtp = await bcrypt.hash(otp, saltRounds);

    // Upsert the OTP token in the DB
    await prisma.otpToken.upsert({
      where: { phone },
      update: {
        hashedOtp,
        expiresAt,
        attempts: 0,
        createdAt: new Date(),
      },
      create: {
        phone,
        hashedOtp,
        expiresAt,
        attempts: 0,
      },
    });

    // Send actual SMS
    const smsSent = await sendSMS(phone, otp);

    if (!smsSent) {
      console.warn(`[SMS] Failed to send SMS to ${phone}, but OTP was saved. Let user retry.`);
      // We don't fail the request completely because in India SMS delivery can be flaky.
      // But we can return a flag if needed.
    }

    // Check if user exists to tell the UI whether to ask for a name
    const existingUser = await prisma.user.findUnique({
      where: { phone },
      select: { id: true }
    });

    return NextResponse.json({
      message: 'OTP sent successfully',
      userExists: !!existingUser,
    });
  } catch (error) {
    console.error('Send OTP Error:', error);
    return NextResponse.json(
      { error: 'Internal server error while sending OTP' },
      { status: 500 }
    );
  }
}
