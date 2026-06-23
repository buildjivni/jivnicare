import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../[...nextauth]/route";
import prisma from "@/lib/db/prisma";
import { signToken, AUTH_COOKIE, cookieOptions } from "@/lib/jwt";
import crypto from "crypto";
import { Role } from "@prisma/client";

export async function GET(request: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session || !session.user) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  const role = (session.user as any).role;
  const userId = (session.user as any).id;

  if (role === Role.DOCTOR) {
    const dbDoctor = await prisma.doctor.findUnique({
      where: { userId },
    });

    await enforceSessionLimit(userId, "DOCTOR");

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
      role: "DOCTOR",
      doctorId: dbDoctor?.id,
      sessionId: dbSession.id,
    });

    const response = NextResponse.redirect(new URL("/doctor/dashboard", request.url));
    response.cookies.set(AUTH_COOKIE, jwt, cookieOptions);
    return response;
  }

  if (role === Role.ADMIN) {
    const dbUser = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!dbUser) {
      return NextResponse.redirect(new URL("/admin/login", request.url));
    }

    const tempJwt = await signToken(
      {
        sub: userId,
        id: userId,
        role: "ADMIN_TEMP",
      },
      "10m"
    );

    const targetUrl = dbUser.totpEnabled
      ? "/admin/totp-verify"
      : "/admin/totp-setup";

    const response = NextResponse.redirect(new URL(targetUrl, request.url));
    response.cookies.set("admin_temp_token", tempJwt, {
      ...cookieOptions,
      maxAge: 600, // 10 mins
    });
    return response;
  }

  return NextResponse.redirect(new URL("/login", request.url));
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
