/**
 * Audit Service Implementation
 * Provides structured auditing and logging for all critical operations
 * in the availability-service microservice
 */

import { Injectable } from "@nestjs/common";
import { LoggingService } from "@logging/logging.service";
import { DomainEvent, EventBusService } from "@event-bus/services/event-bus.service";
import { AuditRepository } from "../repositories/audit.repository";
import { LoggingHelper } from "@logging/logging.helper";
import { AuditCategory, AuditEventType } from "../../utils";

export interface AuditContext {
  readonly userId?: string;
  readonly userRole?: string;
  readonly userProgram?: string;
  readonly sessionId?: string;
  readonly ipAddress?: string;
  readonly userAgent?: string;
  readonly correlationId?: string;
  readonly requestId?: string;
}

export interface AuditMetadata {
  readonly timestamp: Date;
  readonly service: string;
  readonly version: string;
  readonly environment: string;
  readonly traceId?: string;
  readonly spanId?: string;
}

export interface AuditEntry {
  readonly id: string;
  readonly eventType: string;
  readonly category: string;
  readonly action: string;
  readonly resource: string;
  readonly resourceId?: string;
  readonly status: "SUCCESS" | "FAILURE" | "PENDING" | "CANCELLED";
  readonly severity: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
  readonly context: AuditContext;
  readonly metadata: AuditMetadata;
  readonly payload?: Record<string, any>;
  readonly result?: Record<string, any>;
  readonly error?: {
    code: string;
    message: string;
    stack?: string;
  };
  readonly duration?: number;
  readonly tags?: string[];
}

@Injectable()
export class AuditService {
  private readonly serviceName = "availability-service";
  private readonly serviceVersion = process.env.SERVICE_VERSION || "1.0.0";
  private readonly environment = process.env.NODE_ENV || "development";

  constructor(
    private readonly logger: LoggingService,
    private readonly eventBus: EventBusService,
    private readonly auditRepository: AuditRepository
  ) {}

  /**
   * Create and log an audit entry
   */
  async audit(
    eventType: AuditEventType,
    category: AuditCategory,
    action: string,
    resource: string,
    context: AuditContext,
    options: {
      resourceId?: string;
      status?: "SUCCESS" | "FAILURE" | "PENDING" | "CANCELLED";
      severity?: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
      payload?: Record<string, any>;
      result?: Record<string, any>;
      error?: { code: string; message: string; stack?: string };
      duration?: number;
      tags?: string[];
      traceId?: string;
      spanId?: string;
    } = {}
  ): Promise<AuditEntry> {
    const auditEntry: AuditEntry = {
      id: this.generateAuditId(),
      eventType,
      category,
      action,
      resource,
      resourceId: options.resourceId,
      status: options.status || "SUCCESS",
      severity: options.severity || "MEDIUM",
      context,
      metadata: {
        timestamp: new Date(),
        service: this.serviceName,
        version: this.serviceVersion,
        environment: this.environment,
        traceId: options.traceId,
        spanId: options.spanId,
      },
      payload: options.payload,
      result: options.result,
      error: options.error,
      duration: options.duration,
      tags: options.tags,
    };

    // Log to structured logger
    await this.logAuditEntry(auditEntry);

    // Persist to database
    await this.persistAuditEntry(auditEntry);

    // Publish audit event for external systems
    await this.publishAuditEvent(auditEntry);

    return auditEntry;
  }

  /**
   * Audit recurring reservation operations
   */
  async auditRecurringReservation(
    eventType: AuditEventType,
    action: string,
    recurringReservationId: string,
    context: AuditContext,
    options: {
      payload?: Record<string, any>;
      result?: Record<string, any>;
      error?: { code: string; message: string; stack?: string };
      duration?: number;
    } = {}
  ): Promise<void> {
    await this.audit(
      eventType,
      AuditCategory.BOOKING,
      action,
      "recurring_reservation",
      context,
      {
        resourceId: recurringReservationId,
        severity: "MEDIUM",
        tags: ["recurring", "reservation", "rf-12"],
        ...options,
      }
    );
  }

  /**
   * Audit waiting list operations
   */
  async auditWaitingList(
    eventType: AuditEventType,
    action: string,
    waitingListId: string,
    context: AuditContext,
    options: {
      entryId?: string;
      position?: number;
      priority?: string;
      payload?: Record<string, any>;
      result?: Record<string, any>;
      error?: { code: string; message: string; stack?: string };
      duration?: number;
    } = {}
  ): Promise<void> {
    await this.audit(
      eventType,
      AuditCategory.BOOKING,
      action,
      "waiting_list",
      context,
      {
        resourceId: waitingListId,
        severity: "MEDIUM",
        tags: ["waiting-list", "queue", "rf-14"],
        payload: {
          ...options.payload,
          entryId: options.entryId,
          position: options.position,
          priority: options.priority,
        },
        result: options.result,
        error: options.error,
        duration: options.duration,
      }
    );
  }

  /**
   * Audit reassignment operations
   */
  async auditReassignment(
    eventType: AuditEventType,
    action: string,
    reassignmentId: string,
    context: AuditContext,
    options: {
      originalReservationId?: string;
      suggestedResourceId?: string;
      reason?: string;
      payload?: Record<string, any>;
      result?: Record<string, any>;
      error?: { code: string; message: string; stack?: string };
      duration?: number;
    } = {}
  ): Promise<void> {
    await this.audit(
      eventType,
      AuditCategory.BOOKING,
      action,
      "reassignment_request",
      context,
      {
        resourceId: reassignmentId,
        severity: "HIGH",
        tags: ["reassignment", "resource-change", "rf-15"],
        payload: {
          ...options.payload,
          originalReservationId: options.originalReservationId,
          suggestedResourceId: options.suggestedResourceId,
          reason: options.reason,
        },
        result: options.result,
        error: options.error,
        duration: options.duration,
      }
    );
  }

  /**
   * Audit penalty operations
   */
  async auditPenalty(
    eventType: AuditEventType,
    action: string,
    penaltyId: string,
    context: AuditContext,
    options: {
      penaltyType?: string;
      severity?: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
      targetUserId?: string;
      payload?: Record<string, any>;
      result?: Record<string, any>;
      error?: { code: string; message: string; stack?: string };
      duration?: number;
    } = {}
  ): Promise<void> {
    await this.audit(
      eventType,
      AuditCategory.USER_ACTION,
      action,
      "penalty",
      context,
      {
        resourceId: penaltyId,
        severity: options.severity || "HIGH",
        tags: ["penalty", "enforcement", "user-behavior"],
        payload: {
          ...options.payload,
          penaltyType: options.penaltyType,
          targetUserId: options.targetUserId,
        },
        result: options.result,
        error: options.error,
        duration: options.duration,
      }
    );
  }

  /**
   * Audit notification operations
   */
  async auditNotification(
    eventType: AuditEventType,
    action: string,
    notificationId: string,
    context: AuditContext,
    options: {
      channel?: string;
      templateId?: string;
      recipientId?: string;
      payload?: Record<string, any>;
      result?: Record<string, any>;
      error?: { code: string; message: string; stack?: string };
      duration?: number;
    } = {}
  ): Promise<void> {
    await this.audit(
      eventType,
      AuditCategory.NOTIFICATION,
      action,
      "notification",
      context,
      {
        resourceId: notificationId,
        severity: "LOW",
        tags: ["notification", "communication"],
        payload: {
          ...options.payload,
          channel: options.channel,
          templateId: options.templateId,
          recipientId: options.recipientId,
        },
        result: options.result,
        error: options.error,
        duration: options.duration,
      }
    );
  }

  /**
   * Audit security events
   */
  async auditSecurity(
    eventType: AuditEventType,
    action: string,
    resource: string,
    context: AuditContext,
    options: {
      severity?: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
      threat?: string;
      payload?: Record<string, any>;
      result?: Record<string, any>;
      error?: { code: string; message: string; stack?: string };
      duration?: number;
    } = {}
  ): Promise<void> {
    await this.audit(
      eventType,
      AuditCategory.SECURITY,
      action,
      resource,
      context,
      {
        severity: options.severity || "HIGH",
        tags: ["security", "threat", "access-control"],
        payload: {
          ...options.payload,
          threat: options.threat,
        },
        result: options.result,
        error: options.error,
        duration: options.duration,
      }
    );
  }

  /**
   * Log audit entry using structured logger
   */
  private async logAuditEntry(auditEntry: AuditEntry): Promise<void> {
    const logLevel = this.getLogLevel(auditEntry.severity);
    const logMessage = `[AUDIT] ${auditEntry.eventType} - ${auditEntry.action}`;

    this.logger[logLevel](logMessage, {
      audit: auditEntry,
      category: "AUDIT",
      service: this.serviceName,
      correlationId: auditEntry.context.correlationId,
      traceId: auditEntry.metadata.traceId,
    });
  }

  /**
   * Persist audit entry to database
   */
  private async persistAuditEntry(auditEntry: AuditEntry): Promise<void> {
    try {
      await this.auditRepository.save(auditEntry);
      this.logger.log("Audit entry persisted to database", {
        auditId: auditEntry.id,
        eventType: auditEntry.eventType,
      });
    } catch (error) {
      this.logger.error(
        "Failed to persist audit entry to database",
        error,
        LoggingHelper.logParams({
          auditId: auditEntry.id,
          eventType: auditEntry.eventType,
        })
      );
      // Don't throw error to avoid breaking the main operation
    }
  }

  /**
   * Publish audit event to event bus for external consumption
   */
  private async publishAuditEvent(auditEntry: AuditEntry): Promise<void> {
    try {
      await this.eventBus.publishEvent({
        eventId: auditEntry.id,
        eventType: "audit.event.created",
        aggregateId: auditEntry.id,
        aggregateType: "AUDIT",
        eventData: {
          ...auditEntry,
          service: this.serviceName,
        },
        timestamp: auditEntry.metadata.timestamp,
        version: 1,
      } as DomainEvent);
    } catch (error) {
      this.logger.error(
        "Failed to publish audit event to event bus",
        error,
        LoggingHelper.logParams({
          auditId: auditEntry.id,
          eventType: auditEntry.eventType,
        })
      );
    }
  }

  /**
   * Generate unique audit ID
   */
  private generateAuditId(): string {
    const timestamp = Date.now();
    const random = Math.random().toString(36).substring(2, 15);
    return `audit_${timestamp}_${random}`;
  }

  /**
   * Map severity to log level
   */
  private getLogLevel(severity: string): "log" | "warn" | "error" {
    switch (severity) {
      case "LOW":
        return "log";
      case "MEDIUM":
        return "log";
      case "HIGH":
        return "warn";
      case "CRITICAL":
        return "error";
      default:
        return "log";
    }
  }
}
