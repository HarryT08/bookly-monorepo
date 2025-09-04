import { ArgumentsHost, Catch, HttpStatus, Logger } from '@nestjs/common';
import { 
  AvailabilityErrorCode, 
  AvailabilityException,
  AvailabilityErrorMessages 
} from '../../domain/enums/availability-errors.enum';
import { AllExceptionsFilter } from '@/libs/common/filters/all-exceptions.filter';

@Catch()
export class AvailabilityExceptionFilter extends AllExceptionsFilter {
  protected readonly logger = new Logger(AvailabilityExceptionFilter.name);

  catch(exception: unknown, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const request = ctx.getRequest();
    const response = ctx.getResponse();

    // Handle specific AvailabilityException
    if (exception instanceof AvailabilityException) {
      const httpStatus = this.mapAvailabilityErrorToHttpStatus(exception.code);
      const sanitizedDetails = this.sanitizeAvailabilityDetails(exception.details);

      // Log with detailed context
      this.logger.error(
        `Availability Service Error - Code: ${exception.code}, Message: ${exception.message}`,
        {
          errorCode: exception.code,
          httpStatus,
          path: request.url,
          method: request.method,
          userId: request.user?.id || 'anonymous',
          userAgent: request.headers['user-agent'],
          ip: request.ip,
          timestamp: new Date().toISOString(),
          details: sanitizedDetails,
          stack: exception.stack,
        },
      );

      const errorResponse = {
        success: false,
        error: {
          code: `AVLB-${exception.code}`,
          message: exception.message,
          type: 'error' as const,
          exception_code: exception.code,
          http_code: httpStatus,
          http_exception: this.getHttpExceptionName(httpStatus),
          details: sanitizedDetails,
        },
        timestamp: new Date().toISOString(),
        path: request.url,
        method: request.method,
        requestId: request.headers['x-request-id'] || undefined,
      };

      response.status(httpStatus).json(errorResponse);
      return;
    }

    // Delegate to parent filter for other exceptions
    super.catch(exception, host);
  }

  private mapAvailabilityErrorToHttpStatus(code: AvailabilityErrorCode): number {
    const statusMap: Record<AvailabilityErrorCode, number> = {
      // Reservation Errors
      [AvailabilityErrorCode.RESERVATION_NOT_FOUND]: HttpStatus.NOT_FOUND,
      [AvailabilityErrorCode.RESERVATION_CONFLICT]: HttpStatus.CONFLICT,
      [AvailabilityErrorCode.RESOURCE_NOT_AVAILABLE]: HttpStatus.CONFLICT,
      [AvailabilityErrorCode.RESERVATION_EXPIRED]: HttpStatus.GONE,
      [AvailabilityErrorCode.RESERVATION_CANCELLED]: HttpStatus.GONE,
      [AvailabilityErrorCode.RESERVATION_ALREADY_CONFIRMED]: HttpStatus.CONFLICT,
      [AvailabilityErrorCode.RESERVATION_IN_PAST]: HttpStatus.BAD_REQUEST,
      [AvailabilityErrorCode.RESERVATION_TOO_FAR_FUTURE]: HttpStatus.BAD_REQUEST,
      [AvailabilityErrorCode.MAX_RESERVATIONS_EXCEEDED]: HttpStatus.TOO_MANY_REQUESTS,
      [AvailabilityErrorCode.RESERVATION_DURATION_INVALID]: HttpStatus.BAD_REQUEST,
      [AvailabilityErrorCode.RESERVATION_OUTSIDE_HOURS]: HttpStatus.BAD_REQUEST,
      [AvailabilityErrorCode.RESERVATION_MODIFICATION_DENIED]: HttpStatus.FORBIDDEN,

      // Resource Availability Errors
      [AvailabilityErrorCode.RESOURCE_UNDER_MAINTENANCE]: HttpStatus.SERVICE_UNAVAILABLE,
      [AvailabilityErrorCode.RESOURCE_BLOCKED]: HttpStatus.FORBIDDEN,
      [AvailabilityErrorCode.RESOURCE_CAPACITY_EXCEEDED]: HttpStatus.CONFLICT,
      [AvailabilityErrorCode.SCHEDULE_NOT_FOUND]: HttpStatus.NOT_FOUND,
      [AvailabilityErrorCode.SCHEDULE_CONFLICT]: HttpStatus.CONFLICT,
      [AvailabilityErrorCode.INVALID_TIME_SLOT]: HttpStatus.BAD_REQUEST,
      [AvailabilityErrorCode.NO_AVAILABILITY_FOUND]: HttpStatus.NOT_FOUND,
      [AvailabilityErrorCode.RECURRING_SCHEDULE_ERROR]: HttpStatus.INTERNAL_SERVER_ERROR,

      // Recurring Reservation Errors
      [AvailabilityErrorCode.RECURRING_PATTERN_INVALID]: HttpStatus.BAD_REQUEST,
      [AvailabilityErrorCode.RECURRING_END_DATE_INVALID]: HttpStatus.BAD_REQUEST,
      [AvailabilityErrorCode.RECURRING_FREQUENCY_INVALID]: HttpStatus.BAD_REQUEST,
      [AvailabilityErrorCode.RECURRING_INSTANCES_EXCEEDED]: HttpStatus.BAD_REQUEST,
      [AvailabilityErrorCode.RECURRING_CONFLICT_DETECTED]: HttpStatus.CONFLICT,
      [AvailabilityErrorCode.RECURRING_MODIFICATION_DENIED]: HttpStatus.FORBIDDEN,

      // Waiting List Errors
      [AvailabilityErrorCode.WAITLIST_FULL]: HttpStatus.CONFLICT,
      [AvailabilityErrorCode.ALREADY_IN_WAITLIST]: HttpStatus.CONFLICT,
      [AvailabilityErrorCode.WAITLIST_ENTRY_NOT_FOUND]: HttpStatus.NOT_FOUND,
      [AvailabilityErrorCode.WAITLIST_EXPIRED]: HttpStatus.GONE,
      [AvailabilityErrorCode.WAITLIST_POSITION_INVALID]: HttpStatus.BAD_REQUEST,
      [AvailabilityErrorCode.WAITLIST_NOTIFICATION_FAILED]: HttpStatus.SERVICE_UNAVAILABLE,

      // Reassignment Errors
      [AvailabilityErrorCode.REASSIGNMENT_NOT_ALLOWED]: HttpStatus.FORBIDDEN,
      [AvailabilityErrorCode.TARGET_RESOURCE_UNAVAILABLE]: HttpStatus.CONFLICT,
      [AvailabilityErrorCode.REASSIGNMENT_DEADLINE_PASSED]: HttpStatus.FORBIDDEN,
      [AvailabilityErrorCode.REASSIGNMENT_REQUEST_NOT_FOUND]: HttpStatus.NOT_FOUND,
      [AvailabilityErrorCode.REASSIGNMENT_ALREADY_PROCESSED]: HttpStatus.CONFLICT,
      [AvailabilityErrorCode.INSUFFICIENT_PERMISSIONS_REASSIGN]: HttpStatus.FORBIDDEN,

      // Calendar Integration Errors
      [AvailabilityErrorCode.CALENDAR_SYNC_FAILED]: HttpStatus.SERVICE_UNAVAILABLE,
      [AvailabilityErrorCode.CALENDAR_NOT_CONFIGURED]: HttpStatus.BAD_REQUEST,
      [AvailabilityErrorCode.CALENDAR_CREDENTIALS_INVALID]: HttpStatus.UNAUTHORIZED,
      [AvailabilityErrorCode.CALENDAR_EVENT_NOT_FOUND]: HttpStatus.NOT_FOUND,
      [AvailabilityErrorCode.CALENDAR_QUOTA_EXCEEDED]: HttpStatus.TOO_MANY_REQUESTS,
      [AvailabilityErrorCode.EXTERNAL_CALENDAR_ERROR]: HttpStatus.BAD_GATEWAY,

      // Search and Query Errors
      [AvailabilityErrorCode.SEARCH_CRITERIA_INVALID]: HttpStatus.BAD_REQUEST,
      [AvailabilityErrorCode.DATE_RANGE_INVALID]: HttpStatus.BAD_REQUEST,
      [AvailabilityErrorCode.FILTER_PARAMETERS_INVALID]: HttpStatus.BAD_REQUEST,
      [AvailabilityErrorCode.SEARCH_TIMEOUT]: HttpStatus.REQUEST_TIMEOUT,
      [AvailabilityErrorCode.NO_RESULTS_FOUND]: HttpStatus.NOT_FOUND,

      // History and Audit Errors
      [AvailabilityErrorCode.HISTORY_NOT_FOUND]: HttpStatus.NOT_FOUND,
      [AvailabilityErrorCode.AUDIT_LOG_ERROR]: HttpStatus.INTERNAL_SERVER_ERROR,
      [AvailabilityErrorCode.HISTORY_ACCESS_DENIED]: HttpStatus.FORBIDDEN,
      [AvailabilityErrorCode.HISTORY_RETENTION_EXCEEDED]: HttpStatus.GONE,

      // General Errors
      [AvailabilityErrorCode.SERVICE_UNAVAILABLE]: HttpStatus.SERVICE_UNAVAILABLE,
      [AvailabilityErrorCode.RATE_LIMIT_EXCEEDED]: HttpStatus.TOO_MANY_REQUESTS,
      [AvailabilityErrorCode.VALIDATION_ERROR]: HttpStatus.BAD_REQUEST,
      [AvailabilityErrorCode.INTERNAL_ERROR]: HttpStatus.INTERNAL_SERVER_ERROR,
    };

    return statusMap[code] || HttpStatus.INTERNAL_SERVER_ERROR;
  }

  private sanitizeAvailabilityDetails(details: any): any {
    if (!details || typeof details !== 'object') {
      return details;
    }

    const sanitized = { ...details };
    
    // Remove or mask sensitive information
    const sensitiveFields = [
      'password',
      'token',
      'secret',
      'key',
      'authorization',
      'cookie',
      'session',
    ];

    sensitiveFields.forEach(field => {
      if (sanitized[field]) {
        sanitized[field] = '[REDACTED]';
      }
    });

    // Sanitize nested objects
    Object.keys(sanitized).forEach(key => {
      if (typeof sanitized[key] === 'object' && sanitized[key] !== null) {
        sanitized[key] = this.sanitizeAvailabilityDetails(sanitized[key]);
      }
    });

    return sanitized;
  }

  private getHttpExceptionName(status: number): string {
    const statusNames: Record<number, string> = {
      400: 'BadRequestException',
      401: 'UnauthorizedException',
      403: 'ForbiddenException',
      404: 'NotFoundException',
      408: 'RequestTimeoutException',
      409: 'ConflictException',
      410: 'GoneException',
      429: 'TooManyRequestsException',
      500: 'InternalServerErrorException',
      502: 'BadGatewayException',
      503: 'ServiceUnavailableException',
    };

    return statusNames[status] || 'UnknownException';
  }
}
