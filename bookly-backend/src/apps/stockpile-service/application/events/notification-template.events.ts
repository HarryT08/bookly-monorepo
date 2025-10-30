export class NotificationChannelCreatedEvent {
  constructor(
    public readonly channelId: string,
    public readonly name: string,
    public readonly displayName: string
  ) {}
}

export class NotificationTemplateCreatedEvent {
  constructor(
    public readonly templateId: string,
    public readonly name: string,
    public readonly channelId: string,
    public readonly eventType: string,
    public readonly resourceType?: string,
    public readonly categoryId?: string,
    public readonly createdBy?: string
  ) {}
}

export class NotificationTemplateUpdatedEvent {
  constructor(
    public readonly templateId: string,
    public readonly name: string,
    public readonly channelId: string,
    public readonly eventType: string
  ) {}
}

export class NotificationConfigCreatedEvent {
  constructor(
    public readonly configId: string,
    public readonly programId?: string,
    public readonly resourceType?: string,
    public readonly categoryId?: string,
    public readonly channelId?: string,
    public readonly createdBy?: string
  ) {}
}

export class NotificationSentEvent {
  constructor(
    public readonly notificationId: string,
    public readonly templateId: string,
    public readonly reservationId: string,
    public readonly recipientId: string,
    public readonly channel: string,
    public readonly subject: string
  ) {}
}

export class BatchNotificationsSentEvent {
  constructor(
    public readonly channelId: string,
    public readonly notificationIds: string[],
    public readonly count: number
  ) {}
}

export class NotificationMarkedAsReadEvent {
  constructor(
    public readonly notificationId: string,
    public readonly userId: string,
    public readonly readAt: Date
  ) {}
}
