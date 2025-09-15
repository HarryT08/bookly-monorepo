import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Injectable } from '@nestjs/common';
import { CreateReservationCommand } from '../commands/create-reservation.command';
import { ReservationDto } from '@libs/dto/availability/reservation.dto';
import { LoggingService } from '@libs/logging/logging.service';
import { AvailabilityService } from '../services/availability.service';

/**
 * Create Reservation Command Handler
 * Handles the creation of reservations with comprehensive validation
 */
@Injectable()
@CommandHandler(CreateReservationCommand)
export class CreateReservationHandler implements ICommandHandler<CreateReservationCommand> {
  constructor(
    private readonly availabilityService: AvailabilityService,
    private readonly logger: LoggingService
  ) {}

  async execute(command: CreateReservationCommand): Promise<ReservationDto> {
    this.logger.log(
      'Orchestrating reservation creation',
      {
        userId: command.userId,
        resourceId: command.resourceId,
        startDate: command.startDate,
        endDate: command.endDate,
        title: command.title
      },
      'CreateReservationHandler'
    );

    // Delegate to service (Clean Architecture pattern)
    return await this.availabilityService.createReservation({
      userId: command.userId,
      resourceId: command.resourceId,
      startTime: command.startDate,
      endTime: command.endDate,
      description: command.description,
      attendees: 1, // Default value, could be extended in command
      equipment: [] // Default value, could be extended in command
    }, command.createdBy);
  }
}
