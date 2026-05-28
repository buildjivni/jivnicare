import { NextResponse } from "next/server";
import prisma from "@/lib/db/prisma";
import { getTwoFactorApiKey } from "@/lib/infrastructure/env";
import { checkRateLimit } from "@/lib/infrastructure/rate-limit";
import { logger } from "@/lib/infrastructure/logger";

import { isTestOtpModeEnabled, getTestOtpNumbers } from "@/lib/config/test-mode";

const SEND_LIMIT = 5;
const SEND_WINDOW_MS = 15 * 60 * 1000;

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { phone } = body;

    if (!phone || typeof phone !== "string") {
      return NextResponse.json(
        { error: "Valid phone number is required" },
        { status: 400 }
      );
    }

    const phone10 = phone.replace(/\D/g, "").slice(-10);
    if (phone10.length !== 10) {
      return NextResponse.json({ error: "Invalid phone number format" }, { status: 400 });
    }

    const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "127.0.0.1";

    const phoneLimit = await checkRateLimit({
      identifier: `otp_send_phone_${phone10}`,
      limit: SEND_LIMIT,
      windowMs: SEND_WINDOW_MS,
    });
    const ipLimit = await checkRateLimit({
      identifier: `otp_send_ip_${ip}`,
      limit: 10,
      windowMs: SEND_WINDOW_MS,
    });

    if (!phoneLimit.success || !ipLimit.success) {
      const reset = !phoneLimit.success ? phoneLimit.resetTime : ipLimit.resetTime;
      return NextResponse.json(
        {
          error: "Too many OTP requests. Please wait before trying again.",
          retryAfterSec: Math.max(
            0,
            Math.ceil((reset.getTime() - Date.now()) / 1000)
          ),
        },
        { status: 429 }
      );
    }

    const apiKey = getTwoFactorApiKey();
    if (!apiKey) {
      return NextResponse.json(
        { error: "Phone verification service is not configured on the server." },
        { status: 503 }
      );
    }

    if (isTestOtpModeEnabled() && getTestOtpNumbers().includes(phone10)) {
      const existingUser = await prisma.user.findUnique({
        where: { phone: phone10 },
        select: { id: true },
      });
      return NextResponse.json({
        message: "Test OTP generated",
        sessionId: `test_session_${phone10}`,
        userExists: !!existingUser,
      });
    }

    // Call 2Factor AUTOGEN API
    const res = await fetch(`https://2factor.in/API/V1/${apiKey}/SMS/${phone10}/AUTOGEN`, {
      method: 'GET',
    });
    
    if (!res.ok) {
      logger.error({ category: "OTP", message: "2Factor API HTTP error", error: `status ${res.status}` });
      return NextResponse.json({ error: "Failed to send OTP. SMS service may be unavailable." }, { status: 503 });
    }

    const data = await res.json();
    if (data.Status !== "Success") {
      logger.error({ category: "OTP", message: "2Factor API error", error: data });
      return NextResponse.json({ error: "Failed to send OTP. Please try again." }, { status: 500 });
    }

    const existingUser = await prisma.user.findUnique({
      where: { phone: phone10 },
      select: { id: true },
    });

    logger.info({
      category: "OTP",
      message: "2Factor OTP sent successfully",
      metadata: { phoneSuffix: phone10.slice(-4), sessionId: data.Details },
    });

    return NextResponse.json({
      message: "OTP sent successfully",
      sessionId: data.Details,
      userExists: !!existingUser,
    });
  } catch (error) {
    logger.error({ category: "OTP", message: "Send OTP error", error });
    return NextResponse.json(
      { error: "Internal server error while sending OTP" },
      { status: 500 }
    );
  }
}
