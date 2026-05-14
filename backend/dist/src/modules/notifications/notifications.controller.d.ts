import { NotificationService } from './services/notification.service';
import { EngagementService } from './services/engagement.service';
import { TrustService } from './services/trust.service';
import { MarkReadDto, UpdatePreferencesDto } from './dto/notifications.dto';
export declare class NotificationsController {
    private readonly notificationService;
    private readonly engagementService;
    private readonly trustService;
    constructor(notificationService: NotificationService, engagementService: EngagementService, trustService: TrustService);
    getNotifications(userId: string, unreadOnly?: string, page?: number, limit?: number): Promise<{
        notifications: {
            message: string;
            id: string;
            createdAt: Date;
            userId: string;
            type: import("@prisma/client").$Enums.NotificationType;
            title: string;
            isRead: boolean;
            metadata: import("@prisma/client/runtime/library").JsonValue | null;
            readAt: Date | null;
        }[];
        total: number;
        unreadCount: number;
        page: number;
        limit: number;
    }>;
    getUnreadCount(userId: string): Promise<{
        unreadCount: number;
    }>;
    markRead(userId: string, dto: MarkReadDto): Promise<{
        success: boolean;
    }>;
    getPreferences(userId: string): Promise<{
        id: string;
        updatedAt: Date;
        userId: string;
        smsEnabled: boolean;
        emailEnabled: boolean;
        pushEnabled: boolean;
        whatsappEnabled: boolean;
    }>;
    updatePreferences(userId: string, dto: UpdatePreferencesDto): Promise<{
        id: string;
        updatedAt: Date;
        userId: string;
        smsEnabled: boolean;
        emailEnabled: boolean;
        pushEnabled: boolean;
        whatsappEnabled: boolean;
    }>;
    saveDoctor(userId: string, doctorId: string): Promise<{
        success: boolean;
        message: string;
    }>;
    unsaveDoctor(userId: string, doctorId: string): Promise<{
        success: boolean;
        message: string;
    }>;
    getSavedDoctors(userId: string, page?: number, limit?: number): Promise<{
        saved: {
            savedId: string;
            savedAt: Date;
            doctor: {
                id: string;
                name: string;
                district: string;
                specialties: {
                    name: string;
                }[];
                verificationStatus: import("@prisma/client").$Enums.VerificationStatus;
                slug: string;
                profileImage: string | null;
                rating: number;
            };
        }[];
        total: number;
        page: number;
        limit: number;
    }>;
    isSaved(userId: string, doctorId: string): Promise<{
        isSaved: boolean;
    }>;
    getDoctorTrustProfile(doctorId: string): Promise<import("./services/trust.service").DoctorTrustProfile>;
    getHospitalTrustProfile(hospitalId: string): Promise<import("./services/trust.service").HospitalTrustProfile>;
    getPlatformTrustSummary(): Promise<{
        verifiedDoctors: number;
        verifiedHospitals: number;
        totalDoctors: number;
        totalHospitals: number;
        verificationRate: {
            doctors: number;
            hospitals: number;
        };
    }>;
    getActivityFeed(adminId: string, limit?: number): Promise<{
        recentVerifications: {
            id: string;
            action: string;
            targetType: import("@prisma/client").$Enums.TargetType;
            targetId: string;
            adminName: string | null;
            createdAt: Date;
        }[];
        recentSaves: {
            doctorName: string;
            district: string;
            savedAt: Date;
        }[];
    }>;
}
