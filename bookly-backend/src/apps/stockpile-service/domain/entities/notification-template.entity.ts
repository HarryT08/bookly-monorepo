import { NotificationChannelType } from '@apps/availability-service/utils/notification-channel-type.enum';
import { NotificationEventType } from '@apps/stockpile-service/utils/notification-event-type.enum';
import { PaginationDto } from '@libs/dto/common/pagination.dto';
import { DocumentDeliveryMethod } from '@apps/stockpile-service/utils/document-delivery-method.enum';
import { NotificationStatus } from '@apps/stockpile-service/utils/notification-status.enum';

export class NotificationChannelEntity {
  constructor(
    public readonly id: string,
    public readonly name: string,
    public readonly channel: NotificationChannelType,
    public readonly displayName: string,
    public readonly supportsAttachments: boolean = false,
    public readonly supportsLinks: boolean = true,
    public readonly maxMessageLength?: number,
    public readonly isActive: boolean = true,
    public readonly settings: any = {},
    public readonly createdAt: Date = new Date(),
    public readonly updatedAt: Date = new Date()
  ) {}

  public canSendMessage(messageLength: number): boolean {
    if (!this.isActive) return false;
    if (this.maxMessageLength && messageLength > this.maxMessageLength) return false;
    return true;
  }

  public canSendAttachment(): boolean {
    return this.isActive && this.supportsAttachments;
  }

  public canSendLink(): boolean {
    return this.isActive && this.supportsLinks;
  }
}

export class NotificationTemplateEntity {
  constructor(
    public readonly id: string,
    public readonly name: string,
    public readonly channelId: string,
    public readonly eventType: NotificationEventType,
    public readonly content: string,
    public readonly createdBy: string,
    public readonly resourceType?: string,
    public readonly categoryId?: string,
    public readonly subject?: string,
    public readonly variables: any = {},
    public readonly isDefault: boolean = false,
    public readonly isActive: boolean = true,
    public readonly attachDocument: boolean = false,
    public readonly documentAsLink: boolean = false,
    public readonly createdAt: Date = new Date(),
    public readonly updatedAt: Date = new Date()
  ) {}

  public getVariableNames(): string[] {
    if (!this.variables || typeof this.variables !== 'object') {
      return [];
    }
    return Object.keys(this.variables);
  }

  public validateVariables(providedVariables: any): { isValid: boolean; missingVariables: string[] } {
    const requiredVariables = this.getVariableNames();
    const providedKeys = Object.keys(providedVariables || {});
    const missingVariables = requiredVariables.filter(variable => !providedKeys.includes(variable));
    
    return {
      isValid: missingVariables.length === 0,
      missingVariables
    };
  }

  public replaceVariables(text: string, variables: any): string {
    let processedText = text;
    
    for (const [key, value] of Object.entries(variables)) {
      const regex = new RegExp(`\\[${key}\\]`, 'g');
      processedText = processedText.replace(regex, String(value || ''));
    }
    
    return processedText;
  }

  public generateMessage(variables: any): { subject?: string; content: string } {
    return {
      subject: this.subject ? this.replaceVariables(this.subject, variables) : undefined,
      content: this.replaceVariables(this.content, variables)
    };
  }

  public isApplicableForScope(resourceType?: string, categoryId?: string): boolean {
    // If template has no scope restrictions, it applies to all
    if (!this.resourceType && !this.categoryId) {
      return true;
    }

    // Check resource type match
    if (this.resourceType && resourceType !== this.resourceType) {
      return false;
    }

    // Check category match
    if (this.categoryId && categoryId !== this.categoryId) {
      return false;
    }

    return true;
  }

  public shouldAttachDocument(): boolean {
    return this.attachDocument && !this.documentAsLink;
  }

  public shouldIncludeDocumentLink(): boolean {
    return this.attachDocument && this.documentAsLink;
  }
}

export class NotificationConfigEntity {
  constructor(
    public readonly id: string,
    public readonly channelId: string,
    public readonly createdBy: string,
    public readonly programId?: string,
    public readonly resourceType?: string,
    public readonly categoryId?: string,
    public readonly isEnabled: boolean = true,
    public readonly isImmediate: boolean = true,
    public readonly batchInterval?: number,
    public readonly sendDocuments: boolean = false,
    public readonly documentMethod?: DocumentDeliveryMethod,
    public readonly createdAt: Date = new Date(),
    public readonly updatedAt: Date = new Date()
  ) {}

  public isApplicableForScope(programId?: string, resourceType?: string, categoryId?: string): boolean {
    // Check program match
    if (this.programId && programId !== this.programId) {
      return false;
    }

    // Check resource type match
    if (this.resourceType && resourceType !== this.resourceType) {
      return false;
    }

    // Check category match
    if (this.categoryId && categoryId !== this.categoryId) {
      return false;
    }

    return true;
  }

  public shouldSendImmediately(): boolean {
    return this.isEnabled && this.isImmediate;
  }

  public shouldBatch(): boolean {
    return this.isEnabled && !this.isImmediate && this.batchInterval && this.batchInterval > 0;
  }

  public getBatchIntervalMs(): number {
    return (this.batchInterval || 30) * 60 * 1000; // Convert minutes to milliseconds
  }
}

export class SentNotificationEntity {
  constructor(
    public readonly id: string,
    public readonly templateId: string,
    public readonly reservationId: string,
    public readonly recipientId: string,
    public readonly channel: NotificationChannelType,
    public readonly status: NotificationStatus,
    public readonly content: string,
    public readonly subject?: string,
    public readonly hasAttachment: boolean = false,
    public readonly attachmentPath?: string,
    public readonly sentAt?: Date,
    public readonly deliveredAt?: Date,
    public readonly readAt?: Date,
    public readonly errorMessage?: string,
    public readonly createdAt: Date = new Date(),
    public readonly updatedAt: Date = new Date(),
    public readonly variables: any = {},
  ) {}

  public markAsSent(): SentNotificationEntity {
    return new SentNotificationEntity(
      this.id,
      this.templateId,
      this.reservationId,
      this.recipientId,
      this.channel,
      NotificationStatus.SENT,
      this.subject,
      this.content,
      this.hasAttachment,
      this.attachmentPath,
      new Date(),
      this.deliveredAt,
      this.readAt,
      this.errorMessage,
      this.createdAt,
      new Date(),
      this.variables
    );
  }

  public markAsDelivered(): SentNotificationEntity {
    return new SentNotificationEntity(
      this.id,
      this.templateId,
      this.reservationId,
      this.recipientId,
      this.channel,
      NotificationStatus.DELIVERED,
      this.subject,
      this.content,
      this.hasAttachment,
      this.attachmentPath,
      this.sentAt,
      new Date(),
      this.readAt,
      this.errorMessage,
      this.createdAt,
      new Date(),
      this.variables
    );
  }

  public markAsRead(): SentNotificationEntity {
    return new SentNotificationEntity(
      this.id,
      this.templateId,
      this.reservationId,
      this.recipientId,
      this.channel,
      NotificationStatus.DELIVERED,
      this.subject,
      this.content,
      this.hasAttachment,
      this.attachmentPath,
      this.sentAt,
      this.deliveredAt,
      new Date(),
      this.errorMessage,
      this.createdAt,
      new Date(),
      this.variables
    );
  }

  public markAsFailed(errorMessage: string): SentNotificationEntity {
    return new SentNotificationEntity(
      this.id,
      this.templateId,
      this.reservationId,
      this.recipientId,
      this.channel,
      NotificationStatus.FAILED,
      this.subject,
      this.content,
      this.hasAttachment,
      this.attachmentPath,
      this.sentAt,
      this.deliveredAt,
      this.readAt,
      errorMessage,
      this.createdAt,
      new Date(),
      this.variables
    );
  }

  public isPending(): boolean {
    return this.status === NotificationStatus.PENDING;
  }

  public isDelivered(): boolean {
    return this.status === NotificationStatus.DELIVERED;
  }

  public hasFailed(): boolean {
    return this.status === NotificationStatus.FAILED;
  }
}


