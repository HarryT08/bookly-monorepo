import { MaintenanceTypeEntity } from '../entities/maintenance-type.entity';

/**
 * HITO 6 - RF-06: MaintenanceType Repository Interface
 */
export interface MaintenanceTypeRepository {
  /**
   * Creates a new maintenance type
   */
  create(maintenanceType: MaintenanceTypeEntity): Promise<MaintenanceTypeEntity>;

  /**
   * Updates an existing maintenance type
   */
  update(id: string, maintenanceType: MaintenanceTypeEntity): Promise<MaintenanceTypeEntity>;

  /**
   * Finds a maintenance type by ID
   */
  findById(id: string): Promise<MaintenanceTypeEntity | null>;

  /**
   * Finds a maintenance type by name
   */
  findByName(name: string): Promise<MaintenanceTypeEntity | null>;

  /**
   * Gets all active maintenance types
   */
  findAllActive(): Promise<MaintenanceTypeEntity[]>;

  /**
   * Gets all maintenance types (including inactive)
   */
  findAll(): Promise<MaintenanceTypeEntity[]>;

  /**
   * Gets default maintenance types
   */
  findDefaults(): Promise<MaintenanceTypeEntity[]>;

  /**
   * Gets custom (non-default) maintenance types
   */
  findCustom(): Promise<MaintenanceTypeEntity[]>;

  /**
   * Checks if a maintenance type name already exists
   */
  existsByName(name: string, excludeId?: string): Promise<boolean>;

  /**
   * Deactivates a maintenance type (only if not default)
   */
  deactivate(id: string): Promise<MaintenanceTypeEntity>;

  /**
   * Initializes default maintenance types if they don't exist
   */
  initializeDefaults(): Promise<void>;

  /**
   * Gets maintenance types ordered by priority
   */
  findOrderedByPriority(): Promise<MaintenanceTypeEntity[]>;
}
