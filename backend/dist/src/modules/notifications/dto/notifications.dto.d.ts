import { NotificationType } from '@prisma/client';
export declare class CreateNotificationDto {
    userId: string;
    type: NotificationType;
    title: string;
    message: string;
    metadata?: Record<string, unknown>;
}
export declare class MarkReadDto {
    ids?: string[];
}
export declare class UpdatePreferencesDto {
    smsEnabled?: boolean;
    emailEnabled?: boolean;
    pushEnabled?: boolean;
    whatsappEnabled?: boolean;
}
export declare class NotificationQueryDto {
    type?: NotificationType;
    unreadOnly?: boolean;
    page?: number;
    limit?: number;
}
