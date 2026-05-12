import { UploadsService } from './uploads.service';
import { Role } from '@prisma/client';
export declare class UploadsController {
    private readonly uploadsService;
    constructor(uploadsService: UploadsService);
    uploadDoctorProfile(userId: string, file: Express.Multer.File): Promise<{
        message: string;
        url: string;
    }>;
    uploadPrivateDocument(userId: string, file: Express.Multer.File): Promise<{
        message: string;
        url: string;
        mediaId: string;
    }>;
    uploadHospitalImages(userId: string, hospitalId: string, files: Express.Multer.File[]): Promise<{
        message: string;
        urls: string[];
    }>;
    deleteMedia(userId: string, role: Role, mediaId: string): Promise<{
        message: string;
    }>;
}
