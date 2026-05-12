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

@Injectable()
export class HospitalModerationService {
  private readonly logger = new Logger(HospitalModerationService.name);

  constructor(
    private prisma: PrismaService,
    private logService: ModerationLogService,
    private configService: ConfigService,
  ) {}

  async getPendingHospitals(page: number = 1, limit: number = 20) {
    const skip = (page - 1) * limit;

    const [hospitals, total] = await Promise.all([
      this.prisma.hospital.findMany({
        where: { verificationStatus: 'PENDING' },
        skip,
        take: limit,
        orderBy: { createdAt: 'asc' },
        include: {
          specialties: true,
        },
      }),
      this.prisma.hospital.count({ where: { verificationStatus: 'PENDING' } }),
    ]);

    return {
      data: hospitals,
      meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
    };
  }

  async setStatus(
    adminId: string,
    hospitalId: string,
    status: VerificationStatus,
    reason?: string,
  ) {
    const hospital = await this.prisma.hospital.findUnique({
      where: { id: hospitalId },
    });
    if (!hospital) throw new NotFoundException('Hospital not found');

    if (hospital.verificationStatus === status) {
      throw new BadRequestException(`Hospital is already marked as ${status}`);
    }

    const updatedHospital = await this.prisma.hospital.update({
      where: { id: hospitalId },
      data: { verificationStatus: status },
    });

    // Live Webhook: trigger Next.js ISR revalidation
    if (status === VerificationStatus.VERIFIED) {
      const frontendUrl = this.configService.get<string>('FRONTEND_URL');
      const revalidationSecret = this.configService.get<string>('REVALIDATION_SECRET');
      if (frontendUrl && revalidationSecret) {
        fetch(`${frontendUrl}/api/revalidate`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            secret: revalidationSecret,
            path: `/hospitals/${updatedHospital.slug}`,
          }),
        }).catch((err) =>
          this.logger.error(`ISR revalidation failed for /hospitals/${updatedHospital.slug}`, err),
        );
      }
    }

    await this.logService.logAction(
      adminId,
      status,
      TargetType.HOSPITAL,
      hospitalId,
      reason,
    );

    return {
      success: true,
      message: `Hospital ${status.toLowerCase()} successfully`,
      hospital: updatedHospital,
    };
  }
}
