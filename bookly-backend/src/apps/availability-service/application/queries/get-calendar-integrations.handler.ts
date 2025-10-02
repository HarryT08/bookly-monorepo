import { QueryHandler, IQueryHandler } from '@nestjs/cqrs';
import { Injectable, Logger, Inject } from '@nestjs/common';
import { GetCalendarIntegrationsQuery } from './get-calendar-integrations.query';
import { CalendarIntegrationRepository } from '../../domain/repositories/calendar-integration.repository';

/**
 * Handler for GetCalendarIntegrationsQuery (RF-08)
 * Returns calendar integrations based on filters
 */
@QueryHandler(GetCalendarIntegrationsQuery)
export class GetCalendarIntegrationsHandler implements IQueryHandler<GetCalendarIntegrationsQuery> {
  private readonly logger = new Logger(GetCalendarIntegrationsHandler.name);

  constructor(
    @Inject('CalendarIntegrationRepository')
    private readonly calendarIntegrationRepository: CalendarIntegrationRepository
  ) {}

  async execute(query: GetCalendarIntegrationsQuery): Promise<any> {
    this.logger.log('Executing GetCalendarIntegrationsQuery', {
      resourceId: query.resourceId,
      provider: query.provider,
      isActive: query.isActive
    });

    try {
      let integrations = [];

      if (query.resourceId) {
        integrations = await this.calendarIntegrationRepository.findByResourceId(query.resourceId);
      } else {
        // Get all active integrations since findAll doesn't exist
        integrations = await this.calendarIntegrationRepository.findActive();
      }

      // Apply filters
      if (query.provider) {
        integrations = integrations.filter(integration => integration.provider === query.provider);
      }

      if (query.isActive !== undefined) {
        integrations = integrations.filter(integration => integration.isActive === query.isActive);
      }

      // Format response
      const formattedIntegrations = integrations.map(integration => ({
        id: integration.id,
        resourceId: integration.resourceId,
        provider: integration.provider,
        name: integration.name,
        calendarId: integration.calendarId,
        syncInterval: integration.syncInterval,
        isActive: integration.isActive,
        lastSyncAt: integration.lastSyncAt,
        createdAt: integration.createdAt,
        updatedAt: integration.updatedAt,
        // Don't expose credentials in response
        hasCredentials: !!integration.credentials
      }));

      this.logger.log('Calendar integrations retrieved successfully', {
        count: formattedIntegrations.length,
        resourceId: query.resourceId,
        provider: query.provider
      });

      return {
        integrations: formattedIntegrations,
        total: formattedIntegrations.length,
        filters: {
          resourceId: query.resourceId,
          provider: query.provider,
          isActive: query.isActive
        }
      };
    } catch (error) {
      this.logger.error('Failed to get calendar integrations', {
        error: error.message,
        resourceId: query.resourceId,
        provider: query.provider
      });
      throw error;
    }
  }
}
