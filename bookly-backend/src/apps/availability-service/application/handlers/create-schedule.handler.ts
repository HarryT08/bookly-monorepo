import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Injectable } from '@nestjs/common';
import { CreateScheduleCommand } from '../commands/create-schedule.command';
import { ScheduleEntity } from '../../domain/entities/schedule.entity';
import { LoggingService } from '@libs/logging/logging.service';
import { ScheduleService } from '../services/schedule.service';

/**
 * Create Schedule Command Handler (RF-07)
 * Handles the creation of complex scheduling rules with institutional restrictions
 */
@Injectable()
@CommandHandler(CreateScheduleCommand)
export class CreateScheduleHandler implements ICommandHandler<CreateScheduleCommand> {
  constructor(
    private readonly scheduleService: ScheduleService,
    private readonly logger: LoggingService
  ) {}

  async execute(command: CreateScheduleCommand): Promise<ScheduleEntity> {
    this.logger.log(
      `Orchestrating schedule creation: ${command.name} for resource ${command.resourceId}`,
      'CreateScheduleHandler'
    );

    try {
      return await this.scheduleService.createSchedule({
        resourceId: command.resourceId,
        name: command.name,
        type: command.type,
        startDate: command.startDate,
        endDate: command.endDate,
        recurrenceRule: command.recurrenceRule,
        restrictions: command.restrictions,
        isActive: command.isActive
      }, command.createdBy);

    } catch (error) {
      this.logger.error(
        `Failed to orchestrate schedule creation ${command.name} for resource ${command.resourceId}`,
        'CreateScheduleHandler',
        error
      );
      throw error;
    }
  }
}
