import { PrismaService } from '../../../database/prisma.service';
import { VerificationStatus } from '@prisma/client';
export type TrustBadge = 'VERIFIED' | 'EMERGENCY_AVAILABLE' | 'TOP_SEARCHED' | 'TRUSTED_HOSPITAL' | 'HIGHLY_RATED' | 'EXPERIENCED';
export interface DoctorTrustProfile {
    badges: TrustBadge[];
    trustScore: number;
    isVerified: boolean;
    verificationStatus: VerificationStatus;
}
export interface HospitalTrustProfile {
    badges: TrustBadge[];
    trustScore: number;
    isVerified: boolean;
    verificationStatus: VerificationStatus;
    hasEmergency: boolean;
}
export declare class TrustService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    getDoctorTrustProfile(doctorId: string): Promise<DoctorTrustProfile>;
    getHospitalTrustProfile(hospitalId: string): Promise<HospitalTrustProfile>;
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
}
