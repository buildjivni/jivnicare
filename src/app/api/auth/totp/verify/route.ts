import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db/prisma";
import { verifyToken, signToken, AUTH_COOKIE, cookieOptions } from "@/lib/jwt";
import { verifyAdminTOTP, generateBackupCodes } from "@/lib/utils/totp";
import { redis } from "@/lib/db/redis";
import crypto from "crypto";
import bcrypt from "bcryptjs";
import { Role } from "@prisma/client";
import { encrypt, decrypt } from "@/lib/crypto";

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

    if (!dbUser || dbUser.role !== "ADMIN" || !dbUser.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const adminRecord = await prisma.admin.findUnique({
      where: { email: dbUser.email },
    });

    if (!adminRecord) {
      return NextResponse.json({ error: "Admin record not found" }, { status: 404 });
    }

    const body = await request.json();
    const { code } = body;

    if (!code) {
      return NextResponse.json({ error: "Code is required" }, { status: 400 });
    }

    let isVerified = false;
    let newBackupCodes: string[] = [];

    if (!adminRecord.totpEnabled) {
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

        // Update Admin in a transaction
        await prisma.$transaction(async (tx) => {
          await tx.admin.update({
            where: { id: adminRecord.id },
            data: {
              totpSecret: encrypt(pendingSecret!),
              totpEnabled: true,
            },
          });

          // Create backup codes records
          await tx.backupCode.createMany({
            data: plainBackupCodes.map((bc) => ({
              adminId: adminRecord.id,
              codeHash: bcrypt.hashSync(bc, 10),
              used: false,
            })),
          });
        });

        newBackupCodes = plainBackupCodes;
        if (redis) {
          await redis.del(`pending_totp_secret:${userId}`);
        }
      }
    } else {
      // 2. Subsequent logins
      isVerified = verifyAdminTOTP(code, adminRecord.totpSecret ? decrypt(adminRecord.totpSecret) : undefined);

      if (!isVerified) {
        // Check if code matches one of the active backup codes
        const activeBackupCodes = await prisma.backupCode.findMany({
          where: { adminId: adminRecord.id, used: false },
        });

        let matchedId = null;
        for (const bc of activeBackupCodes) {
          const isMatch = await bcrypt.compare(code, bc.codeHash);
          if (isMatch) {
            matchedId = bc.id;
            break;
          }
        }

        if (matchedId !== null) {
          isVerified = true;
          // Mark used backup code
          await prisma.backupCode.update({
            where: { id: matchedId },
            data: {
              used: true,
              usedAt: new Date(),
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
