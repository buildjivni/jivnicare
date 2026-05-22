import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import prisma from "@/lib/db/prisma";
import { verifyToken } from "@/lib/jwt";
import { logger } from "@/lib/infrastructure/logger";

export async function POST(request: Request) {
  try {
    const token = (await cookies()).get("auth-token")?.value;
    if (!token) {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 });
    }

    const payload = verifyToken(token) as { id: string; role?: string } | null;
    if (!payload?.id) {
      return NextResponse.json({ error: "Invalid session" }, { status: 401 });
    }

    const body = await request.json();
    const name = typeof body.name === "string" ? body.name.trim() : "";
    const location = typeof body.location === "string" ? body.location.trim() : "";

    if (name.length < 2 || name.length > 60) {
      return NextResponse.json(
        { error: "Please enter a valid name (2–60 characters)." },
        { status: 400 }
      );
    }
    if (!/^[a-zA-Z\s.]+$/.test(name)) {
      return NextResponse.json(
        { error: "Name can only contain letters, spaces, and periods." },
        { status: 400 }
      );
    }
    if (location.length < 2 || location.length > 100) {
      return NextResponse.json(
        { error: "Please enter a valid city or village name." },
        { status: 400 }
      );
    }

    const user = await prisma.user.update({
      where: { id: payload.id },
      data: { name, location },
      select: {
        id: true,
        phone: true,
        name: true,
        role: true,
        location: true,
        doctor: { select: { id: true } },
      },
    });

    return NextResponse.json({
      success: true,
      user: {
        id: user.id,
        phone: user.phone,
        name: user.name,
        role: user.role,
        location: user.location,
        doctorId: user.doctor?.id ?? null,
      },
    });
  } catch (error) {
    logger.error({
      category: "AUTH",
      message: "update-profile failed",
      error,
    });
    return NextResponse.json({ error: "Failed to save profile" }, { status: 500 });
  }
}
