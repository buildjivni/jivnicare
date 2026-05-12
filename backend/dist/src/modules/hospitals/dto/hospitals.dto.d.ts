import { $Enums } from '@prisma/client';
export declare class CreateHospitalDto {
    name: string;
    description?: string;
    district: string;
    address: string;
    phone: string;
    hospitalType?: string;
    verified?: boolean;
    emergencyAvailable?: boolean;
    ambulanceAvailable?: boolean;
    website?: string;
    images?: string[];
    specialties?: string[];
    keywords?: string[];
}
export declare class UpdateHospitalDto {
    name?: string;
    description?: string;
    district?: string;
    address?: string;
    phone?: string;
    hospitalType?: string;
    verified?: boolean;
    emergencyAvailable?: boolean;
    ambulanceAvailable?: boolean;
    website?: string;
    rating?: number;
    images?: string[];
    specialties?: string[];
    keywords?: string[];
}
export declare class FilterHospitalDto {
    search?: string;
    district?: string;
    hospitalType?: string;
    specialty?: string;
    emergencyAvailable?: boolean;
    ambulanceAvailable?: boolean;
    verificationStatus?: $Enums.VerificationStatus;
    page?: number;
    limit?: number;
}
