/**
 * Reports Service Domain Events
 * Event-Driven Architecture for Report Generation and Analytics
 */

import { DomainEvent } from '@libs/event-bus/services/event-bus.service';

// Base interface for report events
export interface ReportEventData {
  reportId: string;
  reportName: string;
  reportType: string;
  generatedBy: string;
  timestamp: Date;
}

// Report Generation Events
export interface ReportGeneratedEventData extends ReportEventData {
  parameters: any;
  dataRange: {
    startDate: Date;
    endDate: Date;
  };
  format: 'PDF' | 'CSV' | 'EXCEL' | 'JSON';
  filePath?: string;
  fileSize?: number;
  recordCount: number;
  generationDuration: number; // in milliseconds
  filters?: any;
  groupBy?: string[];
  sortBy?: string[];
}

export class ReportGeneratedEvent implements DomainEvent {
  public readonly eventId: string;
  public readonly eventType = 'ReportGenerated';
  public readonly aggregateType = 'Report';
  public readonly timestamp: Date;
  public readonly version = 1;

  constructor(
    public readonly aggregateId: string,
    public readonly eventData: ReportGeneratedEventData,
    public readonly userId?: string,
  ) {
    this.eventId = `report-generated-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    this.timestamp = new Date();
  }
}

export interface ReportScheduledEventData extends ReportEventData {
  scheduleId: string;
  frequency: 'DAILY' | 'WEEKLY' | 'MONTHLY' | 'QUARTERLY' | 'YEARLY';
  nextRunDate: Date;
  recipients: string[];
  parameters: any;
  format: 'PDF' | 'CSV' | 'EXCEL' | 'JSON';
  isActive: boolean;
}

export class ReportScheduledEvent implements DomainEvent {
  public readonly eventId: string;
  public readonly eventType = 'ReportScheduled';
  public readonly aggregateType = 'ReportSchedule';
  public readonly timestamp: Date;
  public readonly version = 1;

  constructor(
    public readonly aggregateId: string,
    public readonly eventData: ReportScheduledEventData,
    public readonly userId?: string,
  ) {
    this.eventId = `report-scheduled-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    this.timestamp = new Date();
  }
}

export interface ReportFailedEventData extends ReportEventData {
  errorMessage: string;
  errorCode: string;
  stackTrace?: string;
  parameters: any;
  attemptNumber: number;
  willRetry: boolean;
  nextRetryAt?: Date;
}

export class ReportFailedEvent implements DomainEvent {
  public readonly eventId: string;
  public readonly eventType = 'ReportFailed';
  public readonly aggregateType = 'Report';
  public readonly timestamp: Date;
  public readonly version = 1;

  constructor(
    public readonly aggregateId: string,
    public readonly eventData: ReportFailedEventData,
    public readonly userId?: string,
  ) {
    this.eventId = `report-failed-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    this.timestamp = new Date();
  }
}

// Dashboard Events
export interface DashboardUpdatedEventData {
  dashboardId: string;
  dashboardName: string;
  updatedBy: string;
  widgets: {
    widgetId: string;
    widgetType: string;
    dataSource: string;
    lastUpdated: Date;
  }[];
  refreshInterval: number; // in minutes
  isRealTime: boolean;
  timestamp: Date;
}

export class DashboardUpdatedEvent implements DomainEvent {
  public readonly eventId: string;
  public readonly eventType = 'DashboardUpdated';
  public readonly aggregateType = 'Dashboard';
  public readonly timestamp: Date;
  public readonly version = 1;

  constructor(
    public readonly aggregateId: string,
    public readonly eventData: DashboardUpdatedEventData,
    public readonly userId?: string,
  ) {
    this.eventId = `dashboard-updated-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    this.timestamp = new Date();
  }
}

export interface DashboardViewedEventData {
  dashboardId: string;
  dashboardName: string;
  viewedBy: string;
  userRole: string;
  sessionId: string;
  viewDuration?: number; // in seconds
  interactionCount: number;
  widgetsViewed: string[];
  timestamp: Date;
}

export class DashboardViewedEvent implements DomainEvent {
  public readonly eventId: string;
  public readonly eventType = 'DashboardViewed';
  public readonly aggregateType = 'Dashboard';
  public readonly timestamp: Date;
  public readonly version = 1;

  constructor(
    public readonly aggregateId: string,
    public readonly eventData: DashboardViewedEventData,
    public readonly userId?: string,
  ) {
    this.eventId = `dashboard-viewed-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    this.timestamp = new Date();
  }
}

// Analytics Events
export interface AnalyticsCalculatedEventData {
  analyticsId: string;
  analyticsType: 'USAGE' | 'PERFORMANCE' | 'DEMAND' | 'SATISFACTION' | 'EFFICIENCY';
  metricName: string;
  metricValue: number;
  metricUnit: string;
  calculationPeriod: {
    startDate: Date;
    endDate: Date;
  };
  calculatedBy: string;
  calculationMethod: string;
  dataPoints: number;
  confidence: number; // 0-100
  timestamp: Date;
}

export class AnalyticsCalculatedEvent implements DomainEvent {
  public readonly eventId: string;
  public readonly eventType = 'AnalyticsCalculated';
  public readonly aggregateType = 'Analytics';
  public readonly timestamp: Date;
  public readonly version = 1;

  constructor(
    public readonly aggregateId: string,
    public readonly eventData: AnalyticsCalculatedEventData,
    public readonly userId?: string,
  ) {
    this.eventId = `analytics-calculated-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    this.timestamp = new Date();
  }
}

export interface AlertTriggeredEventData {
  alertId: string;
  alertName: string;
  alertType: 'THRESHOLD' | 'ANOMALY' | 'TREND' | 'PATTERN';
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  metricName: string;
  currentValue: number;
  thresholdValue?: number;
  message: string;
  affectedResources: string[];
  triggeredBy: string;
  recipients: string[];
  timestamp: Date;
}

export class AlertTriggeredEvent implements DomainEvent {
  public readonly eventId: string;
  public readonly eventType = 'AlertTriggered';
  public readonly aggregateType = 'Alert';
  public readonly timestamp: Date;
  public readonly version = 1;

  constructor(
    public readonly aggregateId: string,
    public readonly eventData: AlertTriggeredEventData,
    public readonly userId?: string,
  ) {
    this.eventId = `alert-triggered-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    this.timestamp = new Date();
  }
}

// Export Events
export interface ReportExportedEventData extends ReportEventData {
  exportFormat: 'PDF' | 'CSV' | 'EXCEL' | 'JSON' | 'XML';
  exportedBy: string;
  exportedTo: string[]; // email addresses or file paths
  fileSize: number;
  compressionUsed: boolean;
  encryptionUsed: boolean;
  downloadUrl?: string;
  expiresAt?: Date;
}

export class ReportExportedEvent implements DomainEvent {
  public readonly eventId: string;
  public readonly eventType = 'ReportExported';
  public readonly aggregateType = 'Report';
  public readonly timestamp: Date;
  public readonly version = 1;

  constructor(
    public readonly aggregateId: string,
    public readonly eventData: ReportExportedEventData,
    public readonly userId?: string,
  ) {
    this.eventId = `report-exported-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    this.timestamp = new Date();
  }
}

// Data Refresh Events
export interface DataRefreshedEventData {
  dataSourceId: string;
  dataSourceName: string;
  refreshType: 'FULL' | 'INCREMENTAL' | 'DELTA';
  recordsProcessed: number;
  recordsAdded: number;
  recordsUpdated: number;
  recordsDeleted: number;
  refreshDuration: number; // in milliseconds
  triggeredBy: string;
  nextRefreshAt?: Date;
  timestamp: Date;
}

export class DataRefreshedEvent implements DomainEvent {
  public readonly eventId: string;
  public readonly eventType = 'DataRefreshed';
  public readonly aggregateType = 'DataSource';
  public readonly timestamp: Date;
  public readonly version = 1;

  constructor(
    public readonly aggregateId: string,
    public readonly eventData: DataRefreshedEventData,
    public readonly userId?: string,
  ) {
    this.eventId = `data-refreshed-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    this.timestamp = new Date();
  }
}

// Export all events
export const ReportEvents = {
  ReportGeneratedEvent,
  ReportScheduledEvent,
  ReportFailedEvent,
  DashboardUpdatedEvent,
  DashboardViewedEvent,
  AnalyticsCalculatedEvent,
  AlertTriggeredEvent,
  ReportExportedEvent,
  DataRefreshedEvent,
} as const;

// Union type for all reports service events
export type ReportsServiceEventType = 
  | 'ReportGenerated'
  | 'ReportScheduled'
  | 'ReportFailed'
  | 'DashboardUpdated'
  | 'DashboardViewed'
  | 'AnalyticsCalculated'
  | 'AlertTriggered'
  | 'ReportExported'
  | 'DataRefreshed';
