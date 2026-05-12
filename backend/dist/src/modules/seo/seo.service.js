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
exports.SeoService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../database/prisma.service");
let SeoService = class SeoService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async getSitemapData() {
        const [doctors, hospitals] = await Promise.all([
            this.prisma.doctor.findMany({
                where: { verificationStatus: 'VERIFIED' },
                select: { slug: true, updatedAt: true },
            }),
            this.prisma.hospital.findMany({
                where: { verificationStatus: 'VERIFIED' },
                select: { slug: true, updatedAt: true },
            }),
        ]);
        return {
            doctors,
            hospitals,
        };
    }
    async getActiveDistricts() {
        const [doctorDistricts, hospitalDistricts] = await Promise.all([
            this.prisma.doctor.findMany({
                where: { verificationStatus: 'VERIFIED' },
                select: { district: true },
                distinct: ['district'],
            }),
            this.prisma.hospital.findMany({
                where: { verificationStatus: 'VERIFIED' },
                select: { district: true },
                distinct: ['district'],
            }),
        ]);
        const allDistricts = new Set([
            ...doctorDistricts.map((d) => d.district),
            ...hospitalDistricts.map((h) => h.district),
        ]);
        return Array.from(allDistricts);
    }
};
exports.SeoService = SeoService;
exports.SeoService = SeoService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], SeoService);
//# sourceMappingURL=seo.service.js.map