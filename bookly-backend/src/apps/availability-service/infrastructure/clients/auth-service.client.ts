/**
 * Auth Service Client
 * HTTP client for communicating with auth-service microservice
 * Maintains decoupling between availability-service and auth-service
 */

import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { firstValueFrom } from 'rxjs';
import { LoggingService } from '@logging/logging.service';
import { LoggingHelper } from '@/libs/logging/logging.helper';

export interface UserNotificationDataDto {
  readonly id: string;
  readonly email?: string;
  readonly phone?: string;
  readonly pushTokens?: string[];
  readonly preferredLanguage: string;
  readonly preferences: {
    readonly email: boolean;
    readonly sms: boolean;
    readonly push: boolean;
    readonly inApp: boolean;
    readonly whatsapp: boolean;
  };
  readonly timezone: string;
  readonly firstName?: string;
  readonly lastName?: string;
  readonly roles?: string[];
}

export interface BatchUserNotificationDataDto {
  readonly users: UserNotificationDataDto[];
  readonly notFound: string[];
}

@Injectable()
export class AuthServiceClient {
  private readonly authServiceUrl: string;
  private readonly timeout: number = 5000;

  constructor(
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
    private readonly logger: LoggingService
  ) {
    this.authServiceUrl = this.configService.get<string>('AUTH_SERVICE_URL') || 'http://localhost:3001';
  }

  /**
   * Get user notification data by user ID
   */
  async getUserNotificationData(userId: string): Promise<UserNotificationDataDto | null> {
    try {
      this.logger.log('Fetching user notification data from auth-service', {
        userId,
        authServiceUrl: this.authServiceUrl
      });

      const response = await firstValueFrom(
        this.httpService.get<UserNotificationDataDto>(
          `${this.authServiceUrl}/api/users/${userId}/notification-data`,
          {
            timeout: this.timeout,
            headers: {
              'Content-Type': 'application/json',
              'X-Service-Name': 'availability-service',
              'X-Request-Source': 'notification-system'
            }
          }
        )
      );

      if (response.status === 200 && response.data) {
        this.logger.log('Successfully retrieved user notification data', {
          userId,
          hasEmail: !!response.data.email,
          hasPhone: !!response.data.phone,
          language: response.data.preferredLanguage
        });

        return response.data;
      }

      return null;

    } catch (error) {
      if (error.response?.status === 404) {
        this.logger.warn('User not found in auth-service', { userId });
        return null;
      }

      this.logger.error('Failed to fetch user notification data from auth-service', error, LoggingHelper.logParams({
        userId,
        authServiceUrl: this.authServiceUrl,
        status: error.response?.status,
        message: error.message
      }));

      // Don't throw error to avoid breaking notification flow
      return null;
    }
  }

  /**
   * Get multiple users notification data in batch
   */
  async getBatchUserNotificationData(userIds: string[]): Promise<BatchUserNotificationDataDto> {
    try {
      this.logger.log('Fetching batch user notification data from auth-service', {
        userCount: userIds.length,
        authServiceUrl: this.authServiceUrl
      });

      const response = await firstValueFrom(
        this.httpService.post<BatchUserNotificationDataDto>(
          `${this.authServiceUrl}/api/users/batch/notification-data`,
          { userIds },
          {
            timeout: this.timeout * 2, // Double timeout for batch operations
            headers: {
              'Content-Type': 'application/json',
              'X-Service-Name': 'availability-service',
              'X-Request-Source': 'notification-system'
            }
          }
        )
      );

      if (response.status === 200 && response.data) {
        this.logger.log('Successfully retrieved batch user notification data', {
          requestedCount: userIds.length,
          foundCount: response.data.users.length,
          notFoundCount: response.data.notFound.length
        });

        return response.data;
      }

      return { users: [], notFound: userIds };

    } catch (error) {
      this.logger.error('Failed to fetch batch user notification data from auth-service', error, LoggingHelper.logParams({
        userIds,
        authServiceUrl: this.authServiceUrl,
        status: error.response?.status,
        message: error.message
      }));

      // Return empty result to avoid breaking notification flow
      return { users: [], notFound: userIds };
    }
  }

  /**
   * Update user notification preferences
   */
  async updateUserNotificationPreferences(
    userId: string,
    preferences: Partial<UserNotificationDataDto['preferences']>
  ): Promise<boolean> {
    try {
      this.logger.log('Updating user notification preferences in auth-service', {
        userId,
        preferences
      });

      const response = await firstValueFrom(
        this.httpService.patch(
          `${this.authServiceUrl}/api/users/${userId}/notification-preferences`,
          { preferences },
          {
            timeout: this.timeout,
            headers: {
              'Content-Type': 'application/json',
              'X-Service-Name': 'availability-service',
              'X-Request-Source': 'notification-system'
            }
          }
        )
      );

      const success = response.status === 200;
      
      this.logger.log('User notification preferences update result', {
        userId,
        success,
        status: response.status
      });

      return success;

    } catch (error) {
      this.logger.error('Failed to update user notification preferences in auth-service', error, LoggingHelper.logParams({
        userId,
        preferences,
        authServiceUrl: this.authServiceUrl,
        status: error.response?.status,
        message: error.message
      }));

      return false;
    }
  }

  /**
   * Validate user exists and has required permissions
   */
  async validateUserForNotification(userId: string, requiredRoles?: string[]): Promise<boolean> {
    try {
      this.logger.log('Validating user for notification in auth-service', {
        userId,
        requiredRoles
      });

      const queryParams = requiredRoles ? `?roles=${requiredRoles.join(',')}` : '';
      
      const response = await firstValueFrom(
        this.httpService.get(
          `${this.authServiceUrl}/api/users/${userId}/validate${queryParams}`,
          {
            timeout: this.timeout,
            headers: {
              'Content-Type': 'application/json',
              'X-Service-Name': 'availability-service',
              'X-Request-Source': 'notification-system'
            }
          }
        )
      );

      const isValid = response.status === 200 && response.data?.valid === true;
      
      this.logger.log('User validation result', {
        userId,
        isValid,
        requiredRoles
      });

      return isValid;

    } catch (error) {
      this.logger.error('Failed to validate user in auth-service', error, LoggingHelper.logParams({
        userId,
        requiredRoles,
        authServiceUrl: this.authServiceUrl,
        status: error.response?.status,
        message: error.message
      }));

      return false;
    }
  }

  /**
   * Get user roles for authorization checks
   */
  async getUserRoles(userId: string): Promise<string[]> {
    try {
      this.logger.log('Fetching user roles from auth-service', { userId });

      const response = await firstValueFrom(
        this.httpService.get<{ roles: string[] }>(
          `${this.authServiceUrl}/api/users/${userId}/roles`,
          {
            timeout: this.timeout,
            headers: {
              'Content-Type': 'application/json',
              'X-Service-Name': 'availability-service',
              'X-Request-Source': 'notification-system'
            }
          }
        )
      );

      if (response.status === 200 && response.data?.roles) {
        this.logger.log('Successfully retrieved user roles', {
          userId,
          rolesCount: response.data.roles.length
        });

        return response.data.roles;
      }

      return [];

    } catch (error) {
      this.logger.error('Failed to fetch user roles from auth-service', error, LoggingHelper.logParams({
        userId,
        authServiceUrl: this.authServiceUrl,
        status: error.response?.status,
        message: error.message
      }));

      return [];
    }
  }

  /**
   * Health check for auth-service connectivity
   */
  async healthCheck(): Promise<boolean> {
    try {
      const response = await firstValueFrom(
        this.httpService.get(`${this.authServiceUrl}/health`, {
          timeout: 3000,
          headers: {
            'X-Service-Name': 'availability-service'
          }
        })
      );

      return response.status === 200;

    } catch (error) {
      this.logger.error('Auth-service health check failed', error, LoggingHelper.logParams({
        authServiceUrl: this.authServiceUrl
      }));

      return false;
    }
  }
}
