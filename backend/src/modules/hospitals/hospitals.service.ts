import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import {
  CreateHospitalDto,
  UpdateHospitalDto,
  FilterHospitalDto,
} from './dto/hospitals.dto';
import { Prisma } from '@prisma/client';

@Injectable()
export class HospitalsService {
  constructor(private prisma: PrismaService) {}

  private generateSlug(name: string): string {
    return (
      name.toLowerCase().replace(/[^a-z0-9]+/g, '-') +
      '-' +
      Math.random().toString(36).substring(2, 6)
    );
  }

  async create(createHospitalDto: CreateHospitalDto) {
    const { specialties, keywords, ...hospitalData } = createHospitalDto;

    // Fake Detection: Duplicate profile detection
    const existingHospital = await this.prisma.hospital.findFirst({
      where: {
        name: { equals: hospitalData.name, mode: 'insensitive' },
        district: { equals: hospitalData.district, mode: 'insensitive' },
      },
    });

    if (existingHospital) {
      throw new BadRequestException(
        'A hospital with this name already exists in this district.',
      );
    }

    const slug = this.generateSlug(hospitalData.name);

    return this.prisma.hospital.create({
      data: {
        ...hospitalData,
        slug,
        specialties: specialties
          ? {
              connectOrCreate: specialties.map((sp) => ({
                where: { slug: sp.toLowerCase().replace(/[^a-z0-9]+/g, '-') },
                create: {
                  name: sp,
                  slug: sp.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
                },
              })),
            }
          : undefined,
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
  }

  async findAll(filterDto: FilterHospitalDto) {
    const {
      search,
      district,
      hospitalType,
      specialty,
      emergencyAvailable,
      ambulanceAvailable,
      verificationStatus,
      page = 1,
      limit = 20,
    } = filterDto;

    const where: Prisma.HospitalWhereInput = {};

    if (district) where.district = { equals: district, mode: 'insensitive' };
    if (hospitalType)
      where.hospitalType = { equals: hospitalType, mode: 'insensitive' };
    if (emergencyAvailable !== undefined)
      where.emergencyAvailable = emergencyAvailable;
    if (ambulanceAvailable !== undefined)
      where.ambulanceAvailable = ambulanceAvailable;
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
        { address: { contains: search, mode: 'insensitive' } },
        {
          keywords: {
            some: { term: { contains: search, mode: 'insensitive' } },
          },
        },
      ];
    }

    const skip = (page - 1) * limit;

    const [hospitals, total] = await Promise.all([
      this.prisma.hospital.findMany({
        where,
        skip,
        take: limit,
        include: { specialties: true },
        orderBy: { rating: 'desc' }, // Higher rating first
      }),
      this.prisma.hospital.count({ where }),
    ]);

    return {
      hospitals,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findOne(slug: string) {
    const hospital = await this.prisma.hospital.findUnique({
      where: { slug },
      include: { specialties: true, keywords: true },
    });

    if (!hospital)
      throw new NotFoundException(`Hospital with slug ${slug} not found`);
    return hospital;
  }

  async update(id: string, updateHospitalDto: UpdateHospitalDto) {
    const { specialties, keywords, ...updateData } = updateHospitalDto;

    const hospital = await this.prisma.hospital.findUnique({ where: { id } });
    if (!hospital) throw new NotFoundException('Hospital not found');

    const updatePayload: Prisma.HospitalUpdateInput = { ...updateData };

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

    return this.prisma.hospital.update({
      where: { id },
      data: updatePayload,
      include: { specialties: true, keywords: true },
    });
  }

  async remove(id: string) {
    const hospital = await this.prisma.hospital.findUnique({ where: { id } });
    if (!hospital) throw new NotFoundException('Hospital not found');

    await this.prisma.hospital.delete({ where: { id } });
    return { message: 'Hospital deleted successfully' };
  }
}
