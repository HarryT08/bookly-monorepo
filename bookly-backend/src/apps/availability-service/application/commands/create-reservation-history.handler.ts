import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Injectable, Logger, Inject } from '@nestjs/common';
import { CreateReservationHistoryCommand } from './create-reservation-history.command';
import { ReservationHistoryRepository, ReservationHistoryEntity } from '../../domain/repositories/reservation-history.repository';
import { EventBusService } from '../../../../libs/event-bus/services/event-bus.service';
import { ReservationAction } from '../../../../libs/dto/availability/reservation-history.dto';

/**
 * Command Handler for creating reservation history entries (RF-11)
 * Records all actions performed on reservations for complete audit trail
 */
@Injectable()
@CommandHandler(CreateReservationHistoryCommand)
export class CreateReservationHistoryHandler implements ICommandHandler<CreateReservationHistoryCommand> {
  private readonly logger = new Logger(CreateReservationHistoryHandler.name);

  constructor(
    @Inject('ReservationHistoryRepository')
    private readonly reservationHistoryRepository: ReservationHistoryRepository,
    private readonly eventBus: EventBusService
  ) {}

  async execute(command: CreateReservationHistoryCommand): Promise<ReservationHistoryEntity> {
    const {
      reservationId,
      userId,
      action,
      source,
      previousData,
      newData,
      details,
      ipAddress,
      userAgent
    } = command;

    this.logger.log('Creating reservation history entry', {
      reservationId,
      userId,
      action,
      source
    });

    try {
      // Convert HistoryAction to ReservationAction
      const reservationAction = action as unknown as ReservationAction;
      
      // Create history entry
      const savedEntry = await this.reservationHistoryRepository.create({
        reservationId,
        userId,
        action: reservationAction,
        previousData,
        newData: newData || {},
        reason: details,
        ipAddress,
        userAgent
      });

      this.logger.log('Reservation history entry created successfully', {
        historyId: savedEntry.id,
        reservationId,
        action
      });

      // Publish event for audit and notification purposes
      await this.eventBus.publishEvent({
        eventType: 'reservation.history.created',
        eventId: `history-event-${savedEntry.id}`,
        aggregateId: reservationId,
        aggregateType: 'Reservation',
        version: 1,
        eventData: {
          historyId: savedEntry.id,
          reservationId,
          userId,
          action,
          source,
          timestamp: savedEntry.createdAt,
          hasDataChanges: !!(previousData || newData),
          details
        },
        timestamp: savedEntry.createdAt
      });

      // Publish specific events for critical actions
      if (action === 'CANCELLED' || action === 'REJECTED') {
        await this.eventBus.publishEvent({
          eventType: 'reservation.cancelled',
          eventId: `reservation-cancelled-event-${savedEntry.id}`,
          aggregateId: reservationId,
          aggregateType: 'Reservation',
          version: 1,
          eventData: {
            reservationId,
            userId,
            reason: details,
            timestamp: savedEntry.createdAt,
            source
          },
          timestamp: savedEntry.createdAt
        });
      }

      // Publish specific events for critical actions
      if (action === 'CANCELLED' || action === 'REJECTED') {
        await this.eventBus.publishEvent({
          eventType: 'reservation.cancelled',
          eventId: `reservation-cancelled-${savedEntry.id}`,
          aggregateId: reservationId,
          aggregateType: 'Reservation',
          version: 1,
          eventData: {
            reservationId,
            userId,
            reason: details,
            timestamp: savedEntry.createdAt,
            source
          },
          timestamp: savedEntry.createdAt
        });
      }

      if (action === 'NO_SHOW') {
        await this.eventBus.publishEvent({
          eventType: 'reservation.no_show',
          eventId: `reservation-no-show-${savedEntry.id}`,
          aggregateId: reservationId,
          aggregateType: 'Reservation',
          version: 1,
          eventData: {
            reservationId,
            userId,
            timestamp: savedEntry.createdAt,
            source
          },
          timestamp: savedEntry.createdAt
        });
      }

      return savedEntry;

    } catch (error) {
      this.logger.error('Failed to create reservation history entry', {
        reservationId,
        userId,
        action,
        error: error.message
      });

      // Publish error event for monitoring
      await this.eventBus.publishEvent({
        eventType: 'reservation.history.creation_failed',
        eventId: `reservation-history-creation-failed-${reservationId}`,
        aggregateId: reservationId,
        aggregateType: 'Reservation',
        version: 1,
        eventData: {
          reservationId,
          userId,
          action,
          error: error.message,
          timestamp: new Date()
        },
        timestamp: new Date()
      });

      throw error;
    }
  }
}
