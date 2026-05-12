import { PrismaService } from '../../../database/prisma.service';
export declare class RecommendationService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    getTopDoctors(opts: {
        district?: string;
        specialty?: string;
        limit?: number;
    }): Promise<{
        doctors: {
            id: string;
            name: string;
            experience: number;
            fee: number;
            district: string;
            emergencyAvailable: boolean;
            specialties: {
                name: string;
                slug: string;
            }[];
            verificationStatus: import("@prisma/client").$Enums.VerificationStatus;
            slug: string;
            profileImage: string | null;
            rating: number;
        }[];
        count: number;
    }>;
    getEmergencyProviders(district?: string, limit?: number): Promise<{
        hospitals: {
            phone: string;
            id: string;
            name: string;
            district: string;
            slug: string;
            rating: number;
            address: string;
            ambulanceAvailable: boolean;
        }[];
        doctors: {
            id: string;
            name: string;
            district: string;
            specialties: {
                name: string;
            }[];
            slug: string;
            rating: number;
        }[];
    }>;
    getRelatedDoctors(doctorId: string, limit?: number): Promise<{
        doctors: {
            id: string;
            name: string;
            fee: number;
            district: string;
            specialties: {
                name: string;
            }[];
            slug: string;
            profileImage: string | null;
            rating: number;
        }[];
    }>;
    getDistrictHealthcareOverview(district: string): Promise<{
        district: string;
        totalDoctors: number;
        totalHospitals: number;
        emergencyHospitals: number;
        topSpecialties: {
            name: string;
            slug: string;
        }[];
    }>;
}
