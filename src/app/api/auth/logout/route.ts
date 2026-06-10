import { apiResponse, apiError } from '@/lib/utils/api-response';
import { NextRequest, NextResponse } from "next/server";
import { isTestOtpModeEnabled } from "@/lib/config/test-mode";
import { redis } from "@/lib/db/redis";
import { verifyToken } from "@/lib/jwt";

export async function POST(request: NextRequest) {
  const token = request.cookies.get("jivnicare_token")?.value;
  
  if (token) {
    try {
      const decoded = await verifyToken(token);
      if (decoded?.exp) {
        const ttl = Math.max(0, decoded.exp - Math.floor(Date.now() / 1000));
        if (ttl > 0) {
          // Blocklist the token for its remaining lifespan
          await redis.set(`revoked:${token}`, "true", { ex: ttl });
        }
      }
    } catch (e) {
      // Ignore decode errors
    }
  }

  const response = apiResponse({status: "success"});
  
  response.cookies.set("jivnicare_token", "", {
    maxAge: 0,
    path: "/",
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production' && !isTestOtpModeEnabled(),
    sameSite: 'strict',
  });

  return response;
}
