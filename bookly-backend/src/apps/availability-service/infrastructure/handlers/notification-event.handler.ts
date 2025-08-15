/**
 * Notification Event Handler
 * Listens to domain events and triggers automatic notifications
 * Integrates with NotificationService for multi-channel delivery
 */

import { Injectable, Inject } from '@nestjs/common';
import { EventsHandler, IEventHandler } from '@nestjs/cqrs';
import { LoggingService } from '@logging/logging.service';
import { NotificationService, NotificationPayload, NotificationChannel, NotificationRecipient } from '../services/notification.service';
import { AvailabilityServiceEventType, EventHelpers } from '../../domain/events';

// Import all domain events
import {
  RecurringReservationCreatedEvent,
  RecurringReservationUpdatedEvent,
  RecurringReservationCancelledEvent,
  RecurringReservationInstancesGeneratedEvent,
  RecurringReservationInstanceConfirmedEvent,
  RecurringReservationInstanceCancelledEvent,
  RecurringReservationConflictDetectedEvent,
  RecurringReservationCompletedEvent,
  RecurringReservationValidationFailedEvent
} from '../../domain/events/recurring-reservation.events';

import {
  UserJoinedWaitingListEvent,
  UserLeftWaitingListEvent,
  WaitingListSlotAvailableEvent,
  UserConfirmedWaitingListSlotEvent,
  WaitingListSlotExpiredEvent,
  WaitingListPositionsReorderedEvent,
  WaitingListPriorityEscalatedEvent,
  WaitingListOptimizedEvent,
  WaitingListBulkNotificationSentEvent,
  WaitingListPreferencesUpdatedEvent
} from '../../domain/events/waiting-list.events';

import {
  ReassignmentRequestCreatedEvent,
  ReassignmentRequestRespondedEvent,
  EquivalentResourcesFoundEvent,
  ReassignmentRequestProcessedEvent,
  ReassignmentAppliedEvent,
  ReassignmentRequestCancelledEvent,
  ReassignmentRequestEscalatedEvent,
  ReassignmentSuggestionRejectedEvent,
  ReassignmentQueueOptimizedEvent,
  BulkReassignmentRequestsProcessedEvent,
  ReassignmentRequestExpiredEvent
} from '../../domain/events/reassignment.events';
import { LoggingHelper } from '@/libs/logging/logging.helper';
import { NotificationPriority } from '../../utils/notification-priority.enum';

// User repository interface (to get user data for notifications)
export interface UserNotificationRepository {
  getUserNotificationData(userId: string): Promise<NotificationRecipient | null>;
  getUsersNotificationData(userIds: string[]): Promise<NotificationRecipient[]>;
}

// Resource repository interface (to get resource data for notifications)
export interface ResourceNotificationRepository {
  getResourceNotificationData(resourceId: string): Promise<{
    id: string;
    name: string;
    type: string;
    location?: string;
    capacity?: number;
  } | null>;
}

@Injectable()
@EventsHandler(
  // Recurring Reservation Events
  RecurringReservationCreatedEvent,
  RecurringReservationUpdatedEvent,
  RecurringReservationCancelledEvent,
  RecurringReservationInstancesGeneratedEvent,
  RecurringReservationInstanceConfirmedEvent,
  RecurringReservationInstanceCancelledEvent,
  RecurringReservationConflictDetectedEvent,
  RecurringReservationCompletedEvent,
  RecurringReservationValidationFailedEvent,
  
  // Waiting List Events
  UserJoinedWaitingListEvent,
  UserLeftWaitingListEvent,
  WaitingListSlotAvailableEvent,
  UserConfirmedWaitingListSlotEvent,
  WaitingListSlotExpiredEvent,
  WaitingListPositionsReorderedEvent,
  WaitingListPriorityEscalatedEvent,
  WaitingListOptimizedEvent,
  WaitingListBulkNotificationSentEvent,
  WaitingListPreferencesUpdatedEvent,
  
  // Reassignment Events
  ReassignmentRequestCreatedEvent,
  ReassignmentRequestRespondedEvent,
  EquivalentResourcesFoundEvent,
  ReassignmentRequestProcessedEvent,
  ReassignmentAppliedEvent,
  ReassignmentRequestCancelledEvent,
  ReassignmentRequestEscalatedEvent,
  ReassignmentSuggestionRejectedEvent,
  ReassignmentQueueOptimizedEvent,
  BulkReassignmentRequestsProcessedEvent,
  ReassignmentRequestExpiredEvent
)
export class NotificationEventHandler implements IEventHandler {
  constructor(
    private readonly notificationService: NotificationService,
    private readonly logger: LoggingService,
    @Inject('UserNotificationRepository')
    private readonly userRepository: UserNotificationRepository,
    @Inject('ResourceNotificationRepository')
    private readonly resourceRepository: ResourceNotificationRepository
  ) {}

  /**
   * Handle all domain events and trigger appropriate notifications
   */
  async handle(event: any): Promise<void> {
    try {
      this.logger.log('Processing domain event for notifications', {
        eventType: event.eventType,
        eventId: event.eventId,
        aggregateId: event.aggregateId,
        userId: event.userId
      });

      // Check if this event type requires notifications
      if (!this.shouldSendNotification(event.eventType)) {
        this.logger.debug('Event type does not require notifications', {
          eventType: event.eventType
        });
        return;
      }

      // Route to specific handler based on event type
      await this.routeEventToHandler(event);

    } catch (error) {
      this.logger.error('Failed to process notification event', {
        error: error.message,
        stack: error.stack,
        eventType: event.eventType,
        eventId: event.eventId,
        aggregateId: event.aggregateId
      });
    }
  }

  /**
   * Route event to specific handler method
   */
  private async routeEventToHandler(event: any): Promise<void> {
    const eventCategory = EventHelpers.getEventCategory(event.eventType);
    
    switch (eventCategory) {
      case 'RECURRING_RESERVATION':
        await this.handleRecurringReservationEvent(event);
        break;
      case 'WAITING_LIST':
        await this.handleWaitingListEvent(event);
        break;
      case 'REASSIGNMENT':
        await this.handleReassignmentEvent(event);
        break;
      default:
        this.logger.warn('Unknown event category for notification', {
          eventType: event.eventType,
          eventCategory
        });
    }
  }

  /**
   * Handle recurring reservation events
   */
  private async handleRecurringReservationEvent(event: any): Promise<void> {
    switch (event.eventType) {
      case 'RecurringReservationCreated':
        await this.handleRecurringReservationCreated(event);
        break;
      case 'RecurringReservationUpdated':
        await this.handleRecurringReservationUpdated(event);
        break;
      case 'RecurringReservationCancelled':
        await this.handleRecurringReservationCancelled(event);
        break;
      case 'RecurringReservationInstancesGenerated':
        await this.handleRecurringReservationInstancesGenerated(event);
        break;
      case 'RecurringReservationInstanceConfirmed':
        await this.handleRecurringReservationInstanceConfirmed(event);
        break;
      case 'RecurringReservationInstanceCancelled':
        await this.handleRecurringReservationInstanceCancelled(event);
        break;
      case 'RecurringReservationConflictDetected':
        await this.handleRecurringReservationConflictDetected(event);
        break;
      case 'RecurringReservationCompleted':
        await this.handleRecurringReservationCompleted(event);
        break;
      case 'RecurringReservationValidationFailed':
        await this.handleRecurringReservationValidationFailed(event);
        break;
    }
  }
  private async handleRecurringReservationUpdated(event: any): Promise<void> {
    // Mock implementation - would send notification about reservation update
    // TODO: Implement notification logic
    this.logger.log('Handling recurring reservation updated event', { eventId: event.eventId });
  }

  private async handleRecurringReservationCancelled(event: any): Promise<void> {
    // Mock implementation - would send notification about reservation cancellation
    // TODO: Implement notification logic
    this.logger.log('Handling recurring reservation cancelled event', { eventId: event.eventId });
  }

  private async handleRecurringReservationInstancesGenerated(event: any): Promise<void> {
    // Mock implementation - would send notification about generated instances
    // TODO: Implement notification logic
    this.logger.log('Handling recurring reservation instances generated event', { eventId: event.eventId });
  }
  private async handleRecurringReservationInstanceConfirmed(event: any): Promise<void> {
    // Mock implementation - would send notification about confirmed instance
    // TODO: Implement notification logic
    this.logger.log('Handling recurring reservation instance confirmed event', { eventId: event.eventId });
  }

  private async handleRecurringReservationInstanceCancelled(event: any): Promise<void> {
    // Mock implementation - would send notification about cancelled instance
    // TODO: Implement notification logic
    this.logger.log('Handling recurring reservation instance cancelled event', { eventId: event.eventId });
  }

  private async handleRecurringReservationCompleted(event: any): Promise<void> {
    // Mock implementation - would send notification about completed recurring reservation
    // TODO: Implement notification logic
    this.logger.log('Handling recurring reservation completed event', { eventId: event.eventId });
  }

  private async handleRecurringReservationValidationFailed(event: any): Promise<void> {
    // Mock implementation - would send notification about validation failure
    // TODO: Implement notification logic
    this.logger.log('Handling recurring reservation validation failed event', { eventId: event.eventId });
  }

  /**
   * Handle waiting list events
   */
  private async handleWaitingListEvent(event: any): Promise<void> {
    switch (event.eventType) {
      case 'UserJoinedWaitingList':
        await this.handleUserJoinedWaitingList(event);
        break;
      case 'UserLeftWaitingList':
        await this.handleUserLeftWaitingList(event);
        break;
      case 'WaitingListSlotAvailable':
        await this.handleWaitingListSlotAvailable(event);
        break;
      case 'UserConfirmedWaitingListSlot':
        await this.handleUserConfirmedWaitingListSlot(event);
        break;
      case 'WaitingListSlotExpired':
        await this.handleWaitingListSlotExpired(event);
        break;
      case 'WaitingListPositionsReordered':
        await this.handleWaitingListPositionsReordered(event);
        break;
      case 'WaitingListPriorityEscalated':
        await this.handleWaitingListPriorityEscalated(event);
        break;
      case 'WaitingListOptimized':
        await this.handleWaitingListOptimized(event);
        break;
    }
  }
  private async handleUserJoinedWaitingList(event: any): Promise<void> {
    // Mock implementation - would send notification about user joining waiting list
    // TODO: Implement notification logic
    this.logger.log('Handling user joined waiting list event', { eventId: event.eventId });
  }

  private async handleUserLeftWaitingList(event: any): Promise<void> {
    // Mock implementation - would send notification about user leaving waiting list
    // TODO: Implement notification logic
    this.logger.log('Handling user left waiting list event', { eventId: event.eventId });
  }

  private async handleUserConfirmedWaitingListSlot(event: any): Promise<void> {
    // Mock implementation - would send notification about user confirming waiting list slot
    // TODO: Implement notification logic
    this.logger.log('Handling user confirmed waiting list slot event', { eventId: event.eventId });
  }

  private async handleWaitingListSlotExpired(event: any): Promise<void> {
    // Mock implementation - would send notification about waiting list slot expiration
    // TODO: Implement notification logic
    this.logger.log('Handling waiting list slot expired event', { eventId: event.eventId });
  }

  private async handleWaitingListPositionsReordered(event: any): Promise<void> {
    // Mock implementation - would send notification about waiting list positions reordered
    // TODO: Implement notification logic
    this.logger.log('Handling waiting list positions reordered event', { eventId: event.eventId });
  }
  private async handleWaitingListPriorityEscalated(event: any): Promise<void> {
    // Mock implementation - would send notification about waiting list priority escalation
    // TODO: Implement notification logic
    this.logger.log('Handling waiting list priority escalated event', { eventId: event.eventId });
  }

  private async handleWaitingListOptimized(event: any): Promise<void> {
    // Mock implementation - would send notification about waiting list optimization
    // TODO: Implement notification logic
    this.logger.log('Handling waiting list optimized event', { eventId: event.eventId });
  }

  /**
   * Handle reassignment events
   */
  private async handleReassignmentEvent(event: any): Promise<void> {
    switch (event.eventType) {
      case 'ReassignmentRequestCreated':
        await this.handleReassignmentRequestCreated(event);
        break;
      case 'ReassignmentRequestResponded':
        await this.handleReassignmentRequestResponded(event);
        break;
      case 'EquivalentResourcesFound':
        await this.handleEquivalentResourcesFound(event);
        break;
      case 'ReassignmentRequestProcessed':
        await this.handleReassignmentRequestProcessed(event);
        break;
      case 'ReassignmentApplied':
        await this.handleReassignmentApplied(event);
        break;
      case 'ReassignmentRequestCancelled':
        await this.handleReassignmentRequestCancelled(event);
        break;
      case 'ReassignmentRequestEscalated':
        await this.handleReassignmentRequestEscalated(event);
        break;
      case 'ReassignmentSuggestionRejected':
        await this.handleReassignmentSuggestionRejected(event);
        break;
      case 'ReassignmentRequestExpired':
        await this.handleReassignmentRequestExpired(event);
        break;
    }
  }
    handleReassignmentRequestResponded(event: any) {
        throw new Error('Method not implemented.');
    }
    handleEquivalentResourcesFound(event: any) {
        throw new Error('Method not implemented.');
    }
    handleReassignmentRequestProcessed(event: any) {
        throw new Error('Method not implemented.');
    }
    handleReassignmentRequestCancelled(event: any) {
        throw new Error('Method not implemented.');
    }
    handleReassignmentRequestEscalated(event: any) {
        throw new Error('Method not implemented.');
    }
    handleReassignmentSuggestionRejected(event: any) {
        throw new Error('Method not implemented.');
    }
    handleReassignmentRequestExpired(event: any) {
        throw new Error('Method not implemented.');
    }

  // Specific event handlers

  /**
   * Handle RecurringReservationCreated event
   */
  private async handleRecurringReservationCreated(event: RecurringReservationCreatedEvent): Promise<void> {
    const recipient = await this.userRepository.getUserNotificationData(event.eventData.userId);
    const resource = await this.resourceRepository.getResourceNotificationData(event.eventData.resourceId);
    
    if (!recipient || !resource) {
      this.logger.warn('Missing recipient or resource data for notification', {
        eventId: event.eventId,
        userId: event.eventData.userId,
        resourceId: event.eventData.resourceId
      });
      return;
    }

    const notificationPayload: NotificationPayload = {
      eventType: event.eventType,
      eventId: event.eventId,
      aggregateId: event.aggregateId,
      priority: NotificationPriority.MEDIUM,
      recipients: [recipient],
      templateVariables: {
        title: event.eventData.title,
        resourceName: resource.name,
        startDate: event.eventData.startDate.toLocaleDateString(),
        endDate: event.eventData.endDate.toLocaleDateString(),
        frequency: event.eventData.frequency,
        startTime: event.eventData.startTime,
        endTime: event.eventData.endTime,
        totalInstances: event.eventData.totalInstances
      },
      channels: this.getChannelsForEvent(event.eventType)
    };

    await this.notificationService.sendNotification(notificationPayload);
  }

  /**
   * Handle WaitingListSlotAvailable event (HIGH PRIORITY)
   */
  private async handleWaitingListSlotAvailable(event: WaitingListSlotAvailableEvent): Promise<void> {
    const recipient = await this.userRepository.getUserNotificationData(event.eventData.nextInLine.userId);
    const resource = await this.resourceRepository.getResourceNotificationData(event.eventData.availableSlot.resourceId);
    
    if (!recipient || !resource) {
      this.logger.warn('Missing recipient or resource data for waiting list notification', {
        eventId: event.eventId,
        userId: event.eventData.nextInLine.userId,
        resourceId: event.eventData.availableSlot.resourceId
      });
      return;
    }

    const notificationPayload: NotificationPayload = {
      eventType: event.eventType,
      eventId: event.eventId,
      aggregateId: event.aggregateId,
      priority: NotificationPriority.HIGH,
      recipients: [recipient],
      templateVariables: {
        resourceName: resource.name,
        slotDate: event.eventData.availableSlot.startTime.toLocaleDateString(),
        slotTime: event.eventData.availableSlot.startTime.toLocaleTimeString(),
        position: event.eventData.nextInLine.position,
        waitTime: Math.round(event.eventData.nextInLine.waitTime / 60), // Convert to hours
        confirmationTimeLimit: 10 // minutes
      },
      channels: this.getChannelsForEvent(event.eventType),
      expiresAt: new Date(Date.now() + 10 * 60 * 1000) // 10 minutes from now
    };

    await this.notificationService.sendNotification(notificationPayload);
  }

  /**
   * Handle ReassignmentRequestCreated event
   */
  private async handleReassignmentRequestCreated(event: ReassignmentRequestCreatedEvent): Promise<void> {
    const recipient = await this.userRepository.getUserNotificationData(event.eventData.requestedBy);
    const originalResource = await this.resourceRepository.getResourceNotificationData(event.eventData.originalResourceId);
    
    if (!recipient || !originalResource) {
      this.logger.warn('Missing recipient or resource data for reassignment notification', {
        eventId: event.eventId,
        userId: event.eventData.requestedBy,
        resourceId: event.eventData.originalResourceId
      });
      return;
    }

    let suggestedResource = null;
    if (event.eventData.suggestedResourceId) {
      suggestedResource = await this.resourceRepository.getResourceNotificationData(event.eventData.suggestedResourceId);
    }

    const notificationPayload: NotificationPayload = {
      eventType: event.eventType,
      eventId: event.eventId,
      aggregateId: event.aggregateId,
      priority: NotificationPriority.HIGH,
      recipients: [recipient],
      templateVariables: {
        resourceName: originalResource.name,
        reason: event.eventData.reason,
        newResourceName: suggestedResource?.name || 'Por determinar',
        priority: event.eventData.priority,
        responseDeadline: event.eventData.responseDeadline?.toLocaleString() || 'Sin límite'
      },
      channels: this.getChannelsForEvent(event.eventType),
      expiresAt: event.eventData.responseDeadline
    };

    await this.notificationService.sendNotification(notificationPayload);
  }

  /**
   * Handle RecurringReservationConflictDetected event (HIGH PRIORITY)
   */
  private async handleRecurringReservationConflictDetected(event: RecurringReservationConflictDetectedEvent): Promise<void> {
    const recipient = await this.userRepository.getUserNotificationData(event.eventData.userId);
    const resource = await this.resourceRepository.getResourceNotificationData(event.eventData.resourceId);
    
    if (!recipient || !resource) {
      return;
    }

    const notificationPayload: NotificationPayload = {
      eventType: event.eventType,
      eventId: event.eventId,
      aggregateId: event.aggregateId,
      priority: NotificationPriority.HIGH,
      recipients: [recipient],
      templateVariables: {
        title: event.eventData.title,
        resourceName: resource.name,
        totalConflicts: event.eventData.totalConflicts,
        conflictDates: event.eventData.conflictingInstances.map(c => 
          c.instanceDate.toLocaleDateString()
        ).join(', '),
        resolutionRequired: event.eventData.resolutionRequired ? 'Sí' : 'No',
        suggestedActions: event.eventData.suggestedActions.join(', ')
      },
      channels: this.getChannelsForEvent(event.eventType)
    };

    await this.notificationService.sendNotification(notificationPayload);
  }

  /**
   * Handle ReassignmentApplied event
   */
  private async handleReassignmentApplied(event: ReassignmentAppliedEvent): Promise<void> {
    const recipient = await this.userRepository.getUserNotificationData(event.eventData.requestedBy);
    const newResource = await this.resourceRepository.getResourceNotificationData(event.eventData.finalResourceId);
    
    if (!recipient || !newResource) {
      return;
    }

    const notificationPayload: NotificationPayload = {
      eventType: event.eventType,
      eventId: event.eventId,
      aggregateId: event.aggregateId,
      priority: NotificationPriority.MEDIUM,
      recipients: [recipient],
      templateVariables: {
        newResourceName: newResource.name,
        newStartTime: event.eventData.newStartTime?.toLocaleString() || 'Mismo horario',
        newEndTime: event.eventData.newEndTime?.toLocaleString() || 'Mismo horario',
        compensationApplied: event.eventData.compensationApplied || 'Ninguna',
        newReservationId: event.eventData.newReservationId
      },
      channels: this.getChannelsForEvent(event.eventType)
    };

    await this.notificationService.sendNotification(notificationPayload);
  }

  /**
   * Get notification channels for an event type
   */
  private getChannelsForEvent(eventType: string): NotificationChannel[] {
    const channels = EventHelpers.getNotificationChannels(eventType as AvailabilityServiceEventType);
    const priority = EventHelpers.isHighPriorityEvent(eventType as AvailabilityServiceEventType) ? 'HIGH' : 'MEDIUM';
    
    return channels.map(channel => ({
      type: channel as any,
      enabled: true,
      priority: priority as any
    }));
  }

  /**
   * Check if an event type should trigger notifications
   */
  private shouldSendNotification(eventType: string): boolean {
    // Events that should NOT trigger notifications
    const excludedEvents = [
      'WaitingListBulkNotificationSent', // Already a notification event
      'WaitingListOptimized', // Internal optimization
      'ReassignmentQueueOptimized', // Internal optimization
      'BulkReassignmentRequestsProcessed' // Bulk operations handled separately
    ];
    
    return !excludedEvents.includes(eventType);
  }
}
