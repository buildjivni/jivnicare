import { apiResponse, apiError } from '@/lib/utils/api-response';
import { NextResponse } from "next/server";
import prisma from "@/lib/db/prisma";
import { getTwoFactorApiKey } from "@/lib/infrastructure/env";
import { otpRatelimit, checkUpstashRateLimit } from "@/lib/ratelimit";
import { logger } from "@/lib/infrastructure/logger";

import { isTestOtpModeEnabled, getTestOtpNumbers } from "@/lib/config/test-mode";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { phone } = body;

    if (!phone || typeof phone !== "string") {
      return apiError("Valid phone number dena zaroori hai", 400);
    }

    const phone10 = phone.replace(/\D/g, "").slice(-10);
    if (!/^[6-9]\d{9}$/.test(phone10)) {
      return apiError("Phone number sahi nahi hai", 400);
    }

    // --- Upstash Rate Limiting ---
    const { success } = await checkUpstashRateLimit(
      otpRatelimit, 
      `otp_send_${phone10}`
    );

    if (!success) {
      return apiError("Bahut zyada requests. Thodi der mein try karein.", 429);
    }

    const apiKey = getTwoFactorApiKey();
    if (!apiKey) {
      return apiError("Phone verification service configured nahi hai.", 503);
    }

    if (isTestOtpModeEnabled() && getTestOtpNumbers().includes(phone10)) {
      const existingUser = await prisma.user.findUnique({
        where: { phone: phone10 },
        select: { id: true },
      });
      return apiResponse({
        message: "Test OTP generate ho gaya",
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
      return apiError("OTP bhejne mein dikkat hui. SMS service shayad band hai.", 503);
    }

    const data = await res.json();
    if (data.Status !== "Success") {
      logger.error({ category: "OTP", message: "2Factor API error", error: data });
      return apiError("OTP nahi bhej paaye. Kripya dubara try karein.", 500);
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

    return apiResponse({
      message: "OTP bhej diya gaya hai",
      sessionId: data.Details,
      userExists: !!existingUser,
    });
  } catch (error) {
    logger.error({ category: "OTP", message: "Send OTP error", error });
    return apiError("Internal server error while sending OTP", 500);
  }
}
