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

    // IP-based Rate Limiting (In-memory for MVP, replace with Redis for scale)
    const ip = request.headers.get('x-forwarded-for') || 'unknown';
    const now = Date.now();
    const windowMs = 5 * 60 * 1000; // 5 minutes
    const maxRequests = 3;

    if (!global.otpRateLimitMap) {
      global.otpRateLimitMap = new Map<string, { count: number; resetTime: number }>();
    }

    const rateLimitInfo = global.otpRateLimitMap.get(ip);
    if (rateLimitInfo) {
      if (now < rateLimitInfo.resetTime) {
        if (rateLimitInfo.count >= maxRequests) {
          return NextResponse.json({ error: 'Too many requests from this IP. Please try again later.' }, { status: 429 });
        }
        rateLimitInfo.count++;
      } else {
        global.otpRateLimitMap.set(ip, { count: 1, resetTime: now + windowMs });
      }
    } else {
      global.otpRateLimitMap.set(ip, { count: 1, resetTime: now + windowMs });
    }

    // Check rate limits/cooldown: prevent spamming OTPs within 60 seconds
    const existingOtp = await prisma.otpToken.findUnique({
      where: { phone },
    });

    if (existingOtp && existingOtp.createdAt.getTime() > Date.now() - 60000) {
      return NextResponse.json(
        { error: 'Please wait 60 seconds before requesting another OTP' },
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

    return NextResponse.json({
      message: 'OTP sent successfully',
      // DO NOT RETURN OTP IN PRODUCTION (only left for debugging locally if needed)
      // dev_otp: process.env.NODE_ENV !== 'production' ? otp : undefined, 
    });
  } catch (error) {
    console.error('Send OTP Error:', error);
    return NextResponse.json(
      { error: 'Internal server error while sending OTP' },
      { status: 500 }
    );
  }
}
