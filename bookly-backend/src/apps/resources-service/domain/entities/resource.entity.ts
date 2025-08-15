/**
 * Resource Domain Entity
 * Represents a resource that can be reserved (rooms, auditoriums, labs, computers, etc.)
 * Implements RF-01, RF-03, RF-05 from Hito 1
 */

export interface AvailableSchedule {
  // Operating hours
  operatingHours: {
    dayOfWeek: number; // 0-6 (Sunday to Saturday)
    startTime: string; // HH:mm format
    endTime: string; // HH:mm format
  }[];
  
  // Restrictions
  restrictions: {
    userTypes?: string[]; // Which user types can reserve this resource
    maxReservationDuration?: number; // Maximum reservation duration in minutes
    minReservationDuration?: number; // Minimum reservation duration in minutes
    maxAdvanceReservation?: number; // Maximum days in advance to reserve
    minAdvanceReservation?: number; // Minimum hours in advance to reserve
  };
  
  // Priorities
  priorities: {
    userType: string;
    priority: number; // Higher number = higher priority
  }[];
}

export interface ResourceAttributes {
  // Flexible attributes for different resource types
  [key: string]: any;
  
  // Common attributes that might be used
  hasProjector?: boolean;
  hasWhiteboard?: boolean;
  hasComputers?: boolean;
  computerCount?: number;
  hasAirConditioning?: boolean;
  hasAudioSystem?: boolean;
  floor?: string;
  building?: string;
  room?: string;
}

export class ResourceEntity {
  constructor(
    public readonly id: string,
    public readonly name: string,
    public readonly code: string,
    public readonly type: string,
    public readonly capacity: number | null,
    public readonly location: string | null,
    public readonly status: string,
    public readonly description: string | null = null,
    public readonly attributes: ResourceAttributes | null = null,
    public readonly availableSchedules: AvailableSchedule | null = null,
    public readonly categoryId: string | null = null,
    public readonly isActive: boolean = true,
    public readonly createdAt: Date = new Date(),
    public readonly updatedAt: Date = new Date(),
  ) {}

  /**
   * Factory method to create a new resource
   * Auto-generates unique code based on type and timestamp
   */
  static create(
    name: string,
    type: string,
    capacity: number | null,
    location: string | null,
    description?: string,
    attributes?: ResourceAttributes,
    availableSchedules?: AvailableSchedule,
    categoryId?: string,
  ): ResourceEntity {
    const code = ResourceEntity.generateCode(type);
    
    return new ResourceEntity(
      '', // ID will be assigned by repository
      name,
      code,
      type,
      capacity,
      location,
      'AVAILABLE', // Default status
      description || null,
      attributes || null,
      availableSchedules || null,
      categoryId || null,
      true,
      new Date(),
      new Date(),
    );
  }

  /**
   * Update resource information
   * Implements RF-01 (edit resource)
   */
  update(
    name?: string,
    type?: string,
    capacity?: number | null,
    location?: string | null,
    description?: string | null,
    attributes?: ResourceAttributes | null,
    availableSchedules?: AvailableSchedule | null,
    categoryId?: string | null,
  ): ResourceEntity {
    return new ResourceEntity(
      this.id,
      name ?? this.name,
      this.code, // Code should not change
      type ?? this.type,
      capacity ?? this.capacity,
      location ?? this.location,
      this.status, // Status updated separately
      description ?? this.description,
      attributes ?? this.attributes,
      availableSchedules ?? this.availableSchedules,
      categoryId ?? this.categoryId,
      this.isActive,
      this.createdAt,
      new Date(), // Update timestamp
    );
  }

  /**
   * Change resource status
   * Implements RF-03 (define key attributes)
   */
  changeStatus(status: string): ResourceEntity {
    const validStatuses = ['AVAILABLE', 'MAINTENANCE', 'OUT_OF_SERVICE', 'RESERVED'];
    if (!validStatuses.includes(status)) {
      throw new Error(`Invalid status: ${status}. Valid statuses are: ${validStatuses.join(', ')}`);
    }

    return new ResourceEntity(
      this.id,
      this.name,
      this.code,
      this.type,
      this.capacity,
      this.location,
      status,
      this.description,
      this.attributes,
      this.availableSchedules,
      this.categoryId,
      this.isActive,
      this.createdAt,
      new Date(),
    );
  }

  /**
   * Soft delete resource
   * Implements RF-01 (delete resource - soft delete when has relations)
   */
  softDelete(): ResourceEntity {
    return new ResourceEntity(
      this.id,
      this.name,
      this.code,
      this.type,
      this.capacity,
      this.location,
      this.status,
      this.description,
      this.attributes,
      this.availableSchedules,
      this.categoryId,
      false, // Set isActive to false
      this.createdAt,
      new Date(),
    );
  }

  /**
   * Check if resource is available for reservation
   * Implements RF-05 (availability rules)
   */
  isAvailableForReservation(
    requestedDate: Date,
    userType: string,
    reservationDuration: number, // in minutes
  ): { available: boolean; reason?: string } {
    // Check if resource is active and available
    if (!this.isActive) {
      return { available: false, reason: 'Resource is inactive' };
    }

    if (this.status !== 'AVAILABLE') {
      return { available: false, reason: `Resource status is ${this.status}` };
    }

    // Check availability schedules if configured
    if (this.availableSchedules) {
      const dayOfWeek = requestedDate.getDay();
      const timeStr = requestedDate.toTimeString().substring(0, 5); // HH:mm format

      // Check operating hours
      const operatingHour = this.availableSchedules.operatingHours.find(
        oh => oh.dayOfWeek === dayOfWeek
      );

      if (!operatingHour) {
        return { available: false, reason: 'Resource not available on this day' };
      }

      if (timeStr < operatingHour.startTime || timeStr > operatingHour.endTime) {
        return { available: false, reason: 'Resource not available at this time' };
      }

      // Check restrictions
      const restrictions = this.availableSchedules.restrictions;

      if (restrictions.userTypes && !restrictions.userTypes.includes(userType)) {
        return { available: false, reason: 'User type not allowed to reserve this resource' };
      }

      if (restrictions.minReservationDuration && reservationDuration < restrictions.minReservationDuration) {
        return { available: false, reason: `Minimum reservation duration is ${restrictions.minReservationDuration} minutes` };
      }

      if (restrictions.maxReservationDuration && reservationDuration > restrictions.maxReservationDuration) {
        return { available: false, reason: `Maximum reservation duration is ${restrictions.maxReservationDuration} minutes` };
      }

      // Check advance reservation requirements
      const now = new Date();
      const hoursInAdvance = (requestedDate.getTime() - now.getTime()) / (1000 * 60 * 60);

      if (restrictions.minAdvanceReservation && hoursInAdvance < restrictions.minAdvanceReservation) {
        return { available: false, reason: `Minimum advance reservation is ${restrictions.minAdvanceReservation} hours` };
      }

      if (restrictions.maxAdvanceReservation) {
        const daysInAdvance = hoursInAdvance / 24;
        if (daysInAdvance > restrictions.maxAdvanceReservation) {
          return { available: false, reason: `Maximum advance reservation is ${restrictions.maxAdvanceReservation} days` };
        }
      }
    }

    return { available: true };
  }

  /**
   * Get user priority for this resource
   * Implements RF-05 (priority rules)
   */
  getUserPriority(userType: string): number {
    if (!this.availableSchedules?.priorities) {
      return 0; // Default priority
    }

    const priority = this.availableSchedules.priorities.find(p => p.userType === userType);
    return priority?.priority || 0;
  }

  /**
   * Generate unique code for resource
   * Format: TYPE-YYYYMMDD-HHMMSS-XXX
   */
  private static generateCode(type: string): string {
    const now = new Date();
    const dateStr = now.toISOString().slice(0, 10).replace(/-/g, '');
    const timeStr = now.toTimeString().slice(0, 8).replace(/:/g, '');
    const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
    
    return `${type.toUpperCase()}-${dateStr}-${timeStr}-${random}`;
  }

  /**
   * Validate resource data
   */
  async validate(categoryRepository?: any): Promise<{ valid: boolean; errors: string[] }> {
    const errors: string[] = [];

    if (!this.name || this.name.trim().length === 0) {
      errors.push('Name is required');
    }

    if (!this.type || this.type.trim().length === 0) {
      errors.push('Type is required');
    }

    if (this.capacity !== null && this.capacity < 0) {
      errors.push('Capacity cannot be negative');
    }

    // Validate type against Category model if repository is provided
    if (this.type && categoryRepository) {
      const isValidType = await categoryRepository.validateResourceType(this.type.toUpperCase());
      if (!isValidType) {
        errors.push(`Invalid resource type: ${this.type}. Please use a valid resource type from the system categories.`);
      }
    }

    return {
      valid: errors.length === 0,
      errors,
    };
  }

  /**
   * Validate resource data synchronously (for backward compatibility)
   */
  validateSync(): { valid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (!this.name || this.name.trim().length === 0) {
      errors.push('Name is required');
    }

    if (!this.type || this.type.trim().length === 0) {
      errors.push('Type is required');
    }

    if (this.capacity !== null && this.capacity < 0) {
      errors.push('Capacity cannot be negative');
    }

    return {
      valid: errors.length === 0,
      errors,
    };
  }

  /**
   * Check if resource requires maintenance
   */
  requiresMaintenance(): boolean {
    return this.status === 'MAINTENANCE' || this.hasMaintenanceScheduled();
  }

  /**
   * Check if resource has scheduled maintenance
   */
  private hasMaintenanceScheduled(): boolean {
    // This would typically check against a maintenance schedule
    // For now, we'll implement basic logic
    return this.status === 'OUT_OF_SERVICE';
  }

  /**
   * Get resource utilization score (0-100)
   */
  getUtilizationScore(): number {
    // This would typically be calculated based on reservation history
    // For now, return a default based on status
    switch (this.status) {
      case 'AVAILABLE':
        return 75;
      case 'RESERVED':
        return 100;
      case 'MAINTENANCE':
        return 0;
      case 'OUT_OF_SERVICE':
        return 0;
      default:
        return 50;
    }
  }

  /**
   * Check if resource can be reserved by user type
   */
  canBeReservedBy(userType: string): boolean {
    if (!this.isActive || this.status !== 'AVAILABLE') {
      return false;
    }

    if (!this.availableSchedules?.restrictions?.userTypes) {
      return true; // No restrictions
    }

    return this.availableSchedules.restrictions.userTypes.includes(userType);
  }

  /**
   * Get resource availability summary
   */
  getAvailabilitySummary(): {
    isAvailable: boolean;
    status: string;
    restrictions: string[];
    operatingHours: string[];
  } {
    const restrictions: string[] = [];
    const operatingHours: string[] = [];

    if (this.availableSchedules?.restrictions) {
      const r = this.availableSchedules.restrictions;
      if (r.userTypes) {
        restrictions.push(`User types: ${r.userTypes.join(', ')}`);
      }
      if (r.maxReservationDuration) {
        restrictions.push(`Max duration: ${r.maxReservationDuration} minutes`);
      }
      if (r.minReservationDuration) {
        restrictions.push(`Min duration: ${r.minReservationDuration} minutes`);
      }
    }

    if (this.availableSchedules?.operatingHours) {
      const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
      this.availableSchedules.operatingHours.forEach(oh => {
        operatingHours.push(`${days[oh.dayOfWeek]}: ${oh.startTime} - ${oh.endTime}`);
      });
    }

    return {
      isAvailable: this.isActive && this.status === 'AVAILABLE',
      status: this.status,
      restrictions,
      operatingHours,
    };
  }

  /**
   * Clone resource with new data
   */
  clone(overrides: Partial<ResourceEntity> = {}): ResourceEntity {
    return new ResourceEntity(
      overrides.id ?? this.id,
      overrides.name ?? this.name,
      overrides.code ?? this.code,
      overrides.type ?? this.type,
      overrides.capacity ?? this.capacity,
      overrides.location ?? this.location,
      overrides.status ?? this.status,
      overrides.description ?? this.description,
      overrides.attributes ?? this.attributes,
      overrides.availableSchedules ?? this.availableSchedules,
      overrides.categoryId ?? this.categoryId,
      overrides.isActive ?? this.isActive,
      overrides.createdAt ?? this.createdAt,
      overrides.updatedAt ?? this.updatedAt,
    );
  }
}
