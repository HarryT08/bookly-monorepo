/**
 * Reservation Limit Entity
 * Represents configurable limits for reservations at different scopes (global, program, resource, user)
 */

export interface ReservationLimitProps {
  id: string;
  
  // Scope configuration
  scope: LimitScope;
  scopeId: string;
  programId?: string; // Required for PROGRAM and USER scopes
  resourceId?: string; // Required for RESOURCE scope
  userId?: string; // Required for USER scope
  
  // Limit configuration
  limitType: LimitType;
  maxValue: number;
  timeWindow: TimeWindow;
  timeWindowValue: number; // Number of days/weeks/months for the time window
  
  // Status and metadata
  isActive: boolean;
  priority: number; // Higher priority limits override lower priority ones
  description?: string;
  
  // Timestamps
  createdAt: Date;
  updatedAt: Date;
  createdBy?: string;
  overrides?: string[];
}

export enum LimitScope {
  GLOBAL = 'GLOBAL', // System-wide default
  PROGRAM = 'PROGRAM', // Per academic program
  RESOURCE = 'RESOURCE', // Per specific resource
  USER = 'USER' // Per specific user
}

export enum LimitType {
  ACTIVE_RESERVATIONS = 'ACTIVE_RESERVATIONS', // Max concurrent active reservations
  DAILY_RESERVATIONS = 'DAILY_RESERVATIONS', // Max reservations per day
  WEEKLY_RESERVATIONS = 'WEEKLY_RESERVATIONS', // Max reservations per week
  MONTHLY_RESERVATIONS = 'MONTHLY_RESERVATIONS', // Max reservations per month
  RECURRING_RESERVATIONS = 'RECURRING_RESERVATIONS', // Max active recurring reservations
  ADVANCE_BOOKING_DAYS = 'ADVANCE_BOOKING_DAYS', // Max days in advance for booking
  RESERVATION_DURATION = 'RESERVATION_DURATION', // Max duration per reservation in hours
  DAILY_DURATION = 'DAILY_DURATION', // Max total duration per day in hours
  WEEKLY_DURATION = 'WEEKLY_DURATION', // Max total duration per week in hours
  CONCURRENT_RESERVATIONS = "CONCURRENT_RESERVATIONS",
  TOTAL_HOURS_PER_WEEK = "TOTAL_HOURS_PER_WEEK",
  TOTAL_HOURS_PER_MONTH = "TOTAL_HOURS_PER_MONTH"
}

export enum TimeWindow {
  ROLLING = 'ROLLING', // Rolling time window (e.g., last 7 days)
  CALENDAR = 'CALENDAR' // Calendar-based window (e.g., current week/month)
}

export class ReservationLimitEntity {
  scopeId(userId: string, limitType: LimitType, scope: LimitScope, scopeId: any): string {
      switch (scope) {
        case LimitScope.GLOBAL:
          return 'GLOBAL';
        case LimitScope.PROGRAM:
          return scopeId;
        case LimitScope.RESOURCE:
          return scopeId;
        case LimitScope.USER:
          return scopeId;
      }
  }
  getDescription(): string {
      throw new Error('Method not implemented.');
  }
  private constructor(private readonly props: ReservationLimitProps) {}

  static create(props: Omit<ReservationLimitProps, 'id' | 'createdAt' | 'updatedAt'>): ReservationLimitEntity {
    const now = new Date();
    return new ReservationLimitEntity({
      ...props,
      id: '', // Will be set by repository
      createdAt: now,
      updatedAt: now,
      isActive: props.isActive !== undefined ? props.isActive : true,
      priority: props.priority || 0,
      timeWindowValue: props.timeWindowValue || 1
    });
  }

  static fromPersistence(props: ReservationLimitProps): ReservationLimitEntity {
    return new ReservationLimitEntity(props);
  }

  // Getters
  get id(): string { return this.props.id; }
  get scope(): LimitScope { return this.props.scope; }
  get programId(): string | undefined { return this.props.programId; }
  get resourceId(): string | undefined { return this.props.resourceId; }
  get userId(): string | undefined { return this.props.userId; }
  get limitType(): LimitType { return this.props.limitType; }
  get maxValue(): number { return this.props.maxValue; }
  get timeWindow(): TimeWindow { return this.props.timeWindow; }
  get timeWindowValue(): number { return this.props.timeWindowValue; }
  get isActive(): boolean { return this.props.isActive; }
  get priority(): number { return this.props.priority; }
  get description(): string | undefined { return this.props.description; }
  get createdAt(): Date { return this.props.createdAt; }
  get updatedAt(): Date { return this.props.updatedAt; }

  // Business logic methods

  /**
   * Validates if the reservation limit configuration is valid
   */
  validate(): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];

    // Validate scope-specific requirements
    if (this.props.scope === LimitScope.PROGRAM && !this.props.programId) {
      errors.push('Program ID is required for PROGRAM scope');
    }

    if (this.props.scope === LimitScope.RESOURCE && !this.props.resourceId) {
      errors.push('Resource ID is required for RESOURCE scope');
    }

    if (this.props.scope === LimitScope.USER && !this.props.userId) {
      errors.push('User ID is required for USER scope');
    }

    if (this.props.scope === LimitScope.USER && !this.props.programId) {
      errors.push('Program ID is required for USER scope');
    }

    // Validate limit values
    if (this.props.maxValue < 0) {
      errors.push('Max value cannot be negative');
    }

    if (this.props.timeWindowValue < 1) {
      errors.push('Time window value must be at least 1');
    }

    if (this.props.priority < 0) {
      errors.push('Priority cannot be negative');
    }

    // Validate specific limit types
    if (this.props.limitType === LimitType.ADVANCE_BOOKING_DAYS && this.props.maxValue > 365) {
      errors.push('Advance booking days cannot exceed 365');
    }

    if (this.props.limitType === LimitType.RESERVATION_DURATION && this.props.maxValue > 24) {
      errors.push('Reservation duration cannot exceed 24 hours');
    }

    if (this.props.limitType === LimitType.DAILY_DURATION && this.props.maxValue > 24) {
      errors.push('Daily duration cannot exceed 24 hours');
    }

    if (this.props.limitType === LimitType.WEEKLY_DURATION && this.props.maxValue > 168) {
      errors.push('Weekly duration cannot exceed 168 hours');
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  /**
   * Updates the limit configuration
   */
  update(updates: Partial<Pick<ReservationLimitProps, 'maxValue' | 'timeWindow' | 'timeWindowValue' | 'isActive' | 'priority' | 'description'>>): void {
    if (updates.maxValue !== undefined) {
      if (updates.maxValue < 0) {
        throw new Error('Max value cannot be negative');
      }
      this.props.maxValue = updates.maxValue;
    }

    if (updates.timeWindow !== undefined) {
      this.props.timeWindow = updates.timeWindow;
    }

    if (updates.timeWindowValue !== undefined) {
      if (updates.timeWindowValue < 1) {
        throw new Error('Time window value must be at least 1');
      }
      this.props.timeWindowValue = updates.timeWindowValue;
    }

    if (updates.isActive !== undefined) {
      this.props.isActive = updates.isActive;
    }

    if (updates.priority !== undefined) {
      if (updates.priority < 0) {
        throw new Error('Priority cannot be negative');
      }
      this.props.priority = updates.priority;
    }

    if (updates.description !== undefined) {
      this.props.description = updates.description;
    }

    this.props.updatedAt = new Date();
  }

  /**
   * Activates the limit
   */
  activate(): void {
    this.props.isActive = true;
    this.props.updatedAt = new Date();
  }

  /**
   * Deactivates the limit
   */
  deactivate(): void {
    this.props.isActive = false;
    this.props.updatedAt = new Date();
  }

  /**
   * Checks if this limit applies to a specific context
   */
  appliesTo(context: {
    programId?: string;
    resourceId?: string;
    userId?: string;
  }): boolean {
    if (!this.props.isActive) {
      return false;
    }

    switch (this.props.scope) {
      case LimitScope.GLOBAL:
        return true;

      case LimitScope.PROGRAM:
        return this.props.programId === context.programId;

      case LimitScope.RESOURCE:
        return this.props.resourceId === context.resourceId;

      case LimitScope.USER:
        return this.props.userId === context.userId && 
               this.props.programId === context.programId;

      default:
        return false;
    }
  }

  /**
   * Gets the scope description
   */
  getScopeDescription(): string {
    switch (this.props.scope) {
      case LimitScope.GLOBAL:
        return 'Global (system-wide)';
      case LimitScope.PROGRAM:
        return `Program: ${this.props.programId}`;
      case LimitScope.RESOURCE:
        return `Resource: ${this.props.resourceId}`;
      case LimitScope.USER:
        return `User: ${this.props.userId} in Program: ${this.props.programId}`;
      default:
        return 'Unknown scope';
    }
  }

  /**
   * Gets the limit type description
   */
  getLimitTypeDescription(): string {
    const descriptions = {
      [LimitType.ACTIVE_RESERVATIONS]: 'Active reservations',
      [LimitType.DAILY_RESERVATIONS]: 'Daily reservations',
      [LimitType.WEEKLY_RESERVATIONS]: 'Weekly reservations',
      [LimitType.MONTHLY_RESERVATIONS]: 'Monthly reservations',
      [LimitType.RECURRING_RESERVATIONS]: 'Recurring reservations',
      [LimitType.ADVANCE_BOOKING_DAYS]: 'Advance booking days',
      [LimitType.RESERVATION_DURATION]: 'Reservation duration (hours)',
      [LimitType.DAILY_DURATION]: 'Daily duration (hours)',
      [LimitType.WEEKLY_DURATION]: 'Weekly duration (hours)'
    };

    return descriptions[this.props.limitType] || 'Unknown limit type';
  }

  /**
   * Gets the time window description
   */
  getTimeWindowDescription(): string {
    if (this.props.limitType === LimitType.ACTIVE_RESERVATIONS ||
        this.props.limitType === LimitType.RECURRING_RESERVATIONS ||
        this.props.limitType === LimitType.ADVANCE_BOOKING_DAYS ||
        this.props.limitType === LimitType.RESERVATION_DURATION) {
      return 'N/A';
    }

    const windowType = this.props.timeWindow === TimeWindow.ROLLING ? 'rolling' : 'calendar';
    
    if (this.props.limitType === LimitType.DAILY_RESERVATIONS || 
        this.props.limitType === LimitType.DAILY_DURATION) {
      return `${this.props.timeWindowValue} day(s) - ${windowType}`;
    }

    if (this.props.limitType === LimitType.WEEKLY_RESERVATIONS || 
        this.props.limitType === LimitType.WEEKLY_DURATION) {
      return `${this.props.timeWindowValue} week(s) - ${windowType}`;
    }

    if (this.props.limitType === LimitType.MONTHLY_RESERVATIONS) {
      return `${this.props.timeWindowValue} month(s) - ${windowType}`;
    }

    return 'Unknown time window';
  }

  /**
   * Gets the full limit description
   */
  getFullDescription(): string {
    const typeDesc = this.getLimitTypeDescription();
    const maxValue = this.props.maxValue;
    const timeWindow = this.getTimeWindowDescription();
    
    if (timeWindow === 'N/A') {
      return `Maximum ${maxValue} ${typeDesc.toLowerCase()}`;
    }

    return `Maximum ${maxValue} ${typeDesc.toLowerCase()} per ${timeWindow}`;
  }

  /**
   * Compares priority with another limit (higher number = higher priority)
   */
  hasHigherPriorityThan(other: ReservationLimitEntity): boolean {
    return this.props.priority > other.props.priority;
  }

  /**
   * Creates a global default limit
   */
  static createGlobalDefault(
    limitType: LimitType,
    maxValue: number,
    timeWindow: TimeWindow = TimeWindow.ROLLING,
    timeWindowValue: number = 1,
    createdBy: string = 'SYSTEM',
    description?: string,
  ): ReservationLimitEntity {
    return ReservationLimitEntity.create({
      scope: LimitScope.GLOBAL,
      scopeId: 'GLOBAL',
      limitType,
      maxValue,
      timeWindow,
      timeWindowValue,
      isActive: true,
      priority: 1,
      description,
      createdBy
    });
  }

  /**
   * Creates a program-specific limit
   */
  static createProgramLimit(
    programId: string,
    limitType: LimitType,
    maxValue: number,
    timeWindow: TimeWindow = TimeWindow.ROLLING,
    timeWindowValue: number = 1,
    createdBy: string,
    description?: string,
  ): ReservationLimitEntity {
    return ReservationLimitEntity.create({
      scope: LimitScope.PROGRAM,
      scopeId: programId,
      programId,
      limitType,
      maxValue,
      timeWindow,
      timeWindowValue,
      isActive: true,
      priority: 2,
      description,
      createdBy
    });
  }

  /**
   * Creates a resource-specific limit
   */
  static createResourceLimit(
    resourceId: string,
    limitType: LimitType,
    maxValue: number,
    timeWindow: TimeWindow = TimeWindow.ROLLING,
    timeWindowValue: number = 1,
    createdBy: string,
    description?: string,
  ): ReservationLimitEntity {
    return ReservationLimitEntity.create({
      scope: LimitScope.RESOURCE,
      scopeId: resourceId,
      resourceId,
      limitType,
      maxValue,
      timeWindow,
      timeWindowValue,
      isActive: true,
      priority: 3,
      description,
      createdBy
    });
  }

  /**
   * Creates a user-specific limit
   */
  static createUserLimit(
    userId: string,
    programId: string,
    limitType: LimitType,
    maxValue: number,
    timeWindow: TimeWindow = TimeWindow.ROLLING,
    timeWindowValue: number = 1,
    createdBy: string,
    description?: string,
  ): ReservationLimitEntity {
    return ReservationLimitEntity.create({
      scope: LimitScope.USER,
      scopeId: userId,
      userId,
      programId,
      limitType,
      maxValue,
      timeWindow,
      timeWindowValue,
      isActive: true,
      priority: 4,
      description,
      createdBy
    });
  }

  // Conversion methods
  toPersistence(): ReservationLimitProps {
    return { ...this.props };
  }

  toJSON() {
    return {
      id: this.props.id,
      scope: this.props.scope,
      programId: this.props.programId,
      resourceId: this.props.resourceId,
      userId: this.props.userId,
      limitType: this.props.limitType,
      maxValue: this.props.maxValue,
      timeWindow: this.props.timeWindow,
      timeWindowValue: this.props.timeWindowValue,
      isActive: this.props.isActive,
      priority: this.props.priority,
      description: this.props.description,
      createdAt: this.props.createdAt,
      updatedAt: this.props.updatedAt,
      scopeDescription: this.getScopeDescription(),
      limitTypeDescription: this.getLimitTypeDescription(),
      timeWindowDescription: this.getTimeWindowDescription(),
      fullDescription: this.getFullDescription()
    };
  }
}
