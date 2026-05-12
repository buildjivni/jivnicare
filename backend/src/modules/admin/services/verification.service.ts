import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../../database/prisma.service';
import { AdminAuditService } from './admin-audit.service';
import { TargetType } from '@prisma/client';

@Injectable()
export class VerificationService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly auditService: AdminAuditService,
  ) {}

  /**
   * Retrieves all doctors pending verification, sorted by profile completeness.
   */
  async getPendingDoctors() {
    return this.prisma.doctor.findMany({
      where: {
        user: { isVerified: false }, // Using user's verified status or we can map it to a specific field. Wait, in schema, User has `isVerified`, and Doctor has `verificationStatus`.
        // Let's use Doctor's verificationStatus for better clarity
        verificationStatus: 'PENDING',
      },
      include: {
        user: { select: { name: true, phone: true } },
      },
      orderBy: {
        profileCompletionPercentage: 'desc', // Prioritize more complete profiles
      },
    });
  }

  /**
   * Retrieves all hospitals pending verification.
   */
  async getPendingHospitals() {
    return this.prisma.hospital.findMany({
      where: {
        verificationStatus: 'PENDING',
      },
      orderBy: {
        createdAt: 'asc', // Oldest first
      },
    });
  }

  /**
   * Approve or reject a doctor
   */
  async moderateDoctor(adminId: string, doctorId: string, action: 'APPROVE' | 'REJECT', reason?: string) {
    const doctor = await this.prisma.doctor.findUnique({
      where: { id: doctorId },
      include: { user: true },
    });

    if (!doctor) throw new NotFoundException('Doctor not found');

    if (doctor.verificationStatus === 'VERIFIED' && action === 'APPROVE') {
      throw new BadRequestException('Doctor is already verified');
    }

    const newStatus = action === 'APPROVE' ? 'VERIFIED' : 'REJECTED';

    const updatedDoctor = await this.prisma.$transaction(async (tx: any) => {
      // 1. Update Doctor status
      const doc = await tx.doctor.update({
        where: { id: doctorId },
        data: { verificationStatus: newStatus },
      });

      // 2. Sync User isVerified flag if approving
      if (action === 'APPROVE') {
        await tx.user.update({
          where: { id: doctor.userId },
          data: { isVerified: true },
        });
      } else if (action === 'REJECT') {
        await tx.user.update({
          where: { id: doctor.userId },
          data: { isVerified: false },
        });
      }

      // 3. Log Audit Action
      await this.auditService.logAction(adminId, action, TargetType.DOCTOR, doctorId, reason);

      // 4. Create Notification
      const title = action === 'APPROVE' ? 'Profile Verified' : 'Profile Rejected';
      const message = action === 'APPROVE' 
        ? 'Congratulations! Your doctor profile has been verified and is now live on JivniCare.'
        : `Your profile verification was rejected. Reason: ${reason || 'Please review our guidelines and update your profile.'}`;
        
      await tx.notification.create({
        data: {
          userId: doctor.userId,
          title,
          message,
          metadata: { action, entity: 'DOCTOR' },
        },
      });

      return doc;
    });

    return updatedDoctor;
  }

  /**
   * Approve or reject a hospital
   */
  async moderateHospital(adminId: string, hospitalId: string, action: 'APPROVE' | 'REJECT', reason?: string) {
    const hospital = await this.prisma.hospital.findUnique({
      where: { id: hospitalId },
    });

    if (!hospital) throw new NotFoundException('Hospital not found');

    const newStatus = action === 'APPROVE' ? 'VERIFIED' : 'REJECTED';

    const updatedHospital = await this.prisma.$transaction(async (tx: any) => {
      const hosp = await tx.hospital.update({
        where: { id: hospitalId },
        data: { verificationStatus: newStatus },
      });

      await this.auditService.logAction(adminId, action, TargetType.HOSPITAL, hospitalId, reason);

      return hosp;
    });

    return updatedHospital;
  }
}
