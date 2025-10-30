/**
 * Audit Interceptor Implementation
 * Automatically intercepts and audits CQRS commands and queries
 * Provides comprehensive tracking of application layer operations
 */

import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable, throwError } from 'rxjs';
import { tap, catchError } from 'rxjs/operators';
import { Reflector } from '@nestjs/core';
import { LoggingService } from '@logging/logging.service';
import { AuditService, AuditContext } from '../services/audit.service';
import { AuditEventType, AuditCategory } from '../../utils';
import { LoggingHelper } from '@logging/logging.helper';

// Decorator to mark methods for auditing
export const AUDIT_OPERATION_KEY = 'audit_operation';
const AuditOperation = (
  eventType: AuditEventType,
  category: AuditCategory,
  resource: string,
  options?: {
    severity?: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
    tags?: string[];
  }
) => {
  return (target: any, propertyKey: string, descriptor: PropertyDescriptor) => {
    Reflect.defineMetadata(AUDIT_OPERATION_KEY, {
      eventType,
      category,
      resource,
      severity: options?.severity || 'MEDIUM',
      tags: options?.tags || []
    }, descriptor.value);
    return descriptor;
  };
};

export interface AuditOperationMetadata {
  eventType: AuditEventType;
  category: AuditCategory;
  resource: string;
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  tags: string[];
}

@Injectable()
export class AuditInterceptor implements NestInterceptor {
  constructor(
    private readonly reflector: Reflector,
    private readonly auditService: AuditService,
    private readonly logger: LoggingService
  ) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const auditMetadata = this.reflector.get<AuditOperationMetadata>(
      AUDIT_OPERATION_KEY,
      context.getHandler()
    );

    // Skip if method is not marked for auditing
    if (!auditMetadata) {
      return next.handle();
    }

    const startTime = Date.now();
    const executionContext = this.getExecutionContext(context);
    const auditContext = this.extractAuditContext(context);
    const operationData = this.extractOperationData(context);

    // Log operation start
    this.logger.log('Auditable operation started', {
      operation: auditMetadata.eventType,
      resource: auditMetadata.resource,
      correlationId: auditContext.correlationId,
      userId: auditContext.userId
    });

    return next.handle().pipe(
      tap((result) => {
        const duration = Date.now() - startTime;
        this.auditOperationSuccess(
          auditMetadata,
          auditContext,
          operationData,
          result,
          duration
        ).catch(error => {
          this.logger.error('Failed to audit successful operation', error, 
            LoggingHelper.logParams({ correlationId: auditContext.correlationId })
          );
        });
      }),
      catchError((error) => {
        const duration = Date.now() - startTime;
        this.auditOperationError(
          auditMetadata,
          auditContext,
          operationData,
          error,
          duration
        ).catch(auditError => {
          this.logger.error('Failed to audit error operation', auditError,
            LoggingHelper.logParams({ correlationId: auditContext.correlationId })
          );
        });
        return throwError(() => error);
      })
    );
  }

  /**
   * Get execution context information
   */
  private getExecutionContext(context: ExecutionContext): {
    type: string;
    handler: string;
    class: string;
  } {
    return {
      type: context.getType(),
      handler: context.getHandler().name,
      class: context.getClass().name
    };
  }

  /**
   * Extract audit context from execution context
   */
  private extractAuditContext(context: ExecutionContext): AuditContext {
    const request = context.switchToHttp().getRequest();
    
    return {
      userId: request?.user?.id,
      userRole: request?.user?.role,
      userProgram: request?.user?.program,
      sessionId: request?.user?.sessionId,
      ipAddress: this.getClientIp(request),
      userAgent: request?.get?.('User-Agent'),
      correlationId: request?.correlationId || this.generateCorrelationId(),
      requestId: request?.requestId
    };
  }

  /**
   * Extract operation data from context
   */
  private extractOperationData(context: ExecutionContext): {
    arguments: any[];
    method: string;
    class: string;
  } {
    const args = context.getArgs();
    const handler = context.getHandler();
    const className = context.getClass().name;

    return {
      arguments: args,
      method: handler.name,
      class: className
    };
  }

  /**
   * Audit successful operation
   */
  private async auditOperationSuccess(
    metadata: AuditOperationMetadata,
    context: AuditContext,
    operationData: any,
    result: any,
    duration: number
  ): Promise<void> {
    try {
      const resourceId = this.extractResourceId(operationData.arguments, result);
      const action = this.getActionFromMethod(operationData.method);

      await this.auditService.audit(
        metadata.eventType,
        metadata.category,
        action,
        metadata.resource,
        context,
        {
          resourceId,
          status: 'SUCCESS',
          severity: metadata.severity,
          payload: this.sanitizeOperationPayload(operationData.arguments),
          result: this.sanitizeOperationResult(result),
          duration,
          tags: [...metadata.tags, 'cqrs', 'application-layer'],
          traceId: context.correlationId
        }
      );

      this.logger.log('Auditable operation completed successfully', {
        operation: metadata.eventType,
        resource: metadata.resource,
        resourceId,
        duration,
        correlationId: context.correlationId,
        userId: context.userId
      });

    } catch (error) {
      this.logger.error('Failed to audit successful operation', error, LoggingHelper.logParams({
        operation: metadata.eventType,
        correlationId: context.correlationId
      }));
    }
  }

  /**
   * Audit failed operation
   */
  private async auditOperationError(
    metadata: AuditOperationMetadata,
    context: AuditContext,
    operationData: any,
    error: any,
    duration: number
  ): Promise<void> {
    try {
      const resourceId = this.extractResourceId(operationData.arguments);
      const action = this.getActionFromMethod(operationData.method);

      await this.auditService.audit(
        metadata.eventType,
        metadata.category,
        action,
        metadata.resource,
        context,
        {
          resourceId,
          status: 'FAILURE',
          severity: 'HIGH',
          payload: this.sanitizeOperationPayload(operationData.arguments),
          error: {
            code: error.code || 'OPERATION_ERROR',
            message: error.message || 'Unknown error',
            stack: error.stack
          },
          duration,
          tags: [...metadata.tags, 'cqrs', 'application-layer', 'error'],
          traceId: context.correlationId
        }
      );

      this.logger.error('Auditable operation failed', error, LoggingHelper.logParams({
        operation: metadata.eventType,
        resource: metadata.resource,
        resourceId,
        duration,
        correlationId: context.correlationId,
        userId: context.userId
      }));

    } catch (auditError) {
      this.logger.error('Failed to audit failed operation', auditError, LoggingHelper.logParams({
        operation: metadata.eventType,
        correlationId: context.correlationId,
        originalError: error.message
      }));
    }
  }

  /**
   * Extract resource ID from operation arguments or result
   */
  private extractResourceId(args: any[], result?: any): string | undefined {
    // Try to find ID in arguments
    for (const arg of args) {
      if (arg && typeof arg === 'object') {
        // Check common ID fields
        if (arg.id) return arg.id;
        if (arg.recurringReservationId) return arg.recurringReservationId;
        if (arg.waitingListId) return arg.waitingListId;
        if (arg.reassignmentId) return arg.reassignmentId;
        if (arg.penaltyId) return arg.penaltyId;
        if (arg.reservationId) return arg.reservationId;
        if (arg.resourceId) return arg.resourceId;
        if (arg.userId) return arg.userId;
      }
    }

    // Try to find ID in result
    if (result && typeof result === 'object') {
      if (result.id) return result.id;
      if (result.data?.id) return result.data.id;
    }

    return undefined;
  }

  /**
   * Get action description from method name
   */
  private getActionFromMethod(methodName: string): string {
    const lowerMethod = methodName.toLowerCase();
    
    if (lowerMethod.includes('create')) return 'create';
    if (lowerMethod.includes('update')) return 'update';
    if (lowerMethod.includes('delete') || lowerMethod.includes('remove')) return 'delete';
    if (lowerMethod.includes('cancel')) return 'cancel';
    if (lowerMethod.includes('confirm')) return 'confirm';
    if (lowerMethod.includes('approve')) return 'approve';
    if (lowerMethod.includes('reject')) return 'reject';
    if (lowerMethod.includes('accept')) return 'accept';
    if (lowerMethod.includes('join')) return 'join';
    if (lowerMethod.includes('leave')) return 'leave';
    if (lowerMethod.includes('reorder')) return 'reorder';
    if (lowerMethod.includes('escalate')) return 'escalate';
    if (lowerMethod.includes('apply')) return 'apply';
    if (lowerMethod.includes('assign')) return 'assign';
    if (lowerMethod.includes('send')) return 'send';
    if (lowerMethod.includes('notify')) return 'notify';
    if (lowerMethod.includes('find') || lowerMethod.includes('get') || lowerMethod.includes('query')) return 'read';
    
    return 'execute';
  }

  /**
   * Sanitize operation payload for audit logging
   */
  private sanitizeOperationPayload(args: any[]): Record<string, any> | undefined {
    if (!args || args.length === 0) return undefined;

    try {
      const sanitized: Record<string, any> = {};
      
      args.forEach((arg, index) => {
        if (arg && typeof arg === 'object') {
          const argCopy = { ...arg };
          
          // Remove sensitive fields
          const sensitiveFields = ['password', 'token', 'secret', 'key', 'authorization'];
          sensitiveFields.forEach(field => {
            if (argCopy[field]) {
              argCopy[field] = '[REDACTED]';
            }
          });
          
          sanitized[`arg${index}`] = argCopy;
        } else {
          sanitized[`arg${index}`] = arg;
        }
      });

      return sanitized;
    } catch (error) {
      return { error: 'Failed to sanitize operation payload' };
    }
  }

  /**
   * Sanitize operation result for audit logging
   */
  private sanitizeOperationResult(result: any): Record<string, any> | undefined {
    if (!result) return undefined;

    try {
      if (typeof result === 'object') {
        const sanitized = { ...result };
        
        // Remove sensitive fields
        const sensitiveFields = ['password', 'token', 'secret', 'key', 'authorization'];
        sensitiveFields.forEach(field => {
          if (sanitized[field]) {
            sanitized[field] = '[REDACTED]';
          }
        });
        
        return sanitized;
      }
      
      return { value: result };
    } catch (error) {
      return { error: 'Failed to sanitize operation result' };
    }
  }

  /**
   * Get client IP address
   */
  private getClientIp(request: any): string {
    if (!request) return 'unknown';
    
    return (
      request.headers?.['x-forwarded-for'] ||
      request.headers?.['x-real-ip'] ||
      request.connection?.remoteAddress ||
      request.socket?.remoteAddress ||
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

// Export decorator for easy use
export { AuditOperation };
