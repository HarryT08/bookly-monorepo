import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { AuthErrorCode, AuthErrorMessages, AuthException } from '../../domain/enums/auth-errors.enum';
import { AllExceptionsFilter, ErrorResponse } from '@/libs/common/filters/all-exceptions.filter';

/**
 * Auth Service Exception Filter
 * Extends the AllExceptionsFilter to handle auth-specific exceptions
 */
@Catch()
export class AuthExceptionFilter extends AllExceptionsFilter {
  protected readonly logger = new Logger(AuthExceptionFilter.name);

  catch(exception: unknown, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    if (exception instanceof AuthException) {
      const status = this.mapAuthErrorToHttpStatus(exception.code);
      
      const errorResponse: ErrorResponse = {
        success: false,
        error: {
          code: exception.code,
          message: exception.message,
          type: this.getErrorType(status),
          exception_code: this.generateExceptionCode(status),
          http_code: status,
          http_exception: exception.name,
          details: exception.details,
        },
        timestamp: new Date().toISOString(),
        path: request.url,
        method: request.method,
        requestId: request.headers['x-request-id'] as string,
      };

      // Log the auth-specific error
      this.logger.error({
        message: 'Auth Exception caught',
        error: {
          code: exception.code,
          name: exception.name,
          message: exception.message,
          details: exception.details,
        },
        request: {
          method: request.method,
          url: request.url,
          body: this.sanitizeBody(request.body),
          query: request.query,
          params: request.params,
        },
        user: (request as any).user?.id,
        timestamp: new Date().toISOString(),
      });

      response.status(status).json(errorResponse);
      return;
    }

    // Fall back to the parent filter for other exceptions
    super.catch(exception, host);
  }

  /**
   * Maps auth error codes to HTTP status codes
   */
  private mapAuthErrorToHttpStatus(code: AuthErrorCode): number {
    const statusMap: Record<AuthErrorCode, number> = {
      // Authentication Errors -> 401 Unauthorized
      [AuthErrorCode.INVALID_CREDENTIALS]: HttpStatus.UNAUTHORIZED,
      [AuthErrorCode.USER_NOT_FOUND]: HttpStatus.UNAUTHORIZED,
      [AuthErrorCode.USER_BLOCKED]: HttpStatus.FORBIDDEN,
      [AuthErrorCode.ACCOUNT_LOCKED]: HttpStatus.FORBIDDEN,
      [AuthErrorCode.EMAIL_NOT_VERIFIED]: HttpStatus.FORBIDDEN,
      [AuthErrorCode.INVALID_TOKEN]: HttpStatus.UNAUTHORIZED,
      [AuthErrorCode.TOKEN_EXPIRED]: HttpStatus.UNAUTHORIZED,
      [AuthErrorCode.REFRESH_TOKEN_INVALID]: HttpStatus.UNAUTHORIZED,
      [AuthErrorCode.SESSION_EXPIRED]: HttpStatus.UNAUTHORIZED,
      [AuthErrorCode.MAX_LOGIN_ATTEMPTS]: HttpStatus.TOO_MANY_REQUESTS,

      // Registration Errors -> 400 Bad Request / 409 Conflict
      [AuthErrorCode.USER_ALREADY_EXISTS]: HttpStatus.CONFLICT,
      [AuthErrorCode.INVALID_EMAIL_FORMAT]: HttpStatus.BAD_REQUEST,
      [AuthErrorCode.WEAK_PASSWORD]: HttpStatus.BAD_REQUEST,
      [AuthErrorCode.EMAIL_DOMAIN_NOT_ALLOWED]: HttpStatus.FORBIDDEN,
      [AuthErrorCode.REGISTRATION_DISABLED]: HttpStatus.FORBIDDEN,
      [AuthErrorCode.VERIFICATION_CODE_INVALID]: HttpStatus.BAD_REQUEST,
      [AuthErrorCode.VERIFICATION_CODE_EXPIRED]: HttpStatus.BAD_REQUEST,

      // Role & Permission Errors -> 403 Forbidden / 404 Not Found
      [AuthErrorCode.INSUFFICIENT_PERMISSIONS]: HttpStatus.FORBIDDEN,
      [AuthErrorCode.ROLE_NOT_FOUND]: HttpStatus.NOT_FOUND,
      [AuthErrorCode.PERMISSION_NOT_FOUND]: HttpStatus.NOT_FOUND,
      [AuthErrorCode.ROLE_ALREADY_EXISTS]: HttpStatus.CONFLICT,
      [AuthErrorCode.PERMISSION_ALREADY_EXISTS]: HttpStatus.CONFLICT,
      [AuthErrorCode.CANNOT_DELETE_SYSTEM_ROLE]: HttpStatus.FORBIDDEN,
      [AuthErrorCode.CANNOT_MODIFY_OWN_ROLE]: HttpStatus.FORBIDDEN,
      [AuthErrorCode.ROLE_IN_USE]: HttpStatus.CONFLICT,

      // OAuth/SSO Errors -> 400 Bad Request / 502 Bad Gateway
      [AuthErrorCode.OAUTH_PROVIDER_ERROR]: HttpStatus.BAD_GATEWAY,
      [AuthErrorCode.OAUTH_CODE_INVALID]: HttpStatus.BAD_REQUEST,
      [AuthErrorCode.OAUTH_STATE_MISMATCH]: HttpStatus.BAD_REQUEST,
      [AuthErrorCode.SSO_NOT_CONFIGURED]: HttpStatus.SERVICE_UNAVAILABLE,
      [AuthErrorCode.GOOGLE_SSO_ERROR]: HttpStatus.BAD_GATEWAY,
      [AuthErrorCode.OAUTH_USER_NOT_FOUND]: HttpStatus.NOT_FOUND,
      [AuthErrorCode.DOMAIN_NOT_ALLOWED_SSO]: HttpStatus.FORBIDDEN,

      // 2FA Errors -> 400 Bad Request / 403 Forbidden
      [AuthErrorCode.TWO_FA_NOT_ENABLED]: HttpStatus.FORBIDDEN,
      [AuthErrorCode.TWO_FA_CODE_INVALID]: HttpStatus.BAD_REQUEST,
      [AuthErrorCode.TWO_FA_CODE_EXPIRED]: HttpStatus.BAD_REQUEST,
      [AuthErrorCode.TWO_FA_SETUP_REQUIRED]: HttpStatus.FORBIDDEN,
      [AuthErrorCode.TWO_FA_BACKUP_CODE_INVALID]: HttpStatus.BAD_REQUEST,
      [AuthErrorCode.TWO_FA_ALREADY_ENABLED]: HttpStatus.CONFLICT,

      // Password Reset Errors -> 400 Bad Request / 404 Not Found
      [AuthErrorCode.RESET_TOKEN_INVALID]: HttpStatus.BAD_REQUEST,
      [AuthErrorCode.RESET_TOKEN_EXPIRED]: HttpStatus.BAD_REQUEST,
      [AuthErrorCode.RESET_EMAIL_NOT_SENT]: HttpStatus.INTERNAL_SERVER_ERROR,
      [AuthErrorCode.PASSWORD_SAME_AS_CURRENT]: HttpStatus.BAD_REQUEST,
      [AuthErrorCode.RESET_ATTEMPTS_EXCEEDED]: HttpStatus.TOO_MANY_REQUESTS,

      // General Errors
      [AuthErrorCode.SERVICE_UNAVAILABLE]: HttpStatus.SERVICE_UNAVAILABLE,
      [AuthErrorCode.RATE_LIMIT_EXCEEDED]: HttpStatus.TOO_MANY_REQUESTS,
      [AuthErrorCode.VALIDATION_ERROR]: HttpStatus.BAD_REQUEST,
      [AuthErrorCode.INTERNAL_ERROR]: HttpStatus.INTERNAL_SERVER_ERROR,
    };

    return statusMap[code] || HttpStatus.INTERNAL_SERVER_ERROR;
  }

  /**
   * Sanitizes request body to avoid logging sensitive data
   */
  private sanitizeBody(body: any): any {
    if (!body || typeof body !== 'object') return body;

    const sensitiveFields = ['password', 'token', 'refreshToken', 'secret', 'apiKey'];
    const sanitized = { ...body };

    sensitiveFields.forEach(field => {
      if (sanitized[field]) {
        sanitized[field] = '***REDACTED***';
      }
    });

    return sanitized;
  }

  protected getServiceCode(path: string): string {
    return 'AUTH';
  }
}
