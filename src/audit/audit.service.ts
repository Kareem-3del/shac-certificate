import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AuditLog } from './audit.entity';
import { User } from '../users/user.entity';

@Injectable()
export class AuditService {
  constructor(
    @InjectRepository(AuditLog)
    private auditRepository: Repository<AuditLog>,
  ) {}

  async log(
    action: string,
    entityType: string,
    entityId?: string,
    details?: string,
    changes?: any,
    user?: User,
    ipAddress?: string,
    userAgent?: string,
  ): Promise<AuditLog> {
    const auditLog = this.auditRepository.create({
      action,
      entity_type: entityType,
      entity_id: entityId,
      details,
      changes,
      user,
      ip_address: ipAddress,
      user_agent: userAgent,
    });

    return await this.auditRepository.save(auditLog);
  }

  async getRecentLogs(limit: number = 50): Promise<AuditLog[]> {
    return await this.auditRepository.find({
      relations: ['user'],
      order: { created_at: 'DESC' },
      take: limit,
    });
  }

  async getLogsByUser(userId: number, limit: number = 20): Promise<AuditLog[]> {
    return await this.auditRepository.find({
      where: { user_id: userId },
      relations: ['user'],
      order: { created_at: 'DESC' },
      take: limit,
    });
  }

  async getLogsByEntity(
    entityType: string,
    entityId: string,
    limit: number = 20,
  ): Promise<AuditLog[]> {
    return await this.auditRepository.find({
      where: { entity_type: entityType, entity_id: entityId },
      relations: ['user'],
      order: { created_at: 'DESC' },
      take: limit,
    });
  }

  async getLogsByAction(action: string, limit: number = 50): Promise<AuditLog[]> {
    return await this.auditRepository.find({
      where: { action },
      relations: ['user'],
      order: { created_at: 'DESC' },
      take: limit,
    });
  }

  async getStats(days: number = 30) {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const totalLogs = await this.auditRepository.count({
      where: {
        created_at: startDate,
      },
    });

    const actionStats = await this.auditRepository
      .createQueryBuilder('audit')
      .select('audit.action', 'action')
      .addSelect('COUNT(*)', 'count')
      .where('audit.created_at > :startDate', { startDate })
      .groupBy('audit.action')
      .orderBy('count', 'DESC')
      .getRawMany();

    const userStats = await this.auditRepository
      .createQueryBuilder('audit')
      .leftJoin('audit.user', 'user')
      .select('user.username', 'username')
      .addSelect('COUNT(*)', 'count')
      .where('audit.created_at > :startDate', { startDate })
      .andWhere('user.username IS NOT NULL')
      .groupBy('user.username')
      .orderBy('count', 'DESC')
      .limit(10)
      .getRawMany();

    return {
      totalLogs,
      actionStats,
      userStats,
      period: `Last ${days} days`,
    };
  }
}