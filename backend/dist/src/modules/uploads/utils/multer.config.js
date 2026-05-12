"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.multerOptions = void 0;
const common_1 = require("@nestjs/common");
exports.multerOptions = {
    limits: {
        fileSize: 10 * 1024 * 1024,
    },
    fileFilter: (req, file, cb) => {
        const allowedImageMime = /image\/(jpg|jpeg|png|webp)$/;
        const allowedDocMime = /application\/pdf$/;
        if (allowedImageMime.test(file.mimetype) || allowedDocMime.test(file.mimetype)) {
            cb(null, true);
        }
        else {
            cb(new common_1.BadRequestException(`Unsupported file type ${file.mimetype}. Allowed: jpg, jpeg, png, webp, pdf.`), false);
        }
    },
};
//# sourceMappingURL=multer.config.js.map