import { NotificationService } from './services/notification.service';
import { VerificationStatus } from '@prisma/client';
export declare class NotificationEventsService {
    private readonly notifications;
    private readonly logger;
    constructor(notifications: NotificationService);
    onDoctorVerificationStatusChanged(doctorUserId: string, doctorName: string, status: VerificationStatus, reason?: string): Promise<void>;
    onNewDoctorPendingVerification(adminUserIds: string[], doctorName: string, district: string): Promise<void>;
    onHospitalPendingVerification(adminUserIds: string[], hospitalName: string, district: string): Promise<void>;
    onProfileUpdated(userId: string, entityName: string, role: 'doctor' | 'user'): Promise<void>;
    sendPlatformAlert(userIds: string[], title: string, message: string): Promise<void>;
}
