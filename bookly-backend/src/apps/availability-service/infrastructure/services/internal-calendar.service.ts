import { Injectable, Logger, Inject } from '@nestjs/common';
import { ReservationRepository } from '../../domain/repositories/reservation.repository';
import { ScheduleRepository } from '../../domain/repositories/schedule.repository';
import { ReservationStatus } from '../../domain/entities/reservation.entity';

/**
 * Internal Calendar Service (RF-08)
 * Handles integration with Bookly's internal calendar system
 */
@Injectable()
export class InternalCalendarService {
  private readonly logger = new Logger(InternalCalendarService.name);

  constructor(
    @Inject('ReservationRepository')
    private readonly reservationRepository: ReservationRepository,
    @Inject('ScheduleRepository')
    private readonly scheduleRepository: ScheduleRepository
  ) {}

  /**
   * Validate internal calendar credentials (always valid)
   */
  async validateCredentials(credentials: any): Promise<void> {
    // Internal calendar doesn't need external validation
    this.logger.log('Internal calendar credentials validated (no external validation needed)');
  }

  /**
   * Fetch events from internal calendar (reservations and schedules)
   */
  async fetchEvents(resourceId?: string): Promise<any[]> {
    try {
      const events = [];
      
      // Get events for the next 30 days
      const now = new Date();
      const futureDate = new Date();
      futureDate.setDate(now.getDate() + 30);

      // Fetch reservations as events
      const reservations = resourceId 
        ? await this.reservationRepository.findByResourceAndDateRange(resourceId, now, futureDate)
        : await this.reservationRepository.findByDateRange(now, futureDate);

      for (const reservation of reservations) {
        events.push({
          externalEventId: `reservation-${reservation.id}`,
          title: reservation.title || 'Reserved',
          description: reservation.description || '',
          startTime: reservation.startDate,
          endTime: reservation.endDate,
          isAllDay: false,
          location: '', // Will be filled from resource info
          attendees: [reservation.userId], // User who made the reservation
          status: this.mapReservationStatus(reservation.status),
          lastModified: reservation.updatedAt,
          metadata: {
            type: 'reservation',
            reservationId: reservation.id,
            resourceId: reservation.resourceId,
            userId: reservation.userId,
            isRecurring: reservation.isRecurring
          }
        });
      }

      // Fetch maintenance schedules as events
      const maintenanceSchedules = resourceId
        ? await this.scheduleRepository.findByResourceAndType(resourceId, 'MAINTENANCE')
        : await this.scheduleRepository.findByType('MAINTENANCE');

      for (const schedule of maintenanceSchedules) {
        // Generate events based on schedule recurrence
        const scheduleEvents = this.generateEventsFromSchedule(schedule, now, futureDate);
        events.push(...scheduleEvents);
      }

      this.logger.log(`Fetched ${events.length} events from internal calendar`);
      return events;
    } catch (error) {
      this.logger.error('Failed to fetch internal calendar events:', error);
      throw error;
    }
  }

  /**
   * Create an event in internal calendar
   */
  async createEvent(calendarId: string | undefined, eventData: any): Promise<string> {
    try {
      // For internal calendar, we create a reservation
      const reservation = await this.reservationRepository.create({
        title: eventData.title,
        description: eventData.description,
        startDate: eventData.startTime,
        endDate: eventData.endTime,
        resourceId: calendarId || eventData.resourceId,
        userId: eventData.userId || 'system',
        status: ReservationStatus.APPROVED,
        isRecurring: false
      });

      this.logger.log(`Created internal calendar event (reservation): ${reservation.id}`);
      return `reservation-${reservation.id}`;
    } catch (error) {
      this.logger.error('Failed to create internal calendar event:', error);
      throw error;
    }
  }

  /**
   * Update an event in internal calendar
   */
  async updateEvent(calendarId: string | undefined, eventId: string, eventData: any): Promise<void> {
    try {
      // Extract reservation ID from event ID
      const reservationId = eventId.replace('reservation-', '');
      
      await this.reservationRepository.update(reservationId, {
        title: eventData.title,
        description: eventData.description,
        startDate: eventData.startTime,
        endDate: eventData.endTime
      });

      this.logger.log(`Updated internal calendar event: ${eventId}`);
    } catch (error) {
      this.logger.error('Failed to update internal calendar event:', error);
      throw error;
    }
  }

  /**
   * Delete an event from internal calendar
   */
  async deleteEvent(calendarId: string | undefined, eventId: string): Promise<void> {
    try {
      // Extract reservation ID from event ID
      const reservationId = eventId.replace('reservation-', '');
      
      await this.reservationRepository.update(reservationId, {
        status: ReservationStatus.CANCELLED
      });

      this.logger.log(`Cancelled internal calendar event: ${eventId}`);
    } catch (error) {
      this.logger.error('Failed to delete internal calendar event:', error);
      throw error;
    }
  }

  /**
   * Generate events from schedule recurrence rules
   */
  private generateEventsFromSchedule(schedule: any, startDate: Date, endDate: Date): any[] {
    const events = [];
    
    // Simple implementation - for complex recurrence, we'd use a library like rrule
    if (schedule.recurrenceRule && schedule.recurrenceRule.frequency) {
      const frequency = schedule.recurrenceRule.frequency;
      const interval = schedule.recurrenceRule.interval || 1;
      
      let currentDate = new Date(Math.max(schedule.startDate.getTime(), startDate.getTime()));
      
      while (currentDate <= endDate && currentDate <= (schedule.endDate || endDate)) {
        // Create event for this occurrence
        const eventStart = new Date(currentDate);
        const eventEnd = new Date(currentDate);
        
        // Set time from recurrence rule or default to full day
        if (schedule.recurrenceRule.startTime) {
          const [hours, minutes] = schedule.recurrenceRule.startTime.split(':');
          eventStart.setHours(parseInt(hours), parseInt(minutes), 0, 0);
        }
        
        if (schedule.recurrenceRule.endTime) {
          const [hours, minutes] = schedule.recurrenceRule.endTime.split(':');
          eventEnd.setHours(parseInt(hours), parseInt(minutes), 0, 0);
        } else {
          eventEnd.setHours(23, 59, 59, 999);
        }
        
        events.push({
          externalEventId: `schedule-${schedule.id}-${currentDate.toISOString().split('T')[0]}`,
          title: schedule.name || 'Maintenance',
          description: `Scheduled maintenance: ${schedule.name}`,
          startTime: eventStart,
          endTime: eventEnd,
          isAllDay: !schedule.recurrenceRule.startTime,
          location: '',
          attendees: [],
          status: 'CONFIRMED',
          lastModified: schedule.updatedAt,
          metadata: {
            type: 'schedule',
            scheduleId: schedule.id,
            resourceId: schedule.resourceId,
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
            // If frequency is not recognized, break to avoid infinite loop
            break;
        }
        
        // Safety check to avoid infinite loops
        if (events.length > 100) {
          this.logger.warn(`Generated maximum number of events (100) for schedule ${schedule.id}`);
          break;
        }
      }
    } else {
      // Single occurrence schedule
      if (schedule.startDate >= startDate && schedule.startDate <= endDate) {
        events.push({
          externalEventId: `schedule-${schedule.id}`,
          title: schedule.name || 'Scheduled Event',
          description: `Scheduled event: ${schedule.name}`,
          startTime: schedule.startDate,
          endTime: schedule.endDate || schedule.startDate,
          isAllDay: !schedule.endDate,
          location: '',
          attendees: [],
          status: 'CONFIRMED',
          lastModified: schedule.updatedAt,
          metadata: {
            type: 'schedule',
            scheduleId: schedule.id,
            resourceId: schedule.resourceId,
            scheduleType: schedule.type
          }
        });
      }
    }
    
    return events;
  }

  /**
   * Map reservation status to calendar event status
   */
  private mapReservationStatus(status: string): string {
    switch (status) {
      case 'CONFIRMED':
        return 'CONFIRMED';
      case 'PENDING':
        return 'TENTATIVE';
      case 'CANCELLED':
        return 'CANCELLED';
      default:
        return 'CONFIRMED';
    }
  }
}
