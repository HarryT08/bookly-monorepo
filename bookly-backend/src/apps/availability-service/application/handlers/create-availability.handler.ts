import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Injectable } from '@nestjs/common';
import { CreateAvailabilityCommand } from '../commands/create-availability.command';
import { AvailabilityService } from '../services/availability.service';
import { AvailabilityDto } from '@libs/dto/availability/availability.dto';
import { LoggingService } from '@libs/logging/logging.service';

/**
 * Create Availability Command Handler (RF-07)
 * Handles the creation of basic availability hours for resources
 */
@Injectable()
@CommandHandler(CreateAvailabilityCommand)
export class CreateAvailabilityHandler implements ICommandHandler<CreateAvailabilityCommand> {
  constructor(
    private readonly availabilityService: AvailabilityService,
    private readonly logger: LoggingService
  ) {}

  async execute(command: CreateAvailabilityCommand): Promise<AvailabilityDto> {
    this.logger.log(
      'Availability creation',
      {
        resourceId: command.resourceId,
        dayOfWeek: command.dayOfWeek,
        startTime: command.startTime,
        endTime: command.endTime
      },
      'CreateAvailabilityHandler'
    );

    // Delegate to service (Clean Architecture pattern)
    return await this.availabilityService.createAvailability({
      resourceId: command.resourceId,
      dayOfWeek: command.dayOfWeek,
      startTime: command.startTime,
      endTime: command.endTime
    }, command.createdBy);
  }
}
