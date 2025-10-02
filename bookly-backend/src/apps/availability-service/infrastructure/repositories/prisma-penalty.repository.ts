import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../../libs/common/services/prisma.service';
import { PenaltyRepository } from '../../domain/repositories/penalty.repository';
import { PenaltyEntity } from '../../domain/entities/penalty.entity';
import { SanctionType } from '../../utils/sanction-type.enum';
import { RestrictionLevel } from '../../utils/restriction-level.enum';
import { PenaltyEventType } from '../../domain/entities/penalty-event.entity';
import { RestrictionLevelPenalty } from '../../utils/restriction-level-penalty.enum';

@Injectable()
export class PrismaPenaltyRepository implements PenaltyRepository {
  constructor(private readonly prisma: PrismaService) {}

  private toDomainEntity(penalty: any): PenaltyEntity {
    return PenaltyEntity.fromPersistence({
      id: penalty.id,
      programId: penalty.programId,
      name: penalty.name,
      description: penalty.description || '',
      // Map Prisma fields to domain entity fields with defaults
      minPoints: 0, // Not stored in Prisma, use default
      maxPoints: penalty.maxQuantity || 100, // Map maxQuantity to maxPoints
      sanctionType: this.mapPenaltyTypeToSanctionType(penalty.penaltyType),
      sanctionDuration: penalty.duration || 0,
      restrictionLevel: RestrictionLevelPenalty.LIMITED_RESERVATIONS, // Default restriction - mapped to domain type
      isActive: !penalty.isDeleted, // Map isDeleted to isActive (inverted)
      isCustom: penalty.canBeDeleted, // Map canBeDeleted to isCustom
      createdAt: penalty.createdAt,
      updatedAt: penalty.updatedAt
    });
  }

  private mapPenaltyTypeToSanctionType(penaltyType: string): SanctionType {
    switch (penaltyType) {
      case 'NO_RESERVATIONS':
        return SanctionType.FULL_SUSPENSION;
      case 'NO_RECURRING':
        return SanctionType.PARTIAL_SUSPENSION;
      case 'NO_PRIORITY_UPGRADE':
        return SanctionType.TEMPORARY_SUSPENSION;
      case 'FORCE_PARTICULAR_PRIORITY':
        return SanctionType.WARNING;
      default:
        return SanctionType.WARNING;
    }
  }

  private mapSanctionTypeToPenaltyType(sanctionType: SanctionType): string {
    switch (sanctionType) {
      case SanctionType.FULL_SUSPENSION:
        return 'NO_RESERVATIONS';
      case SanctionType.PARTIAL_SUSPENSION:
        return 'NO_RECURRING';
      case SanctionType.TEMPORARY_SUSPENSION:
        return 'NO_PRIORITY_UPGRADE';
      case SanctionType.WARNING:
        return 'FORCE_PARTICULAR_PRIORITY';
      case SanctionType.PERMANENT_SUSPENSION:
        return 'NO_RESERVATIONS';
      default:
        return 'FORCE_PARTICULAR_PRIORITY';
    }
  }

  async findByEventTypeAndProgram(eventType: PenaltyEventType, programId: string): Promise<PenaltyEntity[]> {
    const penalties = await this.prisma.penalty.findMany({
      where: {
        programId,
        isDeleted: false
      }
    });

    return penalties.map(penalty => this.toDomainEntity(penalty));
  }

  async create(data: {
    programId: string;
    name: string;
    description: string;
    minPoints: number;
    maxPoints: number;
    sanctionType: SanctionType;
    sanctionDuration: number;
    restrictionLevel: RestrictionLevel;
    isActive: boolean;
    isCustom: boolean;
  }): Promise<PenaltyEntity> {
    const created = await this.prisma.penalty.create({
      data: {
        programId: data.programId,
        name: data.name,
        description: data.description,
        penaltyType: this.mapSanctionTypeToPenaltyType(data.sanctionType),
        isPartial: data.sanctionType === SanctionType.PARTIAL_SUSPENSION,
        duration: data.sanctionDuration,
        maxQuantity: data.maxPoints,
        canBeDeleted: data.isCustom,
        isDeleted: !data.isActive
      }
    });

    return this.toDomainEntity(created);
  }

  async findById(id: string): Promise<PenaltyEntity | null> {
    const penalty = await this.prisma.penalty.findUnique({
      where: { id, isDeleted: false }
    });

    if (!penalty) return null;
    return this.toDomainEntity(penalty);
  }

  async findByProgramId(programId: string): Promise<PenaltyEntity[]> {
    const penalties = await this.prisma.penalty.findMany({
      where: { programId, isDeleted: false }
    });

    return penalties.map(penalty => this.toDomainEntity(penalty));
  }

  async findBySanctionType(sanctionType: SanctionType): Promise<PenaltyEntity[]> {
    const penaltyType = this.mapSanctionTypeToPenaltyType(sanctionType);
    const penalties = await this.prisma.penalty.findMany({
      where: { penaltyType, isDeleted: false }
    });

    return penalties.map(penalty => this.toDomainEntity(penalty));
  }

  async findByRestrictionLevel(restrictionLevel: RestrictionLevel): Promise<PenaltyEntity[]> {
    // Since restriction level is not stored in Prisma, return all penalties
    const penalties = await this.prisma.penalty.findMany({
      where: { isDeleted: false }
    });

    return penalties.map(penalty => this.toDomainEntity(penalty));
  }

  async findActiveePenalties(): Promise<PenaltyEntity[]> {
    const penalties = await this.prisma.penalty.findMany({
      where: { isDeleted: false }
    });

    return penalties.map(penalty => this.toDomainEntity(penalty));
  }

  async findActiveByProgramId(programId: string): Promise<PenaltyEntity[]> {
    const penalties = await this.prisma.penalty.findMany({
      where: { programId, isDeleted: false }
    });

    return penalties.map(penalty => this.toDomainEntity(penalty));
  }

  async findInactivePenalties(): Promise<PenaltyEntity[]> {
    const penalties = await this.prisma.penalty.findMany({
      where: { isDeleted: true }
    });

    return penalties.map(penalty => this.toDomainEntity(penalty));
  }

  async findSystemDefaultPenalties(): Promise<PenaltyEntity[]> {
    const penalties = await this.prisma.penalty.findMany({
      where: { canBeDeleted: false, isDeleted: false }
    });

    return penalties.map(penalty => this.toDomainEntity(penalty));
  }

  async findCustomPenalties(): Promise<PenaltyEntity[]> {
    const penalties = await this.prisma.penalty.findMany({
      where: { canBeDeleted: true, isDeleted: false }
    });

    return penalties.map(penalty => this.toDomainEntity(penalty));
  }

  async findCustomByProgramId(programId: string): Promise<PenaltyEntity[]> {
    const penalties = await this.prisma.penalty.findMany({
      where: { programId, canBeDeleted: true, isDeleted: false }
    });

    return penalties.map(penalty => this.toDomainEntity(penalty));
  }

  async findApplicablePenalty(programId: string, points: number): Promise<PenaltyEntity | null> {
    const penalties = await this.findApplicablePenalties(programId, points);
    return penalties.length > 0 ? penalties[0] : null;
  }

  async findApplicablePenalties(programId: string, points: number): Promise<PenaltyEntity[]> {
    const penalties = await this.prisma.penalty.findMany({
      where: { programId, isDeleted: false }
    });

    return penalties
      .map(penalty => this.toDomainEntity(penalty))
      .filter(penalty => penalty.appliesTo(points));
  }

  async findByPointRange(minPoints: number, maxPoints: number): Promise<PenaltyEntity[]> {
    const penalties = await this.prisma.penalty.findMany({
      where: { isDeleted: false }
    });

    return penalties
      .map(penalty => this.toDomainEntity(penalty))
      .filter(penalty => penalty.minPoints >= minPoints && penalty.maxPoints <= maxPoints);
  }

  async findTemporaryPenalties(): Promise<PenaltyEntity[]> {
    const penalties = await this.prisma.penalty.findMany({
      where: { 
        isDeleted: false,
        duration: { gt: 0 }
      }
    });

    return penalties.map(penalty => this.toDomainEntity(penalty));
  }

  async findPermanentPenalties(): Promise<PenaltyEntity[]> {
    const penalties = await this.prisma.penalty.findMany({
      where: { 
        isDeleted: false,
        duration: null
      }
    });

    return penalties.map(penalty => this.toDomainEntity(penalty));
  }

  async findBySeverityLevel(severityLevel: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL'): Promise<PenaltyEntity[]> {
    const penalties = await this.prisma.penalty.findMany({
      where: { isDeleted: false }
    });

    return penalties
      .map(penalty => this.toDomainEntity(penalty))
      .filter(penalty => penalty.getSeverityLevel() === severityLevel);
  }

  async findByNameContaining(searchTerm: string): Promise<PenaltyEntity[]> {
    const penalties = await this.prisma.penalty.findMany({
      where: { 
        name: { contains: searchTerm, mode: 'insensitive' },
        isDeleted: false
      }
    });

    return penalties.map(penalty => this.toDomainEntity(penalty));
  }

  async update(id: string, updates: Partial<PenaltyEntity>): Promise<PenaltyEntity> {
    const updateData: any = {};
    
    if (updates.name !== undefined) updateData.name = updates.name;
    if (updates.description !== undefined) updateData.description = updates.description;
    if (updates.sanctionDuration !== undefined) updateData.duration = updates.sanctionDuration;
    if (updates.maxPoints !== undefined) updateData.maxQuantity = updates.maxPoints;
    if (updates.isActive !== undefined) updateData.isDeleted = !updates.isActive;
    if (updates.isCustom !== undefined) updateData.canBeDeleted = updates.isCustom;

    const updated = await this.prisma.penalty.update({
      where: { id },
      data: updateData
    });

    return this.toDomainEntity(updated);
  }

  async updateMany(penaltyIds: string[], updates: Partial<PenaltyEntity>): Promise<PenaltyEntity[]> {
    const results: PenaltyEntity[] = [];
    
    for (const id of penaltyIds) {
      const updated = await this.update(id, updates);
      results.push(updated);
    }
    
    return results;
  }

  async delete(id: string): Promise<void> {
    await this.prisma.penalty.update({
      where: { id },
      data: { isDeleted: true }
    });
  }

  async deleteCustomByProgramId(programId: string): Promise<void> {
    await this.prisma.penalty.updateMany({
      where: { programId, canBeDeleted: true },
      data: { isDeleted: true }
    });
  }

  async countByProgramId(programId: string): Promise<number> {
    return this.prisma.penalty.count({
      where: { programId, isDeleted: false }
    });
  }

  async countActiveByProgramId(programId: string): Promise<number> {
    return this.prisma.penalty.count({
      where: { programId, isDeleted: false }
    });
  }

  async countCustomByProgramId(programId: string): Promise<number> {
    return this.prisma.penalty.count({
      where: { programId, canBeDeleted: true, isDeleted: false }
    });
  }

  async activatePenalty(id: string): Promise<PenaltyEntity> {
    const updated = await this.prisma.penalty.update({
      where: { id },
      data: { isDeleted: false }
    });

    return this.toDomainEntity(updated);
  }

  async deactivatePenalty(id: string): Promise<PenaltyEntity> {
    const updated = await this.prisma.penalty.update({
      where: { id },
      data: { isDeleted: true }
    });

    return this.toDomainEntity(updated);
  }

  async bulkActivatePenalties(penaltyIds: string[]): Promise<PenaltyEntity[]> {
    const results: PenaltyEntity[] = [];
    
    for (const id of penaltyIds) {
      const activated = await this.activatePenalty(id);
      results.push(activated);
    }
    
    return results;
  }

  async bulkDeactivatePenalties(penaltyIds: string[]): Promise<PenaltyEntity[]> {
    const results: PenaltyEntity[] = [];
    
    for (const id of penaltyIds) {
      const deactivated = await this.deactivatePenalty(id);
      results.push(deactivated);
    }
    
    return results;
  }

  async findDeletablePenalties(): Promise<PenaltyEntity[]> {
    return this.findCustomPenalties();
  }

  async cloneSystemDefaultsForProgram(programId: string): Promise<PenaltyEntity[]> {
    const systemDefaults = await this.findSystemDefaultPenalties();
    const results: PenaltyEntity[] = [];
    
    for (const penalty of systemDefaults) {
      const cloned = await this.create({
        programId,
        name: penalty.name,
        description: penalty.description,
        minPoints: penalty.minPoints,
        maxPoints: penalty.maxPoints,
        sanctionType: penalty.sanctionType,
        sanctionDuration: penalty.sanctionDuration,
        restrictionLevel: penalty.restrictionLevel as any as RestrictionLevel,
        isActive: penalty.isActive,
        isCustom: true
      });
      results.push(cloned);
    }
    
    return results;
  }

  async validatePenaltyConfiguration(penaltyData: {
    programId: string;
    minPoints: number;
    maxPoints: number;
    sanctionType: SanctionType;
    sanctionDuration: number;
    restrictionLevel: RestrictionLevel;
  }): Promise<{
    isValid: boolean;
    errors: string[];
    warnings: string[];
    conflicts: PenaltyEntity[];
  }> {
    const errors: string[] = [];
    const warnings: string[] = [];
    
    if (penaltyData.minPoints < 0) {
      errors.push('Minimum points cannot be negative');
    }
    
    if (penaltyData.maxPoints < penaltyData.minPoints) {
      errors.push('Maximum points must be greater than or equal to minimum points');
    }
    
    if (penaltyData.sanctionDuration < 0) {
      errors.push('Sanction duration cannot be negative');
    }
    
    const conflicts = await this.findOverlappingPenalties(
      penaltyData.programId,
      penaltyData.minPoints,
      penaltyData.maxPoints
    );
    
    if (conflicts.length > 0) {
      warnings.push(`Found ${conflicts.length} overlapping penalties`);
    }
    
    return {
      isValid: errors.length === 0,
      errors,
      warnings,
      conflicts
    };
  }

  async findOverlappingPenalties(
    programId: string,
    minPoints: number,
    maxPoints: number,
    excludeId?: string
  ): Promise<PenaltyEntity[]> {
    const penalties = await this.findByProgramId(programId);
    
    return penalties.filter(penalty => {
      if (excludeId && penalty.id === excludeId) return false;
      
      return (
        (penalty.minPoints <= maxPoints && penalty.maxPoints >= minPoints) ||
        (minPoints <= penalty.maxPoints && maxPoints >= penalty.minPoints)
      );
    });
  }

  async getPenaltyStats(programId?: string): Promise<{
    totalPenalties: number;
    activePenalties: number;
    inactivePenalties: number;
    systemDefaultPenalties: number;
    customPenalties: number;
    penaltiesBySanctionType: Record<SanctionType, number>;
    penaltiesByRestrictionLevel: Record<RestrictionLevel, number>;
    penaltiesBySeverity: {
      low: number;
      medium: number;
      high: number;
      critical: number;
    };
    averageDuration: number;
    pointRangeCoverage: {
      minCoveredPoints: number;
      maxCoveredPoints: number;
      gaps: Array<{ start: number; end: number }>;
    };
  }> {
    const where = programId ? { programId } : {};
    
    const [total, active, inactive, systemDefaults, custom] = await Promise.all([
      this.prisma.penalty.count({ where: { ...where, isDeleted: false } }),
      this.prisma.penalty.count({ where: { ...where, isDeleted: false } }),
      this.prisma.penalty.count({ where: { ...where, isDeleted: true } }),
      this.prisma.penalty.count({ where: { ...where, canBeDeleted: false, isDeleted: false } }),
      this.prisma.penalty.count({ where: { ...where, canBeDeleted: true, isDeleted: false } })
    ]);
    
    const penalties = await this.prisma.penalty.findMany({
      where: { ...where, isDeleted: false }
    });
    
    const penaltyEntities = penalties.map(p => this.toDomainEntity(p));
    
    const penaltiesBySanctionType = {} as Record<SanctionType, number>;
    const penaltiesByRestrictionLevel = {} as Record<RestrictionLevel, number>;
    const penaltiesBySeverity = { low: 0, medium: 0, high: 0, critical: 0 };
    
    let totalDuration = 0;
    let minPoints = Number.MAX_VALUE;
    let maxPoints = Number.MIN_VALUE;
    
    penaltyEntities.forEach(penalty => {
      penaltiesBySanctionType[penalty.sanctionType] = (penaltiesBySanctionType[penalty.sanctionType] || 0) + 1;
      penaltiesByRestrictionLevel[penalty.restrictionLevel] = (penaltiesByRestrictionLevel[penalty.restrictionLevel] || 0) + 1;
      
      const severity = penalty.getSeverityLevel().toLowerCase() as keyof typeof penaltiesBySeverity;
      penaltiesBySeverity[severity]++;
      
      totalDuration += penalty.sanctionDuration;
      minPoints = Math.min(minPoints, penalty.minPoints);
      maxPoints = Math.max(maxPoints, penalty.maxPoints);
    });
    
    return {
      totalPenalties: total,
      activePenalties: active,
      inactivePenalties: inactive,
      systemDefaultPenalties: systemDefaults,
      customPenalties: custom,
      penaltiesBySanctionType,
      penaltiesByRestrictionLevel,
      penaltiesBySeverity,
      averageDuration: penaltyEntities.length > 0 ? totalDuration / penaltyEntities.length : 0,
      pointRangeCoverage: {
        minCoveredPoints: minPoints === Number.MAX_VALUE ? 0 : minPoints,
        maxCoveredPoints: maxPoints === Number.MIN_VALUE ? 0 : maxPoints,
        gaps: [] // Complex calculation, simplified for now
      }
    };
  }

  async findMostAppliedPenalties(limit = 10): Promise<Array<{
    penalty: PenaltyEntity;
    applicationCount: number;
  }>> {
    // This would require joining with UserPenalty table
    // For now, return empty array
    return [];
  }

  async findUnappliedPenalties(): Promise<PenaltyEntity[]> {
    // This would require joining with UserPenalty table
    // For now, return all penalties
    return this.findActiveePenalties();
  }

  async getRecommendedPenalty(
    programId: string,
    points: number
  ): Promise<{
    recommendedPenalty: PenaltyEntity | null;
    alternativePenalties: PenaltyEntity[];
    reasoning: string;
  }> {
    const applicablePenalties = await this.findApplicablePenalties(programId, points);
    
    if (applicablePenalties.length === 0) {
      return {
        recommendedPenalty: null,
        alternativePenalties: [],
        reasoning: 'No penalties apply to the given point value'
      };
    }
    
    // Sort by severity level (most severe first)
    applicablePenalties.sort((a, b) => {
      const severityOrder = { 'CRITICAL': 4, 'HIGH': 3, 'MEDIUM': 2, 'LOW': 1 };
      return severityOrder[b.getSeverityLevel() as keyof typeof severityOrder] - 
             severityOrder[a.getSeverityLevel() as keyof typeof severityOrder];
    });
    
    return {
      recommendedPenalty: applicablePenalties[0],
      alternativePenalties: applicablePenalties.slice(1),
      reasoning: `Selected penalty with highest severity level (${applicablePenalties[0].getSeverityLevel()}) for ${points} points`
    };
  }
}
