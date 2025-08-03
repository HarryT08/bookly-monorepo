import { CommandHandler, ICommandHandler, EventBus } from '@nestjs/cqrs';
import { Injectable } from '@nestjs/common';
import { CreateReservationCommand } from '../commands/create-reservation.command';
import { ReservationRepository } from '../../domain/repositories/reservation.repository';
import { ScheduleRepository } from '../../domain/repositories/schedule.repository';
import { ReservationHistoryRepository } from '../../domain/repositories/reservation-history.repository';
import { ReservationEntity, ReservationStatus } from '../../domain/entities/reservation.entity';
import { LoggingService } from '../../../../libs/logging/logging.service';
import { ReservationAction } from '../../../../libs/dto/availability/reservation-history.dto';
import { ConflictException, BadRequestException, ForbiddenException } from '@nestjs/common';

/**
 * Create Reservation Command Handler
 * Handles the creation of reservations with comprehensive validation
 */
@Injectable()
@CommandHandler(CreateReservationCommand)
export class CreateReservationHandler implements ICommandHandler<CreateReservationCommand> {
  constructor(
    private readonly reservationRepository: ReservationRepository,
    private readonly scheduleRepository: ScheduleRepository,
    private readonly reservationHistoryRepository: ReservationHistoryRepository,
    private readonly eventBus: EventBus,
    private readonly logger: LoggingService
  ) {}

  async execute(command: CreateReservationCommand): Promise<ReservationEntity> {
    this.logger.log(
      `Creating reservation: ${command.title} for resource ${command.resourceId} by user ${command.userId}`,
      'CreateReservationHandler'
    );

    try {
      // Validate basic reservation data
      this.validateReservationInput(command);

      // Check for conflicts with existing reservations
      await this.validateReservationConflicts(command);

      // Validate against schedule restrictions
      await this.validateScheduleRestrictions(command);

      // Create the reservation entity
      const reservationData = {
        title: command.title,
        description: command.description,
        startDate: command.startDate,
        endDate: command.endDate,
        status: ReservationStatus.PENDING,
        isRecurring: command.isRecurring,
        recurrence: command.recurrence,
        userId: command.userId,
        resourceId: command.resourceId
      };

      const reservation = await this.reservationRepository.create(reservationData);

      // Create history entry (RF-11)
      await this.reservationHistoryRepository.create({
        reservationId: reservation.id,
        userId: command.userId,
        action: ReservationAction.CREATED,
        newData: {
          title: reservation.title,
          startDate: reservation.startDate,
          endDate: reservation.endDate,
          resourceId: reservation.resourceId,
          status: reservation.status
        }
      });

      // Publish event for other services
      this.eventBus.publish({
        type: 'ReservationCreated',
        data: {
          reservationId: reservation.id,
          resourceId: reservation.resourceId,
          userId: reservation.userId,
          startDate: reservation.startDate,
          endDate: reservation.endDate,
          status: reservation.status,
          isRecurring: reservation.isRecurring
        }
      });

      this.logger.log(
        `Reservation created successfully: ${reservation.id} for resource ${command.resourceId}`,
        'CreateReservationHandler'
      );

      return reservation;

    } catch (error) {
      this.logger.error(
        `Failed to create reservation for resource ${command.resourceId} by user ${command.userId}`,
        'CreateReservationHandler',
        error
      );
      throw error;
    }
  }

  private validateReservationInput(command: CreateReservationCommand): void {
    if (command.startDate >= command.endDate) {
      throw new BadRequestException('startDate must be before endDate');
    }

    const now = new Date();
    if (command.endDate <= now) {
      throw new BadRequestException('Reservation cannot be in the past');
    }

    const durationMs = command.endDate.getTime() - command.startDate.getTime();
    const durationMinutes = durationMs / (1000 * 60);
    
    if (durationMinutes < 15) {
      throw new BadRequestException('Reservation must be at least 15 minutes long');
    }
    
    if (durationMinutes > 24 * 60) {
      throw new BadRequestException('Reservation cannot exceed 24 hours');
    }
  }

  private async validateReservationConflicts(command: CreateReservationCommand): Promise<void> {
    const conflictingReservations = await this.reservationRepository.findConflictingReservations(
      command.resourceId,
      command.startDate,
      command.endDate
    );

    if (conflictingReservations.length > 0) {
      const conflictDetails = conflictingReservations.map(r => ({
        id: r.id,
        title: r.title,
        startDate: r.startDate,
        endDate: r.endDate,
        status: r.status
      }));

      throw new ConflictException(
        `Reservation conflicts with existing reservations: ${conflictingReservations.map(r => r.title).join(', ')}`
      );
    }
  }

  private async validateScheduleRestrictions(command: CreateReservationCommand): Promise<void> {
    const schedules = await this.scheduleRepository.findByResourceAndDate(
      command.resourceId,
      command.startDate
    );

    for (const schedule of schedules) {
      if (!schedule.isActive) continue;

      // Check if date is within schedule period
      if (!schedule.isDateWithinSchedule(command.startDate)) {
        throw new ForbiddenException(
          `Reservation date is outside allowed schedule period: ${schedule.name}`
        );
      }

      // Check advance notice requirement
      const minimumAdvanceNotice = schedule.getMinimumAdvanceNotice();
      if (minimumAdvanceNotice > 0) {
        const now = new Date();
        const hoursUntilStart = (command.startDate.getTime() - now.getTime()) / (1000 * 60 * 60);
        
        if (hoursUntilStart < minimumAdvanceNotice) {
          throw new BadRequestException(
            `Reservation requires at least ${minimumAdvanceNotice} hours advance notice`
          );
        }
      }

      // Additional restrictions can be validated here based on user type, etc.
      // This would require user information to be passed or fetched
    }
  }
}
