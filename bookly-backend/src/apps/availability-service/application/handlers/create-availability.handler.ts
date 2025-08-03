import { CommandHandler, ICommandHandler, EventBus } from '@nestjs/cqrs';
import { Injectable } from '@nestjs/common';
import { CreateAvailabilityCommand } from '../commands/create-availability.command';
import { AvailabilityRepository } from '../../domain/repositories/availability.repository';
import { AvailabilityEntity } from '../../domain/entities/availability.entity';
import { LoggingService } from '../../../../libs/logging/logging.service';
import { ConflictException, BadRequestException } from '@nestjs/common';

/**
 * Create Availability Command Handler (RF-07)
 * Handles the creation of basic availability hours for resources
 */
@Injectable()
@CommandHandler(CreateAvailabilityCommand)
export class CreateAvailabilityHandler implements ICommandHandler<CreateAvailabilityCommand> {
  constructor(
    private readonly availabilityRepository: AvailabilityRepository,
    private readonly eventBus: EventBus,
    private readonly logger: LoggingService
  ) {}

  async execute(command: CreateAvailabilityCommand): Promise<AvailabilityEntity> {
    this.logger.log(
      'Creating availability',
      {
        resourceId: command.resourceId,
        dayOfWeek: command.dayOfWeek,
        startTime: command.startTime,
        endTime: command.endTime
      },
      'CreateAvailabilityHandler'
    );

    try {
      // Validate time format and order
      this.validateTimeInput(command.startTime, command.endTime);

      // Check for conflicts with existing availability
      const hasConflict = await this.availabilityRepository.hasTimeConflict(
        command.resourceId,
        command.dayOfWeek,
        command.startTime,
        command.endTime
      );

      if (hasConflict) {
        throw new ConflictException(
          `Time slot conflicts with existing availability for resource ${command.resourceId} on day ${command.dayOfWeek}`
        );
      }

      // Create the availability entity
      const availability = await this.availabilityRepository.create({
        resourceId: command.resourceId,
        dayOfWeek: command.dayOfWeek,
        startTime: command.startTime,
        endTime: command.endTime,
        isActive: command.isActive
      });

      // Publish event for other services
      await this.eventBus.publish({
        type: 'AvailabilityCreated',
        data: {
          availabilityId: availability.id,
          resourceId: availability.resourceId,
          dayOfWeek: availability.dayOfWeek,
          startTime: availability.startTime,
          endTime: availability.endTime
        }
      });

      this.logger.log(
        'Availability created successfully',
        {
          availabilityId: availability.id,
          resourceId: availability.resourceId
        },
        'CreateAvailabilityHandler'
      );

      return availability;

    } catch (error) {
      this.logger.error(
        'Failed to create availability',
        error,
        'CreateAvailabilityHandler'
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
}
