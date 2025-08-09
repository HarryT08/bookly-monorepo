/**
 * Notification Module
 * Configures automatic notification system for availability service
 * Integrates event handlers, services, and repositories
 */

import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { LoggingModule } from '@/libs/logging/logging.module';
import { EventBusModule } from '@/libs/event-bus/event-bus.module';

// Services
import { NotificationService } from '../services/notification.service';

// Repositories
import { NotificationTemplateRepository } from '../repositories/notification-template.repository';

// Event Handlers
import { NotificationEventHandler } from '../handlers/notification-event.handler';

// Repository implementations for notification data
import { UserNotificationRepositoryImpl } from '../repositories/user-notification.repository';
import { ResourceNotificationRepositoryImpl } from '../repositories/resource-notification.repository';

// Interfaces
import { UserNotificationRepository } from '../handlers/notification-event.handler';
import { ResourceNotificationRepository } from '../handlers/notification-event.handler';

@Module({
  imports: [
    CqrsModule,
    LoggingModule,
    EventBusModule
  ],
  providers: [
    // Core notification service
    NotificationService,
    
    // Template management
    NotificationTemplateRepository,
    
    // Event handler for automatic notifications
    NotificationEventHandler,
    
    // Repository implementations
    {
      provide: 'UserNotificationRepository',
      useClass: UserNotificationRepositoryImpl
    },
    {
      provide: 'ResourceNotificationRepository', 
      useClass: ResourceNotificationRepositoryImpl
    }
  ],
  exports: [
    NotificationService,
    NotificationTemplateRepository,
    NotificationEventHandler
  ]
})
export class NotificationModule {}
