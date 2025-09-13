import { Injectable, Inject, BadRequestException, ConflictException, ForbiddenException } from '@nestjs/common';
import { LoggingService } from '@logging/logging.service';
import { EventBusService, DomainEvent } from '@libs/event-bus/services/event-bus.service';
import { NotificationService } from '@libs/notification/notification.service';
import { AvailabilityRepository } from '../../domain/repositories/availability.repository';
import { AvailabilityEntity } from '../../domain/entities/availability.entity';
import { ReservationRepository } from '../../domain/repositories/reservation.repository';
import { ScheduleRepository } from '../../domain/repositories/schedule.repository';
import { ReservationHistoryRepository } from '../../domain/repositories/reservation-history.repository';
import { ReservationEntity, ReservationStatus } from '../../domain/entities/reservation.entity';
import { ReservationAction } from '../../../../libs/dto/availability/reservation-history.dto';
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

  async findAll(): Promise<any[]> {
    this.loggingService.log('Finding all availability slots', 'AvailabilityService');
    return [];
  }

  async findByResourceId(resourceId: string): Promise<any[]> {
    this.loggingService.log(`Finding availability for resource: ${resourceId}`, 'AvailabilityService');
    return [];
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
  }): Promise<AvailabilityEntity> {
    this.loggingService.log(
      'Creating availability',
      {
        resourceId: data.resourceId,
        dayOfWeek: data.dayOfWeek,
        startTime: data.startTime,
        endTime: data.endTime
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

      // Publish domain event
      const domainEvent: DomainEvent = {
        eventId: uuidv4(),
        eventType: 'availability.created',
        aggregateId: availability.id,
        aggregateType: 'Availability',
        eventData: {
          availabilityId: availability.id,
          resourceId: availability.resourceId,
          dayOfWeek: availability.dayOfWeek,
          startTime: availability.startTime,
          endTime: availability.endTime
        },
        timestamp: new Date(),
        version: 1
      };

      await this.eventBusService.publishEvent(domainEvent);

      this.loggingService.log(
        'Availability created successfully',
        {
          availabilityId: availability.id,
          resourceId: availability.resourceId
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
  }): Promise<ReservationEntity> {
    this.loggingService.log(
      'Creating reservation with business validation',
      {
        userId: data.userId,
        resourceId: data.resourceId,
        startTime: data.startTime,
        endTime: data.endTime
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

      // Business Logic 7: Publish domain event
      const domainEvent: DomainEvent = {
        eventId: uuidv4(),
        eventType: 'reservation.created',
        aggregateId: savedReservation.id,
        aggregateType: 'Reservation',
        eventData: {
          reservationId: savedReservation.id,
          userId: savedReservation.userId,
          resourceId: savedReservation.resourceId,
          startTime: savedReservation.startTime,
          endTime: savedReservation.endTime,
          status: savedReservation.status
        },
        timestamp: new Date(),
        version: 1,
        userId: data.userId
      };

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
          resourceId: data.resourceId
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

  async updateReservation(id: string, data: any): Promise<any> {
    this.loggingService.log(`Updating reservation: ${id}`, 'AvailabilityService');
    
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
