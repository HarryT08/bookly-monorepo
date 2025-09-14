import { CommandHandler, ICommandHandler } from "@nestjs/cqrs";
import { Injectable } from "@nestjs/common";
import { LoggingService } from "@libs/logging/logging.service";
import { NotificationTemplateService } from "../../services/notification-template.service";
import {
  NotificationChannelEntity,
  NotificationTemplateEntity,
  NotificationConfigEntity,
  SentNotificationEntity,
} from "../../../domain/entities/notification-template.entity";
import {
  CreateNotificationChannelCommand,
  CreateNotificationTemplateCommand,
  UpdateNotificationTemplateCommand,
  CreateNotificationConfigCommand,
  SendNotificationCommand,
  SendBatchNotificationsCommand,
  MarkNotificationAsReadCommand,
} from "../notification-template.commands";
import {
  NotificationChannelCreatedEvent,
  NotificationTemplateCreatedEvent,
  NotificationTemplateUpdatedEvent,
  NotificationConfigCreatedEvent,
  NotificationSentEvent,
  BatchNotificationsSentEvent,
  NotificationMarkedAsReadEvent,
} from "../../events/notification-template.events";
import {
  NotificationChannelDto,
  NotificationTemplateDto,
  NotificationConfigDto,
  SentNotificationDto,
} from "@dto/stockpile/notification-template.dto";
import { LoggingHelper } from "@libs/logging/logging.helper";
import { NotificationStatus } from "@apps/stockpile-service/utils";
import { NotificationChannelType } from "@apps/availability-service/utils/notification-channel-type.enum";

/**
 * Create Notification Channel Command Handler
 * Orchestrates notification channel creation by delegating to NotificationTemplateService
 */
@Injectable()
@CommandHandler(CreateNotificationChannelCommand)
export class CreateNotificationChannelHandler
  implements ICommandHandler<CreateNotificationChannelCommand>
{
  constructor(
    private readonly notificationTemplateService: NotificationTemplateService,
    private readonly loggingService: LoggingService
  ) {}

  async execute(
    command: CreateNotificationChannelCommand
  ): Promise<NotificationChannelDto> {
    this.loggingService.log(
      "Orchestrating create notification channel command",
      "CreateNotificationChannelHandler",
      LoggingHelper.logParams({ command })
    );

    const result = await this.notificationTemplateService.createNotificationChannel({
      name: command.name,
      channel: command.channel,
      displayName: command.displayName,
      supportsAttachments: command.supportsAttachments,
      supportsLinks: command.supportsLinks,
      maxMessageLength: command.maxMessageLength,
      settings: command.settings
    });

    this.loggingService.log('Create notification channel command completed', 'CreateNotificationChannelHandler', LoggingHelper.logId(result.id));
    return result;
  }

  private mapToChannelDto(
    channel: NotificationChannelEntity
  ): NotificationChannelDto {
    return {
      id: channel.id,
      name: channel.name,
      displayName: channel.displayName,
      isActive: channel.isActive,
      supportsAttachments: channel.supportsAttachments,
      supportsLinks: channel.supportsLinks,
      maxMessageLength: channel.maxMessageLength,
      settings: channel.settings,
      createdAt: channel.createdAt,
      updatedAt: channel.updatedAt,
      channel: channel.channel || NotificationChannelType.EMAIL,
    };
  }
}

@Injectable()
@CommandHandler(CreateNotificationTemplateCommand)
export class CreateNotificationTemplateHandler
  implements ICommandHandler<CreateNotificationTemplateCommand>
{
  constructor(
    private readonly notificationTemplateService: NotificationTemplateService,
    private readonly loggingService: LoggingService
  ) {}

  async execute(
    command: CreateNotificationTemplateCommand
  ): Promise<NotificationTemplateDto> {
    this.loggingService.log(
      "Orchestrating create notification template command",
      "CreateNotificationTemplateHandler",
      LoggingHelper.logParams({ command })
    );

    const result = await this.notificationTemplateService.createNotificationTemplate({
      name: command.name,
      channelId: command.channelId,
      eventType: command.eventType,
      resourceType: command.resourceType,
      categoryId: command.categoryId,
      subject: command.subject,
      content: command.content,
      variables: command.variables,
      isDefault: command.isDefault,
      attachDocument: command.attachDocument,
      documentAsLink: command.documentAsLink,
      createdBy: command.createdBy
    });

    this.loggingService.log('Create notification template command completed', 'CreateNotificationTemplateHandler', LoggingHelper.logId(result.id));
    return result;
  }

  private mapToTemplateDto(
    template: NotificationTemplateEntity
  ): NotificationTemplateDto {
    return {
      id: template.id,
      name: template.name,
      channelId: template.channelId,
      eventType: template.eventType,
      resourceType: template.resourceType,
      categoryId: template.categoryId,
      subject: template.subject,
      content: template.content,
      variables: template.variables,
      isDefault: template.isDefault,
      isActive: template.isActive,
      attachDocument: template.attachDocument,
      documentAsLink: template.documentAsLink,
      createdBy: template.createdBy,
      createdAt: template.createdAt,
      updatedAt: template.updatedAt,
    };
  }
}

/**
 * Update Notification Template Command Handler
 * Orchestrates notification template update by delegating to NotificationTemplateService
 */
@Injectable()
@CommandHandler(UpdateNotificationTemplateCommand)
export class UpdateNotificationTemplateHandler
  implements ICommandHandler<UpdateNotificationTemplateCommand>
{
  constructor(
    private readonly notificationTemplateService: NotificationTemplateService,
    private readonly loggingService: LoggingService
  ) {}

  async execute(
    command: UpdateNotificationTemplateCommand
  ): Promise<NotificationTemplateDto> {
    this.loggingService.log(
      "Orchestrating update notification template command",
      "UpdateNotificationTemplateHandler",
      LoggingHelper.logParams({ command })
    );

    const result = await this.notificationTemplateService.updateNotificationTemplate(command.id, {
      name: command.name,
      subject: command.subject,
      content: command.content,
      variables: command.variables,
      isActive: command.isActive,
      attachDocument: command.attachDocument,
      documentAsLink: command.documentAsLink
    });

    this.loggingService.log('Update notification template command completed', 'UpdateNotificationTemplateHandler', LoggingHelper.logId(result.id));
    return result;
  }
}

/**
 * Create Notification Config Command Handler
 * Orchestrates notification config creation by delegating to NotificationTemplateService
 */
@Injectable()
@CommandHandler(CreateNotificationConfigCommand)
export class CreateNotificationConfigHandler
  implements ICommandHandler<CreateNotificationConfigCommand>
{
  constructor(
    private readonly notificationTemplateService: NotificationTemplateService,
    private readonly loggingService: LoggingService
  ) {}

  async execute(
    command: CreateNotificationConfigCommand
  ): Promise<NotificationConfigDto> {
    this.loggingService.log(
      "Orchestrating create notification config command",
      "CreateNotificationConfigHandler",
      LoggingHelper.logParams({ command })
    );

    const result = await this.notificationTemplateService.createNotificationConfig({
      channelId: command.channelId,
      createdBy: command.createdBy,
      programId: command.programId,
      resourceType: command.resourceType,
      categoryId: command.categoryId,
      isEnabled: command.isEnabled,
      isImmediate: command.isImmediate,
      batchInterval: command.batchInterval,
      sendDocuments: command.sendDocuments,
      documentMethod: command.documentMethod
    });

    this.loggingService.log('Create notification config command completed', 'CreateNotificationConfigHandler', LoggingHelper.logId(result.id));
    return result;
  }
}

/**
 * Send Notification Command Handler
 * Orchestrates notification sending by delegating to NotificationTemplateService
 */
@Injectable()
@CommandHandler(SendNotificationCommand)
export class SendNotificationHandler
  implements ICommandHandler<SendNotificationCommand>
{
  constructor(
    private readonly notificationTemplateService: NotificationTemplateService,
    private readonly loggingService: LoggingService
  ) {}

  async execute(
    command: SendNotificationCommand
  ): Promise<SentNotificationDto> {
    this.loggingService.log(
      "Orchestrating send notification command",
      "SendNotificationHandler",
      LoggingHelper.logParams({ command })
    );

    const result = await this.notificationTemplateService.sendNotification({
      templateId: command.templateId,
      reservationId: command.reservationId,
      recipientId: command.recipientId,
      channel: command.channel,
      variables: command.variables,
      hasAttachment: command.hasAttachment,
      attachmentPath: command.attachmentPath
    });

    this.loggingService.log('Send notification command completed', 'SendNotificationHandler', LoggingHelper.logId(result.id));
    return result;
  }
}

/**
 * Send Batch Notifications Command Handler
 * Orchestrates batch notifications sending by delegating to NotificationTemplateService
 */
@Injectable()
@CommandHandler(SendBatchNotificationsCommand)
export class SendBatchNotificationsHandler
  implements ICommandHandler<SendBatchNotificationsCommand>
{
  constructor(
    private readonly notificationTemplateService: NotificationTemplateService,
    private readonly loggingService: LoggingService
  ) {}

  async execute(command: SendBatchNotificationsCommand): Promise<void> {
    this.loggingService.log(
      "Orchestrating send batch notifications command",
      "SendBatchNotificationsHandler",
      LoggingHelper.logParams({ command })
    );

    await this.notificationTemplateService.sendBatchNotifications(
      command.channelId,
      command.notificationIds
    );

    this.loggingService.log('Send batch notifications command completed', 'SendBatchNotificationsHandler');
  }
}

/**
 * Mark Notification As Read Command Handler
 * Orchestrates marking notification as read by delegating to NotificationTemplateService
 */
@Injectable()
@CommandHandler(MarkNotificationAsReadCommand)
export class MarkNotificationAsReadHandler
  implements ICommandHandler<MarkNotificationAsReadCommand>
{
  constructor(
    private readonly notificationTemplateService: NotificationTemplateService,
    private readonly loggingService: LoggingService
  ) {}

  async execute(command: MarkNotificationAsReadCommand): Promise<void> {
    this.loggingService.log(
      "Orchestrating mark notification as read command",
      "MarkNotificationAsReadHandler",
      LoggingHelper.logParams({ command })
    );

    await this.notificationTemplateService.markNotificationAsRead({
      notificationId: command.notificationId,
      userId: command.userId
    });

    this.loggingService.log('Mark notification as read command completed', 'MarkNotificationAsReadHandler', LoggingHelper.logId(command.notificationId));
  }
}
