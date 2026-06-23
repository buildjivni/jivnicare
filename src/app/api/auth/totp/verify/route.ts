import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db/prisma";
import { verifyToken, signToken, AUTH_COOKIE, cookieOptions } from "@/lib/jwt";
import { verifyAdminTOTP, generateBackupCodes } from "@/lib/utils/totp";
import { redis } from "@/lib/db/redis";
import crypto from "crypto";
import bcrypt from "bcryptjs";
import { Role } from "@prisma/client";

export async function POST(request: NextRequest) {
  try {
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

    const body = await request.json();
    const { code } = body;

    if (!code) {
      return NextResponse.json({ error: "Code is required" }, { status: 400 });
    }

    let isVerified = false;
    let newBackupCodes: string[] = [];

    if (!dbUser.totpEnabled) {
      // 1. First-time setup verification
      let pendingSecret: string | null = null;
      if (redis) {
        pendingSecret = await redis.get(`pending_totp_secret:${userId}`);
      }

      if (!pendingSecret) {
        return NextResponse.json(
          { error: "Setup session expired. Please restart setup." },
          { status: 400 }
        );
      }

      isVerified = verifyAdminTOTP(code, pendingSecret);

      if (isVerified) {
        // Generate backup codes
        const plainBackupCodes = generateBackupCodes();
        // Hash backup codes for secure storage
        const hashedBackupCodes = await Promise.all(
          plainBackupCodes.map((c) => bcrypt.hash(c, 10))
        );

        // Update user
        await prisma.user.update({
          where: { id: userId },
          data: {
            totpSecret: pendingSecret,
            totpEnabled: true,
            backupCodes: hashedBackupCodes,
          },
        });

        newBackupCodes = plainBackupCodes;
        if (redis) {
          await redis.del(`pending_totp_secret:${userId}`);
        }
      }
    } else {
      // 2. Subsequent logins
      isVerified = verifyAdminTOTP(code, dbUser.totpSecret || undefined);

      if (!isVerified && dbUser.backupCodes.length > 0) {
        // Check if code matches one of the backup codes
        let matchedIndex = -1;
        for (let i = 0; i < dbUser.backupCodes.length; i++) {
          const isMatch = await bcrypt.compare(code, dbUser.backupCodes[i]);
          if (isMatch) {
            matchedIndex = i;
            break;
          }
        }

        if (matchedIndex !== -1) {
          isVerified = true;
          // Remove used backup code from array
          const updatedBackupCodes = dbUser.backupCodes.filter(
            (_, idx) => idx !== matchedIndex
          );
          await prisma.user.update({
            where: { id: userId },
            data: {
              backupCodes: updatedBackupCodes,
            },
          });
        }
      }
    }

    if (!isVerified) {
      return NextResponse.json({ error: "Invalid verification code" }, { status: 400 });
    }

    // Success: Issue session
    await enforceSessionLimit(userId, "ADMIN");

    const dbSession = await prisma.authSession.create({
      data: {
        userId,
        token: crypto.randomUUID(),
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      },
    });

    const jwt = await signToken({
      sub: userId,
      id: userId,
      role: "ADMIN",
      sessionId: dbSession.id,
    });

    const response = NextResponse.json({
      success: true,
      backupCodes: newBackupCodes.length > 0 ? newBackupCodes : undefined,
    });

    // Set auth cookie
    response.cookies.set(AUTH_COOKIE, jwt, cookieOptions);
    // Delete temp admin token
    response.cookies.delete("admin_temp_token");

    return response;
  } catch (err) {
    console.error("TOTP verification error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

async function enforceSessionLimit(userId: string, role: string) {
  const limits: Record<string, number> = { PATIENT: 2, DOCTOR: 3, ADMIN: 1 };
  const limit = limits[role] ?? 2;

  const sessions = await prisma.authSession.findMany({
    where: { userId, expiresAt: { gt: new Date() } },
    orderBy: { createdAt: "asc" },
  });

  if (sessions.length >= limit) {
    const toRevoke = sessions.slice(0, sessions.length - limit + 1);
    await prisma.authSession.deleteMany({
      where: { id: { in: toRevoke.map((s) => s.id) } },
    });
  }
}
