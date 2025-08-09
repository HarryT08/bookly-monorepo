/**
 * Notification Module
 * Configures automatic notification system for availability service
 * Integrates event handlers, services, and repositories
 */

import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { HttpModule } from '@nestjs/axios';
import { ConfigModule } from '@nestjs/config';
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

// HTTP clients to other services
import { AuthServiceClient } from '../clients/auth-service.client';
import { ResourcesServiceClient } from '../clients/resources-service.client';

// Interfaces
import { UserNotificationRepository } from '../handlers/notification-event.handler';
import { ResourceNotificationRepository } from '../handlers/notification-event.handler';

@Module({
  imports: [
    CqrsModule,
    HttpModule,
    ConfigModule,
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

    // External service clients used by repositories
    AuthServiceClient,
    ResourcesServiceClient,

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
