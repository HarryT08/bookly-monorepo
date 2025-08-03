import { AvailabilityEntity } from '../entities/availability.entity';

/**
 * Availability Repository Interface - Domain Layer (RF-07)
 * Defines the contract for availability data access
 */
export interface AvailabilityRepository {
  /**
   * Create a new availability slot
   */
  create(availabilityData: {
    resourceId: string;
    dayOfWeek: number;
    startTime: string;
    endTime: string;
    isActive: boolean;
  }): Promise<AvailabilityEntity>;

  /**
   * Find availability by ID
   */
  findById(id: string): Promise<AvailabilityEntity | null>;

  /**
   * Find all availability records for a resource
   */
  findByResourceId(resourceId: string): Promise<AvailabilityEntity[]>;

  /**
   * Find availability by resource and day of week
   */
  findByResourceAndDay(resourceId: string, dayOfWeek: number): Promise<AvailabilityEntity[]>;

  /**
   * Update availability record
   */
  update(id: string, updates: Partial<AvailabilityEntity>): Promise<AvailabilityEntity>;

  /**
   * Delete availability record
   */
  delete(id: string): Promise<void>;

  /**
   * Find all active availability records
   */
  findAllActive(): Promise<AvailabilityEntity[]>;

  /**
   * Check if time slot conflicts with existing availability
   */
  hasTimeConflict(
    resourceId: string, 
    dayOfWeek: number, 
    startTime: string, 
    endTime: string,
    excludeId?: string
  ): Promise<boolean>;
}
