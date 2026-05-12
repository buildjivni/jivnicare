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
exports.QueueController = void 0;
const common_1 = require("@nestjs/common");
const queue_service_1 = require("./queue.service");
const generate_token_dto_1 = require("./dto/generate-token.dto");
const update_queue_dto_1 = require("./dto/update-queue.dto");
const jwt_auth_guard_1 = require("../auth/guards/jwt-auth.guard");
const roles_guard_1 = require("../auth/guards/roles.guard");
const roles_decorator_1 = require("../auth/decorators/roles.decorator");
let QueueController = class QueueController {
    queueService;
    constructor(queueService) {
        this.queueService = queueService;
    }
    async generateOnlineToken(req, dto) {
        return this.queueService.generateOnlineToken(req.user.id, dto);
    }
    async generateWalkInToken(dto) {
        return this.queueService.generateWalkInToken(dto);
    }
    async getDoctorLiveQueue(req) {
        return this.queueService.getDoctorLiveQueue(req.user.id);
    }
    async updateQueueStatus(req, queueId, dto) {
        return this.queueService.updateQueueStatus(queueId, req.user.id, dto);
    }
    async updateTokenStatus(req, tokenId, dto) {
        return this.queueService.updateTokenStatus(tokenId, req.user.id, dto);
    }
};
exports.QueueController = QueueController;
__decorate([
    (0, common_1.Post)('token/online'),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, generate_token_dto_1.GenerateOnlineTokenDto]),
    __metadata("design:returntype", Promise)
], QueueController.prototype, "generateOnlineToken", null);
__decorate([
    (0, common_1.Post)('token/walk-in'),
    (0, common_1.UseGuards)(roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)('DOCTOR', 'ADMIN'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [generate_token_dto_1.GenerateWalkInTokenDto]),
    __metadata("design:returntype", Promise)
], QueueController.prototype, "generateWalkInToken", null);
__decorate([
    (0, common_1.Get)('doctor/today'),
    (0, common_1.UseGuards)(roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)('DOCTOR'),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], QueueController.prototype, "getDoctorLiveQueue", null);
__decorate([
    (0, common_1.Patch)(':id/status'),
    (0, common_1.UseGuards)(roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)('DOCTOR'),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Param)('id')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, update_queue_dto_1.UpdateQueueStatusDto]),
    __metadata("design:returntype", Promise)
], QueueController.prototype, "updateQueueStatus", null);
__decorate([
    (0, common_1.Patch)('token/:tokenId/status'),
    (0, common_1.UseGuards)(roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)('DOCTOR'),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Param)('tokenId')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, update_queue_dto_1.UpdateTokenStatusDto]),
    __metadata("design:returntype", Promise)
], QueueController.prototype, "updateTokenStatus", null);
exports.QueueController = QueueController = __decorate([
    (0, common_1.Controller)('queue'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __metadata("design:paramtypes", [queue_service_1.QueueService])
], QueueController);
//# sourceMappingURL=queue.controller.js.map