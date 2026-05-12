import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../../database/prisma.service';
import { UpdateUserProfileDto } from '../dto/dashboard.dto';

@Injectable()
export class UserDashboardService {
  constructor(private prisma: PrismaService) {}

  async getProfile(userId: string) {
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

    if (!user) throw new NotFoundException('User not found');

    return {
      profile: user,
      recentSearches: [], // Foundation for future analytics
      savedDoctors: [], // Foundation for future bookmarks
    };
  }

  async updateProfile(userId: string, updateDto: UpdateUserProfileDto) {
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
}
