import { ApprovalRequestStatus } from '@apps/stockpile-service/utils/approval-request-status.enum';
import { ApprovalActionType } from '@apps/stockpile-service/utils/approval-action-type.enum';

export class ApprovalFlowEntity {
  constructor(
    public readonly id: string,
    public readonly name: string,
    public readonly createdBy: string,
    public readonly description?: string,
    public readonly programId?: string,
    public readonly resourceType?: string,
    public readonly categoryId?: string,
    public readonly isDefault: boolean = false,
    public readonly requiresAllApprovals: boolean = true,
    public readonly autoApprovalEnabled: boolean = false,
    public readonly reviewTimeHours?: number,
    public readonly reminderHours?: number,
    public readonly isActive: boolean = true,
    public readonly createdAt: Date = new Date(),
    public readonly updatedAt: Date = new Date(),
    public readonly levels: ApprovalLevelEntity[] = []
  ) {}

  public canAutoApprove(): boolean {
    return this.autoApprovalEnabled && this.levels.length === 0;
  }

  public requiresSequentialApproval(): boolean {
    return this.requiresAllApprovals && this.levels.length > 1;
  }

  public shouldTimeout(reservationDate: Date): boolean {
    if (!this.reviewTimeHours) return false;
    const timeoutDate = new Date(reservationDate.getTime() - (this.reviewTimeHours * 60 * 60 * 1000));
    return new Date() >= timeoutDate;
  }

  public shouldSendReminder(reservationDate: Date): boolean {
    if (!this.reminderHours) return false;
    const reminderDate = new Date(reservationDate.getTime() - (this.reminderHours * 60 * 60 * 1000));
    return new Date() >= reminderDate;
  }

  public getNextLevel(currentLevel: number): ApprovalLevelEntity | null {
    const nextLevel = this.levels.find(level => level.level === currentLevel + 1);
    return nextLevel || null;
  }

  public isComplete(currentLevel: number): boolean {
    if (!this.requiresAllApprovals) {
      return currentLevel > 0; // Any level approved
    }
    return currentLevel >= this.levels.length; // All levels completed
  }
}

export class ApprovalLevelEntity {
  constructor(
    public readonly id: string,
    public readonly flowId: string,
    public readonly level: number,
    public readonly name: string,
    public readonly description?: string,
    public readonly approverRoles: string[] = [],
    public readonly approverUsers: string[] = [],
    public readonly requiresAll: boolean = false,
    public readonly timeoutHours?: number,
    public readonly isActive: boolean = true,
    public readonly createdAt: Date = new Date(),
    public readonly updatedAt: Date = new Date()
  ) {}

  public canUserApprove(userId: string, userRoles: string[]): boolean {
    // Check if user is specifically listed
    if (this.approverUsers.includes(userId)) {
      return true;
    }

    // Check if user has any of the required roles
    return this.approverRoles.some(role => userRoles.includes(role));
  }

  public shouldTimeout(requestedAt: Date): boolean {
    if (!this.timeoutHours) return false;
    const timeoutDate = new Date(requestedAt.getTime() + (this.timeoutHours * 60 * 60 * 1000));
    return new Date() >= timeoutDate;
  }

  public getAllApprovers(): string[] {
    return [...this.approverUsers];
  }
}

export class ApprovalRequestEntity {
  constructor(
    public readonly id: string,
    public readonly reservationId: string,
    public readonly levelId: string,
    public readonly status: ApprovalRequestStatus,
    public readonly approverId?: string,
    public readonly comments?: string,
    public readonly requestedAt: Date = new Date(),
    public readonly respondedAt?: Date,
    public readonly timeoutAt?: Date,
    public readonly notificationsSent: any = {},
    public readonly createdAt: Date = new Date(),
    public readonly updatedAt: Date = new Date()
  ) {}

  public approve(approverId: string, comments?: string): ApprovalRequestEntity {
    return new ApprovalRequestEntity(
      this.id,
      this.reservationId,
      this.levelId,
      ApprovalRequestStatus.APPROVED,
      approverId,
      comments,
      this.requestedAt,
      new Date(),
      this.timeoutAt,
      this.notificationsSent,
      this.createdAt,
      new Date()
    );
  }

  public reject(approverId: string, comments?: string): ApprovalRequestEntity {
    return new ApprovalRequestEntity(
      this.id,
      this.reservationId,
      this.levelId,
      ApprovalRequestStatus.REJECTED,
      approverId,
      comments,
      this.requestedAt,
      new Date(),
      this.timeoutAt,
      this.notificationsSent,
      this.createdAt,
      new Date()
    );
  }

  public timeout(): ApprovalRequestEntity {
    return new ApprovalRequestEntity(
      this.id,
      this.reservationId,
      this.levelId,
      ApprovalRequestStatus.TIMEOUT,
      this.approverId,
      this.comments,
      this.requestedAt,
      this.respondedAt,
      this.timeoutAt,
      this.notificationsSent,
      this.createdAt,
      new Date()
    );
  }

  public isExpired(): boolean {
    return this.timeoutAt ? new Date() >= this.timeoutAt : false;
  }

  public isPending(): boolean {
    return this.status === ApprovalRequestStatus.PENDING;
  }

  public isCompleted(): boolean {
    return [
      ApprovalRequestStatus.APPROVED,
      ApprovalRequestStatus.REJECTED,
      ApprovalRequestStatus.TIMEOUT
    ].includes(this.status);
  }
}

export class ApprovalActionEntity {
  constructor(
    public readonly id: string,
    public readonly requestId: string,
    public readonly userId: string,
    public readonly action: ApprovalActionType,
    public readonly comments?: string,
    public readonly ipAddress?: string,
    public readonly userAgent?: string,
    public readonly createdAt: Date = new Date()
  ) {}
}


