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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UploadsController = void 0;
const common_1 = require("@nestjs/common");
const platform_express_1 = require("@nestjs/platform-express");
const uploads_service_1 = require("./uploads.service");
const roles_decorator_1 = require("../auth/decorators/roles.decorator");
const client_1 = require("@prisma/client");
const current_user_decorator_1 = require("../auth/decorators/current-user.decorator");
const multer_config_1 = require("./utils/multer.config");
const file_validation_pipe_1 = require("../../common/pipes/file-validation.pipe");
let UploadsController = class UploadsController {
    uploadsService;
    constructor(uploadsService) {
        this.uploadsService = uploadsService;
    }
    async uploadDoctorProfile(userId, file) {
        if (!file)
            throw new common_1.BadRequestException('File is required');
        return this.uploadsService.uploadDoctorProfileImage(userId, file);
    }
    async uploadPrivateDocument(userId, file) {
        if (!file)
            throw new common_1.BadRequestException('Document file is required');
        return this.uploadsService.uploadPrivateDocument(userId, file);
    }
    async uploadHospitalImages(userId, hospitalId, files) {
        if (!files || files.length === 0)
            throw new common_1.BadRequestException('At least one file is required');
        return this.uploadsService.uploadHospitalImages(userId, hospitalId, files);
    }
    async deleteMedia(userId, role, mediaId) {
        return this.uploadsService.deleteMedia(userId, role, mediaId);
    }
};
exports.UploadsController = UploadsController;
__decorate([
    (0, roles_decorator_1.Roles)(client_1.Role.DOCTOR),
    (0, common_1.Post)('doctor-profile'),
    (0, common_1.UseInterceptors)((0, platform_express_1.FileInterceptor)('file', multer_config_1.multerOptions)),
    __param(0, (0, current_user_decorator_1.CurrentUser)('id')),
    __param(1, (0, common_1.UploadedFile)(new file_validation_pipe_1.FileValidationPipe({ maxSizeMB: 5, allowedMimeTypes: ['image/jpeg', 'image/png', 'image/webp'] }))),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], UploadsController.prototype, "uploadDoctorProfile", null);
__decorate([
    (0, roles_decorator_1.Roles)(client_1.Role.DOCTOR),
    (0, common_1.Post)('private-document'),
    (0, common_1.UseInterceptors)((0, platform_express_1.FileInterceptor)('file', multer_config_1.multerOptions)),
    __param(0, (0, current_user_decorator_1.CurrentUser)('id')),
    __param(1, (0, common_1.UploadedFile)(new file_validation_pipe_1.FileValidationPipe({ maxSizeMB: 10, allowedMimeTypes: ['application/pdf'] }))),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], UploadsController.prototype, "uploadPrivateDocument", null);
__decorate([
    (0, roles_decorator_1.Roles)(client_1.Role.ADMIN),
    (0, common_1.Post)('hospital-images/:hospitalId'),
    (0, common_1.UseInterceptors)((0, platform_express_1.FilesInterceptor)('files', 5, multer_config_1.multerOptions)),
    __param(0, (0, current_user_decorator_1.CurrentUser)('id')),
    __param(1, (0, common_1.Param)('hospitalId')),
    __param(2, (0, common_1.UploadedFiles)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, Array]),
    __metadata("design:returntype", Promise)
], UploadsController.prototype, "uploadHospitalImages", null);
__decorate([
    (0, roles_decorator_1.Roles)(client_1.Role.ADMIN, client_1.Role.DOCTOR),
    (0, common_1.Delete)(':id'),
    __param(0, (0, current_user_decorator_1.CurrentUser)('id')),
    __param(1, (0, current_user_decorator_1.CurrentUser)('role')),
    __param(2, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String]),
    __metadata("design:returntype", Promise)
], UploadsController.prototype, "deleteMedia", null);
exports.UploadsController = UploadsController = __decorate([
    (0, common_1.Controller)('uploads'),
    __metadata("design:paramtypes", [uploads_service_1.UploadsService])
], UploadsController);
//# sourceMappingURL=uploads.controller.js.map