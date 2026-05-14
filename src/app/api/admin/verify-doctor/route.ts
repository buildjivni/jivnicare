import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { verifyToken } from "@/lib/jwt";
import { cookies } from "next/headers";

export async function POST(req: Request) {
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

    const { doctorId, status, adminNotes } = await req.json();

    if (!doctorId || !status) {
      return NextResponse.json({ error: "Doctor ID and Status are required" }, { status: 400 });
    }

    // Update the doctor verification status
    const updatedDoctor = await prisma.doctor.update({
      where: { id: doctorId },
      data: {
        verificationStatus: status, // VERIFIED, REJECTED, SUSPENDED
      },
    });

    // Also log this moderation action
    await prisma.moderationLog.create({
      data: {
        adminId: decoded.id,
        action: `UPDATED_STATUS_TO_${status}`,
        targetType: "DOCTOR",
        targetId: doctorId,
        reason: adminNotes || "Status updated via Admin Panel",
      }
    });

    return NextResponse.json({ success: true, doctor: updatedDoctor });
  } catch (error) {
    console.error("POST Admin Verify Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
