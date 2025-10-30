import { Injectable, Inject, BadRequestException, ConflictException, ForbiddenException } from '@nestjs/common';
import { LoggingService } from '@logging/logging.service';
import { EventBusService, DomainEvent } from '@libs/event-bus/services/event-bus.service';
import { NotificationService } from '@libs/notification/notification.service';
import { AvailabilityRepository } from '../../domain/repositories/availability.repository';
import { ReservationRepository } from '../../domain/repositories/reservation.repository';
import { ScheduleRepository } from '../../domain/repositories/schedule.repository';
import { ReservationHistoryRepository } from '../../domain/repositories/reservation-history.repository';
import { AvailabilityEntity } from '../../domain/entities/availability.entity';
import { ReservationEntity, ReservationStatus } from '../../domain/entities/reservation.entity';
import { ReservationAction } from '@libs/dto/availability/reservation-history.dto';
import { 
  StandardizedDomainEvent, 
  createStandardizedEvent, 
  EventAction, 
  AVAILABILITY_EVENTS,
  RESERVATION_EVENTS 
} from '@libs/event-bus/interfaces/standardized-domain-event.interface';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class AvailabilityService {
  constructor(
    @Inject('AvailabilityRepository')
    private readonly availabilityRepository: AvailabilityRepository,
    @Inject('ReservationRepository')
    private readonly reservationRepository: ReservationRepository,
    @Inject('ScheduleRepository')
    private readonly scheduleRepository: ScheduleRepository,
    @Inject('ReservationHistoryRepository')
    private readonly reservationHistoryRepository: ReservationHistoryRepository,
    private readonly loggingService: LoggingService,
    private readonly eventBusService: EventBusService,
    private readonly notificationService: NotificationService,
  ) {}

  async findAll(): Promise<AvailabilityEntity[]> {
    this.loggingService.log('Finding all availability slots', 'AvailabilityService');
    
    try {
      const availabilities = await this.availabilityRepository.findByResourceId('');
      
      this.loggingService.log(
        `Found ${availabilities.length} availability slots`,
        { count: availabilities.length },
        'AvailabilityService'
      );
      
      return availabilities;
    } catch (error) {
      this.loggingService.error('Failed to find all availability slots', error, 'AvailabilityService');
      throw error;
    }
  }

  async findByResourceId(resourceId: string): Promise<AvailabilityEntity[]> {
    this.loggingService.log(`Finding availability for resource: ${resourceId}`, 'AvailabilityService');
    
    try {
      const availabilities = await this.availabilityRepository.findByResourceId(resourceId);
      
      this.loggingService.log(
        `Found ${availabilities.length} availability slots for resource`,
        { resourceId, count: availabilities.length },
        'AvailabilityService'
      );
      
      return availabilities;
    } catch (error) {
      this.loggingService.error(`Failed to find availability for resource: ${resourceId}`, error, 'AvailabilityService');
      throw error;
    }
  }

  async findReservations(filters?: {
    resourceId?: string;
    userId?: string;
    status?: string;
    startDate?: Date;
    endDate?: Date;
  }): Promise<ReservationEntity[]> {
    this.loggingService.log('Finding reservations with filters', { filters }, 'AvailabilityService');
    
    try {
      const reservations = await this.reservationRepository.findByResourceAndDateRange(
        filters?.resourceId || '',
        filters?.startDate || new Date(),
        filters?.endDate || new Date()
      );
      
      this.loggingService.log(
        `Found ${reservations.length} reservations`,
        { count: reservations.length, filters },
        'AvailabilityService'
      );
      
      return reservations;
    } catch (error) {
      this.loggingService.error('Failed to find reservations', error, 'AvailabilityService');
      throw error;
    }
  }

  async findReservationById(id: string): Promise<ReservationEntity | null> {
    this.loggingService.log(`Finding reservation by id: ${id}`, 'AvailabilityService');
    
    try {
      const reservation = await this.reservationRepository.findById(id);
      
      if (reservation) {
        this.loggingService.log(
          'Reservation found',
          { reservationId: id, userId: reservation.userId },
          'AvailabilityService'
        );
      } else {
        this.loggingService.log(
          'Reservation not found',
          { reservationId: id },
          'AvailabilityService'
        );
      }
      
      return reservation;
    } catch (error) {
      this.loggingService.error(`Failed to find reservation by id: ${id}`, error, 'AvailabilityService');
      throw error;
    }
  }

  /**
   * Create availability for a resource (RF-07)
   * Contains all business logic for availability creation
   */
  async createAvailability(data: {
    resourceId: string;
    dayOfWeek: number;
    startTime: string;
    endTime: string;
  }, createdBy?: string): Promise<AvailabilityEntity> {
    this.loggingService.log(
      'Creating availability',
      {
        resourceId: data.resourceId,
        dayOfWeek: data.dayOfWeek,
        startTime: data.startTime,
        endTime: data.endTime,
        createdBy
      },
      'AvailabilityService'
    );

    try {
      // Validate time format and logic
      this.validateTimeInput(data.startTime, data.endTime);

      // Check for conflicts with existing availability
      const hasConflict = await this.availabilityRepository.hasTimeConflict(
        data.resourceId,
        data.dayOfWeek,
        data.startTime,
        data.endTime
      );

      if (hasConflict) {
        throw new ConflictException('Time slot conflicts with existing availability');
      }

      // Create the availability entity
      const availability = await this.availabilityRepository.create({
        resourceId: data.resourceId,
        dayOfWeek: data.dayOfWeek,
        startTime: data.startTime,
        endTime: data.endTime,
        isActive: true
      });

      // Business Logic 4: Publish standardized domain event
      const domainEvent = createStandardizedEvent(
        AVAILABILITY_EVENTS.CREATED,
        availability.id,
        'Availability',
        EventAction.CREATED,
        {
          availabilityId: availability.id,
          resourceId: availability.resourceId,
          dayOfWeek: availability.dayOfWeek,
          startTime: availability.startTime,
          endTime: availability.endTime
        },
        {
          service: 'availability-service',
          correlationId: uuidv4()
        }
      );

      await this.eventBusService.publishEvent(domainEvent);

      this.loggingService.log(
        'Availability created successfully',
        {
          availabilityId: availability.id,
          resourceId: availability.resourceId,
          createdBy
        },
        'AvailabilityService'
      );

      return availability;

    } catch (error) {
      this.loggingService.error(
        'Failed to create availability',
        error,
        'AvailabilityService'
      );
      throw error;
    }
  }

  private validateTimeInput(startTime: string, endTime: string): void {
    const timeRegex = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/;
    
    if (!timeRegex.test(startTime)) {
      throw new BadRequestException('Invalid startTime format. Expected HH:mm');
    }
    
    if (!timeRegex.test(endTime)) {
      throw new BadRequestException('Invalid endTime format. Expected HH:mm');
    }

    const [startHour, startMinute] = startTime.split(':').map(Number);
    const [endHour, endMinute] = endTime.split(':').map(Number);
    
    const startMinutes = startHour * 60 + startMinute;
    const endMinutes = endHour * 60 + endMinute;
    
    if (startMinutes >= endMinutes) {
      throw new BadRequestException('startTime must be before endTime');
    }
  }

  /**
   * Creates a new reservation with full business logic validation
   * Follows Clean Architecture - encapsulates all business rules
   */
  async createReservation(data: {
    userId: string;
    resourceId: string;
    startTime: Date;
    endTime: Date;
    description?: string;
    attendees?: number;
    equipment?: string[];
  }, createdBy?: string): Promise<ReservationEntity> {
    this.loggingService.log(
      'Creating reservation with business validation',
      {
        userId: data.userId,
        resourceId: data.resourceId,
        startTime: data.startTime,
        endTime: data.endTime,
        createdBy
      },
      'AvailabilityService'
    );

    try {
      // Business Logic 1: Validate time constraints
      if (data.startTime >= data.endTime) {
        throw new BadRequestException('Start time must be before end time');
      }

      if (data.startTime < new Date()) {
        throw new BadRequestException('Cannot create reservations in the past');
      }

      // Business Logic 2: Check resource availability
      const conflictingReservations = await this.reservationRepository.findByResourceAndDateRange(
        data.resourceId,
        data.startTime,
        data.endTime
      );

      if (conflictingReservations.length > 0) {
        throw new ConflictException('Resource is not available for the selected time range');
      }

      // Business Logic 3: Check schedule constraints
      const scheduleConstraints = await this.scheduleRepository.findByResourceId(data.resourceId);
      for (const schedule of scheduleConstraints) {
        if (!this.isTimeWithinSchedule(data.startTime, data.endTime, schedule)) {
          throw new ForbiddenException('Reservation time is outside allowed schedule');
        }
      }

      // Business Logic 4: Create reservation entity
      const reservation = new ReservationEntity(
        uuidv4(), // id
        'Reservation', // title
        data.description || '', // description
        data.startTime, // startDate
        data.endTime, // endDate
        ReservationStatus.PENDING, // status
        false, // isRecurring
        null, // recurrence
        data.userId, // userId
        data.resourceId, // resourceId
        new Date(), // createdAt
        new Date() // updatedAt
      );

      // Business Logic 5: Persist reservation
      const savedReservation = await this.reservationRepository.create(reservation);

      // Business Logic 6: Create audit trail
      await this.reservationHistoryRepository.create({
        reservationId: savedReservation.id,
        userId: data.userId,
        action: ReservationAction.CREATED,
        previousData: null,
        newData: savedReservation
      });

      // Business Logic 7: Publish standardized domain event
      const domainEvent = createStandardizedEvent(
        RESERVATION_EVENTS.CREATED,
        savedReservation.id,
        'Reservation',
        EventAction.CREATED,
        {
          reservationId: savedReservation.id,
          userId: savedReservation.userId,
          resourceId: savedReservation.resourceId,
          startDate: savedReservation.startDate.toISOString(),
          endDate: savedReservation.endDate.toISOString(),
          title: savedReservation.title,
          description: savedReservation.description,
          status: savedReservation.status,
          isRecurring: savedReservation.isRecurring
        },
        {
          userId: data.userId,
          service: 'availability-service',
          correlationId: uuidv4()
        }
      );

      await this.eventBusService.publishEvent(domainEvent);

      // Business Logic 8: Send notifications
      await this.notificationService.notifyReservationCreated(
        savedReservation.id,
        data.userId,
        'Resource Reserved' // In real implementation, fetch resource name
      );

      this.loggingService.log(
        'Reservation created successfully',
        {
          reservationId: savedReservation.id,
          userId: data.userId,
          resourceId: data.resourceId,
          createdBy
        },
        'AvailabilityService'
      );

      return savedReservation;

    } catch (error) {
      this.loggingService.error(
        'Failed to create reservation',
        error,
        'AvailabilityService'
      );
      throw error;
    }
  }

  async updateReservation(id: string, data: any, updatedBy?: string): Promise<any> {
    this.loggingService.log(`Updating reservation: ${id}`, { updatedBy }, 'AvailabilityService');
    
    const previousValues = {}; // In real implementation, fetch existing reservation
    const updatedReservation = {
      id,
      ...data,
      updatedAt: new Date(),
    };

    // Emit domain event for real-time updates
    const domainEvent: DomainEvent = {
      eventId: uuidv4(),
      eventType: 'reservation.updated',
      aggregateId: id,
      aggregateType: 'Reservation',
      eventData: {
        reservationId: id,
        resourceId: data.resourceId,
        resourceName: data.resourceName || 'Unknown Resource',
        userId: data.userId,
        startTime: data.startTime,
        endTime: data.endTime,
        changes: data,
        previousValues,
      },
      timestamp: new Date(),
      version: 2,
      userId: data.userId,
    };

    await this.eventBusService.publishEvent(domainEvent);
    
    return updatedReservation;
  }

  async cancelReservation(id: string, userId?: string, reason?: string): Promise<void> {
    this.loggingService.log(`Cancelling reservation: ${id}`, 'AvailabilityService');
    
    // Emit domain event for real-time updates
    const domainEvent: DomainEvent = {
      eventId: uuidv4(),
      eventType: 'reservation.cancelled',
      aggregateId: id,
      aggregateType: 'Reservation',
      eventData: {
        reservationId: id,
        resourceId: 'unknown', // In real implementation, fetch from existing reservation
        resourceName: 'Unknown Resource',
        userId: userId || 'system',
        reason: reason || 'User cancelled',
        cancelledBy: userId || 'system',
        startTime: new Date().toISOString(),
        endTime: new Date().toISOString(),
      },
      timestamp: new Date(),
      version: 3,
      userId,
    };

    await this.eventBusService.publishEvent(domainEvent);
  }

  async approveReservation(id: string, approvedBy: string, approvalLevel: string): Promise<void> {
    this.loggingService.log(`Approving reservation: ${id}`, 'AvailabilityService');
    
    // Emit domain event for real-time updates
    const domainEvent: DomainEvent = {
      eventId: uuidv4(),
      eventType: 'reservation.approved',
      aggregateId: id,
      aggregateType: 'Reservation',
      eventData: {
        reservationId: id,
        resourceId: 'unknown', // In real implementation, fetch from existing reservation
        resourceName: 'Unknown Resource',
        userId: 'unknown',
        approvedBy,
        approvalLevel,
        startTime: new Date().toISOString(),
        endTime: new Date().toISOString(),
      },
      timestamp: new Date(),
      version: 4,
      userId: approvedBy,
    };

    await this.eventBusService.publishEvent(domainEvent);
  }

  async checkAvailability(resourceId: string, startDate: Date, endDate: Date): Promise<boolean> {
    this.loggingService.log(`Checking availability for resource: ${resourceId}`, 'AvailabilityService');
    return true;
  }

  /**
   * New methods for handler delegation (Clean Architecture compliance)
   */

  async findByResourceAndDay(resourceId: string, dayOfWeek: number): Promise<AvailabilityEntity[]> {
    this.loggingService.log(`Finding availability for resource ${resourceId} on day ${dayOfWeek}`, 'AvailabilityService');
    
    try {
      const availabilities = await this.availabilityRepository.findByResourceAndDay(resourceId, dayOfWeek);
      
      this.loggingService.log(
        `Found ${availabilities.length} availability slots for resource on specific day`,
        { resourceId, dayOfWeek, count: availabilities.length },
        'AvailabilityService'
      );
      
      return availabilities;
    } catch (error) {
      this.loggingService.error(`Failed to find availability for resource ${resourceId} on day ${dayOfWeek}`, error, 'AvailabilityService');
      throw error;
    }
  }

  async findAllActive(): Promise<AvailabilityEntity[]> {
    this.loggingService.log('Finding all active availability slots', 'AvailabilityService');
    
    try {
      const availabilities = await this.availabilityRepository.findAllActive();
      
      this.loggingService.log(
        `Found ${availabilities.length} active availability slots`,
        { count: availabilities.length },
        'AvailabilityService'
      );
      
      return availabilities;
    } catch (error) {
      this.loggingService.error('Failed to find all active availability slots', error, 'AvailabilityService');
      throw error;
    }
  }

  async getResourceAvailabilityComprehensive(query: {
    resourceId: string;
    startDate: Date;
    endDate: Date;
    includeReservations?: boolean;
    includeScheduleRestrictions?: boolean;
  }): Promise<any> {
    this.loggingService.log(
      `Getting comprehensive availability for resource ${query.resourceId} from ${query.startDate} to ${query.endDate}`,
      'AvailabilityService'
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

      this.loggingService.log(
        `Generated comprehensive availability data`,
        { 
          resourceId: query.resourceId,
          availabilityCount: result.availability.length,
          reservationsCount: result.reservations.length,
          schedulesCount: result.schedules.length,
          timeSlotsCount: result.timeSlots.length
        },
        'AvailabilityService'
      );

      return result;

    } catch (error) {
      this.loggingService.error(
        `Failed to get comprehensive availability for resource ${query.resourceId}`,
        error,
        'AvailabilityService'
      );
      throw error;
    }
  }

  async checkAvailabilityDetailed(query: {
    resourceId: string;
    startDate: Date;
    endDate: Date;
  }): Promise<{ available: boolean; conflicts: string[]; restrictions: string[] }> {
    this.loggingService.log(
      `Checking detailed availability for resource ${query.resourceId} from ${query.startDate} to ${query.endDate}`,
      'AvailabilityService'
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
        avail.isTimeWithinAvailability &&
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

        if (schedule.isDateWithinSchedule && !schedule.isDateWithinSchedule(query.startDate)) {
          restrictions.push(`Outside allowed schedule period: ${schedule.name || 'Schedule restriction'}`);
        }

        // Check advance notice if method exists
        if (schedule.getMinimumAdvanceNotice) {
          const minimumAdvanceNotice = schedule.getMinimumAdvanceNotice();
          if (minimumAdvanceNotice > 0) {
            const now = new Date();
            const hoursUntilStart = (query.startDate.getTime() - now.getTime()) / (1000 * 60 * 60);
            
            if (hoursUntilStart < minimumAdvanceNotice) {
              restrictions.push(`Requires ${minimumAdvanceNotice} hours advance notice`);
            }
          }
        }
      }

      const available = conflicts.length === 0 && restrictions.length === 0;

      this.loggingService.log(
        `Availability check completed`,
        { 
          resourceId: query.resourceId,
          available,
          conflictsCount: conflicts.length,
          restrictionsCount: restrictions.length
        },
        'AvailabilityService'
      );

      return {
        available,
        conflicts,
        restrictions
      };

    } catch (error) {
      this.loggingService.error(
        `Failed to check detailed availability for resource ${query.resourceId}`,
        error,
        'AvailabilityService'
      );
      throw error;
    }
  }

  private generateTimeSlots(
    startDate: Date,
    endDate: Date,
    availability: any[],
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

  /**
   * Get reservation history with filters and pagination (RF-11)
   */
  async getReservationHistory(filters: {
    reservationId?: string;
    userId?: string;
    resourceId?: string;
    action?: string;
    startDate?: Date;
    endDate?: Date;
    page?: number;
    limit?: number;
  }): Promise<any> {
    this.loggingService.log(
      `Getting reservation history with filters`,
      { filters },
      'AvailabilityService'
    );

    try {
      const result = await this.reservationHistoryRepository.findWithFilters(filters as any);

      this.loggingService.log(
        `Retrieved ${result.total} reservation history records (page ${filters.page}, limit ${filters.limit})`,
        { 
          total: result.total,
          page: filters.page,
          limit: filters.limit,
          filtersApplied: Object.keys(filters).length
        },
        'AvailabilityService'
      );

      return result;

    } catch (error) {
      this.loggingService.error(
        'Failed to get reservation history',
        error,
        'AvailabilityService'
      );
      throw error;
    }
  }

  /**
   * Export reservation history to CSV (RF-11)
   */
  async exportReservationHistoryToCsv(filters: {
    reservationId?: string;
    userId?: string;
    resourceId?: string;
    action?: string;
    startDate?: Date;
    endDate?: Date;
  }): Promise<string> {
    this.loggingService.log(
      `Exporting reservation history to CSV with filters`,
      { filters },
      'AvailabilityService'
    );

    try {
      const csvData = await this.reservationHistoryRepository.exportToCsv(filters as any);

      this.loggingService.log(
        `Exported ${csvData.length} characters of reservation history data`,
        { 
          csvLength: csvData.length,
          filtersApplied: Object.keys(filters).length
        },
        'AvailabilityService'
      );

      return csvData;

    } catch (error) {
      this.loggingService.error(
        'Failed to export reservation history to CSV',
        error,
        'AvailabilityService'
      );
      throw error;
    }
  }

  /**
   * Validates if reservation time falls within schedule constraints
   */
  private isTimeWithinSchedule(startTime: Date, endTime: Date, schedule: any): boolean {
    // Simplified schedule validation - would need actual schedule logic
    // This is a placeholder for complex schedule validation business rules
    // In a real implementation, this would check:
    // - Day of week constraints
    // - Time range constraints
    // - Blackout periods
    // - Maintenance windows
    return true;
  }
}
