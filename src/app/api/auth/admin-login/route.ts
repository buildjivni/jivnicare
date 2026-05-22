import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import prisma from "@/lib/db/prisma";
import { AuthService } from "@/features/auth/services/authService";

export async function POST(req: Request) {
  try {
    const { email, password } = await req.json();

    if (!email || !password) {
      return NextResponse.json({ error: "Email and password are required" }, { status: 400 });
    }

    // IP-based Rate Limiting to prevent brute-force
    const ip = req.headers.get('x-forwarded-for') || 'unknown';
    const now = new Date();
    const windowMs = 15 * 60 * 1000; // 15 minutes
    const maxRequests = 5; // Allow 5 attempts per 15 minutes

    const rateLimit = await prisma.rateLimit.upsert({
      where: { ip: `admin_${ip}` },
      update: {},
      create: {
        ip: `admin_${ip}`,
        count: 0,
        resetTime: new Date(now.getTime() + windowMs),
      },
    });

    if (now > rateLimit.resetTime) {
      // Reset window
      await prisma.rateLimit.update({
        where: { id: rateLimit.id },
        data: { count: 1, resetTime: new Date(now.getTime() + windowMs) },
      });
    } else {
      if (rateLimit.count >= maxRequests) {
        return NextResponse.json({ 
          error: 'Too many failed attempts. Please try again in 15 minutes.',
        }, { status: 429 });
      }
      
      // Increment count for this attempt
      await prisma.rateLimit.update({
        where: { id: rateLimit.id },
        data: { count: { increment: 1 } },
      });
    }

    // Admin user is identified by ADMIN role (not by email since schema has no email field)
    // We use password hash comparison for security
    try {
      const { user, token } = await AuthService.login(email, password, "ADMIN");

      const response = NextResponse.json({
        success: true,
        user: { id: user.id, name: user.name, email, role: "ADMIN" },
        token
      });

      response.cookies.set("auth-token", token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
        maxAge: 24 * 60 * 60, // 1 day
        path: "/",
      });

      return response;
    } catch (e: any) {
      if (e.message === "INVALID_CREDENTIALS") {
        return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
      }
      throw e;
    }
  } catch (error) {
    console.error("Admin Login Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
