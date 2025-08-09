import { IQuery } from '@nestjs/cqrs';
import { NotificationEventType } from '../../utils/notification-event-type.enum';
import { NotificationChannelType } from '@/apps/availability-service/utils';

// Get Notification Channels Query
export class GetNotificationChannelsQuery implements IQuery {
  constructor(
    public readonly isActive?: boolean
  ) {}
}

// Get Notification Channel by ID Query
export class GetNotificationChannelByIdQuery implements IQuery {
  constructor(
    public readonly id: string
  ) {}
}

// Get Notification Templates Query
export class GetNotificationTemplatesQuery implements IQuery {
  constructor(
    public readonly channelId?: string,
    public readonly eventType?: NotificationEventType,
    public readonly resourceType?: string,
    public readonly categoryId?: string,
    public readonly isActive?: boolean,
    public readonly page: number = 1,
    public readonly limit: number = 10
  ) {}
}

// Get Notification Template by ID Query
export class GetNotificationTemplateByIdQuery implements IQuery {
  constructor(
    public readonly id: string
  ) {}
}

// Get Default Notification Template Query
export class GetDefaultNotificationTemplateQuery implements IQuery {
  constructor(
    public readonly channelId: string,
    public readonly eventType: NotificationEventType,
    public readonly resourceType?: string,
    public readonly categoryId?: string
  ) {}
}

// Get Notification Configs Query
export class GetNotificationConfigsQuery implements IQuery {
  constructor(
    public readonly programId?: string,
    public readonly resourceType?: string,
    public readonly categoryId?: string,
    public readonly channelId?: string,
    public readonly isEnabled?: boolean
  ) {}
}

// Get Notification Config by ID Query
export class GetNotificationConfigByIdQuery implements IQuery {
  constructor(
    public readonly id: string
  ) {}
}

// Get Sent Notifications by Reservation Query
export class GetSentNotificationsByReservationQuery implements IQuery {
  constructor(
    public readonly reservationId: string
  ) {}
}

// Get Sent Notifications by Recipient Query
export class GetSentNotificationsByRecipientQuery implements IQuery {
  constructor(
    public readonly recipientId: string,
    public readonly channel?: NotificationChannelType,
    public readonly status?: string,
    public readonly page: number = 1,
    public readonly limit: number = 10
  ) {}
}

// Get Pending Notifications Query
export class GetPendingNotificationsQuery implements IQuery {
  constructor(
    public readonly channelId?: string
  ) {}
}

// Get Notifications for Batch Query
export class GetNotificationsForBatchQuery implements IQuery {
  constructor(
    public readonly channelId: string,
    public readonly batchIntervalMs: number
  ) {}
}

// Get Notification Template Variables Query
export class GetNotificationTemplateVariablesQuery implements IQuery {
  constructor(
    public readonly templateId: string
  ) {}
}

// Get Available Notification Variables Query
export class GetAvailableNotificationVariablesQuery implements IQuery {
  constructor(
    public readonly eventType: NotificationEventType,
    public readonly resourceType?: string
  ) {}
}
