/**
 * User Penalty Entity
 * Represents an active penalty applied to a user based on accumulated penalty points
 */

import { SeverityLevelColor } from "../../utils/severity-level-color.enum";
import { SeverityLevel } from "../../utils/severity-level.enum";
import { SanctionType } from "../../utils/sanction-type.enum";
import { RestrictionLevelPenalty } from "../../utils/restriction-level-penalty.enum";

export interface UserPenaltyProps {
  id: string;
  userId: string;
  programId: string;
  penaltyId: string;
  penaltyEventId?: string; // The event that triggered this penalty
  
  // Penalty details
  totalPoints: number; // Total points accumulated when penalty was applied
  penaltyPoints: number; // Points from the specific event that triggered this penalty
  
  // Sanction details
  sanctionType: SanctionType;
  restrictionLevel: RestrictionLevelPenalty;
  
  // Duration and status
  startDate: Date;
  endDate?: Date; // null for permanent penalties
  isActive: boolean;
  
  // Additional context
  reason: string;
  appliedBy: string; // User ID of who applied the penalty
  notes?: string;
  
  // Timestamps
  createdAt: Date;
  updatedAt: Date;
}

export class UserPenaltyEntity {
  private constructor(private readonly props: UserPenaltyProps) {}

  static create(props: Omit<UserPenaltyProps, 'id' | 'createdAt' | 'updatedAt'>): UserPenaltyEntity {
    const now = new Date();
    return new UserPenaltyEntity({
      ...props,
      id: '', // Will be set by repository
      createdAt: now,
      updatedAt: now,
      isActive: props.isActive !== undefined ? props.isActive : true
    });
  }

  static fromPersistence(props: UserPenaltyProps): UserPenaltyEntity {
    return new UserPenaltyEntity(props);
  }

  // Getters
  get id(): string { return this.props.id; }
  get userId(): string { return this.props.userId; }
  get programId(): string { return this.props.programId; }
  get penaltyId(): string { return this.props.penaltyId; }
  get penaltyEventId(): string | undefined { return this.props.penaltyEventId; }
  get totalPoints(): number { return this.props.totalPoints; }
  get penaltyPoints(): number { return this.props.penaltyPoints; }
  get sanctionType(): SanctionType { return this.props.sanctionType; }
  get restrictionLevel(): RestrictionLevelPenalty { return this.props.restrictionLevel; }
  get startDate(): Date { return this.props.startDate; }
  get endDate(): Date | undefined { return this.props.endDate; }
  get isActive(): boolean { return this.props.isActive; }
  get reason(): string { return this.props.reason; }
  get appliedBy(): string { return this.props.appliedBy; }
  get notes(): string | undefined { return this.props.notes; }
  get createdAt(): Date { return this.props.createdAt; }
  get updatedAt(): Date { return this.props.updatedAt; }

  // Business logic methods

  /**
   * Validates if the user penalty is valid
   */
  validate(): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (!this.props.userId) {
      errors.push('User ID is required');
    }

    if (!this.props.programId) {
      errors.push('Program ID is required');
    }

    if (!this.props.penaltyId) {
      errors.push('Penalty ID is required');
    }

    if (this.props.totalPoints < 0) {
      errors.push('Total points cannot be negative');
    }

    if (this.props.penaltyPoints < 0) {
      errors.push('Penalty points cannot be negative');
    }

    if (!this.props.reason?.trim()) {
      errors.push('Reason is required');
    }

    if (!this.props.appliedBy) {
      errors.push('Applied by user ID is required');
    }

    if (this.props.endDate && this.props.endDate <= this.props.startDate) {
      errors.push('End date must be after start date');
    }

    if (this.props.sanctionType === SanctionType.PERMANENT_SUSPENSION && this.props.endDate) {
      errors.push('Permanent ban should not have an end date');
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  /**
   * Checks if the penalty is currently active and not expired
   */
  isCurrentlyActive(): boolean {
    if (!this.props.isActive) {
      return false;
    }

    if (this.isPermanent()) {
      return true;
    }

    if (this.props.endDate) {
      return new Date() <= this.props.endDate;
    }

    return true;
  }

  /**
   * Checks if the penalty has expired
   */
  isExpired(): boolean {
    if (this.isPermanent()) {
      return false;
    }

    if (this.props.endDate) {
      return new Date() > this.props.endDate;
    }

    return false;
  }

  /**
   * Checks if the penalty is permanent
   */
  isPermanent(): boolean {
    return this.props.sanctionType === SanctionType.PERMANENT_SUSPENSION;
  }

  /**
   * Checks if the penalty is temporary
   */
  isTemporary(): boolean {
    return !this.isPermanent() && this.props.sanctionType !== SanctionType.WARNING;
  }

  /**
   * Checks if the penalty is just a warning
   */
  isWarning(): boolean {
    return this.props.sanctionType === SanctionType.WARNING;
  }

  /**
   * Deactivates the penalty manually
   */
  deactivate(deactivatedBy: string, reason?: string): void {
    this.props.isActive = false;
    this.props.updatedAt = new Date();
    
    if (reason) {
      this.props.notes = (this.props.notes || '') + `\nDeactivated by ${deactivatedBy}: ${reason}`;
    }
  }

  /**
   * Extends the penalty duration
   */
  extend(additionalDays: number, extendedBy: string, reason: string): void {
    if (this.isPermanent()) {
      throw new Error('Cannot extend permanent penalty');
    }

    if (!this.props.endDate) {
      throw new Error('Cannot extend penalty without end date');
    }

    if (additionalDays <= 0) {
      throw new Error('Additional days must be positive');
    }

    const newEndDate = new Date(this.props.endDate);
    newEndDate.setDate(newEndDate.getDate() + additionalDays);
    
    this.props.endDate = newEndDate;
    this.props.updatedAt = new Date();
    this.props.notes = (this.props.notes || '') + `\nExtended by ${additionalDays} days by ${extendedBy}: ${reason}`;
  }

  /**
   * Reduces the penalty duration
   */
  reduce(reductionDays: number, reducedBy: string, reason: string): void {
    if (this.isPermanent()) {
      throw new Error('Cannot reduce permanent penalty');
    }

    if (!this.props.endDate) {
      throw new Error('Cannot reduce penalty without end date');
    }

    if (reductionDays <= 0) {
      throw new Error('Reduction days must be positive');
    }

    const newEndDate = new Date(this.props.endDate);
    newEndDate.setDate(newEndDate.getDate() - reductionDays);
    
    // Ensure the new end date is not in the past
    const now = new Date();
    if (newEndDate <= now) {
      newEndDate.setTime(now.getTime() + (24 * 60 * 60 * 1000)); // Add 1 day
    }
    
    this.props.endDate = newEndDate;
    this.props.updatedAt = new Date();
    this.props.notes = (this.props.notes || '') + `\nReduced by ${reductionDays} days by ${reducedBy}: ${reason}`;
  }

  /**
   * Adds notes to the penalty
   */
  addNotes(notes: string, addedBy: string): void {
    const timestamp = new Date().toISOString();
    const newNote = `[${timestamp}] ${addedBy}: ${notes}`;
    
    this.props.notes = this.props.notes 
      ? `${this.props.notes}\n${newNote}`
      : newNote;
    
    this.props.updatedAt = new Date();
  }

  /**
   * Gets the remaining days for the penalty
   */
  getRemainingDays(): number | null {
    if (this.isPermanent()) {
      return null;
    }

    if (!this.props.endDate) {
      return null;
    }

    const now = new Date();
    const remainingMs = this.props.endDate.getTime() - now.getTime();
    return Math.max(0, Math.ceil(remainingMs / (1000 * 60 * 60 * 24)));
  }

  /**
   * Gets the total duration in days
   */
  getTotalDurationDays(): number | null {
    if (this.isPermanent()) {
      return null;
    }

    if (!this.props.endDate) {
      return null;
    }

    const durationMs = this.props.endDate.getTime() - this.props.startDate.getTime();
    return Math.ceil(durationMs / (1000 * 60 * 60 * 24));
  }

  /**
   * Gets the severity level based on sanction type
   */
  getSeverityLevel(): SeverityLevel {
    switch (this.props.sanctionType) {
      case SanctionType.WARNING:
        return SeverityLevel.LOW;
      case SanctionType.TEMPORARY_SUSPENSION:
        return SeverityLevel.MEDIUM;
      case SanctionType.PARTIAL_SUSPENSION:
        return SeverityLevel.HIGH;
      case SanctionType.FULL_SUSPENSION:
      case SanctionType.PERMANENT_SUSPENSION:
        return SeverityLevel.CRITICAL;
      default:
        return SeverityLevel.LOW;
    }
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
   * Gets the status description
   */
  getStatusDescription(): string {
    if (!this.props.isActive) {
      return 'Inactive';
    }

    if (this.isExpired()) {
      return 'Expired';
    }

    if (this.isPermanent()) {
      return 'Permanent';
    }

    const remainingDays = this.getRemainingDays();
    if (remainingDays === null) {
      return 'Active';
    }

    if (remainingDays === 0) {
      return 'Expires today';
    }

    if (remainingDays === 1) {
      return 'Expires in 1 day';
    }

    return `Expires in ${remainingDays} days`;
  }

  /**
   * Checks if the user can make reservations based on restriction level
   */
  canMakeReservations(): boolean {
    if (!this.isCurrentlyActive()) {
      return true;
    }

    return this.props.restrictionLevel !== RestrictionLevelPenalty.NO_RESERVATIONS;
  }

  /**
   * Checks if the user needs approval for reservations
   */
  needsApprovalForReservations(): boolean {
    if (!this.isCurrentlyActive()) {
      return false;
    }

    return this.props.restrictionLevel === RestrictionLevelPenalty.APPROVAL_REQUIRED;
  }

  /**
   * Checks if the user can make advance reservations
   */
  canMakeAdvanceReservations(): boolean {
    if (!this.isCurrentlyActive()) {
      return true;
    }

    return this.props.restrictionLevel !== RestrictionLevelPenalty.NO_ADVANCE_RESERVATIONS &&
           this.props.restrictionLevel !== RestrictionLevelPenalty.NO_RESERVATIONS;
  }

  // Conversion methods
  toPersistence(): UserPenaltyProps {
    return { ...this.props };
  }

  toJSON() {
    return {
      id: this.props.id,
      userId: this.props.userId,
      programId: this.props.programId,
      penaltyId: this.props.penaltyId,
      penaltyEventId: this.props.penaltyEventId,
      totalPoints: this.props.totalPoints,
      penaltyPoints: this.props.penaltyPoints,
      sanctionType: this.props.sanctionType,
      restrictionLevel: this.props.restrictionLevel,
      startDate: this.props.startDate,
      endDate: this.props.endDate,
      isActive: this.props.isActive,
      reason: this.props.reason,
      appliedBy: this.props.appliedBy,
      notes: this.props.notes,
      createdAt: this.props.createdAt,
      updatedAt: this.props.updatedAt,
      isCurrentlyActive: this.isCurrentlyActive(),
      isExpired: this.isExpired(),
      isPermanent: this.isPermanent(),
      isTemporary: this.isTemporary(),
      isWarning: this.isWarning(),
      remainingDays: this.getRemainingDays(),
      totalDurationDays: this.getTotalDurationDays(),
      severityLevel: this.getSeverityLevel(),
      colorCode: this.getColorCode(),
      statusDescription: this.getStatusDescription(),
      canMakeReservations: this.canMakeReservations(),
      needsApprovalForReservations: this.needsApprovalForReservations(),
      canMakeAdvanceReservations: this.canMakeAdvanceReservations()
    };
  }
}
