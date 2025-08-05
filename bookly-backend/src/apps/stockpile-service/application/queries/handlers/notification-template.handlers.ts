import { QueryHandler, IQueryHandler } from '@nestjs/cqrs';
import { Injectable, Inject } from '@nestjs/common';
import { LoggingService } from '@logging/logging.service';
import { NotificationTemplateRepository } from '../../../domain/repositories/notification-template.repository';
import {
  GetNotificationChannelsQuery,
  GetNotificationChannelByIdQuery,
  GetNotificationTemplatesQuery,
  GetNotificationTemplateByIdQuery,
  GetDefaultNotificationTemplateQuery,
  GetNotificationConfigsQuery,
  GetNotificationConfigByIdQuery,
  GetSentNotificationsByReservationQuery,
  GetSentNotificationsByRecipientQuery,
  GetPendingNotificationsQuery,
  GetNotificationsForBatchQuery,
  GetNotificationTemplateVariablesQuery,
  GetAvailableNotificationVariablesQuery
} from '../notification-template.queries';
import { 
  NotificationChannelDto, 
  NotificationTemplateDto, 
  NotificationConfigDto, 
  SentNotificationDto 
} from '@dto/stockpile/notification-template.dto';
import { LoggingHelper } from '@/apps/stockpile-service/infrastructure/utils/logging.helper';
import { NotificationChannelEntity } from '@/apps/stockpile-service/domain/entities/notification-template.entity';
import { NotificationChannelType } from '@/libs/dto/stockpile/notification-template.dto';

@Injectable()
@QueryHandler(GetNotificationChannelsQuery)
export class GetNotificationChannelsHandler implements IQueryHandler<GetNotificationChannelsQuery> {
  constructor(
    @Inject('NotificationTemplateRepository') private readonly repository: NotificationTemplateRepository,
    private readonly loggingService: LoggingService
  ) {}

  async execute(query: GetNotificationChannelsQuery): Promise<NotificationChannelDto[]> {
    this.loggingService.log('Getting notification channels', 'GetNotificationChannelsHandler', LoggingHelper.logParams(query));

    const channels = await this.repository.findAllNotificationChannels();
    
    return channels.map(channel => this.mapToChannelDto(channel));
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
    channel: channel.channel || NotificationChannelType.EMAIL
};
  }
}

@Injectable()
@QueryHandler(GetNotificationChannelByIdQuery)
export class GetNotificationChannelByIdHandler implements IQueryHandler<GetNotificationChannelByIdQuery> {
  constructor(
    @Inject('NotificationTemplateRepository') private readonly repository: NotificationTemplateRepository,
    private readonly loggingService: LoggingService
  ) {}

  async execute(query: GetNotificationChannelByIdQuery): Promise<NotificationChannelDto | null> {
    this.loggingService.log('Getting notification channel by ID', 'GetNotificationChannelByIdHandler', LoggingHelper.logParams({ id: query.id }));

    const channel = await this.repository.findNotificationChannelById(query.id);
    
    return channel ? this.mapToChannelDto(channel) : null;
  }

  private mapToChannelDto(channel: any): NotificationChannelDto {
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
    channel: channel.channel || NotificationChannelType.EMAIL
};
  }
}

@Injectable()
@QueryHandler(GetNotificationTemplatesQuery)
export class GetNotificationTemplatesHandler implements IQueryHandler<GetNotificationTemplatesQuery> {
  constructor(
    @Inject('NotificationTemplateRepository') private readonly repository: NotificationTemplateRepository,
    private readonly loggingService: LoggingService
  ) {}

  async execute(query: GetNotificationTemplatesQuery): Promise<{ templates: NotificationTemplateDto[]; total: number }> {
    this.loggingService.log('Getting notification templates', 'GetNotificationTemplatesHandler', LoggingHelper.logParams({ query }));

    const result = await this.repository.findNotificationTemplates({
      channelId: query.channelId,
      eventType: query.eventType,
      resourceType: query.resourceType,
      categoryId: query.categoryId,
      isActive: query.isActive,
      page: query.page,
      limit: query.limit
    });

    return {
      templates: result.templates.map(template => this.mapToTemplateDto(template)),
      total: result.total
    };
  }

  private mapToTemplateDto(template: any): NotificationTemplateDto {
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
@QueryHandler(GetNotificationTemplateByIdQuery)
export class GetNotificationTemplateByIdHandler implements IQueryHandler<GetNotificationTemplateByIdQuery> {
  constructor(
    @Inject('NotificationTemplateRepository') private readonly repository: NotificationTemplateRepository,
    private readonly loggingService: LoggingService
  ) {}

  async execute(query: GetNotificationTemplateByIdQuery): Promise<NotificationTemplateDto | null> {
    this.loggingService.log('Getting notification template by ID', 'GetNotificationTemplateByIdHandler', LoggingHelper.logParams({ id: query.id }));

    const template = await this.repository.findNotificationTemplateById(query.id);
    
    return template ? this.mapToTemplateDto(template) : null;
  }

  private mapToTemplateDto(template: any): NotificationTemplateDto {
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
@QueryHandler(GetDefaultNotificationTemplateQuery)
export class GetDefaultNotificationTemplateHandler implements IQueryHandler<GetDefaultNotificationTemplateQuery> {
  constructor(
    @Inject('NotificationTemplateRepository') private readonly repository: NotificationTemplateRepository,
    private readonly loggingService: LoggingService
  ) {}

  async execute(query: GetDefaultNotificationTemplateQuery): Promise<NotificationTemplateDto | null> {
    this.loggingService.log('Getting default notification template', 'GetDefaultNotificationTemplateHandler', LoggingHelper.logParams({ query }));

    const template = await this.repository.findDefaultNotificationTemplate(
      query.channelId,
      query.eventType,
      query.resourceType,
      query.categoryId
    );
    
    return template ? this.mapToTemplateDto(template) : null;
  }

  private mapToTemplateDto(template: any): NotificationTemplateDto {
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
@QueryHandler(GetNotificationConfigsQuery)
export class GetNotificationConfigsHandler implements IQueryHandler<GetNotificationConfigsQuery> {
  constructor(
    @Inject('NotificationTemplateRepository') private readonly repository: NotificationTemplateRepository,
    private readonly loggingService: LoggingService
  ) {}

  async execute(query: GetNotificationConfigsQuery): Promise<NotificationConfigDto[]> {
    this.loggingService.log('Getting notification configs', 'GetNotificationConfigsHandler', LoggingHelper.logParams({ query }));

    const configs = await this.repository.findNotificationConfigs({
      programId: query.programId,
      resourceType: query.resourceType,
      categoryId: query.categoryId,
      channelId: query.channelId,
      isEnabled: query.isEnabled
    });
    
    return configs.map(config => this.mapToConfigDto(config));
  }

  private mapToConfigDto(config: any): NotificationConfigDto {
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
@QueryHandler(GetNotificationConfigByIdQuery)
export class GetNotificationConfigByIdHandler implements IQueryHandler<GetNotificationConfigByIdQuery> {
  constructor(
    @Inject('NotificationTemplateRepository') private readonly repository: NotificationTemplateRepository,
    private readonly loggingService: LoggingService
  ) {}

  async execute(query: GetNotificationConfigByIdQuery): Promise<NotificationConfigDto | null> {
    this.loggingService.log('Getting notification config by ID', 'GetNotificationConfigByIdHandler', LoggingHelper.logParams({ query }));

    const config = await this.repository.findNotificationConfigById(query.id);
    
    return config ? this.mapToConfigDto(config) : null;
  }

  private mapToConfigDto(config: any): NotificationConfigDto {
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
@QueryHandler(GetSentNotificationsByReservationQuery)
export class GetSentNotificationsByReservationHandler implements IQueryHandler<GetSentNotificationsByReservationQuery> {
  constructor(
    @Inject('NotificationTemplateRepository') private readonly repository: NotificationTemplateRepository,
    private readonly loggingService: LoggingService
  ) {}

  async execute(query: GetSentNotificationsByReservationQuery): Promise<SentNotificationDto[]> {
    this.loggingService.log('Getting sent notifications by reservation', 'GetSentNotificationsByReservationHandler', LoggingHelper.logParams({ reservationId: query.reservationId }));

    const notifications = await this.repository.findSentNotificationsByReservation(query.reservationId);
    
    return notifications.map(notification => this.mapToSentNotificationDto(notification));
  }

  private mapToSentNotificationDto(notification: any): SentNotificationDto {
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
      readAt: notification.readAt,
      errorMessage: notification.errorMessage,
      createdAt: notification.createdAt,
      updatedAt: notification.updatedAt,
      variables: notification.variables
    };
  }
}

@Injectable()
@QueryHandler(GetSentNotificationsByRecipientQuery)
export class GetSentNotificationsByRecipientHandler implements IQueryHandler<GetSentNotificationsByRecipientQuery> {
  constructor(
    @Inject('NotificationTemplateRepository') private readonly repository: NotificationTemplateRepository,
    private readonly loggingService: LoggingService
  ) {}

  async execute(query: GetSentNotificationsByRecipientQuery): Promise<{ notifications: SentNotificationDto[]; total: number }> {
    this.loggingService.log('Getting sent notifications by recipient', 'GetSentNotificationsByRecipientHandler', LoggingHelper.logParams({ recipientId: query.recipientId }));

    const result = await this.repository.findSentNotificationsByRecipient({
      recipientId: query.recipientId,
      channel: query.channel,
      status: query.status,
      page: query.page,
      limit: query.limit
    });

    return {
      notifications: result.notifications.map(notification => this.mapToSentNotificationDto(notification)),
      total: result.total
    };
  }

  private mapToSentNotificationDto(notification: any): SentNotificationDto {
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
      readAt: notification.readAt,
      errorMessage: notification.errorMessage,
      createdAt: notification.createdAt,
      updatedAt: notification.updatedAt,
      variables: notification.variables
    };
  }
}

@Injectable()
@QueryHandler(GetPendingNotificationsQuery)
export class GetPendingNotificationsHandler implements IQueryHandler<GetPendingNotificationsQuery> {
  constructor(
    @Inject('NotificationTemplateRepository') private readonly repository: NotificationTemplateRepository,
    private readonly loggingService: LoggingService
  ) {}

  async execute(query: GetPendingNotificationsQuery): Promise<SentNotificationDto[]> {
    this.loggingService.log('Getting pending notifications', 'GetPendingNotificationsHandler', LoggingHelper.logParams({ channelId: query.channelId }));

    const notifications = await this.repository.findPendingNotifications(query.channelId);
    
    return notifications.map(notification => this.mapToSentNotificationDto(notification));
  }

  private mapToSentNotificationDto(notification: any): SentNotificationDto {
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
    readAt: notification.readAt,
    errorMessage: notification.errorMessage,
    createdAt: notification.createdAt,
    updatedAt: notification.updatedAt,
    variables: notification.variables
};
  }
}

@Injectable()
@QueryHandler(GetNotificationsForBatchQuery)
export class GetNotificationsForBatchHandler implements IQueryHandler<GetNotificationsForBatchQuery> {
  constructor(
    @Inject('NotificationTemplateRepository') private readonly repository: NotificationTemplateRepository,
    private readonly loggingService: LoggingService
  ) {}

  async execute(query: GetNotificationsForBatchQuery): Promise<SentNotificationDto[]> {
    this.loggingService.log('Getting notifications for batch', 'GetNotificationsForBatchHandler', LoggingHelper.logParams({ channelId: query.channelId, batchIntervalMs: query.batchIntervalMs }));

    const notifications = await this.repository.findNotificationsForBatch(query.channelId, query.batchIntervalMs);
    
    return notifications.map(notification => this.mapToSentNotificationDto(notification));
  }

  private mapToSentNotificationDto(notification: any): SentNotificationDto {
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
      readAt: notification.readAt,
      errorMessage: notification.errorMessage,
      createdAt: notification.createdAt,
      updatedAt: notification.updatedAt,
      variables: notification.variables
    };
  }
}

@Injectable()
@QueryHandler(GetNotificationTemplateVariablesQuery)
export class GetNotificationTemplateVariablesHandler implements IQueryHandler<GetNotificationTemplateVariablesQuery> {
  constructor(
    @Inject('NotificationTemplateRepository') private readonly repository: NotificationTemplateRepository,
    private readonly loggingService: LoggingService
  ) {}

  async execute(query: GetNotificationTemplateVariablesQuery): Promise<any> {
    this.loggingService.log('Getting notification template variables', 'GetNotificationTemplateVariablesHandler', LoggingHelper.logParams({ templateId: query.templateId }));

    const template = await this.repository.findNotificationTemplateById(query.templateId);
    
    if (!template) {
      throw new Error(`Notification template with ID ${query.templateId} not found`);
    }

    return template.variables || {};
  }
}

@Injectable()
@QueryHandler(GetAvailableNotificationVariablesQuery)
export class GetAvailableNotificationVariablesHandler implements IQueryHandler<GetAvailableNotificationVariablesQuery> {
  constructor(
    private readonly loggingService: LoggingService
  ) {}

  async execute(query: GetAvailableNotificationVariablesQuery): Promise<any> {
    this.loggingService.log('Getting available notification variables', 'GetAvailableNotificationVariablesHandler', LoggingHelper.logParams({ query }));

    // Return available variables based on event type and resource type
    const baseVariables = {
      reservation: {
        id: 'Reservation ID',
        startTime: 'Start time',
        endTime: 'End time',
        purpose: 'Purpose',
        requesterName: 'Requester name',
        requesterEmail: 'Requester email'
      },
      resource: {
        name: 'Resource name',
        type: 'Resource type',
        location: 'Location',
        capacity: 'Capacity'
      },
      approval: {
        approverName: 'Approver name',
        approvalDate: 'Approval date',
        comments: 'Comments',
        status: 'Status'
      },
      system: {
        currentDate: 'Current date',
        systemName: 'System name',
        supportEmail: 'Support email'
      }
    };

    // Add resource-specific variables based on resource type
    if (query.resourceType) {
      baseVariables[`${query.resourceType}_specific`] = {
        // Add resource type specific variables here
      };
    }

    return baseVariables;
  }
}
