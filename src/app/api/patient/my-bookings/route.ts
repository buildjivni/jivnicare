import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { verifyToken } from "@/lib/jwt";
import { cookies } from "next/headers";

export async function GET(request: Request) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("auth-token")?.value;

    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const payload: any = await verifyToken(token);
    if (!payload || !payload.id) {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 });
    }

    const tokens = await prisma.queueToken.findMany({
      where: {
        userId: payload.id,
      },
      include: {
        queue: {
          include: {
            doctor: {
              include: {
                user: {
                  select: { name: true }
                }
              }
            }
          }
        }
      },
      orderBy: {
        tokenIssuedAt: 'desc'
      }
    });

    return NextResponse.json({ success: true, bookings: tokens });
  } catch (error: any) {
    console.error("Fetch bookings error:", error);
    return NextResponse.json({ error: "Failed to fetch bookings" }, { status: 500 });
  }
}
