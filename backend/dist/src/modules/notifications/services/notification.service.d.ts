import { PrismaService } from '../../../database/prisma.service';
import { Prisma } from '@prisma/client';
import { CreateNotificationDto } from '../dto/notifications.dto';
export declare class NotificationService {
    private readonly prisma;
    private readonly logger;
    constructor(prisma: PrismaService);
    create(dto: CreateNotificationDto): Promise<{
        message: string;
        id: string;
        createdAt: Date;
        userId: string;
        type: import("@prisma/client").$Enums.NotificationType;
        title: string;
        isRead: boolean;
        metadata: Prisma.JsonValue | null;
        readAt: Date | null;
    }>;
    createMany(dtos: CreateNotificationDto[]): Promise<void>;
    getForUser(userId: string, opts: {
        unreadOnly?: boolean;
        page?: number;
        limit?: number;
    }): Promise<{
        notifications: {
            message: string;
            id: string;
            createdAt: Date;
            userId: string;
            type: import("@prisma/client").$Enums.NotificationType;
            title: string;
            isRead: boolean;
            metadata: Prisma.JsonValue | null;
            readAt: Date | null;
        }[];
        total: number;
        unreadCount: number;
        page: number;
        limit: number;
    }>;
    getUnreadCount(userId: string): Promise<number>;
    markRead(userId: string, ids?: string[]): Promise<{
        success: boolean;
    }>;
    cleanupOld(): Promise<number>;
    getPreferences(userId: string): Promise<{
        id: string;
        updatedAt: Date;
        userId: string;
        smsEnabled: boolean;
        emailEnabled: boolean;
        pushEnabled: boolean;
        whatsappEnabled: boolean;
    }>;
    updatePreferences(userId: string, data: Partial<{
        smsEnabled: boolean;
        emailEnabled: boolean;
        pushEnabled: boolean;
        whatsappEnabled: boolean;
    }>): Promise<{
        id: string;
        updatedAt: Date;
        userId: string;
        smsEnabled: boolean;
        emailEnabled: boolean;
        pushEnabled: boolean;
        whatsappEnabled: boolean;
    }>;
}
