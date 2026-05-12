import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { CloudinaryService } from './cloudinary.service';
import { MediaType, Role } from '@prisma/client';

@Injectable()
export class UploadsService {
  constructor(
    private prisma: PrismaService,
    private cloudinaryService: CloudinaryService,
  ) {}

  async uploadDoctorProfileImage(userId: string, file: Express.Multer.File) {
    if (file.size > 5 * 1024 * 1024) {
      throw new BadRequestException('Doctor profile image cannot exceed 5MB');
    }

    // Ensure the user actually has a doctor profile
    const doctor = await this.prisma.doctor.findUnique({ where: { userId } });
    if (!doctor) {
      throw new NotFoundException('Doctor profile not found for this user');
    }

    // If an old profile image exists in Media table, optionally clean it up
    // We'll skip strict Cloudinary deletion here for simplicity but it can be added.

    // Upload to Cloudinary with square cropping
    const result = await this.cloudinaryService.uploadImage(file, 'doctors', {
      width: 500,
      height: 500,
      crop: 'fill',
      gravity: 'face',
    });

    // Save to Media DB
    await this.prisma.media.create({
      data: {
        url: result.secure_url,
        publicId: result.public_id,
        type: MediaType.DOCTOR_PROFILE,
        userId,
      },
    });

    // Update Doctor profile directly for fast frontend access
    await this.prisma.doctor.update({
      where: { userId },
      data: { profileImage: result.secure_url },
    });

    return {
      message: 'Profile image uploaded successfully',
      url: result.secure_url,
    };
  }

  async uploadPrivateDocument(userId: string, file: Express.Multer.File) {
    if (file.size > 10 * 1024 * 1024) {
      throw new BadRequestException('Document cannot exceed 10MB');
    }

    const doctor = await this.prisma.doctor.findUnique({ where: { userId } });
    if (!doctor) {
      throw new NotFoundException('Doctor profile not found for this user');
    }

    // Upload to Cloudinary without crop, just optimized format.
    // For "private" docs, we can configure Cloudinary access_mode to authenticated,
    // but for now we just use a separate folder.
    const result = await this.cloudinaryService.uploadImage(file, 'documents', {
      format: 'pdf', // or allow native format
    });

    const media = await this.prisma.media.create({
      data: {
        url: result.secure_url,
        publicId: result.public_id,
        type: MediaType.LICENSE_DOCUMENT,
        userId,
      },
    });

    return {
      message: 'Document uploaded successfully',
      url: result.secure_url,
      mediaId: media.id,
    };
  }

  async uploadHospitalImages(
    adminUserId: string,
    hospitalId: string,
    files: Express.Multer.File[],
  ) {
    const hospital = await this.prisma.hospital.findUnique({
      where: { id: hospitalId },
    });
    if (!hospital) {
      throw new NotFoundException('Hospital not found');
    }

    const uploadedUrls: string[] = [];

    // Process all files concurrently
    await Promise.all(
      files.map(async (file) => {
        const result = await this.cloudinaryService.uploadImage(
          file,
          'hospitals',
          {
            width: 1080,
            crop: 'limit', // maintain aspect ratio, max width 1080
          },
        );

        await this.prisma.media.create({
          data: {
            url: result.secure_url,
            publicId: result.public_id,
            type: MediaType.HOSPITAL_GALLERY,
            userId: adminUserId, // Track which admin uploaded
          },
        });

        uploadedUrls.push(result.secure_url);
      }),
    );

    // Append to Hospital array
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

  async deleteMedia(userId: string, userRole: Role, mediaId: string) {
    const media = await this.prisma.media.findUnique({
      where: { id: mediaId },
    });
    if (!media) throw new NotFoundException('Media not found');

    // Ownership check (Admins can delete anything)
    if (userRole !== Role.ADMIN && media.userId !== userId) {
      throw new ForbiddenException(
        'You can only delete your own media uploads',
      );
    }

    // 1. Delete from Cloudinary
    await this.cloudinaryService.deleteImage(media.publicId);

    // 2. Remove from Media table
    await this.prisma.media.delete({ where: { id: mediaId } });

    // 3. Remove URL from respective tables (Best effort sync)
    if (media.type === MediaType.DOCTOR_PROFILE) {
      await this.prisma.doctor.updateMany({
        where: { profileImage: media.url },
        data: { profileImage: null }, // Reset
      });
    } else if (media.type === MediaType.HOSPITAL_GALLERY) {
      // For hospitals, we must filter the array
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
}
