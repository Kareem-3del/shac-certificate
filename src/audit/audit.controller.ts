import { Controller, Get, Query, Session, Res, HttpException, HttpStatus } from '@nestjs/common';
import { AuditService } from './audit.service';
import { Response } from 'express';
import { User } from '../users/user.entity';

@Controller('api/audit')
export class AuditController {
  constructor(private readonly auditService: AuditService) {}

  @Get('logs')
  async getLogs(
    @Query('limit') limit: string = '50',
    @Query('action') action?: string,
    @Session() session?: Record<string, any>,
  ) {
    const currentUser: User = session?.user;
    if (!currentUser || (currentUser.role !== 'admin' && currentUser.role !== 'moderator')) {
      throw new HttpException('Unauthorized', HttpStatus.FORBIDDEN);
    }

    if (action) {
      return await this.auditService.getLogsByAction(action, parseInt(limit));
    }

    return await this.auditService.getRecentLogs(parseInt(limit));
  }

  @Get('stats')
  async getStats(
    @Query('days') days: string = '30',
    @Session() session?: Record<string, any>,
  ) {
    const currentUser: User = session?.user;
    if (!currentUser || (currentUser.role !== 'admin' && currentUser.role !== 'moderator')) {
      throw new HttpException('Unauthorized', HttpStatus.FORBIDDEN);
    }

    return await this.auditService.getStats(parseInt(days));
  }

  @Get('user/:userId')
  async getUserLogs(
    @Query('userId') userId: string,
    @Query('limit') limit: string = '20',
    @Session() session?: Record<string, any>,
  ) {
    const currentUser: User = session?.user;
    if (!currentUser || (currentUser.role !== 'admin' && currentUser.role !== 'moderator')) {
      throw new HttpException('Unauthorized', HttpStatus.FORBIDDEN);
    }

    return await this.auditService.getLogsByUser(parseInt(userId), parseInt(limit));
  }
}