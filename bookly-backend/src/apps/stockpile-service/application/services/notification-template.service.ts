import { Injectable } from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { LoggingService } from '@libs/logging/logging.service';
import { NotificationChannelType } from '@apps/availability-service/utils/notification-channel-type.enum';
import {
  CreateNotificationChannelCommand,
  CreateNotificationTemplateCommand,
  UpdateNotificationTemplateCommand,
  CreateNotificationConfigCommand,
  SendNotificationCommand,
  SendBatchNotificationsCommand,
  MarkNotificationAsReadCommand
} from '@apps/stockpile-service/application/commands/notification-template.commands';
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
} from '@apps/stockpile-service/application/queries/notification-template.queries';
import {
  CreateNotificationChannelDto,
  CreateNotificationTemplateDto,
  UpdateNotificationTemplateDto,
  CreateNotificationConfigDto,
  SendNotificationDto,
  NotificationChannelDto,
  NotificationTemplateDto,
  NotificationConfigDto,
  SentNotificationDto,
  NotificationEventType,
} from '@libs/dto/stockpile/notification-template.dto';
import { LoggingHelper } from '@libs/logging/logging.helper';
import { StockpileHandlerUtil } from '../utils/stockpile-handler.util';

@Injectable()
export class NotificationTemplateService {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
    private readonly loggingService: LoggingService
  ) {}

  async createNotificationChannel(dto: CreateNotificationChannelDto): Promise<NotificationChannelDto> {
    StockpileHandlerUtil.logServiceOperation(this.loggingService, 'Creating notification channel', 'NotificationTemplateService', dto);

    const command = new CreateNotificationChannelCommand(
      dto.name,
      dto.channel,
      dto.displayName,
      dto.supportsAttachments,
      dto.supportsLinks,
      dto.maxMessageLength,
      dto.settings
    );

    return await StockpileHandlerUtil.executeCommand(
      this.commandBus,
      command,
      this.loggingService,
      'create notification channel',
      'NotificationTemplateService'
    );
  }

  async createNotificationTemplate(dto: CreateNotificationTemplateDto): Promise<NotificationTemplateDto> {
    StockpileHandlerUtil.logServiceOperation(this.loggingService, 'Creating notification template', 'NotificationTemplateService', dto);

    const command = new CreateNotificationTemplateCommand(
      dto.name,
      dto.channelId,
      dto.eventType,
      dto.resourceType,
      dto.categoryId,
      dto.subject,
      dto.variables,
      dto.isDefault,
      dto.attachDocument,
      dto.documentAsLink,
      new Date(),
      new Date(),
      dto.content,
      dto.createdBy
    );

    return await StockpileHandlerUtil.executeCommand(
      this.commandBus,
      command,
      this.loggingService,
      'create notification template',
      'NotificationTemplateService'
    );
  }

  async updateNotificationTemplate(id: string, dto: UpdateNotificationTemplateDto): Promise<NotificationTemplateDto> {
    StockpileHandlerUtil.logServiceOperation(this.loggingService, 'Updating notification template', 'NotificationTemplateService', { id, dto });

    const command = new UpdateNotificationTemplateCommand(
      id,
      dto.name,
      dto.subject,
      dto.content,
      dto.variables,
      dto.attachDocument,
      dto.documentAsLink,
      dto.isActive
    );

    return await StockpileHandlerUtil.executeCommand(
      this.commandBus,
      command,
      this.loggingService,
      'update notification template',
      'NotificationTemplateService'
    );
  }

  async createNotificationConfig(dto: CreateNotificationConfigDto): Promise<NotificationConfigDto> {
    StockpileHandlerUtil.logServiceOperation(this.loggingService, 'Creating notification config', 'NotificationTemplateService', dto);

    const command = new CreateNotificationConfigCommand(
      dto.channelId,
      dto.programId,
      dto.resourceType,
      dto.categoryId,
      dto.isEnabled,
      dto.isImmediate,
      dto.batchInterval,
      dto.sendDocuments,
      dto.documentMethod,
      dto.createdBy
    );

    return await StockpileHandlerUtil.executeCommand(
      this.commandBus,
      command,
      this.loggingService,
      'create notification config',
      'NotificationTemplateService'
    );
  }

  async sendNotification(dto: SendNotificationDto): Promise<SentNotificationDto> {
    StockpileHandlerUtil.logServiceOperation(this.loggingService, 'Sending notification', 'NotificationTemplateService', dto);

    const command = new SendNotificationCommand(
      dto.channel,
      dto.templateId,
      dto.reservationId,
      dto.recipientId,
      dto.variables,
      dto.hasAttachment,
      dto.attachmentPath
    );

    return await StockpileHandlerUtil.executeCommand(
      this.commandBus,
      command,
      this.loggingService,
      'send notification',
      'NotificationTemplateService'
    );
  }

  async sendBatchNotifications(channelId: string, notificationIds: string[]): Promise<void> {
    StockpileHandlerUtil.logServiceOperation(this.loggingService, 'Sending batch notifications', 'NotificationTemplateService', { channelId, count: notificationIds.length });

    const command = new SendBatchNotificationsCommand(channelId, notificationIds);

    await StockpileHandlerUtil.executeCommand(
      this.commandBus,
      command,
      this.loggingService,
      'send batch notifications',
      'NotificationTemplateService'
    );
  }

  async markNotificationAsRead(notificationId: string, userId: string): Promise<void> {
    StockpileHandlerUtil.logServiceOperation(this.loggingService, 'Marking notification as read', 'NotificationTemplateService', { notificationId, userId });

    const command = new MarkNotificationAsReadCommand(notificationId, userId);

    await StockpileHandlerUtil.executeCommand(
      this.commandBus,
      command,
      this.loggingService,
      'mark notification as read',
      'NotificationTemplateService'
    );
  }

  async getNotificationChannels(isActive?: boolean): Promise<NotificationChannelDto[]> {
    this.loggingService.log('Getting notification channels', 'NotificationTemplateService', JSON.stringify({ isActive }));

    const query = new GetNotificationChannelsQuery(isActive);

    return await this.queryBus.execute(query);
  }

  async getNotificationChannelById(id: string): Promise<NotificationChannelDto | null> {
    this.loggingService.log('Getting notification channel by ID', 'NotificationTemplateService', id);

    const query = new GetNotificationChannelByIdQuery(id);

    return await this.queryBus.execute(query);
  }

  async getNotificationTemplates(
    channelId?: string,
    eventType?: NotificationEventType,
    resourceType?: string,
    categoryId?: string,
    isActive?: boolean,
    page: number = 1,
    limit: number = 10
  ): Promise<{ templates: NotificationTemplateDto[]; total: number }> {
    this.loggingService.log('Getting notification templates', 'NotificationTemplateService', JSON.stringify({ channelId, eventType, resourceType, categoryId, isActive, page, limit }));

    const query = new GetNotificationTemplatesQuery(
      channelId,
      eventType,
      resourceType,
      categoryId,
      isActive,
      page,
      limit
    );

    return await this.queryBus.execute(query);
  }

  async getNotificationTemplateById(id: string): Promise<NotificationTemplateDto | null> {
    this.loggingService.log('Getting notification template by ID', 'NotificationTemplateService', id);

    const query = new GetNotificationTemplateByIdQuery(id);

    return await this.queryBus.execute(query);
  }

  async getDefaultNotificationTemplate(
    channelId: string,
    eventType: NotificationEventType,
    resourceType?: string,
    categoryId?: string
  ): Promise<NotificationTemplateDto | null> {
    this.loggingService.log('Getting default notification template', 'NotificationTemplateService', JSON.stringify({
      channelId,
      eventType,
      resourceType,
      categoryId
    }));

    const query = new GetDefaultNotificationTemplateQuery(channelId, eventType, resourceType, categoryId);

    return await this.queryBus.execute(query);
  }

  async getNotificationConfigs(
    programId?: string,
    resourceType?: string,
    categoryId?: string,
    channelId?: string,
    isEnabled?: boolean
  ): Promise<NotificationConfigDto[]> {
    this.loggingService.log('Getting notification configs', 'NotificationTemplateService', JSON.stringify({
      programId,
      resourceType,
      categoryId,
      channelId,
      isEnabled
    }));

    const query = new GetNotificationConfigsQuery(programId, resourceType, categoryId, channelId, isEnabled);

    return await this.queryBus.execute(query);
  }

  async getNotificationConfigById(id: string): Promise<NotificationConfigDto | null> {
    this.loggingService.log('Getting notification config by ID', 'NotificationTemplateService', id);

    const query = new GetNotificationConfigByIdQuery(id);

    return await this.queryBus.execute(query);
  }

  async getSentNotificationsByReservation(reservationId: string): Promise<SentNotificationDto[]> {
    this.loggingService.log('Getting sent notifications by reservation', 'NotificationTemplateService', reservationId);

    const query = new GetSentNotificationsByReservationQuery(reservationId);

    return await this.queryBus.execute(query);
  }

  async getSentNotificationsByRecipient(
    recipientId: string,
    channel?: NotificationChannelType,
    status?: string,
    page: number = 1,
    limit: number = 10
  ): Promise<{ notifications: SentNotificationDto[]; total: number }> {
    this.loggingService.log('Getting sent notifications by recipient', 'NotificationTemplateService', JSON.stringify({
      recipientId,
      channel,
      status,
      page,
      limit
    }));

    const query = new GetSentNotificationsByRecipientQuery(recipientId, channel, status, page, limit);

    return await this.queryBus.execute(query);
  }

  async getPendingNotifications(channelId?: string): Promise<SentNotificationDto[]> {
    this.loggingService.log('Getting pending notifications', 'NotificationTemplateService', channelId);

    const query = new GetPendingNotificationsQuery(channelId);

    return await this.queryBus.execute(query);
  }

  async getNotificationsForBatch(channelId: string, batchIntervalMs: number): Promise<SentNotificationDto[]> {
    this.loggingService.log('Getting notifications for batch', 'NotificationTemplateService', JSON.stringify({ channelId, batchIntervalMs }));

    const query = new GetNotificationsForBatchQuery(channelId, batchIntervalMs);

    return await this.queryBus.execute(query);
  }

  async getNotificationTemplateVariables(templateId: string): Promise<any> {
    this.loggingService.log('Getting notification template variables', 'NotificationTemplateService', templateId);

    const query = new GetNotificationTemplateVariablesQuery(templateId);

    return await this.queryBus.execute(query);
  }

  async getAvailableNotificationVariables(eventType: NotificationEventType, resourceType?: string): Promise<any> {
    this.loggingService.log('Getting available notification variables', 'NotificationTemplateService', JSON.stringify({ eventType, resourceType }));

    const query = new GetAvailableNotificationVariablesQuery(eventType, resourceType);

    return await this.queryBus.execute(query);
  }
}
