import { ICommand } from '@nestjs/cqrs';
import { NotificationChannelType } from '@/apps/availability-service/utils/notification-channel-type.enum';
import { NotificationEventType } from '@/apps/stockpile-service/utils/notification-event-type.enum';
import { DocumentDeliveryMethod } from '@/apps/stockpile-service/utils/document-delivery-method.enum';

// Create Notification Channel Command
export class CreateNotificationChannelCommand implements ICommand {
  constructor(
    public readonly name: string,
    public readonly channel: NotificationChannelType = NotificationChannelType.EMAIL,
    public readonly displayName: string,
    public readonly supportsAttachments: boolean = false,
    public readonly supportsLinks: boolean = true,
    public readonly maxMessageLength?: number,
    public readonly settings?: any
  ) {}
}

// Create Notification Template Command
export class CreateNotificationTemplateCommand implements ICommand {
  constructor(
    public readonly name: string,
    public readonly channelId: string,
    public readonly eventType: NotificationEventType,
    public readonly resourceType?: string,
    public readonly categoryId?: string,
    public readonly subject?: string,
    public readonly variables: any = {},
    public readonly isDefault: boolean = false,
    public readonly attachDocument: boolean = false,
    public readonly documentAsLink: boolean = false,
    public readonly createdAt: Date = new Date(),
    public readonly updatedAt: Date = new Date(),
    public readonly content: string = null,
    public readonly createdBy: string = null
  ) {}
}

// Update Notification Template Command
export class UpdateNotificationTemplateCommand implements ICommand {
  constructor(
    public readonly id: string,
    public readonly name?: string,
    public readonly subject?: string,
    public readonly content?: string,
    public readonly variables?: any,
    public readonly attachDocument?: boolean,
    public readonly documentAsLink?: boolean,
    public readonly isActive?: boolean
  ) {}
}

// Create Notification Config Command
export class CreateNotificationConfigCommand implements ICommand {
  constructor(
    public readonly programId?: string,
    public readonly resourceType?: string,
    public readonly categoryId?: string,
    public readonly channelId: string = null,
    public readonly isEnabled: boolean = true,
    public readonly isImmediate: boolean = true,
    public readonly batchInterval?: number,
    public readonly sendDocuments: boolean = false,
    public readonly documentMethod?: DocumentDeliveryMethod,
    public readonly createdBy: string = null,
    public readonly createdAt: Date = new Date(),
    public readonly updatedAt: Date = new Date()
  ) {}
}

// Send Notification Command
export class SendNotificationCommand implements ICommand {
  constructor(
    public readonly channel: NotificationChannelType,
    public readonly templateId: string,
    public readonly reservationId: string,
    public readonly recipientId: string,
    public readonly variables: any,
    public readonly hasAttachment: boolean = false,
    public readonly attachmentPath?: string
  ) {}
}

// Send Batch Notifications Command
export class SendBatchNotificationsCommand implements ICommand {
  constructor(
    public readonly channelId: string = null,
    public readonly notificationIds: string[]
  ) {}
}

// Mark Notification as Read Command
export class MarkNotificationAsReadCommand implements ICommand {
  constructor(
    public readonly notificationId: string,
    public readonly userId: string
  ) {}
}
