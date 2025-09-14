import { ArgumentsHost, Catch, HttpStatus, Logger } from '@nestjs/common';
import { 
  StockpileErrorCode, 
  StockpileException,
  StockpileErrorMessages 
} from '@apps/stockpile-service/domain/enums/stockpile-errors.enum';
import { AllExceptionsFilter } from '@libs/common/filters/all-exceptions.filter';

@Catch()
export class StockpileExceptionFilter extends AllExceptionsFilter {
  protected readonly logger = new Logger(StockpileExceptionFilter.name);

  catch(exception: unknown, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const request = ctx.getRequest();
    const response = ctx.getResponse();

    // Handle specific StockpileException
    if (exception instanceof StockpileException) {
      const httpStatus = this.mapStockpileErrorToHttpStatus(exception.code);
      const sanitizedDetails = this.sanitizeStockpileDetails(exception.details);

      // Log with detailed context
      this.logger.error(
        `Stockpile Service Error - Code: ${exception.code}, Message: ${exception.message}`,
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
          code: `STKP-${exception.code}`,
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

  private mapStockpileErrorToHttpStatus(code: StockpileErrorCode): number {
    const statusMap: Record<StockpileErrorCode, number> = {
      // Approval Flow Errors
      [StockpileErrorCode.APPROVAL_FLOW_NOT_FOUND]: HttpStatus.NOT_FOUND,
      [StockpileErrorCode.APPROVAL_FLOW_ALREADY_EXISTS]: HttpStatus.CONFLICT,
      [StockpileErrorCode.APPROVAL_FLOW_INACTIVE]: HttpStatus.FORBIDDEN,
      [StockpileErrorCode.APPROVAL_STEP_NOT_FOUND]: HttpStatus.NOT_FOUND,
      [StockpileErrorCode.APPROVAL_STEP_INVALID]: HttpStatus.BAD_REQUEST,
      [StockpileErrorCode.APPROVAL_FLOW_CIRCULAR_DEPENDENCY]: HttpStatus.BAD_REQUEST,
      [StockpileErrorCode.APPROVAL_FLOW_CONFIGURATION_INVALID]: HttpStatus.BAD_REQUEST,
      [StockpileErrorCode.APPROVAL_FLOW_ASSIGNMENT_FAILED]: HttpStatus.INTERNAL_SERVER_ERROR,
      [StockpileErrorCode.APPROVAL_FLOW_DELETION_DENIED]: HttpStatus.FORBIDDEN,
      [StockpileErrorCode.APPROVAL_FLOW_LOCKED]: HttpStatus.CONFLICT,

      // Request Validation Errors
      [StockpileErrorCode.REQUEST_NOT_FOUND]: HttpStatus.NOT_FOUND,
      [StockpileErrorCode.REQUEST_ALREADY_PROCESSED]: HttpStatus.CONFLICT,
      [StockpileErrorCode.REQUEST_VALIDATION_FAILED]: HttpStatus.BAD_REQUEST,
      [StockpileErrorCode.REQUEST_EXPIRED]: HttpStatus.GONE,
      [StockpileErrorCode.REQUEST_CANCELLED]: HttpStatus.GONE,
      [StockpileErrorCode.REQUEST_APPROVAL_PENDING]: HttpStatus.ACCEPTED,
      [StockpileErrorCode.REQUEST_REJECTION_REASON_REQUIRED]: HttpStatus.BAD_REQUEST,
      [StockpileErrorCode.REQUEST_MODIFICATION_NOT_ALLOWED]: HttpStatus.FORBIDDEN,
      [StockpileErrorCode.REQUEST_SUBMISSION_FAILED]: HttpStatus.INTERNAL_SERVER_ERROR,
      [StockpileErrorCode.REQUEST_DUPLICATE]: HttpStatus.CONFLICT,

      // Approval Decision Errors
      [StockpileErrorCode.APPROVAL_DECISION_NOT_FOUND]: HttpStatus.NOT_FOUND,
      [StockpileErrorCode.APPROVAL_DECISION_ALREADY_MADE]: HttpStatus.CONFLICT,
      [StockpileErrorCode.APPROVAL_DECISION_INVALID]: HttpStatus.BAD_REQUEST,
      [StockpileErrorCode.APPROVER_NOT_AUTHORIZED]: HttpStatus.FORBIDDEN,
      [StockpileErrorCode.APPROVER_CONFLICT_OF_INTEREST]: HttpStatus.CONFLICT,
      [StockpileErrorCode.APPROVAL_DEADLINE_EXCEEDED]: HttpStatus.GONE,
      [StockpileErrorCode.APPROVAL_HIERARCHY_VIOLATION]: HttpStatus.FORBIDDEN,
      [StockpileErrorCode.APPROVAL_CRITERIA_NOT_MET]: HttpStatus.BAD_REQUEST,
      [StockpileErrorCode.CONDITIONAL_APPROVAL_REQUIREMENTS_NOT_MET]: HttpStatus.BAD_REQUEST,

      // Document Generation Errors
      [StockpileErrorCode.DOCUMENT_TEMPLATE_NOT_FOUND]: HttpStatus.NOT_FOUND,
      [StockpileErrorCode.DOCUMENT_GENERATION_FAILED]: HttpStatus.INTERNAL_SERVER_ERROR,
      [StockpileErrorCode.DOCUMENT_TEMPLATE_INVALID]: HttpStatus.BAD_REQUEST,
      [StockpileErrorCode.DOCUMENT_DATA_INCOMPLETE]: HttpStatus.BAD_REQUEST,
      [StockpileErrorCode.DOCUMENT_SIZE_EXCEEDED]: HttpStatus.PAYLOAD_TOO_LARGE,
      [StockpileErrorCode.DOCUMENT_FORMAT_UNSUPPORTED]: HttpStatus.UNSUPPORTED_MEDIA_TYPE,
      [StockpileErrorCode.DOCUMENT_SIGNATURE_FAILED]: HttpStatus.INTERNAL_SERVER_ERROR,
      [StockpileErrorCode.DOCUMENT_DELIVERY_FAILED]: HttpStatus.SERVICE_UNAVAILABLE,
      [StockpileErrorCode.DOCUMENT_ACCESS_DENIED]: HttpStatus.FORBIDDEN,
      [StockpileErrorCode.DOCUMENT_ALREADY_GENERATED]: HttpStatus.CONFLICT,

      // Notification Errors
      [StockpileErrorCode.NOTIFICATION_TEMPLATE_NOT_FOUND]: HttpStatus.NOT_FOUND,
      [StockpileErrorCode.NOTIFICATION_SEND_FAILED]: HttpStatus.SERVICE_UNAVAILABLE,
      [StockpileErrorCode.NOTIFICATION_CHANNEL_UNAVAILABLE]: HttpStatus.SERVICE_UNAVAILABLE,
      [StockpileErrorCode.NOTIFICATION_RECIPIENT_INVALID]: HttpStatus.BAD_REQUEST,
      [StockpileErrorCode.NOTIFICATION_QUOTA_EXCEEDED]: HttpStatus.TOO_MANY_REQUESTS,
      [StockpileErrorCode.NOTIFICATION_CONFIGURATION_INVALID]: HttpStatus.BAD_REQUEST,
      [StockpileErrorCode.EMAIL_SERVICE_UNAVAILABLE]: HttpStatus.SERVICE_UNAVAILABLE,
      [StockpileErrorCode.SMS_SERVICE_UNAVAILABLE]: HttpStatus.SERVICE_UNAVAILABLE,
      [StockpileErrorCode.WHATSAPP_SERVICE_UNAVAILABLE]: HttpStatus.SERVICE_UNAVAILABLE,
      [StockpileErrorCode.NOTIFICATION_DELIVERY_CONFIRMATION_FAILED]: HttpStatus.SERVICE_UNAVAILABLE,

      // Security Validation Errors
      [StockpileErrorCode.SECURITY_CHECK_FAILED]: HttpStatus.FORBIDDEN,
      [StockpileErrorCode.ACCESS_CONTROL_VIOLATION]: HttpStatus.FORBIDDEN,
      [StockpileErrorCode.VIGILANTE_VERIFICATION_FAILED]: HttpStatus.FORBIDDEN,
      [StockpileErrorCode.QR_CODE_INVALID]: HttpStatus.BAD_REQUEST,
      [StockpileErrorCode.QR_CODE_EXPIRED]: HttpStatus.GONE,
      [StockpileErrorCode.CHECK_IN_FAILED]: HttpStatus.INTERNAL_SERVER_ERROR,
      [StockpileErrorCode.CHECK_OUT_FAILED]: HttpStatus.INTERNAL_SERVER_ERROR,
      [StockpileErrorCode.VIGILANTE_NOT_AUTHORIZED]: HttpStatus.FORBIDDEN,
      [StockpileErrorCode.SECURITY_CLEARANCE_INSUFFICIENT]: HttpStatus.FORBIDDEN,
      [StockpileErrorCode.BIOMETRIC_VERIFICATION_FAILED]: HttpStatus.FORBIDDEN,

      // Workflow Engine Errors
      [StockpileErrorCode.WORKFLOW_NOT_FOUND]: HttpStatus.NOT_FOUND,
      [StockpileErrorCode.WORKFLOW_EXECUTION_FAILED]: HttpStatus.INTERNAL_SERVER_ERROR,
      [StockpileErrorCode.WORKFLOW_STATE_INVALID]: HttpStatus.CONFLICT,
      [StockpileErrorCode.WORKFLOW_TRANSITION_NOT_ALLOWED]: HttpStatus.FORBIDDEN,
      [StockpileErrorCode.WORKFLOW_CONDITION_NOT_MET]: HttpStatus.BAD_REQUEST,
      [StockpileErrorCode.WORKFLOW_TIMEOUT]: HttpStatus.REQUEST_TIMEOUT,
      [StockpileErrorCode.WORKFLOW_ROLLBACK_FAILED]: HttpStatus.INTERNAL_SERVER_ERROR,
      [StockpileErrorCode.WORKFLOW_PARALLEL_EXECUTION_ERROR]: HttpStatus.INTERNAL_SERVER_ERROR,
      [StockpileErrorCode.WORKFLOW_COMPENSATION_FAILED]: HttpStatus.INTERNAL_SERVER_ERROR,

      // Integration Errors
      [StockpileErrorCode.EXTERNAL_SYSTEM_INTEGRATION_FAILED]: HttpStatus.SERVICE_UNAVAILABLE,
      [StockpileErrorCode.API_RATE_LIMIT_EXCEEDED]: HttpStatus.TOO_MANY_REQUESTS,
      [StockpileErrorCode.THIRD_PARTY_SERVICE_UNAVAILABLE]: HttpStatus.SERVICE_UNAVAILABLE,
      [StockpileErrorCode.DATA_SYNCHRONIZATION_FAILED]: HttpStatus.INTERNAL_SERVER_ERROR,
      [StockpileErrorCode.WEBHOOK_DELIVERY_FAILED]: HttpStatus.SERVICE_UNAVAILABLE,
      [StockpileErrorCode.MESSAGE_QUEUE_ERROR]: HttpStatus.INTERNAL_SERVER_ERROR,
      [StockpileErrorCode.EVENT_PROCESSING_FAILED]: HttpStatus.INTERNAL_SERVER_ERROR,
      [StockpileErrorCode.CALLBACK_URL_INVALID]: HttpStatus.BAD_REQUEST,

      // Configuration Errors
      [StockpileErrorCode.CONFIGURATION_NOT_FOUND]: HttpStatus.NOT_FOUND,
      [StockpileErrorCode.CONFIGURATION_INVALID]: HttpStatus.BAD_REQUEST,
      [StockpileErrorCode.PARAMETER_MISSING]: HttpStatus.BAD_REQUEST,
      [StockpileErrorCode.PARAMETER_INVALID]: HttpStatus.BAD_REQUEST,
      [StockpileErrorCode.ENVIRONMENT_CONFIGURATION_ERROR]: HttpStatus.INTERNAL_SERVER_ERROR,
      [StockpileErrorCode.FEATURE_FLAG_DISABLED]: HttpStatus.SERVICE_UNAVAILABLE,
      [StockpileErrorCode.SYSTEM_MAINTENANCE_MODE]: HttpStatus.SERVICE_UNAVAILABLE,
      [StockpileErrorCode.CONFIGURATION_UPDATE_FAILED]: HttpStatus.INTERNAL_SERVER_ERROR,

      // General Errors
      [StockpileErrorCode.SERVICE_UNAVAILABLE]: HttpStatus.SERVICE_UNAVAILABLE,
      [StockpileErrorCode.RATE_LIMIT_EXCEEDED]: HttpStatus.TOO_MANY_REQUESTS,
      [StockpileErrorCode.VALIDATION_ERROR]: HttpStatus.BAD_REQUEST,
      [StockpileErrorCode.INTERNAL_ERROR]: HttpStatus.INTERNAL_SERVER_ERROR,
    };

    return statusMap[code] || HttpStatus.INTERNAL_SERVER_ERROR;
  }

  private sanitizeStockpileDetails(details: any): any {
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
      'phone',
      'email',
      'personalData',
      'approverSignature',
      'digitalSignature',
    ];

    sensitiveFields.forEach(field => {
      if (sanitized[field]) {
        sanitized[field] = '[REDACTED]';
      }
    });

    // Sanitize nested objects
    Object.keys(sanitized).forEach(key => {
      if (typeof sanitized[key] === 'object' && sanitized[key] !== null) {
        sanitized[key] = this.sanitizeStockpileDetails(sanitized[key]);
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
      500: 'InternalServerErrorException',
      503: 'ServiceUnavailableException',
    };

    return statusNames[status] || 'UnknownException';
  }
}
