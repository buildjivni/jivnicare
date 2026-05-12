import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { TargetType } from '@prisma/client';

@Injectable()
export class TrustService {
  constructor(private prisma: PrismaService) {}

  // ─────────────────────────────────────────
  // VERIFIED BADGE
  // ─────────────────────────────────────────
  /**
   * Returns whether a doctor is verified with a simple badge payload.
   * Frontend uses this to render the green verified checkmark.
   */
  async getDoctorBadge(doctorId: string) {
    const doctor = await this.prisma.doctor.findUnique({
      where: { id: doctorId },
      select: {
        id: true,
        name: true,
        verificationStatus: true,
        profileImage: true,
        rating: true,
      },
    });

    if (!doctor) throw new NotFoundException('Doctor not found');

    return {
      isVerified: doctor.verificationStatus === 'VERIFIED',
      verificationStatus: doctor.verificationStatus,
      doctor: {
        id: doctor.id,
        name: doctor.name,
        profileImage: doctor.profileImage,
        rating: doctor.rating,
      },
    };
  }

  /**
   * Returns whether a hospital is verified with a badge payload.
   * Also signals whether emergency priority listing applies.
   */
  async getHospitalBadge(hospitalId: string) {
    const hospital = await this.prisma.hospital.findUnique({
      where: { id: hospitalId },
      select: {
        id: true,
        name: true,
        verificationStatus: true,
        emergencyAvailable: true,
        ambulanceAvailable: true,
        rating: true,
      },
    });

    if (!hospital) throw new NotFoundException('Hospital not found');

    return {
      isVerified: hospital.verificationStatus === 'VERIFIED',
      verificationStatus: hospital.verificationStatus,
      // Emergency priority: only fully verified hospitals get the badge
      emergencyPriority: hospital.verificationStatus === 'VERIFIED' && hospital.emergencyAvailable,
      hospital: {
        id: hospital.id,
        name: hospital.name,
        emergencyAvailable: hospital.emergencyAvailable,
        ambulanceAvailable: hospital.ambulanceAvailable,
        rating: hospital.rating,
      },
    };
  }

  // ─────────────────────────────────────────
  // SUSPICIOUS ACTIVITY FLAGGING
  // ─────────────────────────────────────────
  /**
   * Flags a doctor or hospital profile as suspicious.
   * Creates a ModerationLog entry so admins can review it.
   */
  async reportEntity(
    reporterId: string,
    targetType: TargetType,
    targetId: string,
    reason: string,
  ) {
    if (!reason || reason.trim().length < 10) {
      throw new BadRequestException('Please provide a detailed reason (min 10 characters).');
    }

    // Confirm target actually exists
    if (targetType === TargetType.DOCTOR) {
      const doc = await this.prisma.doctor.findUnique({ where: { id: targetId } });
      if (!doc) throw new NotFoundException('Doctor not found');
    } else if (targetType === TargetType.HOSPITAL) {
      const hosp = await this.prisma.hospital.findUnique({ where: { id: targetId } });
      if (!hosp) throw new NotFoundException('Hospital not found');
    }

    // Prevent the same user from reporting the same entity more than once in 24 hours
    const recentReport = await this.prisma.moderationLog.findFirst({
      where: {
        adminId: reporterId,
        targetId,
        action: 'REPORTED',
        createdAt: { gte: new Date(Date.now() - 24 * 60 * 60 * 1000) },
      },
    });

    if (recentReport) {
      throw new BadRequestException('You have already reported this profile in the last 24 hours.');
    }

    // Log it as a REPORTED action — admins will see it in their queue
    await this.prisma.moderationLog.create({
      data: {
        adminId: reporterId,    // reusing adminId as "actorId" for this log
        action: 'REPORTED',
        targetType,
        targetId,
        reason: reason.trim(),
      },
    });

    return {
      message: 'Report submitted. Our team will review this profile shortly.',
    };
  }

  // ─────────────────────────────────────────
  // EMERGENCY VALIDATION
  // ─────────────────────────────────────────
  /**
   * Returns all verified emergency hospitals, sorted by rating descending.
   * Used for priority listing in the search and homepage widgets.
   */
  async getEmergencyHospitals(district?: string) {
    const where: any = {
      verificationStatus: 'VERIFIED',
      emergencyAvailable: true,
    };

    if (district) {
      where.district = { equals: district, mode: 'insensitive' };
    }

    const hospitals = await this.prisma.hospital.findMany({
      where,
      orderBy: { rating: 'desc' },
      select: {
        id: true,
        name: true,
        slug: true,
        district: true,
        address: true,
        phone: true,
        emergencyAvailable: true,
        ambulanceAvailable: true,
        rating: true,
        verificationStatus: true,
      },
    });

    return {
      count: hospitals.length,
      hospitals,
    };
  }

  // ─────────────────────────────────────────
  // ADMIN — AUDIT LOG QUERY
  // ─────────────────────────────────────────
  /**
   * Returns paginated audit/moderation logs for the admin dashboard.
   * Supports filtering by action type (VERIFIED, REJECTED, REPORTED, etc.)
   */
  async getAuditLogs(page: number = 1, limit: number = 30, action?: string) {
    const skip = (page - 1) * limit;

    const where: any = {};
    if (action) where.action = action.toUpperCase();

    const [logs, total] = await Promise.all([
      this.prisma.moderationLog.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          admin: { select: { name: true, phone: true, role: true } },
        },
      }),
      this.prisma.moderationLog.count({ where }),
    ]);

    return {
      data: logs,
      meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
    };
  }

  // ─────────────────────────────────────────
  // ADMIN — REPORTED QUEUE
  // ─────────────────────────────────────────
  /**
   * Lists all reports submitted by users, paginated, for admin review.
   */
  async getReportedQueue(page: number = 1, limit: number = 20) {
    return this.getAuditLogs(page, limit, 'REPORTED');
  }
}
