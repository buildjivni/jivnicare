import {
  Controller,
  Post,
  UseInterceptors,
  UploadedFile,
  UploadedFiles,
  Delete,
  Param,
  BadRequestException,
} from '@nestjs/common';
import { FileInterceptor, FilesInterceptor } from '@nestjs/platform-express';
import { UploadsService } from './uploads.service';
import { Roles } from '../auth/decorators/roles.decorator';
import { Role } from '@prisma/client';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { multerOptions } from './utils/multer.config';
import { FileValidationPipe } from '../../common/pipes/file-validation.pipe';

@Controller('uploads')
export class UploadsController {
  constructor(private readonly uploadsService: UploadsService) {}

  @Roles(Role.DOCTOR)
  @Post('doctor-profile')
  @UseInterceptors(FileInterceptor('file', multerOptions))
  async uploadDoctorProfile(
    @CurrentUser('id') userId: string,
    @UploadedFile(new FileValidationPipe({ maxSizeMB: 5, allowedMimeTypes: ['image/jpeg', 'image/png', 'image/webp'] })) file: Express.Multer.File,
  ) {
    if (!file) throw new BadRequestException('File is required');
    return this.uploadsService.uploadDoctorProfileImage(userId, file);
  }

  @Roles(Role.DOCTOR)
  @Post('private-document')
  @UseInterceptors(FileInterceptor('file', multerOptions))
  async uploadPrivateDocument(
    @CurrentUser('id') userId: string,
    @UploadedFile(new FileValidationPipe({ maxSizeMB: 10, allowedMimeTypes: ['application/pdf'] })) file: Express.Multer.File,
  ) {
    if (!file) throw new BadRequestException('Document file is required');
    return this.uploadsService.uploadPrivateDocument(userId, file);
  }

  @Roles(Role.ADMIN)
  @Post('hospital-images/:hospitalId')
  @UseInterceptors(FilesInterceptor('files', 5, multerOptions)) // Max 5 files at a time
  async uploadHospitalImages(
    @CurrentUser('id') userId: string,
    @Param('hospitalId') hospitalId: string,
    @UploadedFiles() files: Express.Multer.File[],
  ) {
    if (!files || files.length === 0)
      throw new BadRequestException('At least one file is required');
    return this.uploadsService.uploadHospitalImages(userId, hospitalId, files);
  }

  @Roles(Role.ADMIN, Role.DOCTOR)
  @Delete(':id')
  async deleteMedia(
    @CurrentUser('id') userId: string,
    @CurrentUser('role') role: Role,
    @Param('id') mediaId: string,
  ) {
    return this.uploadsService.deleteMedia(userId, role, mediaId);
  }
}
