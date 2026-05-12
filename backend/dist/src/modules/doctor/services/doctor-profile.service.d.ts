import { PrismaService } from '../../../database/prisma.service';
import { UpdateDoctorProfileDto } from '../dto/update-profile.dto';
export declare class DoctorProfileService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    getProfileByUserId(userId: string): Promise<{
        specialties: {
            id: string;
            name: string;
            slug: string;
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
    }>;
    updateProfile(userId: string, dto: UpdateDoctorProfileDto): Promise<{
        specialties: {
            id: string;
            name: string;
            slug: string;
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
    }>;
    calculateProfileCompletion(doctor: any): number;
}
