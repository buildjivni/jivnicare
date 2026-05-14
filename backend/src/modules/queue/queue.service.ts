import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { GenerateOnlineTokenDto, GenerateWalkInTokenDto } from './dto/generate-token.dto';
import { UpdateQueueStatusDto, UpdateTokenStatusDto } from './dto/update-queue.dto';
import { DailyQueue } from '@prisma/client';

@Injectable()
export class QueueService {
  constructor(private prisma: PrismaService) {}

  async getOrCreateDailyQueue(doctorId: string, date: Date): Promise<DailyQueue> {
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
      // Create new queue if it doesn't exist
      const doctor = await this.prisma.doctor.findUnique({ where: { id: doctorId } });
      if (!doctor) throw new NotFoundException('Doctor not found');

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

  async generateOnlineToken(userId: string, dto: GenerateOnlineTokenDto) {
    const today = new Date();
    const queue = await this.getOrCreateDailyQueue(dto.doctorId, today);

    if (queue.status === 'FULL' || queue.status === 'COMPLETED') {
      throw new BadRequestException(`Queue is currently ${queue.status}`);
    }

    return this.prisma.$transaction(async (tx) => {
      // Concurrency lock is not available in raw SQL for MongoDB.
      // We rely on standard Prisma transaction atomicity.

      // Check capacity
      const currentTokenCount = await tx.queueToken.count({ where: { queueId: queue.id } });
      if (currentTokenCount >= queue.maxCapacity) {
        // Auto-mark FULL if capacity reached
        await tx.dailyQueue.update({
          where: { id: queue.id },
          data: { status: 'FULL' }
        });
        throw new BadRequestException('Queue capacity has been reached for today.');
      }

      // Check if user already has an active token in this queue
      const existingToken = await tx.queueToken.findFirst({
        where: {
          queueId: queue.id,
          userId: userId,
          status: { in: ['WAITING', 'IN_CONSULTATION'] }
        }
      });

      if (existingToken) {
        throw new BadRequestException('You already have an active token in this queue.');
      }

      // Find max token number
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

  async generateWalkInToken(dto: GenerateWalkInTokenDto) {
    const today = new Date();
    const queue = await this.getOrCreateDailyQueue(dto.doctorId, today);

    if (queue.status === 'COMPLETED') {
      throw new BadRequestException('Queue is completed for today.');
    }

    return this.prisma.$transaction(async (tx) => {
      // Concurrency lock is not available in raw SQL for MongoDB.

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

  async getDoctorLiveQueue(doctorUserId: string) {
    const doctor = await this.prisma.doctor.findUnique({ where: { userId: doctorUserId } });
    if (!doctor) throw new NotFoundException('Doctor profile not found');
    
    return this.getOrCreateDailyQueue(doctor.id, new Date());
  }

  async updateQueueStatus(queueId: string, doctorUserId: string, dto: UpdateQueueStatusDto) {
    const queue = await this.prisma.dailyQueue.findUnique({
      where: { id: queueId },
      include: { doctor: true }
    });

    if (!queue || queue.doctor.userId !== doctorUserId) {
      throw new BadRequestException('Queue not found or permission denied');
    }

    return this.prisma.dailyQueue.update({
      where: { id: queueId },
      data: dto
    });
  }

  async updateTokenStatus(tokenId: string, doctorUserId: string, dto: UpdateTokenStatusDto) {
    const token = await this.prisma.queueToken.findUnique({
      where: { id: tokenId },
      include: { queue: { include: { doctor: true } } }
    });

    if (!token || token.queue.doctor.userId !== doctorUserId) {
      throw new BadRequestException('Token not found or permission denied');
    }

    // If marking as COMPLETED, increment the queue's currentActiveToken
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
}
