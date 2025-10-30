import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Logger, ConflictException, Inject } from '@nestjs/common';
import { CreateCalendarIntegrationCommand } from './create-calendar-integration.command';
import { CalendarIntegrationService } from '../services/calendar-integration.service';
import { CalendarIntegrationRepository } from '../../domain/repositories/calendar-integration.repository';
import { EventBusService } from '../../../../libs/event-bus/services/event-bus.service';

/**
 * Handler for CreateCalendarIntegrationCommand (RF-08)
 * Creates new calendar integrations with external providers
 */
@CommandHandler(CreateCalendarIntegrationCommand)
export class CreateCalendarIntegrationHandler implements ICommandHandler<CreateCalendarIntegrationCommand> {
  private readonly logger = new Logger(CreateCalendarIntegrationHandler.name);

  constructor(
    private readonly calendarIntegrationService: CalendarIntegrationService,
    @Inject('CalendarIntegrationRepository')
    private readonly calendarIntegrationRepository: CalendarIntegrationRepository,
    private readonly eventBus: EventBusService
  ) {}

  async execute(command: CreateCalendarIntegrationCommand): Promise<any> {
    this.logger.log('Executing CreateCalendarIntegrationCommand', {
      provider: command.provider,
      resourceId: command.resourceId,
      name: command.name
    });

    try {
      // Check if integration already exists for this resource and provider
      if (command.resourceId) {
        const existingIntegration = await this.calendarIntegrationRepository.findByResourceAndProvider(
          command.resourceId,
          command.provider
        );

        if (existingIntegration) {
          throw new ConflictException(`Calendar integration for provider ${command.provider} already exists for this resource`);
        }
      }

      // Create the integration using the service
      const integration = await this.calendarIntegrationService.createIntegration({
        resourceId: command.resourceId,
        provider: command.provider,
        name: command.name,
        credentials: command.credentials,
        calendarId: command.calendarId,
        syncInterval: command.syncInterval,
        isActive: command.isActive
      });

      // Publish integration created event
      await this.eventBus.publishEvent({
        eventId: `integration-created-${integration.id}`,
        eventType: 'calendar.integration.created',
        aggregateId: integration.id,
        aggregateType: 'CalendarIntegration',
        version: 1,
        timestamp: new Date(),
        eventData: {
          integrationId: integration.id,
          resourceId: integration.resourceId,
          provider: integration.provider,
          name: integration.name,
          isActive: integration.isActive,
          createdAt: integration.createdAt
        }
      });

      this.logger.log('Calendar integration created successfully', {
        integrationId: integration.id,
        provider: integration.provider,
        resourceId: integration.resourceId
      });

      return {
        id: integration.id,
        resourceId: integration.resourceId,
        provider: integration.provider,
        name: integration.name,
        calendarId: integration.calendarId,
        syncInterval: integration.syncInterval,
        isActive: integration.isActive,
        createdAt: integration.createdAt,
        lastSync: integration.lastSync
      };
    } catch (error) {
      this.logger.error('Failed to create calendar integration', {
        error: error.message,
        provider: command.provider,
        resourceId: command.resourceId
      });
      throw error;
    }
  }
}
