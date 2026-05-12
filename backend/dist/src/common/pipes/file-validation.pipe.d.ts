import { PipeTransform } from '@nestjs/common';
export interface FileValidationOptions {
    maxSizeMB?: number;
    allowedMimeTypes?: string[];
}
export declare class FileValidationPipe implements PipeTransform {
    private readonly options;
    constructor(options?: FileValidationOptions);
    transform(file: Express.Multer.File): Express.Multer.File;
}
