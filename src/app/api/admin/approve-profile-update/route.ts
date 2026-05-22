import { NextResponse } from "next/server";
import prisma from "@/lib/db/prisma";
import { verifyToken } from "@/lib/jwt";
import { cookies } from "next/headers";
import { approveUpdateSchema, formatZodError } from "@/lib/validators/validations";

export async function POST(request: Request) {
  try {
    // 1. Authenticate Admin
    const cookieStore = await cookies();
    const token = cookieStore.get("auth-token")?.value;

    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const decoded = verifyToken(token) as { role: string } | null;
    if (!decoded) {
      return NextResponse.json({ error: "Invalid or expired session" }, { status: 401 });
    }

    if (decoded.role !== "ADMIN") {
      return NextResponse.json({ error: "Access denied. Admins only." }, { status: 403 });
    }

    // 2. Parse and Validate Payload
    const body = await request.json();
    const validation = approveUpdateSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        { error: "Invalid payload: " + formatZodError(validation.error) },
        { status: 400 }
      );
    }

    const { logId, action, adminNotes } = validation.data;

    // 3. Process the Decision Atomically
    const result = await prisma.$transaction(async (tx) => {
      // Find the pending log entry
      const log = await tx.profileUpdateLog.findUnique({
        where: { id: logId }
      });

      if (!log) {
        throw new Error("LOG_NOT_FOUND");
      }

      if (log.status !== "PENDING") {
        throw new Error("LOG_ALREADY_RESOLVED");
      }

      // Explicitly allow only safe-listed fields to prevent unexpected model mutation
      const allowedFields = ["name", "medicalRegistrationNumber", "hospitalName", "district"];
      if (!allowedFields.includes(log.field)) {
        throw new Error("UNSUPPORTED_FIELD_MUTATION");
      }

      // Load Doctor's userId for notification
      const doctor = await tx.doctor.findUnique({
        where: { id: log.doctorId }
      });
      if (!doctor) {
        throw new Error("DOCTOR_NOT_FOUND");
      }

      // Check if there are other pending updates for this doctor
      const otherPendingLogs = await tx.profileUpdateLog.findMany({
        where: {
          doctorId: log.doctorId,
          id: { not: logId },
          status: "PENDING"
        }
      });

      if (action === "APPROVE") {
        // Apply value directly to doctor profile
        await tx.doctor.update({
          where: { id: log.doctorId },
          data: {
            [log.field]: log.newValue,
            // If this is the last pending log, restore status to VERIFIED
            ...(otherPendingLogs.length === 0 ? { verificationStatus: "VERIFIED" } : {})
          }
        });

        // Update log status to APPROVED
        await tx.profileUpdateLog.update({
          where: { id: logId },
          data: { status: "APPROVED" }
        });

        // Create in-app Notification for the doctor
        await tx.notification.create({
          data: {
            userId: doctor.userId,
            type: "PROFILE_UPDATED",
            title: "Profile Update Approved",
            message: `Your proposed update for field '${log.field}' has been reviewed and approved by administration.`,
            metadata: { logId, field: log.field, newValue: log.newValue }
          }
        });
      } else {
        // Update log status to REJECTED
        await tx.profileUpdateLog.update({
          where: { id: logId },
          data: { status: "REJECTED" }
        });

        // If this is the last pending log, restore status to VERIFIED
        if (otherPendingLogs.length === 0) {
          await tx.doctor.update({
            where: { id: log.doctorId },
            data: { verificationStatus: "VERIFIED" }
          });
        }

        // Create in-app Notification for the doctor
        await tx.notification.create({
          data: {
            userId: doctor.userId,
            type: "ADMIN_ALERT",
            title: "Profile Update Declined",
            message: `Your proposed update for field '${log.field}' has been reviewed and declined. Reason: ${adminNotes || "Information could not be verified."}`,
            metadata: { logId, field: log.field, reason: adminNotes }
          }
        });
      }

      // Get the admin user record for moderation audit log relation
      const adminUser = await tx.user.findFirst({
        where: { role: "ADMIN" }
      });

      if (adminUser) {
        await tx.moderationLog.create({
          data: {
            adminId: adminUser.id,
            action: `PROFILE_UPDATE_${action}`,
            targetType: "DOCTOR",
            targetId: log.doctorId,
            reason: adminNotes || `Proposed update for field '${log.field}' was ${action.toLowerCase()}d.`,
          }
        });
      }

      return { logId, action, field: log.field, newValue: log.newValue };
    });

    return NextResponse.json({
      success: true,
      message: `Profile update successfully ${action.toLowerCase()}d.`,
      data: result
    });

  } catch (error: any) {
    console.error("Approve profile update error:", error);
    const clientMessage = {
      "LOG_NOT_FOUND": "Profile update request not found.",
      "LOG_ALREADY_RESOLVED": "This profile update request has already been reviewed.",
      "UNSUPPORTED_FIELD_MUTATION": "This update action references an unsupported or illegal field."
    };
    return NextResponse.json(
      { error: clientMessage[error.message as keyof typeof clientMessage] || "Internal server error" },
      { status: 500 }
    );
  }
}
