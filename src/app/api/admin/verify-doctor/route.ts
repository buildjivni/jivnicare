import { NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import prisma from '@/lib/db/prisma';
import { verifyToken } from '@/lib/jwt';
import { cookies } from 'next/headers';
import { verifyDoctorSchema, formatZodError } from '@/lib/validators/validations';
import { generateSequentialDoctorCode } from '@/lib/utils/slug';

export async function POST(request: Request) {
  try {
    // 1. Authenticate Admin
    const cookieStore = await cookies();
    const token = cookieStore.get('auth-token')?.value;

    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const decoded = await verifyToken(token) as { role: string } | null;
    if (!decoded) {
      return NextResponse.json({ error: 'Invalid or expired session' }, { status: 401 });
    }

    if (decoded.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Access denied. Admins only.' }, { status: 403 });
    }

    // 2. Parse Payload
    const body = await request.json();
    
    // Strict Payload Validation
    const validation = verifyDoctorSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        { error: 'Invalid payload: ' + formatZodError(validation.error) },
        { status: 400 }
      );
    }

    const { doctorId, status, adminNotes } = validation.data;

    const doctor = await prisma.doctor.findUnique({ where: { id: doctorId } });
    if (!doctor) {
      return NextResponse.json({ error: 'Doctor not found.' }, { status: 404 });
    }

    // 4. Update Doctor Status atomically
    const result = await prisma.$transaction(async (tx) => {
      // Allocate code atomically on verification if missing
      let doctorCode = doctor.doctorCode;
      if (status === 'VERIFIED' && !doctorCode) {
        doctorCode = await generateSequentialDoctorCode(tx);
      }

      const updatedDoctor = await tx.doctor.update({
        where: { id: doctorId },
        data: {
          verificationStatus: status as any,
          doctorCode,
        }
      });

      // Send the appropriate notification depending on the new status
      let notificationType: any = "ADMIN_ALERT";
      let title = "Verification Update";
      let message = "Your clinical verification request has been updated.";

      if (status === "VERIFIED") {
        notificationType = "VERIFICATION_APPROVED";
        title = "Account Verified Successfully";
        message = "Congratulations! Your professional doctor profile has been successfully verified by our clinical audit team.";
      } else if (status === "REJECTED") {
        notificationType = "VERIFICATION_REJECTED";
        title = "Profile Verification Declined";
        message = `Your registration request has been declined. Reason: ${adminNotes || "Information could not be verified."}`;
      } else if (status === "SUSPENDED") {
        notificationType = "VERIFICATION_SUSPENDED";
        title = "Account Temporarily Suspended";
        message = `Your professional doctor account has been suspended. Reason: ${adminNotes || "Under administrative review."}`;
      }

      await tx.notification.create({
        data: {
          userId: doctor.userId,
          type: notificationType,
          title,
          message,
          metadata: { doctorId, status, adminNotes }
        }
      });

      // Write immutable audit log entry
      const adminUser = await tx.user.findFirst({ where: { role: 'ADMIN' } });
      if (adminUser) {
        await tx.moderationLog.create({
          data: {
            adminId: adminUser.id,
            action: `VERIFICATION_${status}`,
            targetType: 'DOCTOR',
            targetId: doctorId,
            reason: adminNotes || null,
          }
        });
      }

      return { status, doctorCode };
    });

    if (doctor.slug) {
      revalidatePath(`/doctors/${doctor.slug}`);
    }
    revalidatePath('/doctors');

    return NextResponse.json({
      success: true,
      message: `Doctor successfully updated to ${status}.`,
      doctor: { id: doctorId, status: result.status, doctorCode: result.doctorCode },
      auditLogged: true,
    });

  } catch (error: any) {
    console.error('Admin Doctor Verification Error:', error);
    return NextResponse.json({ error: 'Internal server error.' }, { status: 500 });
  }
}
