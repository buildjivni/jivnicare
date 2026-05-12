import {
  Injectable,
  NotFoundException,
  ConflictException,
  Logger,
} from '@nestjs/common';
import { PrismaService } from '../../../database/prisma.service';

@Injectable()
export class EngagementService {
  private readonly logger = new Logger(EngagementService.name);

  constructor(private readonly prisma: PrismaService) {}

  // ── Save Doctor ───────────────────────────────────────────────
  async saveDoctor(userId: string, doctorId: string) {
    // Verify doctor exists
    const doctor = await this.prisma.doctor.findUnique({ where: { id: doctorId } });
    if (!doctor) throw new NotFoundException('Doctor not found');

    try {
      await this.prisma.savedDoctor.create({ data: { userId, doctorId } });
      return { success: true, message: 'Doctor saved successfully' };
    } catch {
      // Unique constraint: already saved
      throw new ConflictException('Doctor is already saved');
    }
  }

  // ── Unsave Doctor ─────────────────────────────────────────────
  async unsaveDoctor(userId: string, doctorId: string) {
    const existing = await this.prisma.savedDoctor.findUnique({
      where: { userId_doctorId: { userId, doctorId } },
    });
    if (!existing) throw new NotFoundException('Saved doctor not found');

    await this.prisma.savedDoctor.delete({
      where: { userId_doctorId: { userId, doctorId } },
    });
    return { success: true, message: 'Doctor removed from saved list' };
  }

  // ── Get Saved Doctors ─────────────────────────────────────────
  async getSavedDoctors(userId: string, page = 1, limit = 20) {
    const skip = (page - 1) * limit;

    const [saved, total] = await Promise.all([
      this.prisma.savedDoctor.findMany({
        where: { userId },
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          doctor: {
            select: {
              id: true,
              name: true,
              slug: true,
              profileImage: true,
              district: true,
              rating: true,
              verificationStatus: true,
              specialties: { select: { name: true } },
            },
          },
        },
      }),
      this.prisma.savedDoctor.count({ where: { userId } }),
    ]);

    return {
      saved: saved.map((s) => ({
        savedId: s.id,
        savedAt: s.createdAt,
        doctor: s.doctor,
      })),
      total,
      page,
      limit,
    };
  }

  // ── Check if saved ────────────────────────────────────────────
  async isSaved(userId: string, doctorId: string): Promise<boolean> {
    const found = await this.prisma.savedDoctor.findUnique({
      where: { userId_doctorId: { userId, doctorId } },
    });
    return !!found;
  }

  // ── Activity Feed (lightweight) ───────────────────────────────
  async getActivityFeed(adminId: string, limit = 20) {
    // Admin-only: recent platform activity
    const [recentVerifications, recentSaves] = await Promise.all([
      this.prisma.moderationLog.findMany({
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          admin: { select: { name: true, phone: true } },
        },
      }),
      this.prisma.savedDoctor.findMany({
        take: 10,
        orderBy: { createdAt: 'desc' },
        include: {
          doctor: { select: { name: true, district: true } },
        },
      }),
    ]);

    return {
      recentVerifications: recentVerifications.map((v) => ({
        id: v.id,
        action: v.action,
        targetType: v.targetType,
        targetId: v.targetId,
        adminName: v.admin.name,
        createdAt: v.createdAt,
      })),
      recentSaves: recentSaves.map((s) => ({
        doctorName: s.doctor.name,
        district: s.doctor.district,
        savedAt: s.createdAt,
      })),
    };
  }
}
