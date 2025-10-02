import { QueryHandler, IQueryHandler } from '@nestjs/cqrs';
import { Injectable, Inject } from '@nestjs/common';
import { LoggingService } from '@libs/logging/logging.service';
import { NotificationTemplateRepository } from '@apps/stockpile-service/domain/repositories/notification-template.repository';
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
} from '@libs/dto/stockpile/notification-template.dto';
import { LoggingHelper } from '@libs/logging/logging.helper';
import { NotificationTemplateService } from '@apps/stockpile-service/application/services/notification-template.service';
import { NotificationChannelEntity } from '@apps/stockpile-service/domain/entities/notification-template.entity';
import { NotificationChannelType } from '@apps/availability-service/utils/notification-channel-type.enum';

@Injectable()
@QueryHandler(GetNotificationChannelsQuery)
export class GetNotificationChannelsHandler implements IQueryHandler<GetNotificationChannelsQuery> {
  constructor(
    private readonly notificationTemplateService: NotificationTemplateService,
    private readonly loggingService: LoggingService
  ) {}

  async execute(query: GetNotificationChannelsQuery): Promise<NotificationChannelDto[]> {
    this.loggingService.log('Orchestrating get notification channels query', 'GetNotificationChannelsHandler', LoggingHelper.logParams(query));

    return await this.notificationTemplateService.getNotificationChannels();
  }
}

@Injectable()
@QueryHandler(GetNotificationChannelByIdQuery)
export class GetNotificationChannelByIdHandler implements IQueryHandler<GetNotificationChannelByIdQuery> {
  constructor(
    private readonly notificationTemplateService: NotificationTemplateService,
    private readonly loggingService: LoggingService
  ) {}

  async execute(query: GetNotificationChannelByIdQuery): Promise<NotificationChannelDto | null> {
    this.loggingService.log('Orchestrating get notification channel by ID query', 'GetNotificationChannelByIdHandler', LoggingHelper.logParams({ id: query.id }));

    const channel = await this.notificationTemplateService.getNotificationChannelById({ id: query.id });
    return channel;
  }
}

@Injectable()
@QueryHandler(GetNotificationTemplatesQuery)
export class GetNotificationTemplatesHandler implements IQueryHandler<GetNotificationTemplatesQuery> {
  constructor(
    private readonly notificationTemplateService: NotificationTemplateService,
    private readonly loggingService: LoggingService
  ) {}

  async execute(query: GetNotificationTemplatesQuery): Promise<{ templates: NotificationTemplateDto[]; total: number }> {
    this.loggingService.log('Orchestrating get notification templates query', 'GetNotificationTemplatesHandler', LoggingHelper.logParams({ query }));

    return await this.notificationTemplateService.getNotificationTemplates(
      query.channelId,
      query.eventType,
      query.resourceType,
      query.categoryId,
      query.isActive,
      query.page,
      query.limit
    );
  }
}

@Injectable()
@QueryHandler(GetNotificationTemplateByIdQuery)
export class GetNotificationTemplateByIdHandler implements IQueryHandler<GetNotificationTemplateByIdQuery> {
  constructor(
    private readonly notificationTemplateService: NotificationTemplateService,
    private readonly loggingService: LoggingService
  ) {}

  async execute(query: GetNotificationTemplateByIdQuery): Promise<NotificationTemplateDto | null> {
    this.loggingService.log('Orchestrating get notification template by ID query', 'GetNotificationTemplateByIdHandler', LoggingHelper.logParams({ id: query.id }));

    const template = await this.notificationTemplateService.getNotificationTemplateById({ id: query.id });
    return template;
  }
}

@Injectable()
@QueryHandler(GetDefaultNotificationTemplateQuery)
export class GetDefaultNotificationTemplateHandler implements IQueryHandler<GetDefaultNotificationTemplateQuery> {
  constructor(
    private readonly notificationTemplateService: NotificationTemplateService,
    private readonly loggingService: LoggingService
  ) {}

  async execute(query: GetDefaultNotificationTemplateQuery): Promise<NotificationTemplateDto | null> {
    this.loggingService.log('Orchestrating get default notification template query', 'GetDefaultNotificationTemplateHandler', LoggingHelper.logParams({ query }));

    return await this.notificationTemplateService.getDefaultNotificationTemplate(
      query.channelId,
      query.eventType,
      query.resourceType,
      query.categoryId
    );
  }
}

@Injectable()
@QueryHandler(GetNotificationConfigsQuery)
export class GetNotificationConfigsHandler implements IQueryHandler<GetNotificationConfigsQuery> {
  constructor(
    private readonly notificationTemplateService: NotificationTemplateService,
    private readonly loggingService: LoggingService
  ) {}

  async execute(query: GetNotificationConfigsQuery): Promise<NotificationConfigDto[]> {
    this.loggingService.log('Orchestrating get notification configs query', 'GetNotificationConfigsHandler', LoggingHelper.logParams(query));

    return await this.notificationTemplateService.getNotificationConfigs(
      query.programId,
      query.resourceType,
      query.categoryId,
      query.channelId,
      query.isEnabled
    );
  }

}

@Injectable()
@QueryHandler(GetNotificationConfigByIdQuery)
export class GetNotificationConfigByIdHandler implements IQueryHandler<GetNotificationConfigByIdQuery> {
  constructor(
    private readonly notificationTemplateService: NotificationTemplateService,
    private readonly loggingService: LoggingService
  ) {}

  async execute(query: GetNotificationConfigByIdQuery): Promise<NotificationConfigDto | null> {
    this.loggingService.log('Orchestrating get notification config by ID query', 'GetNotificationConfigByIdHandler', LoggingHelper.logParams(query));

    const config = await this.notificationTemplateService.getNotificationConfigById({ id: query.id });
    return config;
  }

}

@Injectable()
@QueryHandler(GetSentNotificationsByReservationQuery)
export class GetSentNotificationsByReservationHandler implements IQueryHandler<GetSentNotificationsByReservationQuery> {
  constructor(
    private readonly notificationTemplateService: NotificationTemplateService,
    private readonly loggingService: LoggingService
  ) {}

  async execute(query: GetSentNotificationsByReservationQuery): Promise<SentNotificationDto[]> {
    this.loggingService.log('Orchestrating get sent notifications by reservation query', 'GetSentNotificationsByReservationHandler', LoggingHelper.logParams(query));

    return await this.notificationTemplateService.getSentNotificationsByReservation(query.reservationId);
  }
}

@Injectable()
@QueryHandler(GetSentNotificationsByRecipientQuery)
export class GetSentNotificationsByRecipientHandler implements IQueryHandler<GetSentNotificationsByRecipientQuery> {
  constructor(
    private readonly notificationTemplateService: NotificationTemplateService,
    private readonly loggingService: LoggingService
  ) {}

  async execute(query: GetSentNotificationsByRecipientQuery): Promise<{ notifications: SentNotificationDto[]; total: number }> {
    this.loggingService.log('Orchestrating get sent notifications by recipient query', 'GetSentNotificationsByRecipientHandler', LoggingHelper.logParams(query));

    return await this.notificationTemplateService.getSentNotificationsByRecipient(
      query.recipientId,
      query.channel,
      query.status,
      query.page,
      query.limit
    );
  }
}

@Injectable()
@QueryHandler(GetPendingNotificationsQuery)
export class GetPendingNotificationsHandler implements IQueryHandler<GetPendingNotificationsQuery> {
  constructor(
    private readonly notificationTemplateService: NotificationTemplateService,
    private readonly loggingService: LoggingService
  ) {}

  async execute(query: GetPendingNotificationsQuery): Promise<SentNotificationDto[]> {
    this.loggingService.log('Orchestrating get pending notifications query', 'GetPendingNotificationsHandler', LoggingHelper.logParams(query));

    return await this.notificationTemplateService.getPendingNotifications(query.channelId);
  }
}

@Injectable()
@QueryHandler(GetNotificationsForBatchQuery)
export class GetNotificationsForBatchHandler implements IQueryHandler<GetNotificationsForBatchQuery> {
  constructor(
    private readonly notificationTemplateService: NotificationTemplateService,
    private readonly loggingService: LoggingService
  ) {}

  async execute(query: GetNotificationsForBatchQuery): Promise<SentNotificationDto[]> {
    this.loggingService.log('Orchestrating get notifications for batch query', 'GetNotificationsForBatchHandler', LoggingHelper.logParams(query));

    return await this.notificationTemplateService.getNotificationsForBatch(
      query.channelId,
      query.batchIntervalMs
    );
  }
}

@Injectable()
@QueryHandler(GetNotificationTemplateVariablesQuery)
export class GetNotificationTemplateVariablesHandler implements IQueryHandler<GetNotificationTemplateVariablesQuery> {
  constructor(
    private readonly notificationTemplateService: NotificationTemplateService,
    private readonly loggingService: LoggingService
  ) {}

  async execute(query: GetNotificationTemplateVariablesQuery): Promise<any> {
    this.loggingService.log('Orchestrating get notification template variables query', 'GetNotificationTemplateVariablesHandler', LoggingHelper.logParams(query));

    return await this.notificationTemplateService.getNotificationTemplateVariables(query.templateId);
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
