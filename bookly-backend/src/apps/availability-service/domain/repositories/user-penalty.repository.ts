import { RestrictionLevel, SanctionType } from '../../utils';
import { UserPenaltyEntity, UserPenaltyProps } from '../entities/user-penalty.entity';

/**
 * User Penalty Repository Interface - Domain Layer
 * Defines the contract for user penalty data access
 */
export interface UserPenaltyRepository {
  /**
   * Create a new user penalty
   */
  create(data: UserPenaltyProps): Promise<UserPenaltyEntity>;
  create(data: {
    userId: string;
    programId: string;
    penaltyId: string;
    penaltyEventId?: string;
    totalPoints: number;
    penaltyPoints: number;
    sanctionType: SanctionType;
    restrictionLevel: RestrictionLevel;
    startDate: Date;
    endDate?: Date;
    isActive: boolean;
    reason: string;
    appliedBy: string;
    notes?: string;
  }): Promise<UserPenaltyEntity>;

  /**
   * Find user penalty by ID
   */
  findById(id: string): Promise<UserPenaltyEntity | null>;

  /**
   * Find all penalties for a user
   */
  findByUserId(userId: string): Promise<UserPenaltyEntity[]>;

  /**
   * Find all penalties for a user in a specific program
   */
  findByUserAndProgram(userId: string, programId: string): Promise<UserPenaltyEntity[]>;

  /**
   * Find penalties by program
   */
  findByProgramId(programId: string): Promise<UserPenaltyEntity[]>;

  /**
   * Find penalties by penalty ID
   */
  findByPenaltyId(penaltyId: string): Promise<UserPenaltyEntity[]>;

  /**
   * Find penalties by penalty event ID
   */
  findByPenaltyEventId(penaltyEventId: string): Promise<UserPenaltyEntity[]>;

  /**
   * Find penalties by sanction type
   */
  findBySanctionType(sanctionType: SanctionType): Promise<UserPenaltyEntity[]>;

  /**
   * Find penalties by restriction level
   */
  findByRestrictionLevel(restrictionLevel: RestrictionLevel): Promise<UserPenaltyEntity[]>;

  /**
   * Find active penalties
   */
  findActivePenalties(): Promise<UserPenaltyEntity[]>;

  /**
   * Find active penalties for a user
   */
  findActiveByUserId(userId: string): Promise<UserPenaltyEntity[]>;

  /**
   * Find active penalties for a user in a specific program
   */
  findActiveByUserAndProgram(userId: string, programId: string): Promise<UserPenaltyEntity[]>;

  /**
   * Find inactive penalties
   */
  findInactivePenalties(): Promise<UserPenaltyEntity[]>;

  /**
   * Find expired penalties
   */
  findExpiredPenalties(): Promise<UserPenaltyEntity[]>;

  /**
   * Find penalties expiring soon
   */
  findExpiringPenalties(hoursBeforeExpiry: number): Promise<UserPenaltyEntity[]>;

  /**
   * Find permanent penalties
   */
  findPermanentPenalties(): Promise<UserPenaltyEntity[]>;

  /**
   * Find temporary penalties
   */
  findTemporaryPenalties(): Promise<UserPenaltyEntity[]>;

  /**
   * Find warning penalties
   */
  findWarningPenalties(): Promise<UserPenaltyEntity[]>;

  /**
   * Find penalties by date range
   */
  findByDateRange(startDate: Date, endDate: Date): Promise<UserPenaltyEntity[]>;

  /**
   * Find penalties applied by a specific user
   */
  findByAppliedBy(appliedBy: string): Promise<UserPenaltyEntity[]>;

  /**
   * Find penalties with high point values
   */
  findHighPointPenalties(threshold: number): Promise<UserPenaltyEntity[]>;

  /**
   * Update user penalty
   */
  update(id: string, updates: Partial<UserPenaltyEntity>): Promise<UserPenaltyEntity>;

  /**
   * Update multiple user penalties
   */
  updateMany(
    penaltyIds: string[],
    updates: Partial<UserPenaltyEntity>
  ): Promise<UserPenaltyEntity[]>;

  /**
   * Delete user penalty
   */
  delete(id: string): Promise<void>;

  /**
   * Delete all penalties for a user
   */
  deleteByUserId(userId: string): Promise<void>;

  /**
   * Delete all penalties for a program
   */
  deleteByProgramId(programId: string): Promise<void>;

  /**
   * Count penalties for a user
   */
  countByUserId(userId: string): Promise<number>;

  /**
   * Count active penalties for a user
   */
  countActiveByUserId(userId: string): Promise<number>;

  /**
   * Count penalties by program
   */
  countByProgramId(programId: string): Promise<number>;

  /**
   * Count penalties by sanction type
   */
  countBySanctionType(sanctionType: SanctionType): Promise<number>;

  /**
   * Deactivate penalty
   */
  deactivatePenalty(id: string, deactivatedBy: string, reason?: string): Promise<UserPenaltyEntity>;

  /**
   * Extend penalty duration
   */
  extendPenalty(
    id: string,
    additionalDays: number,
    extendedBy: string,
    reason: string
  ): Promise<UserPenaltyEntity>;

  /**
   * Reduce penalty duration
   */
  reducePenalty(
    id: string,
    reductionDays: number,
    reducedBy: string,
    reason: string
  ): Promise<UserPenaltyEntity>;

  /**
   * Add notes to penalty
   */
  addNotes(id: string, notes: string, addedBy: string): Promise<UserPenaltyEntity>;

  /**
   * Bulk deactivate expired penalties
   */
  bulkDeactivateExpiredPenalties(): Promise<UserPenaltyEntity[]>;

  /**
   * Get user's current penalty status
   */
  getUserPenaltyStatus(userId: string, programId: string): Promise<{
    hasActivePenalties: boolean;
    canMakeReservations: boolean;
    needsApprovalForReservations: boolean;
    canMakeAdvanceReservations: boolean;
    activePenalties: UserPenaltyEntity[];
    totalPenaltyPoints: number;
    highestRestrictionLevel: RestrictionLevel;
    mostSevereSanction: SanctionType;
  }>;

  /**
   * Get user penalty history
   */
  getUserPenaltyHistory(userId: string): Promise<{
    totalPenalties: number;
    activePenalties: number;
    expiredPenalties: number;
    totalPenaltyPoints: number;
    averagePenaltyDuration: number;
    penaltiesByType: Record<SanctionType, number>;
    penaltiesByRestriction: Record<RestrictionLevel, number>;
    recentPenalties: UserPenaltyEntity[];
  }>;

  /**
   * Get penalty statistics
   */
  getPenaltyStats(programId?: string): Promise<{
    totalPenalties: number;
    activePenalties: number;
    expiredPenalties: number;
    permanentPenalties: number;
    temporaryPenalties: number;
    warningPenalties: number;
    penaltiesBySanctionType: Record<SanctionType, number>;
    penaltiesByRestrictionLevel: Record<RestrictionLevel, number>;
    averagePenaltyDuration: number;
    averagePenaltyPoints: number;
    usersWithActivePenalties: number;
    usersWithMultiplePenalties: number;
    mostCommonReasons: Array<{ reason: string; count: number }>;
  }>;

  /**
   * Find users with multiple active penalties
   */
  findUsersWithMultiplePenalties(minPenalties: number): Promise<Array<{
    userId: string;
    penaltyCount: number;
    totalPoints: number;
    penalties: UserPenaltyEntity[];
  }>>;

  /**
   * Find users who can't make reservations
   */
  findUsersWithReservationRestrictions(): Promise<Array<{
    userId: string;
    restrictionLevel: RestrictionLevel;
    penalties: UserPenaltyEntity[];
  }>>;

  /**
   * Calculate total penalty points for a user
   */
  calculateUserPenaltyPoints(userId: string, programId: string): Promise<number>;

  /**
   * Check if user has specific restriction
   */
  hasRestriction(
    userId: string,
    programId: string,
    restrictionLevel: RestrictionLevel
  ): Promise<boolean>;

  /**
   * Get users affected by a penalty event
   */
  getUsersAffectedByPenaltyEvent(penaltyEventId: string): Promise<Array<{
    userId: string;
    penalty: UserPenaltyEntity;
  }>>;

  /**
   * Find penalties that need review (long duration, high points, etc.)
   */
  findPenaltiesNeedingReview(): Promise<UserPenaltyEntity[]>;
}
