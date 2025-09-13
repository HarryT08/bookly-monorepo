/**
 * Audit Middleware Implementation
 * Automatically intercepts and audits HTTP requests to critical endpoints
 * Provides comprehensive tracking of user actions and system operations
 */

import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { LoggingService } from '@libs/logging/logging.service';
import { AuditService, AuditContext } from '../services/audit.service';
import { AuditEventType, AuditCategory } from '../../utils';
import { LoggingHelper } from '@/libs/logging/logging.helper';

export interface AuditableRequest extends Request {
  user?: {
    id: string;
    role: string;
    program?: string;
    sessionId?: string;
  };
  correlationId?: string;
  requestId?: string;
  startTime?: number;
}

@Injectable()
export class AuditMiddleware implements NestMiddleware {
  constructor(
    private readonly auditService: AuditService,
    private readonly logger: LoggingService
  ) {}

  async use(req: AuditableRequest, res: Response, next: NextFunction): Promise<void> {
    // Skip non-auditable requests
    if (!this.shouldAuditRequest(req)) {
      return next();
    }

    // Set request start time for duration tracking
    req.startTime = Date.now();

    // Generate correlation ID if not present
    if (!req.correlationId) {
      req.correlationId = this.generateCorrelationId();
    }

    // Extract audit context from request
    const auditContext = this.extractAuditContext(req);

    // Log request start
    this.logger.log('Auditable request started', {
      method: req.method,
      url: req.url,
      correlationId: req.correlationId,
      userId: auditContext.userId,
      userRole: auditContext.userRole
    });

    // Override response.end to capture response data
    const originalEnd = res.end.bind(res);
    let responseBody: any;

    res.end = function(chunk?: any, encoding?: any, cb?: () => void): any {
      // Handle different overloads of res.end()
      if (typeof chunk === 'function') {
        // end(cb)
        cb = chunk;
        chunk = undefined;
      } else if (typeof encoding === 'function') {
        // end(chunk, cb)
        cb = encoding;
        encoding = undefined;
      }

      // Capture response body if provided
      if (chunk) {
        responseBody = chunk;
      }

      // Call original end method with proper arguments
      if (cb) {
        if (encoding) {
          return originalEnd(chunk, encoding, cb);
        } else if (chunk) {
          return originalEnd(chunk, cb);
        } else {
          return originalEnd(cb);
        }
      } else {
        if (encoding) {
          return originalEnd(chunk, encoding);
        } else if (chunk) {
          return originalEnd(chunk);
        } else {
          return originalEnd();
        }
      }
    };

    // Handle response completion
    res.on('finish', async () => {
      await this.auditRequestCompletion(req, res, auditContext, responseBody);
    });

    // Handle errors
    res.on('error', async (error) => {
      await this.auditRequestError(req, res, auditContext, error);
    });

    next();
  }

  /**
   * Determine if request should be audited
   */
  private shouldAuditRequest(req: Request): boolean {
    const auditablePaths = [
      // Recurring Reservations (RF-12)
      '/recurring-reservations',
      '/recurring-reservations/',
      
      // Waiting List (RF-14)
      '/waiting-lists',
      '/waiting-lists/',
      
      // Reassignment (RF-15)
      '/reassignments',
      '/reassignments/',
      
      // Penalties
      '/penalties',
      '/penalties/',
      
      // Notifications
      '/notifications',
      '/notifications/',
      
      // General reservations
      '/reservations',
      '/reservations/'
    ];

    const criticalMethods = ['POST', 'PUT', 'PATCH', 'DELETE'];
    
    return auditablePaths.some(path => req.url.startsWith(path)) && 
           criticalMethods.includes(req.method);
  }

  /**
   * Extract audit context from request
   */
  private extractAuditContext(req: AuditableRequest): AuditContext {
    return {
      userId: req.user?.id,
      userRole: req.user?.role,
      userProgram: req.user?.program,
      sessionId: req.user?.sessionId,
      ipAddress: this.getClientIp(req),
      userAgent: req.get('User-Agent'),
      correlationId: req.correlationId,
      requestId: req.requestId
    };
  }

  /**
   * Audit successful request completion
   */
  private async auditRequestCompletion(
    req: AuditableRequest,
    res: Response,
    context: AuditContext,
    responseBody: any
  ): Promise<void> {
    try {
      const duration = req.startTime ? Date.now() - req.startTime : undefined;
      const auditInfo = this.parseRequestForAudit(req, res.statusCode);

      if (auditInfo) {
        await this.auditService.audit(
          auditInfo.eventType,
          auditInfo.category,
          auditInfo.action,
          auditInfo.resource,
          context,
          {
            resourceId: auditInfo.resourceId,
            status: res.statusCode >= 200 && res.statusCode < 300 ? 'SUCCESS' : 'FAILURE',
            severity: auditInfo.severity,
            payload: this.sanitizePayload(req.body),
            result: this.sanitizeResponse(responseBody, res.statusCode),
            duration,
            tags: auditInfo.tags,
            traceId: req.headers['x-trace-id'] as string,
            spanId: req.headers['x-span-id'] as string
          }
        );
      }

      this.logger.log('Auditable request completed', {
        method: req.method,
        url: req.url,
        statusCode: res.statusCode,
        duration,
        correlationId: req.correlationId,
        userId: context.userId
      });

    } catch (error) {
      this.logger.error('Failed to audit request completion', error, LoggingHelper.logParams({
        method: req.method,
        url: req.url,
        correlationId: req.correlationId
      }));
    }
  }

  /**
   * Audit request error
   */
  private async auditRequestError(
    req: AuditableRequest,
    res: Response,
    context: AuditContext,
    error: Error
  ): Promise<void> {
    try {
      const duration = req.startTime ? Date.now() - req.startTime : undefined;
      const auditInfo = this.parseRequestForAudit(req, 500);

      if (auditInfo) {
        await this.auditService.audit(
          auditInfo.eventType,
          auditInfo.category,
          auditInfo.action,
          auditInfo.resource,
          context,
          {
            resourceId: auditInfo.resourceId,
            status: 'FAILURE',
            severity: 'HIGH',
            payload: this.sanitizePayload(req.body),
            error: {
              code: 'REQUEST_ERROR',
              message: error.message,
              stack: error.stack
            },
            duration,
            tags: [...(auditInfo.tags || []), 'error'],
            traceId: req.headers['x-trace-id'] as string,
            spanId: req.headers['x-span-id'] as string
          }
        );
      }

      this.logger.error('Auditable request failed', error, LoggingHelper.logParams({
        method: req.method,
        url: req.url,
        correlationId: req.correlationId,
        userId: context.userId
      }));

    } catch (auditError) {
      this.logger.error('Failed to audit request error', auditError, LoggingHelper.logParams({
        method: req.method,
        url: req.url,
        correlationId: req.correlationId,
        originalError: error.message
      }));
    }
  }

  /**
   * Parse request to determine audit information
   */
  private parseRequestForAudit(req: AuditableRequest, statusCode: number): {
    eventType: AuditEventType;
    category: AuditCategory;
    action: string;
    resource: string;
    resourceId?: string;
    severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
    tags?: string[];
  } | null {
    const method = req.method;
    const url = req.url;
    const pathSegments = url.split('/').filter(segment => segment.length > 0);

    // Extract resource ID from URL if present
    const resourceId = this.extractResourceIdFromUrl(url);

    // Recurring Reservations (RF-12)
    if (url.includes('/recurring-reservations')) {
      return {
        eventType: this.getRecurringReservationEventType(method, statusCode),
        category: AuditCategory.BOOKING,
        action: this.getActionFromMethod(method),
        resource: 'recurring_reservation',
        resourceId,
        severity: 'MEDIUM',
        tags: ['recurring', 'reservation', 'rf-12']
      };
    }

    // Waiting List (RF-14)
    if (url.includes('/waiting-lists')) {
      return {
        eventType: this.getWaitingListEventType(method, url, statusCode),
        category: AuditCategory.BOOKING,
        action: this.getActionFromMethod(method),
        resource: 'waiting_list',
        resourceId,
        severity: 'MEDIUM',
        tags: ['waiting-list', 'queue', 'rf-14']
      };
    }

    // Reassignment (RF-15)
    if (url.includes('/reassignments')) {
      return {
        eventType: this.getReassignmentEventType(method, url, statusCode),
        category: AuditCategory.BOOKING,
        action: this.getActionFromMethod(method),
        resource: 'reassignment_request',
        resourceId,
        severity: 'HIGH',
        tags: ['reassignment', 'resource-change', 'rf-15']
      };
    }

    // Penalties
    if (url.includes('/penalties')) {
      return {
        eventType: this.getPenaltyEventType(method, statusCode),
        category: AuditCategory.USER_ACTION,
        action: this.getActionFromMethod(method),
        resource: 'penalty',
        resourceId,
        severity: 'HIGH',
        tags: ['penalty', 'enforcement']
      };
    }

    // Notifications
    if (url.includes('/notifications')) {
      return {
        eventType: this.getNotificationEventType(method, statusCode),
        category: AuditCategory.NOTIFICATION,
        action: this.getActionFromMethod(method),
        resource: 'notification',
        resourceId,
        severity: 'LOW',
        tags: ['notification', 'communication']
      };
    }

    return null;
  }

  /**
   * Get recurring reservation event type based on method and status
   */
  private getRecurringReservationEventType(method: string, statusCode: number): AuditEventType {
    if (statusCode >= 400) {
      return AuditEventType.RECURRING_CONFLICT_DETECTED;
    }

    switch (method) {
      case 'POST':
        return AuditEventType.RECURRING_RESERVATION_CREATED;
      case 'PUT':
      case 'PATCH':
        return AuditEventType.RECURRING_RESERVATION_UPDATED;
      case 'DELETE':
        return AuditEventType.RECURRING_RESERVATION_CANCELLED;
      default:
        return AuditEventType.RECURRING_RESERVATION_CREATED;
    }
  }

  /**
   * Get waiting list event type based on method, URL and status
   */
  private getWaitingListEventType(method: string, url: string, statusCode: number): AuditEventType {
    if (url.includes('/join')) {
      return AuditEventType.WAITING_LIST_JOINED;
    }
    if (url.includes('/leave')) {
      return AuditEventType.WAITING_LIST_LEFT;
    }
    if (url.includes('/confirm')) {
      return AuditEventType.WAITING_LIST_CONFIRMED;
    }
    if (url.includes('/reorder')) {
      return AuditEventType.WAITING_LIST_REORDERED;
    }

    switch (method) {
      case 'POST':
        return AuditEventType.WAITING_LIST_JOINED;
      case 'DELETE':
        return AuditEventType.WAITING_LIST_LEFT;
      default:
        return AuditEventType.WAITING_LIST_JOINED;
    }
  }

  /**
   * Get reassignment event type based on method, URL and status
   */
  private getReassignmentEventType(method: string, url: string, statusCode: number): AuditEventType {
    if (url.includes('/accept')) {
      return AuditEventType.REASSIGNMENT_ACCEPTED;
    }
    if (url.includes('/reject')) {
      return AuditEventType.REASSIGNMENT_REJECTED;
    }
    if (url.includes('/cancel')) {
      return AuditEventType.REASSIGNMENT_CANCELLED;
    }

    switch (method) {
      case 'POST':
        return AuditEventType.REASSIGNMENT_REQUESTED;
      case 'DELETE':
        return AuditEventType.REASSIGNMENT_CANCELLED;
      default:
        return AuditEventType.REASSIGNMENT_REQUESTED;
    }
  }

  /**
   * Get penalty event type based on method and status
   */
  private getPenaltyEventType(method: string, statusCode: number): AuditEventType {
    switch (method) {
      case 'POST':
        return AuditEventType.PENALTY_APPLIED;
      case 'DELETE':
        return AuditEventType.PENALTY_REMOVED;
      default:
        return AuditEventType.PENALTY_APPLIED;
    }
  }

  /**
   * Get notification event type based on method and status
   */
  private getNotificationEventType(method: string, statusCode: number): AuditEventType {
    if (statusCode >= 400) {
      return AuditEventType.NOTIFICATION_FAILED;
    }
    return AuditEventType.NOTIFICATION_SENT;
  }

  /**
   * Get action description from HTTP method
   */
  private getActionFromMethod(method: string): string {
    switch (method) {
      case 'POST':
        return 'create';
      case 'PUT':
        return 'update';
      case 'PATCH':
        return 'modify';
      case 'DELETE':
        return 'delete';
      case 'GET':
        return 'read';
      default:
        return 'unknown';
    }
  }

  /**
   * Extract resource ID from URL
   */
  private extractResourceIdFromUrl(url: string): string | undefined {
    const segments = url.split('/').filter(segment => segment.length > 0);
    
    // Look for MongoDB ObjectId pattern (24 hex characters)
    const objectIdPattern = /^[0-9a-fA-F]{24}$/;
    
    for (const segment of segments) {
      if (objectIdPattern.test(segment)) {
        return segment;
      }
    }

    return undefined;
  }

  /**
   * Sanitize request payload for audit logging
   */
  private sanitizePayload(payload: any): Record<string, any> | undefined {
    if (!payload) return undefined;

    try {
      const sanitized = { ...payload };
      
      // Remove sensitive fields
      const sensitiveFields = ['password', 'token', 'secret', 'key', 'authorization'];
      sensitiveFields.forEach(field => {
        if (sanitized[field]) {
          sanitized[field] = '[REDACTED]';
        }
      });

      return sanitized;
    } catch (error) {
      return { error: 'Failed to sanitize payload' };
    }
  }

  /**
   * Sanitize response for audit logging
   */
  private sanitizeResponse(responseBody: any, statusCode: number): Record<string, any> | undefined {
    if (!responseBody) return { statusCode };

    try {
      let parsed;
      if (typeof responseBody === 'string') {
        parsed = JSON.parse(responseBody);
      } else {
        parsed = responseBody;
      }

      return {
        statusCode,
        data: parsed,
        success: statusCode >= 200 && statusCode < 300
      };
    } catch (error) {
      return {
        statusCode,
        error: 'Failed to parse response'
      };
    }
  }

  /**
   * Get client IP address
   */
  private getClientIp(req: Request): string {
    return (
      req.headers['x-forwarded-for'] as string ||
      req.headers['x-real-ip'] as string ||
      req.connection.remoteAddress ||
      req.socket.remoteAddress ||
      'unknown'
    );
  }

  /**
   * Generate correlation ID
   */
  private generateCorrelationId(): string {
    const timestamp = Date.now();
    const random = Math.random().toString(36).substring(2, 15);
    return `corr_${timestamp}_${random}`;
  }
}
