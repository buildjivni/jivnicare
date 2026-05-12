import { $Enums } from '@prisma/client';
export declare class CreateDoctorDto {
    userId: string;
    name: string;
    bio?: string;
    experience: number;
    fee: number;
    district: string;
    hospitalName: string;
    emergencyAvailable?: boolean;
    gender?: string;
    languages?: string[];
    specialties: string[];
    keywords?: string[];
}
export declare class UpdateDoctorDto {
    name?: string;
    bio?: string;
    experience?: number;
    fee?: number;
    district?: string;
    hospitalName?: string;
    verificationStatus?: $Enums.VerificationStatus;
    emergencyAvailable?: boolean;
    languages?: string[];
    specialties?: string[];
    keywords?: string[];
}
export declare class FilterDoctorDto {
    search?: string;
    district?: string;
    specialty?: string;
    emergencyAvailable?: boolean;
    verificationStatus?: $Enums.VerificationStatus;
    page?: number;
    limit?: number;
}
