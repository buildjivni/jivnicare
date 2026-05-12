import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../../database/prisma.service';
import { NotificationType, Prisma } from '@prisma/client';
import { CreateNotificationDto } from '../dto/notifications.dto';

@Injectable()
export class NotificationService {
  private readonly logger = new Logger(NotificationService.name);

  constructor(private readonly prisma: PrismaService) {}

  // ── Create ────────────────────────────────────────────────────
  async create(dto: CreateNotificationDto) {
    return this.prisma.notification.create({
      data: {
        userId: dto.userId,
        type: dto.type,
        title: dto.title,
        message: dto.message,
        metadata: (dto.metadata ?? {}) as Prisma.InputJsonValue,
      },
    });
  }

  // ── Bulk create (fire-and-forget) ─────────────────────────────
  async createMany(dtos: CreateNotificationDto[]) {
    if (!dtos.length) return;
    try {
      await this.prisma.notification.createMany({
        data: dtos.map((d) => ({
          userId: d.userId,
          type: d.type,
          title: d.title,
          message: d.message,
          metadata: (d.metadata ?? {}) as Prisma.InputJsonValue,
        })),
      });
    } catch (err) {
      this.logger.error('Bulk notification creation failed', err);
    }
  }

  // ── Get for user (paginated) ──────────────────────────────────
  async getForUser(
    userId: string,
    opts: { unreadOnly?: boolean; page?: number; limit?: number },
  ) {
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

  // ── Unread count only (for header badge) ──────────────────────
  async getUnreadCount(userId: string): Promise<number> {
    return this.prisma.notification.count({ where: { userId, isRead: false } });
  }

  // ── Mark read (single / batch / all) ─────────────────────────
  async markRead(userId: string, ids?: string[]) {
    const now = new Date();
    if (ids && ids.length > 0) {
      await this.prisma.notification.updateMany({
        where: { id: { in: ids }, userId },
        data: { isRead: true, readAt: now },
      });
    } else {
      // Mark ALL unread as read
      await this.prisma.notification.updateMany({
        where: { userId, isRead: false },
        data: { isRead: true, readAt: now },
      });
    }
    return { success: true };
  }

  // ── Delete older than 30 days (maintenance) ───────────────────
  async cleanupOld() {
    const threshold = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const { count } = await this.prisma.notification.deleteMany({
      where: { createdAt: { lt: threshold }, isRead: true },
    });
    this.logger.log(`Cleaned up ${count} old notifications`);
    return count;
  }

  // ── Notification preferences ──────────────────────────────────
  async getPreferences(userId: string) {
    return this.prisma.notificationPreference.upsert({
      where: { userId },
      create: { userId },
      update: {},
    });
  }

  async updatePreferences(
    userId: string,
    data: Partial<{
      smsEnabled: boolean;
      emailEnabled: boolean;
      pushEnabled: boolean;
      whatsappEnabled: boolean;
    }>,
  ) {
    return this.prisma.notificationPreference.upsert({
      where: { userId },
      create: { userId, ...data },
      update: data,
    });
  }
}
