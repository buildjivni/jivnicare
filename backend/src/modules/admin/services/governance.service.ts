import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../../database/prisma.service';
import { AdminAuditService } from './admin-audit.service';
import { TargetType } from '@prisma/client';

@Injectable()
export class GovernanceService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly auditService: AdminAuditService,
  ) {}

  /**
   * Suspend a verified doctor.
   * This immediately stops them from accepting new bookings and drops them in search.
   */
  async suspendDoctor(adminId: string, doctorId: string, reason?: string) {
    const doctor = await this.prisma.doctor.findUnique({
      where: { id: doctorId },
      include: { user: true },
    });

    if (!doctor) throw new NotFoundException('Doctor not found');

    const updatedDoctor = await this.prisma.$transaction(async (tx: any) => {
      // 1. Mark as SUSPENDED and forcefully disable appointments
      const doc = await tx.doctor.update({
        where: { id: doctorId },
        data: { 
          verificationStatus: 'SUSPENDED',
          isAcceptingAppointments: false,
        },
      });

      // 2. Suspend User's verification level
      await tx.user.update({
        where: { id: doctor.userId },
        data: { isVerified: false },
      });

      // 3. Log Audit Action
      await this.auditService.logAction(adminId, 'SUSPEND', TargetType.DOCTOR, doctorId, reason);

      // 4. Create Notification
      await tx.notification.create({
        data: {
          userId: doctor.userId,
          title: 'Account Suspended',
          message: `Your doctor profile has been suspended by an administrator. Reason: ${reason || 'Violation of platform policies.'}`,
          metadata: { action: 'SUSPEND', entity: 'DOCTOR' },
        },
      });

      return doc;
    });

    return updatedDoctor;
  }

  /**
   * Suspend a verified hospital.
   */
  async suspendHospital(adminId: string, hospitalId: string, reason?: string) {
    const hospital = await this.prisma.hospital.findUnique({
      where: { id: hospitalId },
    });

    if (!hospital) throw new NotFoundException('Hospital not found');

    const updatedHospital = await this.prisma.$transaction(async (tx: any) => {
      const hosp = await tx.hospital.update({
        where: { id: hospitalId },
        data: { verificationStatus: 'SUSPENDED' },
      });

      await this.auditService.logAction(adminId, 'SUSPEND', TargetType.HOSPITAL, hospitalId, reason);

      return hosp;
    });

    return updatedHospital;
  }
}
