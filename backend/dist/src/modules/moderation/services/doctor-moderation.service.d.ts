import { PrismaService } from '../../../database/prisma.service';
import { ModerationLogService } from './moderation-log.service';
import { VerificationStatus } from '@prisma/client';
import { ConfigService } from '@nestjs/config';
import { NotificationEventsService } from '../../notifications/notification-events.service';
export declare class DoctorModerationService {
    private prisma;
    private logService;
    private configService;
    private notificationEvents;
    private readonly logger;
    constructor(prisma: PrismaService, logService: ModerationLogService, configService: ConfigService, notificationEvents: NotificationEventsService);
    getPendingDoctors(page?: number, limit?: number): Promise<{
        data: ({
            user: {
                phone: string;
                name: string | null;
            };
            specialties: {
                id: string;
                name: string;
                slug: string;
                doctorIds: string[];
                hospitalIds: string[];
            }[];
        } & {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            name: string;
            userId: string;
            bio: string | null;
            experience: number;
            fee: number;
            district: string;
            hospitalName: string;
            emergencyAvailable: boolean;
            gender: string | null;
            languages: string[];
            verificationStatus: import("@prisma/client").$Enums.VerificationStatus;
            slug: string;
            profileImage: string | null;
            rating: number;
            specialtyIds: string[];
            keywordIds: string[];
            availableDays: string[];
            availableTimeSlots: import("@prisma/client/runtime/library").JsonValue | null;
            maxAppointmentsPerDay: number;
            isAcceptingAppointments: boolean;
            profileCompletionPercentage: number;
            medicalRegistrationNumber: string | null;
            consultationFee: number;
            followUpFee: number;
            averageConsultationTime: number;
            treatmentFocus: string[];
            commonSymptomsTreated: string[];
            certifications: string[];
            education: string | null;
            onlineConsultationAvailable: boolean;
            emergencyConsultationAvailable: boolean;
        })[];
        meta: {
            total: number;
            page: number;
            limit: number;
            totalPages: number;
        };
    }>;
    setStatus(adminId: string, doctorId: string, status: VerificationStatus, reason?: string): Promise<{
        success: boolean;
        message: string;
        doctor: {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            name: string;
            userId: string;
            bio: string | null;
            experience: number;
            fee: number;
            district: string;
            hospitalName: string;
            emergencyAvailable: boolean;
            gender: string | null;
            languages: string[];
            verificationStatus: import("@prisma/client").$Enums.VerificationStatus;
            slug: string;
            profileImage: string | null;
            rating: number;
            specialtyIds: string[];
            keywordIds: string[];
            availableDays: string[];
            availableTimeSlots: import("@prisma/client/runtime/library").JsonValue | null;
            maxAppointmentsPerDay: number;
            isAcceptingAppointments: boolean;
            profileCompletionPercentage: number;
            medicalRegistrationNumber: string | null;
            consultationFee: number;
            followUpFee: number;
            averageConsultationTime: number;
            treatmentFocus: string[];
            commonSymptomsTreated: string[];
            certifications: string[];
            education: string | null;
            onlineConsultationAvailable: boolean;
            emergencyConsultationAvailable: boolean;
        };
    }>;
}
