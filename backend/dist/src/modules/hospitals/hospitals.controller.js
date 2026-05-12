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
exports.HospitalsController = void 0;
const common_1 = require("@nestjs/common");
const hospitals_service_1 = require("./hospitals.service");
const hospitals_dto_1 = require("./dto/hospitals.dto");
const public_decorator_1 = require("../auth/decorators/public.decorator");
const roles_decorator_1 = require("../auth/decorators/roles.decorator");
const client_1 = require("@prisma/client");
let HospitalsController = class HospitalsController {
    hospitalsService;
    constructor(hospitalsService) {
        this.hospitalsService = hospitalsService;
    }
    create(createHospitalDto) {
        return this.hospitalsService.create(createHospitalDto);
    }
    findAll(filterDto) {
        return this.hospitalsService.findAll(filterDto);
    }
    findOne(slug) {
        return this.hospitalsService.findOne(slug);
    }
    update(id, updateHospitalDto) {
        return this.hospitalsService.update(id, updateHospitalDto);
    }
    remove(id) {
        return this.hospitalsService.remove(id);
    }
};
exports.HospitalsController = HospitalsController;
__decorate([
    (0, roles_decorator_1.Roles)(client_1.Role.ADMIN),
    (0, common_1.Post)(),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [hospitals_dto_1.CreateHospitalDto]),
    __metadata("design:returntype", void 0)
], HospitalsController.prototype, "create", null);
__decorate([
    (0, public_decorator_1.Public)(),
    (0, common_1.Get)(),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [hospitals_dto_1.FilterHospitalDto]),
    __metadata("design:returntype", void 0)
], HospitalsController.prototype, "findAll", null);
__decorate([
    (0, public_decorator_1.Public)(),
    (0, common_1.Get)(':slug'),
    __param(0, (0, common_1.Param)('slug')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], HospitalsController.prototype, "findOne", null);
__decorate([
    (0, roles_decorator_1.Roles)(client_1.Role.ADMIN),
    (0, common_1.Patch)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, hospitals_dto_1.UpdateHospitalDto]),
    __metadata("design:returntype", void 0)
], HospitalsController.prototype, "update", null);
__decorate([
    (0, roles_decorator_1.Roles)(client_1.Role.ADMIN),
    (0, common_1.Delete)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], HospitalsController.prototype, "remove", null);
exports.HospitalsController = HospitalsController = __decorate([
    (0, common_1.Controller)('hospitals'),
    __metadata("design:paramtypes", [hospitals_service_1.HospitalsService])
], HospitalsController);
//# sourceMappingURL=hospitals.controller.js.map