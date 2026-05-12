import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../../database/prisma.service';
import { TargetType } from '@prisma/client';

@Injectable()
export class HospitalAnalyticsService {
  private readonly logger = new Logger(HospitalAnalyticsService.name);

  constructor(private prisma: PrismaService) {}

  async logView(hospitalId: string) {
    try {
      await this.prisma.profileAnalytics.create({
        data: {
          targetType: TargetType.HOSPITAL,
          targetId: hospitalId,
          action: 'VIEW',
        },
      });
    } catch (error) {
      this.logger.error(`Failed to log hospital view: ${error.message}`);
    }
  }

  async getPopularHospitals(limit: number = 10) {
    const result = await this.prisma.profileAnalytics.groupBy({
      by: ['targetId'],
      where: { targetType: TargetType.HOSPITAL, action: 'VIEW' },
      _count: { targetId: true },
      orderBy: { _count: { targetId: 'desc' } },
      take: limit,
    });

    const hospitalIds = result.map((r: any) => r.targetId);

    // Fetch hospital details
    const hospitals = await this.prisma.hospital.findMany({
      where: { id: { in: hospitalIds } },
      select: {
        id: true,
        name: true,
        district: true,
        emergencyAvailable: true,
      },
    });

    // Map back keeping the sorted order
    return result
      .map((r: any) => {
        const hosp = hospitals.find((h: any) => h.id === r.targetId);
        return {
          hospital: hosp,
          views: r._count.targetId,
        };
      })
      .filter((r: any) => r.hospital); // Remove any deleted hospitals
  }
}
