import { Controller, Post, Body, Get, Patch, Param, Request, UseGuards } from '@nestjs/common';
import { QueueService } from './queue.service';
import { GenerateOnlineTokenDto, GenerateWalkInTokenDto } from './dto/generate-token.dto';
import { UpdateQueueStatusDto, UpdateTokenStatusDto } from './dto/update-queue.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';

@Controller('queue')
@UseGuards(JwtAuthGuard)
export class QueueController {
  constructor(private readonly queueService: QueueService) {}

  @Post('token/online')
  async generateOnlineToken(@Request() req: any, @Body() dto: GenerateOnlineTokenDto) {
    return this.queueService.generateOnlineToken(req.user.id, dto);
  }

  @Post('token/walk-in')
  @UseGuards(RolesGuard)
  @Roles('DOCTOR', 'ADMIN') // Receptionist would typically have a specific role, assuming DOCTOR/ADMIN for now
  async generateWalkInToken(@Body() dto: GenerateWalkInTokenDto) {
    return this.queueService.generateWalkInToken(dto);
  }

  @Get('doctor/today')
  @UseGuards(RolesGuard)
  @Roles('DOCTOR')
  async getDoctorLiveQueue(@Request() req: any) {
    return this.queueService.getDoctorLiveQueue(req.user.id);
  }

  @Patch(':id/status')
  @UseGuards(RolesGuard)
  @Roles('DOCTOR')
  async updateQueueStatus(
    @Request() req: any,
    @Param('id') queueId: string,
    @Body() dto: UpdateQueueStatusDto
  ) {
    return this.queueService.updateQueueStatus(queueId, req.user.id, dto);
  }

  @Patch('token/:tokenId/status')
  @UseGuards(RolesGuard)
  @Roles('DOCTOR')
  async updateTokenStatus(
    @Request() req: any,
    @Param('tokenId') tokenId: string,
    @Body() dto: UpdateTokenStatusDto
  ) {
    return this.queueService.updateTokenStatus(tokenId, req.user.id, dto);
  }
}
