import { ReassignmentConfigurationEntity } from '../entities/reassignment-configuration.entity';

/**
 * Reassignment Configuration Repository Interface - Domain Layer
 * Defines the contract for reassignment configuration data access
 */
export interface ReassignmentConfigurationRepository {
  /**
   * Create a new reassignment configuration
   */
  create(data: {
    programId: string;
    defaultCapacityTolerance: number;
    maxSuggestions: number;
    prioritizeByDistance: boolean;
    prioritizeByAvailability: boolean;
    defaultResponseTimeHours: number;
    urgentResponseTimeHours: number;
    reminderIntervalHours: number;
    enableEmailNotifications: boolean;
    enableSmsNotifications: boolean;
    enablePushNotifications: boolean;
    escalateToSupervisor: boolean;
    enableAutoApproval: boolean;
    autoApprovalThresholdHours: number;
    autoApprovalOnlyForEquivalent: boolean;
    applyPenaltyForRejection: boolean;
    rejectionPenaltyPoints: number;
    maxRejectionsBeforePenalty: number;
    isActive: boolean;
  }): Promise<ReassignmentConfigurationEntity>;

  /**
   * Find configuration by ID
   */
  findById(id: string): Promise<ReassignmentConfigurationEntity | null>;

  /**
   * Find configuration by program ID
   */
  findByProgramId(programId: string): Promise<ReassignmentConfigurationEntity | null | ReassignmentConfigurationEntity[]>;

  /**
   * Find all configurations
   */
  findAll(): Promise<ReassignmentConfigurationEntity[]>;

  /**
   * Find active configurations
   */
  findActiveConfigurations(): Promise<ReassignmentConfigurationEntity[]>;

  /**
   * Find inactive configurations
   */
  findInactiveConfigurations(): Promise<ReassignmentConfigurationEntity[]>;

  /**
   * Find configurations with auto-approval enabled
   */
  findWithAutoApprovalEnabled(): Promise<ReassignmentConfigurationEntity[]>;

  /**
   * Find configurations with penalty enabled
   */
  findWithPenaltyEnabled(): Promise<ReassignmentConfigurationEntity[]>;

  /**
   * Find configurations by response time range
   */
  findByResponseTimeRange(
    minHours: number,
    maxHours: number
  ): Promise<ReassignmentConfigurationEntity[]>;

  /**
   * Find configurations with email notifications enabled
   */
  findWithEmailNotificationsEnabled(): Promise<ReassignmentConfigurationEntity[]>;

  /**
   * Find configurations with SMS notifications enabled
   */
  findWithSmsNotificationsEnabled(): Promise<ReassignmentConfigurationEntity[]>;

  /**
   * Find configurations with push notifications enabled
   */
  findWithPushNotificationsEnabled(): Promise<ReassignmentConfigurationEntity[]>;

  /**
   * Find configurations with supervisor escalation enabled
   */
  findWithSupervisorEscalationEnabled(): Promise<ReassignmentConfigurationEntity[]>;

  /**
   * Update configuration
   */
  update(id: string, updates: Partial<ReassignmentConfigurationEntity>): Promise<ReassignmentConfigurationEntity>;

  /**
   * Update configuration by program ID
   */
  updateByProgramId(
    programId: string,
    updates: Partial<ReassignmentConfigurationEntity>
  ): Promise<ReassignmentConfigurationEntity>;

  /**
   * Delete configuration
   */
  delete(id: string): Promise<void>;

  /**
   * Delete configuration by program ID
   */
  deleteByProgramId(programId: string): Promise<void>;

  /**
   * Count total configurations
   */
  countConfigurations(): Promise<number>;

  /**
   * Count active configurations
   */
  countActiveConfigurations(): Promise<number>;

  /**
   * Activate configuration
   */
  activateConfiguration(id: string): Promise<ReassignmentConfigurationEntity>;

  /**
   * Deactivate configuration
   */
  deactivateConfiguration(id: string): Promise<ReassignmentConfigurationEntity>;

  /**
   * Create default configuration for a program
   */
  createDefaultForProgram(programId: string): Promise<ReassignmentConfigurationEntity>;

  /**
   * Create lenient configuration for a program
   */
  createLenientForProgram(programId: string): Promise<ReassignmentConfigurationEntity>;

  /**
   * Create strict configuration for a program
   */
  createStrictForProgram(programId: string): Promise<ReassignmentConfigurationEntity>;

  /**
   * Clone configuration from one program to another
   */
  cloneConfiguration(
    sourceProgramId: string,
    targetProgramId: string
  ): Promise<ReassignmentConfigurationEntity>;

  /**
   * Validate configuration
   */
  validateConfiguration(configData: {
    programId: string;
    defaultCapacityTolerance: number;
    maxSuggestions: number;
    defaultResponseTimeHours: number;
    urgentResponseTimeHours: number;
    reminderIntervalHours: number;
    autoApprovalThresholdHours: number;
    rejectionPenaltyPoints: number;
    maxRejectionsBeforePenalty: number;
  }): Promise<{
    isValid: boolean;
    errors: string[];
    warnings?: string[];
  }>;

  /**
   * Get configuration statistics
   */
  getConfigurationStats(): Promise<{
    totalConfigurations: number;
    activeConfigurations: number;
    inactiveConfigurations: number;
    configurationsWithAutoApproval: number;
    configurationsWithPenalty: number;
    averageResponseTime: number;
    averageCapacityTolerance: number;
    averageMaxSuggestions: number;
    notificationChannelUsage: {
      email: number;
      sms: number;
      push: number;
    };
    configurationsWithEscalation: number;
  }>;

  /**
   * Find programs without configuration
   */
  findProgramsWithoutConfiguration(): Promise<string[]>;

  /**
   * Get effective configuration for a program (with fallback to defaults)
   */
  getEffectiveConfiguration(programId: string): Promise<ReassignmentConfigurationEntity>;

  /**
   * Bulk update configurations
   */
  bulkUpdateConfigurations(
    updates: Array<{
      programId: string;
      updates: Partial<ReassignmentConfigurationEntity>;
    }>
  ): Promise<ReassignmentConfigurationEntity[]>;

  /**
   * Find configurations that need review (outdated or with extreme values)
   */
  findConfigurationsNeedingReview(): Promise<Array<{
    configuration: ReassignmentConfigurationEntity;
    reasons: string[];
  }>>;

  /**
   * Get configuration usage metrics
   */
  getConfigurationUsageMetrics(programId: string): Promise<{
    totalReassignmentRequests: number;
    autoApprovedRequests: number;
    penaltiesApplied: number;
    averageResponseTime: number;
    escalatedRequests: number;
    configurationEffectiveness: number; // 0-100 score
  }>;

  /**
   * Compare configurations
   */
  compareConfigurations(
    configId1: string,
    configId2: string
  ): Promise<{
    differences: Array<{
      field: string;
      value1: any;
      value2: any;
      impact: 'LOW' | 'MEDIUM' | 'HIGH';
    }>;
    similarity: number; // 0-100 percentage
    recommendations: string[];
  }>;

  /**
   * Get recommended configuration based on program characteristics
   */
  getRecommendedConfiguration(programData: {
    programId: string;
    userCount: number;
    resourceCount: number;
    averageReservationsPerDay: number;
    userTypes: string[];
  }): Promise<{
    recommendedConfig: Partial<ReassignmentConfigurationEntity>;
    reasoning: string[];
    alternativeConfigs: Array<{
      config: Partial<ReassignmentConfigurationEntity>;
      scenario: string;
    }>;
  }>;
}
