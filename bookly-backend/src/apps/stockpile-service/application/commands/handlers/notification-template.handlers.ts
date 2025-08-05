import { CommandHandler, ICommandHandler, EventBus } from '@nestjs/cqrs';
import { Injectable, Inject } from '@nestjs/common';
import { LoggingService } from '@logging/logging.service';
import { NotificationTemplateRepository } from '../../../domain/repositories/notification-template.repository';
import { 
  NotificationChannelEntity, 
  NotificationTemplateEntity, 
  NotificationConfigEntity, 
  SentNotificationEntity, 
  NotificationStatus
} from '../../../domain/entities/notification-template.entity';
import {
  CreateNotificationChannelCommand,
  CreateNotificationTemplateCommand,
  UpdateNotificationTemplateCommand,
  CreateNotificationConfigCommand,
  SendNotificationCommand,
  SendBatchNotificationsCommand,
  MarkNotificationAsReadCommand
} from '../notification-template.commands';
import {
  NotificationChannelCreatedEvent,
  NotificationTemplateCreatedEvent,
  NotificationTemplateUpdatedEvent,
  NotificationConfigCreatedEvent,
  NotificationSentEvent,
  BatchNotificationsSentEvent,
  NotificationMarkedAsReadEvent
} from '../../events/notification-template.events';
import { 
  NotificationChannelDto, 
  NotificationTemplateDto, 
  NotificationConfigDto, 
  SentNotificationDto, 
  NotificationChannelType
} from '@dto/stockpile/notification-template.dto';
import { LoggingHelper } from '@/apps/stockpile-service/infrastructure/utils/logging.helper';

@Injectable()
@CommandHandler(CreateNotificationChannelCommand)
export class CreateNotificationChannelHandler implements ICommandHandler<CreateNotificationChannelCommand> {
  constructor(
    @Inject('NotificationTemplateRepository') private readonly repository: NotificationTemplateRepository,
    private readonly eventBus: EventBus,
    private readonly loggingService: LoggingService
  ) {}

  async execute(command: CreateNotificationChannelCommand): Promise<NotificationChannelDto> {
    this.loggingService.log('Creating notification channel', 'CreateNotificationChannelHandler', LoggingHelper.logParams({ command }));

    const channel = new NotificationChannelEntity(
      undefined, // ID will be generated
      command.name,
      command.channel,
      command.displayName,
      command.supportsAttachments,
      command.supportsLinks,
      command.maxMessageLength,
      true, // isActive
      command.settings
    );

    const createdChannel = await this.repository.createNotificationChannel(channel);

    // Publish event
    await this.eventBus.publish(new NotificationChannelCreatedEvent(
      createdChannel.id,
      createdChannel.name,
      createdChannel.displayName
    ));

    return this.mapToChannelDto(createdChannel);
  }

  private mapToChannelDto(channel: NotificationChannelEntity): NotificationChannelDto {
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
export class CreateNotificationTemplateHandler implements ICommandHandler<CreateNotificationTemplateCommand> {
  constructor(
    @Inject('NotificationTemplateRepository') private readonly repository: NotificationTemplateRepository,
    private readonly eventBus: EventBus,
    private readonly loggingService: LoggingService
  ) {}

  async execute(command: CreateNotificationTemplateCommand): Promise<NotificationTemplateDto> {
    this.loggingService.log('Creating notification template', 'CreateNotificationTemplateHandler', LoggingHelper.logParams({ command }));

    const template = new NotificationTemplateEntity(
      undefined, // ID will be generated
      command.name,
      command.channelId,
      command.eventType,
      command.resourceType,
      command.categoryId,
      command.subject,
      command.content,
      command.createdBy,
      command.variables,
      command.isDefault,
      true, // isActive
      command.attachDocument,
      command.documentAsLink,
      command.createdAt,
      command.updatedAt
    );

    const createdTemplate = await this.repository.createNotificationTemplate(template);

    // Publish event
    await this.eventBus.publish(new NotificationTemplateCreatedEvent(
      createdTemplate.id,
      createdTemplate.name,
      createdTemplate.channelId,
      createdTemplate.eventType,
      createdTemplate.resourceType,
      createdTemplate.categoryId,
      createdTemplate.createdBy
    ));

    return this.mapToTemplateDto(createdTemplate);
  }

  private mapToTemplateDto(template: NotificationTemplateEntity): NotificationTemplateDto {
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
      updatedAt: template.updatedAt
    };
  }
}

@Injectable()
@CommandHandler(UpdateNotificationTemplateCommand)
export class UpdateNotificationTemplateHandler implements ICommandHandler<UpdateNotificationTemplateCommand> {
  constructor(
    @Inject('NotificationTemplateRepository') private readonly repository: NotificationTemplateRepository,
    private readonly eventBus: EventBus,
    private readonly loggingService: LoggingService
  ) {}

  async execute(command: UpdateNotificationTemplateCommand): Promise<NotificationTemplateDto> {
    this.loggingService.log('Updating notification template', 'UpdateNotificationTemplateHandler', LoggingHelper.logParams({ command }));

    const existingTemplate = await this.repository.findNotificationTemplateById(command.id);
    if (!existingTemplate) {
      throw new Error(`Notification template with ID ${command.id} not found`);
    }

    const updatedTemplate = new NotificationTemplateEntity(
      existingTemplate.id,
      command.name || existingTemplate.name,
      existingTemplate.channelId,
      existingTemplate.eventType,
      existingTemplate.resourceType,
      existingTemplate.categoryId,
      command.subject || existingTemplate.subject,
      command.content || existingTemplate.content,
      existingTemplate.createdBy,
      command.variables || existingTemplate.variables,
      existingTemplate.isDefault,
      command.isActive !== undefined ? command.isActive : existingTemplate.isActive,
      command.attachDocument !== undefined ? command.attachDocument : existingTemplate.attachDocument,
      command.documentAsLink !== undefined ? command.documentAsLink : existingTemplate.documentAsLink,
      existingTemplate.createdAt,
      new Date()
    );

    const savedTemplate = await this.repository.updateNotificationTemplate(updatedTemplate.id, updatedTemplate);

    // Publish event
    await this.eventBus.publish(new NotificationTemplateUpdatedEvent(
      savedTemplate.id,
      savedTemplate.name,
      savedTemplate.channelId,
      savedTemplate.eventType
    ));

    return this.mapToTemplateDto(savedTemplate);
  }

  private mapToTemplateDto(template: NotificationTemplateEntity): NotificationTemplateDto {
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
      updatedAt: template.updatedAt
    };
  }
}

@Injectable()
@CommandHandler(CreateNotificationConfigCommand)
export class CreateNotificationConfigHandler implements ICommandHandler<CreateNotificationConfigCommand> {
  constructor(
    @Inject('NotificationTemplateRepository') private readonly repository: NotificationTemplateRepository,
    private readonly eventBus: EventBus,
    private readonly loggingService: LoggingService
  ) {}

  async execute(command: CreateNotificationConfigCommand): Promise<NotificationConfigDto> {
    this.loggingService.log('Creating notification config', 'CreateNotificationConfigHandler', LoggingHelper.logParams({ command }));

    const config = new NotificationConfigEntity(
      undefined, // ID will be generated
      command.channelId,
      command.createdBy,
      command.programId,
      command.resourceType,
      command.categoryId,
      command.isEnabled,
      command.isImmediate,
      command.batchInterval,
      command.sendDocuments,
      command.documentMethod,
      command.createdAt,
      command.updatedAt
    );

    const createdConfig = await this.repository.createNotificationConfig(config);

    // Publish event
    await this.eventBus.publish(new NotificationConfigCreatedEvent(
      createdConfig.id,
      createdConfig.programId,
      createdConfig.resourceType,
      createdConfig.categoryId,
      createdConfig.channelId,
      createdConfig.createdBy
    ));

    return this.mapToConfigDto(createdConfig);
  }

  private mapToConfigDto(config: NotificationConfigEntity): NotificationConfigDto {
    return {
      id: config.id,
      programId: config.programId,
      resourceType: config.resourceType,
      categoryId: config.categoryId,
      channelId: config.channelId,
      isEnabled: config.isEnabled,
      isImmediate: config.isImmediate,
      batchInterval: config.batchInterval,
      sendDocuments: config.sendDocuments,
      documentMethod: config.documentMethod,
      createdBy: config.createdBy,
      createdAt: config.createdAt,
      updatedAt: config.updatedAt
    };
  }
}

@Injectable()
@CommandHandler(SendNotificationCommand)
export class SendNotificationHandler implements ICommandHandler<SendNotificationCommand> {
  constructor(
    @Inject('NotificationTemplateRepository') private readonly repository: NotificationTemplateRepository,
    private readonly eventBus: EventBus,
    private readonly loggingService: LoggingService
  ) {}

  async execute(command: SendNotificationCommand): Promise<SentNotificationDto> {
    this.loggingService.log('Sending notification', 'SendNotificationHandler', LoggingHelper.logParams({ command }));

    const template = await this.repository.findNotificationTemplateById(command.templateId);
    if (!template) {
      throw new Error(`Notification template with ID ${command.templateId} not found`);
    }

    // Process template variables
    let processedSubject = template.subject;
    let processedContent = template.content;
    
    if (command.variables) {
      Object.keys(command.variables).forEach(key => {
        const value = command.variables[key];
        processedSubject = processedSubject.replace(`{{${key}}}`, value);
        processedContent = processedContent.replace(`{{${key}}}`, value);
      });
    }

    const notification = new SentNotificationEntity(
      undefined, // ID will be generated
      command.templateId,
      command.reservationId,
      command.recipientId,
      command.channel,
      NotificationStatus.PENDING,
      processedContent,
      processedSubject,
      command.hasAttachment,
      command.attachmentPath,
      null, // sentAt
      null, // deliveredAt
      null, // readAt
      null, // errorMessage
      null, // createdAt
      null, // updatedAt
      command.variables
    );

    const sentNotification = await this.repository.createSentNotification(notification);

    // Publish event
    await this.eventBus.publish(new NotificationSentEvent(
      sentNotification.id,
      sentNotification.templateId,
      sentNotification.reservationId,
      sentNotification.recipientId,
      sentNotification.channel,
      sentNotification.subject
    ));

    return this.mapToSentNotificationDto(sentNotification);
  }

  private mapToSentNotificationDto(notification: SentNotificationEntity): SentNotificationDto {
    return {
      id: notification.id,
      templateId: notification.templateId,
      reservationId: notification.reservationId,
      recipientId: notification.recipientId,
      channel: notification.channel,
      subject: notification.subject,
      content: notification.content,
      status: notification.status,
      hasAttachment: notification.hasAttachment,
      attachmentPath: notification.attachmentPath,
      sentAt: notification.sentAt,
      deliveredAt: notification.deliveredAt,
      readAt: notification.readAt,
      errorMessage: notification.errorMessage,
      createdAt: notification.createdAt,
      updatedAt: notification.updatedAt,
      variables: notification.variables
    };
  }
}

@Injectable()
@CommandHandler(SendBatchNotificationsCommand)
export class SendBatchNotificationsHandler implements ICommandHandler<SendBatchNotificationsCommand> {
  constructor(
    @Inject('NotificationTemplateRepository') private readonly repository: NotificationTemplateRepository,
    private readonly eventBus: EventBus,
    private readonly loggingService: LoggingService
  ) {}

  async execute(command: SendBatchNotificationsCommand): Promise<void> {
    this.loggingService.log('Sending batch notifications', 'SendBatchNotificationsHandler', LoggingHelper.logParams({ command }));

    // Update notifications status to SENT
    for (const notificationId of command.notificationIds) {
      const notification = await this.repository.findSentNotificationById(notificationId);
      if (notification) {
        const updatedNotification = new SentNotificationEntity(
          notification.id,
          notification.templateId,
          notification.reservationId,
          notification.recipientId,
          notification.channel,
          NotificationStatus.SENT,
          notification.subject,
          notification.content,
          notification.hasAttachment,
          notification.attachmentPath,
          new Date(), // sentAt
          notification.deliveredAt,
          notification.readAt,
          notification.errorMessage,
          notification.createdAt,
          new Date(),
          notification.variables
        );

        await this.repository.updateSentNotification(updatedNotification.id, updatedNotification);
      }
    }

    // Publish event
    await this.eventBus.publish(new BatchNotificationsSentEvent(
      command.channelId,
      command.notificationIds,
      command.notificationIds.length
    ));
  }
}

@Injectable()
@CommandHandler(MarkNotificationAsReadCommand)
export class MarkNotificationAsReadHandler implements ICommandHandler<MarkNotificationAsReadCommand> {
  constructor(
    @Inject('NotificationTemplateRepository') private readonly repository: NotificationTemplateRepository,
    private readonly eventBus: EventBus,
    private readonly loggingService: LoggingService
  ) {}

  async execute(command: MarkNotificationAsReadCommand): Promise<void> {
    this.loggingService.log('Marking notification as read', 'MarkNotificationAsReadHandler', LoggingHelper.logParams({ command }));

    const notification = await this.repository.findSentNotificationById(command.notificationId);
    if (!notification) {
      throw new Error(`Notification with ID ${command.notificationId} not found`);
    }

    const updatedNotification = new SentNotificationEntity(
      notification.id,
      notification.templateId,
      notification.reservationId,
      notification.recipientId,
      notification.channel,
      notification.status,
      notification.subject,
      notification.content,
      notification.hasAttachment,
      notification.attachmentPath,
      notification.sentAt,
      new Date(), // readAt
      notification.deliveredAt,
      notification.errorMessage,
      notification.createdAt,
      new Date(),
      notification.variables
    );

    await this.repository.updateSentNotification(updatedNotification.id, updatedNotification);

    // Publish event
    await this.eventBus.publish(new NotificationMarkedAsReadEvent(
      command.notificationId,
      command.userId,
      new Date()
    ));
  }
}
