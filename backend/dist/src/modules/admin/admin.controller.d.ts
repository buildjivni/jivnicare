import { VerificationService } from './services/verification.service';
import { GovernanceService } from './services/governance.service';
import { AnalyticsService } from './services/analytics.service';
import { ModerateEntityDto } from './dto/moderate-entity.dto';
export declare class AdminController {
    private readonly verificationService;
    private readonly governanceService;
    private readonly analyticsService;
    constructor(verificationService: VerificationService, governanceService: GovernanceService, analyticsService: AnalyticsService);
    getOverview(): Promise<{
        doctors: {
            total: number;
            verified: number;
            pending: number;
        };
        hospitals: {
            total: number;
            pending: number;
        };
        bookings: {
            total: number;
            active: number;
        };
    }>;
    getPendingDoctors(): Promise<({
        user: {
            phone: string;
            name: string | null;
        };
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
        availableDays: string[];
        availableTimeSlots: import("@prisma/client/runtime/client").JsonValue | null;
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
    })[]>;
    getPendingHospitals(): Promise<{
        phone: string;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        name: string;
        district: string;
        emergencyAvailable: boolean;
        verificationStatus: import("@prisma/client").$Enums.VerificationStatus;
        slug: string;
        rating: number;
        description: string | null;
        address: string;
        hospitalType: string;
        ambulanceAvailable: boolean;
        website: string | null;
        images: string[];
    }[]>;
    moderateDoctor(req: any, id: string, dto: ModerateEntityDto): Promise<any>;
    moderateHospital(req: any, id: string, dto: ModerateEntityDto): Promise<any>;
}
