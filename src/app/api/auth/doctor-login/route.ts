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

    try {
      const { user, token } = await AuthService.login(email, password, "DOCTOR");

      const response = NextResponse.json({
        success: true,
        user: { id: user.id, name: user.name, email, role: "DOCTOR" },
        token
      });

      response.cookies.set("auth-token", token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
        maxAge: 7 * 24 * 60 * 60, // 7 days
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
    console.error("Doctor Login Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
