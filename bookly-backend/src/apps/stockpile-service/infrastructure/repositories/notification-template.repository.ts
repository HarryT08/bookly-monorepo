import { Injectable } from '@nestjs/common';
import { PrismaService } from '@libs/common/services/prisma.service';
import { LoggingService } from '@libs/logging/logging.service';
import { NotificationTemplateRepository } from '@apps/stockpile-service/domain/repositories/notification-template.repository';
import { 
  NotificationChannelEntity, 
  NotificationTemplateEntity, 
  NotificationConfigEntity, 
  SentNotificationEntity,
} from '@apps/stockpile-service/domain/entities/notification-template.entity';
import { NotificationChannelType } from '@apps/availability-service/utils/notification-channel-type.enum';
import { NotificationEventType } from '@apps/stockpile-service/utils/notification-event-type.enum';
import { LoggingHelper } from '@libs/logging/logging.helper';

@Injectable()
export class PrismaNotificationTemplateRepository implements NotificationTemplateRepository {
  constructor(
    private readonly prisma: PrismaService,
    private readonly loggingService: LoggingService
  ) {}
    async findSentNotificationsByReservation(reservationId: string): Promise<SentNotificationEntity[]> {
      this.loggingService.log('Finding sent notifications by reservation', 'PrismaNotificationTemplateRepository', LoggingHelper.logId(reservationId));

      const notifications = await this.prisma.sentNotification.findMany({
        where: { reservationId },
        orderBy: { createdAt: 'desc' }
      });

      return notifications.map(notification => this.mapToSentNotificationEntity(notification));
    }
    async findNotificationTemplatesByScope(channelId: string, eventType?: NotificationEventType, resourceType?: string, categoryId?: string): Promise<NotificationTemplateEntity[]> {
        this.loggingService.log('Finding notification templates by scope', 'PrismaNotificationTemplateRepository', LoggingHelper.logParams({ channelId, eventType, resourceType, categoryId }));

        const templates = await this.prisma.notificationTemplate.findMany({
          where: {
            channelId,
            eventType,
            resourceType,
            categoryId,
            isActive: true
          },
          orderBy: { createdAt: 'desc' }
        });

        return templates.map(template => this.mapToNotificationTemplateEntity(template));
    }
    async deleteNotificationTemplate(id: string): Promise<void> {
        this.loggingService.log('Deleting notification template', 'PrismaNotificationTemplateRepository', LoggingHelper.logId(id));

        await this.prisma.notificationTemplate.delete({
          where: { id }
        });
    }
    async updateNotificationConfig(id: string, config: Partial<NotificationConfigEntity>): Promise<NotificationConfigEntity> {
        this.loggingService.log('Updating notification config', 'PrismaNotificationTemplateRepository', LoggingHelper.logId(id));

        const updated = await this.prisma.notificationConfig.update({
          where: { id },
          data: {
            isEnabled: config.isEnabled,
            updatedAt: new Date()
          }
        });

        return this.mapToNotificationConfigEntity(updated);
    }
    async findNotificationConfigsByScope(programId?: string, resourceType?: string, categoryId?: string): Promise<NotificationConfigEntity[]> {
        this.loggingService.log('Finding notification configs by scope', 'PrismaNotificationTemplateRepository', LoggingHelper.logParams({ programId, resourceType, categoryId }));

        const configs = await this.prisma.notificationConfig.findMany({
          where: {
            programId,
            resourceType,
            categoryId,
            isEnabled: true
          },
          orderBy: { createdAt: 'desc' }
        });

        return configs.map(config => this.mapToNotificationConfigEntity(config));
    }
    async findNotificationConfigByChannel(channelId: string, programId?: string, resourceType?: string, categoryId?: string): Promise<NotificationConfigEntity | null> {
        this.loggingService.log('Finding notification config by channel', 'PrismaNotificationTemplateRepository', LoggingHelper.logParams({ channelId, programId, resourceType, categoryId }));

        const config = await this.prisma.notificationConfig.findFirst({
          where: {
            channelId,
            programId,
            resourceType,
            categoryId,
            isEnabled: true
          }
        });

        return config ? this.mapToNotificationConfigEntity(config) : null;
    }
    async deleteNotificationConfig(id: string): Promise<void> {
        this.loggingService.log('Deleting notification config', 'PrismaNotificationTemplateRepository', LoggingHelper.logId(id));

        await this.prisma.notificationConfig.delete({
          where: { id }
        });
    }
    async findSentNotificationsByRecipientId(recipientId: string): Promise<SentNotificationEntity[]> {
        this.loggingService.log('Finding sent notifications by recipient', 'PrismaNotificationTemplateRepository', LoggingHelper.logId(recipientId));

        const notifications = await this.prisma.sentNotification.findMany({
          where: { recipientId },
          orderBy: { createdAt: 'desc' }
        });

        return notifications.map(notification => this.mapToSentNotificationEntity(notification));
    }

  async createNotificationChannel(channel: NotificationChannelEntity): Promise<NotificationChannelEntity> {
    this.loggingService.log('Creating notification channel in database', 'PrismaNotificationTemplateRepository', LoggingHelper.logId(channel.id));

    const created = await this.prisma.notificationChannel.create({
      data: {
        id: channel.id,
        name: channel.name,
        displayName: channel.displayName,
        isActive: channel.isActive,
        supportsAttachments: channel.supportsAttachments,
        supportsLinks: channel.supportsLinks,
        maxMessageLength: channel.maxMessageLength,
        settings: channel.settings,
        createdAt: channel.createdAt,
        updatedAt: channel.updatedAt
      }
    });

    return this.mapToNotificationChannelEntity(created);
  }

  async findNotificationChannelById(id: string): Promise<NotificationChannelEntity | null> {
    this.loggingService.log('Finding notification channel by ID', 'PrismaNotificationTemplateRepository', LoggingHelper.logId(id));

    const channel = await this.prisma.notificationChannel.findUnique({
      where: { id }
    });

    return channel ? this.mapToNotificationChannelEntity(channel) : null;
  }

  async findNotificationChannels(isActive?: boolean): Promise<NotificationChannelEntity[]> {
    this.loggingService.log('Finding notification channels', 'PrismaNotificationTemplateRepository', LoggingHelper.logParams({ isActive }));

    const channels = await this.prisma.notificationChannel.findMany({
      where: isActive !== undefined ? { isActive } : undefined,
      orderBy: { displayName: 'asc' }
    });

    return channels.map(channel => this.mapToNotificationChannelEntity(channel));
  }

  async updateNotificationChannel(id: string, channel: Partial<NotificationChannelEntity>): Promise<NotificationChannelEntity> {
    this.loggingService.log('Updating notification channel', 'PrismaNotificationTemplateRepository', LoggingHelper.logId(id));

    const updated = await this.prisma.notificationChannel.update({
      where: { id },
      data: {
        name: channel.name,
        displayName: channel.displayName,
        isActive: channel.isActive,
        supportsAttachments: channel.supportsAttachments,
        supportsLinks: channel.supportsLinks,
        maxMessageLength: channel.maxMessageLength,
        settings: channel.settings,
        updatedAt: new Date()
      }
    });

    return this.mapToNotificationChannelEntity(updated);
  }

  async findNotificationChannelByType(type: NotificationChannelType): Promise<NotificationChannelEntity | null> {
    this.loggingService.log('Finding notification channel by type', 'PrismaNotificationTemplateRepository', LoggingHelper.logParams({ type }));

    const channel = await this.prisma.notificationChannel.findFirst({
      where: { name: type }
    });

    return channel ? this.mapToNotificationChannelEntity(channel) : null;
  }

  async findAllNotificationChannels(): Promise<NotificationChannelEntity[]> {
    this.loggingService.log('Finding all notification channels', 'PrismaNotificationTemplateRepository', '');

    const channels = await this.prisma.notificationChannel.findMany({
      orderBy: { displayName: 'asc' }
    });

    return channels.map(channel => this.mapToNotificationChannelEntity(channel));
  }

  async findActiveNotificationChannels(): Promise<NotificationChannelEntity[]> {
    this.loggingService.log('Finding active notification channels', 'PrismaNotificationTemplateRepository', '');

    const channels = await this.prisma.notificationChannel.findMany({
      where: { isActive: true },
      orderBy: { displayName: 'asc' }
    });

    return channels.map(channel => this.mapToNotificationChannelEntity(channel));
  }

  async createNotificationTemplate(template: NotificationTemplateEntity): Promise<NotificationTemplateEntity> {
    this.loggingService.log('Creating notification template in database', 'PrismaNotificationTemplateRepository', LoggingHelper.logId(template.id));

    const created = await this.prisma.notificationTemplate.create({
      data: {
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
      },
      include: {
        channel: true
      }
    });

    return this.mapToNotificationTemplateEntity(created);
  }

  async updateNotificationTemplate(id: string, template: Partial<NotificationTemplateEntity>): Promise<NotificationTemplateEntity> {
    this.loggingService.log('Updating notification template in database', 'PrismaNotificationTemplateRepository', LoggingHelper.logId(template.id));

    const updated = await this.prisma.notificationTemplate.update({
      where: { id },
      data: {
        name: template.name,
        subject: template.subject,
        content: template.content,
        variables: template.variables,
        isActive: template.isActive,
        attachDocument: template.attachDocument,
        documentAsLink: template.documentAsLink,
        updatedAt: template.updatedAt
      },
      include: {
        channel: true
      }
    });

    return this.mapToNotificationTemplateEntity(updated);
  }

  async findNotificationTemplateById(id: string): Promise<NotificationTemplateEntity | null> {
    this.loggingService.log('Finding notification template by ID', 'PrismaNotificationTemplateRepository', LoggingHelper.logId(id));

    const template = await this.prisma.notificationTemplate.findUnique({
      where: { id },
      include: {
        channel: true
      }
    });

    return template ? this.mapToNotificationTemplateEntity(template) : null;
  }

  async findNotificationTemplates(filters: {
    channelId?: string;
    eventType?: string;
    resourceType?: string;
    categoryId?: string;
    isActive?: boolean;
    isDefault?: boolean;
    page?: number;
    limit?: number;
  }): Promise<{ templates: NotificationTemplateEntity[]; total: number }> {
    this.loggingService.log('Finding notification templates with filters', 'PrismaNotificationTemplateRepository', LoggingHelper.logParams(filters));

    const where = {
      channelId: filters.channelId,
      eventType: filters.eventType,
      resourceType: filters.resourceType,
      categoryId: filters.categoryId,
      isActive: filters.isActive
    };

    const [templates, total] = await Promise.all([
      this.prisma.notificationTemplate.findMany({
        where,
        include: {
          channel: true
        },
        orderBy: { createdAt: 'desc' },
        skip: filters.page && filters.limit ? (filters.page - 1) * filters.limit : undefined,
        take: filters.limit
      }),
      this.prisma.notificationTemplate.count({ where })
    ]);

    return {
      templates: templates.map(template => this.mapToNotificationTemplateEntity(template)),
      total
    };
  }

  async findDefaultNotificationTemplate(
    channelId: string,
    eventType: NotificationEventType,
    resourceType?: string,
    categoryId?: string
  ): Promise<NotificationTemplateEntity | null> {
    this.loggingService.log('Finding default notification template', 'PrismaNotificationTemplateRepository', LoggingHelper.logParams({ channelId, eventType, resourceType, categoryId }));

    const template = await this.prisma.notificationTemplate.findFirst({
      where: {
        channelId,
        eventType,
        resourceType,
        categoryId,
        isDefault: true,
        isActive: true
      },
      include: {
        channel: true
      }
    });

    return template ? this.mapToNotificationTemplateEntity(template) : null;
  }

  async createNotificationConfig(config: NotificationConfigEntity): Promise<NotificationConfigEntity> {
    this.loggingService.log('Creating notification config in database', 'PrismaNotificationTemplateRepository', LoggingHelper.logId(config.id));

    const created = await this.prisma.notificationConfig.create({
      data: {
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
      },
      include: {
        channel: true
      }
    });

    return this.mapToNotificationConfigEntity(created);
  }

  async findNotificationConfigById(id: string): Promise<NotificationConfigEntity | null> {
    this.loggingService.log('Finding notification config by ID', 'PrismaNotificationTemplateRepository', LoggingHelper.logId(id));

    const config = await this.prisma.notificationConfig.findUnique({
      where: { id },
      include: {
        channel: true
      }
    });

    return config ? this.mapToNotificationConfigEntity(config) : null;
  }

  async findNotificationConfigs(filters: {
    programId?: string;
    resourceType?: string;
    categoryId?: string;
    channelId?: string;
    isEnabled?: boolean;
  }): Promise<NotificationConfigEntity[]> {
    this.loggingService.log('Finding notification configs with filters', 'PrismaNotificationTemplateRepository', LoggingHelper.logParams(filters));

    const configs = await this.prisma.notificationConfig.findMany({
      where: {
        programId: filters.programId,
        resourceType: filters.resourceType,
        categoryId: filters.categoryId,
        channelId: filters.channelId,
        isEnabled: filters.isEnabled
      },
      include: {
        channel: true
      },
      orderBy: { createdAt: 'desc' }
    });

    return configs.map(config => this.mapToNotificationConfigEntity(config));
  }

  async createSentNotification(notification: SentNotificationEntity): Promise<SentNotificationEntity> {
    this.loggingService.log('Creating sent notification in database', 'PrismaNotificationTemplateRepository', LoggingHelper.logId(notification.id));

    const created = await this.prisma.sentNotification.create({
      data: {
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
        createdAt: notification.createdAt
      },
      include: {
        template: true,
        reservation: true,
        recipient: true
      }
    });

    return this.mapToSentNotificationEntity(created);
  }

  async updateSentNotification(id: string, notification: Partial<SentNotificationEntity>): Promise<SentNotificationEntity> {
    this.loggingService.log('Updating sent notification in database', 'PrismaNotificationTemplateRepository', LoggingHelper.logId(notification.id));

    const updated = await this.prisma.sentNotification.update({
      where: { id },
      data: {
        sentAt: notification.sentAt,
        deliveredAt: notification.deliveredAt,
        readAt: notification.readAt,
        errorMessage: notification.errorMessage
        // metadata: notification.metadata // Field not in schema
      },
      include: {
        template: true,
        reservation: true,
        recipient: true
      }
    });

    return this.mapToSentNotificationEntity(updated);
  }

  async findSentNotificationById(id: string): Promise<SentNotificationEntity | null> {
    this.loggingService.log('Finding sent notification by ID', 'PrismaNotificationTemplateRepository', LoggingHelper.logId(id));

    const notification = await this.prisma.sentNotification.findUnique({
      where: { id },
      include: {
        template: true,
        reservation: true,
        recipient: true
      }
    });

    return notification ? this.mapToSentNotificationEntity(notification) : null;
  }

  async findSentNotificationsByReservationId(reservationId: string): Promise<SentNotificationEntity[]> {
    this.loggingService.log('Finding sent notifications by reservation', 'PrismaNotificationTemplateRepository', LoggingHelper.logId(reservationId));

    const notifications = await this.prisma.sentNotification.findMany({
      where: { reservationId },
      include: {
        template: true,
        reservation: true,
        recipient: true
      },
      orderBy: { createdAt: 'desc' }
    });

    return notifications.map(notification => this.mapToSentNotificationEntity(notification));
  }

  async findSentNotificationsByRecipient(filters: {
    recipientId: string;
    channel?: string;
    status?: string;
    page?: number;
    limit?: number;
  }): Promise<{ notifications: SentNotificationEntity[]; total: number }> {
    this.loggingService.log('Finding sent notifications by recipient', 'PrismaNotificationTemplateRepository', LoggingHelper.logParams(filters));

    const where = {
      recipientId: filters.recipientId,
      channel: filters.channel,
      status: filters.status
    };

    const [notifications, total] = await Promise.all([
      this.prisma.sentNotification.findMany({
        where,
        include: {
          template: true,
          reservation: true,
          recipient: true
        },
        orderBy: { createdAt: 'desc' },
        skip: filters.page && filters.limit ? (filters.page - 1) * filters.limit : undefined,
        take: filters.limit
      }),
      this.prisma.sentNotification.count({ where })
    ]);

    return {
      notifications: notifications.map(notification => this.mapToSentNotificationEntity(notification)),
      total
    };
  }

  async findPendingNotifications(channelId?: string): Promise<SentNotificationEntity[]> {
    this.loggingService.log('Finding pending notifications', 'PrismaNotificationTemplateRepository', LoggingHelper.logParams({ channelId }));

    const notifications = await this.prisma.sentNotification.findMany({
      where: {
        status: 'PENDING',
        template: channelId ? { channelId } : undefined
      },
      include: {
        template: true,
        reservation: true,
        recipient: true
      },
      orderBy: { createdAt: 'asc' }
    });

    return notifications.map(notification => this.mapToSentNotificationEntity(notification));
  }

  async findNotificationsForBatch(channelId: string, batchIntervalMs: number): Promise<SentNotificationEntity[]> {
    this.loggingService.log('Finding notifications for batch', 'PrismaNotificationTemplateRepository', LoggingHelper.logParams({ channelId, batchIntervalMs }));

    const cutoffTime = new Date(Date.now() - batchIntervalMs);

    const notifications = await this.prisma.sentNotification.findMany({
      where: {
        status: 'PENDING',
        template: { channelId },
        createdAt: {
          lte: cutoffTime
        }
      },
      include: {
        template: true,
        reservation: true,
        recipient: true
      },
      orderBy: { createdAt: 'asc' }
    });

    return notifications.map(notification => this.mapToSentNotificationEntity(notification));
  }

  private mapToNotificationChannelEntity(data: any): NotificationChannelEntity {
    return new NotificationChannelEntity(
      data.id,
      data.name,
      data.displayName,
      data.isActive,
      data.supportsAttachments,
      data.supportsLinks,
      data.maxMessageLength,
      data.settings,
      data.createdAt,
      data.updatedAt
    );
  }

  private mapToNotificationTemplateEntity(data: any): NotificationTemplateEntity {
    return new NotificationTemplateEntity(
      data.id,
      data.name,
      data.channelId,
      data.eventType,
      data.resourceType,
      data.categoryId,
      data.subject,
      data.content,
      data.variables,
      data.isDefault,
      data.isActive,
      data.attachDocument,
      data.documentAsLink,
      data.createdBy,
      data.createdAt,
      data.updatedAt
    );
  }

  private mapToNotificationConfigEntity(data: any): NotificationConfigEntity {
    return new NotificationConfigEntity(
      data.id,
      data.programId,
      data.resourceType,
      data.categoryId,
      data.channelId,
      data.isEnabled,
      data.isImmediate,
      data.batchInterval,
      data.sendDocuments,
      data.documentMethod,
      data.createdBy,
      data.createdAt,
      data.updatedAt
    );
  }

  private mapToSentNotificationEntity(data: any): SentNotificationEntity {
    return new SentNotificationEntity(
      data.id,
      data.templateId,
      data.reservationId,
      data.recipientId,
      data.channel,
      data.subject,
      data.content,
      data.status,
      data.hasAttachment,
      data.attachmentPath,
      data.sentAt,
      data.readAt,
      data.errorMessage,
      data.metadata,
      data.createdAt
    );
  }
}
