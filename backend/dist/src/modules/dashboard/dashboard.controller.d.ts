import { UserDashboardService } from './services/user-dashboard.service';
import { DoctorDashboardService } from './services/doctor-dashboard.service';
import { AdminDashboardService } from './services/admin-dashboard.service';
import { UpdateUserProfileDto, UpdateDoctorProfileDto, UpdateDoctorSettingsDto } from './dto/dashboard.dto';
export declare class DashboardController {
    private readonly userDashboardService;
    private readonly doctorDashboardService;
    private readonly adminDashboardService;
    constructor(userDashboardService: UserDashboardService, doctorDashboardService: DoctorDashboardService, adminDashboardService: AdminDashboardService);
    getUserDashboard(userId: string): Promise<{
        profile: {
            phone: string;
            id: string;
            createdAt: Date;
            name: string | null;
            role: import("@prisma/client").$Enums.Role;
            isVerified: boolean;
        };
        recentSearches: never[];
        savedDoctors: never[];
    }>;
    updateUserProfile(userId: string, updateDto: UpdateUserProfileDto): Promise<{
        message: string;
        user: {
            phone: string;
            id: string;
            name: string | null;
            role: import("@prisma/client").$Enums.Role;
        };
    }>;
    getDoctorDashboard(userId: string): Promise<{
        profile: {
            user: {
                phone: string;
                isVerified: boolean;
            };
            specialties: {
                id: string;
                name: string;
                slug: string;
            }[];
            keywords: {
                id: string;
                term: string;
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
        };
        verificationStatus: import("@prisma/client").$Enums.VerificationStatus;
    }>;
    updateDoctorProfile(userId: string, updateDto: UpdateDoctorProfileDto): Promise<{
        message: string;
        doctor: {
            specialties: {
                id: string;
                name: string;
                slug: string;
            }[];
            keywords: {
                id: string;
                term: string;
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
        };
    }>;
    updateDoctorSettings(userId: string, settingsDto: UpdateDoctorSettingsDto): Promise<{
        message: string;
        settings: {
            emergencyAvailable: boolean;
        };
    }>;
    getAdminDashboard(): Promise<{
        doctors: {
            total: number;
            verified: number;
            pending: number;
        };
        hospitals: {
            total: number;
            verified: number;
        };
        users: {
            total: number;
        };
        recentActivity: never[];
    }>;
}
