import { EventsHandler, IEventHandler, CommandBus } from '@nestjs/cqrs';
import { Injectable } from '@nestjs/common';
import { LoggingService } from '@libs/logging/logging.service';
import { DomainEvent, EventBusService } from '@libs/event-bus/services/event-bus.service';
import {
  ReservationSubmittedEvent,
  ApprovalRequestCreatedEvent,
  ReservationApprovedEvent,
  ReservationRejectedEvent,
  ReservationCancelledEvent,
  ApprovalRequestTimeoutEvent,
  ApprovalReminderEvent,
} from '@apps/stockpile-service/domain/events/approval-flow.events';
import { 
  GenerateDocumentCommand 
} from '../../commands/document-template.commands';
import { 
  SendNotificationCommand 
} from '../../commands/notification-template.commands';
import { LoggingHelper } from '@libs/logging/logging.helper';
import { NotificationChannelType } from '@apps/availability-service/utils/notification-channel-type.enum';

@Injectable()
@EventsHandler(ReservationSubmittedEvent)
export class ReservationSubmittedHandler implements IEventHandler<ReservationSubmittedEvent> {
  constructor(
    private readonly loggingService: LoggingService,
    private readonly eventBusService: EventBusService,
    private readonly commandBus: CommandBus
  ) {}

  async handle(event: ReservationSubmittedEvent): Promise<void> {
    this.loggingService.log('Handling reservation submitted event', 'ReservationSubmittedHandler', LoggingHelper.logParams(event));

    // Update reservation status to SOLICITADO
    await this.eventBusService.publishEvent({
      eventId: event.reservationId,
      eventType: 'UPDATE_RESERVATION_STATUS_REQUESTED',
      aggregateId: event.reservationId,
      aggregateType: 'Reservation',
      eventData: event,
      timestamp: event.timestamp,
      version: 1
    } as DomainEvent);

    // Generate submission confirmation document if configured
    this.commandBus.execute(new GenerateDocumentCommand(
      '', // Will be resolved by template matching
      event.reservationId,
      {
        reservationId: event.reservationId,
        userId: event.userId,
        resourceId: event.resourceId,
        eventType: 'RESERVATION_SUBMITTED',
        variables: event.variables
      },
      'SYSTEM'
    )).catch(error => {
      this.loggingService.error('Failed to generate submission document', error, 'ReservationSubmittedHandler');
    });

    // Send submission notification
    this.commandBus.execute(new SendNotificationCommand(
      NotificationChannelType.EMAIL, // Default channel
      '', // Will be resolved by template matching
      event.reservationId,
      event.userId,
      {
        reservationId: event.reservationId,
        eventType: 'RESERVATION_SUBMITTED',
        ...event.variables
      },
      false, // hasAttachment
      null // attachmentPath
    )).catch(error => {
      this.loggingService.error('Failed to send submission notification', error, 'ReservationSubmittedHandler');
    });

    this.loggingService.log('Reservation submitted event handled successfully', 'ReservationSubmittedHandler');
  }
}

@Injectable()
@EventsHandler(ApprovalRequestCreatedEvent)
export class ApprovalRequestCreatedHandler implements IEventHandler<ApprovalRequestCreatedEvent> {
  constructor(
    private readonly loggingService: LoggingService,
    private readonly eventBusService: EventBusService,
    private readonly commandBus: CommandBus
  ) {}

  async handle(event: ApprovalRequestCreatedEvent): Promise<void> {
    this.loggingService.log('Handling approval request created event', 'ApprovalRequestCreatedHandler', LoggingHelper.logParams(event));

    // Update reservation status to REVISANDO
    await this.eventBusService.publishEvent({
      eventId: event.reservationId,
      eventType: 'UPDATE_RESERVATION_STATUS_REVIEWING',
      aggregateId: event.reservationId,
      aggregateType: 'Reservation',
      eventData: event,
      timestamp: event.timestamp,
      version: 1
    } as DomainEvent);

    // Send notification to all approvers
    for (const approverId of event.approverIds) {
      this.commandBus.execute(new SendNotificationCommand(
        NotificationChannelType.EMAIL, // Default channel
        '', // Will be resolved by template matching
        event.reservationId,
        approverId,
        {
          reservationId: event.reservationId,
          requestId: event.requestId,
          eventType: 'APPROVAL_REQUEST_CREATED',
          timeoutAt: event.timeoutAt,
          ...event.variables
        },
        false, // hasAttachment
        null // attachmentPath
      )).catch(error => {
        this.loggingService.error(`Failed to send approval notification to ${approverId}`, error, 'ApprovalRequestCreatedHandler');
      });
    }

    this.loggingService.log('Approval request created event handled successfully', 'ApprovalRequestCreatedHandler');
  }
}

@Injectable()
@EventsHandler(ReservationApprovedEvent)
export class ReservationApprovedHandler implements IEventHandler<ReservationApprovedEvent> {
  constructor(
    private readonly loggingService: LoggingService,
    private readonly eventBusService: EventBusService,
    private readonly commandBus: CommandBus
  ) {}

  async handle(event: ReservationApprovedEvent): Promise<void> {
    this.loggingService.log('Handling reservation approved event', 'ReservationApprovedHandler', LoggingHelper.logParams(event));

    if (event.isComplete) {
      // Update reservation status to APROBADA
      await this.eventBusService.publishEvent({
        eventId: event.reservationId,
        eventType: 'UPDATE_RESERVATION_STATUS_APPROVED',
        aggregateId: event.reservationId,
        aggregateType: 'Reservation',
        eventData: event,
        timestamp: event.timestamp,
        version: 1
      } as DomainEvent);

      // Block the resource for the approved time slots
      await this.eventBusService.publishEvent({
        eventId: event.reservationId,
        eventType: 'BLOCK_RESOURCES',
        aggregateId: event.reservationId,
        aggregateType: 'Reservation',
        eventData: event,
        timestamp: event.timestamp,
        version: 1
      } as DomainEvent);

      // Generate approval document
      this.commandBus.execute(new GenerateDocumentCommand(
        '', // Will be resolved by template matching
        event.reservationId,
        {
          reservationId: event.reservationId,
          approverId: event.approverId,
          comments: event.comments,
          eventType: 'APPROVAL'
        },
        event.approverId
      )).catch(error => {
        this.loggingService.error('Failed to generate approval document', error, 'ReservationApprovedHandler');
      });

      // Send approval notification to requester
      this.commandBus.execute(new SendNotificationCommand(
        NotificationChannelType.EMAIL, // Default channel
        '', // Will be resolved by template matching
        event.reservationId,
        '', // Will be resolved to reservation requester
        {
          reservationId: event.reservationId,
          approverId: event.approverId,
          comments: event.comments,
          eventType: 'RESERVATION_APPROVED'
        },
        false, // hasAttachment
        null // attachmentPath
      )).catch(error => {
        this.loggingService.error('Failed to send approval notification', error, 'ReservationApprovedHandler');
      });
    }

    this.loggingService.log('Reservation approved event handled successfully', 'ReservationApprovedHandler');
  }
}

@Injectable()
@EventsHandler(ReservationRejectedEvent)
export class ReservationRejectedHandler implements IEventHandler<ReservationRejectedEvent> {
  constructor(
    private readonly loggingService: LoggingService,
    private readonly eventBusService: EventBusService,
    private readonly commandBus: CommandBus
  ) {}

  async handle(event: ReservationRejectedEvent): Promise<void> {
    this.loggingService.log('Handling reservation rejected event', 'ReservationRejectedHandler', LoggingHelper.logParams(event));

    // Update reservation status to RECHAZADA
    await this.eventBusService.publishEvent({
      eventId: event.reservationId,
      eventType: 'UPDATE_RESERVATION_STATUS_REJECTED',
      aggregateId: event.reservationId,
      aggregateType: 'Reservation',
      eventData: event,
      timestamp: event.timestamp,
      version: 1
    } as DomainEvent);

    // Generate rejection document
    this.commandBus.execute(new GenerateDocumentCommand(
      '', // Will be resolved by template matching
      event.reservationId,
      {
        reservationId: event.reservationId,
        approverId: event.approverId,
        comments: event.comments,
        eventType: 'REJECTION'
      },
      event.approverId
    )).catch(error => {
      this.loggingService.error('Failed to generate rejection document', error, 'ReservationRejectedHandler');
    });

    // Send rejection notification to requester
    this.commandBus.execute(new SendNotificationCommand(
      NotificationChannelType.EMAIL, // Default channel
      '', // Will be resolved by template matching
      event.reservationId,
      '', // Will be resolved to reservation requester
      {
        reservationId: event.reservationId,
        approverId: event.approverId,
        comments: event.comments,
        eventType: 'RESERVATION_REJECTED'
      },
      false, // hasAttachment
      null // attachmentPath
    )).catch(error => {
      this.loggingService.error('Failed to send rejection notification', error, 'ReservationRejectedHandler');
    });

    this.loggingService.log('Reservation rejected event handled successfully', 'ReservationRejectedHandler');
  }
}

@Injectable()
@EventsHandler(ReservationCancelledEvent)
export class ReservationCancelledHandler implements IEventHandler<ReservationCancelledEvent> {
  constructor(
    private readonly loggingService: LoggingService,
    private readonly eventBusService: EventBusService,
    private readonly commandBus: CommandBus
  ) {}

  async handle(event: ReservationCancelledEvent): Promise<void> {
    this.loggingService.log('Handling reservation cancelled event', 'ReservationCancelledHandler', LoggingHelper.logParams(event));

    // Update reservation status to CANCELADA
    await this.eventBusService.publishEvent({
      eventId: event.reservationId,
      eventType: 'UPDATE_RESERVATION_STATUS_CANCELLED',
      aggregateId: event.reservationId,
      aggregateType: 'Reservation',
      eventData: event,
      timestamp: event.timestamp,
      version: 1
    } as DomainEvent);

    // Release any blocked resources
    await this.eventBusService.publishEvent({
      eventId: event.reservationId,
      eventType: 'RELEASE_RESOURCES',
      aggregateId: event.reservationId,
      aggregateType: 'Reservation',
      eventData: event,
      timestamp: event.timestamp,
      version: 1
    } as DomainEvent);

    // Generate cancellation document if needed
    this.commandBus.execute(new GenerateDocumentCommand(
      '', // Will be resolved by template matching
      event.reservationId,
      {
        reservationId: event.reservationId,
        userId: event.userId,
        reason: event.reason,
        eventType: 'CANCELLATION'
      },
      event.userId
    )).catch(error => {
      this.loggingService.error('Failed to generate cancellation document', error, 'ReservationCancelledHandler');
    });

    this.loggingService.log('Reservation cancelled event handled successfully', 'ReservationCancelledHandler');
  }
}

@Injectable()
@EventsHandler(ApprovalRequestTimeoutEvent)
export class ApprovalRequestTimeoutHandler implements IEventHandler<ApprovalRequestTimeoutEvent> {
  constructor(
    private readonly loggingService: LoggingService,
    private readonly eventBusService: EventBusService,
    private readonly commandBus: CommandBus
  ) {}

  async handle(event: ApprovalRequestTimeoutEvent): Promise<void> {
    this.loggingService.log('Handling approval request timeout event', 'ApprovalRequestTimeoutHandler', LoggingHelper.logParams(event));

    // Update reservation status to CANCELADA (auto-cancelled due to timeout)
    await this.eventBusService.publishEvent({
      eventId: event.requestId,
      eventType: 'APPROVAL_REQUEST_TIMEOUT',
      aggregateId: event.reservationId,
      aggregateType: 'Reservation',
      eventData: event,
      timestamp: event.timestamp,
      version: 1
    } as DomainEvent);

    // Send timeout notification
    this.commandBus.execute(new SendNotificationCommand(
      NotificationChannelType.EMAIL, // Default channel
      '', // Will be resolved by template matching
      event.reservationId,
      '', // Will be resolved to reservation requester
      {
        reservationId: event.reservationId,
        requestId: event.requestId,
        eventType: 'APPROVAL_TIMEOUT'
      },
      false, // hasAttachment
      null // attachmentPath
    )).catch(error => {
      this.loggingService.error('Failed to send timeout notification', error, 'ApprovalRequestTimeoutHandler');
    });

    this.loggingService.log('Approval request timeout event handled successfully', 'ApprovalRequestTimeoutHandler');
  }
}

@Injectable()
@EventsHandler(ApprovalReminderEvent)
export class ApprovalReminderHandler implements IEventHandler<ApprovalReminderEvent> {
  constructor(
    private readonly loggingService: LoggingService,
    private readonly commandBus: CommandBus
  ) {}

  async handle(event: ApprovalReminderEvent): Promise<void> {
    this.loggingService.log('Handling approval reminder event', 'ApprovalReminderHandler', LoggingHelper.logParams({ event }));

    // Send reminder notifications to all approvers
    for (const approverId of event.approverIds) {
      this.commandBus.execute(new SendNotificationCommand(
        NotificationChannelType.EMAIL, // Default channel
        '', // Will be resolved by template matching
        event.reservationId,
        approverId,
        {
          reservationId: event.reservationId,
          requestId: event.requestId,
          reminderType: event.reminderType,
          eventType: 'APPROVAL_REMINDER'
        },
        false, // hasAttachment
        null // attachmentPath
      )).catch(error => {
        this.loggingService.error(`Failed to send reminder notification to ${approverId}`, error, 'ApprovalReminderHandler');
      });
    }

    this.loggingService.log('Approval reminder event handled successfully', 'ApprovalReminderHandler');
  }
}
