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
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserDashboardService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../../database/prisma.service");
let UserDashboardService = class UserDashboardService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async getProfile(userId) {
        const user = await this.prisma.user.findUnique({
            where: { id: userId },
            select: {
                id: true,
                name: true,
                phone: true,
                role: true,
                isVerified: true,
                createdAt: true,
            },
        });
        if (!user)
            throw new common_1.NotFoundException('User not found');
        return {
            profile: user,
            recentSearches: [],
            savedDoctors: [],
        };
    }
    async updateProfile(userId, updateDto) {
        const user = await this.prisma.user.update({
            where: { id: userId },
            data: updateDto,
            select: {
                id: true,
                name: true,
                phone: true,
                role: true,
            },
        });
        return {
            message: 'Profile updated successfully',
            user,
        };
    }
};
exports.UserDashboardService = UserDashboardService;
exports.UserDashboardService = UserDashboardService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], UserDashboardService);
//# sourceMappingURL=user-dashboard.service.js.map