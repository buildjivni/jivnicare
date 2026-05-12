import { BadRequestException } from '@nestjs/common';

export const multerOptions = {
  limits: {
    fileSize: 10 * 1024 * 1024, // 10 MB global max limit (will restrict to 5MB in Doctor upload route logically if needed, but 10MB covers both)
  },
  fileFilter: (req: any, file: any, cb: any) => {
    // Allow images + PDF for documents
    const allowedImageMime = /image\/(jpg|jpeg|png|webp)$/;
    const allowedDocMime = /application\/pdf$/;
    if (allowedImageMime.test(file.mimetype) || allowedDocMime.test(file.mimetype)) {
      cb(null, true);
    } else {
      cb(
        new BadRequestException(
          `Unsupported file type ${file.mimetype}. Allowed: jpg, jpeg, png, webp, pdf.`,
        ),
        false,
      );
    }
  },
};
