import { Controller, Post, Get, Patch, Body, Param, Query, UseGuards } from '@nestjs/common';
import { ReportsService } from './reports.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { Role, ReportStatus, TargetType } from '@prisma/client';

@Controller('reports')
@UseGuards(JwtAuthGuard, RolesGuard)
export class ReportsController {
  constructor(private readonly reportsService: ReportsService) {}

  @Post()
  @Roles(Role.USER, Role.DOCTOR, Role.ADMIN)
  async submitReport(
    @CurrentUser('id') userId: string,
    @Body() body: { targetType: TargetType; targetId: string; reason: string; description?: string },
  ) {
    return this.reportsService.createReport(userId, body);
  }

  @Get('admin')
  @Roles(Role.ADMIN)
  async getAdminReports(@Query('status') status?: ReportStatus) {
    return this.reportsService.getAdminReports(status);
  }

  @Patch('admin/:id')
  @Roles(Role.ADMIN)
  async updateReport(
    @Param('id') reportId: string,
    @CurrentUser('id') adminId: string,
    @Body() body: { status: ReportStatus; adminNotes?: string },
  ) {
    return this.reportsService.updateReportStatus(reportId, adminId, body);
  }
}
