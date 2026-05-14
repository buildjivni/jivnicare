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
exports.QueueService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../database/prisma.service");
let QueueService = class QueueService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async getOrCreateDailyQueue(doctorId, date) {
        const startOfDay = new Date(date);
        startOfDay.setHours(0, 0, 0, 0);
        let queue = await this.prisma.dailyQueue.findUnique({
            where: {
                doctorId_date: {
                    doctorId,
                    date: startOfDay,
                },
            },
            include: {
                tokens: {
                    include: {
                        user: { select: { id: true, name: true, phone: true } },
                        walkInEntry: true
                    },
                    orderBy: { tokenIssuedAt: 'asc' }
                }
            }
        });
        if (!queue) {
            const doctor = await this.prisma.doctor.findUnique({ where: { id: doctorId } });
            if (!doctor)
                throw new common_1.NotFoundException('Doctor not found');
            queue = await this.prisma.dailyQueue.create({
                data: {
                    doctorId,
                    date: startOfDay,
                    status: 'ACTIVE',
                    maxCapacity: doctor.maxAppointmentsPerDay > 0 ? doctor.maxAppointmentsPerDay : 50,
                },
                include: {
                    tokens: {
                        include: {
                            user: { select: { id: true, name: true, phone: true } },
                            walkInEntry: true
                        },
                        orderBy: { tokenIssuedAt: 'asc' }
                    }
                }
            });
        }
        return queue;
    }
    async generateOnlineToken(userId, dto) {
        const today = new Date();
        const queue = await this.getOrCreateDailyQueue(dto.doctorId, today);
        if (queue.status === 'FULL' || queue.status === 'COMPLETED') {
            throw new common_1.BadRequestException(`Queue is currently ${queue.status}`);
        }
        return this.prisma.$transaction(async (tx) => {
            const currentTokenCount = await tx.queueToken.count({ where: { queueId: queue.id } });
            if (currentTokenCount >= queue.maxCapacity) {
                await tx.dailyQueue.update({
                    where: { id: queue.id },
                    data: { status: 'FULL' }
                });
                throw new common_1.BadRequestException('Queue capacity has been reached for today.');
            }
            const existingToken = await tx.queueToken.findFirst({
                where: {
                    queueId: queue.id,
                    userId: userId,
                    status: { in: ['WAITING', 'IN_CONSULTATION'] }
                }
            });
            if (existingToken) {
                throw new common_1.BadRequestException('You already have an active token in this queue.');
            }
            const maxToken = await tx.queueToken.aggregate({
                where: { queueId: queue.id },
                _max: { tokenNumber: true }
            });
            const nextTokenNumber = (maxToken._max.tokenNumber || 0) + 1;
            const token = await tx.queueToken.create({
                data: {
                    queueId: queue.id,
                    tokenNumber: nextTokenNumber,
                    source: 'ONLINE',
                    userId: userId,
                    status: 'WAITING'
                },
                include: { user: { select: { id: true, name: true, phone: true } } }
            });
            return token;
        });
    }
    async generateWalkInToken(dto) {
        const today = new Date();
        const queue = await this.getOrCreateDailyQueue(dto.doctorId, today);
        if (queue.status === 'COMPLETED') {
            throw new common_1.BadRequestException('Queue is completed for today.');
        }
        return this.prisma.$transaction(async (tx) => {
            const walkInEntry = await tx.walkInEntry.create({
                data: {
                    patientName: dto.patientName,
                    phoneNumber: dto.phoneNumber,
                    symptoms: dto.symptoms
                }
            });
            const maxToken = await tx.queueToken.aggregate({
                where: { queueId: queue.id },
                _max: { tokenNumber: true }
            });
            const nextTokenNumber = (maxToken._max.tokenNumber || 0) + 1;
            const token = await tx.queueToken.create({
                data: {
                    queueId: queue.id,
                    tokenNumber: nextTokenNumber,
                    source: 'WALK_IN',
                    walkInEntryId: walkInEntry.id,
                    status: 'WAITING'
                },
                include: { walkInEntry: true }
            });
            return token;
        });
    }
    async getDoctorLiveQueue(doctorUserId) {
        const doctor = await this.prisma.doctor.findUnique({ where: { userId: doctorUserId } });
        if (!doctor)
            throw new common_1.NotFoundException('Doctor profile not found');
        return this.getOrCreateDailyQueue(doctor.id, new Date());
    }
    async updateQueueStatus(queueId, doctorUserId, dto) {
        const queue = await this.prisma.dailyQueue.findUnique({
            where: { id: queueId },
            include: { doctor: true }
        });
        if (!queue || queue.doctor.userId !== doctorUserId) {
            throw new common_1.BadRequestException('Queue not found or permission denied');
        }
        return this.prisma.dailyQueue.update({
            where: { id: queueId },
            data: dto
        });
    }
    async updateTokenStatus(tokenId, doctorUserId, dto) {
        const token = await this.prisma.queueToken.findUnique({
            where: { id: tokenId },
            include: { queue: { include: { doctor: true } } }
        });
        if (!token || token.queue.doctor.userId !== doctorUserId) {
            throw new common_1.BadRequestException('Token not found or permission denied');
        }
        if (dto.status === 'COMPLETED') {
            await this.prisma.dailyQueue.update({
                where: { id: token.queueId },
                data: { currentActiveToken: Math.max(token.queue.currentActiveToken, token.tokenNumber) }
            });
        }
        return this.prisma.queueToken.update({
            where: { id: tokenId },
            data: { status: dto.status },
            include: {
                user: { select: { id: true, name: true, phone: true } },
                walkInEntry: true
            }
        });
    }
};
exports.QueueService = QueueService;
exports.QueueService = QueueService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], QueueService);
//# sourceMappingURL=queue.service.js.map