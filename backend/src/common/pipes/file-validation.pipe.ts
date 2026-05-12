import { PipeTransform, Injectable, BadRequestException } from '@nestjs/common';

export interface FileValidationOptions {
  maxSizeMB?: number;
  allowedMimeTypes?: string[];
}

@Injectable()
export class FileValidationPipe implements PipeTransform {
  constructor(private readonly options: FileValidationOptions = {}) {}

  transform(file: Express.Multer.File) {
    if (!file) {
      throw new BadRequestException('File is required');
    }

    const maxSize = (this.options.maxSizeMB || 5) * 1024 * 1024;
    const allowedMimeTypes = this.options.allowedMimeTypes || [
      'image/jpeg',
      'image/png',
      'image/webp',
      'application/pdf',
    ];

    if (file.size > maxSize) {
      throw new BadRequestException(
        `File size exceeds the limit of ${this.options.maxSizeMB || 5}MB.`,
      );
    }

    if (!allowedMimeTypes.includes(file.mimetype)) {
      throw new BadRequestException(
        `Invalid file type. Allowed types: ${allowedMimeTypes.join(', ')}`,
      );
    }

    return file;
  }
}
