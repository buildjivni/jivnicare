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
exports.HospitalsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../database/prisma.service");
let HospitalsService = class HospitalsService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    generateSlug(name) {
        return (name.toLowerCase().replace(/[^a-z0-9]+/g, '-') +
            '-' +
            Math.random().toString(36).substring(2, 6));
    }
    async create(createHospitalDto) {
        const { specialties, keywords, ...hospitalData } = createHospitalDto;
        const existingHospital = await this.prisma.hospital.findFirst({
            where: {
                name: { equals: hospitalData.name, mode: 'insensitive' },
                district: { equals: hospitalData.district, mode: 'insensitive' },
            },
        });
        if (existingHospital) {
            throw new common_1.BadRequestException('A hospital with this name already exists in this district.');
        }
        const slug = this.generateSlug(hospitalData.name);
        return this.prisma.hospital.create({
            data: {
                ...hospitalData,
                slug,
                specialties: specialties
                    ? {
                        connectOrCreate: specialties.map((sp) => ({
                            where: { slug: sp.toLowerCase().replace(/[^a-z0-9]+/g, '-') },
                            create: {
                                name: sp,
                                slug: sp.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
                            },
                        })),
                    }
                    : undefined,
                keywords: keywords
                    ? {
                        connectOrCreate: keywords.map((kw) => ({
                            where: { term: kw.toLowerCase() },
                            create: { term: kw.toLowerCase() },
                        })),
                    }
                    : undefined,
            },
            include: { specialties: true, keywords: true },
        });
    }
    async findAll(filterDto) {
        const { search, district, hospitalType, specialty, emergencyAvailable, ambulanceAvailable, verificationStatus, page = 1, limit = 20, } = filterDto;
        const where = {};
        if (district)
            where.district = { equals: district, mode: 'insensitive' };
        if (hospitalType)
            where.hospitalType = { equals: hospitalType, mode: 'insensitive' };
        if (emergencyAvailable !== undefined)
            where.emergencyAvailable = emergencyAvailable;
        if (ambulanceAvailable !== undefined)
            where.ambulanceAvailable = ambulanceAvailable;
        if (verificationStatus !== undefined)
            where.verificationStatus = verificationStatus;
        if (specialty) {
            where.specialties = {
                some: { slug: specialty.toLowerCase() },
            };
        }
        if (search) {
            where.OR = [
                { name: { contains: search, mode: 'insensitive' } },
                { address: { contains: search, mode: 'insensitive' } },
                {
                    keywords: {
                        some: { term: { contains: search, mode: 'insensitive' } },
                    },
                },
            ];
        }
        const skip = (page - 1) * limit;
        const [hospitals, total] = await Promise.all([
            this.prisma.hospital.findMany({
                where,
                skip,
                take: limit,
                include: { specialties: true },
                orderBy: { rating: 'desc' },
            }),
            this.prisma.hospital.count({ where }),
        ]);
        return {
            hospitals,
            meta: {
                total,
                page,
                limit,
                totalPages: Math.ceil(total / limit),
            },
        };
    }
    async findOne(slug) {
        const hospital = await this.prisma.hospital.findUnique({
            where: { slug },
            include: { specialties: true, keywords: true },
        });
        if (!hospital)
            throw new common_1.NotFoundException(`Hospital with slug ${slug} not found`);
        return hospital;
    }
    async update(id, updateHospitalDto) {
        const { specialties, keywords, ...updateData } = updateHospitalDto;
        const hospital = await this.prisma.hospital.findUnique({ where: { id } });
        if (!hospital)
            throw new common_1.NotFoundException('Hospital not found');
        const updatePayload = { ...updateData };
        if (specialties) {
            updatePayload.specialties = {
                set: [],
                connectOrCreate: specialties.map((sp) => ({
                    where: { slug: sp.toLowerCase().replace(/[^a-z0-9]+/g, '-') },
                    create: {
                        name: sp,
                        slug: sp.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
                    },
                })),
            };
        }
        if (keywords) {
            updatePayload.keywords = {
                set: [],
                connectOrCreate: keywords.map((kw) => ({
                    where: { term: kw.toLowerCase() },
                    create: { term: kw.toLowerCase() },
                })),
            };
        }
        return this.prisma.hospital.update({
            where: { id },
            data: updatePayload,
            include: { specialties: true, keywords: true },
        });
    }
    async remove(id) {
        const hospital = await this.prisma.hospital.findUnique({ where: { id } });
        if (!hospital)
            throw new common_1.NotFoundException('Hospital not found');
        await this.prisma.hospital.delete({ where: { id } });
        return { message: 'Hospital deleted successfully' };
    }
};
exports.HospitalsService = HospitalsService;
exports.HospitalsService = HospitalsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], HospitalsService);
//# sourceMappingURL=hospitals.service.js.map