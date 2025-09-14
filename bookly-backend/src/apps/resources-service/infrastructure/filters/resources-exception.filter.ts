import { ArgumentsHost, Catch, HttpStatus, Logger } from '@nestjs/common';
import { 
  ResourcesErrorCode, 
  ResourcesException,
  ResourcesErrorMessages 
} from '../../domain/enums/resources-errors.enum';
import { AllExceptionsFilter } from '@libs/common/filters/all-exceptions.filter';
import { LoggingService } from '@libs/logging/logging.service';

@Catch()
export class ResourcesExceptionFilter extends AllExceptionsFilter {
  protected readonly logger = new Logger(ResourcesExceptionFilter.name);

  catch(exception: unknown, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const request = ctx.getRequest();
    const response = ctx.getResponse();

    // Handle specific ResourcesException
    if (exception instanceof ResourcesException) {
      const httpStatus = this.mapResourcesErrorToHttpStatus(exception.code);
      const sanitizedDetails = this.sanitizeResourcesDetails(exception.details);

      // Log with detailed context
      this.logger.error(
        `Resources Service Error - Code: ${exception.code}, Message: ${exception.message}`,
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
          code: `RSRC-${exception.code}`,
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

  private mapResourcesErrorToHttpStatus(code: ResourcesErrorCode): number {
    const statusMap: Record<ResourcesErrorCode, number> = {
      // Resource Management Errors
      [ResourcesErrorCode.RESOURCE_NOT_FOUND]: HttpStatus.NOT_FOUND,
      [ResourcesErrorCode.RESOURCE_ALREADY_EXISTS]: HttpStatus.CONFLICT,
      [ResourcesErrorCode.RESOURCE_IN_USE]: HttpStatus.CONFLICT,
      [ResourcesErrorCode.RESOURCE_INACTIVE]: HttpStatus.FORBIDDEN,
      [ResourcesErrorCode.RESOURCE_UNDER_MAINTENANCE]: HttpStatus.SERVICE_UNAVAILABLE,
      [ResourcesErrorCode.RESOURCE_CAPACITY_INVALID]: HttpStatus.BAD_REQUEST,
      [ResourcesErrorCode.RESOURCE_CODE_DUPLICATE]: HttpStatus.CONFLICT,
      [ResourcesErrorCode.RESOURCE_DELETION_DENIED]: HttpStatus.FORBIDDEN,
      [ResourcesErrorCode.RESOURCE_UPDATE_RESTRICTED]: HttpStatus.FORBIDDEN,
      [ResourcesErrorCode.RESOURCE_ASSOCIATION_ERROR]: HttpStatus.INTERNAL_SERVER_ERROR,

      // Category Management Errors
      [ResourcesErrorCode.CATEGORY_NOT_FOUND]: HttpStatus.NOT_FOUND,
      [ResourcesErrorCode.CATEGORY_ALREADY_EXISTS]: HttpStatus.CONFLICT,
      [ResourcesErrorCode.CATEGORY_IN_USE]: HttpStatus.CONFLICT,
      [ResourcesErrorCode.CATEGORY_HIERARCHY_INVALID]: HttpStatus.BAD_REQUEST,
      [ResourcesErrorCode.CATEGORY_ASSIGNMENT_FAILED]: HttpStatus.INTERNAL_SERVER_ERROR,
      [ResourcesErrorCode.CATEGORY_DELETION_DENIED]: HttpStatus.FORBIDDEN,
      [ResourcesErrorCode.PARENT_CATEGORY_NOT_FOUND]: HttpStatus.NOT_FOUND,
      [ResourcesErrorCode.CIRCULAR_CATEGORY_REFERENCE]: HttpStatus.BAD_REQUEST,

      // Import/Export Errors
      [ResourcesErrorCode.IMPORT_FILE_INVALID]: HttpStatus.BAD_REQUEST,
      [ResourcesErrorCode.IMPORT_FORMAT_UNSUPPORTED]: HttpStatus.UNSUPPORTED_MEDIA_TYPE,
      [ResourcesErrorCode.IMPORT_DATA_VALIDATION_FAILED]: HttpStatus.BAD_REQUEST,
      [ResourcesErrorCode.IMPORT_DUPLICATE_ENTRIES]: HttpStatus.CONFLICT,
      [ResourcesErrorCode.IMPORT_SIZE_EXCEEDED]: HttpStatus.PAYLOAD_TOO_LARGE,
      [ResourcesErrorCode.IMPORT_PROCESSING_ERROR]: HttpStatus.INTERNAL_SERVER_ERROR,
      [ResourcesErrorCode.EXPORT_GENERATION_FAILED]: HttpStatus.INTERNAL_SERVER_ERROR,
      [ResourcesErrorCode.EXPORT_FILE_TOO_LARGE]: HttpStatus.PAYLOAD_TOO_LARGE,
      [ResourcesErrorCode.IMPORT_TEMPLATE_INVALID]: HttpStatus.BAD_REQUEST,

      // Maintenance Errors
      [ResourcesErrorCode.MAINTENANCE_NOT_FOUND]: HttpStatus.NOT_FOUND,
      [ResourcesErrorCode.MAINTENANCE_SCHEDULE_CONFLICT]: HttpStatus.CONFLICT,
      [ResourcesErrorCode.MAINTENANCE_IN_PROGRESS]: HttpStatus.CONFLICT,
      [ResourcesErrorCode.MAINTENANCE_ALREADY_COMPLETED]: HttpStatus.CONFLICT,
      [ResourcesErrorCode.MAINTENANCE_TYPE_INVALID]: HttpStatus.BAD_REQUEST,
      [ResourcesErrorCode.MAINTENANCE_ASSIGNMENT_FAILED]: HttpStatus.INTERNAL_SERVER_ERROR,
      [ResourcesErrorCode.MAINTENANCE_DATE_INVALID]: HttpStatus.BAD_REQUEST,
      [ResourcesErrorCode.MAINTENANCE_CANCELLATION_DENIED]: HttpStatus.FORBIDDEN,
      [ResourcesErrorCode.MAINTENANCE_RECURRING_ERROR]: HttpStatus.INTERNAL_SERVER_ERROR,

      // Program Association Errors
      [ResourcesErrorCode.PROGRAM_NOT_FOUND]: HttpStatus.NOT_FOUND,
      [ResourcesErrorCode.PROGRAM_ASSOCIATION_EXISTS]: HttpStatus.CONFLICT,
      [ResourcesErrorCode.PROGRAM_ACCESS_DENIED]: HttpStatus.FORBIDDEN,
      [ResourcesErrorCode.PROGRAM_RESOURCE_LIMIT_EXCEEDED]: HttpStatus.BAD_REQUEST,
      [ResourcesErrorCode.PROGRAM_RESTRICTION_VIOLATION]: HttpStatus.FORBIDDEN,
      [ResourcesErrorCode.PROGRAM_ASSIGNMENT_FAILED]: HttpStatus.INTERNAL_SERVER_ERROR,

      // Equipment & Attributes Errors
      [ResourcesErrorCode.EQUIPMENT_NOT_FOUND]: HttpStatus.NOT_FOUND,
      [ResourcesErrorCode.EQUIPMENT_INCOMPATIBLE]: HttpStatus.CONFLICT,
      [ResourcesErrorCode.EQUIPMENT_ASSIGNMENT_FAILED]: HttpStatus.INTERNAL_SERVER_ERROR,
      [ResourcesErrorCode.ATTRIBUTE_INVALID]: HttpStatus.BAD_REQUEST,
      [ResourcesErrorCode.ATTRIBUTE_REQUIRED_MISSING]: HttpStatus.BAD_REQUEST,
      [ResourcesErrorCode.ATTRIBUTE_VALUE_INVALID]: HttpStatus.BAD_REQUEST,
      [ResourcesErrorCode.EQUIPMENT_CAPACITY_EXCEEDED]: HttpStatus.BAD_REQUEST,

      // Location & Building Errors
      [ResourcesErrorCode.BUILDING_NOT_FOUND]: HttpStatus.NOT_FOUND,
      [ResourcesErrorCode.FLOOR_INVALID]: HttpStatus.BAD_REQUEST,
      [ResourcesErrorCode.ROOM_NOT_FOUND]: HttpStatus.NOT_FOUND,
      [ResourcesErrorCode.LOCATION_ASSIGNMENT_FAILED]: HttpStatus.INTERNAL_SERVER_ERROR,
      [ResourcesErrorCode.BUILDING_CAPACITY_EXCEEDED]: HttpStatus.BAD_REQUEST,
      [ResourcesErrorCode.LOCATION_COORDINATES_INVALID]: HttpStatus.BAD_REQUEST,

      // Permission & Access Errors
      [ResourcesErrorCode.INSUFFICIENT_PERMISSIONS]: HttpStatus.FORBIDDEN,
      [ResourcesErrorCode.RESOURCE_ACCESS_DENIED]: HttpStatus.FORBIDDEN,
      [ResourcesErrorCode.MODIFICATION_NOT_ALLOWED]: HttpStatus.FORBIDDEN,
      [ResourcesErrorCode.ADMIN_PRIVILEGES_REQUIRED]: HttpStatus.FORBIDDEN,
      [ResourcesErrorCode.RESOURCE_LOCKED]: HttpStatus.CONFLICT,
      [ResourcesErrorCode.UNAUTHORIZED_OPERATION]: HttpStatus.FORBIDDEN,

      // Search & Query Errors
      [ResourcesErrorCode.SEARCH_CRITERIA_INVALID]: HttpStatus.BAD_REQUEST,
      [ResourcesErrorCode.FILTER_PARAMETERS_INVALID]: HttpStatus.BAD_REQUEST,
      [ResourcesErrorCode.SEARCH_TIMEOUT]: HttpStatus.REQUEST_TIMEOUT,
      [ResourcesErrorCode.NO_RESULTS_FOUND]: HttpStatus.NOT_FOUND,
      [ResourcesErrorCode.QUERY_TOO_COMPLEX]: HttpStatus.BAD_REQUEST,
      [ResourcesErrorCode.SEARCH_INDEX_ERROR]: HttpStatus.INTERNAL_SERVER_ERROR,

      // General Errors
      [ResourcesErrorCode.SERVICE_UNAVAILABLE]: HttpStatus.SERVICE_UNAVAILABLE,
      [ResourcesErrorCode.RATE_LIMIT_EXCEEDED]: HttpStatus.TOO_MANY_REQUESTS,
      [ResourcesErrorCode.VALIDATION_ERROR]: HttpStatus.BAD_REQUEST,
      [ResourcesErrorCode.INTERNAL_ERROR]: HttpStatus.INTERNAL_SERVER_ERROR,
    };

    return statusMap[code] || HttpStatus.INTERNAL_SERVER_ERROR;
  }

  private sanitizeResourcesDetails(details: any): any {
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
    ];

    sensitiveFields.forEach(field => {
      if (sanitized[field]) {
        sanitized[field] = '[REDACTED]';
      }
    });

    // Sanitize nested objects
    Object.keys(sanitized).forEach(key => {
      if (typeof sanitized[key] === 'object' && sanitized[key] !== null) {
        sanitized[key] = this.sanitizeResourcesDetails(sanitized[key]);
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
      409: 'ConflictException',
      413: 'PayloadTooLargeException',
      500: 'InternalServerErrorException',
    };

    return statusNames[status] || 'UnknownException';
  }
}
