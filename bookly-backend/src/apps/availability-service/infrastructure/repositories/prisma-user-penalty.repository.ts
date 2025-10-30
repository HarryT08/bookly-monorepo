import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../../libs/common/services/prisma.service';
import { UserPenaltyRepository } from '../../domain/repositories/user-penalty.repository';
import { UserPenaltyEntity, UserPenaltyProps } from '../../domain/entities/user-penalty.entity';
import { SanctionType, RestrictionLevel } from '../../utils';

@Injectable()
export class PrismaUserPenaltyRepository implements UserPenaltyRepository {
  constructor(private readonly prisma: PrismaService) {}
  create(data: UserPenaltyProps): Promise<UserPenaltyEntity>;
  create(data: { userId: string; programId: string; penaltyId: string; penaltyEventId?: string; totalPoints: number; penaltyPoints: number; sanctionType: SanctionType; restrictionLevel: RestrictionLevel; startDate: Date; endDate?: Date; isActive: boolean; reason: string; appliedBy: string; notes?: string; }): Promise<UserPenaltyEntity>;
  create(data: unknown): Promise<UserPenaltyEntity> {
    throw new Error('Method not implemented.');
  }
  findByUserAndProgram(userId: string, programId: string): Promise<UserPenaltyEntity[]> {
    throw new Error('Method not implemented.');
  }
  findByProgramId(programId: string): Promise<UserPenaltyEntity[]> {
    throw new Error('Method not implemented.');
  }
  findByPenaltyId(penaltyId: string): Promise<UserPenaltyEntity[]> {
    throw new Error('Method not implemented.');
  }
  findByPenaltyEventId(penaltyEventId: string): Promise<UserPenaltyEntity[]> {
    throw new Error('Method not implemented.');
  }
  findBySanctionType(sanctionType: SanctionType): Promise<UserPenaltyEntity[]> {
    throw new Error('Method not implemented.');
  }
  findByRestrictionLevel(restrictionLevel: RestrictionLevel): Promise<UserPenaltyEntity[]> {
    throw new Error('Method not implemented.');
  }
  findActivePenalties(): Promise<UserPenaltyEntity[]> {
    throw new Error('Method not implemented.');
  }
  findActiveByUserAndProgram(userId: string, programId: string): Promise<UserPenaltyEntity[]> {
    throw new Error('Method not implemented.');
  }
  findInactivePenalties(): Promise<UserPenaltyEntity[]> {
    throw new Error('Method not implemented.');
  }
  findExpiredPenalties(): Promise<UserPenaltyEntity[]> {
    throw new Error('Method not implemented.');
  }
  findExpiringPenalties(hoursBeforeExpiry: number): Promise<UserPenaltyEntity[]> {
    throw new Error('Method not implemented.');
  }
  findPermanentPenalties(): Promise<UserPenaltyEntity[]> {
    throw new Error('Method not implemented.');
  }
  findTemporaryPenalties(): Promise<UserPenaltyEntity[]> {
    throw new Error('Method not implemented.');
  }
  findWarningPenalties(): Promise<UserPenaltyEntity[]> {
    throw new Error('Method not implemented.');
  }
  findByDateRange(startDate: Date, endDate: Date): Promise<UserPenaltyEntity[]> {
    throw new Error('Method not implemented.');
  }
  findByAppliedBy(appliedBy: string): Promise<UserPenaltyEntity[]> {
    throw new Error('Method not implemented.');
  }
  findHighPointPenalties(threshold: number): Promise<UserPenaltyEntity[]> {
    throw new Error('Method not implemented.');
  }
  update(id: string, updates: Partial<UserPenaltyEntity>): Promise<UserPenaltyEntity> {
    throw new Error('Method not implemented.');
  }
  updateMany(penaltyIds: string[], updates: Partial<UserPenaltyEntity>): Promise<UserPenaltyEntity[]> {
    throw new Error('Method not implemented.');
  }
  deleteByUserId(userId: string): Promise<void> {
    throw new Error('Method not implemented.');
  }
  deleteByProgramId(programId: string): Promise<void> {
    throw new Error('Method not implemented.');
  }
  countByUserId(userId: string): Promise<number> {
    throw new Error('Method not implemented.');
  }
  countActiveByUserId(userId: string): Promise<number> {
    throw new Error('Method not implemented.');
  }
  countByProgramId(programId: string): Promise<number> {
    throw new Error('Method not implemented.');
  }
  countBySanctionType(sanctionType: SanctionType): Promise<number> {
    throw new Error('Method not implemented.');
  }
  deactivatePenalty(id: string, deactivatedBy: string, reason?: string): Promise<UserPenaltyEntity> {
    throw new Error('Method not implemented.');
  }
  extendPenalty(id: string, additionalDays: number, extendedBy: string, reason: string): Promise<UserPenaltyEntity> {
    throw new Error('Method not implemented.');
  }
  reducePenalty(id: string, reductionDays: number, reducedBy: string, reason: string): Promise<UserPenaltyEntity> {
    throw new Error('Method not implemented.');
  }
  addNotes(id: string, notes: string, addedBy: string): Promise<UserPenaltyEntity> {
    throw new Error('Method not implemented.');
  }
  bulkDeactivateExpiredPenalties(): Promise<UserPenaltyEntity[]> {
    throw new Error('Method not implemented.');
  }
  getUserPenaltyStatus(userId: string, programId: string): Promise<{ hasActivePenalties: boolean; canMakeReservations: boolean; needsApprovalForReservations: boolean; canMakeAdvanceReservations: boolean; activePenalties: UserPenaltyEntity[]; totalPenaltyPoints: number; highestRestrictionLevel: RestrictionLevel; mostSevereSanction: SanctionType; }> {
    throw new Error('Method not implemented.');
  }
  getUserPenaltyHistory(userId: string): Promise<{ totalPenalties: number; activePenalties: number; expiredPenalties: number; totalPenaltyPoints: number; averagePenaltyDuration: number; penaltiesByType: Record<SanctionType, number>; penaltiesByRestriction: Record<RestrictionLevel, number>; recentPenalties: UserPenaltyEntity[]; }> {
    throw new Error('Method not implemented.');
  }
  getPenaltyStats(programId?: string): Promise<{ totalPenalties: number; activePenalties: number; expiredPenalties: number; permanentPenalties: number; temporaryPenalties: number; warningPenalties: number; penaltiesBySanctionType: Record<SanctionType, number>; penaltiesByRestrictionLevel: Record<RestrictionLevel, number>; averagePenaltyDuration: number; averagePenaltyPoints: number; usersWithActivePenalties: number; usersWithMultiplePenalties: number; mostCommonReasons: Array<{ reason: string; count: number; }>; }> {
    throw new Error('Method not implemented.');
  }
  findUsersWithMultiplePenalties(minPenalties: number): Promise<Array<{ userId: string; penaltyCount: number; totalPoints: number; penalties: UserPenaltyEntity[]; }>> {
    throw new Error('Method not implemented.');
  }
  findUsersWithReservationRestrictions(): Promise<Array<{ userId: string; restrictionLevel: RestrictionLevel; penalties: UserPenaltyEntity[]; }>> {
    throw new Error('Method not implemented.');
  }
  calculateUserPenaltyPoints(userId: string, programId: string): Promise<number> {
    throw new Error('Method not implemented.');
  }
  hasRestriction(userId: string, programId: string, restrictionLevel: RestrictionLevel): Promise<boolean> {
    throw new Error('Method not implemented.');
  }
  getUsersAffectedByPenaltyEvent(penaltyEventId: string): Promise<Array<{ userId: string; penalty: UserPenaltyEntity; }>> {
    throw new Error('Method not implemented.');
  }
  findPenaltiesNeedingReview(): Promise<UserPenaltyEntity[]> {
    throw new Error('Method not implemented.');
  }

  async findById(id: string): Promise<UserPenaltyEntity | null> {
    const userPenalty = await this.prisma.userPenalty.findUnique({
      where: { id },
      include: {
        user: true,
        penalty: true,
        program: true,
        appliedByUser: true
      }
    });

    if (!userPenalty) return null;

    return this.toDomainEntity(userPenalty);
  }

  private toDomainEntity(userPenalty: any): UserPenaltyEntity {
    return UserPenaltyEntity.fromPersistence({
      id: userPenalty.id,
      userId: userPenalty.userId,
      programId: userPenalty.programId,
      penaltyId: userPenalty.penaltyId,
      penaltyEventId: userPenalty.programId, // Use programId as fallback
      totalPoints: 0, // Default value - not in schema
      penaltyPoints: 0, // Default value - not in schema
      sanctionType: 'WARNING' as any, // Default value - not in schema
      restrictionLevel: 'MINIMAL' as any, // Default value - not in schema
      startDate: userPenalty.appliedAt,
      endDate: userPenalty.expiresAt,
      isActive: userPenalty.isActive,
      reason: userPenalty.reason || '',
      appliedBy: userPenalty.appliedBy,
      notes: userPenalty.notes,
      createdAt: userPenalty.createdAt,
      updatedAt: userPenalty.updatedAt
    });
  }

  async findAll(filters?: any): Promise<UserPenaltyEntity[]> {
    const userPenalties = await this.prisma.userPenalty.findMany({
      where: filters,
      include: {
        user: true,
        penalty: true,
        program: true,
        appliedByUser: true
      },
      orderBy: { appliedAt: 'desc' }
    });

    return userPenalties.map(userPenalty => this.toDomainEntity(userPenalty));
  }

  async save(entity: UserPenaltyEntity): Promise<UserPenaltyEntity> {
    const data = {
      userId: entity.userId,
      penaltyId: entity.penaltyId,
      programId: entity.penaltyEventId, // Use programId field
      appliedBy: entity.appliedBy,
      appliedAt: entity.startDate,
      expiresAt: entity.endDate,
      isActive: entity.isActive,
      isManual: false, // Default value
      reason: entity.reason,
      notes: entity.notes || ''
    };

    if (entity.id) {
      const updated = await this.prisma.userPenalty.update({
        where: { id: entity.id },
        data,
        include: {
          user: true,
          penalty: true,
          program: true,
          appliedByUser: true
        }
      });
      return entity;
    } else {
      const created = await this.prisma.userPenalty.create({
        data,
        include: {
          user: true,
          penalty: true,
          program: true,
          appliedByUser: true
        }
      });
      // Return new entity with updated data instead of mutating readonly properties
      return this.toDomainEntity(created);
    }
  }

  async delete(id: string): Promise<void> {
    await this.prisma.userPenalty.delete({
      where: { id }
    });
  }

  async findByUserId(userId: string): Promise<UserPenaltyEntity[]> {
    return this.findAll({ userId });
  }

  async findActiveByUserId(userId: string): Promise<UserPenaltyEntity[]> {
    return this.findAll({ 
      userId, 
      isActive: true,
      expiresAt: { gte: new Date() }
    });
  }

  async findExpired(): Promise<UserPenaltyEntity[]> {
    return this.findAll({
      isActive: true,
      expiresAt: { lt: new Date() }
    });
  }

  async deactivateExpired(): Promise<void> {
    await this.prisma.userPenalty.updateMany({
      where: {
        isActive: true,
        expiresAt: { lt: new Date() }
      },
      data: { isActive: false }
    });
  }
}
