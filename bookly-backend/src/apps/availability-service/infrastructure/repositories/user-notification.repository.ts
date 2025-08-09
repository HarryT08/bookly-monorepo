/**
 * User Notification Repository Implementation
 * Communicates with auth-service microservice via HTTP client
 * Maintains decoupling between availability-service and auth-service
 */

import { Injectable } from '@nestjs/common';
import { LoggingService } from '@/libs/logging/logging.service';
import { AuthServiceClient, UserNotificationDataDto } from '../clients/auth-service.client';
import { UserNotificationRepository } from '../handlers/notification-event.handler';
import { NotificationRecipient } from '../services/notification.service';
import { LoggingHelper } from '@/libs/logging/logging.helper';

@Injectable()
export class UserNotificationRepositoryImpl implements UserNotificationRepository {
  constructor(
    private readonly authServiceClient: AuthServiceClient,
    private readonly logger: LoggingService
  ) {}

  /**
   * Get user notification data by user ID from auth-service
   */
  async getUserNotificationData(userId: string): Promise<NotificationRecipient | null> {
    try {
      this.logger.log('Fetching user notification data via auth-service client', { userId });

      const userData = await this.authServiceClient.getUserNotificationData(userId);
      
      if (!userData) {
        this.logger.warn('User not found in auth-service', { userId });
        return null;
      }

      // Transform auth-service response to notification recipient format
      const notificationRecipient: NotificationRecipient = {
        userId: userData.id,
        email: userData.email,
        phone: userData.phone,
        pushTokens: userData.pushTokens || [],
        preferredLanguage: userData.preferredLanguage || 'es',
        preferences: {
          email: userData.preferences.email,
          sms: userData.preferences.sms,
          push: userData.preferences.push,
          inApp: userData.preferences.inApp,
          whatsapp: userData.preferences.whatsapp
        },
        timezone: userData.timezone || 'America/Bogota'
      };

      this.logger.log('Successfully transformed user data for notifications', {
        userId,
        hasEmail: !!notificationRecipient.email,
        hasPhone: !!notificationRecipient.phone,
        language: notificationRecipient.preferredLanguage,
        enabledChannels: Object.entries(notificationRecipient.preferences)
          .filter(([_, enabled]) => enabled)
          .map(([channel]) => channel)
      });

      return notificationRecipient;

    } catch (error) {
      this.logger.error('Failed to get user notification data from auth-service', error, LoggingHelper.logParams({ userId }));
      return null;
    }
  }

  /**
   * Get multiple users notification data via batch request to auth-service
   */
  async getUsersNotificationData(userIds: string[]): Promise<NotificationRecipient[]> {
    try {
      this.logger.log('Fetching batch user notification data via auth-service client', {
        userCount: userIds.length
      });

      const batchResult = await this.authServiceClient.getBatchUserNotificationData(userIds);
      
      if (batchResult.notFound.length > 0) {
        this.logger.warn('Some users not found in auth-service', {
          notFoundUsers: batchResult.notFound,
          notFoundCount: batchResult.notFound.length
        });
      }

      // Transform all found users to notification recipient format
      const notificationRecipients: NotificationRecipient[] = batchResult.users.map(
        (userData: UserNotificationDataDto): NotificationRecipient => ({
          userId: userData.id,
          email: userData.email,
          phone: userData.phone,
          pushTokens: userData.pushTokens || [],
          preferredLanguage: userData.preferredLanguage || 'es',
          preferences: {
            email: userData.preferences.email,
            sms: userData.preferences.sms,
            push: userData.preferences.push,
            inApp: userData.preferences.inApp,
            whatsapp: userData.preferences.whatsapp
          },
          timezone: userData.timezone || 'America/Bogota'
        })
      );

      this.logger.log('Successfully transformed batch user data for notifications', {
        requestedCount: userIds.length,
        foundCount: notificationRecipients.length,
        notFoundCount: batchResult.notFound.length
      });

      return notificationRecipients;

    } catch (error) {
      this.logger.error('Failed to get batch user notification data from auth-service', error, LoggingHelper.logParams({
        userIds,
        userCount: userIds.length
      }));
      return [];
    }
  }

  /**
   * Update user notification preferences via auth-service
   */
  async updateUserNotificationPreferences(
    userId: string,
    preferences: Partial<NotificationRecipient['preferences']>
  ): Promise<boolean> {
    try {
      this.logger.log('Updating user notification preferences via auth-service client', {
        userId,
        preferences
      });

      const success = await this.authServiceClient.updateUserNotificationPreferences(
        userId,
        preferences
      );

      this.logger.log('User notification preferences update result', {
        userId,
        success
      });

      return success;

    } catch (error) {
      this.logger.error('Failed to update user notification preferences via auth-service', error, LoggingHelper.logParams({
        userId,
        preferences
      }));
      return false;
    }
  }

  /**
   * Validate user exists and has required permissions for notifications
   */
  async validateUserForNotification(userId: string, requiredRoles?: string[]): Promise<boolean> {
    try {
      this.logger.log('Validating user for notification via auth-service client', {
        userId,
        requiredRoles
      });

      const isValid = await this.authServiceClient.validateUserForNotification(
        userId,
        requiredRoles
      );

      this.logger.log('User validation result for notification', {
        userId,
        isValid,
        requiredRoles
      });

      return isValid;

    } catch (error) {
      this.logger.error('Failed to validate user for notification via auth-service', error, LoggingHelper.logParams({
        userId,
        requiredRoles
      }));
      return false;
    }
  }

  /**
   * Get user roles for authorization checks
   */
  async getUserRoles(userId: string): Promise<string[]> {
    try {
      this.logger.log('Fetching user roles via auth-service client', { userId });

      const roles = await this.authServiceClient.getUserRoles(userId);

      this.logger.log('Successfully retrieved user roles', {
        userId,
        rolesCount: roles.length
      });

      return roles;

    } catch (error) {
      this.logger.error('Failed to get user roles via auth-service', error, LoggingHelper.logParams({ userId }));
      return [];
    }
  }
}
