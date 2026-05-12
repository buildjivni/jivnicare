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
exports.RecommendationService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../../database/prisma.service");
let RecommendationService = class RecommendationService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async getTopDoctors(opts) {
        const { district, specialty, limit = 6 } = opts;
        const where = { verificationStatus: 'VERIFIED' };
        if (district)
            where.district = { equals: district, mode: 'insensitive' };
        if (specialty)
            where.specialties = { some: { slug: specialty.toLowerCase() } };
        const doctors = await this.prisma.doctor.findMany({
            where,
            orderBy: [{ rating: 'desc' }, { experience: 'desc' }],
            take: limit,
            select: {
                id: true,
                name: true,
                slug: true,
                profileImage: true,
                district: true,
                rating: true,
                experience: true,
                fee: true,
                emergencyAvailable: true,
                verificationStatus: true,
                specialties: { select: { name: true, slug: true } },
            },
        });
        return { doctors, count: doctors.length };
    }
    async getEmergencyProviders(district, limit = 10) {
        const where = {
            verificationStatus: 'VERIFIED',
            emergencyAvailable: true,
        };
        if (district)
            where.district = { equals: district, mode: 'insensitive' };
        const [hospitals, doctors] = await Promise.all([
            this.prisma.hospital.findMany({
                where: { verificationStatus: 'VERIFIED', emergencyAvailable: true, ...(district ? { district: { equals: district, mode: 'insensitive' } } : {}) },
                orderBy: { rating: 'desc' },
                take: limit,
                select: { id: true, name: true, slug: true, district: true, phone: true, rating: true, address: true, ambulanceAvailable: true },
            }),
            this.prisma.doctor.findMany({
                where,
                orderBy: { rating: 'desc' },
                take: Math.ceil(limit / 2),
                select: {
                    id: true, name: true, slug: true, district: true, rating: true,
                    specialties: { select: { name: true } },
                },
            }),
        ]);
        return { hospitals, doctors };
    }
    async getRelatedDoctors(doctorId, limit = 4) {
        const doctor = await this.prisma.doctor.findUnique({
            where: { id: doctorId },
            include: { specialties: true },
        });
        if (!doctor)
            return { doctors: [] };
        const specialtySlugs = doctor.specialties.map(s => s.slug);
        const related = await this.prisma.doctor.findMany({
            where: {
                id: { not: doctorId },
                verificationStatus: 'VERIFIED',
                district: doctor.district,
                specialties: { some: { slug: { in: specialtySlugs } } },
            },
            orderBy: { rating: 'desc' },
            take: limit,
            select: {
                id: true, name: true, slug: true, profileImage: true,
                district: true, rating: true, fee: true,
                specialties: { select: { name: true } },
            },
        });
        return { doctors: related };
    }
    async getDistrictHealthcareOverview(district) {
        const [totalDoctors, totalHospitals, emergencyHospitals, specialties] = await Promise.all([
            this.prisma.doctor.count({
                where: { verificationStatus: 'VERIFIED', district: { equals: district, mode: 'insensitive' } },
            }),
            this.prisma.hospital.count({
                where: { verificationStatus: 'VERIFIED', district: { equals: district, mode: 'insensitive' } },
            }),
            this.prisma.hospital.count({
                where: { verificationStatus: 'VERIFIED', emergencyAvailable: true, district: { equals: district, mode: 'insensitive' } },
            }),
            this.prisma.specialty.findMany({
                where: {
                    doctors: { some: { verificationStatus: 'VERIFIED', district: { equals: district, mode: 'insensitive' } } },
                },
                take: 10,
                select: { name: true, slug: true },
            }),
        ]);
        return {
            district,
            totalDoctors,
            totalHospitals,
            emergencyHospitals,
            topSpecialties: specialties,
        };
    }
};
exports.RecommendationService = RecommendationService;
exports.RecommendationService = RecommendationService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], RecommendationService);
//# sourceMappingURL=recommendation.service.js.map