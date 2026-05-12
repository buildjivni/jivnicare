import { UploadApiResponse } from 'cloudinary';
import { ConfigService } from '@nestjs/config';
export declare class CloudinaryService {
    private configService;
    private readonly logger;
    constructor(configService: ConfigService);
    uploadImage(file: Express.Multer.File, folder: string, transformations?: any): Promise<UploadApiResponse>;
    deleteImage(publicId: string): Promise<any>;
}
