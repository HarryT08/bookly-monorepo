import { 
  NotificationChannelEntity, 
  NotificationTemplateEntity, 
  NotificationConfigEntity, 
  SentNotificationEntity
} from '../entities/notification-template.entity';
import { NotificationEventType } from '../../utils/notification-event-type.enum';
import { NotificationChannelType } from '@/apps/availability-service/utils/notification-channel-type.enum';

export interface NotificationTemplateRepository {
  findNotificationTemplates(filters: { channelId: string; eventType: NotificationEventType; resourceType: string; categoryId: string; isActive: boolean; page: number; limit: number; }): Promise<{ templates: NotificationTemplateEntity[]; total: number }>;
  findNotificationConfigs(filters: { programId: string; resourceType: string; categoryId: string; channelId: string; isEnabled: boolean; }): Promise<NotificationConfigEntity[]>;
  findSentNotificationsByReservation(reservationId: string): Promise<SentNotificationEntity[]>;
  findSentNotificationsByRecipient(filters: { recipientId: string; channel: NotificationChannelType; status: string; page: number; limit: number; }): Promise<{ notifications: SentNotificationEntity[]; total: number }>;
  // Notification Channel operations
  createNotificationChannel(channel: NotificationChannelEntity): Promise<NotificationChannelEntity>;
  updateNotificationChannel(id: string, channel: Partial<NotificationChannelEntity>): Promise<NotificationChannelEntity>;
  findNotificationChannelById(id: string): Promise<NotificationChannelEntity | null>;
  findNotificationChannelByType(type: NotificationChannelType): Promise<NotificationChannelEntity | null>;
  findAllNotificationChannels(): Promise<NotificationChannelEntity[]>;
  findActiveNotificationChannels(): Promise<NotificationChannelEntity[]>;
  
  // Notification Template operations
  createNotificationTemplate(template: NotificationTemplateEntity): Promise<NotificationTemplateEntity>;
  updateNotificationTemplate(id: string, template: Partial<NotificationTemplateEntity>): Promise<NotificationTemplateEntity>;
  findNotificationTemplateById(id: string): Promise<NotificationTemplateEntity | null>;
  findNotificationTemplatesByScope(
    channelId: string, 
    eventType?: NotificationEventType, 
    resourceType?: string, 
    categoryId?: string
  ): Promise<NotificationTemplateEntity[]>;
  findDefaultNotificationTemplate(
    channelId: string, 
    eventType: NotificationEventType, 
    resourceType?: string, 
    categoryId?: string
  ): Promise<NotificationTemplateEntity | null>;
  deleteNotificationTemplate(id: string): Promise<void>;
  
  // Notification Config operations
  createNotificationConfig(config: NotificationConfigEntity): Promise<NotificationConfigEntity>;
  updateNotificationConfig(id: string, config: Partial<NotificationConfigEntity>): Promise<NotificationConfigEntity>;
  findNotificationConfigById(id: string): Promise<NotificationConfigEntity | null>;
  findNotificationConfigsByScope(
    programId?: string, 
    resourceType?: string, 
    categoryId?: string
  ): Promise<NotificationConfigEntity[]>;
  findNotificationConfigByChannel(
    channelId: string, 
    programId?: string, 
    resourceType?: string, 
    categoryId?: string
  ): Promise<NotificationConfigEntity | null>;
  deleteNotificationConfig(id: string): Promise<void>;
  
  // Sent Notification operations
  createSentNotification(notification: SentNotificationEntity): Promise<SentNotificationEntity>;
  updateSentNotification(id: string, notification: Partial<SentNotificationEntity>): Promise<SentNotificationEntity>;
  findSentNotificationById(id: string): Promise<SentNotificationEntity | null>;
  findSentNotificationsByReservationId(reservationId: string): Promise<SentNotificationEntity[]>;
  findSentNotificationsByRecipientId(recipientId: string): Promise<SentNotificationEntity[]>;
  findPendingNotifications(channelId?: string): Promise<SentNotificationEntity[]>;
  findNotificationsForBatch(channelId: string, batchIntervalMs: number): Promise<SentNotificationEntity[]>;
}
