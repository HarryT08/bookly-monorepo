import { Injectable, Inject, NotFoundException, ForbiddenException } from '@nestjs/common';
import { LoggingService } from '@libs/logging/logging.service';
import { LoggingHelper } from '@libs/logging/logging.helper';
import { EventBusService } from '@libs/event-bus/services/event-bus.service';
import { NotificationTemplateRepository } from '@apps/stockpile-service/domain/repositories/notification-template.repository';
import {
  GetByIdRequestDto,
  MarkNotificationAsReadRequestDto,
  GetNotificationChannelsRequestDto
} from '@libs/dto/stockpile/stockpile-requests.dto';
import { NotificationChannelType } from '@apps/availability-service/utils/notification-channel-type.enum';
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
  NotificationEventType
} from '@libs/dto/stockpile/notification-template.dto';
import { 
  NotificationChannelEntity, 
  NotificationTemplateEntity, 
  NotificationConfigEntity,
  SentNotificationEntity 
} from '@apps/stockpile-service/domain/entities/notification-template.entity';
import { NotificationStatus } from '../../utils';
// Note: EventBus integration will be handled via domain events

@Injectable()
export class NotificationTemplateService {
  constructor(
    @Inject('NotificationTemplateRepository') private readonly notificationTemplateRepository: NotificationTemplateRepository,
    private readonly loggingService: LoggingService
  ) {}

  async createNotificationChannel(dto: CreateNotificationChannelDto): Promise<NotificationChannelDto> {
    this.loggingService.log('Creating notification channel', 'NotificationTemplateService', LoggingHelper.logParams({ dto }));

    const entity = new NotificationChannelEntity(
      null, // id will be set by repository
      dto.name,
      dto.channel,
      dto.displayName,
      dto.supportsAttachments,
      dto.supportsLinks,
      dto.maxMessageLength,
      dto.settings,
      true, // isActive
      new Date(),
      new Date()
    );

    const savedEntity = await this.notificationTemplateRepository.createNotificationChannel(entity);
    return this.convertNotificationChannelToDto(savedEntity);
  }

  async createNotificationTemplate(dto: CreateNotificationTemplateDto): Promise<NotificationTemplateDto> {
    this.loggingService.log('Creating notification template', 'NotificationTemplateService', LoggingHelper.logParams({ dto }));

    // Validate channel exists
    const channel = await this.notificationTemplateRepository.findNotificationChannelById(dto.channelId);
    if (!channel) {
      throw new NotFoundException(`Notification channel with ID ${dto.channelId} not found`);
    }

    const entity = new NotificationTemplateEntity(
      null, // id will be set by repository
      dto.name,
      dto.channelId,
      dto.eventType,
      dto.content,
      dto.createdBy,
      dto.resourceType,
      dto.categoryId,
      dto.subject,
      dto.variables || {},
      dto.isDefault || false,
      true, // isActive
      dto.attachDocument || false,
      dto.documentAsLink || false,
      new Date(),
      new Date()
    );

    const savedEntity = await this.notificationTemplateRepository.createNotificationTemplate(entity);
    return this.convertNotificationTemplateToDto(savedEntity);
  }

  async updateNotificationTemplate(id: string, dto: UpdateNotificationTemplateDto): Promise<NotificationTemplateDto> {
    this.loggingService.log('Updating notification template', 'NotificationTemplateService', LoggingHelper.logParams({ id, dto }));

    const existingTemplate = await this.notificationTemplateRepository.findNotificationTemplateById(id);
    if (!existingTemplate) {
      throw new NotFoundException(`Notification template with ID ${id} not found`);
    }

    const updateData = {
      name: dto.name,
      subject: dto.subject,
      content: dto.content,
      variables: dto.variables,
      attachDocument: dto.attachDocument,
      documentAsLink: dto.documentAsLink,
      isActive: dto.isActive,
      updatedAt: new Date()
    };

    const updatedEntity = await this.notificationTemplateRepository.updateNotificationTemplate(id, updateData);
    return this.convertNotificationTemplateToDto(updatedEntity);
  }

  async createNotificationConfig(dto: CreateNotificationConfigDto): Promise<NotificationConfigDto> {
    this.loggingService.log('Creating notification config', 'NotificationTemplateService', LoggingHelper.logParams({ dto }));

    // Validate channel exists
    const channel = await this.notificationTemplateRepository.findNotificationChannelById(dto.channelId);
    if (!channel) {
      throw new NotFoundException(`Notification channel with ID ${dto.channelId} not found`);
    }

    const entity = new NotificationConfigEntity(
      null, // id will be set by repository
      dto.channelId,
      dto.createdBy,
      dto.programId,
      dto.resourceType,
      dto.categoryId,
      dto.isEnabled,
      dto.isImmediate,
      dto.batchInterval,
      dto.sendDocuments,
      dto.documentMethod,
      new Date(),
      new Date()
    );

    const savedEntity = await this.notificationTemplateRepository.createNotificationConfig(entity);
    return this.convertNotificationConfigToDto(savedEntity);
  }

  async sendNotification(dto: SendNotificationDto): Promise<SentNotificationDto> {
    this.loggingService.log('Sending notification', 'NotificationTemplateService', LoggingHelper.logParams({ dto }));

    // Validate template exists
    const template = await this.notificationTemplateRepository.findNotificationTemplateById(dto.templateId);
    if (!template) {
      throw new NotFoundException(`Notification template with ID ${dto.templateId} not found`);
    }

    // Create sent notification entity
    const sentEntity = new SentNotificationEntity(
      null, // id will be set by repository
      dto.templateId,
      dto.reservationId,
      dto.recipientId,
      dto.channel,
      NotificationStatus.SENT,
      template.content, // Use template content
      template.subject, // Use template subject
      dto.hasAttachment || false,
      dto.attachmentPath,
      new Date(),
      null, // deliveredAt
      null, // readAt
      null, // errorMessage
      new Date(),
      new Date(),
      dto.variables || {}
    );

    const savedEntity = await this.notificationTemplateRepository.createSentNotification(sentEntity);
    return this.convertSentNotificationToDto(savedEntity);
  }

  async sendBatchNotifications(channelId: string, notificationIds: string[]): Promise<void> {
    this.loggingService.log('Sending batch notifications', 'NotificationTemplateService', LoggingHelper.logParams({ channelId, count: notificationIds.length }));

    // Validate channel exists
    const channel = await this.notificationTemplateRepository.findNotificationChannelById(channelId);
    if (!channel) {
      throw new NotFoundException(`Notification channel with ID ${channelId} not found`);
    }

    // Update status for all notifications
    for (const notificationId of notificationIds) {
      await this.notificationTemplateRepository.updateSentNotification(notificationId, {
        status: NotificationStatus.SENT,
        sentAt: new Date()
      });
    }

    this.loggingService.log(`Successfully sent ${notificationIds.length} notifications via channel ${channelId}`, 'NotificationTemplateService');
  }

  async markNotificationAsRead(dto: MarkNotificationAsReadRequestDto): Promise<void> {
    this.loggingService.log('Marking notification as read', 'NotificationTemplateService', LoggingHelper.logParams(dto));

    const notification = await this.notificationTemplateRepository.findSentNotificationById(dto.notificationId);
    if (!notification) {
      throw new NotFoundException(`Notification with ID ${dto.notificationId} not found`);
    }

    if (notification.recipientId !== dto.userId) {
      throw new ForbiddenException('User not authorized to mark this notification as read');
    }

    await this.notificationTemplateRepository.updateSentNotification(dto.notificationId, {
      status: NotificationStatus.READ,
      readAt: new Date(),
      updatedAt: new Date()
    });
  }

  async getNotificationChannels(dto?: GetNotificationChannelsRequestDto): Promise<NotificationChannelDto[]> {
    this.loggingService.log('Getting notification channels', 'NotificationTemplateService', LoggingHelper.logParams(dto || {}));

    const channels = await this.notificationTemplateRepository.findAllNotificationChannels();
    const filteredChannels = dto?.isActive !== undefined ? channels.filter(c => c.isActive === dto.isActive) : channels;
    return filteredChannels.map(channel => this.convertNotificationChannelToDto(channel));
  }

  async getNotificationChannelById(dto: GetByIdRequestDto): Promise<NotificationChannelDto | null> {
    this.loggingService.log('Getting notification channel by ID', 'NotificationTemplateService', LoggingHelper.logParams(dto));

    const channel = await this.notificationTemplateRepository.findNotificationChannelById(dto.id);
    return channel ? this.convertNotificationChannelToDto(channel) : null;
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
    this.loggingService.log('Getting notification templates', 'NotificationTemplateService', LoggingHelper.logParams({ channelId, eventType, resourceType, categoryId, isActive, page, limit }));

    const { templates, total } = await this.notificationTemplateRepository.findNotificationTemplates({
      channelId,
      eventType,
      resourceType,
      categoryId,
      isActive,
      page,
      limit
    });

    return {
      templates: templates.map(template => this.convertNotificationTemplateToDto(template)),
      total
    };
  }

  async getNotificationTemplateById(dto: GetByIdRequestDto): Promise<NotificationTemplateDto | null> {
    this.loggingService.log('Getting notification template by ID', 'NotificationTemplateService', LoggingHelper.logParams(dto));

    const template = await this.notificationTemplateRepository.findNotificationTemplateById(dto.id);
    return template ? this.convertNotificationTemplateToDto(template) : null;
  }

  async getDefaultNotificationTemplate(
    channelId: string,
    eventType: NotificationEventType,
    resourceType?: string,
    categoryId?: string
  ): Promise<NotificationTemplateDto | null> {
    this.loggingService.log('Getting default notification template', 'NotificationTemplateService', LoggingHelper.logParams({
      channelId,
      eventType,
      resourceType,
      categoryId
    }));

    const template = await this.notificationTemplateRepository.findDefaultNotificationTemplate(
      channelId,
      eventType,
      resourceType,
      categoryId
    );
    
    return template ? this.convertNotificationTemplateToDto(template) : null;
  }

  async getNotificationConfigs(
    programId?: string,
    resourceType?: string,
    categoryId?: string,
    channelId?: string,
    isEnabled?: boolean
  ): Promise<NotificationConfigDto[]> {
    this.loggingService.log('Getting notification configs', 'NotificationTemplateService', LoggingHelper.logParams({
      programId,
      resourceType,
      categoryId,
      channelId,
      isEnabled
    }));

    const configs = await this.notificationTemplateRepository.findNotificationConfigs({
      programId,
      resourceType,
      categoryId,
      channelId,
      isEnabled
    });

    return configs.map(config => this.convertNotificationConfigToDto(config));
  }

  async getNotificationConfigById(dto: GetByIdRequestDto): Promise<NotificationConfigDto | null> {
    this.loggingService.log('Getting notification config by ID', 'NotificationTemplateService', LoggingHelper.logParams(dto));

    const config = await this.notificationTemplateRepository.findNotificationConfigById(dto.id);
    return config ? this.convertNotificationConfigToDto(config) : null;
  }

  async getSentNotificationsByReservation(reservationId: string): Promise<SentNotificationDto[]> {
    this.loggingService.log('Getting sent notifications by reservation', 'NotificationTemplateService', LoggingHelper.logParams({ reservationId }));

    const notifications = await this.notificationTemplateRepository.findSentNotificationsByReservation(reservationId);
    return notifications.map(notification => this.convertSentNotificationToDto(notification));
  }

  async getSentNotificationsByRecipient(
    recipientId: string,
    channel?: NotificationChannelType,
    status?: string,
    page: number = 1,
    limit: number = 10
  ): Promise<{ notifications: SentNotificationDto[]; total: number }> {
    this.loggingService.log('Getting sent notifications by recipient', 'NotificationTemplateService', LoggingHelper.logParams({
      recipientId,
      channel,
      status,
      page,
      limit
    }));

    const { notifications, total } = await this.notificationTemplateRepository.findSentNotificationsByRecipient({
      recipientId,
      channel,
      status,
      page,
      limit
    });

    return {
      notifications: notifications.map(notification => this.convertSentNotificationToDto(notification)),
      total
    };
  }

  async getPendingNotifications(channelId?: string): Promise<SentNotificationDto[]> {
    this.loggingService.log('Getting pending notifications', 'NotificationTemplateService', LoggingHelper.logParams({ channelId }));

    const notifications = await this.notificationTemplateRepository.findPendingNotifications(channelId);
    return notifications.map(notification => this.convertSentNotificationToDto(notification));
  }

  async getNotificationsForBatch(channelId: string, batchIntervalMs: number): Promise<SentNotificationDto[]> {
    this.loggingService.log('Getting notifications for batch', 'NotificationTemplateService', LoggingHelper.logParams({ channelId, batchIntervalMs }));

    const notifications = await this.notificationTemplateRepository.findNotificationsForBatch(channelId, batchIntervalMs);
    return notifications.map(notification => this.convertSentNotificationToDto(notification));
  }

  async getNotificationTemplateVariables(templateId: string): Promise<any> {
    this.loggingService.log('Getting notification template variables', 'NotificationTemplateService', LoggingHelper.logParams({ templateId }));

    const template = await this.notificationTemplateRepository.findNotificationTemplateById(templateId);
    if (!template) {
      throw new NotFoundException(`Notification template with ID ${templateId} not found`);
    }

    return template.variables || [];
  }

  async getAvailableNotificationVariables(eventType: NotificationEventType, resourceType?: string): Promise<any> {
    this.loggingService.log('Getting available notification variables', 'NotificationTemplateService', LoggingHelper.logParams({ eventType, resourceType }));

    // Define available variables based on event type and resource type
    const commonVariables = [
      'user.name', 'user.email', 'reservation.id', 'reservation.date', 
      'resource.name', 'program.name', 'datetime.now'
    ];

    const eventSpecificVariables = {
      'RESERVATION_CREATED': ['reservation.startTime', 'reservation.endTime'],
      'RESERVATION_APPROVED': ['approver.name', 'approval.date'],
      'RESERVATION_REJECTED': ['rejection.reason', 'rejection.date'],
      'RESERVATION_CANCELLED': ['cancellation.reason', 'cancellation.date']
    };

    return {
      common: commonVariables,
      eventSpecific: eventSpecificVariables[eventType] || [],
      resourceSpecific: resourceType ? [`${resourceType}.specific.variables`] : []
    };
  }

  // DTO Conversion Methods
  private convertNotificationChannelToDto(entity: NotificationChannelEntity): NotificationChannelDto {
    return {
      id: entity.id,
      name: entity.name,
      channel: entity.channel,
      displayName: entity.displayName,
      supportsAttachments: entity.supportsAttachments,
      supportsLinks: entity.supportsLinks,
      maxMessageLength: entity.maxMessageLength,
      settings: entity.settings,
      isActive: entity.isActive,
      createdAt: entity.createdAt,
      updatedAt: entity.updatedAt
    };
  }

  private convertNotificationTemplateToDto(entity: NotificationTemplateEntity): NotificationTemplateDto {
    return {
      id: entity.id,
      name: entity.name,
      channelId: entity.channelId,
      eventType: entity.eventType,
      resourceType: entity.resourceType,
      categoryId: entity.categoryId,
      subject: entity.subject,
      content: entity.content,
      variables: entity.variables,
      isDefault: entity.isDefault,
      attachDocument: entity.attachDocument,
      documentAsLink: entity.documentAsLink,
      createdBy: entity.createdBy,
      isActive: entity.isActive,
      createdAt: entity.createdAt,
      updatedAt: entity.updatedAt
    };
  }

  private convertNotificationConfigToDto(entity: NotificationConfigEntity): NotificationConfigDto {
    return {
      id: entity.id,
      channelId: entity.channelId,
      programId: entity.programId,
      resourceType: entity.resourceType,
      categoryId: entity.categoryId,
      isEnabled: entity.isEnabled,
      isImmediate: entity.isImmediate,
      batchInterval: entity.batchInterval,
      sendDocuments: entity.sendDocuments,
      documentMethod: entity.documentMethod,
      createdBy: entity.createdBy,
      createdAt: entity.createdAt,
      updatedAt: entity.updatedAt
    };
  }

  private convertSentNotificationToDto(entity: SentNotificationEntity): SentNotificationDto {
    return {
      id: entity.id,
      channel: entity.channel,
      templateId: entity.templateId,
      reservationId: entity.reservationId,
      recipientId: entity.recipientId,
      content: '', // TODO: Get content from template
      variables: entity.variables,
      status: entity.status,
      hasAttachment: entity.hasAttachment,
      attachmentPath: entity.attachmentPath,
      sentAt: entity.sentAt,
      readAt: entity.readAt,
      createdAt: entity.createdAt,
      updatedAt: entity.updatedAt
    };
  }
}
