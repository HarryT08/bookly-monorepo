export class ReservationSubmittedEvent {
  constructor(
    public readonly reservationId: string,
    public readonly userId: string,
    public readonly resourceId: string,
    public readonly approvalFlowId?: string,
    public readonly timestamp: Date = new Date(),
    public readonly variables: any = null
  ) {}
}

export class ApprovalRequestCreatedEvent {
  constructor(
    public readonly requestId: string,
    public readonly reservationId: string,
    public readonly levelId: string,
    public readonly approverIds: string[],
    public readonly variables: any = {},
    public readonly timeoutAt?: Date,
    public readonly timestamp: Date = new Date()
  ) {}
}

export class ReservationApprovedEvent {
  constructor(
    public readonly reservationId: string,
    public readonly requestId: string,
    public readonly approverId: string,
    public readonly levelId: string,
    public readonly comments?: string,
    public readonly isComplete: boolean = false,
    public readonly timestamp: Date = new Date(),
    public readonly variables: any = {}
  ) {}
}

export class ReservationRejectedEvent {
  constructor(
    public readonly reservationId: string,
    public readonly requestId: string,
    public readonly approverId: string,
    public readonly levelId: string,
    public readonly reason: string,
    public readonly comments?: string,
    public readonly timestamp: Date = new Date(),
    public readonly variables: any = {}
  ) {}
}

export class ReservationCancelledEvent {
  constructor(
    public readonly reservationId: string,
    public readonly userId: string,
    public readonly reason?: string,
    public readonly timestamp: Date = new Date()
  ) {}
}

export class ApprovalRequestTimeoutEvent {
  constructor(
    public readonly requestId: string,
    public readonly reservationId: string,
    public readonly levelId: string,
    public readonly timestamp: Date = new Date()
  ) {}
}

export class ApprovalReminderEvent {
  constructor(
    public readonly requestId: string,
    public readonly reservationId: string,
    public readonly approverIds: string[],
    public readonly reminderType: 'FIRST' | 'SECOND' | 'FINAL',
    public readonly timestamp: Date = new Date()
  ) {}
}

export class DocumentGenerationRequestedEvent {
  constructor(
    public readonly templateId: string,
    public readonly reservationId: string,
    public readonly eventType: string,
    public readonly variables: any,
    public readonly generatedBy: string,
    public readonly timestamp: Date = new Date()
  ) {}
}

export class DocumentGeneratedEvent {
  constructor(
    public readonly documentId: string,
    public readonly templateId: string,
    public readonly reservationId: string,
    public readonly filePath: string,
    public readonly timestamp: Date = new Date()
  ) {}
}

export class NotificationRequestedEvent {
  constructor(
    public readonly templateId: string,
    public readonly reservationId: string,
    public readonly recipientId: string,
    public readonly eventType: string,
    public readonly variables: any,
    public readonly attachmentPath?: string,
    public readonly timestamp: Date = new Date()
  ) {}
}

export class NotificationSentEvent {
  constructor(
    public readonly notificationId: string,
    public readonly templateId: string,
    public readonly reservationId: string,
    public readonly recipientId: string,
    public readonly channel: string,
    public readonly status: string,
    public readonly timestamp: Date = new Date()
  ) {}
}
