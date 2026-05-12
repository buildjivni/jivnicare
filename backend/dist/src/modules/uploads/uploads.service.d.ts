import { PrismaService } from '../../database/prisma.service';
import { CloudinaryService } from './cloudinary.service';
import { Role } from '@prisma/client';
export declare class UploadsService {
    private prisma;
    private cloudinaryService;
    constructor(prisma: PrismaService, cloudinaryService: CloudinaryService);
    uploadDoctorProfileImage(userId: string, file: Express.Multer.File): Promise<{
        message: string;
        url: string;
    }>;
    uploadPrivateDocument(userId: string, file: Express.Multer.File): Promise<{
        message: string;
        url: string;
        mediaId: string;
    }>;
    uploadHospitalImages(adminUserId: string, hospitalId: string, files: Express.Multer.File[]): Promise<{
        message: string;
        urls: string[];
    }>;
    deleteMedia(userId: string, userRole: Role, mediaId: string): Promise<{
        message: string;
    }>;
}
