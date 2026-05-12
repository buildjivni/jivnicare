import { PrismaService } from '../../../database/prisma.service';
import { UpdateDoctorProfileDto, UpdateDoctorSettingsDto } from '../dto/dashboard.dto';
export declare class DoctorDashboardService {
    private prisma;
    constructor(prisma: PrismaService);
    getProfile(userId: string): Promise<{
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
    updateProfile(userId: string, updateDto: UpdateDoctorProfileDto): Promise<{
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
    updateSettings(userId: string, settingsDto: UpdateDoctorSettingsDto): Promise<{
        message: string;
        settings: {
            emergencyAvailable: boolean;
        };
    }>;
}
