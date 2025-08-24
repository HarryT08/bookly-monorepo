/**
 * Stockpile Service Domain Events
 * Event-Driven Architecture for Approval Flows and Validation
 */

import { DomainEvent } from '@libs/event-bus/services/event-bus.service';

// Base interface for approval events
export interface ApprovalEventData {
  approvalFlowId: string;
  resourceId: string;
  resourceName: string;
  requesterId: string;
  requesterEmail: string;
  timestamp: Date;
}

// Approval Flow Events
export interface ApprovalFlowCreatedEventData extends ApprovalEventData {
  flowName: string;
  description?: string;
  steps: {
    stepNumber: number;
    approverRole: string;
    isRequired: boolean;
    timeoutHours?: number;
  }[];
  isActive: boolean;
  createdBy: string;
}

export class ApprovalFlowCreatedEvent implements DomainEvent {
  public readonly eventId: string;
  public readonly eventType = 'ApprovalFlowCreated';
  public readonly aggregateType = 'ApprovalFlow';
  public readonly timestamp: Date;
  public readonly version = 1;

  constructor(
    public readonly aggregateId: string,
    public readonly eventData: ApprovalFlowCreatedEventData,
    public readonly userId?: string,
  ) {
    this.eventId = `approval-flow-created-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    this.timestamp = new Date();
  }
}

// Request Events
export interface RequestSubmittedEventData extends ApprovalEventData {
  requestType: string;
  requestedStartTime: Date;
  requestedEndTime: Date;
  purpose: string;
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
  additionalData?: any;
}

export class RequestSubmittedEvent implements DomainEvent {
  public readonly eventId: string;
  public readonly eventType = 'RequestSubmitted';
  public readonly aggregateType = 'ApprovalRequest';
  public readonly timestamp: Date;
  public readonly version = 1;

  constructor(
    public readonly aggregateId: string,
    public readonly eventData: RequestSubmittedEventData,
    public readonly userId?: string,
  ) {
    this.eventId = `request-submitted-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    this.timestamp = new Date();
  }
}

export interface RequestApprovedEventData extends ApprovalEventData {
  approvedBy: string;
  approverRole: string;
  stepNumber: number;
  approvalNotes?: string;
  isFinalApproval: boolean;
}

export class RequestApprovedEvent implements DomainEvent {
  public readonly eventId: string;
  public readonly eventType = 'RequestApproved';
  public readonly aggregateType = 'ApprovalRequest';
  public readonly timestamp: Date;
  public readonly version = 1;

  constructor(
    public readonly aggregateId: string,
    public readonly eventData: RequestApprovedEventData,
    public readonly userId?: string,
  ) {
    this.eventId = `request-approved-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    this.timestamp = new Date();
  }
}

export interface RequestRejectedEventData extends ApprovalEventData {
  rejectedBy: string;
  rejectorRole: string;
  stepNumber: number;
  rejectionReason: string;
  canResubmit: boolean;
}

export class RequestRejectedEvent implements DomainEvent {
  public readonly eventId: string;
  public readonly eventType = 'RequestRejected';
  public readonly aggregateType = 'ApprovalRequest';
  public readonly timestamp: Date;
  public readonly version = 1;

  constructor(
    public readonly aggregateId: string,
    public readonly eventData: RequestRejectedEventData,
    public readonly userId?: string,
  ) {
    this.eventId = `request-rejected-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    this.timestamp = new Date();
  }
}

export interface RequestEscalatedEventData extends ApprovalEventData {
  escalatedBy: string;
  escalatedTo: string;
  escalationReason: string;
  originalApprover: string;
  stepNumber: number;
}

export class RequestEscalatedEvent implements DomainEvent {
  public readonly eventId: string;
  public readonly eventType = 'RequestEscalated';
  public readonly aggregateType = 'ApprovalRequest';
  public readonly timestamp: Date;
  public readonly version = 1;

  constructor(
    public readonly aggregateId: string,
    public readonly eventData: RequestEscalatedEventData,
    public readonly userId?: string,
  ) {
    this.eventId = `request-escalated-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    this.timestamp = new Date();
  }
}

export interface RequestTimeoutEventData extends ApprovalEventData {
  timeoutStepNumber: number;
  timeoutApprover: string;
  timeoutHours: number;
  autoAction: 'ESCALATE' | 'REJECT' | 'APPROVE';
}

export class RequestTimeoutEvent implements DomainEvent {
  public readonly eventId: string;
  public readonly eventType = 'RequestTimeout';
  public readonly aggregateType = 'ApprovalRequest';
  public readonly timestamp: Date;
  public readonly version = 1;

  constructor(
    public readonly aggregateId: string,
    public readonly eventData: RequestTimeoutEventData,
    public readonly userId?: string,
  ) {
    this.eventId = `request-timeout-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    this.timestamp = new Date();
  }
}

// Document Generation Events
export interface DocumentGeneratedEventData {
  documentId: string;
  documentType: 'APPROVAL_LETTER' | 'REJECTION_LETTER' | 'NOTIFICATION';
  requestId: string;
  templateId: string;
  templateName: string;
  generatedFor: string;
  filePath: string;
  fileSize: number;
  generatedBy: string;
  timestamp: Date;
}

export class DocumentGeneratedEvent implements DomainEvent {
  public readonly eventId: string;
  public readonly eventType = 'DocumentGenerated';
  public readonly aggregateType = 'Document';
  public readonly timestamp: Date;
  public readonly version = 1;

  constructor(
    public readonly aggregateId: string,
    public readonly eventData: DocumentGeneratedEventData,
    public readonly userId?: string,
  ) {
    this.eventId = `document-generated-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    this.timestamp = new Date();
  }
}

// Notification Events
export interface NotificationSentEventData {
  notificationId: string;
  recipientId: string;
  recipientEmail: string;
  notificationType: 'EMAIL' | 'SMS' | 'PUSH' | 'IN_APP';
  templateId: string;
  subject: string;
  content: string;
  requestId?: string;
  status: 'SENT' | 'FAILED' | 'PENDING';
  sentAt: Date;
  timestamp: Date;
}

export class NotificationSentEvent implements DomainEvent {
  public readonly eventId: string;
  public readonly eventType = 'NotificationSent';
  public readonly aggregateType = 'Notification';
  public readonly timestamp: Date;
  public readonly version = 1;

  constructor(
    public readonly aggregateId: string,
    public readonly eventData: NotificationSentEventData,
    public readonly userId?: string,
  ) {
    this.eventId = `notification-sent-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    this.timestamp = new Date();
  }
}

// Check-in/Check-out Events
export interface CheckInEventData {
  reservationId: string;
  resourceId: string;
  resourceName: string;
  userId: string;
  userEmail: string;
  checkInTime: Date;
  expectedStartTime: Date;
  isEarlyCheckIn: boolean;
  location?: string;
  timestamp: Date;
}

export class CheckInEvent implements DomainEvent {
  public readonly eventId: string;
  public readonly eventType = 'CheckIn';
  public readonly aggregateType = 'Reservation';
  public readonly timestamp: Date;
  public readonly version = 1;

  constructor(
    public readonly aggregateId: string,
    public readonly eventData: CheckInEventData,
    public readonly userId?: string,
  ) {
    this.eventId = `check-in-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    this.timestamp = new Date();
  }
}

export interface CheckOutEventData {
  reservationId: string;
  resourceId: string;
  resourceName: string;
  userId: string;
  userEmail: string;
  checkOutTime: Date;
  expectedEndTime: Date;
  isLateCheckOut: boolean;
  actualDuration: number; // in minutes
  resourceCondition?: 'GOOD' | 'DAMAGED' | 'NEEDS_CLEANING';
  notes?: string;
  timestamp: Date;
}

export class CheckOutEvent implements DomainEvent {
  public readonly eventId: string;
  public readonly eventType = 'CheckOut';
  public readonly aggregateType = 'Reservation';
  public readonly timestamp: Date;
  public readonly version = 1;

  constructor(
    public readonly aggregateId: string,
    public readonly eventData: CheckOutEventData,
    public readonly userId?: string,
  ) {
    this.eventId = `check-out-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    this.timestamp = new Date();
  }
}

// Validation Events
export interface ValidationFailedEventData {
  requestId: string;
  validationType: 'CONFLICT' | 'PERMISSION' | 'AVAILABILITY' | 'BUSINESS_RULE';
  validationRule: string;
  failureReason: string;
  conflictingReservations?: string[];
  suggestedAlternatives?: any[];
  timestamp: Date;
}

export class ValidationFailedEvent implements DomainEvent {
  public readonly eventId: string;
  public readonly eventType = 'ValidationFailed';
  public readonly aggregateType = 'Validation';
  public readonly timestamp: Date;
  public readonly version = 1;

  constructor(
    public readonly aggregateId: string,
    public readonly eventData: ValidationFailedEventData,
    public readonly userId?: string,
  ) {
    this.eventId = `validation-failed-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    this.timestamp = new Date();
  }
}

// Export all events
export const ApprovalEvents = {
  ApprovalFlowCreatedEvent,
  RequestSubmittedEvent,
  RequestApprovedEvent,
  RequestRejectedEvent,
  RequestEscalatedEvent,
  RequestTimeoutEvent,
  DocumentGeneratedEvent,
  NotificationSentEvent,
  CheckInEvent,
  CheckOutEvent,
  ValidationFailedEvent,
} as const;

// Union type for all stockpile service events
export type StockpileServiceEventType = 
  | 'ApprovalFlowCreated'
  | 'RequestSubmitted'
  | 'RequestApproved'
  | 'RequestRejected'
  | 'RequestEscalated'
  | 'RequestTimeout'
  | 'DocumentGenerated'
  | 'NotificationSent'
  | 'CheckIn'
  | 'CheckOut'
  | 'ValidationFailed';
