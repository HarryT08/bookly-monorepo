import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Logger, NotFoundException } from '@nestjs/common';
import { SyncCalendarCommand } from './sync-calendar.command';
import { CalendarIntegrationService } from '../services/calendar-integration.service';
import { EventBusService, DomainEvent } from '../../../../libs/event-bus/services/event-bus.service';

/**
 * Handler for SyncCalendarCommand (RF-08)
 * Synchronizes events from external calendar providers
 */
@CommandHandler(SyncCalendarCommand)
export class SyncCalendarHandler implements ICommandHandler<SyncCalendarCommand> {
  private readonly logger = new Logger(SyncCalendarHandler.name);

  constructor(
    private readonly calendarIntegrationService: CalendarIntegrationService,
    private readonly eventBus: EventBusService
  ) {}

  async execute(command: SyncCalendarCommand): Promise<any> {
    this.logger.log('Executing SyncCalendarCommand', {
      integrationId: command.integrationId
    });

    try {
      // Sync calendar events
      await this.calendarIntegrationService.syncCalendarEvents(command.integrationId);

      // Publish sync completed event
      await this.eventBus.publishEvent({
        eventId: `sync-completed-${command.integrationId}`,
        eventType: 'calendar.sync.completed',
        aggregateId: command.integrationId,
        aggregateType: 'CalendarIntegration',
        version: 1,
        timestamp: new Date(),
        eventData: {
          integrationId: command.integrationId,
          syncedAt: new Date(),
          success: true
        }
      });

      this.logger.log('Calendar sync completed successfully', {
        integrationId: command.integrationId
      });

      return {
        success: true,
        integrationId: command.integrationId,
        syncedAt: new Date(),
        message: 'Calendar synchronization completed successfully'
      };
    } catch (error) {
      this.logger.error('Failed to sync calendar', {
        error: error.message,
        integrationId: command.integrationId
      });

      // Publish sync failed event
      await this.eventBus.publishEvent({
        eventId: `sync-failed-${command.integrationId}`,
        eventType: 'calendar.sync.failed',
        aggregateId: command.integrationId,
        aggregateType: 'CalendarIntegration',
        version: 1,
        timestamp: new Date(),
        eventData: {
          integrationId: command.integrationId,
          syncedAt: new Date(),
          success: false,
          error: error.message
        }
      });

      throw error;
    }
  }
}


