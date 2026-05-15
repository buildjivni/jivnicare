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

    // Notify the doctor via SMS
    const doctorUser = await prisma.user.findUnique({
      where: { id: updatedDoctor.userId }
    });

    if (doctorUser && doctorUser.phone) {
      const { sendSMS } = await import("@/lib/sms");
      let message = "";
      if (status === "VERIFIED") {
        message = `Dear Dr. ${updatedDoctor.name}, your profile on JivniCare has been VERIFIED. You can now login and manage appointments.`;
      } else if (status === "REJECTED") {
        message = `Dear Dr. ${updatedDoctor.name}, your profile on JivniCare was REJECTED. Reason: ${adminNotes || "Please contact support."}`;
      }
      
      if (message) {
        // We use a custom message here, so we'll need to adapt the sms.ts to allow generic messages 
        // OR just send the OTP template if the sms service is strictly OTP. 
        // For MVP, we will call it and it will log. If fast2sms allows generic text without a specific DLT template, it might fail in prod.
        // It's safer to implement an in-app notification first.
        await prisma.notification.create({
          data: {
            userId: doctorUser.id,
            type: status === "VERIFIED" ? "VERIFICATION_APPROVED" : "VERIFICATION_REJECTED",
            title: `Profile ${status}`,
            message: message,
          }
        });
        
        // Optionally attempt SMS if configured
        try {
           // await sendSMS(doctorUser.phone, `STATUS: ${status}`); // If Fast2SMS template is strict, this might fail. We rely on the Notification table.
        } catch(e) {}
      }
    }

    return NextResponse.json({ success: true, doctor: updatedDoctor });
  } catch (error) {
    console.error("POST Admin Verify Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
