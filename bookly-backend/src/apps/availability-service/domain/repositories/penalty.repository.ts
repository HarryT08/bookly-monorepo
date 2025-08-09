import { SanctionType, RestrictionLevel } from '../../utils';
import { PenaltyEventType } from '../entities/penalty-event.entity';
import { PenaltyEntity } from '../entities/penalty.entity';

/**
 * Penalty Repository Interface - Domain Layer
 * Defines the contract for penalty data access
 */
export interface PenaltyRepository {
  findByEventTypeAndProgram(eventType: PenaltyEventType, programId: string): Promise<PenaltyEntity[]>;
  /**
   * Create a new penalty
   */
  create(data: {
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
  }): Promise<PenaltyEntity>;

  /**
   * Find penalty by ID
   */
  findById(id: string): Promise<PenaltyEntity | null>;

  /**
   * Find all penalties for a program
   */
  findByProgramId(programId: string): Promise<PenaltyEntity[]>;

  /**
   * Find penalties by sanction type
   */
  findBySanctionType(sanctionType: SanctionType): Promise<PenaltyEntity[]>;

  /**
   * Find penalties by restriction level
   */
  findByRestrictionLevel(restrictionLevel: RestrictionLevel): Promise<PenaltyEntity[]>;

  /**
   * Find active penalties
   */
  findActiveePenalties(): Promise<PenaltyEntity[]>;

  /**
   * Find active penalties for a program
   */
  findActiveByProgramId(programId: string): Promise<PenaltyEntity[]>;

  /**
   * Find inactive penalties
   */
  findInactivePenalties(): Promise<PenaltyEntity[]>;

  /**
   * Find system default penalties
   */
  findSystemDefaultPenalties(): Promise<PenaltyEntity[]>;

  /**
   * Find custom penalties
   */
  findCustomPenalties(): Promise<PenaltyEntity[]>;

  /**
   * Find custom penalties for a program
   */
  findCustomByProgramId(programId: string): Promise<PenaltyEntity[]>;

  /**
   * Find penalty that applies to a specific point value
   */
  findApplicablePenalty(programId: string, points: number): Promise<PenaltyEntity | null>;

  /**
   * Find all penalties that apply to a point range
   */
  findApplicablePenalties(programId: string, points: number): Promise<PenaltyEntity[]>;

  /**
   * Find penalties by point range
   */
  findByPointRange(minPoints: number, maxPoints: number): Promise<PenaltyEntity[]>;

  /**
   * Find temporary penalties
   */
  findTemporaryPenalties(): Promise<PenaltyEntity[]>;

  /**
   * Find permanent penalties
   */
  findPermanentPenalties(): Promise<PenaltyEntity[]>;

  /**
   * Find penalties by severity level
   */
  findBySeverityLevel(severityLevel: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL'): Promise<PenaltyEntity[]>;

  /**
   * Find penalties by name (search)
   */
  findByNameContaining(searchTerm: string): Promise<PenaltyEntity[]>;

  /**
   * Update penalty
   */
  update(id: string, updates: Partial<PenaltyEntity>): Promise<PenaltyEntity>;

  /**
   * Update multiple penalties
   */
  updateMany(
    penaltyIds: string[],
    updates: Partial<PenaltyEntity>
  ): Promise<PenaltyEntity[]>;

  /**
   * Delete penalty (only custom penalties can be deleted)
   */
  delete(id: string): Promise<void>;

  /**
   * Delete all custom penalties for a program
   */
  deleteCustomByProgramId(programId: string): Promise<void>;

  /**
   * Count penalties by program
   */
  countByProgramId(programId: string): Promise<number>;

  /**
   * Count active penalties by program
   */
  countActiveByProgramId(programId: string): Promise<number>;

  /**
   * Count custom penalties by program
   */
  countCustomByProgramId(programId: string): Promise<number>;

  /**
   * Activate penalty
   */
  activatePenalty(id: string): Promise<PenaltyEntity>;

  /**
   * Deactivate penalty
   */
  deactivatePenalty(id: string): Promise<PenaltyEntity>;

  /**
   * Bulk activate penalties
   */
  bulkActivatePenalties(penaltyIds: string[]): Promise<PenaltyEntity[]>;

  /**
   * Bulk deactivate penalties
   */
  bulkDeactivatePenalties(penaltyIds: string[]): Promise<PenaltyEntity[]>;

  /**
   * Find penalties that can be deleted (custom penalties only)
   */
  findDeletablePenalties(): Promise<PenaltyEntity[]>;

  /**
   * Clone system default penalties for a new program
   */
  cloneSystemDefaultsForProgram(programId: string): Promise<PenaltyEntity[]>;

  /**
   * Validate penalty configuration
   */
  validatePenaltyConfiguration(penaltyData: {
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
  }>;

  /**
   * Find overlapping penalties (same point range)
   */
  findOverlappingPenalties(
    programId: string,
    minPoints: number,
    maxPoints: number,
    excludeId?: string
  ): Promise<PenaltyEntity[]>;

  /**
   * Get penalty statistics
   */
  getPenaltyStats(programId?: string): Promise<{
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
  }>;

  /**
   * Find most applied penalties (based on user penalty applications)
   */
  findMostAppliedPenalties(limit?: number): Promise<Array<{
    penalty: PenaltyEntity;
    applicationCount: number;
  }>>;

  /**
   * Find penalties that haven't been applied
   */
  findUnappliedPenalties(): Promise<PenaltyEntity[]>;

  /**
   * Get recommended penalty for a point value
   */
  getRecommendedPenalty(
    programId: string,
    points: number
  ): Promise<{
    recommendedPenalty: PenaltyEntity | null;
    alternativePenalties: PenaltyEntity[];
    reasoning: string;
  }>;
}
