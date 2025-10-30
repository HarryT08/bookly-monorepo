import { CalendarIntegrationEntity } from '../entities/calendar-integration.entity';

/**
 * Calendar Integration Repository Interface (RF-08)
 * Defines contract for calendar integration data persistence
 */
export interface CalendarIntegrationRepository {
  /**
   * Create a new calendar integration
   */
  create(integrationData: {
    name: string;
    provider: string;
    resourceId: string;
    credentials: any;
    settings: any;
    isActive: boolean;
  }): Promise<CalendarIntegrationEntity>;

  /**
   * Find integration by ID
   */
  findById(id: string): Promise<CalendarIntegrationEntity | null>;

  /**
   * Find integrations by resource ID
   */
  findByResourceId(resourceId: string): Promise<CalendarIntegrationEntity[]>;

  /**
   * Find integrations by provider
   */
  findByProvider(provider: string): Promise<CalendarIntegrationEntity[]>;

  /**
   * Find integration by resource and provider
   */
  findByResourceAndProvider(resourceId: string, provider: string): Promise<CalendarIntegrationEntity | null>;

  /**
   * Find active integrations
   */
  findActive(): Promise<CalendarIntegrationEntity[]>;

  /**
   * Update integration
   */
  update(id: string, updates: Partial<CalendarIntegrationEntity>): Promise<CalendarIntegrationEntity>;

  /**
   * Delete integration
   */
  delete(id: string): Promise<void>;

  /**
   * Update last sync timestamp
   */
  updateLastSync(id: string, lastSync: Date): Promise<void>;

  /**
   * Find integrations that need sync
   */
  findPendingSync(maxAge: number): Promise<CalendarIntegrationEntity[]>;
}
