import { apiResponse, apiError } from '@/lib/utils/api-response';
import { NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import prisma from '@/lib/db/prisma';
import { verifyToken } from '@/lib/jwt';
import { cookies } from 'next/headers';
import { verifyDoctorSchema, formatZodError } from '@/lib/validators/validations';
import { generateSequentialDoctorCode } from '@/lib/utils/slug';
import { AuditAction } from '@prisma/client';

export async function POST(request: Request) {
  try {
    // 1. Authenticate Admin
    const cookieStore = await cookies();
    const token = cookieStore.get('jivnicare_token')?.value;

    if (!token) {
      return apiError('Unauthorized', 401);
    }

    const decoded = await verifyToken(token) as { role: string } | null;
    if (!decoded) {
      return apiError('Invalid or expired session', 401);
    }

    if (decoded.role !== 'ADMIN') {
      return apiError('Access denied. Admins only.', 403);
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
      return apiError('Doctor not found.', 404);
    }

    // 4. Update Doctor Status atomically
    const result = await prisma.$transaction(async (tx) => {
      // Allocate code atomically on verification if missing
      let doctorCode = doctor.internalDoctorId;
      if (status === 'VERIFIED' && (!doctorCode || doctorCode === "Pending")) {
        doctorCode = await generateSequentialDoctorCode(tx);
      }

      await tx.doctor.update({
        where: { id: doctorId },
        data: {
          verificationStatus: status as any,
          internalDoctorId: doctorCode,
          verificationNote: adminNotes || null,
          canShowOnPublic: status === 'VERIFIED', // Safeguard: only show on public search if verified
        }
      });

      // Send the appropriate notification depending on the new status
      let title = "Verification Update";
      let message = "Your clinical verification request has been updated.";

      if (status === "VERIFIED") {
        title = "Account Verified Successfully";
        message = "Congratulations! Your professional doctor profile has been successfully verified by our clinical audit team.";
      } else if (status === "REJECTED") {
        title = "Profile Verification Declined";
        message = `Your registration request has been declined. Reason: ${adminNotes || "Information could not be verified."}`;
      } else if (status === "SUSPENDED") {
        title = "Account Temporarily Suspended";
        message = `Your professional doctor account has been suspended. Reason: ${adminNotes || "Under administrative review."}`;
      }

      await tx.notification.create({
        data: {
          userId: doctor.userId,
          type: "VERIFICATION_STATUS",
          title,
          message,
        }
      });

      // Write immutable audit log entry
      const adminUser = await tx.user.findFirst({ where: { role: 'ADMIN' } });
      if (adminUser) {
        await tx.auditLog.create({
          data: {
            userId: adminUser.id,
            role: 'ADMIN',
            action: (status === 'VERIFIED' ? AuditAction.VERIFY : AuditAction.REJECT),
            entityType: 'Doctor',
            entityId: doctorId,
            newValue: JSON.stringify({ status, adminNotes })
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
      message: `Doctor verification status updated to ${status}.`,
      data: result
    });

  } catch (error: any) {
    console.error('Verify Doctor Error:', error);
    return apiError('Internal server error.', 500);
  }
}
