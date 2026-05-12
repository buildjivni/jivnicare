import { Module } from '@nestjs/common';
import { UploadsService } from './uploads.service';
import { UploadsController } from './uploads.controller';
import { CloudinaryService } from './cloudinary.service';

@Module({
  controllers: [UploadsController],
  providers: [UploadsService, CloudinaryService],
  exports: [UploadsService],
})
export class UploadsModule {}
