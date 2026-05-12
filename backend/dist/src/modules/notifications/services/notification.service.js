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
var NotificationService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.NotificationService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../../database/prisma.service");
let NotificationService = NotificationService_1 = class NotificationService {
    prisma;
    logger = new common_1.Logger(NotificationService_1.name);
    constructor(prisma) {
        this.prisma = prisma;
    }
    async create(dto) {
        return this.prisma.notification.create({
            data: {
                userId: dto.userId,
                type: dto.type,
                title: dto.title,
                message: dto.message,
                metadata: (dto.metadata ?? {}),
            },
        });
    }
    async createMany(dtos) {
        if (!dtos.length)
            return;
        try {
            await this.prisma.notification.createMany({
                data: dtos.map((d) => ({
                    userId: d.userId,
                    type: d.type,
                    title: d.title,
                    message: d.message,
                    metadata: (d.metadata ?? {}),
                })),
            });
        }
        catch (err) {
            this.logger.error('Bulk notification creation failed', err);
        }
    }
    async getForUser(userId, opts) {
        const { unreadOnly = false, page = 1, limit = 20 } = opts;
        const skip = (page - 1) * limit;
        const [notifications, total, unreadCount] = await Promise.all([
            this.prisma.notification.findMany({
                where: {
                    userId,
                    ...(unreadOnly ? { isRead: false } : {}),
                },
                orderBy: { createdAt: 'desc' },
                skip,
                take: limit,
            }),
            this.prisma.notification.count({ where: { userId } }),
            this.prisma.notification.count({ where: { userId, isRead: false } }),
        ]);
        return { notifications, total, unreadCount, page, limit };
    }
    async getUnreadCount(userId) {
        return this.prisma.notification.count({ where: { userId, isRead: false } });
    }
    async markRead(userId, ids) {
        const now = new Date();
        if (ids && ids.length > 0) {
            await this.prisma.notification.updateMany({
                where: { id: { in: ids }, userId },
                data: { isRead: true, readAt: now },
            });
        }
        else {
            await this.prisma.notification.updateMany({
                where: { userId, isRead: false },
                data: { isRead: true, readAt: now },
            });
        }
        return { success: true };
    }
    async cleanupOld() {
        const threshold = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
        const { count } = await this.prisma.notification.deleteMany({
            where: { createdAt: { lt: threshold }, isRead: true },
        });
        this.logger.log(`Cleaned up ${count} old notifications`);
        return count;
    }
    async getPreferences(userId) {
        return this.prisma.notificationPreference.upsert({
            where: { userId },
            create: { userId },
            update: {},
        });
    }
    async updatePreferences(userId, data) {
        return this.prisma.notificationPreference.upsert({
            where: { userId },
            create: { userId, ...data },
            update: data,
        });
    }
};
exports.NotificationService = NotificationService;
exports.NotificationService = NotificationService = NotificationService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], NotificationService);
//# sourceMappingURL=notification.service.js.map