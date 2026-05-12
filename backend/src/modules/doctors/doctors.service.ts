import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import {
  CreateDoctorDto,
  UpdateDoctorDto,
  FilterDoctorDto,
} from './dto/doctors.dto';
import { Prisma } from '@prisma/client';

@Injectable()
export class DoctorsService {
  constructor(private prisma: PrismaService) {}

  private generateSlug(name: string): string {
    return (
      name.toLowerCase().replace(/[^a-z0-9]+/g, '-') +
      '-' +
      Math.random().toString(36).substring(2, 6)
    );
  }

  private calculateProfileCompleteness(doctor: any): number {
    let score = 0;
    const totalFields = 7;
    
    if (doctor.name) score += 1;
    if (doctor.bio) score += 1;
    if (doctor.experience > 0) score += 1;
    if (doctor.fee > 0) score += 1;
    if (doctor.profileImage) score += 1;
    if (doctor.hospitalName) score += 1;
    if (doctor.specialties && doctor.specialties.length > 0) score += 1;

    return Math.round((score / totalFields) * 100);
  }

  async create(createDoctorDto: CreateDoctorDto) {
    const { userId, specialties, keywords, ...doctorData } = createDoctorDto;

    // Verify user exists and is not already a doctor
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: { doctor: true },
    });

    if (!user) throw new NotFoundException('User not found');
    if (user.doctor)
      throw new BadRequestException('User already has a doctor profile');

    // Fake Detection: Duplicate profile detection
    const existingDoctor = await this.prisma.doctor.findFirst({
      where: {
        name: { equals: doctorData.name, mode: 'insensitive' },
        district: { equals: doctorData.district, mode: 'insensitive' },
      },
    });

    if (existingDoctor) {
      // We could flag this user for manual review, but for now we reject
      throw new BadRequestException(
        'A doctor with this name already exists in this district. Please contact support.',
      );
    }

    const slug = this.generateSlug(doctorData.name);

    const newDoctor = await this.prisma.doctor.create({
      data: {
        ...doctorData,
        slug,
        user: { connect: { id: userId } },
        specialties: {
          connectOrCreate: specialties.map((sp) => ({
            where: { slug: sp.toLowerCase().replace(/[^a-z0-9]+/g, '-') },
            create: {
              name: sp,
              slug: sp.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
            },
          })),
        },
        keywords: keywords
          ? {
              connectOrCreate: keywords.map((kw) => ({
                where: { term: kw.toLowerCase() },
                create: { term: kw.toLowerCase() },
              })),
            }
          : undefined,
      },
      include: { specialties: true, keywords: true },
    });

    const completeness = this.calculateProfileCompleteness(newDoctor);
    if (completeness !== newDoctor.profileCompletionPercentage) {
      return this.prisma.doctor.update({
        where: { id: newDoctor.id },
        data: { profileCompletionPercentage: completeness },
        include: { specialties: true, keywords: true },
      });
    }

    return newDoctor;
  }

  async findAll(filterDto: FilterDoctorDto) {
    const {
      search,
      district,
      specialty,
      emergencyAvailable,
      verificationStatus,
      page = 1,
      limit = 20,
    } = filterDto;

    const where: Prisma.DoctorWhereInput = {};

    if (district) where.district = { equals: district, mode: 'insensitive' };
    if (emergencyAvailable !== undefined)
      where.emergencyAvailable = emergencyAvailable;
    if (verificationStatus !== undefined)
      where.verificationStatus = verificationStatus;

    if (specialty) {
      where.specialties = {
        some: { slug: specialty.toLowerCase() },
      };
    }

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { hospitalName: { contains: search, mode: 'insensitive' } },
        {
          keywords: {
            some: { term: { contains: search, mode: 'insensitive' } },
          },
        },
      ];
    }

    const skip = (page - 1) * limit;

    const [doctors, total] = await Promise.all([
      this.prisma.doctor.findMany({
        where,
        skip,
        take: limit,
        include: { specialties: true },
        orderBy: { rating: 'desc' }, // Higher rating first
      }),
      this.prisma.doctor.count({ where }),
    ]);

    return {
      doctors,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findOne(slug: string) {
    const doctor = await this.prisma.doctor.findUnique({
      where: { slug },
      include: { specialties: true, keywords: true },
    });

    if (!doctor)
      throw new NotFoundException(`Doctor with slug ${slug} not found`);
    return doctor;
  }

  async update(id: string, updateDoctorDto: UpdateDoctorDto) {
    const { specialties, keywords, ...updateData } = updateDoctorDto;

    const doctor = await this.prisma.doctor.findUnique({ where: { id } });
    if (!doctor) throw new NotFoundException('Doctor not found');

    const updatePayload: Prisma.DoctorUpdateInput = { ...updateData };

    if (specialties) {
      updatePayload.specialties = {
        set: [], // Clear existing
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
        set: [], // Clear existing
        connectOrCreate: keywords.map((kw) => ({
          where: { term: kw.toLowerCase() },
          create: { term: kw.toLowerCase() },
        })),
      };
    }

    const updatedDoctor = await this.prisma.doctor.update({
      where: { id },
      data: updatePayload,
      include: { specialties: true, keywords: true },
    });

    const completeness = this.calculateProfileCompleteness(updatedDoctor);
    if (completeness !== updatedDoctor.profileCompletionPercentage) {
      return this.prisma.doctor.update({
        where: { id },
        data: { profileCompletionPercentage: completeness },
        include: { specialties: true, keywords: true },
      });
    }

    return updatedDoctor;
  }

  async remove(id: string) {
    const doctor = await this.prisma.doctor.findUnique({ where: { id } });
    if (!doctor) throw new NotFoundException('Doctor not found');

    await this.prisma.doctor.delete({ where: { id } });
    return { message: 'Doctor deleted successfully' };
  }
}
