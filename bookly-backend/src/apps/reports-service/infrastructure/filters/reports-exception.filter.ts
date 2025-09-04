import { ArgumentsHost, Catch, HttpStatus, Logger } from '@nestjs/common';
import { AllExceptionsFilter } from '@/libs/common/filters/all-exceptions.filter';
import { 
  ReportsErrorCode, 
  ReportsException,
  ReportsErrorMessages 
} from '../../domain/enums/reports-errors.enum';

@Catch()
export class ReportsExceptionFilter extends AllExceptionsFilter {
  protected readonly logger = new Logger(ReportsExceptionFilter.name);

  catch(exception: unknown, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const request = ctx.getRequest();
    const response = ctx.getResponse();

    // Handle specific ReportsException
    if (exception instanceof ReportsException) {
      const httpStatus = this.mapReportsErrorToHttpStatus(exception.code);
      const sanitizedDetails = this.sanitizeReportsDetails(exception.details);

      // Log with detailed context
      this.logger.error(
        `Reports Service Error - Code: ${exception.code}, Message: ${exception.message}`,
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
          code: `RPTS-${exception.code}`,
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

  private mapReportsErrorToHttpStatus(code: ReportsErrorCode): number {
    const statusMap: Record<ReportsErrorCode, number> = {
      // Report Generation Errors
      [ReportsErrorCode.REPORT_NOT_FOUND]: HttpStatus.NOT_FOUND,
      [ReportsErrorCode.REPORT_GENERATION_FAILED]: HttpStatus.INTERNAL_SERVER_ERROR,
      [ReportsErrorCode.REPORT_TYPE_INVALID]: HttpStatus.BAD_REQUEST,
      [ReportsErrorCode.REPORT_PARAMETERS_INVALID]: HttpStatus.BAD_REQUEST,
      [ReportsErrorCode.REPORT_DATA_INSUFFICIENT]: HttpStatus.NO_CONTENT,
      [ReportsErrorCode.REPORT_TIMEOUT]: HttpStatus.REQUEST_TIMEOUT,
      [ReportsErrorCode.REPORT_SIZE_EXCEEDED]: HttpStatus.PAYLOAD_TOO_LARGE,
      [ReportsErrorCode.REPORT_TEMPLATE_NOT_FOUND]: HttpStatus.NOT_FOUND,
      [ReportsErrorCode.REPORT_ALREADY_PROCESSING]: HttpStatus.CONFLICT,
      [ReportsErrorCode.REPORT_ACCESS_DENIED]: HttpStatus.FORBIDDEN,

      // Export Errors
      [ReportsErrorCode.EXPORT_FORMAT_UNSUPPORTED]: HttpStatus.UNSUPPORTED_MEDIA_TYPE,
      [ReportsErrorCode.EXPORT_GENERATION_FAILED]: HttpStatus.INTERNAL_SERVER_ERROR,
      [ReportsErrorCode.EXPORT_FILE_TOO_LARGE]: HttpStatus.PAYLOAD_TOO_LARGE,
      [ReportsErrorCode.EXPORT_QUEUE_FULL]: HttpStatus.SERVICE_UNAVAILABLE,
      [ReportsErrorCode.EXPORT_NOT_FOUND]: HttpStatus.NOT_FOUND,
      [ReportsErrorCode.EXPORT_EXPIRED]: HttpStatus.GONE,
      [ReportsErrorCode.EXPORT_DOWNLOAD_FAILED]: HttpStatus.INTERNAL_SERVER_ERROR,
      [ReportsErrorCode.EXPORT_PERMISSION_DENIED]: HttpStatus.FORBIDDEN,
      [ReportsErrorCode.EXPORT_QUOTA_EXCEEDED]: HttpStatus.TOO_MANY_REQUESTS,

      // Dashboard Errors
      [ReportsErrorCode.DASHBOARD_NOT_FOUND]: HttpStatus.NOT_FOUND,
      [ReportsErrorCode.DASHBOARD_CONFIG_INVALID]: HttpStatus.BAD_REQUEST,
      [ReportsErrorCode.DASHBOARD_WIDGET_ERROR]: HttpStatus.INTERNAL_SERVER_ERROR,
      [ReportsErrorCode.DASHBOARD_DATA_REFRESH_FAILED]: HttpStatus.INTERNAL_SERVER_ERROR,
      [ReportsErrorCode.DASHBOARD_PERMISSION_DENIED]: HttpStatus.FORBIDDEN,
      [ReportsErrorCode.DASHBOARD_CUSTOMIZATION_FAILED]: HttpStatus.INTERNAL_SERVER_ERROR,
      [ReportsErrorCode.DASHBOARD_METRICS_UNAVAILABLE]: HttpStatus.SERVICE_UNAVAILABLE,
      [ReportsErrorCode.REAL_TIME_DATA_ERROR]: HttpStatus.SERVICE_UNAVAILABLE,

      // Feedback System Errors
      [ReportsErrorCode.FEEDBACK_NOT_FOUND]: HttpStatus.NOT_FOUND,
      [ReportsErrorCode.FEEDBACK_SUBMISSION_FAILED]: HttpStatus.INTERNAL_SERVER_ERROR,
      [ReportsErrorCode.FEEDBACK_RATING_INVALID]: HttpStatus.BAD_REQUEST,
      [ReportsErrorCode.FEEDBACK_ALREADY_SUBMITTED]: HttpStatus.CONFLICT,
      [ReportsErrorCode.FEEDBACK_PERMISSION_DENIED]: HttpStatus.FORBIDDEN,
      [ReportsErrorCode.FEEDBACK_RESOURCE_NOT_FOUND]: HttpStatus.NOT_FOUND,
      [ReportsErrorCode.FEEDBACK_AGGREGATION_ERROR]: HttpStatus.INTERNAL_SERVER_ERROR,
      [ReportsErrorCode.FEEDBACK_MODERATION_REQUIRED]: HttpStatus.ACCEPTED,

      // Usage Analytics Errors
      [ReportsErrorCode.USAGE_DATA_NOT_FOUND]: HttpStatus.NOT_FOUND,
      [ReportsErrorCode.USAGE_ANALYTICS_FAILED]: HttpStatus.INTERNAL_SERVER_ERROR,
      [ReportsErrorCode.DATE_RANGE_INVALID]: HttpStatus.BAD_REQUEST,
      [ReportsErrorCode.PROGRAM_FILTER_INVALID]: HttpStatus.BAD_REQUEST,
      [ReportsErrorCode.RESOURCE_FILTER_INVALID]: HttpStatus.BAD_REQUEST,
      [ReportsErrorCode.ANALYTICS_AGGREGATION_ERROR]: HttpStatus.INTERNAL_SERVER_ERROR,
      [ReportsErrorCode.USAGE_METRICS_UNAVAILABLE]: HttpStatus.SERVICE_UNAVAILABLE,
      [ReportsErrorCode.HISTORICAL_DATA_INCOMPLETE]: HttpStatus.PARTIAL_CONTENT,

      // User Reports Errors
      [ReportsErrorCode.USER_REPORT_NOT_FOUND]: HttpStatus.NOT_FOUND,
      [ReportsErrorCode.USER_STATS_UNAVAILABLE]: HttpStatus.SERVICE_UNAVAILABLE,
      [ReportsErrorCode.USER_PERMISSION_DENIED]: HttpStatus.FORBIDDEN,
      [ReportsErrorCode.USER_DATA_PRIVACY_VIOLATION]: HttpStatus.FORBIDDEN,
      [ReportsErrorCode.USER_REPORT_GENERATION_FAILED]: HttpStatus.INTERNAL_SERVER_ERROR,
      [ReportsErrorCode.PERSONAL_DATA_ACCESS_DENIED]: HttpStatus.FORBIDDEN,
      [ReportsErrorCode.USER_ACTIVITY_NOT_FOUND]: HttpStatus.NOT_FOUND,

      // Demand Analysis Errors
      [ReportsErrorCode.DEMAND_ANALYSIS_FAILED]: HttpStatus.INTERNAL_SERVER_ERROR,
      [ReportsErrorCode.DEMAND_DATA_INSUFFICIENT]: HttpStatus.NO_CONTENT,
      [ReportsErrorCode.DEMAND_FORECAST_ERROR]: HttpStatus.INTERNAL_SERVER_ERROR,
      [ReportsErrorCode.CAPACITY_ANALYSIS_FAILED]: HttpStatus.INTERNAL_SERVER_ERROR,
      [ReportsErrorCode.OPTIMIZATION_SUGGESTIONS_FAILED]: HttpStatus.INTERNAL_SERVER_ERROR,
      [ReportsErrorCode.UNSATISFIED_DEMAND_CALCULATION_ERROR]: HttpStatus.INTERNAL_SERVER_ERROR,
      [ReportsErrorCode.DEMAND_TRENDS_UNAVAILABLE]: HttpStatus.SERVICE_UNAVAILABLE,

      // Data Processing Errors
      [ReportsErrorCode.DATA_AGGREGATION_FAILED]: HttpStatus.INTERNAL_SERVER_ERROR,
      [ReportsErrorCode.DATA_SOURCE_UNAVAILABLE]: HttpStatus.SERVICE_UNAVAILABLE,
      [ReportsErrorCode.DATA_INTEGRITY_ERROR]: HttpStatus.INTERNAL_SERVER_ERROR,
      [ReportsErrorCode.DATA_TRANSFORMATION_FAILED]: HttpStatus.INTERNAL_SERVER_ERROR,
      [ReportsErrorCode.DATA_CACHE_ERROR]: HttpStatus.INTERNAL_SERVER_ERROR,
      [ReportsErrorCode.DATA_SYNCHRONIZATION_FAILED]: HttpStatus.INTERNAL_SERVER_ERROR,
      [ReportsErrorCode.DATA_QUERY_TIMEOUT]: HttpStatus.REQUEST_TIMEOUT,
      [ReportsErrorCode.DATA_VOLUME_EXCEEDED]: HttpStatus.PAYLOAD_TOO_LARGE,

      // Permissions & Access Errors
      [ReportsErrorCode.INSUFFICIENT_PERMISSIONS]: HttpStatus.FORBIDDEN,
      [ReportsErrorCode.REPORT_ACCESS_DENIED_ERROR]: HttpStatus.FORBIDDEN,
      [ReportsErrorCode.PROGRAM_ACCESS_RESTRICTED]: HttpStatus.FORBIDDEN,
      [ReportsErrorCode.USER_DATA_ACCESS_DENIED]: HttpStatus.FORBIDDEN,
      [ReportsErrorCode.ADMIN_PRIVILEGES_REQUIRED]: HttpStatus.FORBIDDEN,
      [ReportsErrorCode.CROSS_PROGRAM_ACCESS_DENIED]: HttpStatus.FORBIDDEN,
      [ReportsErrorCode.SENSITIVE_DATA_ACCESS_DENIED]: HttpStatus.FORBIDDEN,

      // General Errors
      [ReportsErrorCode.SERVICE_UNAVAILABLE]: HttpStatus.SERVICE_UNAVAILABLE,
      [ReportsErrorCode.RATE_LIMIT_EXCEEDED]: HttpStatus.TOO_MANY_REQUESTS,
      [ReportsErrorCode.VALIDATION_ERROR]: HttpStatus.BAD_REQUEST,
      [ReportsErrorCode.INTERNAL_ERROR]: HttpStatus.INTERNAL_SERVER_ERROR,
    };

    return statusMap[code] || HttpStatus.INTERNAL_SERVER_ERROR;
  }

  private sanitizeReportsDetails(details: any): any {
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
      'apiKey',
      'accessKey',
      'email',
      'personalData',
    ];

    sensitiveFields.forEach(field => {
      if (sanitized[field]) {
        sanitized[field] = '[REDACTED]';
      }
    });

    // Sanitize nested objects
    Object.keys(sanitized).forEach(key => {
      if (typeof sanitized[key] === 'object' && sanitized[key] !== null) {
        sanitized[key] = this.sanitizeReportsDetails(sanitized[key]);
      }
    });

    return sanitized;
  }

  private getHttpExceptionName(status: number): string {
    const statusNames: Record<number, string> = {
      204: 'NoContentException',
      400: 'BadRequestException',
      401: 'UnauthorizedException',
      403: 'ForbiddenException',
      404: 'NotFoundException',
      408: 'RequestTimeoutException',
      409: 'ConflictException',
      413: 'PayloadTooLargeException',
      500: 'InternalServerErrorException',
      503: 'ServiceUnavailableException',
    };

    return statusNames[status] || 'UnknownException';
  }
}
