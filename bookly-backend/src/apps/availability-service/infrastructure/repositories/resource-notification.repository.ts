/**
 * Resource Notification Repository Implementation
 * Communicates with resources-service microservice via HTTP client
 * Maintains decoupling between availability-service and resources-service
 */

import { Injectable } from '@nestjs/common';
import { LoggingService } from '@libs/logging/logging.service';
import { ResourcesServiceClient, ResourceNotificationDataDto } from '../clients/resources-service.client';
import { ResourceNotificationRepository } from '../handlers/notification-event.handler';
import { LoggingHelper } from '@/libs/logging/logging.helper';

export interface ResourceNotificationData {
  readonly id: string;
  readonly name: string;
  readonly type: string;
  readonly location?: string;
  readonly capacity?: number;
  readonly description?: string;
  readonly features?: string[];
  readonly status?: string;
}

@Injectable()
export class ResourceNotificationRepositoryImpl implements ResourceNotificationRepository {
  constructor(
    private readonly resourcesServiceClient: ResourcesServiceClient,
    private readonly logger: LoggingService
  ) {}

  /**
   * Get resource notification data by resource ID from resources-service
   */
  async getResourceNotificationData(resourceId: string): Promise<ResourceNotificationData | null> {
    try {
      this.logger.log('Fetching resource notification data via resources-service client', { resourceId });

      const resourceData = await this.resourcesServiceClient.getResourceNotificationData(resourceId);
      
      if (!resourceData) {
        this.logger.warn('Resource not found in resources-service', { resourceId });
        return null;
      }

      // Transform resources-service response to notification format
      const notificationData: ResourceNotificationData = {
        id: resourceData.id,
        name: resourceData.name,
        type: resourceData.type,
        location: resourceData.location,
        capacity: resourceData.capacity,
        description: resourceData.description,
        features: resourceData.features,
        status: resourceData.status
      };

      this.logger.log('Successfully transformed resource data for notifications', {
        resourceId,
        resourceName: notificationData.name,
        resourceType: notificationData.type,
        capacity: notificationData.capacity,
        featureCount: notificationData.features?.length || 0
      });

      return notificationData;

    } catch (error) {
      this.logger.error('Failed to get resource notification data from resources-service', error, LoggingHelper.logParams({ resourceId }));
      return null;
    }
  }

  /**
   * Get multiple resources notification data via batch request to resources-service
   */
  async getBatchResourceNotificationData(resourceIds: string[]): Promise<ResourceNotificationData[]> {
    try {
      this.logger.log('Fetching batch resource notification data via resources-service client', {
        resourceCount: resourceIds.length
      });

      const batchResult = await this.resourcesServiceClient.getBatchResourceNotificationData(resourceIds);
      
      if (batchResult.notFound.length > 0) {
        this.logger.warn('Some resources not found in resources-service', {
          notFoundResources: batchResult.notFound,
          notFoundCount: batchResult.notFound.length
        });
      }

      // Transform all found resources to notification format
      const notificationData: ResourceNotificationData[] = batchResult.resources.map(
        (resourceData: ResourceNotificationDataDto): ResourceNotificationData => ({
          id: resourceData.id,
          name: resourceData.name,
          type: resourceData.type,
          location: resourceData.location,
          capacity: resourceData.capacity,
          description: resourceData.description,
          features: resourceData.features,
          status: resourceData.status
        })
      );

      this.logger.log('Successfully transformed batch resource data for notifications', {
        requestedCount: resourceIds.length,
        foundCount: notificationData.length,
        notFoundCount: batchResult.notFound.length
      });

      return notificationData;

    } catch (error) {
      this.logger.error('Failed to get batch resource notification data from resources-service', error, LoggingHelper.logParams({
        resourceIds,
        resourceCount: resourceIds.length
      }));
      return [];
    }
  }

  /**
   * Find equivalent resources for reassignment notifications
   */
  async findEquivalentResourcesForNotification(
    originalResourceId: string,
    criteria: {
      capacityTolerancePercent?: number;
      requiredFeatures?: string[];
      preferredFeatures?: string[];
      maxDistanceMeters?: number;
      excludeResourceIds?: string[];
      limit?: number;
    }
  ): Promise<ResourceNotificationData[]> {
    try {
      this.logger.log('Finding equivalent resources for notification via resources-service client', {
        originalResourceId,
        criteria
      });

      const equivalenceResult = await this.resourcesServiceClient.findEquivalentResources(
        originalResourceId,
        criteria
      );
      
      if (!equivalenceResult || equivalenceResult.equivalentResources.length === 0) {
        this.logger.warn('No equivalent resources found', { originalResourceId, criteria });
        return [];
      }

      // Transform equivalent resources to notification format
      const equivalentNotificationData: ResourceNotificationData[] = equivalenceResult.equivalentResources.map(
        (resource) => ({
          id: resource.id,
          name: resource.name,
          type: resource.type,
          capacity: resource.capacity,
          features: resource.features,
          location: undefined, // Not provided in equivalence response
          description: `Compatibilidad: ${resource.compatibilityScore}%`
        })
      );

      this.logger.log('Successfully found equivalent resources for notification', {
        originalResourceId,
        equivalentCount: equivalentNotificationData.length
      });

      return equivalentNotificationData;

    } catch (error) {
      this.logger.error('Failed to find equivalent resources for notification via resources-service', error, LoggingHelper.logParams({
        originalResourceId,
        criteria
      }));
      return [];
    }
  }

  /**
   * Check resource availability for notification purposes
   */
  async checkResourceAvailabilityForNotification(
    resourceId: string,
    startTime: Date,
    endTime: Date
  ): Promise<{ available: boolean; conflictCount: number }> {
    try {
      this.logger.log('Checking resource availability for notification via resources-service client', {
        resourceId,
        startTime,
        endTime
      });

      const availabilityResult = await this.resourcesServiceClient.checkResourceAvailability(
        resourceId,
        startTime,
        endTime
      );

      const result = {
        available: availabilityResult.available,
        conflictCount: availabilityResult.conflicts?.length || 0
      };

      this.logger.log('Resource availability check result for notification', {
        resourceId,
        available: result.available,
        conflictCount: result.conflictCount
      });

      return result;

    } catch (error) {
      this.logger.error('Failed to check resource availability for notification via resources-service', error, LoggingHelper.logParams({
        resourceId,
        startTime,
        endTime
      }));
      return { available: false, conflictCount: 0 };
    }
  }

  /**
   * Get resource features for notification context
   */
  async getResourceFeaturesForNotification(resourceId: string): Promise<string[]> {
    try {
      this.logger.log('Fetching resource features for notification via resources-service client', { resourceId });

      const features = await this.resourcesServiceClient.getResourceFeatures(resourceId);

      this.logger.log('Successfully retrieved resource features for notification', {
        resourceId,
        featureCount: features.length
      });

      return features;

    } catch (error) {
      this.logger.error('Failed to get resource features for notification via resources-service', error, LoggingHelper.logParams({ resourceId }));
      return [];
    }
  }

  /**
   * Validate resource for booking notifications
   */
  async validateResourceForNotification(resourceId: string): Promise<{
    valid: boolean;
    reason?: string;
    resource?: ResourceNotificationData;
  }> {
    try {
      this.logger.log('Validating resource for notification via resources-service client', { resourceId });

      const validationResult = await this.resourcesServiceClient.validateResourceForBooking(resourceId);

      const result = {
        valid: validationResult.valid,
        reason: validationResult.reason,
        resource: validationResult.resource ? {
          id: validationResult.resource.id,
          name: validationResult.resource.name,
          type: validationResult.resource.type,
          location: validationResult.resource.location,
          capacity: validationResult.resource.capacity,
          description: validationResult.resource.description,
          features: validationResult.resource.features,
          status: validationResult.resource.status
        } : undefined
      };

      this.logger.log('Resource validation result for notification', {
        resourceId,
        valid: result.valid,
        reason: result.reason
      });

      return result;

    } catch (error) {
      this.logger.error('Failed to validate resource for notification via resources-service', error, LoggingHelper.logParams({ resourceId }));
      return { valid: false, reason: 'Validation failed' };
    }
  }
}
