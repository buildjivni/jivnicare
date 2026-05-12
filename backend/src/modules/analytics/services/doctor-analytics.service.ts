import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../../database/prisma.service';
import { TargetType } from '@prisma/client';

@Injectable()
export class DoctorAnalyticsService {
  private readonly logger = new Logger(DoctorAnalyticsService.name);

  constructor(private prisma: PrismaService) {}

  async logView(doctorId: string) {
    try {
      await this.prisma.profileAnalytics.create({
        data: {
          targetType: TargetType.DOCTOR,
          targetId: doctorId,
          action: 'VIEW',
        },
      });
    } catch (error) {
      this.logger.error(`Failed to log doctor view: ${error.message}`);
    }
  }

  async getPopularDoctors(limit: number = 10) {
    const result = await this.prisma.profileAnalytics.groupBy({
      by: ['targetId'],
      where: { targetType: TargetType.DOCTOR, action: 'VIEW' },
      _count: { targetId: true },
      orderBy: { _count: { targetId: 'desc' } },
      take: limit,
    });

    const doctorIds = result.map((r: any) => r.targetId);

    // Fetch doctor details
    const doctors = await this.prisma.doctor.findMany({
      where: { id: { in: doctorIds } },
      select: {
        id: true,
        name: true,
        district: true,
        specialties: { select: { name: true } },
      },
    });

    // Map back keeping the sorted order
    return result
      .map((r: any) => {
        const doc = doctors.find((d: any) => d.id === r.targetId);
        return {
          doctor: doc,
          views: r._count.targetId,
        };
      })
      .filter((r: any) => r.doctor); // Remove any deleted doctors
  }
}
