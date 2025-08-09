/**
 * Penalty Event Entity
 * Represents configurable events that can trigger penalties in the system
 */

import { SeverityLevel, SeverityLevelColor } from "../../utils";

export interface PenaltyEventProps {
  id: string;
  programId: string;
  
  // Event configuration
  eventType: PenaltyEventType;
  name: string;
  description: string;
  
  // Penalty configuration
  severityLevel: SeverityLevel;
  penaltyPoints: number;
  isActive: boolean;
  isCustom: boolean; // true for custom events created by program directors
  
  // Timestamps
  createdAt: Date;
  updatedAt: Date;
}

export enum PenaltyEventType {
  // Reservation-related events
  NO_SHOW = 'NO_SHOW',
  LATE_CANCELLATION = 'LATE_CANCELLATION',
  REPEATED_CANCELLATION = 'REPEATED_CANCELLATION',
  RESOURCE_MISUSE = 'RESOURCE_MISUSE',
  UNAUTHORIZED_ACCESS = 'UNAUTHORIZED_ACCESS',
  
  // Waiting list events
  WAITING_LIST_NO_RESPONSE = 'WAITING_LIST_NO_RESPONSE',
  WAITING_LIST_REJECTION_ABUSE = 'WAITING_LIST_REJECTION_ABUSE',
  
  // Reassignment events
  REASSIGNMENT_REJECTION_ABUSE = 'REASSIGNMENT_REJECTION_ABUSE',
  
  // Administrative events
  POLICY_VIOLATION = 'POLICY_VIOLATION',
  FALSE_INFORMATION = 'FALSE_INFORMATION',
  
  // Custom events
  CUSTOM = 'CUSTOM',
  REPEATED_VIOLATIONS = "REPEATED_VIOLATIONS",
  CUSTOM_EVENT = "CUSTOM_EVENT"
}

export class PenaltyEventEntity {
  private constructor(private readonly props: PenaltyEventProps) {}

  static create(props: Omit<PenaltyEventProps, 'id' | 'createdAt' | 'updatedAt'>): PenaltyEventEntity {
    const now = new Date();
    return new PenaltyEventEntity({
      ...props,
      id: '', // Will be set by repository
      createdAt: now,
      updatedAt: now,
      isActive: props.isActive !== undefined ? props.isActive : true,
      isCustom: props.isCustom !== undefined ? props.isCustom : false
    });
  }

  static fromPersistence(props: PenaltyEventProps): PenaltyEventEntity {
    return new PenaltyEventEntity(props);
  }

  // Getters
  get id(): string { return this.props.id; }
  get programId(): string { return this.props.programId; }
  get eventType(): PenaltyEventType { return this.props.eventType; }
  get name(): string { return this.props.name; }
  get description(): string { return this.props.description; }
  get penaltyPoints(): number { return this.props.penaltyPoints; }
  get isActive(): boolean { return this.props.isActive; }
  get isCustom(): boolean { return this.props.isCustom; }
  get createdAt(): Date { return this.props.createdAt; }
  get updatedAt(): Date { return this.props.updatedAt; }

  // Business logic methods

  /**
   * Validates if the penalty event configuration is valid
   */
  validate(): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (!this.props.programId) {
      errors.push('Program ID is required');
    }

    if (!this.props.name?.trim()) {
      errors.push('Event name is required');
    }

    if (!this.props.description?.trim()) {
      errors.push('Event description is required');
    }

    if (this.props.penaltyPoints < 0) {
      errors.push('Penalty points cannot be negative');
    }

    if (this.props.penaltyPoints > 100) {
      errors.push('Penalty points cannot exceed 100');
    }

    if (this.props.eventType === PenaltyEventType.CUSTOM && !this.props.isCustom) {
      errors.push('Custom event type requires isCustom to be true');
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  /**
   * Updates the penalty event configuration
   */
  update(updates: Partial<Pick<PenaltyEventProps, 'name' | 'description' | 'penaltyPoints' | 'isActive'>>): void {
    if (updates.name !== undefined) {
      this.props.name = updates.name;
    }
    
    if (updates.description !== undefined) {
      this.props.description = updates.description;
    }
    
    if (updates.penaltyPoints !== undefined) {
      if (updates.penaltyPoints < 0 || updates.penaltyPoints > 100) {
        throw new Error('Penalty points must be between 0 and 100');
      }
      this.props.penaltyPoints = updates.penaltyPoints;
    }
    
    if (updates.isActive !== undefined) {
      this.props.isActive = updates.isActive;
    }

    this.props.updatedAt = new Date();
  }

  /**
   * Activates the penalty event
   */
  activate(): void {
    this.props.isActive = true;
    this.props.updatedAt = new Date();
  }

  /**
   * Deactivates the penalty event
   */
  deactivate(): void {
    this.props.isActive = false;
    this.props.updatedAt = new Date();
  }

  /**
   * Checks if the event is a system default event
   */
  isSystemDefault(): boolean {
    return !this.props.isCustom;
  }

  /**
   * Checks if the event can be deleted
   */
  canBeDeleted(): boolean {
    // Only custom events can be deleted
    return this.props.isCustom;
  }

  /**
   * Checks if the event can be modified
   */
  canBeModified(): boolean {
    // Both custom and system events can be modified, but system events have restrictions
    return true;
  }

  /**
   * Gets the severity level based on penalty points
   */
  getSeverityLevel(): SeverityLevel {
    const severityLevel = this.props.severityLevel;
    if(this.props.isCustom){
      return severityLevel;
    }
    if (this.props.penaltyPoints <= 10) return SeverityLevel.LOW;
    if (this.props.penaltyPoints <= 25) return SeverityLevel.MEDIUM;
    if (this.props.penaltyPoints <= 50) return SeverityLevel.HIGH;
    return SeverityLevel.CRITICAL;
  }

  /**
   * Gets the color code for UI representation
   */
  getColorCode(): string {
    switch (this.getSeverityLevel()) {
      case SeverityLevel.LOW: return SeverityLevelColor.LOW;
      case SeverityLevel.MEDIUM: return SeverityLevelColor.MEDIUM;
      case SeverityLevel.HIGH: return SeverityLevelColor.HIGH;
      case SeverityLevel.CRITICAL: return SeverityLevelColor.CRITICAL;
      default: return SeverityLevelColor.DEFAULT;
    }
  }

  /**
   * Creates a default system event
   */
  static createSystemDefault(
    programId: string,
    eventType: PenaltyEventType,
    name: string,
    description: string,
    penaltyPoints: number,
    severityLevel: SeverityLevel
  ): PenaltyEventEntity {
    return PenaltyEventEntity.create({
      programId,
      eventType,
      name,
      description,
      penaltyPoints,
      isActive: true,
      isCustom: false,
      severityLevel
    });
  }

  /**
   * Creates a custom event
   */
  static createCustom(
    programId: string,
    name: string,
    description: string,
    penaltyPoints: number,
    severityLevel: SeverityLevel
  ): PenaltyEventEntity {
    return PenaltyEventEntity.create({
      programId,
      eventType: PenaltyEventType.CUSTOM,
      name,
      description,
      penaltyPoints,
      isActive: true,
      isCustom: true,
      severityLevel
    });
  }

  // Conversion methods
  toPersistence(): PenaltyEventProps {
    return { ...this.props };
  }

  toJSON() {
    return {
      id: this.props.id,
      programId: this.props.programId,
      eventType: this.props.eventType,
      name: this.props.name,
      description: this.props.description,
      penaltyPoints: this.props.penaltyPoints,
      isActive: this.props.isActive,
      isCustom: this.props.isCustom,
      createdAt: this.props.createdAt,
      updatedAt: this.props.updatedAt,
      severityLevel: this.getSeverityLevel(),
      colorCode: this.getColorCode(),
      canBeDeleted: this.canBeDeleted(),
      canBeModified: this.canBeModified()
    };
  }
}
