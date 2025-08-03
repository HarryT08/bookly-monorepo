import { CommandHandler, ICommandHandler, EventBus } from '@nestjs/cqrs';
import { Injectable } from '@nestjs/common';
import { CreateScheduleCommand } from '../commands/create-schedule.command';
import { ScheduleRepository } from '../../domain/repositories/schedule.repository';
import { ScheduleEntity } from '../../domain/entities/schedule.entity';
import { LoggingService } from '../../../../libs/logging/logging.service';
import { ConflictException, BadRequestException } from '@nestjs/common';

/**
 * Create Schedule Command Handler (RF-07)
 * Handles the creation of complex scheduling rules with institutional restrictions
 */
@Injectable()
@CommandHandler(CreateScheduleCommand)
export class CreateScheduleHandler implements ICommandHandler<CreateScheduleCommand> {
  constructor(
    private readonly scheduleRepository: ScheduleRepository,
    private readonly eventBus: EventBus,
    private readonly logger: LoggingService
  ) {}

  async execute(command: CreateScheduleCommand): Promise<ScheduleEntity> {
    this.logger.log(
      `Creating schedule: ${command.name} for resource ${command.resourceId}`,
      'CreateScheduleHandler'
    );

    try {
      // Validate date order
      this.validateDateInput(command.startDate, command.endDate);

      // Check for conflicts with existing schedules
      const endDate = command.endDate || new Date('2099-12-31');
      const conflictingSchedules = await this.scheduleRepository.findConflictingSchedules(
        command.resourceId,
        command.startDate,
        endDate
      );

      if (conflictingSchedules.length > 0) {
        this.logger.warn(
          `Schedule conflicts detected for resource ${command.resourceId}: ${conflictingSchedules.length} conflicts`,
          'CreateScheduleHandler'
        );
        
        // For certain types, conflicts might be allowed (e.g., EXCEPTION overrides REGULAR)
        if (!this.isConflictAllowed(command.type, conflictingSchedules)) {
          throw new ConflictException(
            `Schedule conflicts with existing schedules: ${conflictingSchedules.map(s => s.name).join(', ')}`
          );
        }
      }

      // Create the schedule entity
      const scheduleData = {
        resourceId: command.resourceId,
        name: command.name,
        type: command.type,
        startDate: command.startDate,
        endDate: command.endDate,
        recurrenceRule: command.recurrenceRule,
        restrictions: command.restrictions,
        isActive: command.isActive
      };

      const schedule = await this.scheduleRepository.create(scheduleData);

      // Publish event for other services
      this.eventBus.publish({
        type: 'ScheduleCreated',
        data: {
          scheduleId: schedule.id,
          resourceId: schedule.resourceId,
          name: schedule.name,
          type: schedule.type,
          startDate: schedule.startDate,
          endDate: schedule.endDate,
          restrictions: schedule.restrictions
        }
      });

      this.logger.log(
        `Schedule created successfully: ${schedule.name} for resource ${schedule.resourceId}`,
        'CreateScheduleHandler'
      );

      return schedule;

    } catch (error) {
      this.logger.error(
        `Failed to create schedule ${command.name} for resource ${command.resourceId}`,
        'CreateScheduleHandler',
        error
      );
      throw error;
    }
  }

  private validateDateInput(startDate: Date, endDate: Date | null): void {
    if (endDate && startDate >= endDate) {
      throw new BadRequestException('startDate must be before endDate');
    }

    const now = new Date();
    if (startDate < now) {
      throw new BadRequestException('startDate cannot be in the past');
    }
  }

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
