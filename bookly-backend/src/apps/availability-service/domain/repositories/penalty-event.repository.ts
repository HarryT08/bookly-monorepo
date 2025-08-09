import { PenaltyEventEntity, PenaltyEventType } from '../entities/penalty-event.entity';

/**
 * Penalty Event Repository Interface - Domain Layer
 * Defines the contract for penalty event data access
 */
export interface PenaltyEventRepository {
  findByUserAndTimeRange(userId: string, arg1: Date, arg2: Date): Promise<PenaltyEventEntity[]>;
  /**
   * Create a new penalty event
   */
  create(data: {
    programId: string;
    eventType: PenaltyEventType;
    name: string;
    description: string;
    penaltyPoints: number;
    isActive: boolean;
    isCustom: boolean;
  }): Promise<PenaltyEventEntity>;

  /**
   * Find event by ID
   */
  findById(id: string): Promise<PenaltyEventEntity | null>;

  /**
   * Find all events for a program
   */
  findByProgramId(programId: string): Promise<PenaltyEventEntity[]>;

  /**
   * Find events by type
   */
  findByEventType(eventType: PenaltyEventType): Promise<PenaltyEventEntity[]>;

  /**
   * Find events by type for a specific program
   */
  findByProgramAndEventType(
    programId: string,
    eventType: PenaltyEventType
  ): Promise<PenaltyEventEntity[]>;

  /**
   * Find active events
   */
  findActiveEvents(): Promise<PenaltyEventEntity[]>;

  /**
   * Find active events for a program
   */
  findActiveByProgramId(programId: string): Promise<PenaltyEventEntity[]>;

  /**
   * Find inactive events
   */
  findInactiveEvents(): Promise<PenaltyEventEntity[]>;

  /**
   * Find system default events
   */
  findSystemDefaultEvents(): Promise<PenaltyEventEntity[]>;

  /**
   * Find custom events
   */
  findCustomEvents(): Promise<PenaltyEventEntity[]>;

  /**
   * Find custom events for a program
   */
  findCustomByProgramId(programId: string): Promise<PenaltyEventEntity[]>;

  /**
   * Find events by penalty points range
   */
  findByPenaltyPointsRange(
    minPoints: number,
    maxPoints: number
  ): Promise<PenaltyEventEntity[]>;

  /**
   * Find events with high penalty points
   */
  findHighPenaltyEvents(threshold: number): Promise<PenaltyEventEntity[]>;

  /**
   * Find events by name (search)
   */
  findByNameContaining(searchTerm: string): Promise<PenaltyEventEntity[]>;

  /**
   * Update event
   */
  update(id: string, updates: Partial<PenaltyEventEntity>): Promise<PenaltyEventEntity>;

  /**
   * Update multiple events
   */
  updateMany(
    eventIds: string[],
    updates: Partial<PenaltyEventEntity>
  ): Promise<PenaltyEventEntity[]>;

  /**
   * Delete event (only custom events can be deleted)
   */
  delete(id: string): Promise<void>;

  /**
   * Delete all custom events for a program
   */
  deleteCustomByProgramId(programId: string): Promise<void>;

  /**
   * Count events by program
   */
  countByProgramId(programId: string): Promise<number>;

  /**
   * Count active events by program
   */
  countActiveByProgramId(programId: string): Promise<number>;

  /**
   * Count custom events by program
   */
  countCustomByProgramId(programId: string): Promise<number>;

  /**
   * Activate event
   */
  activateEvent(id: string): Promise<PenaltyEventEntity>;

  /**
   * Deactivate event
   */
  deactivateEvent(id: string): Promise<PenaltyEventEntity>;

  /**
   * Bulk activate events
   */
  bulkActivateEvents(eventIds: string[]): Promise<PenaltyEventEntity[]>;

  /**
   * Bulk deactivate events
   */
  bulkDeactivateEvents(eventIds: string[]): Promise<PenaltyEventEntity[]>;

  /**
   * Find events that can be deleted (custom events only)
   */
  findDeletableEvents(): Promise<PenaltyEventEntity[]>;

  /**
   * Clone system default events for a new program
   */
  cloneSystemDefaultsForProgram(programId: string): Promise<PenaltyEventEntity[]>;

  /**
   * Get penalty event statistics
   */
  getPenaltyEventStats(programId?: string): Promise<{
    totalEvents: number;
    activeEvents: number;
    inactiveEvents: number;
    systemDefaultEvents: number;
    customEvents: number;
    averagePenaltyPoints: number;
    eventsByType: Record<PenaltyEventType, number>;
    eventsByPenaltyRange: {
      low: number; // 0-10 points
      medium: number; // 11-25 points
      high: number; // 26-50 points
      critical: number; // 51+ points
    };
  }>;

  /**
   * Find most used events (based on penalty applications)
   */
  findMostUsedEvents(limit?: number): Promise<Array<{
    event: PenaltyEventEntity;
    usageCount: number;
  }>>;

  /**
   * Find events that haven't been used
   */
  findUnusedEvents(): Promise<PenaltyEventEntity[]>;

  /**
   * Validate event configuration
   */
  validateEventConfiguration(eventData: {
    programId: string;
    eventType: PenaltyEventType;
    name: string;
    penaltyPoints: number;
  }): Promise<{
    isValid: boolean;
    errors: string[];
    warnings: string[];
  }>;
}
