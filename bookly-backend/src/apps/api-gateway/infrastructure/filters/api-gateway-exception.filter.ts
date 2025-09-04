import { ArgumentsHost, Catch, HttpStatus, Logger } from '@nestjs/common';
import { AllExceptionsFilter } from '@/libs/common/filters/all-exceptions.filter';
import { LoggingService } from '@/libs/logging/logging.service';

/**
 * API Gateway Exception Filter
 * 
 * Captures and translates errors from all microservices, ensuring:
 * - Consistent error format across all API Gateway endpoints
 * - Proper HTTP status code mapping
 * - Security-focused error sanitization 
 * - Centralized logging and monitoring
 * - WebSocket error handling integration
 */
@Catch()
export class ApiGatewayExceptionFilter extends AllExceptionsFilter {
  protected readonly logger = new Logger(ApiGatewayExceptionFilter.name);

  constructor(private readonly loggingService: LoggingService) {
    super();
  }

  catch(exception: unknown, host: ArgumentsHost): void {
    const contextType = host.getType();

    if (contextType === 'http') {
      this.handleHttpException(exception, host);
    } else if (contextType === 'ws') {
      this.handleWebSocketException(exception, host);
    } else {
      this.handleGenericException(exception, host);
    }
  }

  /**
   * Handle HTTP exceptions from REST API calls
   */
  private handleHttpException(exception: unknown, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const request = ctx.getRequest();
    const response = ctx.getResponse();

    // Detect if error comes from microservice call
    const isMicroserviceError = this.isMicroserviceError(exception);
    
    if (isMicroserviceError) {
      this.handleMicroserviceError(exception, request, response);
    } else {
      // Handle local API Gateway errors
      super.catch(exception, host);
    }
  }

  /**
   * Handle WebSocket exceptions from real-time operations
   */
  private handleWebSocketException(exception: unknown, host: ArgumentsHost): void {
    const client = host.switchToWs().getClient();
    
    this.logger.error('WebSocket error occurred:', {
      exception: exception instanceof Error ? exception.message : exception,
      clientId: client.id,
      userId: client.userId,
      timestamp: new Date().toISOString(),
    });

    // Send structured error to WebSocket client
    client.emit('error', {
      code: 'WS_ERROR',
      message: 'WebSocket operation failed',
      type: 'error',
      timestamp: new Date().toISOString(),
      connectionId: client.id,
    });

    // Log to monitoring systems
    this.loggingService.error('WebSocket Exception', {
      exception: exception instanceof Error ? exception.message : String(exception),
      clientId: client.id,
      userId: client.userId,
      context: 'ApiGatewayWebSocket',
    });
  }

  /**
   * Handle generic exceptions (RPC, etc.)
   */
  private handleGenericException(exception: unknown, host: ArgumentsHost): void {
    this.logger.error('Generic exception in API Gateway:', {
      exception: exception instanceof Error ? exception.message : exception,
      contextType: host.getType(),
      timestamp: new Date().toISOString(),
    });

    // Fallback to base exception handler
    super.catch(exception, host);
  }

  /**
   * Handle errors propagated from microservices
   */
  private handleMicroserviceError(exception: any, request: any, response: any): void {
    const errorData = this.extractMicroserviceErrorData(exception);
    const statusCode = this.mapErrorToHttpStatus(errorData);

    // Sanitize error for external consumption
    const sanitizedError = this.sanitizeErrorForResponse(errorData);

    // Create standardized API Gateway response
    const errorResponse = {
      success: false,
      error: {
        code: sanitizedError.code || 'GATEWAY_ERROR',
        message: sanitizedError.message || 'An error occurred while processing your request',
        type: sanitizedError.type || 'error',
        exception_code: sanitizedError.exception_code,
        http_code: statusCode,
        http_exception: this.getHttpExceptionName(statusCode),
        service: sanitizedError.service || 'api-gateway',
        details: this.shouldIncludeDetails() ? sanitizedError.details : undefined,
      },
      timestamp: new Date().toISOString(),
      path: request.url,
      method: request.method,
      requestId: request.headers['x-request-id'] || `gw-${Date.now()}`,
    };

    // Log error with full context
    this.logMicroserviceError(errorData, request, statusCode);

    response.status(statusCode).json(errorResponse);
  }

  /**
   * Extract error data from microservice exception
   */
  private extractMicroserviceErrorData(exception: any): any {
    // Handle different types of microservice errors
    if (exception?.response?.data?.error) {
      // Axios error from HTTP microservice call
      return {
        ...exception.response.data.error,
        service: this.extractServiceFromUrl(exception.config?.url),
        originalStatus: exception.response.status,
      };
    }

    if (exception?.error) {
      // Direct error object
      return exception.error;
    }

    if (exception?.message && exception?.code) {
      // Structured error
      return {
        code: exception.code,
        message: exception.message,
        type: exception.type || 'error',
        service: exception.service || 'unknown',
      };
    }

    // Fallback for unstructured errors
    return {
      code: 'UNKNOWN_MICROSERVICE_ERROR',
      message: exception instanceof Error ? exception.message : 'Unknown microservice error',
      type: 'error',
      service: 'unknown',
    };
  }

  /**
   * Map microservice error codes to HTTP status codes
   */
  private mapErrorToHttpStatus(errorData: any): number {
    const errorCode = errorData.code;
    const originalStatus = errorData.originalStatus;

    // Use original HTTP status if available and valid
    if (originalStatus && originalStatus >= 400 && originalStatus < 600) {
      return originalStatus;
    }

    // Map by error code patterns
    if (!errorCode) return HttpStatus.INTERNAL_SERVER_ERROR;

    // Authentication errors
    if (errorCode.includes('AUTH') || errorCode.includes('UNAUTHORIZED')) {
      return HttpStatus.UNAUTHORIZED;
    }

    // Permission errors
    if (errorCode.includes('FORBIDDEN') || errorCode.includes('PERMISSION')) {
      return HttpStatus.FORBIDDEN;
    }

    // Not found errors
    if (errorCode.includes('NOT_FOUND') || errorCode.includes('404')) {
      return HttpStatus.NOT_FOUND;
    }

    // Validation errors
    if (errorCode.includes('INVALID') || errorCode.includes('VALIDATION')) {
      return HttpStatus.BAD_REQUEST;
    }

    // Conflict errors
    if (errorCode.includes('CONFLICT') || errorCode.includes('DUPLICATE')) {
      return HttpStatus.CONFLICT;
    }

    // Rate limiting errors
    if (errorCode.includes('RATE_LIMIT') || errorCode.includes('TOO_MANY')) {
      return HttpStatus.TOO_MANY_REQUESTS;
    }

    // Service errors
    if (errorCode.includes('SERVICE') || errorCode.includes('SERVER')) {
      return HttpStatus.INTERNAL_SERVER_ERROR;
    }

    // Default to bad request for client errors, server error for others
    return errorCode.startsWith('4') ? HttpStatus.BAD_REQUEST : HttpStatus.INTERNAL_SERVER_ERROR;
  }

  /**
   * Sanitize error data for external response
   */
  private sanitizeErrorForResponse(errorData: any): any {
    const sanitized = { ...errorData };

    // Remove sensitive information
    delete sanitized.stack;
    delete sanitized.internalDetails;
    delete sanitized.systemError;
    delete sanitized.dbError;
    delete sanitized.secrets;
    delete sanitized.credentials;

    // Sanitize details if present
    if (sanitized.details) {
      sanitized.details = this.sanitizeErrorDetails(sanitized.details);
    }

    return sanitized;
  }

  /**
   * Sanitize error details object
   */
  private sanitizeErrorDetails(details: any): any {
    if (typeof details !== 'object' || details === null) {
      return details;
    }

    const sanitized = { ...details };
    const sensitiveKeys = ['password', 'token', 'secret', 'key', 'credential', 'authorization'];

    for (const key in sanitized) {
      if (sensitiveKeys.some(sensitive => key.toLowerCase().includes(sensitive))) {
        sanitized[key] = '[REDACTED]';
      }
    }

    return sanitized;
  }

  /**
   * Check if exception originates from microservice
   */
  private isMicroserviceError(exception: any): boolean {
    return !!(
      exception?.response?.data?.error ||
      exception?.error ||
      exception?.service ||
      (exception?.config?.url && exception?.response)
    );
  }

  /**
   * Extract service name from URL
   */
  private extractServiceFromUrl(url?: string): string {
    if (!url) return 'unknown';
    
    const servicePatterns = [
      /auth-service/,
      /availability-service/,
      /resources-service/,
      /reports-service/,
      /stockpile-service/,
    ];

    for (const pattern of servicePatterns) {
      if (pattern.test(url)) {
        return pattern.source.replace(/[-\\]/g, '');
      }
    }

    return 'unknown';
  }

  /**
   * Get HTTP exception class name
   */
  private getHttpExceptionName(statusCode: number): string {
    const statusMap: Record<number, string> = {
      400: 'BadRequestException',
      401: 'UnauthorizedException',
      403: 'ForbiddenException',
      404: 'NotFoundException',
      409: 'ConflictException',
      422: 'UnprocessableEntityException',
      429: 'ThrottlerException',
      500: 'InternalServerErrorException',
      502: 'BadGatewayException',
      503: 'ServiceUnavailableException',
    };

    return statusMap[statusCode] || 'HttpException';
  }

  /**
   * Determine if error details should be included in response
   */
  private shouldIncludeDetails(): boolean {
    return process.env.NODE_ENV === 'development' || process.env.INCLUDE_ERROR_DETAILS === 'true';
  }

  /**
   * Log microservice error with full context
   */
  private logMicroserviceError(errorData: any, request: any, statusCode: number): void {
    this.loggingService.error('Microservice Error via API Gateway', {
      error: errorData,
      request: {
        url: request.url,
        method: request.method,
        headers: this.sanitizeHeaders(request.headers),
        userId: request.user?.id,
        userEmail: request.user?.email,
      },
      response: {
        statusCode,
        timestamp: new Date().toISOString(),
      },
      service: errorData.service || 'unknown',
      context: 'ApiGatewayMicroserviceError',
    });
  }

  /**
   * Sanitize request headers for logging
   */
  private sanitizeHeaders(headers: any): any {
    const sanitized = { ...headers };
    const sensitiveHeaders = ['authorization', 'cookie', 'x-api-key'];

    for (const header of sensitiveHeaders) {
      if (sanitized[header]) {
        sanitized[header] = '[REDACTED]';
      }
    }

    return sanitized;
  }
}
