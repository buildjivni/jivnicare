import { NextRequest, NextResponse } from "next/server";
import { isTestOtpModeEnabled } from "@/lib/config/test-mode";
import { redis } from "@/lib/db/redis";
import jwt from "jsonwebtoken";

export async function POST(request: NextRequest) {
  const token = request.cookies.get("auth-token")?.value;
  
  if (token) {
    try {
      const decoded = jwt.decode(token) as { exp?: number };
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

  const response = NextResponse.json({ status: "success" });
  
  response.cookies.set("auth-token", "", {
    maxAge: 0,
    path: "/",
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production' && !isTestOtpModeEnabled(),
    sameSite: 'strict',
  });

  return response;
}
