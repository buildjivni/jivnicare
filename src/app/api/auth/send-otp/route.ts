import { NextResponse } from "next/server";
import prisma from "@/lib/db/prisma";
import { isFirebaseConfigured, isTestOtpAllowed } from "@/lib/infrastructure/env";
import { checkRateLimit } from "@/lib/infrastructure/rate-limit";
import {
  isPilotOtpModeActive,
  isPhoneWhitelisted,
  normalizePhone10,
} from "@/lib/auth/pilot-otp";
import { logger } from "@/lib/infrastructure/logger";

const SEND_LIMIT = 3;
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

    let phone10: string;
    try {
      phone10 = normalizePhone10(phone);
    } catch {
      return NextResponse.json({ error: "Invalid phone number format" }, { status: 400 });
    }

    const ip =
      request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "127.0.0.1";

    // ── Pilot test mode (whitelist, no Firebase SMS) ─────────────────
    if (isPilotOtpModeActive()) {
      if (!isPhoneWhitelisted(phone10)) {
        logger.warn({
          category: "OTP",
          message: "Pilot OTP: phone not whitelisted",
          metadata: { phoneSuffix: phone10.slice(-4) },
        });
        return NextResponse.json(
          { error: "This number is not enabled for the pilot. Contact support." },
          { status: 403 }
        );
      }

      const phoneLimit = await checkRateLimit({
        identifier: `pilot_send_phone_${phone10}`,
        limit: SEND_LIMIT,
        windowMs: SEND_WINDOW_MS,
      });
      const ipLimit = await checkRateLimit({
        identifier: `pilot_send_ip_${ip}`,
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

      const existingUser = await prisma.user.findUnique({
        where: { phone: phone10 },
        select: { id: true },
      });

      return NextResponse.json({
        message: "Pilot test OTP ready. Use the code sent to your pilot device.",
        userExists: !!existingUser,
        pilotMode: true,
      });
    }

    if (!isFirebaseConfigured() && !isTestOtpAllowed()) {
      return NextResponse.json(
        { error: "Phone verification service is not configured on the server." },
        { status: 503 }
      );
    }

    const existingUser = await prisma.user.findUnique({
      where: { phone: phone10 },
      select: { id: true },
    });

    return NextResponse.json({
      message: "Proceed with Firebase OTP on your device",
      userExists: !!existingUser,
      pilotMode: false,
    });
  } catch (error) {
    logger.error({ category: "OTP", message: "Send OTP error", error });
    return NextResponse.json(
      { error: "Internal server error while checking phone number" },
      { status: 500 }
    );
  }
}
