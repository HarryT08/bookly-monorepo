import { Injectable, Inject, ConflictException, BadRequestException } from '@nestjs/common';
import { LoggingService } from '@logging/logging.service';
import { EventBusService } from '@libs/event-bus/services/event-bus.service';
import { ScheduleRepository } from '../../domain/repositories/schedule.repository';
import { ScheduleEntity } from '../../domain/entities/schedule.entity';
import { 
  StandardizedDomainEvent, 
  createStandardizedEvent, 
  EventAction 
} from '@libs/event-bus/interfaces/standardized-domain-event.interface';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class ScheduleService {
  constructor(
    @Inject('ScheduleRepository')
    private readonly scheduleRepository: ScheduleRepository,
    private readonly loggingService: LoggingService,
    private readonly eventBusService: EventBusService,
  ) {}

  /**
   * Create schedule with business logic validation (RF-07)
   * Contains all business logic for schedule creation with conflict resolution
   */
  async createSchedule(data: {
    resourceId: string;
    name: string;
    type: string;
    startDate: Date;
    endDate?: Date | null;
    recurrenceRule?: any;
    restrictions?: any;
    isActive?: boolean;
  }, createdBy?: string): Promise<ScheduleEntity> {
    this.loggingService.log(
      `Creating schedule: ${data.name} for resource ${data.resourceId}`,
      { resourceId: data.resourceId, name: data.name, type: data.type, createdBy },
      'ScheduleService'
    );

    try {
      // Business Logic 1: Validate date order
      this.validateDateInput(data.startDate, data.endDate);

      // Business Logic 2: Check for conflicts with existing schedules
      const endDate = data.endDate || new Date('2099-12-31');
      const conflictingSchedules = await this.scheduleRepository.findConflictingSchedules(
        data.resourceId,
        data.startDate,
        endDate
      );

      if (conflictingSchedules.length > 0) {
        this.loggingService.warn(
          `Schedule conflicts detected for resource ${data.resourceId}: ${conflictingSchedules.length} conflicts`,
          { resourceId: data.resourceId, conflictsCount: conflictingSchedules.length },
          'ScheduleService'
        );
        
        // Business Logic 3: For certain types, conflicts might be allowed (e.g., EXCEPTION overrides REGULAR)
        if (!this.isConflictAllowed(data.type, conflictingSchedules)) {
          throw new ConflictException(
            `Schedule conflicts with existing schedules: ${conflictingSchedules.map(s => s.name).join(', ')}`
          );
        }
      }

      // Business Logic 4: Create the schedule entity
      const scheduleData = {
        resourceId: data.resourceId,
        name: data.name,
        type: data.type,
        startDate: data.startDate,
        endDate: data.endDate,
        recurrenceRule: data.recurrenceRule,
        restrictions: data.restrictions,
        createdBy: createdBy,
        isActive: data.isActive !== false // default to true
      };

      const schedule = await this.scheduleRepository.create(scheduleData as any);

      // Business Logic 5: Publish domain event (simplified for now to avoid interface conflicts)
      const eventPayload = {
        type: 'ScheduleCreated',
        data: {
          scheduleId: schedule.id,
          resourceId: schedule.resourceId,
          name: schedule.name,
          type: schedule.type,
          startDate: schedule.startDate,
          endDate: schedule.endDate,
          restrictions: schedule.restrictions,
          isActive: schedule.isActive
        }
      };

      await this.eventBusService.publishEvent(eventPayload as any);

      this.loggingService.log(
        `Schedule created successfully: ${schedule.name} for resource ${schedule.resourceId}`,
        { 
          scheduleId: schedule.id,
          resourceId: schedule.resourceId,
          name: schedule.name,
          type: schedule.type
        },
        'ScheduleService'
      );

      return schedule;

    } catch (error) {
      this.loggingService.error(
        `Failed to create schedule ${data.name} for resource ${data.resourceId}`,
        error,
        'ScheduleService'
      );
      throw error;
    }
  }

  /**
   * Find schedules by resource ID
   */
  async findByResourceId(resourceId: string): Promise<ScheduleEntity[]> {
    this.loggingService.log(`Finding schedules for resource: ${resourceId}`, 'ScheduleService');
    
    try {
      const schedules = await this.scheduleRepository.findByResourceId(resourceId);
      
      this.loggingService.log(
        `Found ${schedules.length} schedules for resource`,
        { resourceId, count: schedules.length },
        'ScheduleService'
      );
      
      return schedules;
    } catch (error) {
      this.loggingService.error(`Failed to find schedules for resource: ${resourceId}`, error, 'ScheduleService');
      throw error;
    }
  }

  /**
   * Find active schedules by resource and date range
   */
  async findActiveByResourceAndDateRange(
    resourceId: string, 
    startDate: Date, 
    endDate: Date
  ): Promise<ScheduleEntity[]> {
    this.loggingService.log(
      `Finding active schedules for resource ${resourceId} from ${startDate} to ${endDate}`,
      'ScheduleService'
    );
    
    try {
      const schedules = await this.scheduleRepository.findActiveByResourceAndDateRange(
        resourceId,
        startDate,
        endDate
      );
      
      this.loggingService.log(
        `Found ${schedules.length} active schedules in date range`,
        { resourceId, count: schedules.length, startDate, endDate },
        'ScheduleService'
      );
      
      return schedules;
    } catch (error) {
      this.loggingService.error(
        `Failed to find active schedules for resource ${resourceId} in date range`,
        error,
        'ScheduleService'
      );
      throw error;
    }
  }

  /**
   * Find schedules by resource and specific date
   */
  async findByResourceAndDate(resourceId: string, date: Date): Promise<ScheduleEntity[]> {
    this.loggingService.log(
      `Finding schedules for resource ${resourceId} on date ${date}`,
      'ScheduleService'
    );
    
    try {
      const schedules = await this.scheduleRepository.findByResourceAndDate(resourceId, date);
      
      this.loggingService.log(
        `Found ${schedules.length} schedules for resource on specific date`,
        { resourceId, date, count: schedules.length },
        'ScheduleService'
      );
      
      return schedules;
    } catch (error) {
      this.loggingService.error(
        `Failed to find schedules for resource ${resourceId} on date ${date}`,
        error,
        'ScheduleService'
      );
      throw error;
    }
  }

  /**
   * Business logic: Validate date input
   */
  private validateDateInput(startDate: Date, endDate: Date | null | undefined): void {
    if (endDate && startDate >= endDate) {
      throw new BadRequestException('startDate must be before endDate');
    }

    const now = new Date();
    if (startDate < now) {
      throw new BadRequestException('startDate cannot be in the past');
    }
  }

  /**
   * Business logic: Determine if schedule conflict is allowed based on type hierarchy
   */
  private isConflictAllowed(type: string, conflictingSchedules: ScheduleEntity[]): boolean {
    // EXCEPTION and MAINTENANCE schedules can override REGULAR schedules
    if (type === 'EXCEPTION' || type === 'MAINTENANCE') {
      return conflictingSchedules.every(schedule => schedule.type === 'REGULAR');
    }

    // ACADEMIC_EVENT has high priority and can override most schedules
    if (type === 'ACADEMIC_EVENT') {
      return conflictingSchedules.every(schedule => 
        schedule.type === 'REGULAR' || schedule.type === 'EXCEPTION'
      );
    }

    // REGULAR schedules cannot conflict with anything
    return false;
  }
}
