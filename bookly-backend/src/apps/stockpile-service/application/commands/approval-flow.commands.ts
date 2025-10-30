import { ICommand } from '@nestjs/cqrs';

// Create Approval Flow Command
export class CreateApprovalFlowCommand implements ICommand {
  constructor(
    public readonly name: string,
    public readonly description?: string,
    public readonly programId?: string,
    public readonly resourceType?: string,
    public readonly categoryId?: string,
    public readonly isDefault: boolean = false,
    public readonly requiresAllApprovals: boolean = true,
    public readonly autoApprovalEnabled: boolean = false,
    public readonly createdBy: string = null,
    public readonly reviewTimeHours?: number,
    public readonly reminderHours?: number
    
  ) {}
}

// Update Approval Flow Command
export class UpdateApprovalFlowCommand implements ICommand {
  constructor(
    public readonly id: string,
    public readonly name?: string,
    public readonly description?: string,
    public readonly requiresAllApprovals?: boolean,
    public readonly autoApprovalEnabled?: boolean,
    public readonly reviewTimeHours?: number,
    public readonly reminderHours?: number,
    public readonly isActive?: boolean
  ) {}
}

// Create Approval Level Command
export class CreateApprovalLevelCommand implements ICommand {
  constructor(
    public readonly flowId: string,
    public readonly level: number,
    public readonly name: string,
    public readonly description?: string,
    public readonly approverRoles: string[] = [],
    public readonly approverUsers: string[] = [],
    public readonly requiresAll: boolean = false,
    public readonly timeoutHours?: number
  ) {}
}

// Submit Reservation for Approval Command
export class SubmitReservationForApprovalCommand implements ICommand {
  constructor(
    public readonly reservationId: string,
    public readonly userId: string,
    public readonly resourceId: string,
    public readonly resourceType?: string,
    public readonly categoryId?: string,
    public readonly programId?: string
  ) {}
}

// Process Approval Request Command
export class ProcessApprovalRequestCommand implements ICommand {
  constructor(
    public readonly requestId: string,
    public readonly approverId: string,
    public readonly action: 'APPROVE' | 'REJECT',
    public readonly comments?: string,
    public readonly ipAddress?: string,
    public readonly userAgent?: string
  ) {}
}

// Cancel Reservation Command
export class CancelReservationCommand implements ICommand {
  constructor(
    public readonly reservationId: string,
    public readonly userId: string,
    public readonly reason?: string
  ) {}
}

// Process Timeout Command
export class ProcessTimeoutCommand implements ICommand {
  constructor(
    public readonly requestId: string
  ) {}
}

// Send Approval Reminder Command
export class SendApprovalReminderCommand implements ICommand {
  constructor(
    public readonly requestId: string,
    public readonly reminderType: 'FIRST' | 'SECOND' | 'FINAL'
  ) {}
}
