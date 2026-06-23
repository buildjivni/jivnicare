import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db/prisma";
import { verifyToken } from "@/lib/jwt";
import { generateTOTPSecret, getTOTPUri } from "@/lib/utils/totp";
import { redis } from "@/lib/db/redis";

export async function GET(request: NextRequest) {
  const tempToken = request.cookies.get("admin_temp_token")?.value;
  if (!tempToken) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const payload = await verifyToken(tempToken);
  if (!payload || payload.role !== "ADMIN_TEMP") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const userId = payload.id;
  const dbUser = await prisma.user.findUnique({
    where: { id: userId },
  });

  if (!dbUser || dbUser.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (dbUser.totpEnabled) {
    return NextResponse.json({ error: "TOTP already set up" }, { status: 400 });
  }

  const secret = generateTOTPSecret();
  const uri = getTOTPUri(secret, dbUser.email || "admin@jivnicare.com");

  if (redis) {
    await redis.set(`pending_totp_secret:${userId}`, secret, { ex: 600 });
  }

  return NextResponse.json({
    success: true,
    secret,
    qrCodeUri: uri,
  });
}
