import { Injectable, Logger, Inject } from '@nestjs/common';
import { CalendarIntegrationRepository } from '../../domain/repositories/calendar-integration.repository';
import { CalendarEventRepository } from '../../domain/repositories/calendar-event.repository';
import { CalendarIntegrationEntity } from '../../domain/entities/calendar-integration.entity';
import { CalendarEventEntity } from '../../domain/entities/calendar-event.entity';
import { CalendarProvider } from '../../../../libs/dto/availability/calendar-integration.dto';
import { GoogleCalendarService } from '../../infrastructure/services/google-calendar.service';
import { OutlookCalendarService } from '../../infrastructure/services/outlook-calendar.service';
import { ICalService } from '../../infrastructure/services/ical.service';
import { InternalCalendarService } from '../../infrastructure/services/internal-calendar.service';

/**
 * Calendar Integration Service (RF-08)
 * Manages external calendar integrations and synchronization
 */
@Injectable()
export class CalendarIntegrationService {
  private readonly logger = new Logger(CalendarIntegrationService.name);

  constructor(
    @Inject('CalendarIntegrationRepository')
    private readonly calendarIntegrationRepository: CalendarIntegrationRepository,
    @Inject('CalendarEventRepository')
    private readonly calendarEventRepository: CalendarEventRepository,
    private readonly googleCalendarService: GoogleCalendarService,
    private readonly outlookCalendarService: OutlookCalendarService,
    private readonly iCalService: ICalService,
    private readonly internalCalendarService: InternalCalendarService
  ) {}

  /**
   * Create a new calendar integration
   */
  async createIntegration(integrationData: Partial<CalendarIntegrationEntity>, createdBy?: string): Promise<CalendarIntegrationEntity> {
    this.logger.log(`Creating calendar integration for provider: ${integrationData.provider}`, { createdBy });

    // Validate credentials based on provider
    await this.validateCredentials(integrationData.provider!, integrationData.credentials);

    const integration = await this.calendarIntegrationRepository.create({
      name: integrationData.name!,
      provider: integrationData.provider!,
      resourceId: integrationData.resourceId!,
      credentials: integrationData.credentials!,
      settings: {}, // Default empty settings
      isActive: integrationData.isActive ?? true
    });
    
    // Perform initial sync
    await this.syncCalendarEvents(integration.id);

    this.logger.log(`Calendar integration created successfully: ${integration.id}`);
    return integration;
  }

  /**
   * Sync events from external calendar
   */
  async syncCalendarEvents(integrationId: string): Promise<void> {
    const integration = await this.calendarIntegrationRepository.findById(integrationId);
    if (!integration || !integration.isActive) {
      this.logger.warn(`Integration not found or inactive: ${integrationId}`);
      return;
    }

    this.logger.log(`Syncing calendar events for integration: ${integrationId}`);

    try {
      const events = await this.fetchEventsFromProvider(integration);
      
      // Update or create events
      for (const eventData of events) {
        const existingEvent = await this.calendarEventRepository.findByExternalId(
          eventData.externalEventId,
          integrationId
        );

        if (existingEvent) {
          await this.calendarEventRepository.update(existingEvent.id, eventData);
        } else {
          await this.calendarEventRepository.create({
            ...eventData,
            integrationId
          });
        }
      }

      // Update last sync time
      await this.calendarIntegrationRepository.updateLastSync(integrationId, new Date());

      this.logger.log(`Successfully synced ${events.length} events for integration: ${integrationId}`);
    } catch (error) {
      this.logger.error(`Failed to sync calendar events for integration ${integrationId}:`, error);
      throw error;
    }
  }

  /**
   * Get availability considering calendar conflicts
   */
  async getAvailabilityWithCalendarConflicts(
    resourceId: string,
    startDate: Date,
    endDate: Date
  ): Promise<any[]> {
    this.logger.log(`Checking availability with calendar conflicts for resource: ${resourceId}`);

    // Get all active integrations for this resource
    const integrations = await this.calendarIntegrationRepository.findByResourceId(resourceId);
    
    // Get calendar events that might conflict
    const conflictingEvents = [];
    for (const integration of integrations) {
      const events = await this.calendarEventRepository.findByIntegrationAndDateRange(
        integration.id,
        startDate,
        endDate
      );
      conflictingEvents.push(...events);
    }

    // Calculate available time slots considering conflicts
    return this.calculateAvailableSlots(startDate, endDate, conflictingEvents);
  }

  /**
   * Validate credentials for different providers
   */
  private async validateCredentials(provider: CalendarProvider, credentials: any): Promise<void> {
    switch (provider) {
      case CalendarProvider.GOOGLE:
        await this.googleCalendarService.validateCredentials(credentials);
        break;
      case CalendarProvider.OUTLOOK:
        await this.outlookCalendarService.validateCredentials(credentials);
        break;
      case CalendarProvider.ICAL:
        await this.iCalService.validateCredentials(credentials);
        break;
      case CalendarProvider.INTERNAL:
        // Internal calendar doesn't need external validation
        break;
      default:
        throw new Error(`Unsupported calendar provider: ${provider}`);
    }
  }

  /**
   * Fetch events from the appropriate provider
   */
  private async fetchEventsFromProvider(integration: CalendarIntegrationEntity): Promise<any[]> {
    switch (integration.provider) {
      case CalendarProvider.GOOGLE:
        return await this.googleCalendarService.fetchEvents(
          integration.credentials,
          integration.calendarId || 'primary'
        );
      case CalendarProvider.OUTLOOK:
        return await this.outlookCalendarService.fetchEvents(
          integration.credentials,
          integration.calendarId
        );
      case CalendarProvider.ICAL:
        return await this.iCalService.fetchEvents(
          integration.credentials,
          integration.calendarId
        );
      case CalendarProvider.INTERNAL:
        return await this.internalCalendarService.fetchEvents(
          integration.calendarId || integration.resourceId
        );
      default:
        throw new Error(`Unsupported calendar provider: ${integration.provider}`);
    }
  }

  /**
   * Calculate available time slots considering conflicts
   */
  private calculateAvailableSlots(
    startDate: Date,
    endDate: Date,
    conflictingEvents: CalendarEventEntity[]
  ): any[] {
    const availableSlots = [];
    const conflicts = conflictingEvents.map(event => ({
      start: event.startDate,
      end: event.endDate,
      title: event.title
    }));

    // Sort conflicts by start time
    conflicts.sort((a, b) => a.start.getTime() - b.start.getTime());

    let currentTime = startDate;
    
    for (const conflict of conflicts) {
      // If there's a gap before this conflict, it's available
      if (currentTime < conflict.start) {
        availableSlots.push({
          start: currentTime,
          end: conflict.start,
          available: true
        });
      }
      
      // Mark the conflict period as unavailable
      availableSlots.push({
        start: conflict.start,
        end: conflict.end,
        available: false,
        reason: `Conflicting event: ${conflict.title}`
      });
      
      currentTime = conflict.end > currentTime ? conflict.end : currentTime;
    }
    
    // If there's time left after all conflicts, it's available
    if (currentTime < endDate) {
      availableSlots.push({
        start: currentTime,
        end: endDate,
        available: true
      });
    }

    return availableSlots;
  }

  /**
   * Sync all active integrations
   */
  async syncAllIntegrations(): Promise<void> {
    this.logger.log('Starting sync for all active integrations');
    
    const activeIntegrations = await this.calendarIntegrationRepository.findActive();
    
    for (const integration of activeIntegrations) {
      try {
        await this.syncCalendarEvents(integration.id);
      } catch (error) {
        this.logger.error(`Failed to sync integration ${integration.id}:`, error);
      }
    }
    
    this.logger.log(`Completed sync for ${activeIntegrations.length} integrations`);
  }
}
