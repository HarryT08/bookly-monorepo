/**
 * Resources Service Client
 * HTTP client for communicating with resources-service microservice
 * Maintains decoupling between availability-service and resources-service
 */

import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { firstValueFrom } from 'rxjs';
import { LoggingService } from '@logging/logging.service';
import { LoggingHelper } from '@/libs/logging/logging.helper';

export interface ResourceNotificationDataDto {
  readonly id: string;
  readonly name: string;
  readonly type: string;
  readonly location?: string;
  readonly capacity?: number;
  readonly description?: string;
  readonly features?: string[];
  readonly programId?: string;
  readonly status: string;
  readonly isActive: boolean;
}

export interface BatchResourceNotificationDataDto {
  readonly resources: ResourceNotificationDataDto[];
  readonly notFound: string[];
}

export interface ResourceEquivalenceDto {
  readonly resourceId: string;
  readonly equivalentResources: Array<{
    readonly id: string;
    readonly name: string;
    readonly type: string;
    readonly capacity: number;
    readonly compatibilityScore: number;
    readonly distanceMeters?: number;
    readonly features: string[];
    readonly advantages: string[];
    readonly disadvantages: string[];
  }>;
  readonly searchCriteria: {
    readonly capacityTolerancePercent: number;
    readonly requiredFeatures?: string[];
    readonly preferredFeatures?: string[];
    readonly maxDistanceMeters?: number;
  };
}

@Injectable()
export class ResourcesServiceClient {
  private readonly resourcesServiceUrl: string;
  private readonly timeout: number = 5000;

  constructor(
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
    private readonly logger: LoggingService
  ) {
    this.resourcesServiceUrl = this.configService.get<string>('RESOURCES_SERVICE_URL') || 'http://localhost:3002';
  }

  /**
   * Get resource notification data by resource ID
   */
  async getResourceNotificationData(resourceId: string): Promise<ResourceNotificationDataDto | null> {
    try {
      this.logger.log('Fetching resource notification data from resources-service', {
        resourceId,
        resourcesServiceUrl: this.resourcesServiceUrl
      });

      const response = await firstValueFrom(
        this.httpService.get<ResourceNotificationDataDto>(
          `${this.resourcesServiceUrl}/api/resources/${resourceId}/notification-data`,
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
        this.logger.log('Successfully retrieved resource notification data', {
          resourceId,
          resourceName: response.data.name,
          resourceType: response.data.type,
          capacity: response.data.capacity
        });

        return response.data;
      }

      return null;

    } catch (error) {
      if (error.response?.status === 404) {
        this.logger.warn('Resource not found in resources-service', { resourceId });
        return null;
      }

      this.logger.error('Failed to fetch resource notification data from resources-service', error, LoggingHelper.logParams({
        resourceId,
        resourcesServiceUrl: this.resourcesServiceUrl,
        status: error.response?.status,
        message: error.message
      }));

      // Don't throw error to avoid breaking notification flow
      return null;
    }
  }

  /**
   * Get multiple resources notification data in batch
   */
  async getBatchResourceNotificationData(resourceIds: string[]): Promise<BatchResourceNotificationDataDto> {
    try {
      this.logger.log('Fetching batch resource notification data from resources-service', {
        resourceCount: resourceIds.length,
        resourcesServiceUrl: this.resourcesServiceUrl
      });

      const response = await firstValueFrom(
        this.httpService.post<BatchResourceNotificationDataDto>(
          `${this.resourcesServiceUrl}/api/resources/batch/notification-data`,
          { resourceIds },
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
        this.logger.log('Successfully retrieved batch resource notification data', {
          requestedCount: resourceIds.length,
          foundCount: response.data.resources.length,
          notFoundCount: response.data.notFound.length
        });

        return response.data;
      }

      return { resources: [], notFound: resourceIds };

    } catch (error) {
      this.logger.error('Failed to fetch batch resource notification data from resources-service', error, LoggingHelper.logParams({
        resourceIds,
        resourcesServiceUrl: this.resourcesServiceUrl,
        status: error.response?.status,
        message: error.message
      }));

      // Return empty result to avoid breaking notification flow
      return { resources: [], notFound: resourceIds };
    }
  }

  /**
   * Find equivalent resources for reassignment
   */
  async findEquivalentResources(
    originalResourceId: string,
    criteria: {
      capacityTolerancePercent?: number;
      requiredFeatures?: string[];
      preferredFeatures?: string[];
      maxDistanceMeters?: number;
      excludeResourceIds?: string[];
      limit?: number;
    }
  ): Promise<ResourceEquivalenceDto | null> {
    try {
      this.logger.log('Finding equivalent resources in resources-service', {
        originalResourceId,
        criteria
      });

      const response = await firstValueFrom(
        this.httpService.post<ResourceEquivalenceDto>(
          `${this.resourcesServiceUrl}/api/resources/${originalResourceId}/equivalents`,
          criteria,
          {
            timeout: this.timeout * 2, // Longer timeout for complex search
            headers: {
              'Content-Type': 'application/json',
              'X-Service-Name': 'availability-service',
              'X-Request-Source': 'reassignment-system'
            }
          }
        )
      );

      if (response.status === 200 && response.data) {
        this.logger.log('Successfully found equivalent resources', {
          originalResourceId,
          equivalentCount: response.data.equivalentResources.length
        });

        return response.data;
      }

      return null;

    } catch (error) {
      this.logger.error('Failed to find equivalent resources in resources-service', error, LoggingHelper.logParams({
        originalResourceId,
        criteria,
        resourcesServiceUrl: this.resourcesServiceUrl,
        status: error.response?.status,
        message: error.message
      }));

      return null;
    }
  }

  /**
   * Check resource availability for specific time slot
   */
  async checkResourceAvailability(
    resourceId: string,
    startTime: Date,
    endTime: Date
  ): Promise<{ available: boolean; conflicts?: any[] }> {
    try {
      this.logger.log('Checking resource availability in resources-service', {
        resourceId,
        startTime,
        endTime
      });

      const response = await firstValueFrom(
        this.httpService.post<{ available: boolean; conflicts?: any[] }>(
          `${this.resourcesServiceUrl}/api/resources/${resourceId}/availability`,
          {
            startTime: startTime.toISOString(),
            endTime: endTime.toISOString()
          },
          {
            timeout: this.timeout,
            headers: {
              'Content-Type': 'application/json',
              'X-Service-Name': 'availability-service',
              'X-Request-Source': 'availability-check'
            }
          }
        )
      );

      if (response.status === 200 && response.data) {
        this.logger.log('Successfully checked resource availability', {
          resourceId,
          available: response.data.available,
          conflictCount: response.data.conflicts?.length || 0
        });

        return response.data;
      }

      return { available: false };

    } catch (error) {
      this.logger.error('Failed to check resource availability in resources-service', error, LoggingHelper.logParams({
        resourceId,
        startTime,
        endTime,
        resourcesServiceUrl: this.resourcesServiceUrl,
        status: error.response?.status,
        message: error.message
      }));

      return { available: false };
    }
  }

  /**
   * Get resource features and capabilities
   */
  async getResourceFeatures(resourceId: string): Promise<string[]> {
    try {
      this.logger.log('Fetching resource features from resources-service', { resourceId });

      const response = await firstValueFrom(
        this.httpService.get<{ features: string[] }>(
          `${this.resourcesServiceUrl}/api/resources/${resourceId}/features`,
          {
            timeout: this.timeout,
            headers: {
              'Content-Type': 'application/json',
              'X-Service-Name': 'availability-service',
              'X-Request-Source': 'feature-check'
            }
          }
        )
      );

      if (response.status === 200 && response.data?.features) {
        this.logger.log('Successfully retrieved resource features', {
          resourceId,
          featureCount: response.data.features.length
        });

        return response.data.features;
      }

      return [];

    } catch (error) {
      this.logger.error('Failed to fetch resource features from resources-service', error, LoggingHelper.logParams({
        resourceId,
        resourcesServiceUrl: this.resourcesServiceUrl,
        status: error.response?.status,
        message: error.message
      }));

      return [];
    }
  }

  /**
   * Validate resource exists and is available for booking
   */
  async validateResourceForBooking(resourceId: string): Promise<{
    valid: boolean;
    reason?: string;
    resource?: ResourceNotificationDataDto;
  }> {
    try {
      this.logger.log('Validating resource for booking in resources-service', { resourceId });

      const response = await firstValueFrom(
        this.httpService.get<{
          valid: boolean;
          reason?: string;
          resource?: ResourceNotificationDataDto;
        }>(
          `${this.resourcesServiceUrl}/api/resources/${resourceId}/validate-booking`,
          {
            timeout: this.timeout,
            headers: {
              'Content-Type': 'application/json',
              'X-Service-Name': 'availability-service',
              'X-Request-Source': 'booking-validation'
            }
          }
        )
      );

      if (response.status === 200 && response.data) {
        this.logger.log('Resource validation result', {
          resourceId,
          valid: response.data.valid,
          reason: response.data.reason
        });

        return response.data;
      }

      return { valid: false, reason: 'Service unavailable' };

    } catch (error) {
      this.logger.error('Failed to validate resource for booking in resources-service', error, LoggingHelper.logParams({
        resourceId,
        resourcesServiceUrl: this.resourcesServiceUrl,
        status: error.response?.status,
        message: error.message
      }));

      return { valid: false, reason: 'Validation failed' };
    }
  }

  /**
   * Health check for resources-service connectivity
   */
  async healthCheck(): Promise<boolean> {
    try {
      const response = await firstValueFrom(
        this.httpService.get(`${this.resourcesServiceUrl}/health`, {
          timeout: 3000,
          headers: {
            'X-Service-Name': 'availability-service'
          }
        })
      );

      return response.status === 200;

    } catch (error) {
      this.logger.error('Resources-service health check failed', error, LoggingHelper.logParams({
        resourcesServiceUrl: this.resourcesServiceUrl,
        status: error.response?.status,
        message: error.message
      }));

      return false;
    }
  }
}
