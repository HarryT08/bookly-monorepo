/**
 * RF-15: Reassignment Request Entity
 * Represents a request to reassign a reservation to a different resource
 */
import { ReassignmentReason } from '../../utils/reassignment-reason.enum';
import { ReassignmentStatus } from '../../utils/reassignment-status.enum';
import { UserResponse } from '../../utils/user-response.enum';
import { UserPriority } from '../../utils/user-priority.enum';



export interface ReassignmentRequestProps {
  id: string;
  originalReservationId: string;
  requestedBy: string; // User ID who requested the reassignment
  
  // Reassignment details
  reason: ReassignmentReason;
  customReason?: string; // For OTHER reason type
  suggestedResourceId?: string;
  
  // Status and response tracking
  status: ReassignmentStatus;
  userResponse: UserResponse;
  rejectionCount: number;
  priority: UserPriority;
  
  // Deadlines and timestamps
  responseDeadline?: Date;
  respondedAt?: Date;
  createdAt: Date;
  updatedAt: Date;

  // Additional properties
  acceptEquivalentResources: boolean;
  acceptAlternativeTimeSlots: boolean;
  capacityTolerancePercent: number;
  requiredFeatures: string[];
  preferredFeatures: string[];
  maxDistanceMeters: number;
  compensationInfo: string;
  internalNotes: string;
  tags: string[];
  impactLevel: number;
  estimatedResolutionHours: number;
  relatedTicketId: string;
  affectedProgramId: string;
  minAdvanceNoticeHours: number;
  allowPartialReassignment: boolean;
  requireUserConfirmation: boolean;
}

export class ReassignmentRequestEntity {
  private constructor(private readonly props: ReassignmentRequestProps) {}

  static create(props: Omit<ReassignmentRequestProps, 'id' | 'createdAt' | 'updatedAt'>): ReassignmentRequestEntity {
    const now = new Date();
    return new ReassignmentRequestEntity({
      ...props,
      id: '', // Will be set by repository
      createdAt: now,
      updatedAt: now,
      status: props.status || ReassignmentStatus.PENDING,
      userResponse: props.userResponse || UserResponse.PENDING,
      rejectionCount: props.rejectionCount || 0
    });
  }

  static fromPersistence(props: ReassignmentRequestProps): ReassignmentRequestEntity {
    return new ReassignmentRequestEntity(props);
  }

  // Getters
  get id(): string { return this.props.id; }
  get originalReservationId(): string { return this.props.originalReservationId; }
  get requestedBy(): string { return this.props.requestedBy; }
  get reason(): ReassignmentReason { return this.props.reason; }
  get customReason(): string | undefined { return this.props.customReason; }
  get suggestedResourceId(): string | undefined { return this.props.suggestedResourceId; }
  get status(): ReassignmentStatus { return this.props.status; }
  get userResponse(): UserResponse { return this.props.userResponse; }
  get rejectionCount(): number { return this.props.rejectionCount; }
  get priority(): UserPriority { return this.props.priority; }
  get responseDeadline(): Date | undefined { return this.props.responseDeadline; }
  get respondedAt(): Date | undefined { return this.props.respondedAt; }
  get createdAt(): Date { return this.props.createdAt; }
  get updatedAt(): Date { return this.props.updatedAt; }
  get acceptEquivalentResources(): boolean { return this.props.acceptEquivalentResources; }
  get acceptAlternativeTimeSlots(): boolean { return this.props.acceptAlternativeTimeSlots; }
  get capacityTolerancePercent(): number | undefined { return this.props.capacityTolerancePercent; }
  get requiredFeatures(): string[] | undefined { return this.props.requiredFeatures; }
  get preferredFeatures(): string[] | undefined { return this.props.preferredFeatures; }
  get maxDistanceMeters(): number | undefined { return this.props.maxDistanceMeters; }
  get compensationInfo(): string | undefined { return this.props.compensationInfo; }
  get internalNotes(): string | undefined { return this.props.internalNotes; }
  get tags(): string[] | undefined { return this.props.tags; }
  get impactLevel(): number | undefined { return this.props.impactLevel; }
  get estimatedResolutionHours(): number | undefined { return this.props.estimatedResolutionHours; }
  get relatedTicketId(): string | undefined { return this.props.relatedTicketId; }
  get affectedProgramId(): string | undefined { return this.props.affectedProgramId; }
  get minAdvanceNoticeHours(): number | undefined { return this.props.minAdvanceNoticeHours; }
  get allowPartialReassignment(): boolean { return this.props.allowPartialReassignment; }
  get requireUserConfirmation(): boolean { return this.props.requireUserConfirmation; }
  // Business logic methods

  /**
   * Validates if the reassignment request is valid
   */
  validate(): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (!this.props.originalReservationId) {
      errors.push('Original reservation ID is required');
    }

    if (!this.props.requestedBy) {
      errors.push('Requested by user ID is required');
    }

    if (!this.props.reason) {
      errors.push('Reason is required');
    }

    if (this.props.reason === ReassignmentReason.OTHER && !this.props.customReason?.trim()) {
      errors.push('Custom reason is required when reason is OTHER');
    }

    if (this.props.responseDeadline && this.props.responseDeadline <= new Date()) {
      errors.push('Response deadline must be in the future');
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  /**
   * Sets a suggested resource for the reassignment
   */
  setSuggestedResource(resourceId: string): void {
    if (this.props.status !== ReassignmentStatus.PENDING) {
      throw new Error('Can only set suggested resource for pending requests');
    }

    this.props.suggestedResourceId = resourceId;
    this.props.updatedAt = new Date();
  }

  /**
   * Sets the response deadline
   */
  setResponseDeadline(deadline: Date): void {
    if (deadline <= new Date()) {
      throw new Error('Response deadline must be in the future');
    }

    this.props.responseDeadline = deadline;
    this.props.updatedAt = new Date();
  }

  /**
   * User accepts the reassignment
   */
  accept(): void {
    if (this.props.status !== ReassignmentStatus.PENDING) {
      throw new Error('Only pending requests can be accepted');
    }

    if (this.isExpired()) {
      throw new Error('Cannot accept expired request');
    }

    this.props.status = ReassignmentStatus.ACCEPTED;
    this.props.userResponse = UserResponse.ACCEPTED;
    this.props.respondedAt = new Date();
    this.props.updatedAt = new Date();
  }

  /**
   * User rejects the reassignment
   */
  reject(): void {
    if (this.props.status !== ReassignmentStatus.PENDING) {
      throw new Error('Only pending requests can be rejected');
    }

    if (this.isExpired()) {
      throw new Error('Cannot reject expired request');
    }

    this.props.status = ReassignmentStatus.REJECTED;
    this.props.userResponse = UserResponse.REJECTED;
    this.props.rejectionCount += 1;
    this.props.respondedAt = new Date();
    this.props.updatedAt = new Date();

    // Lower priority after first rejection
    if (this.props.rejectionCount === 1) {
      this.lowerPriority();
    }
  }

  /**
   * Cancels the reassignment request
   */
  cancel(): void {
    if (this.props.status === ReassignmentStatus.CANCELLED) {
      throw new Error('Request is already cancelled');
    }

    this.props.status = ReassignmentStatus.CANCELLED;
    this.props.updatedAt = new Date();
  }

  /**
   * Expires the reassignment request due to timeout
   */
  expire(): void {
    if (this.props.status !== ReassignmentStatus.PENDING) {
      throw new Error('Only pending requests can expire');
    }

    this.props.status = ReassignmentStatus.EXPIRED;
    this.props.updatedAt = new Date();
  }

  /**
   * Checks if the request is pending
   */
  isPending(): boolean {
    return this.props.status === ReassignmentStatus.PENDING;
  }

  /**
   * Checks if the request is accepted
   */
  isAccepted(): boolean {
    return this.props.status === ReassignmentStatus.ACCEPTED;
  }

  /**
   * Checks if the request is rejected
   */
  isRejected(): boolean {
    return this.props.status === ReassignmentStatus.REJECTED;
  }

  /**
   * Checks if the request is cancelled
   */
  isCancelled(): boolean {
    return this.props.status === ReassignmentStatus.CANCELLED;
  }

  /**
   * Checks if the request is expired
   */
  isExpired(): boolean {
    if (this.props.status === ReassignmentStatus.EXPIRED) {
      return true;
    }

    if (this.props.responseDeadline && this.props.status === ReassignmentStatus.PENDING) {
      return new Date() > this.props.responseDeadline;
    }

    return false;
  }

  /**
   * Checks if the request has a suggested resource
   */
  hasSuggestedResource(): boolean {
    return !!this.props.suggestedResourceId;
  }

  /**
   * Gets the time remaining before deadline
   */
  getTimeRemainingMinutes(): number | null {
    if (!this.props.responseDeadline || this.props.status !== ReassignmentStatus.PENDING) {
      return null;
    }

    const now = new Date();
    const remainingMs = this.props.responseDeadline.getTime() - now.getTime();
    return Math.max(0, Math.floor(remainingMs / (1000 * 60)));
  }

  /**
   * Gets the priority weight for sorting (higher number = higher priority)
   */
  getPriorityWeight(): number {
    const weights = {
      [UserPriority.ADMIN_GENERAL]: 5,
      [UserPriority.PROGRAM_DIRECTOR]: 4,
      [UserPriority.TEACHER]: 3,
      [UserPriority.STUDENT]: 2,
      [UserPriority.EXTERNAL]: 1
    };

    return weights[this.props.priority] || 0;
  }

  /**
   * Gets the urgency level based on reason
   */
  getUrgencyLevel(): 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL' {
    switch (this.props.reason) {
      case ReassignmentReason.EMERGENCY:
        return 'CRITICAL';
      case ReassignmentReason.TECHNICAL_ISSUES:
      case ReassignmentReason.FACILITY_UNAVAILABLE:
        return 'HIGH';
      case ReassignmentReason.MAINTENANCE:
      case ReassignmentReason.CAPACITY_CHANGE:
        return 'MEDIUM';
      default:
        return 'LOW';
    }
  }

  /**
   * Checks if this is a high-priority reassignment
   */
  isHighPriority(): boolean {
    const urgency = this.getUrgencyLevel();
    const priority = this.getPriorityWeight();
    
    return urgency === 'CRITICAL' || urgency === 'HIGH' || priority >= 4;
  }

  /**
   * Gets the full reason description
   */
  getReasonDescription(): string {
    if (this.props.reason === ReassignmentReason.OTHER && this.props.customReason) {
      return this.props.customReason;
    }

    const reasonDescriptions = {
      [ReassignmentReason.MAINTENANCE]: 'Scheduled maintenance',
      [ReassignmentReason.TECHNICAL_ISSUES]: 'Technical issues',
      [ReassignmentReason.CAPACITY_CHANGE]: 'Capacity change',
      [ReassignmentReason.FACILITY_UNAVAILABLE]: 'Facility unavailable',
      [ReassignmentReason.EMERGENCY]: 'Emergency situation',
      [ReassignmentReason.ADMINISTRATIVE]: 'Administrative reasons',
      [ReassignmentReason.OTHER]: 'Other reasons'
    };

    return reasonDescriptions[this.props.reason] || 'Unknown reason';
  }

  // Private helper methods

  /**
   * Lowers the user's priority after rejection
   */
  private lowerPriority(): void {
    const priorityDowngrade = {
      [UserPriority.ADMIN_GENERAL]: UserPriority.PROGRAM_DIRECTOR,
      [UserPriority.PROGRAM_DIRECTOR]: UserPriority.TEACHER,
      [UserPriority.TEACHER]: UserPriority.STUDENT,
      [UserPriority.STUDENT]: UserPriority.EXTERNAL,
      [UserPriority.EXTERNAL]: UserPriority.EXTERNAL // Cannot go lower
    };

    this.props.priority = priorityDowngrade[this.props.priority] || this.props.priority;
  }

  // Conversion methods
  toPersistence(): ReassignmentRequestProps {
    return { ...this.props };
  }

  toJSON() {
    return {
      id: this.props.id,
      originalReservationId: this.props.originalReservationId,
      requestedBy: this.props.requestedBy,
      reason: this.props.reason,
      customReason: this.props.customReason,
      suggestedResourceId: this.props.suggestedResourceId,
      status: this.props.status,
      userResponse: this.props.userResponse,
      rejectionCount: this.props.rejectionCount,
      priority: this.props.priority,
      responseDeadline: this.props.responseDeadline,
      respondedAt: this.props.respondedAt,
      createdAt: this.props.createdAt,
      updatedAt: this.props.updatedAt,
      timeRemainingMinutes: this.getTimeRemainingMinutes(),
      priorityWeight: this.getPriorityWeight(),
      urgencyLevel: this.getUrgencyLevel(),
      reasonDescription: this.getReasonDescription(),
      isHighPriority: this.isHighPriority()
    };
  }
}
