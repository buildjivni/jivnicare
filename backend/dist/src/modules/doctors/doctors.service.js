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
exports.DoctorsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../database/prisma.service");
let DoctorsService = class DoctorsService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    generateSlug(name) {
        return (name.toLowerCase().replace(/[^a-z0-9]+/g, '-') +
            '-' +
            Math.random().toString(36).substring(2, 6));
    }
    calculateProfileCompleteness(doctor) {
        let score = 0;
        const totalFields = 7;
        if (doctor.name)
            score += 1;
        if (doctor.bio)
            score += 1;
        if (doctor.experience > 0)
            score += 1;
        if (doctor.fee > 0)
            score += 1;
        if (doctor.profileImage)
            score += 1;
        if (doctor.hospitalName)
            score += 1;
        if (doctor.specialties && doctor.specialties.length > 0)
            score += 1;
        return Math.round((score / totalFields) * 100);
    }
    async create(createDoctorDto) {
        const { userId, specialties, keywords, ...doctorData } = createDoctorDto;
        const user = await this.prisma.user.findUnique({
            where: { id: userId },
            include: { doctor: true },
        });
        if (!user)
            throw new common_1.NotFoundException('User not found');
        if (user.doctor)
            throw new common_1.BadRequestException('User already has a doctor profile');
        const existingDoctor = await this.prisma.doctor.findFirst({
            where: {
                name: { equals: doctorData.name, mode: 'insensitive' },
                district: { equals: doctorData.district, mode: 'insensitive' },
            },
        });
        if (existingDoctor) {
            throw new common_1.BadRequestException('A doctor with this name already exists in this district. Please contact support.');
        }
        const slug = this.generateSlug(doctorData.name);
        const newDoctor = await this.prisma.doctor.create({
            data: {
                ...doctorData,
                slug,
                user: { connect: { id: userId } },
                specialties: {
                    connectOrCreate: specialties.map((sp) => ({
                        where: { slug: sp.toLowerCase().replace(/[^a-z0-9]+/g, '-') },
                        create: {
                            name: sp,
                            slug: sp.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
                        },
                    })),
                },
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
        const completeness = this.calculateProfileCompleteness(newDoctor);
        if (completeness !== newDoctor.profileCompletionPercentage) {
            return this.prisma.doctor.update({
                where: { id: newDoctor.id },
                data: { profileCompletionPercentage: completeness },
                include: { specialties: true, keywords: true },
            });
        }
        return newDoctor;
    }
    async findAll(filterDto) {
        const { search, district, specialty, emergencyAvailable, verificationStatus, page = 1, limit = 20, } = filterDto;
        const where = {};
        if (district)
            where.district = { equals: district, mode: 'insensitive' };
        if (emergencyAvailable !== undefined)
            where.emergencyAvailable = emergencyAvailable;
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
                { hospitalName: { contains: search, mode: 'insensitive' } },
                {
                    keywords: {
                        some: { term: { contains: search, mode: 'insensitive' } },
                    },
                },
            ];
        }
        const skip = (page - 1) * limit;
        const [doctors, total] = await Promise.all([
            this.prisma.doctor.findMany({
                where,
                skip,
                take: limit,
                include: { specialties: true },
                orderBy: { rating: 'desc' },
            }),
            this.prisma.doctor.count({ where }),
        ]);
        return {
            doctors,
            meta: {
                total,
                page,
                limit,
                totalPages: Math.ceil(total / limit),
            },
        };
    }
    async findOne(slug) {
        const doctor = await this.prisma.doctor.findUnique({
            where: { slug },
            include: { specialties: true, keywords: true },
        });
        if (!doctor)
            throw new common_1.NotFoundException(`Doctor with slug ${slug} not found`);
        return doctor;
    }
    async update(id, updateDoctorDto) {
        const { specialties, keywords, ...updateData } = updateDoctorDto;
        const doctor = await this.prisma.doctor.findUnique({ where: { id } });
        if (!doctor)
            throw new common_1.NotFoundException('Doctor not found');
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
        const updatedDoctor = await this.prisma.doctor.update({
            where: { id },
            data: updatePayload,
            include: { specialties: true, keywords: true },
        });
        const completeness = this.calculateProfileCompleteness(updatedDoctor);
        if (completeness !== updatedDoctor.profileCompletionPercentage) {
            return this.prisma.doctor.update({
                where: { id },
                data: { profileCompletionPercentage: completeness },
                include: { specialties: true, keywords: true },
            });
        }
        return updatedDoctor;
    }
    async remove(id) {
        const doctor = await this.prisma.doctor.findUnique({ where: { id } });
        if (!doctor)
            throw new common_1.NotFoundException('Doctor not found');
        await this.prisma.doctor.delete({ where: { id } });
        return { message: 'Doctor deleted successfully' };
    }
};
exports.DoctorsService = DoctorsService;
exports.DoctorsService = DoctorsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], DoctorsService);
//# sourceMappingURL=doctors.service.js.map