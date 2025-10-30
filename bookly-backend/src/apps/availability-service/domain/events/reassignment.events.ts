/**
 * Domain Events for Reassignment Requests (RF-15)
 * Event-Driven Architecture for reservation reassignment lifecycle
 */

import { DomainEvent } from '@libs/event-bus/services/event-bus.service';

// Base interface for reassignment events
export interface ReassignmentEventPayload {
  reassignmentRequestId: string;
  originalReservationId: string;
  requestedBy: string;
  originalResourceId: string;
  suggestedResourceId?: string;
  reason: string;
  priority: string;
  status: string;
  userResponse: string;
  responseDeadline?: Date;
  metadata?: any;
}

// Event when a reassignment request is created
export class ReassignmentRequestCreatedEvent implements DomainEvent {
  readonly eventType = 'ReassignmentRequestCreated';
  readonly eventId: string;
  readonly aggregateId: string;
  readonly aggregateType = 'ReassignmentRequest';
  readonly timestamp: Date;
  readonly userId: string;
  readonly eventData: ReassignmentEventPayload & {
    reasonDescription?: string;
    acceptEquivalentResources: boolean;
    acceptAlternativeTimeSlots: boolean;
    capacityTolerancePercent?: number;
    requiredFeatures?: string[];
    preferredFeatures?: string[];
    maxDistanceMeters?: number;
    notifyUser: boolean;
    notificationMethods: string[];
    autoProcessSingleOption: boolean;
    compensationInfo?: any;
    internalNotes?: string;
    tags?: string[];
    impactLevel: string;
    estimatedResolutionHours?: number;
    relatedTicketId?: string;
    affectedProgramId?: string;
    minAdvanceNoticeHours?: number;
    allowPartialReassignment: boolean;
    requireUserConfirmation: boolean;
  };
  readonly version = 1;

  constructor(payload: ReassignmentEventPayload & {
    reasonDescription?: string;
    acceptEquivalentResources: boolean;
    acceptAlternativeTimeSlots: boolean;
    capacityTolerancePercent?: number;
    requiredFeatures?: string[];
    preferredFeatures?: string[];
    maxDistanceMeters?: number;
    notifyUser: boolean;
    notificationMethods: string[];
    autoProcessSingleOption: boolean;
    compensationInfo?: any;
    internalNotes?: string;
    tags?: string[];
    impactLevel: string;
    estimatedResolutionHours?: number;
    relatedTicketId?: string;
    affectedProgramId?: string;
    minAdvanceNoticeHours?: number;
    allowPartialReassignment: boolean;
    requireUserConfirmation: boolean;
  }, userId: string) {
    this.eventId = `reassignment-request-created-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    this.aggregateId = payload.reassignmentRequestId;
    this.timestamp = new Date();
    this.userId = userId;
    this.eventData = payload;
  }
}

// Event when a user responds to a reassignment request
export class ReassignmentRequestRespondedEvent implements DomainEvent {
  readonly eventType = 'ReassignmentRequestResponded';
  readonly eventId: string;
  readonly aggregateId: string;
  readonly aggregateType = 'ReassignmentRequest';
  readonly timestamp: Date;
  readonly userId: string;
  readonly eventData: ReassignmentEventPayload & {
    response: 'ACCEPTED' | 'REJECTED';
    selectedResourceId?: string;
    responseNotes?: string;
    requestAlternatives: boolean;
    alternativePreferences?: any;
    responseTime: number; // minutes from notification to response
    respondedAt: Date;
    previousStatus: string;
    newStatus: string;
  };
  readonly version = 1;

  constructor(payload: ReassignmentEventPayload & {
    response: 'ACCEPTED' | 'REJECTED';
    selectedResourceId?: string;
    responseNotes?: string;
    requestAlternatives: boolean;
    alternativePreferences?: any;
    responseTime: number;
    respondedAt: Date;
    previousStatus: string;
    newStatus: string;
  }, userId: string) {
    this.eventId = `reassignment-request-responded-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    this.aggregateId = payload.reassignmentRequestId;
    this.timestamp = new Date();
    this.userId = userId;
    this.eventData = payload;
  }
}

// Event when equivalent resources are found for reassignment
export class EquivalentResourcesFoundEvent implements DomainEvent {
  readonly eventType = 'EquivalentResourcesFound';
  readonly eventId: string;
  readonly aggregateId: string;
  readonly aggregateType = 'ReassignmentRequest';
  readonly timestamp: Date;
  readonly userId: string;
  readonly eventData: ReassignmentEventPayload & {
    equivalentResources: Array<{
      resourceId: string;
      resourceName: string;
      resourceType: string;
      capacity: number;
      compatibilityScore: number;
      distanceMeters?: number;
      availableTimeSlots: Array<{
        startTime: Date;
        endTime: Date;
      }>;
      features: string[];
      advantages: string[];
      disadvantages: string[];
    }>;
    searchCriteria: {
      capacityTolerancePercent: number;
      requiredFeatures?: string[];
      preferredFeatures?: string[];
      maxDistanceMeters?: number;
    };
    totalFound: number;
    searchDurationMs: number;
    autoSelectionPossible: boolean;
    recommendedResourceId?: string;
  };
  readonly version = 1;

  constructor(payload: ReassignmentEventPayload & {
    equivalentResources: Array<{
      resourceId: string;
      resourceName: string;
      resourceType: string;
      capacity: number;
      compatibilityScore: number;
      distanceMeters?: number;
      availableTimeSlots: Array<{
        startTime: Date;
        endTime: Date;
      }>;
      features: string[];
      advantages: string[];
      disadvantages: string[];
    }>;
    searchCriteria: {
      capacityTolerancePercent: number;
      requiredFeatures?: string[];
      preferredFeatures?: string[];
      maxDistanceMeters?: number;
    };
    totalFound: number;
    searchDurationMs: number;
    autoSelectionPossible: boolean;
    recommendedResourceId?: string;
  }, userId: string) {
    this.eventId = `equivalent-resources-found-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    this.aggregateId = payload.reassignmentRequestId;
    this.timestamp = new Date();
    this.userId = userId;
    this.eventData = payload;
  }
}

// Event when a reassignment request is processed
export class ReassignmentRequestProcessedEvent implements DomainEvent {
  readonly eventType = 'ReassignmentRequestProcessed';
  readonly eventId: string;
  readonly aggregateId: string;
  readonly aggregateType = 'ReassignmentRequest';
  readonly timestamp: Date;
  readonly userId: string;
  readonly eventData: ReassignmentEventPayload & {
    processedBy: string;
    processedAt: Date;
    autoSelectBestOption: boolean;
    selectedResourceId?: string;
    processingNotes?: string;
    processingDurationMs: number;
    previousStatus: string;
    newStatus: string;
    notificationsSent: number;
    nextSteps: string[];
  };
  readonly version = 1;

  constructor(payload: ReassignmentEventPayload & {
    processedBy: string;
    processedAt: Date;
    autoSelectBestOption: boolean;
    selectedResourceId?: string;
    processingNotes?: string;
    processingDurationMs: number;
    previousStatus: string;
    newStatus: string;
    notificationsSent: number;
    nextSteps: string[];
  }, userId: string) {
    this.eventId = `reassignment-request-processed-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    this.aggregateId = payload.reassignmentRequestId;
    this.timestamp = new Date();
    this.userId = userId;
    this.eventData = payload;
  }
}

// Event when a reassignment is successfully applied
export class ReassignmentAppliedEvent implements DomainEvent {
  readonly eventType = 'ReassignmentApplied';
  readonly eventId: string;
  readonly aggregateId: string;
  readonly aggregateType = 'ReassignmentRequest';
  readonly timestamp: Date;
  readonly userId: string;
  readonly eventData: ReassignmentEventPayload & {
    appliedBy: string;
    appliedAt: Date;
    finalResourceId: string;
    newStartTime?: Date;
    newEndTime?: Date;
    compensationApplied?: string;
    applicationNotes?: string;
    originalReservationCancelled: boolean;
    newReservationId: string;
    userNotified: boolean;
    stakeholdersNotified: string[];
    auditTrail: Array<{
      action: string;
      timestamp: Date;
      userId: string;
      details: string;
    }>;
  };
  readonly version = 1;

  constructor(payload: ReassignmentEventPayload & {
    appliedBy: string;
    appliedAt: Date;
    finalResourceId: string;
    newStartTime?: Date;
    newEndTime?: Date;
    compensationApplied?: string;
    applicationNotes?: string;
    originalReservationCancelled: boolean;
    newReservationId: string;
    userNotified: boolean;
    stakeholdersNotified: string[];
    auditTrail: Array<{
      action: string;
      timestamp: Date;
      userId: string;
      details: string;
    }>;
  }, userId: string) {
    this.eventId = `reassignment-applied-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    this.aggregateId = payload.reassignmentRequestId;
    this.timestamp = new Date();
    this.userId = userId;
    this.eventData = payload;
  }
}

// Event when a reassignment request is cancelled
export class ReassignmentRequestCancelledEvent implements DomainEvent {
  readonly eventType = 'ReassignmentRequestCancelled';
  readonly eventId: string;
  readonly aggregateId: string;
  readonly aggregateType = 'ReassignmentRequest';
  readonly timestamp: Date;
  readonly userId: string;
  readonly eventData: ReassignmentEventPayload & {
    cancelledBy: string;
    cancelledAt: Date;
    cancellationReason: string;
    notifyStakeholders: boolean;
    refundAmount?: number;
    penaltyApplied?: boolean;
    previousStatus: string;
    stakeholdersNotified: string[];
  };
  readonly version = 1;

  constructor(payload: ReassignmentEventPayload & {
    cancelledBy: string;
    cancelledAt: Date;
    cancellationReason: string;
    notifyStakeholders: boolean;
    refundAmount?: number;
    penaltyApplied?: boolean;
    previousStatus: string;
    stakeholdersNotified: string[];
  }, userId: string) {
    this.eventId = `reassignment-request-cancelled-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    this.aggregateId = payload.reassignmentRequestId;
    this.timestamp = new Date();
    this.userId = userId;
    this.eventData = payload;
  }
}

// Event when a reassignment request is escalated
export class ReassignmentRequestEscalatedEvent implements DomainEvent {
  readonly eventType = 'ReassignmentRequestEscalated';
  readonly eventId: string;
  readonly aggregateId: string;
  readonly aggregateType = 'ReassignmentRequest';
  readonly timestamp: Date;
  readonly userId: string;
  readonly eventData: ReassignmentEventPayload & {
    escalatedBy: string;
    escalatedAt: Date;
    escalationReason: string;
    previousPriority: string;
    newPriority: string;
    escalationLevel: number;
    notifyUser: boolean;
    notifyAdmins: boolean;
    escalationApproval?: {
      approvedBy: string;
      approvalDate: Date;
      approvalNotes?: string;
    };
    urgencyFlags: string[];
    expectedResolutionTime: Date;
  };
  readonly version = 1;

  constructor(payload: ReassignmentEventPayload & {
    escalatedBy: string;
    escalatedAt: Date;
    escalationReason: string;
    previousPriority: string;
    newPriority: string;
    escalationLevel: number;
    notifyUser: boolean;
    notifyAdmins: boolean;
    escalationApproval?: {
      approvedBy: string;
      approvalDate: Date;
      approvalNotes?: string;
    };
    urgencyFlags: string[];
    expectedResolutionTime: Date;
  }, userId: string) {
    this.eventId = `reassignment-request-escalated-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    this.aggregateId = payload.reassignmentRequestId;
    this.timestamp = new Date();
    this.userId = userId;
    this.eventData = payload;
  }
}

// Event when a reassignment suggestion is rejected
export class ReassignmentSuggestionRejectedEvent implements DomainEvent {
  readonly eventType = 'ReassignmentSuggestionRejected';
  readonly eventId: string;
  readonly aggregateId: string;
  readonly aggregateType = 'ReassignmentRequest';
  readonly timestamp: Date;
  readonly userId: string;
  readonly eventData: ReassignmentEventPayload & {
    rejectedResourceId: string;
    rejectionReason: string;
    rejectedBy: string;
    rejectedAt: Date;
    rejectionCount: number;
    alternativesRequested: boolean;
    userFeedback?: string;
    impactOnPriority: boolean;
    newSearchRequired: boolean;
    searchCriteriaAdjustment?: any;
  };
  readonly version = 1;

  constructor(payload: ReassignmentEventPayload & {
    rejectedResourceId: string;
    rejectionReason: string;
    rejectedBy: string;
    rejectedAt: Date;
    rejectionCount: number;
    alternativesRequested: boolean;
    userFeedback?: string;
    impactOnPriority: boolean;
    newSearchRequired: boolean;
    searchCriteriaAdjustment?: any;
  }, userId: string) {
    this.eventId = `reassignment-suggestion-rejected-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    this.aggregateId = payload.reassignmentRequestId;
    this.timestamp = new Date();
    this.userId = userId;
    this.eventData = payload;
  }
}

// Event when reassignment queue is optimized
export class ReassignmentQueueOptimizedEvent implements DomainEvent {
  readonly eventType = 'ReassignmentQueueOptimized';
  readonly eventId: string;
  readonly aggregateId: string;
  readonly aggregateType = 'ReassignmentQueue';
  readonly timestamp: Date;
  readonly userId: string;
  readonly eventData: {
    optimizedBy: string;
    optimizedAt: Date;
    optimizationCriteria: 'PRIORITY' | 'RESPONSE_TIME' | 'USER_SATISFACTION' | 'RESOURCE_UTILIZATION';
    queueSize: number;
    optimizationResults: {
      requestsProcessed: number;
      requestsReordered: number;
      averageResponseTimeImprovement: number;
      userSatisfactionImprovement: number;
      resourceUtilizationImprovement: number;
    };
    affectedRequests: Array<{
      reassignmentRequestId: string;
      userId: string;
      oldPosition: number;
      newPosition: number;
      priorityChanged: boolean;
      estimatedResolutionTimeChange: number;
    }>;
    notificationsScheduled: number;
    dryRun: boolean;
  };
  readonly version = 1;

  constructor(payload: {
    optimizedBy: string;
    optimizedAt: Date;
    optimizationCriteria: 'PRIORITY' | 'RESPONSE_TIME' | 'USER_SATISFACTION' | 'RESOURCE_UTILIZATION';
    queueSize: number;
    optimizationResults: {
      requestsProcessed: number;
      requestsReordered: number;
      averageResponseTimeImprovement: number;
      userSatisfactionImprovement: number;
      resourceUtilizationImprovement: number;
    };
    affectedRequests: Array<{
      reassignmentRequestId: string;
      userId: string;
      oldPosition: number;
      newPosition: number;
      priorityChanged: boolean;
      estimatedResolutionTimeChange: number;
    }>;
    notificationsScheduled: number;
    dryRun: boolean;
  }, userId: string) {
    this.eventId = `reassignment-queue-optimized-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    this.aggregateId = `reassignment-queue-${Date.now()}`;
    this.timestamp = new Date();
    this.userId = userId;
    this.eventData = payload;
  }
}

// Event when bulk reassignment requests are processed
export class BulkReassignmentRequestsProcessedEvent implements DomainEvent {
  readonly eventType = 'BulkReassignmentRequestsProcessed';
  readonly eventId: string;
  readonly aggregateId: string;
  readonly aggregateType = 'BulkReassignmentOperation';
  readonly timestamp: Date;
  readonly userId: string;
  readonly eventData: {
    processedBy: string;
    processedAt: Date;
    action: 'PROCESS' | 'CANCEL' | 'ESCALATE' | 'UPDATE_PRIORITY';
    parameters: any;
    requestIds: string[];
    results: {
      successful: number;
      failed: number;
      skipped: number;
    };
    processedRequests: Array<{
      reassignmentRequestId: string;
      userId: string;
      status: 'SUCCESS' | 'FAILED' | 'SKIPPED';
      error?: string;
      result?: any;
    }>;
    notifyUsers: boolean;
    notificationsSent: number;
    processingDurationMs: number;
  };
  readonly version = 1;

  constructor(payload: {
    processedBy: string;
    processedAt: Date;
    action: 'PROCESS' | 'CANCEL' | 'ESCALATE' | 'UPDATE_PRIORITY';
    parameters: any;
    requestIds: string[];
    results: {
      successful: number;
      failed: number;
      skipped: number;
    };
    processedRequests: Array<{
      reassignmentRequestId: string;
      userId: string;
      status: 'SUCCESS' | 'FAILED' | 'SKIPPED';
      error?: string;
      result?: any;
    }>;
    notifyUsers: boolean;
    notificationsSent: number;
    processingDurationMs: number;
  }, userId: string) {
    this.eventId = `bulk-reassignment-requests-processed-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    this.aggregateId = `bulk-operation-${Date.now()}`;
    this.timestamp = new Date();
    this.userId = userId;
    this.eventData = payload;
  }
}

// Event when reassignment request expires (deadline passed)
export class ReassignmentRequestExpiredEvent implements DomainEvent {
  readonly eventType = 'ReassignmentRequestExpired';
  readonly eventId: string;
  readonly aggregateId: string;
  readonly aggregateType = 'ReassignmentRequest';
  readonly timestamp: Date;
  readonly userId: string;
  readonly eventData: ReassignmentEventPayload & {
    expiredAt: Date;
    responseDeadline: Date;
    notificationsSent: number;
    lastNotificationAt: Date;
    autoProcessingAttempted: boolean;
    fallbackAction: 'CANCEL' | 'ESCALATE' | 'EXTEND_DEADLINE' | 'AUTO_ACCEPT';
    penaltyApplied?: {
      type: string;
      severity: string;
      duration: number;
      reason: string;
    };
  };
  readonly version = 1;

  constructor(payload: ReassignmentEventPayload & {
    expiredAt: Date;
    responseDeadline: Date;
    notificationsSent: number;
    lastNotificationAt: Date;
    autoProcessingAttempted: boolean;
    fallbackAction: 'CANCEL' | 'ESCALATE' | 'EXTEND_DEADLINE' | 'AUTO_ACCEPT';
    penaltyApplied?: {
      type: string;
      severity: string;
      duration: number;
      reason: string;
    };
  }, userId: string) {
    this.eventId = `reassignment-request-expired-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    this.aggregateId = payload.reassignmentRequestId;
    this.timestamp = new Date();
    this.userId = userId;
    this.eventData = payload;
  }
}

// Export all events for easy importing
export const ReassignmentEvents = {
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
} as const;

// Type for all reassignment event types
export type ReassignmentEventType = 
  | 'ReassignmentRequestCreated'
  | 'ReassignmentRequestResponded'
  | 'EquivalentResourcesFound'
  | 'ReassignmentRequestProcessed'
  | 'ReassignmentApplied'
  | 'ReassignmentRequestCancelled'
  | 'ReassignmentRequestEscalated'
  | 'ReassignmentSuggestionRejected'
  | 'ReassignmentQueueOptimized'
  | 'BulkReassignmentRequestsProcessed'
  | 'ReassignmentRequestExpired';
