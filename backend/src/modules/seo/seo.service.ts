import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';

@Injectable()
export class SeoService {
  constructor(private prisma: PrismaService) {}

  async getSitemapData() {
    const [doctors, hospitals] = await Promise.all([
      this.prisma.doctor.findMany({
        where: { verificationStatus: 'VERIFIED' },
        select: { slug: true, updatedAt: true },
      }),
      this.prisma.hospital.findMany({
        where: { verificationStatus: 'VERIFIED' },
        select: { slug: true, updatedAt: true },
      }),
    ]);

    return {
      doctors,
      hospitals,
    };
  }

  async getActiveDistricts() {
    const [doctorDistricts, hospitalDistricts] = await Promise.all([
      this.prisma.doctor.findMany({
        where: { verificationStatus: 'VERIFIED' },
        select: { district: true },
        distinct: ['district'],
      }),
      this.prisma.hospital.findMany({
        where: { verificationStatus: 'VERIFIED' },
        select: { district: true },
        distinct: ['district'],
      }),
    ]);

    const allDistricts = new Set([
      ...doctorDistricts.map((d) => d.district),
      ...hospitalDistricts.map((h) => h.district),
    ]);

    return Array.from(allDistricts);
  }
}
