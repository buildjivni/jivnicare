import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { ReportStatus, TargetType } from '@prisma/client';

@Injectable()
export class ReportsService {
  constructor(private prisma: PrismaService) {}

  async createReport(reporterId: string, data: { targetType: TargetType; targetId: string; reason: string; description?: string }) {
    return this.prisma.report.create({
      data: {
        reporterId,
        targetType: data.targetType,
        targetId: data.targetId,
        reason: data.reason,
        description: data.description,
      },
    });
  }

  async getAdminReports(status?: ReportStatus) {
    return this.prisma.report.findMany({
      where: status ? { status } : undefined,
      orderBy: { createdAt: 'desc' },
      include: {
        reporter: { select: { id: true, name: true, phone: true } },
      },
    });
  }

  async updateReportStatus(reportId: string, adminId: string, data: { status: ReportStatus; adminNotes?: string }) {
    const report = await this.prisma.report.findUnique({ where: { id: reportId } });
    if (!report) throw new NotFoundException('Report not found');

    const updated = await this.prisma.report.update({
      where: { id: reportId },
      data: {
        status: data.status,
        adminNotes: data.adminNotes,
      },
    });

    // Log the moderation action
    await this.prisma.moderationLog.create({
      data: {
        adminId,
        action: `REPORT_${data.status}`,
        targetType: report.targetType,
        targetId: report.targetId,
        reason: data.adminNotes || `Report ${reportId} marked as ${data.status}`,
      },
    });

    return updated;
  }
}
