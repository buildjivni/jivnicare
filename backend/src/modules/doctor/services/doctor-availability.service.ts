import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../../database/prisma.service';
import { UpdateAvailabilityDto, TimeSlotDto } from '../dto/update-availability.dto';
import { UpdateBookingSettingsDto } from '../dto/update-booking-settings.dto';
import { DoctorProfileService } from './doctor-profile.service';

@Injectable()
export class DoctorAvailabilityService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly profileService: DoctorProfileService
  ) {}

  async updateAvailability(userId: string, dto: UpdateAvailabilityDto) {
    const doctor = await this.prisma.doctor.findUnique({ where: { userId } });
    if (!doctor) throw new NotFoundException('Doctor profile not found');

    if (dto.availableTimeSlots) {
      this.validateTimeSlots(dto.availableTimeSlots);
    }

    const updatedDoctor = await this.prisma.doctor.update({
      where: { id: doctor.id },
      data: {
        ...(dto.availableDays && { availableDays: dto.availableDays }),
        ...(dto.availableTimeSlots && { availableTimeSlots: dto.availableTimeSlots as any }),
        ...(dto.maxAppointmentsPerDay !== undefined && { maxAppointmentsPerDay: dto.maxAppointmentsPerDay }),
      },
    });

    // Recalculate profile completion
    const score = this.profileService.calculateProfileCompletion(updatedDoctor);
    return this.prisma.doctor.update({
      where: { id: doctor.id },
      data: { profileCompletionPercentage: score },
    });
  }

  async updateBookingSettings(userId: string, dto: UpdateBookingSettingsDto) {
    const doctor = await this.prisma.doctor.findUnique({ where: { userId } });
    if (!doctor) throw new NotFoundException('Doctor profile not found');

    return this.prisma.doctor.update({
      where: { id: doctor.id },
      data: dto,
    });
  }

  private validateTimeSlots(slots: TimeSlotDto[]) {
    // Basic validation: start should be before end
    for (const slot of slots) {
      const [startHour, startMin] = slot.start.split(':').map(Number);
      const [endHour, endMin] = slot.end.split(':').map(Number);

      const startTotal = startHour * 60 + startMin;
      const endTotal = endHour * 60 + endMin;

      if (startTotal >= endTotal) {
        throw new BadRequestException(`Invalid time slot: ${slot.start} to ${slot.end}. Start time must be before end time.`);
      }
    }

    // Sort slots by start time
    const sortedSlots = [...slots].sort((a, b) => {
      const aStart = parseInt(a.start.replace(':', ''), 10);
      const bStart = parseInt(b.start.replace(':', ''), 10);
      return aStart - bStart;
    });

    // Check for overlaps
    for (let i = 0; i < sortedSlots.length - 1; i++) {
      const current = sortedSlots[i];
      const next = sortedSlots[i + 1];

      const currentEnd = parseInt(current.end.replace(':', ''), 10);
      const nextStart = parseInt(next.start.replace(':', ''), 10);

      if (currentEnd > nextStart) {
        throw new BadRequestException('Time slots cannot overlap');
      }
    }
  }
}
