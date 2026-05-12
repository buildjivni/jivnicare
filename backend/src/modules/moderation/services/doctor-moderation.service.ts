import {
  Injectable,
  NotFoundException,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { PrismaService } from '../../../database/prisma.service';
import { ModerationLogService } from './moderation-log.service';
import { VerificationStatus, TargetType } from '@prisma/client';
import { ConfigService } from '@nestjs/config';
import { NotificationEventsService } from '../../notifications/notification-events.service';

@Injectable()
export class DoctorModerationService {
  private readonly logger = new Logger(DoctorModerationService.name);

  constructor(
    private prisma: PrismaService,
    private logService: ModerationLogService,
    private configService: ConfigService,
    private notificationEvents: NotificationEventsService,
  ) {}

  async getPendingDoctors(page: number = 1, limit: number = 20) {
    const skip = (page - 1) * limit;

    const [doctors, total] = await Promise.all([
      this.prisma.doctor.findMany({
        where: { verificationStatus: 'PENDING' },
        skip,
        take: limit,
        orderBy: { createdAt: 'asc' },
        include: {
          user: { select: { phone: true, name: true } },
          specialties: true,
        },
      }),
      this.prisma.doctor.count({ where: { verificationStatus: 'PENDING' } }),
    ]);

    return {
      data: doctors,
      meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
    };
  }

  async setStatus(
    adminId: string,
    doctorId: string,
    status: VerificationStatus,
    reason?: string,
  ) {
    const doctor = await this.prisma.doctor.findUnique({
      where: { id: doctorId },
      include: { user: true },
    });
    if (!doctor) throw new NotFoundException('Doctor not found');

    if (doctor.verificationStatus === status) {
      throw new BadRequestException(`Doctor is already marked as ${status}`);
    }

    const updatedDoctor = await this.prisma.doctor.update({
      where: { id: doctorId },
      data: { verificationStatus: status },
    });

    // ── 1. In-App Notification to Doctor ─────────────────────
    this.notificationEvents
      .onDoctorVerificationStatusChanged(
        doctor.userId,
        doctor.name,
        status,
        reason,
      )
      .catch((err) =>
        this.logger.error('Failed to send doctor notification', err),
      );

    // ── 2. Live Webhook: ISR revalidation ────────────────────
    if (status === VerificationStatus.VERIFIED) {
      const frontendUrl = this.configService.get<string>('FRONTEND_URL');
      const revalidationSecret = this.configService.get<string>('REVALIDATION_SECRET');
      if (frontendUrl && revalidationSecret) {
        fetch(`${frontendUrl}/api/revalidate`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            secret: revalidationSecret,
            path: `/doctors/${updatedDoctor.slug}`,
          }),
        }).catch((err) =>
          this.logger.error(
            `ISR revalidation failed for /doctors/${updatedDoctor.slug}`,
            err,
          ),
        );
      }
    }

    // ── 3. Audit Log ─────────────────────────────────────────
    await this.logService.logAction(adminId, status, TargetType.DOCTOR, doctorId, reason);

    return {
      success: true,
      message: `Doctor ${status.toLowerCase()} successfully`,
      doctor: updatedDoctor,
    };
  }
}
