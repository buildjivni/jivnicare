import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import prisma from "@/lib/prisma";
import { AuthService } from "@/services/authService";

export async function POST(req: Request) {
  try {
    const { email, password } = await req.json();

    if (!email || !password) {
      return NextResponse.json({ error: "Email and password are required" }, { status: 400 });
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
        sameSite: "lax",
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
