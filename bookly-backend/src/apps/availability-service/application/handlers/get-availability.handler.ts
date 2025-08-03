import { QueryHandler, IQueryHandler } from '@nestjs/cqrs';
import { Injectable } from '@nestjs/common';
import { GetAvailabilityQuery, GetResourceAvailabilityQuery, CheckAvailabilityQuery } from '../queries/get-availability.query';
import { AvailabilityRepository } from '../../domain/repositories/availability.repository';
import { ScheduleRepository } from '../../domain/repositories/schedule.repository';
import { ReservationRepository } from '../../domain/repositories/reservation.repository';
import { AvailabilityEntity } from '../../domain/entities/availability.entity';
import { LoggingService } from '../../../../libs/logging/logging.service';

/**
 * Get Availability Query Handler (RF-07, RF-10)
 * Handles availability queries for calendar visualization
 */
@Injectable()
@QueryHandler(GetAvailabilityQuery)
export class GetAvailabilityHandler implements IQueryHandler<GetAvailabilityQuery> {
  constructor(
    private readonly availabilityRepository: AvailabilityRepository,
    private readonly logger: LoggingService
  ) {}

  async execute(query: GetAvailabilityQuery): Promise<AvailabilityEntity[]> {
    this.logger.log(
      `Getting availability for resource ${query.resourceId}`,
      'GetAvailabilityHandler'
    );

    try {
      if (query.resourceId && query.dayOfWeek !== undefined) {
        return await this.availabilityRepository.findByResourceAndDay(
          query.resourceId,
          query.dayOfWeek
        );
      }

      if (query.resourceId) {
        return await this.availabilityRepository.findByResourceId(query.resourceId);
      }

      return await this.availabilityRepository.findAllActive();

    } catch (error) {
      this.logger.error(
        `Failed to get availability for resource ${query.resourceId}`,
        'GetAvailabilityHandler',
        error
      );
      throw error;
    }
  }
}

/**
 * Get Resource Availability Query Handler (RF-10)
 * Provides comprehensive availability data for calendar display
 */
@Injectable()
@QueryHandler(GetResourceAvailabilityQuery)
export class GetResourceAvailabilityHandler implements IQueryHandler<GetResourceAvailabilityQuery> {
  constructor(
    private readonly availabilityRepository: AvailabilityRepository,
    private readonly scheduleRepository: ScheduleRepository,
    private readonly reservationRepository: ReservationRepository,
    private readonly logger: LoggingService
  ) {}

  async execute(query: GetResourceAvailabilityQuery): Promise<any> {
    this.logger.log(
      `Getting availability slots for resource ${query.resourceId} from ${query.startDate} to ${query.endDate}`,
      'GetResourceAvailabilityHandler'
    );

    try {
      const result: any = {
        resourceId: query.resourceId,
        startDate: query.startDate,
        endDate: query.endDate,
        availability: [],
        reservations: [],
        schedules: [],
        timeSlots: []
      };

      // Get basic availability
      result.availability = await this.availabilityRepository.findByResourceId(query.resourceId);

      // Get reservations if requested
      if (query.includeReservations) {
        result.reservations = await this.reservationRepository.findByResourceAndDateRange(
          query.resourceId,
          query.startDate,
          query.endDate
        );
      }

      // Get schedule restrictions if requested
      if (query.includeScheduleRestrictions) {
        result.schedules = await this.scheduleRepository.findActiveByResourceAndDateRange(
          query.resourceId,
          query.startDate,
          query.endDate
        );
      }

      // Generate time slots for calendar display
      result.timeSlots = this.generateTimeSlots(
        query.startDate,
        query.endDate,
        result.availability,
        result.reservations,
        result.schedules
      );

      return result;

    } catch (error) {
      this.logger.error(
        `Failed to fetch resource availability for ${query.resourceId}`,
        'GetResourceAvailabilityHandler',
        error
      );
      throw error;
    }
  }

  private generateTimeSlots(
    startDate: Date,
    endDate: Date,
    availability: AvailabilityEntity[],
    reservations: any[],
    schedules: any[]
  ): any[] {
    const timeSlots: any[] = [];
    const current = new Date(startDate);

    while (current <= endDate) {
      const dayOfWeek = current.getDay();
      const dayAvailability = availability.filter(a => a.dayOfWeek === dayOfWeek && a.isActive);

      for (const avail of dayAvailability) {
        const slotStart = new Date(current);
        const [startHour, startMinute] = avail.startTime.split(':').map(Number);
        slotStart.setHours(startHour, startMinute, 0, 0);

        const slotEnd = new Date(current);
        const [endHour, endMinute] = avail.endTime.split(':').map(Number);
        slotEnd.setHours(endHour, endMinute, 0, 0);

        // Check if slot is blocked by reservations
        const isBlocked = reservations.some(reservation => 
          reservation.startDate < slotEnd && reservation.endDate > slotStart &&
          ['PENDING', 'APPROVED'].includes(reservation.status)
        );

        // Check if slot is affected by schedule restrictions
        const affectingSchedules = schedules.filter(schedule =>
          schedule.isDateWithinSchedule && schedule.isDateWithinSchedule(current)
        );

        timeSlots.push({
          start: slotStart,
          end: slotEnd,
          available: !isBlocked,
          blocked: isBlocked,
          scheduleRestrictions: affectingSchedules,
          dayOfWeek: dayOfWeek
        });
      }

      current.setDate(current.getDate() + 1);
    }

    return timeSlots;
  }
}

/**
 * Check Availability Query Handler
 * Validates if a specific time slot is available
 */
@Injectable()
@QueryHandler(CheckAvailabilityQuery)
export class CheckAvailabilityHandler implements IQueryHandler<CheckAvailabilityQuery> {
  constructor(
    private readonly availabilityRepository: AvailabilityRepository,
    private readonly reservationRepository: ReservationRepository,
    private readonly scheduleRepository: ScheduleRepository,
    private readonly logger: LoggingService
  ) {}

  async execute(query: CheckAvailabilityQuery): Promise<{ available: boolean; conflicts: string[]; restrictions: string[] }> {
    this.logger.log(
      `Checking availability for resource ${query.resourceId} from ${query.startDate} to ${query.endDate}`,
      'CheckAvailabilityHandler'
    );

    try {
      const conflicts: string[] = [];
      const restrictions: string[] = [];

      // Check basic availability hours
      const dayOfWeek = query.startDate.getDay();
      const availabilityRecords = await this.availabilityRepository.findByResourceAndDay(
        query.resourceId,
        dayOfWeek
      );

      const startTime = query.startDate.toTimeString().substring(0, 5);
      const endTime = query.endDate.toTimeString().substring(0, 5);

      const hasBasicAvailability = availabilityRecords.some(avail => 
        avail.isActive &&
        avail.isTimeWithinAvailability(startTime) &&
        avail.isTimeWithinAvailability(endTime)
      );

      if (!hasBasicAvailability) {
        conflicts.push('Time slot is outside basic availability hours');
      }

      // Check for reservation conflicts
      const conflictingReservations = await this.reservationRepository.findConflictingReservations(
        query.resourceId,
        query.startDate,
        query.endDate
      );

      if (conflictingReservations.length > 0) {
        conflicts.push(`Conflicts with ${conflictingReservations.length} existing reservation(s)`);
      }

      // Check schedule restrictions
      const affectingSchedules = await this.scheduleRepository.findByResourceAndDate(
        query.resourceId,
        query.startDate
      );

      for (const schedule of affectingSchedules) {
        if (!schedule.isActive) continue;

        if (!schedule.isDateWithinSchedule(query.startDate)) {
          restrictions.push(`Outside allowed schedule period: ${schedule.name}`);
        }

        // Check advance notice
        const minimumAdvanceNotice = schedule.getMinimumAdvanceNotice();
        if (minimumAdvanceNotice > 0) {
          const now = new Date();
          const hoursUntilStart = (query.startDate.getTime() - now.getTime()) / (1000 * 60 * 60);
          
          if (hoursUntilStart < minimumAdvanceNotice) {
            restrictions.push(`Requires ${minimumAdvanceNotice} hours advance notice`);
          }
        }
      }

      const available = conflicts.length === 0 && restrictions.length === 0;

      return {
        available,
        conflicts,
        restrictions
      };

    } catch (error) {
      this.logger.error(
        `Failed to check availability for resource ${query.resourceId}`,
        'CheckAvailabilityHandler',
        error
      );
      throw error;
    }
  }
}
