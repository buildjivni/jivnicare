import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../database/prisma.service';

@Injectable()
export class AdminDashboardService {
  constructor(private prisma: PrismaService) {}

  async getOverview() {
    // Execute count queries concurrently for performance
    const [
      totalDoctors,
      verifiedDoctors,
      pendingDoctors,
      totalHospitals,
      verifiedHospitals,
      totalUsers,
    ] = await Promise.all([
      this.prisma.doctor.count(),
      this.prisma.doctor.count({ where: { verificationStatus: 'VERIFIED' } }),
      this.prisma.doctor.count({ where: { verificationStatus: 'PENDING' } }),
      this.prisma.hospital.count(),
      this.prisma.hospital.count({ where: { verificationStatus: 'VERIFIED' } }),
      this.prisma.user.count({ where: { role: 'USER' } }),
    ]);

    return {
      doctors: {
        total: totalDoctors,
        verified: verifiedDoctors,
        pending: pendingDoctors,
      },
      hospitals: {
        total: totalHospitals,
        verified: verifiedHospitals,
      },
      users: {
        total: totalUsers,
      },
      // Foundation for future analytics
      recentActivity: [],
    };
  }
}
