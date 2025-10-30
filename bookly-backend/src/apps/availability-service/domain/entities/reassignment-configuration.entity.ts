/**
 * Reassignment Configuration Entity
 * Represents configurable settings for the reassignment algorithm and process
 */

export interface ReassignmentConfigurationProps {
  id: string;
  programId: string;
  
  // Algorithm configuration
  defaultCapacityTolerance: number; // Default percentage tolerance for capacity differences
  maxSuggestions: number; // Maximum number of alternative resources to suggest
  prioritizeByDistance: boolean; // Whether to prioritize resources by physical distance
  prioritizeByAvailability: boolean; // Whether to prioritize resources with more availability
  
  // Time limits
  defaultResponseTimeHours: number; // Default time limit for user response
  urgentResponseTimeHours: number; // Time limit for urgent reassignments
  reminderIntervalHours: number; // How often to send reminders
  
  // Notification settings
  enableEmailNotifications: boolean;
  enableSmsNotifications: boolean;
  enablePushNotifications: boolean;
  escalateToSupervisor: boolean; // Whether to escalate to supervisor after timeout
  
  // Auto-approval settings
  enableAutoApproval: boolean;
  autoApprovalThresholdHours: number; // Hours before event when auto-approval kicks in
  autoApprovalOnlyForEquivalent: boolean; // Only auto-approve for equivalent resources
  
  // Penalty settings
  applyPenaltyForRejection: boolean;
  rejectionPenaltyPoints: number;
  maxRejectionsBeforePenalty: number;
  
  // Status
  isActive: boolean;
  
  // Timestamps
  createdAt: Date;
  updatedAt: Date;
}

export class ReassignmentConfigurationEntity {
  private constructor(private readonly props: ReassignmentConfigurationProps) {}

  static create(props: Omit<ReassignmentConfigurationProps, 'id' | 'createdAt' | 'updatedAt'>): ReassignmentConfigurationEntity {
    const now = new Date();
    return new ReassignmentConfigurationEntity({
      ...props,
      id: '', // Will be set by repository
      createdAt: now,
      updatedAt: now,
      isActive: props.isActive !== undefined ? props.isActive : true
    });
  }

  static fromPersistence(props: ReassignmentConfigurationProps): ReassignmentConfigurationEntity {
    return new ReassignmentConfigurationEntity(props);
  }

  // Getters
  get id(): string { return this.props.id; }
  get programId(): string { return this.props.programId; }
  get defaultCapacityTolerance(): number { return this.props.defaultCapacityTolerance; }
  get maxSuggestions(): number { return this.props.maxSuggestions; }
  get prioritizeByDistance(): boolean { return this.props.prioritizeByDistance; }
  get prioritizeByAvailability(): boolean { return this.props.prioritizeByAvailability; }
  get defaultResponseTimeHours(): number { return this.props.defaultResponseTimeHours; }
  get urgentResponseTimeHours(): number { return this.props.urgentResponseTimeHours; }
  get reminderIntervalHours(): number { return this.props.reminderIntervalHours; }
  get enableEmailNotifications(): boolean { return this.props.enableEmailNotifications; }
  get enableSmsNotifications(): boolean { return this.props.enableSmsNotifications; }
  get enablePushNotifications(): boolean { return this.props.enablePushNotifications; }
  get escalateToSupervisor(): boolean { return this.props.escalateToSupervisor; }
  get enableAutoApproval(): boolean { return this.props.enableAutoApproval; }
  get autoApprovalThresholdHours(): number { return this.props.autoApprovalThresholdHours; }
  get autoApprovalOnlyForEquivalent(): boolean { return this.props.autoApprovalOnlyForEquivalent; }
  get applyPenaltyForRejection(): boolean { return this.props.applyPenaltyForRejection; }
  get rejectionPenaltyPoints(): number { return this.props.rejectionPenaltyPoints; }
  get maxRejectionsBeforePenalty(): number { return this.props.maxRejectionsBeforePenalty; }
  get isActive(): boolean { return this.props.isActive; }
  get createdAt(): Date { return this.props.createdAt; }
  get updatedAt(): Date { return this.props.updatedAt; }

  // Business logic methods

  /**
   * Validates if the configuration is valid
   */
  validate(): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (!this.props.programId) {
      errors.push('Program ID is required');
    }

    if (this.props.defaultCapacityTolerance < 0 || this.props.defaultCapacityTolerance > 100) {
      errors.push('Default capacity tolerance must be between 0 and 100 percent');
    }

    if (this.props.maxSuggestions < 1 || this.props.maxSuggestions > 20) {
      errors.push('Max suggestions must be between 1 and 20');
    }

    if (this.props.defaultResponseTimeHours < 1 || this.props.defaultResponseTimeHours > 168) {
      errors.push('Default response time must be between 1 and 168 hours (1 week)');
    }

    if (this.props.urgentResponseTimeHours < 0.5 || this.props.urgentResponseTimeHours > 48) {
      errors.push('Urgent response time must be between 0.5 and 48 hours');
    }

    if (this.props.urgentResponseTimeHours > this.props.defaultResponseTimeHours) {
      errors.push('Urgent response time cannot be longer than default response time');
    }

    if (this.props.reminderIntervalHours < 1 || this.props.reminderIntervalHours > 24) {
      errors.push('Reminder interval must be between 1 and 24 hours');
    }

    if (this.props.autoApprovalThresholdHours < 1 || this.props.autoApprovalThresholdHours > 72) {
      errors.push('Auto approval threshold must be between 1 and 72 hours');
    }

    if (this.props.rejectionPenaltyPoints < 0 || this.props.rejectionPenaltyPoints > 50) {
      errors.push('Rejection penalty points must be between 0 and 50');
    }

    if (this.props.maxRejectionsBeforePenalty < 1 || this.props.maxRejectionsBeforePenalty > 10) {
      errors.push('Max rejections before penalty must be between 1 and 10');
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  /**
   * Updates the configuration
   */
  update(updates: Partial<Omit<ReassignmentConfigurationProps, 'id' | 'programId' | 'createdAt' | 'updatedAt'>>): void {
    // Algorithm configuration
    if (updates.defaultCapacityTolerance !== undefined) {
      if (updates.defaultCapacityTolerance < 0 || updates.defaultCapacityTolerance > 100) {
        throw new Error('Default capacity tolerance must be between 0 and 100 percent');
      }
      this.props.defaultCapacityTolerance = updates.defaultCapacityTolerance;
    }

    if (updates.maxSuggestions !== undefined) {
      if (updates.maxSuggestions < 1 || updates.maxSuggestions > 20) {
        throw new Error('Max suggestions must be between 1 and 20');
      }
      this.props.maxSuggestions = updates.maxSuggestions;
    }

    if (updates.prioritizeByDistance !== undefined) {
      this.props.prioritizeByDistance = updates.prioritizeByDistance;
    }

    if (updates.prioritizeByAvailability !== undefined) {
      this.props.prioritizeByAvailability = updates.prioritizeByAvailability;
    }

    // Time limits
    if (updates.defaultResponseTimeHours !== undefined) {
      if (updates.defaultResponseTimeHours < 1 || updates.defaultResponseTimeHours > 168) {
        throw new Error('Default response time must be between 1 and 168 hours');
      }
      this.props.defaultResponseTimeHours = updates.defaultResponseTimeHours;
    }

    if (updates.urgentResponseTimeHours !== undefined) {
      if (updates.urgentResponseTimeHours < 0.5 || updates.urgentResponseTimeHours > 48) {
        throw new Error('Urgent response time must be between 0.5 and 48 hours');
      }
      this.props.urgentResponseTimeHours = updates.urgentResponseTimeHours;
    }

    if (updates.reminderIntervalHours !== undefined) {
      if (updates.reminderIntervalHours < 1 || updates.reminderIntervalHours > 24) {
        throw new Error('Reminder interval must be between 1 and 24 hours');
      }
      this.props.reminderIntervalHours = updates.reminderIntervalHours;
    }

    // Notification settings
    if (updates.enableEmailNotifications !== undefined) {
      this.props.enableEmailNotifications = updates.enableEmailNotifications;
    }

    if (updates.enableSmsNotifications !== undefined) {
      this.props.enableSmsNotifications = updates.enableSmsNotifications;
    }

    if (updates.enablePushNotifications !== undefined) {
      this.props.enablePushNotifications = updates.enablePushNotifications;
    }

    if (updates.escalateToSupervisor !== undefined) {
      this.props.escalateToSupervisor = updates.escalateToSupervisor;
    }

    // Auto-approval settings
    if (updates.enableAutoApproval !== undefined) {
      this.props.enableAutoApproval = updates.enableAutoApproval;
    }

    if (updates.autoApprovalThresholdHours !== undefined) {
      if (updates.autoApprovalThresholdHours < 1 || updates.autoApprovalThresholdHours > 72) {
        throw new Error('Auto approval threshold must be between 1 and 72 hours');
      }
      this.props.autoApprovalThresholdHours = updates.autoApprovalThresholdHours;
    }

    if (updates.autoApprovalOnlyForEquivalent !== undefined) {
      this.props.autoApprovalOnlyForEquivalent = updates.autoApprovalOnlyForEquivalent;
    }

    // Penalty settings
    if (updates.applyPenaltyForRejection !== undefined) {
      this.props.applyPenaltyForRejection = updates.applyPenaltyForRejection;
    }

    if (updates.rejectionPenaltyPoints !== undefined) {
      if (updates.rejectionPenaltyPoints < 0 || updates.rejectionPenaltyPoints > 50) {
        throw new Error('Rejection penalty points must be between 0 and 50');
      }
      this.props.rejectionPenaltyPoints = updates.rejectionPenaltyPoints;
    }

    if (updates.maxRejectionsBeforePenalty !== undefined) {
      if (updates.maxRejectionsBeforePenalty < 1 || updates.maxRejectionsBeforePenalty > 10) {
        throw new Error('Max rejections before penalty must be between 1 and 10');
      }
      this.props.maxRejectionsBeforePenalty = updates.maxRejectionsBeforePenalty;
    }

    if (updates.isActive !== undefined) {
      this.props.isActive = updates.isActive;
    }

    this.props.updatedAt = new Date();
  }

  /**
   * Activates the configuration
   */
  activate(): void {
    this.props.isActive = true;
    this.props.updatedAt = new Date();
  }

  /**
   * Deactivates the configuration
   */
  deactivate(): void {
    this.props.isActive = false;
    this.props.updatedAt = new Date();
  }

  /**
   * Gets the response time for a given urgency level
   */
  getResponseTimeHours(isUrgent: boolean): number {
    return isUrgent ? this.props.urgentResponseTimeHours : this.props.defaultResponseTimeHours;
  }

  /**
   * Checks if auto-approval should be applied for a given scenario
   */
  shouldAutoApprove(hoursUntilEvent: number, isEquivalentResource: boolean): boolean {
    if (!this.props.enableAutoApproval) {
      return false;
    }

    if (hoursUntilEvent > this.props.autoApprovalThresholdHours) {
      return false;
    }

    if (this.props.autoApprovalOnlyForEquivalent && !isEquivalentResource) {
      return false;
    }

    return true;
  }

  /**
   * Checks if penalty should be applied for rejection
   */
  shouldApplyPenaltyForRejection(rejectionCount: number): boolean {
    if (!this.props.applyPenaltyForRejection) {
      return false;
    }

    return rejectionCount >= this.props.maxRejectionsBeforePenalty;
  }

  /**
   * Gets enabled notification channels
   */
  getEnabledNotificationChannels(): string[] {
    const channels: string[] = [];

    if (this.props.enableEmailNotifications) {
      channels.push('email');
    }

    if (this.props.enableSmsNotifications) {
      channels.push('sms');
    }

    if (this.props.enablePushNotifications) {
      channels.push('push');
    }

    return channels;
  }

  /**
   * Gets the configuration summary
   */
  getConfigurationSummary(): string {
    const parts: string[] = [];

    parts.push(`Capacity tolerance: ${this.props.defaultCapacityTolerance}%`);
    parts.push(`Max suggestions: ${this.props.maxSuggestions}`);
    parts.push(`Response time: ${this.props.defaultResponseTimeHours}h (urgent: ${this.props.urgentResponseTimeHours}h)`);
    
    if (this.props.enableAutoApproval) {
      parts.push(`Auto-approval: ${this.props.autoApprovalThresholdHours}h threshold`);
    }

    if (this.props.applyPenaltyForRejection) {
      parts.push(`Penalty: ${this.props.rejectionPenaltyPoints} points after ${this.props.maxRejectionsBeforePenalty} rejections`);
    }

    return parts.join(', ');
  }

  /**
   * Creates a default configuration for a program
   */
  static createDefault(programId: string): ReassignmentConfigurationEntity {
    return ReassignmentConfigurationEntity.create({
      programId,
      defaultCapacityTolerance: 10,
      maxSuggestions: 5,
      prioritizeByDistance: true,
      prioritizeByAvailability: true,
      defaultResponseTimeHours: 24,
      urgentResponseTimeHours: 4,
      reminderIntervalHours: 6,
      enableEmailNotifications: true,
      enableSmsNotifications: false,
      enablePushNotifications: true,
      escalateToSupervisor: true,
      enableAutoApproval: false,
      autoApprovalThresholdHours: 2,
      autoApprovalOnlyForEquivalent: true,
      applyPenaltyForRejection: true,
      rejectionPenaltyPoints: 5,
      maxRejectionsBeforePenalty: 3,
      isActive: true
    });
  }

  /**
   * Creates a lenient configuration (more user-friendly)
   */
  static createLenient(programId: string): ReassignmentConfigurationEntity {
    return ReassignmentConfigurationEntity.create({
      programId,
      defaultCapacityTolerance: 20,
      maxSuggestions: 8,
      prioritizeByDistance: true,
      prioritizeByAvailability: true,
      defaultResponseTimeHours: 48,
      urgentResponseTimeHours: 8,
      reminderIntervalHours: 12,
      enableEmailNotifications: true,
      enableSmsNotifications: false,
      enablePushNotifications: true,
      escalateToSupervisor: false,
      enableAutoApproval: true,
      autoApprovalThresholdHours: 4,
      autoApprovalOnlyForEquivalent: false,
      applyPenaltyForRejection: false,
      rejectionPenaltyPoints: 0,
      maxRejectionsBeforePenalty: 5,
      isActive: true
    });
  }

  /**
   * Creates a strict configuration (more restrictive)
   */
  static createStrict(programId: string): ReassignmentConfigurationEntity {
    return ReassignmentConfigurationEntity.create({
      programId,
      defaultCapacityTolerance: 5,
      maxSuggestions: 3,
      prioritizeByDistance: true,
      prioritizeByAvailability: true,
      defaultResponseTimeHours: 12,
      urgentResponseTimeHours: 2,
      reminderIntervalHours: 3,
      enableEmailNotifications: true,
      enableSmsNotifications: true,
      enablePushNotifications: true,
      escalateToSupervisor: true,
      enableAutoApproval: false,
      autoApprovalThresholdHours: 1,
      autoApprovalOnlyForEquivalent: true,
      applyPenaltyForRejection: true,
      rejectionPenaltyPoints: 10,
      maxRejectionsBeforePenalty: 2,
      isActive: true
    });
  }

  // Conversion methods
  toPersistence(): ReassignmentConfigurationProps {
    return { ...this.props };
  }

  toJSON() {
    return {
      id: this.props.id,
      programId: this.props.programId,
      defaultCapacityTolerance: this.props.defaultCapacityTolerance,
      maxSuggestions: this.props.maxSuggestions,
      prioritizeByDistance: this.props.prioritizeByDistance,
      prioritizeByAvailability: this.props.prioritizeByAvailability,
      defaultResponseTimeHours: this.props.defaultResponseTimeHours,
      urgentResponseTimeHours: this.props.urgentResponseTimeHours,
      reminderIntervalHours: this.props.reminderIntervalHours,
      enableEmailNotifications: this.props.enableEmailNotifications,
      enableSmsNotifications: this.props.enableSmsNotifications,
      enablePushNotifications: this.props.enablePushNotifications,
      escalateToSupervisor: this.props.escalateToSupervisor,
      enableAutoApproval: this.props.enableAutoApproval,
      autoApprovalThresholdHours: this.props.autoApprovalThresholdHours,
      autoApprovalOnlyForEquivalent: this.props.autoApprovalOnlyForEquivalent,
      applyPenaltyForRejection: this.props.applyPenaltyForRejection,
      rejectionPenaltyPoints: this.props.rejectionPenaltyPoints,
      maxRejectionsBeforePenalty: this.props.maxRejectionsBeforePenalty,
      isActive: this.props.isActive,
      createdAt: this.props.createdAt,
      updatedAt: this.props.updatedAt,
      enabledNotificationChannels: this.getEnabledNotificationChannels(),
      configurationSummary: this.getConfigurationSummary()
    };
  }
}
