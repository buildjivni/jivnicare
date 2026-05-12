"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UploadsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../database/prisma.service");
const cloudinary_service_1 = require("./cloudinary.service");
const client_1 = require("@prisma/client");
let UploadsService = class UploadsService {
    prisma;
    cloudinaryService;
    constructor(prisma, cloudinaryService) {
        this.prisma = prisma;
        this.cloudinaryService = cloudinaryService;
    }
    async uploadDoctorProfileImage(userId, file) {
        if (file.size > 5 * 1024 * 1024) {
            throw new common_1.BadRequestException('Doctor profile image cannot exceed 5MB');
        }
        const doctor = await this.prisma.doctor.findUnique({ where: { userId } });
        if (!doctor) {
            throw new common_1.NotFoundException('Doctor profile not found for this user');
        }
        const result = await this.cloudinaryService.uploadImage(file, 'doctors', {
            width: 500,
            height: 500,
            crop: 'fill',
            gravity: 'face',
        });
        await this.prisma.media.create({
            data: {
                url: result.secure_url,
                publicId: result.public_id,
                type: client_1.MediaType.DOCTOR_PROFILE,
                userId,
            },
        });
        await this.prisma.doctor.update({
            where: { userId },
            data: { profileImage: result.secure_url },
        });
        return {
            message: 'Profile image uploaded successfully',
            url: result.secure_url,
        };
    }
    async uploadPrivateDocument(userId, file) {
        if (file.size > 10 * 1024 * 1024) {
            throw new common_1.BadRequestException('Document cannot exceed 10MB');
        }
        const doctor = await this.prisma.doctor.findUnique({ where: { userId } });
        if (!doctor) {
            throw new common_1.NotFoundException('Doctor profile not found for this user');
        }
        const result = await this.cloudinaryService.uploadImage(file, 'documents', {
            format: 'pdf',
        });
        const media = await this.prisma.media.create({
            data: {
                url: result.secure_url,
                publicId: result.public_id,
                type: client_1.MediaType.LICENSE_DOCUMENT,
                userId,
            },
        });
        return {
            message: 'Document uploaded successfully',
            url: result.secure_url,
            mediaId: media.id,
        };
    }
    async uploadHospitalImages(adminUserId, hospitalId, files) {
        const hospital = await this.prisma.hospital.findUnique({
            where: { id: hospitalId },
        });
        if (!hospital) {
            throw new common_1.NotFoundException('Hospital not found');
        }
        const uploadedUrls = [];
        await Promise.all(files.map(async (file) => {
            const result = await this.cloudinaryService.uploadImage(file, 'hospitals', {
                width: 1080,
                crop: 'limit',
            });
            await this.prisma.media.create({
                data: {
                    url: result.secure_url,
                    publicId: result.public_id,
                    type: client_1.MediaType.HOSPITAL_GALLERY,
                    userId: adminUserId,
                },
            });
            uploadedUrls.push(result.secure_url);
        }));
        const updatedImages = [...hospital.images, ...uploadedUrls];
        await this.prisma.hospital.update({
            where: { id: hospitalId },
            data: { images: updatedImages },
        });
        return {
            message: 'Hospital images uploaded successfully',
            urls: uploadedUrls,
        };
    }
    async deleteMedia(userId, userRole, mediaId) {
        const media = await this.prisma.media.findUnique({
            where: { id: mediaId },
        });
        if (!media)
            throw new common_1.NotFoundException('Media not found');
        if (userRole !== client_1.Role.ADMIN && media.userId !== userId) {
            throw new common_1.ForbiddenException('You can only delete your own media uploads');
        }
        await this.cloudinaryService.deleteImage(media.publicId);
        await this.prisma.media.delete({ where: { id: mediaId } });
        if (media.type === client_1.MediaType.DOCTOR_PROFILE) {
            await this.prisma.doctor.updateMany({
                where: { profileImage: media.url },
                data: { profileImage: null },
            });
        }
        else if (media.type === client_1.MediaType.HOSPITAL_GALLERY) {
            const hospitals = await this.prisma.hospital.findMany({
                where: { images: { has: media.url } },
            });
            for (const h of hospitals) {
                const filteredImages = h.images.filter((img) => img !== media.url);
                await this.prisma.hospital.update({
                    where: { id: h.id },
                    data: { images: filteredImages },
                });
            }
        }
        return { message: 'Media deleted successfully' };
    }
};
exports.UploadsService = UploadsService;
exports.UploadsService = UploadsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        cloudinary_service_1.CloudinaryService])
], UploadsService);
//# sourceMappingURL=uploads.service.js.map