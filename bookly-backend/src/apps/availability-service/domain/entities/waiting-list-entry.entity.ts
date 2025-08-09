/**
 * RF-14: Waiting List Entry Entity
 * Represents an entry in a waiting list with priority and notification management
 */

import { UserPriority } from "../../utils";
import { WaitingEntryStatus } from "../../utils";

export interface WaitingListEntryProps {
  id: string;
  waitingListId: string;
  userId: string;
  resourceId: string;
  
  // Position and priority management
  position: number;
  priority: UserPriority;
  
  // Notification configuration
  confirmationTimeLimit: number; // Minutes to confirm when notified
  
  // Status tracking
  status: WaitingEntryStatus;
  
  // Timestamps
  requestedAt: Date;
  notifiedAt?: Date;
  confirmedAt?: Date;
  expiredAt?: Date;
}

export class WaitingListEntryEntity {
  private constructor(private readonly props: WaitingListEntryProps) {}

  static create(props: Omit<WaitingListEntryProps, 'id' | 'requestedAt'>): WaitingListEntryEntity {
    return new WaitingListEntryEntity({
      ...props,
      id: '', // Will be set by repository
      requestedAt: new Date(),
      status: props.status || WaitingEntryStatus.WAITING,
      confirmationTimeLimit: props.confirmationTimeLimit || 10 // Default 10 minutes
    });
  }

  static fromPersistence(props: WaitingListEntryProps): WaitingListEntryEntity {
    return new WaitingListEntryEntity(props);
  }

  // Getters
  get id(): string { return this.props.id; }
  get waitingListId(): string { return this.props.waitingListId; }
  get userId(): string { return this.props.userId; }
  get position(): number { return this.props.position; }
  get priority(): UserPriority { return this.props.priority; }
  get confirmationTimeLimit(): number { return this.props.confirmationTimeLimit; }
  get status(): WaitingEntryStatus { return this.props.status; }
  get resourceId(): string { return this.props.resourceId; }
  get requestedAt(): Date { return this.props.requestedAt; }
  get notifiedAt(): Date | undefined { return this.props.notifiedAt; }
  get confirmedAt(): Date | undefined { return this.props.confirmedAt; }
  get expiredAt(): Date | undefined { return this.props.expiredAt; }

  // Business logic methods

  /**
   * Validates if the waiting list entry is valid
   */
  validate(): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (!this.props.waitingListId) {
      errors.push('Waiting list ID is required');
    }

    if (!this.props.userId) {
      errors.push('User ID is required');
    }

    if (this.props.position < 1) {
      errors.push('Position must be at least 1');
    }

    if (this.props.confirmationTimeLimit < 1) {
      errors.push('Confirmation time limit must be at least 1 minute');
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  /**
   * Notifies the user about availability and starts confirmation timer
   */
  notify(): void {
    if (this.props.status !== WaitingEntryStatus.WAITING) {
      throw new Error('Only waiting entries can be notified');
    }

    this.props.status = WaitingEntryStatus.NOTIFIED;
    this.props.notifiedAt = new Date();
  }

  /**
   * Confirms the user's acceptance of the available slot
   */
  confirm(): void {
    if (this.props.status !== WaitingEntryStatus.NOTIFIED) {
      throw new Error('Only notified entries can be confirmed');
    }

    if (this.isExpired()) {
      throw new Error('Cannot confirm expired entry');
    }

    this.props.status = WaitingEntryStatus.CONFIRMED;
    this.props.confirmedAt = new Date();
  }

  /**
   * Cancels the waiting list entry
   */
  cancel(): void {
    if (this.props.status === WaitingEntryStatus.CANCELLED) {
      throw new Error('Entry is already cancelled');
    }

    this.props.status = WaitingEntryStatus.CANCELLED;
  }

  /**
   * Expires the entry due to timeout
   */
  expire(): void {
    if (this.props.status !== WaitingEntryStatus.NOTIFIED) {
      throw new Error('Only notified entries can expire');
    }

    this.props.status = WaitingEntryStatus.EXPIRED;
    this.props.expiredAt = new Date();
  }

  /**
   * Updates the position in the waiting list
   */
  updatePosition(newPosition: number): void {
    if (newPosition < 1) {
      throw new Error('Position must be at least 1');
    }

    this.props.position = newPosition;
  }

  /**
   * Escalates the priority of the entry
   */
  escalatePriority(newPriority: UserPriority): void {
    const priorityOrder = [
      UserPriority.EXTERNAL,
      UserPriority.STUDENT,
      UserPriority.TEACHER,
      UserPriority.PROGRAM_DIRECTOR,
      UserPriority.ADMIN_GENERAL
    ];

    const currentIndex = priorityOrder.indexOf(this.props.priority);
    const newIndex = priorityOrder.indexOf(newPriority);

    if (newIndex <= currentIndex) {
      throw new Error('Can only escalate to higher priority');
    }

    this.props.priority = newPriority;
  }

  /**
   * Checks if the entry is waiting
   */
  isWaiting(): boolean {
    return this.props.status === WaitingEntryStatus.WAITING;
  }

  /**
   * Checks if the entry has been notified
   */
  isNotified(): boolean {
    return this.props.status === WaitingEntryStatus.NOTIFIED;
  }

  /**
   * Checks if the entry is confirmed
   */
  isConfirmed(): boolean {
    return this.props.status === WaitingEntryStatus.CONFIRMED;
  }

  /**
   * Checks if the entry is expired
   */
  isExpired(): boolean {
    if (this.props.status === WaitingEntryStatus.EXPIRED) {
      return true;
    }

    if (this.props.status === WaitingEntryStatus.NOTIFIED && this.props.notifiedAt) {
      const expirationTime = new Date(this.props.notifiedAt);
      expirationTime.setMinutes(expirationTime.getMinutes() + this.props.confirmationTimeLimit);
      return new Date() > expirationTime;
    }

    return false;
  }

  /**
   * Checks if the entry is cancelled
   */
  isCancelled(): boolean {
    return this.props.status === WaitingEntryStatus.CANCELLED;
  }

  /**
   * Gets the expiration time for the notification
   */
  getExpirationTime(): Date | null {
    if (!this.props.notifiedAt) {
      return null;
    }

    const expirationTime = new Date(this.props.notifiedAt);
    expirationTime.setMinutes(expirationTime.getMinutes() + this.props.confirmationTimeLimit);
    return expirationTime;
  }

  /**
   * Gets the remaining time in minutes before expiration
   */
  getRemainingMinutes(): number | null {
    const expirationTime = this.getExpirationTime();
    if (!expirationTime) {
      return null;
    }

    const now = new Date();
    const remainingMs = expirationTime.getTime() - now.getTime();
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
   * Compares this entry with another for priority sorting
   */
  comparePriority(other: WaitingListEntryEntity): number {
    const thisWeight = this.getPriorityWeight();
    const otherWeight = other.getPriorityWeight();

    if (thisWeight !== otherWeight) {
      return otherWeight - thisWeight; // Higher priority first
    }

    // If same priority, earlier request time wins
    return this.props.requestedAt.getTime() - other.props.requestedAt.getTime();
  }

  // Conversion methods
  toPersistence(): WaitingListEntryProps {
    return { ...this.props };
  }

  toJSON() {
    return {
      id: this.props.id,
      waitingListId: this.props.waitingListId,
      userId: this.props.userId,
      position: this.props.position,
      priority: this.props.priority,
      confirmationTimeLimit: this.props.confirmationTimeLimit,
      status: this.props.status,
      requestedAt: this.props.requestedAt,
      notifiedAt: this.props.notifiedAt,
      confirmedAt: this.props.confirmedAt,
      expiredAt: this.props.expiredAt,
      expirationTime: this.getExpirationTime(),
      remainingMinutes: this.getRemainingMinutes(),
      priorityWeight: this.getPriorityWeight()
    };
  }
}
