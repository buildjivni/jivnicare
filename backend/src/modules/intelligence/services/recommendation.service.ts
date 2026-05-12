import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../database/prisma.service';

@Injectable()
export class RecommendationService {
  constructor(private readonly prisma: PrismaService) {}

  // ── Top doctors in a district or specialty ────────────────────
  async getTopDoctors(opts: {
    district?: string;
    specialty?: string;
    limit?: number;
  }) {
    const { district, specialty, limit = 6 } = opts;

    const where: any = { verificationStatus: 'VERIFIED' };
    if (district) where.district = { equals: district, mode: 'insensitive' };
    if (specialty) where.specialties = { some: { slug: specialty.toLowerCase() } };

    const doctors = await this.prisma.doctor.findMany({
      where,
      orderBy: [{ rating: 'desc' }, { experience: 'desc' }],
      take: limit,
      select: {
        id: true,
        name: true,
        slug: true,
        profileImage: true,
        district: true,
        rating: true,
        experience: true,
        fee: true,
        emergencyAvailable: true,
        verificationStatus: true,
        specialties: { select: { name: true, slug: true } },
      },
    });

    return { doctors, count: doctors.length };
  }

  // ── Emergency doctors (24x7 first) ───────────────────────────
  async getEmergencyProviders(district?: string, limit = 10) {
    const where: any = {
      verificationStatus: 'VERIFIED',
      emergencyAvailable: true,
    };
    if (district) where.district = { equals: district, mode: 'insensitive' };

    const [hospitals, doctors] = await Promise.all([
      this.prisma.hospital.findMany({
        where: { verificationStatus: 'VERIFIED', emergencyAvailable: true, ...(district ? { district: { equals: district, mode: 'insensitive' } } : {}) },
        orderBy: { rating: 'desc' },
        take: limit,
        select: { id: true, name: true, slug: true, district: true, phone: true, rating: true, address: true, ambulanceAvailable: true },
      }),
      this.prisma.doctor.findMany({
        where,
        orderBy: { rating: 'desc' },
        take: Math.ceil(limit / 2),
        select: {
          id: true, name: true, slug: true, district: true, rating: true,
          specialties: { select: { name: true } },
        },
      }),
    ]);

    return { hospitals, doctors };
  }

  // ── "Doctors like this" — related doctor recommendations ─────
  async getRelatedDoctors(doctorId: string, limit = 4) {
    const doctor = await this.prisma.doctor.findUnique({
      where: { id: doctorId },
      include: { specialties: true },
    });
    if (!doctor) return { doctors: [] };

    const specialtySlugs = doctor.specialties.map(s => s.slug);

    const related = await this.prisma.doctor.findMany({
      where: {
        id: { not: doctorId },
        verificationStatus: 'VERIFIED',
        district: doctor.district,
        specialties: { some: { slug: { in: specialtySlugs } } },
      },
      orderBy: { rating: 'desc' },
      take: limit,
      select: {
        id: true, name: true, slug: true, profileImage: true,
        district: true, rating: true, fee: true,
        specialties: { select: { name: true } },
      },
    });

    return { doctors: related };
  }

  // ── District-based healthcare overview ────────────────────────
  async getDistrictHealthcareOverview(district: string) {
    const [totalDoctors, totalHospitals, emergencyHospitals, specialties] = await Promise.all([
      this.prisma.doctor.count({
        where: { verificationStatus: 'VERIFIED', district: { equals: district, mode: 'insensitive' } },
      }),
      this.prisma.hospital.count({
        where: { verificationStatus: 'VERIFIED', district: { equals: district, mode: 'insensitive' } },
      }),
      this.prisma.hospital.count({
        where: { verificationStatus: 'VERIFIED', emergencyAvailable: true, district: { equals: district, mode: 'insensitive' } },
      }),
      this.prisma.specialty.findMany({
        where: {
          doctors: { some: { verificationStatus: 'VERIFIED', district: { equals: district, mode: 'insensitive' } } },
        },
        take: 10,
        select: { name: true, slug: true },
      }),
    ]);

    return {
      district,
      totalDoctors,
      totalHospitals,
      emergencyHospitals,
      topSpecialties: specialties,
    };
  }
}
