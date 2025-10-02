import { QueryHandler, IQueryHandler } from '@nestjs/cqrs';
import { Logger, Inject } from '@nestjs/common';
import { GetCalendarViewQuery } from './get-calendar-view.query';
import { ReservationRepository } from '../../domain/repositories/reservation.repository';
import { ScheduleRepository } from '../../domain/repositories/schedule.repository';
import { CalendarIntegrationService } from '../services/calendar-integration.service';
import { CalendarEventDto, EventType, EventStatus, CalendarViewResponseDto } from '../../../../libs/dto/availability/calendar-view.dto';

/**
 * Handler for GetCalendarViewQuery (RF-10)
 * Returns calendar view data with events, availability, and conflicts
 */
@QueryHandler(GetCalendarViewQuery)
export class GetCalendarViewHandler implements IQueryHandler<GetCalendarViewQuery> {
  private readonly logger = new Logger(GetCalendarViewHandler.name);

  constructor(
    @Inject('ReservationRepository')
    private readonly reservationRepository: ReservationRepository,
    @Inject('ScheduleRepository')
    private readonly scheduleRepository: ScheduleRepository,
    private readonly calendarIntegrationService: CalendarIntegrationService
  ) {}

  async execute(query: GetCalendarViewQuery): Promise<CalendarViewResponseDto> {
    this.logger.log('Executing GetCalendarViewQuery', {
      startDate: query.startDate,
      endDate: query.endDate,
      resourceId: query.resourceId,
      viewType: query.viewType,
      includeAvailability: query.includeAvailability,
      includeExternalEvents: query.includeExternalEvents
    });

    try {
      const events: CalendarEventDto[] = [];
      const eventsByType: Record<EventType, number> = {
        [EventType.RESERVATION]: 0,
        [EventType.SCHEDULE]: 0,
        [EventType.MAINTENANCE]: 0,
        [EventType.EXTERNAL_CALENDAR]: 0,
        [EventType.AVAILABILITY]: 0
      };

      // Get reservations
      if (!query.eventTypes || query.eventTypes.includes(EventType.RESERVATION)) {
        const reservations = query.resourceId
          ? await this.reservationRepository.findByResourceAndDateRange(query.resourceId, query.startDate, query.endDate)
          : await this.reservationRepository.findByDateRange(query.startDate, query.endDate);

        for (const reservation of reservations) {
          const event = this.mapReservationToCalendarEvent(reservation, query.userId);
          events.push(event);
          eventsByType[EventType.RESERVATION]++;
        }
      }

      // Get schedules
      if (!query.eventTypes || query.eventTypes.includes(EventType.SCHEDULE) || query.eventTypes.includes(EventType.MAINTENANCE)) {
        const schedules = query.resourceId
          ? await this.scheduleRepository.findActiveByResourceAndDateRange(query.resourceId, query.startDate, query.endDate)
          : await this.scheduleRepository.findByDateRange(query.startDate, query.endDate);

        for (const schedule of schedules) {
          const scheduleEvents = this.generateEventsFromSchedule(schedule, query.startDate, query.endDate, query.userId);
          events.push(...scheduleEvents);
          
          scheduleEvents.forEach(event => {
            eventsByType[event.type]++;
          });
        }
      }

      // Get external calendar events
      if (query.includeExternalEvents && query.resourceId && 
          (!query.eventTypes || query.eventTypes.includes(EventType.EXTERNAL_CALENDAR))) {
        try {
          const externalEvents = await this.getExternalCalendarEvents(query.resourceId, query.startDate, query.endDate);
          events.push(...externalEvents);
          eventsByType[EventType.EXTERNAL_CALENDAR] += externalEvents.length;
        } catch (error) {
          this.logger.warn('Failed to fetch external calendar events', { error: error.message });
        }
      }

      // Generate availability slots
      if (query.includeAvailability && 
          (!query.eventTypes || query.eventTypes.includes(EventType.AVAILABILITY))) {
        const availabilityEvents = await this.generateAvailabilityEvents(
          query.resourceId,
          query.startDate,
          query.endDate,
          events.filter(e => e.type !== EventType.AVAILABILITY)
        );
        events.push(...availabilityEvents);
        eventsByType[EventType.AVAILABILITY] += availabilityEvents.length;
      }

      // Sort events by start date
      events.sort((a, b) => a.startDate.getTime() - b.startDate.getTime());

      const response: CalendarViewResponseDto = {
        events,
        view: {
          type: query.viewType,
          startDate: query.startDate,
          endDate: query.endDate,
          resourceId: query.resourceId
        },
        summary: {
          totalEvents: events.length,
          reservations: eventsByType[EventType.RESERVATION],
          availableSlots: eventsByType[EventType.AVAILABILITY],
          conflicts: this.countConflicts(events),
          eventsByType
        }
      };

      // Add resource information if specific resource requested
      if (query.resourceId) {
        response.resource = await this.getResourceInfo(query.resourceId);
      }

      this.logger.log('Calendar view generated successfully', {
        totalEvents: events.length,
        resourceId: query.resourceId,
        viewType: query.viewType
      });

      return response;
    } catch (error) {
      this.logger.error('Failed to get calendar view', {
        error: error.message,
        resourceId: query.resourceId,
        viewType: query.viewType
      });
      throw error;
    }
  }

  /**
   * Map reservation to calendar event
   */
  private mapReservationToCalendarEvent(reservation: any, userId?: string): CalendarEventDto {
    return {
      id: `reservation-${reservation.id}`,
      title: reservation.title || 'Reserved',
      description: reservation.description,
      startDate: reservation.startDate,
      endDate: reservation.endDate,
      type: EventType.RESERVATION,
      status: this.mapReservationStatus(reservation.status),
      resourceId: reservation.resourceId,
      userId: reservation.userId,
      isAllDay: false,
      color: this.getEventColor(EventType.RESERVATION, reservation.status),
      editable: userId === reservation.userId,
      metadata: {
        reservationId: reservation.id,
        isRecurring: reservation.isRecurring
      }
    };
  }

  /**
   * Generate events from schedule recurrence rules
   */
  private generateEventsFromSchedule(schedule: any, startDate: Date, endDate: Date, userId?: string): CalendarEventDto[] {
    const events: CalendarEventDto[] = [];
    const eventType = schedule.type === 'MAINTENANCE' ? EventType.MAINTENANCE : EventType.SCHEDULE;

    // Simple implementation - for complex recurrence, we'd use a library like rrule
    if (schedule.recurrenceRule && schedule.recurrenceRule.frequency) {
      const frequency = schedule.recurrenceRule.frequency;
      const interval = schedule.recurrenceRule.interval || 1;
      
      let currentDate = new Date(Math.max(schedule.startDate.getTime(), startDate.getTime()));
      
      while (currentDate <= endDate && currentDate <= (schedule.endDate || endDate)) {
        const eventStart = new Date(currentDate);
        const eventEnd = new Date(currentDate);
        
        // Set time from recurrence rule or default
        if (schedule.recurrenceRule.startTime) {
          const [hours, minutes] = schedule.recurrenceRule.startTime.split(':');
          eventStart.setHours(parseInt(hours), parseInt(minutes), 0, 0);
        }
        
        if (schedule.recurrenceRule.endTime) {
          const [hours, minutes] = schedule.recurrenceRule.endTime.split(':');
          eventEnd.setHours(parseInt(hours), parseInt(minutes), 0, 0);
        } else {
          eventEnd.setHours(eventStart.getHours() + 1); // Default 1 hour duration
        }
        
        events.push({
          id: `schedule-${schedule.id}-${currentDate.toISOString().split('T')[0]}`,
          title: schedule.name || (eventType === EventType.MAINTENANCE ? 'Maintenance' : 'Scheduled'),
          description: `${eventType === EventType.MAINTENANCE ? 'Maintenance' : 'Schedule'}: ${schedule.name}`,
          startDate: eventStart,
          endDate: eventEnd,
          type: eventType,
          status: EventStatus.CONFIRMED,
          resourceId: schedule.resourceId,
          isAllDay: !schedule.recurrenceRule.startTime,
          color: this.getEventColor(eventType),
          editable: false,
          metadata: {
            scheduleId: schedule.id,
            scheduleType: schedule.type
          }
        });
        
        // Move to next occurrence
        switch (frequency.toLowerCase()) {
          case 'daily':
            currentDate.setDate(currentDate.getDate() + interval);
            break;
          case 'weekly':
            currentDate.setDate(currentDate.getDate() + (7 * interval));
            break;
          case 'monthly':
            currentDate.setMonth(currentDate.getMonth() + interval);
            break;
          default:
            break;
        }
        
        // Safety check
        if (events.length > 100) {
          this.logger.warn(`Generated maximum events (100) for schedule ${schedule.id}`);
          break;
        }
      }
    } else {
      // Single occurrence schedule
      if (schedule.startDate >= startDate && schedule.startDate <= endDate) {
        events.push({
          id: `schedule-${schedule.id}`,
          title: schedule.name || (eventType === EventType.MAINTENANCE ? 'Maintenance' : 'Scheduled Event'),
          description: `${eventType === EventType.MAINTENANCE ? 'Maintenance' : 'Schedule'}: ${schedule.name}`,
          startDate: schedule.startDate,
          endDate: schedule.endDate || schedule.startDate,
          type: eventType,
          status: EventStatus.CONFIRMED,
          resourceId: schedule.resourceId,
          isAllDay: !schedule.endDate,
          color: this.getEventColor(eventType),
          editable: false,
          metadata: {
            scheduleId: schedule.id,
            scheduleType: schedule.type
          }
        });
      }
    }
    
    return events;
  }

  /**
   * Get external calendar events
   */
  private async getExternalCalendarEvents(resourceId: string, startDate: Date, endDate: Date): Promise<CalendarEventDto[]> {
    const events: CalendarEventDto[] = [];
    
    try {
      const conflicts = await this.calendarIntegrationService.getAvailabilityWithCalendarConflicts(
        resourceId,
        startDate,
        endDate
      );

      for (const conflict of conflicts) {
        if (!conflict.available && conflict.reason) {
          events.push({
            id: `external-${conflict.start.getTime()}`,
            title: conflict.reason,
            description: 'External calendar event',
            startDate: conflict.start,
            endDate: conflict.end,
            type: EventType.EXTERNAL_CALENDAR,
            status: EventStatus.CONFIRMED,
            resourceId,
            isAllDay: false,
            color: this.getEventColor(EventType.EXTERNAL_CALENDAR),
            editable: false,
            metadata: {
              source: 'external',
              conflictReason: conflict.reason
            }
          });
        }
      }
    } catch (error) {
      this.logger.warn('Failed to get external calendar events', { error: error.message });
    }

    return events;
  }

  /**
   * Generate availability events (free time slots)
   */
  private async generateAvailabilityEvents(
    resourceId: string | undefined,
    startDate: Date,
    endDate: Date,
    existingEvents: CalendarEventDto[]
  ): Promise<CalendarEventDto[]> {
    const availabilityEvents: CalendarEventDto[] = [];
    
    // Simple implementation - generate hourly availability slots
    const businessHours = { start: 8, end: 18 }; // 8 AM to 6 PM
    let currentDate = new Date(startDate);
    
    while (currentDate < endDate) {
      // Skip weekends for now (simple implementation)
      if (currentDate.getDay() === 0 || currentDate.getDay() === 6) {
        currentDate.setDate(currentDate.getDate() + 1);
        currentDate.setHours(0, 0, 0, 0);
        continue;
      }
      
      for (let hour = businessHours.start; hour < businessHours.end; hour++) {
        const slotStart = new Date(currentDate);
        slotStart.setHours(hour, 0, 0, 0);
        
        const slotEnd = new Date(slotStart);
        slotEnd.setHours(hour + 1, 0, 0, 0);
        
        // Check if this slot conflicts with existing events
        const hasConflict = existingEvents.some(event =>
          this.isTimeOverlapping(slotStart, slotEnd, event.startDate, event.endDate)
        );
        
        if (!hasConflict) {
          availabilityEvents.push({
            id: `availability-${resourceId || 'all'}-${slotStart.getTime()}`,
            title: 'Available',
            description: 'Available time slot',
            startDate: slotStart,
            endDate: slotEnd,
            type: EventType.AVAILABILITY,
            status: EventStatus.CONFIRMED,
            resourceId: resourceId || '',
            isAllDay: false,
            color: this.getEventColor(EventType.AVAILABILITY),
            editable: true,
            metadata: {
              available: true
            }
          });
        }
      }
      
      // Move to next day
      currentDate.setDate(currentDate.getDate() + 1);
      currentDate.setHours(0, 0, 0, 0);
    }
    
    return availabilityEvents;
  }

  /**
   * Check if two time ranges overlap
   */
  private isTimeOverlapping(start1: Date, end1: Date, start2: Date, end2: Date): boolean {
    return start1 < end2 && end1 > start2;
  }

  /**
   * Map reservation status to event status
   */
  private mapReservationStatus(status: string): EventStatus {
    switch (status) {
      case 'CONFIRMED':
        return EventStatus.CONFIRMED;
      case 'PENDING':
        return EventStatus.PENDING;
      case 'CANCELLED':
        return EventStatus.CANCELLED;
      default:
        return EventStatus.TENTATIVE;
    }
  }

  /**
   * Get event color based on type and status
   */
  private getEventColor(type: EventType, status?: string): string {
    switch (type) {
      case EventType.RESERVATION:
        return status === 'CONFIRMED' ? '#3498db' : '#f39c12';
      case EventType.SCHEDULE:
        return '#2ecc71';
      case EventType.MAINTENANCE:
        return '#e74c3c';
      case EventType.EXTERNAL_CALENDAR:
        return '#9b59b6';
      case EventType.AVAILABILITY:
        return '#95a5a6';
      default:
        return '#34495e';
    }
  }

  /**
   * Count conflicts between events
   */
  private countConflicts(events: CalendarEventDto[]): number {
    let conflicts = 0;
    
    for (let i = 0; i < events.length; i++) {
      for (let j = i + 1; j < events.length; j++) {
        if (events[i].resourceId === events[j].resourceId &&
            events[i].type !== EventType.AVAILABILITY &&
            events[j].type !== EventType.AVAILABILITY &&
            this.isTimeOverlapping(
              events[i].startDate, events[i].endDate,
              events[j].startDate, events[j].endDate
            )) {
          conflicts++;
        }
      }
    }
    
    return conflicts;
  }

  /**
   * Get resource information
   */
  private async getResourceInfo(resourceId: string): Promise<any> {
    // This would typically fetch from a resource repository
    // For now, return a placeholder
    return {
      id: resourceId,
      name: `Resource ${resourceId}`,
      type: 'CLASSROOM',
      capacity: 30
    };
  }
}
