/**
 * Penalty Entity
 * Represents a penalty configuration that defines sanctions for accumulated penalty points
 */

import { SeverityLevel } from "../../utils/severity-level.enum";
import { SanctionType } from "../../utils/sanction-type.enum";
import { RestrictionLevelPenalty } from "../../utils/restriction-level-penalty.enum";

export interface PenaltyProps {
  id: string;
  programId: string;
  
  // Penalty configuration
  name: string;
  description: string;
  minPoints: number; // Minimum points required to trigger this penalty
  maxPoints: number; // Maximum points this penalty applies to
  
  // Sanction configuration
  sanctionType: SanctionType;
  sanctionDuration: number; // Duration in days
  restrictionLevel: RestrictionLevelPenalty;
  
  // Status
  isActive: boolean;
  isCustom: boolean;
  
  // Timestamps
  createdAt: Date;
  updatedAt: Date;
}

export class PenaltyEntity {
  severityLevel: SeverityLevel;
  maxReservationsPerDay: number;
  private constructor(private readonly props: PenaltyProps) {}

  static create(props: Omit<PenaltyProps, 'id' | 'createdAt' | 'updatedAt'>): PenaltyEntity {
    const now = new Date();
    return new PenaltyEntity({
      ...props,
      id: '', // Will be set by repository
      createdAt: now,
      updatedAt: now,
      isActive: props.isActive !== undefined ? props.isActive : true,
      isCustom: props.isCustom !== undefined ? props.isCustom : false
    });
  }

  static fromPersistence(props: PenaltyProps): PenaltyEntity {
    return new PenaltyEntity(props);
  }

  // Getters
  get id(): string { return this.props.id; }
  get programId(): string { return this.props.programId; }
  get name(): string { return this.props.name; }
  get description(): string { return this.props.description; }
  get minPoints(): number { return this.props.minPoints; }
  get maxPoints(): number { return this.props.maxPoints; }
  get sanctionType(): SanctionType { return this.props.sanctionType; }
  get sanctionDuration(): number { return this.props.sanctionDuration; }
  get restrictionLevel(): RestrictionLevelPenalty { return this.props.restrictionLevel; }
  get isActive(): boolean { return this.props.isActive; }
  get isCustom(): boolean { return this.props.isCustom; }
  get createdAt(): Date { return this.props.createdAt; }
  get updatedAt(): Date { return this.props.updatedAt; }

  // Business logic methods

  /**
   * Validates if the penalty configuration is valid
   */
  validate(): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (!this.props.programId) {
      errors.push('Program ID is required');
    }

    if (!this.props.name?.trim()) {
      errors.push('Penalty name is required');
    }

    if (!this.props.description?.trim()) {
      errors.push('Penalty description is required');
    }

    if (this.props.minPoints < 0) {
      errors.push('Minimum points cannot be negative');
    }

    if (this.props.maxPoints < this.props.minPoints) {
      errors.push('Maximum points must be greater than or equal to minimum points');
    }

    if (this.props.maxPoints > 1000) {
      errors.push('Maximum points cannot exceed 1000');
    }

    if (this.props.sanctionDuration < 0) {
      errors.push('Sanction duration cannot be negative');
    }

    if (this.props.sanctionType === SanctionType.PERMANENT_SUSPENSION && this.props.sanctionDuration > 0) {
      errors.push('Permanent ban should have zero duration');
    }

    if (this.props.sanctionType !== SanctionType.WARNING && 
        this.props.sanctionType !== SanctionType.PERMANENT_SUSPENSION && 
        this.props.sanctionDuration === 0) {
      errors.push('Temporary sanctions must have a duration greater than 0');
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  /**
   * Checks if a given point value falls within this penalty range
   */
  appliesTo(points: number): boolean {
    return points >= this.props.minPoints && points <= this.props.maxPoints;
  }

  /**
   * Updates the penalty configuration
   */
  update(updates: Partial<Pick<PenaltyProps, 'name' | 'description' | 'minPoints' | 'maxPoints' | 'sanctionType' | 'sanctionDuration' | 'restrictionLevel' | 'isActive'>>): void {
    if (updates.name !== undefined) {
      this.props.name = updates.name;
    }
    
    if (updates.description !== undefined) {
      this.props.description = updates.description;
    }
    
    if (updates.minPoints !== undefined) {
      if (updates.minPoints < 0) {
        throw new Error('Minimum points cannot be negative');
      }
      this.props.minPoints = updates.minPoints;
    }
    
    if (updates.maxPoints !== undefined) {
      if (updates.maxPoints < this.props.minPoints) {
        throw new Error('Maximum points must be greater than or equal to minimum points');
      }
      this.props.maxPoints = updates.maxPoints;
    }
    
    if (updates.sanctionType !== undefined) {
      this.props.sanctionType = updates.sanctionType;
    }
    
    if (updates.sanctionDuration !== undefined) {
      if (updates.sanctionDuration < 0) {
        throw new Error('Sanction duration cannot be negative');
      }
      this.props.sanctionDuration = updates.sanctionDuration;
    }
    
    if (updates.restrictionLevel !== undefined) {
      this.props.restrictionLevel = updates.restrictionLevel;
    }
    
    if (updates.isActive !== undefined) {
      this.props.isActive = updates.isActive;
    }

    this.props.updatedAt = new Date();
  }

  /**
   * Activates the penalty
   */
  activate(): void {
    this.props.isActive = true;
    this.props.updatedAt = new Date();
  }

  /**
   * Deactivates the penalty
   */
  deactivate(): void {
    this.props.isActive = false;
    this.props.updatedAt = new Date();
  }

  /**
   * Checks if the penalty is a system default
   */
  isSystemDefault(): boolean {
    return !this.props.isCustom;
  }

  /**
   * Checks if the penalty can be deleted
   */
  canBeDeleted(): boolean {
    return this.props.isCustom;
  }

  /**
   * Gets the severity level based on sanction type
   */
  getSeverityLevel(): 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL' {
    switch (this.props.sanctionType) {
      case SanctionType.WARNING:
        return 'LOW';
      case SanctionType.TEMPORARY_SUSPENSION:
        return 'MEDIUM';
      case SanctionType.PARTIAL_SUSPENSION:
        return 'HIGH';
      case SanctionType.FULL_SUSPENSION:
      case SanctionType.PERMANENT_SUSPENSION:
        return 'CRITICAL';
      default:
        return 'LOW';
    }
  }

  /**
   * Gets the color code for UI representation
   */
  getColorCode(): string {
    switch (this.getSeverityLevel()) {
      case 'LOW': return '#28a745'; // Green
      case 'MEDIUM': return '#ffc107'; // Yellow
      case 'HIGH': return '#fd7e14'; // Orange
      case 'CRITICAL': return '#dc3545'; // Red
      default: return '#6c757d'; // Gray
    }
  }

  /**
   * Checks if the penalty is temporary
   */
  isTemporary(): boolean {
    return this.props.sanctionType !== SanctionType.PERMANENT_SUSPENSION && 
           this.props.sanctionType !== SanctionType.WARNING;
  }

  /**
   * Checks if the penalty is permanent
   */
  isPermanent(): boolean {
    return this.props.sanctionType === SanctionType.PERMANENT_SUSPENSION;
  }

  /**
   * Gets the point range as a string
   */
  getPointRange(): string {
    if (this.props.minPoints === this.props.maxPoints) {
      return `${this.props.minPoints} points`;
    }
    return `${this.props.minPoints}-${this.props.maxPoints} points`;
  }

  /**
   * Gets the duration description
   */
  getDurationDescription(): string {
    if (this.props.sanctionType === SanctionType.WARNING) {
      return 'No duration (warning only)';
    }
    
    if (this.props.sanctionType === SanctionType.PERMANENT_SUSPENSION) {
      return 'Permanent';
    }
    
    if (this.props.sanctionDuration === 1) {
      return '1 day';
    }
    
    return `${this.props.sanctionDuration} days`;
  }

  /**
   * Gets the restriction description
   */
  getRestrictionDescription(): string {
    const descriptions = {
      [RestrictionLevelPenalty.NONE]: 'No restrictions',
      [RestrictionLevelPenalty.LIMITED_RESERVATIONS]: 'Limited number of reservations',
      [RestrictionLevelPenalty.NO_ADVANCE_RESERVATIONS]: 'Same-day reservations only',
      [RestrictionLevelPenalty.SPECIFIC_RESOURCES_ONLY]: 'Specific resources only',
      [RestrictionLevelPenalty.APPROVAL_REQUIRED]: 'All reservations require approval',
      [RestrictionLevelPenalty.NO_RESERVATIONS]: 'No reservations allowed'
    };

    return descriptions[this.props.restrictionLevel] || 'Unknown restriction';
  }

  /**
   * Creates a default system penalty
   */
  static createSystemDefault(
    programId: string,
    name: string,
    description: string,
    minPoints: number,
    maxPoints: number,
    sanctionType: SanctionType,
    sanctionDuration: number,
    restrictionLevel: RestrictionLevelPenalty
  ): PenaltyEntity {
    return PenaltyEntity.create({
      programId,
      name,
      description,
      minPoints,
      maxPoints,
      sanctionType,
      sanctionDuration,
      restrictionLevel,
      isActive: true,
      isCustom: false
    });
  }

  /**
   * Creates a custom penalty
   */
  static createCustom(
    programId: string,
    name: string,
    description: string,
    minPoints: number,
    maxPoints: number,
    sanctionType: SanctionType,
    sanctionDuration: number,
    restrictionLevel: RestrictionLevelPenalty
  ): PenaltyEntity {
    return PenaltyEntity.create({
      programId,
      name,
      description,
      minPoints,
      maxPoints,
      sanctionType,
      sanctionDuration,
      restrictionLevel,
      isActive: true,
      isCustom: true
    });
  }

  // Conversion methods
  toPersistence(): PenaltyProps {
    return { ...this.props };
  }

  toJSON() {
    return {
      id: this.props.id,
      programId: this.props.programId,
      name: this.props.name,
      description: this.props.description,
      minPoints: this.props.minPoints,
      maxPoints: this.props.maxPoints,
      sanctionType: this.props.sanctionType,
      sanctionDuration: this.props.sanctionDuration,
      restrictionLevel: this.props.restrictionLevel,
      isActive: this.props.isActive,
      isCustom: this.props.isCustom,
      createdAt: this.props.createdAt,
      updatedAt: this.props.updatedAt,
      severityLevel: this.getSeverityLevel(),
      colorCode: this.getColorCode(),
      pointRange: this.getPointRange(),
      durationDescription: this.getDurationDescription(),
      restrictionDescription: this.getRestrictionDescription(),
      isTemporary: this.isTemporary(),
      isPermanent: this.isPermanent(),
      canBeDeleted: this.canBeDeleted()
    };
  }
}
