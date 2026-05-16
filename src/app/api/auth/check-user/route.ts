import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

/**
 * JivniCare Auth — Check User
 * GET /api/auth/check-user?phone=...
 * Light check to decide if we need to show the Name field.
 */

export async function GET(request: NextRequest) {
  const phone = request.nextUrl.searchParams.get("phone");

  if (!phone) {
    return NextResponse.json({ error: "Missing phone number" }, { status: 400 });
  }

  try {
    const user = await prisma.user.findUnique({
      where: { phone },
    });

    return NextResponse.json({ exists: !!user });
  } catch (error) {
    return NextResponse.json({ exists: false });
  }
}
