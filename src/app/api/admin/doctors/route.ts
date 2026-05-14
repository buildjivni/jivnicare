import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { verifyToken } from "@/lib/jwt";
import { cookies } from "next/headers";

export async function GET(req: Request) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("auth-token")?.value;

    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const decoded: any = verifyToken(token);
    if (!decoded || decoded.role !== "ADMIN") {
      return NextResponse.json({ error: "Forbidden: Admin access only" }, { status: 403 });
    }

    const url = new URL(req.url);
    const status = url.searchParams.get("status") || "PENDING";

    const doctors = await prisma.doctor.findMany({
      where: {
        verificationStatus: status as any,
      },
      include: {
        user: true, // to get phone/email if needed
      },
      orderBy: {
        createdAt: 'desc',
      }
    });

    return NextResponse.json({ doctors });
  } catch (error) {
    console.error("GET Admin Doctors Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
