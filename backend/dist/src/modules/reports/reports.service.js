"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ReportsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../database/prisma.service");
let ReportsService = class ReportsService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async createReport(reporterId, data) {
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
    async getAdminReports(status) {
        return this.prisma.report.findMany({
            where: status ? { status } : undefined,
            orderBy: { createdAt: 'desc' },
            include: {
                reporter: { select: { id: true, name: true, phone: true } },
            },
        });
    }
    async updateReportStatus(reportId, adminId, data) {
        const report = await this.prisma.report.findUnique({ where: { id: reportId } });
        if (!report)
            throw new common_1.NotFoundException('Report not found');
        const updated = await this.prisma.report.update({
            where: { id: reportId },
            data: {
                status: data.status,
                adminNotes: data.adminNotes,
            },
        });
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
};
exports.ReportsService = ReportsService;
exports.ReportsService = ReportsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], ReportsService);
//# sourceMappingURL=reports.service.js.map