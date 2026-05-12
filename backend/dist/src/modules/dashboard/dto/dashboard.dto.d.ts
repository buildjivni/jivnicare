export declare class UpdateUserProfileDto {
    name?: string;
    phone?: string;
}
export declare class UpdateDoctorProfileDto {
    name?: string;
    bio?: string;
    experience?: number;
    fee?: number;
    district?: string;
    hospitalName?: string;
    gender?: string;
    languages?: string[];
    specialties?: string[];
    keywords?: string[];
}
export declare class UpdateDoctorSettingsDto {
    emergencyAvailable?: boolean;
}
