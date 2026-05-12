import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../database/prisma.service';

@Injectable()
export class AnalyticsService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Generates a lightweight operational overview for the admin dashboard.
   */
  async getOverview() {
    const [
      totalDoctors,
      verifiedDoctors,
      pendingDoctors,
      totalHospitals,
      pendingHospitals,
      totalBookings,
      activeBookings,
    ] = await Promise.all([
      this.prisma.doctor.count(),
      this.prisma.doctor.count({ where: { verificationStatus: 'VERIFIED' } }),
      this.prisma.doctor.count({ where: { verificationStatus: 'PENDING' } }),
      this.prisma.hospital.count(),
      this.prisma.hospital.count({ where: { verificationStatus: 'PENDING' } }),
      this.prisma.queueToken.count(),
      this.prisma.queueToken.count({ where: { status: { in: ['WAITING', 'IN_CONSULTATION'] } } }),
    ]);

    return {
      doctors: {
        total: totalDoctors,
        verified: verifiedDoctors,
        pending: pendingDoctors,
      },
      hospitals: {
        total: totalHospitals,
        pending: pendingHospitals,
      },
      bookings: {
        total: totalBookings,
        active: activeBookings,
      },
    };
  }
}
