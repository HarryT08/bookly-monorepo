import { QueryHandler, IQueryHandler } from '@nestjs/cqrs';
import { Logger, Inject } from '@nestjs/common';
import { GetAvailabilityWithConflictsQuery } from './get-availability-with-conflicts.query';
import { CalendarIntegrationService } from '../services/calendar-integration.service';
import { ScheduleRepository } from '../../domain/repositories/schedule.repository';
import { ReservationRepository } from '../../domain/repositories/reservation.repository';

/**
 * Handler for GetAvailabilityWithConflictsQuery (RF-08)
 * Returns availability considering calendar conflicts from external providers
 */
@QueryHandler(GetAvailabilityWithConflictsQuery)
export class GetAvailabilityWithConflictsHandler implements IQueryHandler<GetAvailabilityWithConflictsQuery> {
  private readonly logger = new Logger(GetAvailabilityWithConflictsHandler.name);

  constructor(
    private readonly calendarIntegrationService: CalendarIntegrationService,
    @Inject('ScheduleRepository')
    private readonly scheduleRepository: ScheduleRepository,
    @Inject('ReservationRepository')
    private readonly reservationRepository: ReservationRepository
  ) {}

  async execute(query: GetAvailabilityWithConflictsQuery): Promise<any> {
    this.logger.log('Executing GetAvailabilityWithConflictsQuery', {
      resourceId: query.resourceId,
      startDate: query.startDate,
      endDate: query.endDate,
      includeConflicts: query.includeConflicts
    });

    try {
      // Get base availability from schedules
      const schedules = await this.scheduleRepository.findActiveByResourceAndDateRange(
        query.resourceId,
        query.startDate,
        query.endDate
      );

      // Get existing reservations
      const reservations = await this.reservationRepository.findByResourceAndDateRange(
        query.resourceId,
        query.startDate,
        query.endDate
      );

      // Get calendar conflicts if requested
      let calendarConflicts = [];
      if (query.includeConflicts) {
        calendarConflicts = await this.calendarIntegrationService.getAvailabilityWithCalendarConflicts(
          query.resourceId,
          query.startDate,
          query.endDate
        );
      }

      // Calculate final availability
      const availability = this.calculateFinalAvailability(
        schedules,
        reservations,
        calendarConflicts,
        query.startDate,
        query.endDate
      );

      this.logger.log('Availability calculated successfully', {
        resourceId: query.resourceId,
        availableSlots: availability.availableSlots.length,
        conflictingSlots: availability.conflicts.length
      });

      return {
        resourceId: query.resourceId,
        dateRange: {
          startDate: query.startDate,
          endDate: query.endDate
        },
        availableSlots: availability.availableSlots,
        conflicts: availability.conflicts,
        summary: {
          totalSlots: availability.availableSlots.length + availability.conflicts.length,
          availableSlots: availability.availableSlots.length,
          conflictingSlots: availability.conflicts.length,
          conflictSources: this.getConflictSources(availability.conflicts)
        }
      };
    } catch (error) {
      this.logger.error('Failed to get availability with conflicts', {
        error: error.message,
        resourceId: query.resourceId
      });
      throw error;
    }
  }

  /**
   * Calculate final availability considering all constraints
   */
  private calculateFinalAvailability(
    schedules: any[],
    reservations: any[],
    calendarConflicts: any[],
    startDate: Date,
    endDate: Date
  ): any {
    const availableSlots = [];
    const conflicts = [];

    // Generate time slots based on schedules
    const timeSlots = this.generateTimeSlotsFromSchedules(schedules, startDate, endDate);

    for (const slot of timeSlots) {
      const slotConflicts = [];

      // Check for reservation conflicts
      const reservationConflict = reservations.find(reservation =>
        this.isTimeOverlapping(slot.start, slot.end, reservation.startDate, reservation.endDate)
      );

      if (reservationConflict) {
        slotConflicts.push({
          type: 'reservation',
          source: 'internal',
          title: reservationConflict.title,
          conflictId: reservationConflict.id
        });
      }

      // Check for calendar conflicts
      const calendarConflict = calendarConflicts.find(conflict =>
        !conflict.available && 
        this.isTimeOverlapping(slot.start, slot.end, conflict.start, conflict.end)
      );

      if (calendarConflict) {
        slotConflicts.push({
          type: 'calendar',
          source: 'external',
          title: calendarConflict.reason || 'External calendar conflict',
          conflictId: `calendar-${slot.start.getTime()}`
        });
      }

      // Categorize slot
      if (slotConflicts.length > 0) {
        conflicts.push({
          ...slot,
          available: false,
          conflicts: slotConflicts
        });
      } else {
        availableSlots.push({
          ...slot,
          available: true
        });
      }
    }

    return { availableSlots, conflicts };
  }

  /**
   * Generate time slots from schedules
   */
  private generateTimeSlotsFromSchedules(schedules: any[], startDate: Date, endDate: Date): any[] {
    const slots = [];
    
    // Simple implementation - generate hourly slots during business hours
    let currentDate = new Date(startDate);
    
    while (currentDate < endDate) {
      // Check if this date/time is covered by any schedule
      const applicableSchedule = schedules.find(schedule =>
        this.isDateInSchedule(currentDate, schedule)
      );

      if (applicableSchedule) {
        // Generate slots for this schedule
        const daySlots = this.generateSlotsForDay(currentDate, applicableSchedule);
        slots.push(...daySlots);
      }

      // Move to next day
      currentDate.setDate(currentDate.getDate() + 1);
      currentDate.setHours(0, 0, 0, 0);
    }

    return slots;
  }

  /**
   * Generate slots for a specific day based on schedule
   */
  private generateSlotsForDay(date: Date, schedule: any): any[] {
    const slots = [];
    const startHour = 8; // Default business hours
    const endHour = 18;
    const slotDuration = 60; // 1 hour slots

    for (let hour = startHour; hour < endHour; hour++) {
      const slotStart = new Date(date);
      slotStart.setHours(hour, 0, 0, 0);
      
      const slotEnd = new Date(slotStart);
      slotEnd.setMinutes(slotEnd.getMinutes() + slotDuration);

      slots.push({
        start: slotStart,
        end: slotEnd,
        duration: slotDuration,
        scheduleId: schedule.id
      });
    }

    return slots;
  }

  /**
   * Check if a date is covered by a schedule
   */
  private isDateInSchedule(date: Date, schedule: any): boolean {
    return date >= schedule.startDate && 
           (!schedule.endDate || date <= schedule.endDate) &&
           schedule.isActive;
  }

  /**
   * Check if two time ranges overlap
   */
  private isTimeOverlapping(start1: Date, end1: Date, start2: Date, end2: Date): boolean {
    return start1 < end2 && end1 > start2;
  }

  /**
   * Get summary of conflict sources
   */
  private getConflictSources(conflicts: any[]): any {
    const sources = {
      internal: 0,
      external: 0,
      types: {}
    };

    conflicts.forEach(conflict => {
      conflict.conflicts?.forEach((conf: any) => {
        if (conf.source === 'internal') {
          sources.internal++;
        } else {
          sources.external++;
        }
        
        sources.types[conf.type] = (sources.types[conf.type] || 0) + 1;
      });
    });

    return sources;
  }
}
