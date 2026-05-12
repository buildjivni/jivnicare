import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../../database/prisma.service';

@Injectable()
export class DoctorDashboardService {
  constructor(private readonly prisma: PrismaService) {}

  async getDashboardStats(userId: string) {
    const doctor = await this.prisma.doctor.findUnique({
      where: { userId },
    });

    if (!doctor) throw new NotFoundException('Doctor profile not found');

    // Get today's start and end date for IST
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const [todayAppointments, pendingBookings, completedAppointments] = await Promise.all([
      // Appointments scheduled for today
      this.prisma.queueToken.count({
        where: {
          queue: { doctorId: doctor.id, date: { gte: today, lt: tomorrow } },
          status: { in: ['WAITING', 'IN_CONSULTATION', 'COMPLETED'] },
        },
      }),
      // Pending bookings overall
      this.prisma.queueToken.count({
        where: {
          queue: { doctorId: doctor.id },
          status: 'WAITING',
        },
      }),
      // Completed overall
      this.prisma.queueToken.count({
        where: {
          queue: { doctorId: doctor.id },
          status: 'COMPLETED',
        },
      })
    ]);

    return {
      profileCompletionPercentage: doctor.profileCompletionPercentage,
      verificationStatus: doctor.verificationStatus,
      isAcceptingAppointments: doctor.isAcceptingAppointments,
      emergencyAvailable: doctor.emergencyAvailable,
      stats: {
        todayAppointments,
        pendingBookings,
        completedAppointments,
        maxAppointmentsPerDay: doctor.maxAppointmentsPerDay,
      }
    };
  }
}
