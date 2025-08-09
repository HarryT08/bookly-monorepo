import { ReservationLimitEntity, LimitScope, LimitType, TimeWindow } from '../entities/reservation-limit.entity';

/**
 * Reservation Limit Repository Interface - Domain Layer
 * Defines the contract for reservation limit data access
 */
export interface ReservationLimitRepository {
  findByScopeAndId(scope: LimitScope, scopeId: string): Promise<ReservationLimitEntity[]>;
  findByScopeTypeAndId(scope: LimitScope, limitType: LimitType, scopeId: string): Promise<ReservationLimitEntity[]>;
  calculateUsage(userId: string, limitType: LimitType, scope: LimitScope, scopeId: string, start: Date, end: Date): Promise<number>;
  getUsageHistory(userId: string, limitType: LimitType, scope: LimitScope, scopeId: string, start: Date, end: Date): Promise<Array<{ date: Date; count: number; cumulativeCount: number }>>;
  findConflicting(scope: LimitScope, limitType: LimitType, scopeId: string): Promise<ReservationLimitEntity[]>;
  getAffectedUsers(scope: LimitScope, scopeId: string): string[];
  /**
   * Create a new reservation limit
   */
  create(data: {
    scope: LimitScope;
    programId?: string;
    resourceId?: string;
    userId?: string;
    limitType: LimitType;
    maxValue: number;
    timeWindow: TimeWindow;
    timeWindowValue: number;
    isActive: boolean;
    priority: number;
    description?: string;
  }): Promise<ReservationLimitEntity>;

  /**
   * Find limit by ID
   */
  findById(id: string): Promise<ReservationLimitEntity | null>;

  /**
   * Find limits by scope
   */
  findByScope(scope: LimitScope): Promise<ReservationLimitEntity[]>;

  /**
   * Find limits by limit type
   */
  findByLimitType(limitType: LimitType): Promise<ReservationLimitEntity[]>;

  /**
   * Find global limits
   */
  findGlobalLimits(): Promise<ReservationLimitEntity[]>;

  /**
   * Find limits for a program
   */
  findByProgramId(programId: string): Promise<ReservationLimitEntity[]>;

  /**
   * Find limits for a resource
   */
  findByResourceId(resourceId: string): Promise<ReservationLimitEntity[]>;

  /**
   * Find limits for a user
   */
  findByUserId(userId: string): Promise<ReservationLimitEntity[]>;

  /**
   * Find limits for a user in a specific program
   */
  findByUserAndProgram(userId: string, programId: string): Promise<ReservationLimitEntity[]>;

  /**
   * Find active limits
   */
  findActiveLimits(): Promise<ReservationLimitEntity[]>;

  /**
   * Find inactive limits
   */
  findInactiveLimits(): Promise<ReservationLimitEntity[]>;

  /**
   * Find applicable limits for a context
   */
  findApplicableLimits(context: {
    programId?: string;
    resourceId?: string;
    userId?: string;
    limitType?: LimitType;
  }): Promise<ReservationLimitEntity[]>;

  /**
   * Find the most restrictive limit for a context and limit type
   */
  findMostRestrictiveLimit(
    context: {
      programId?: string;
      resourceId?: string;
      userId?: string;
    },
    limitType: LimitType
  ): Promise<ReservationLimitEntity | null>;

  /**
   * Find limits by priority range
   */
  findByPriorityRange(minPriority: number, maxPriority: number): Promise<ReservationLimitEntity[]>;

  /**
   * Find limits with high priority
   */
  findHighPriorityLimits(threshold: number): Promise<ReservationLimitEntity[]>;

  /**
   * Find limits by time window
   */
  findByTimeWindow(timeWindow: TimeWindow): Promise<ReservationLimitEntity[]>;

  /**
   * Find limits by max value range
   */
  findByMaxValueRange(minValue: number, maxValue: number): Promise<ReservationLimitEntity[]>;

  /**
   * Update limit
   */
  update(id: string, updates: Partial<ReservationLimitEntity>): Promise<ReservationLimitEntity>;

  /**
   * Update multiple limits
   */
  updateMany(
    limitIds: string[],
    updates: Partial<ReservationLimitEntity>
  ): Promise<ReservationLimitEntity[]>;

  /**
   * Delete limit
   */
  delete(id: string): Promise<void>;

  /**
   * Delete all limits for a program
   */
  deleteByProgramId(programId: string): Promise<void>;

  /**
   * Delete all limits for a resource
   */
  deleteByResourceId(resourceId: string): Promise<void>;

  /**
   * Delete all limits for a user
   */
  deleteByUserId(userId: string): Promise<void>;

  /**
   * Count limits by scope
   */
  countByScope(scope: LimitScope): Promise<number>;

  /**
   * Count active limits
   */
  countActiveLimits(): Promise<number>;

  /**
   * Count limits by limit type
   */
  countByLimitType(limitType: LimitType): Promise<number>;

  /**
   * Activate limit
   */
  activateLimit(id: string): Promise<ReservationLimitEntity>;

  /**
   * Deactivate limit
   */
  deactivateLimit(id: string): Promise<ReservationLimitEntity>;

  /**
   * Bulk activate limits
   */
  bulkActivateLimits(limitIds: string[]): Promise<ReservationLimitEntity[]>;

  /**
   * Bulk deactivate limits
   */
  bulkDeactivateLimits(limitIds: string[]): Promise<ReservationLimitEntity[]>;

  /**
   * Create default global limits
   */
  createDefaultGlobalLimits(): Promise<ReservationLimitEntity[]>;

  /**
   * Create default program limits
   */
  createDefaultProgramLimits(programId: string): Promise<ReservationLimitEntity[]>;

  /**
   * Clone limits from one program to another
   */
  cloneProgramLimits(
    sourceProgramId: string,
    targetProgramId: string
  ): Promise<ReservationLimitEntity[]>;

  /**
   * Find conflicting limits (same scope, type, and context)
   */
  findConflictingLimits(
    scope: LimitScope,
    limitType: LimitType,
    context: {
      programId?: string;
      resourceId?: string;
      userId?: string;
    },
    excludeId?: string
  ): Promise<ReservationLimitEntity[]>;

  /**
   * Validate limit configuration
   */
  validateLimitConfiguration(limitData: {
    scope: LimitScope;
    limitType: LimitType;
    maxValue: number;
    timeWindow: TimeWindow;
    timeWindowValue: number;
    programId?: string;
    resourceId?: string;
    userId?: string;
  }): Promise<{
    isValid: boolean;
    errors: string[];
    warnings: string[];
    conflicts: ReservationLimitEntity[];
  }>;

  /**
   * Get effective limit for a user and context
   */
  getEffectiveLimit(
    userId: string,
    programId: string,
    resourceId: string,
    limitType: LimitType
  ): Promise<{
    limit: ReservationLimitEntity | null;
    effectiveValue: number;
    appliedScope: LimitScope;
    reasoning: string;
  }>;

  /**
   * Get limit statistics
   */
  getLimitStats(): Promise<{
    totalLimits: number;
    activeLimits: number;
    inactiveLimits: number;
    limitsByScope: Record<LimitScope, number>;
    limitsByType: Record<LimitType, number>;
    limitsByTimeWindow: Record<TimeWindow, number>;
    averageMaxValue: number;
    mostRestrictiveLimits: ReservationLimitEntity[];
    leastRestrictiveLimits: ReservationLimitEntity[];
  }>;

  /**
   * Find limits that are rarely used
   */
  findUnusedLimits(): Promise<ReservationLimitEntity[]>;

  /**
   * Find limits that are frequently exceeded
   */
  findFrequentlyExceededLimits(): Promise<Array<{
    limit: ReservationLimitEntity;
    exceedanceCount: number;
    lastExceeded: Date;
  }>>;

  /**
   * Get user limit usage
   */
  getUserLimitUsage(userId: string, programId: string): Promise<Array<{
    limitType: LimitType;
    currentUsage: number;
    maxValue: number;
    utilizationPercentage: number;
    isNearLimit: boolean;
    isExceeded: boolean;
  }>>;
}
