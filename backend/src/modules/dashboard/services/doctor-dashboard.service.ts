import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../../database/prisma.service';
import {
  UpdateDoctorProfileDto,
  UpdateDoctorSettingsDto,
} from '../dto/dashboard.dto';

@Injectable()
export class DoctorDashboardService {
  constructor(private prisma: PrismaService) {}

  async getProfile(userId: string) {
    const doctor = await this.prisma.doctor.findUnique({
      where: { userId },
      include: {
        specialties: true,
        keywords: true,
        user: {
          select: { phone: true, isVerified: true },
        },
      },
    });

    if (!doctor) throw new NotFoundException('Doctor profile not found');

    return {
      profile: doctor,
      verificationStatus: doctor.verificationStatus,
    };
  }

  async updateProfile(userId: string, updateDto: UpdateDoctorProfileDto) {
    const { specialties, keywords, ...doctorData } = updateDto;

    const doctor = await this.prisma.doctor.findUnique({ where: { userId } });
    if (!doctor) throw new NotFoundException('Doctor profile not found');

    const updatePayload: any = { ...doctorData };

    if (specialties) {
      updatePayload.specialties = {
        set: [], // Strict overwrite
        connectOrCreate: specialties.map((sp) => ({
          where: { slug: sp.toLowerCase().replace(/[^a-z0-9]+/g, '-') },
          create: {
            name: sp,
            slug: sp.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
          },
        })),
      };
    }

    if (keywords) {
      updatePayload.keywords = {
        set: [], // Strict overwrite
        connectOrCreate: keywords.map((kw) => ({
          where: { term: kw.toLowerCase() },
          create: { term: kw.toLowerCase() },
        })),
      };
    }

    const updatedDoctor = await this.prisma.doctor.update({
      where: { userId },
      data: updatePayload,
      include: { specialties: true, keywords: true },
    });

    // If name was updated, optionally sync with User table
    if (doctorData.name) {
      await this.prisma.user.update({
        where: { id: userId },
        data: { name: doctorData.name },
      });
    }

    return {
      message: 'Doctor profile updated successfully',
      doctor: updatedDoctor,
    };
  }

  async updateSettings(userId: string, settingsDto: UpdateDoctorSettingsDto) {
    const doctor = await this.prisma.doctor.update({
      where: { userId },
      data: settingsDto,
      select: { emergencyAvailable: true },
    });

    return {
      message: 'Settings updated successfully',
      settings: doctor,
    };
  }
}
