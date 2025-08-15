/**
 * Resources Service Domain Events
 * Event-Driven Architecture for Resource Management
 */

import { DomainEvent } from '@libs/event-bus/services/event-bus.service';

// Base interface for resource events
export interface ResourceEventData {
  resourceId: string;
  resourceName: string;
  resourceType: string;
  timestamp: Date;
  userId?: string;
  programId?: string;
}

// Resource Creation Events
export interface ResourceCreatedEventData extends ResourceEventData {
  description?: string;
  capacity?: number;
  location?: string;
  categoryIds: string[];
  responsibleUserId?: string;
  specifications?: any;
  isActive: boolean;
}

export class ResourceCreatedEvent implements DomainEvent {
  public readonly eventId: string;
  public readonly eventType = 'ResourceCreated';
  public readonly aggregateType = 'Resource';
  public readonly timestamp: Date;
  public readonly version = 1;

  constructor(
    public readonly aggregateId: string,
    public readonly eventData: ResourceCreatedEventData,
    public readonly userId?: string,
  ) {
    this.eventId = `resource-created-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    this.timestamp = new Date();
  }
}

// Resource Update Events
export interface ResourceUpdatedEventData extends ResourceEventData {
  previousData: Partial<ResourceCreatedEventData>;
  newData: Partial<ResourceCreatedEventData>;
  changedFields: string[];
}

export class ResourceUpdatedEvent implements DomainEvent {
  public readonly eventId: string;
  public readonly eventType = 'ResourceUpdated';
  public readonly aggregateType = 'Resource';
  public readonly timestamp: Date;
  public readonly version = 1;

  constructor(
    public readonly aggregateId: string,
    public readonly eventData: ResourceUpdatedEventData,
    public readonly userId?: string,
  ) {
    this.eventId = `resource-updated-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    this.timestamp = new Date();
  }
}

// Resource Deletion Events
export interface ResourceDeletedEventData extends ResourceEventData {
  reason?: string;
  isHardDelete: boolean;
}

export class ResourceDeletedEvent implements DomainEvent {
  public readonly eventId: string;
  public readonly eventType = 'ResourceDeleted';
  public readonly aggregateType = 'Resource';
  public readonly timestamp: Date;
  public readonly version = 1;

  constructor(
    public readonly aggregateId: string,
    public readonly eventData: ResourceDeletedEventData,
    public readonly userId?: string,
  ) {
    this.eventId = `resource-deleted-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    this.timestamp = new Date();
  }
}

// Resource Status Events
export interface ResourceActivatedEventData extends ResourceEventData {
  activatedBy: string;
  reason?: string;
}

export class ResourceActivatedEvent implements DomainEvent {
  public readonly eventId: string;
  public readonly eventType = 'ResourceActivated';
  public readonly aggregateType = 'Resource';
  public readonly timestamp: Date;
  public readonly version = 1;

  constructor(
    public readonly aggregateId: string,
    public readonly eventData: ResourceActivatedEventData,
    public readonly userId?: string,
  ) {
    this.eventId = `resource-activated-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    this.timestamp = new Date();
  }
}

export interface ResourceDeactivatedEventData extends ResourceEventData {
  deactivatedBy: string;
  reason?: string;
}

export class ResourceDeactivatedEvent implements DomainEvent {
  public readonly eventId: string;
  public readonly eventType = 'ResourceDeactivated';
  public readonly aggregateType = 'Resource';
  public readonly timestamp: Date;
  public readonly version = 1;

  constructor(
    public readonly aggregateId: string,
    public readonly eventData: ResourceDeactivatedEventData,
    public readonly userId?: string,
  ) {
    this.eventId = `resource-deactivated-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    this.timestamp = new Date();
  }
}

// Maintenance Events
export interface MaintenanceScheduledEventData {
  maintenanceId: string;
  resourceId: string;
  resourceName: string;
  maintenanceTypeId: string;
  maintenanceTypeName: string;
  scheduledDate: Date;
  estimatedDuration: number; // in minutes
  description?: string;
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  scheduledBy: string;
  assignedTo?: string;
  timestamp: Date;
}

export class MaintenanceScheduledEvent implements DomainEvent {
  public readonly eventId: string;
  public readonly eventType = 'MaintenanceScheduled';
  public readonly aggregateType = 'Maintenance';
  public readonly timestamp: Date;
  public readonly version = 1;

  constructor(
    public readonly aggregateId: string,
    public readonly eventData: MaintenanceScheduledEventData,
    public readonly userId?: string,
  ) {
    this.eventId = `maintenance-scheduled-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    this.timestamp = new Date();
  }
}

export interface MaintenanceStartedEventData {
  maintenanceId: string;
  resourceId: string;
  resourceName: string;
  startedBy: string;
  actualStartTime: Date;
  estimatedEndTime: Date;
  timestamp: Date;
}

export class MaintenanceStartedEvent implements DomainEvent {
  public readonly eventId: string;
  public readonly eventType = 'MaintenanceStarted';
  public readonly aggregateType = 'Maintenance';
  public readonly timestamp: Date;
  public readonly version = 1;

  constructor(
    public readonly aggregateId: string,
    public readonly eventData: MaintenanceStartedEventData,
    public readonly userId?: string,
  ) {
    this.eventId = `maintenance-started-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    this.timestamp = new Date();
  }
}

export interface MaintenanceCompletedEventData {
  maintenanceId: string;
  resourceId: string;
  resourceName: string;
  completedBy: string;
  actualEndTime: Date;
  actualDuration: number; // in minutes
  status: 'COMPLETED' | 'PARTIALLY_COMPLETED' | 'FAILED';
  notes?: string;
  nextMaintenanceDate?: Date;
  timestamp: Date;
}

export class MaintenanceCompletedEvent implements DomainEvent {
  public readonly eventId: string;
  public readonly eventType = 'MaintenanceCompleted';
  public readonly aggregateType = 'Maintenance';
  public readonly timestamp: Date;
  public readonly version = 1;

  constructor(
    public readonly aggregateId: string,
    public readonly eventData: MaintenanceCompletedEventData,
    public readonly userId?: string,
  ) {
    this.eventId = `maintenance-completed-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    this.timestamp = new Date();
  }
}

// Category Events
export interface CategoryCreatedEventData {
  categoryId: string;
  categoryName: string;
  description?: string;
  isDeletable: boolean;
  createdBy: string;
  timestamp: Date;
}

export class CategoryCreatedEvent implements DomainEvent {
  public readonly eventId: string;
  public readonly eventType = 'CategoryCreated';
  public readonly aggregateType = 'Category';
  public readonly timestamp: Date;
  public readonly version = 1;

  constructor(
    public readonly aggregateId: string,
    public readonly eventData: CategoryCreatedEventData,
    public readonly userId?: string,
  ) {
    this.eventId = `category-created-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    this.timestamp = new Date();
  }
}

// Import Events
export interface ResourceImportStartedEventData {
  importId: string;
  fileName: string;
  totalRecords: number;
  importedBy: string;
  timestamp: Date;
}

export class ResourceImportStartedEvent implements DomainEvent {
  public readonly eventId: string;
  public readonly eventType = 'ResourceImportStarted';
  public readonly aggregateType = 'ResourceImport';
  public readonly timestamp: Date;
  public readonly version = 1;

  constructor(
    public readonly aggregateId: string,
    public readonly eventData: ResourceImportStartedEventData,
    public readonly userId?: string,
  ) {
    this.eventId = `resource-import-started-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    this.timestamp = new Date();
  }
}

export interface ResourceImportCompletedEventData {
  importId: string;
  fileName: string;
  totalRecords: number;
  successfulRecords: number;
  failedRecords: number;
  errors: string[];
  duration: number; // in milliseconds
  timestamp: Date;
}

export class ResourceImportCompletedEvent implements DomainEvent {
  public readonly eventId: string;
  public readonly eventType = 'ResourceImportCompleted';
  public readonly aggregateType = 'ResourceImport';
  public readonly timestamp: Date;
  public readonly version = 1;

  constructor(
    public readonly aggregateId: string,
    public readonly eventData: ResourceImportCompletedEventData,
    public readonly userId?: string,
  ) {
    this.eventId = `resource-import-completed-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    this.timestamp = new Date();
  }
}

// Export all events
export const ResourceEvents = {
  ResourceCreatedEvent,
  ResourceUpdatedEvent,
  ResourceDeletedEvent,
  ResourceActivatedEvent,
  ResourceDeactivatedEvent,
  MaintenanceScheduledEvent,
  MaintenanceStartedEvent,
  MaintenanceCompletedEvent,
  CategoryCreatedEvent,
  ResourceImportStartedEvent,
  ResourceImportCompletedEvent,
} as const;

// Union type for all resource service events
export type ResourceServiceEventType = 
  | 'ResourceCreated'
  | 'ResourceUpdated'
  | 'ResourceDeleted'
  | 'ResourceActivated'
  | 'ResourceDeactivated'
  | 'MaintenanceScheduled'
  | 'MaintenanceStarted'
  | 'MaintenanceCompleted'
  | 'CategoryCreated'
  | 'ResourceImportStarted'
  | 'ResourceImportCompleted';
