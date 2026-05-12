import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../../database/prisma.service';
import { UpdateDoctorProfileDto } from '../dto/update-profile.dto';

@Injectable()
export class DoctorProfileService {
  constructor(private readonly prisma: PrismaService) {}

  async getProfileByUserId(userId: string) {
    const doctor = await this.prisma.doctor.findUnique({
      where: { userId },
      include: { specialties: true },
    });

    if (!doctor) {
      throw new NotFoundException('Doctor profile not found');
    }

    return doctor;
  }

  async updateProfile(userId: string, dto: UpdateDoctorProfileDto) {
    const doctor = await this.prisma.doctor.findUnique({
      where: { userId },
      include: { specialties: true },
    });

    if (!doctor) {
      throw new NotFoundException('Doctor profile not found');
    }

    const { specialties, ...rest } = dto;
    const updateData: any = { ...rest };

    if (specialties) {
      updateData.specialties = {
        set: [], // clear existing
        connectOrCreate: specialties.map(s => ({
          where: { name: s },
          create: { name: s, slug: s.toLowerCase().replace(/[^a-z0-9]+/g, '-') },
        })),
      };
    }

    // Apply updates and fetch updated record to calculate completion
    const updatedDoctor = await this.prisma.doctor.update({
      where: { id: doctor.id },
      data: updateData,
      include: { specialties: true },
    });

    // Calculate profile completion
    const completionPercentage = this.calculateProfileCompletion(updatedDoctor);

    // Update the completion percentage
    return this.prisma.doctor.update({
      where: { id: doctor.id },
      data: { profileCompletionPercentage: completionPercentage },
      include: { specialties: true },
    });
  }

  calculateProfileCompletion(doctor: any): number {
    let score = 0;
    let totalFields = 8; // Bio, Experience, Fee, District, Hospital, Image, Specialties, Availability

    if (doctor.bio && doctor.bio.trim().length > 0) score++;
    if (doctor.experience !== undefined && doctor.experience > 0) score++;
    if (doctor.fee !== undefined && doctor.fee > 0) score++;
    if (doctor.district && doctor.district.trim().length > 0) score++;
    if (doctor.hospitalName && doctor.hospitalName.trim().length > 0) score++;
    if (doctor.profileImage && doctor.profileImage.trim().length > 0) score++;
    if (doctor.specialties && doctor.specialties.length > 0) score++;
    if (doctor.availableDays && doctor.availableDays.length > 0 && doctor.availableTimeSlots) score++;

    return Math.round((score / totalFields) * 100);
  }
}
