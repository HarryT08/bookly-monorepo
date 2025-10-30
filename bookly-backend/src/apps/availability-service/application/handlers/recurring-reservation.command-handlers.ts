/**
 * Command Handlers for Recurring Reservations (RF-12)
 * CQRS Command Handler Pattern Implementation
 */

import { CommandHandler, ICommandHandler, EventBus } from '@nestjs/cqrs';
import { Injectable, NotFoundException, BadRequestException, ForbiddenException, Inject } from '@nestjs/common';
import { LoggingService } from '@libs/logging/logging.service';
import { EventBusService } from '@libs/event-bus/services/event-bus.service';

// Commands
import {
  CreateRecurringReservationCommand,
  UpdateRecurringReservationCommand,
  CancelRecurringReservationCommand,
  CancelRecurringReservationInstanceCommand,
  GenerateRecurringReservationInstancesCommand,
  ConfirmRecurringReservationInstanceCommand,
  ValidateRecurringReservationCommand,
  BulkCancelRecurringReservationsCommand
} from '@apps/availability-service/application/commands/create-recurring-reservation.command';

// Domain Services
import { RecurringReservationDomainService } from '@apps/availability-service/domain/services/recurring-reservation-domain.service';
import { ReservationLimitsDomainService } from '@apps/availability-service/domain/services/reservation-limits-domain.service';

// Entities
import { RecurringReservationEntity } from '@apps/availability-service/domain/entities/recurring-reservation.entity';
import { LoggingHelper } from '@libs/logging/logging.helper';
import { RecurringReservationStatus } from '@apps/availability-service/utils/recurring-reservation-status.enum';

@Injectable()
@CommandHandler(CreateRecurringReservationCommand)
export class CreateRecurringReservationHandler implements ICommandHandler<CreateRecurringReservationCommand> {
  constructor(
    @Inject('RecurringReservationDomainService')
    private readonly recurringReservationService: RecurringReservationDomainService,
    @Inject('ReservationLimitsDomainService')
    private readonly reservationLimitsService: ReservationLimitsDomainService,
    private readonly eventBus: EventBusService,
    private readonly logger: LoggingService
  ) {}

  async execute(command: CreateRecurringReservationCommand): Promise<RecurringReservationEntity> {
    this.logger.log('Creating recurring reservation', {
      userId: command.userId,
      resourceId: command.resourceId,
      title: command.title,
      frequency: command.frequency
    });

    // Validate business rules for recurring reservations using domain service
    const validation = await this.recurringReservationService.validateRecurringReservationCreation(
      command.userId,
      command.resourceId,
      command.programId,
      command.frequency,
      command.startDate,
      command.endDate
    );

    if (!validation.canCreate) {
      throw new BadRequestException(`Cannot create recurring reservation: ${validation.violations.join(', ')}`);
    }

    // Log warnings if any
    if (validation.warnings.length > 0) {
      this.logger.warn('Recurring reservation creation warnings', {
        warnings: validation.warnings,
        userId: command.userId,
        resourceId: command.resourceId
      });
    }

    try {
      // Create the recurring reservation using domain service
      const result = await this.recurringReservationService.createRecurringReservation({
        title: command.title,
        description: command.description,
        resourceId: command.resourceId,
        userId: command.userId,
        startDate: command.startDate,
        endDate: command.endDate,
        startTime: command.startTime,
        endTime: command.endTime,
        frequency: command.frequency,
        interval: command.interval,
        daysOfWeek: command.daysOfWeek,
        dayOfMonth: command.dayOfMonth,
      });

      // Log success
      this.logger.log('Recurring reservation created successfully', {
        recurringReservationId: result.recurringReservation.id,
        instancesGenerated: result.generatedInstances.length,
        warnings: result.warnings
      });

      // Publish domain event
      await this.eventBus.publishEvent({
        eventId: `recurring_reservation_created_${result.recurringReservation.id}`,
        eventType: 'recurring_reservation.created',
        aggregateId: result.recurringReservation.id,
        aggregateType: 'RecurringReservation',
        eventData: {
          recurringReservationId: result.recurringReservation.id,
          userId: command.userId,
          resourceId: command.resourceId,
          title: command.title,
          frequency: command.frequency,
          instancesGenerated: result.generatedInstances.length,
          warnings: result.warnings
        },
        timestamp: new Date(),
        version: 1
      });

      return result.recurringReservation;

    } catch (error) {
      this.logger.error('Failed to create recurring reservation', {
        error: error.message,
        stack: error.stack,
        userId: command.userId,
        resourceId: command.resourceId,
        title: command.title
      });

      throw new BadRequestException(`Failed to create recurring reservation: ${error.message}`);
    }
  }
}

@Injectable()
@CommandHandler(UpdateRecurringReservationCommand)
export class UpdateRecurringReservationHandler implements ICommandHandler<UpdateRecurringReservationCommand> {
  constructor(
    @Inject('RecurringReservationDomainService')
    private readonly recurringReservationService: RecurringReservationDomainService,
    private readonly eventBus: EventBusService,
    private readonly logger: LoggingService
  ) {}

  async execute(command: UpdateRecurringReservationCommand): Promise<RecurringReservationEntity> {
    this.logger.log('Updating recurring reservation', {
      id: command.id,
      userId: command.userId,
      updateScope: command.updateScope
    });

    try {
      // Update using domain service
      const updatedReservation = await this.recurringReservationService.updateRecurringReservation(
        command.id,
        {
          title: command.updateData.title,
          description: command.updateData.description,
          startTime: command.updateData.startTime,
          endTime: command.updateData.endTime,
          endDate: command.updateData.endDate,
        },
        command.updateScope,
        command.regenerateInstances
      );

      this.logger.log('Recurring reservation updated successfully', {
        id: updatedReservation.id,
        userId: command.userId,
        updateScope: command.updateScope
      });

      // Publish domain event
      await this.eventBus.publishEvent({
        eventId: `recurring_reservation_updated_${updatedReservation.id}`,
        eventType: 'recurring_reservation.updated',
        aggregateId: updatedReservation.id,
        aggregateType: 'RecurringReservation',
        eventData: {
          recurringReservationId: updatedReservation.id,
          userId: command.userId,
          updateScope: command.updateScope,
          regenerateInstances: command.regenerateInstances,
          changes: {
            title: command.updateData.title,
            description: command.updateData.description,
            startTime: command.updateData.startTime,
            endTime: command.updateData.endTime,
            endDate: command.updateData.endDate,
          }
        },
        timestamp: new Date(),
        version: 1
      });

      return updatedReservation;

    } catch (error) {
      this.logger.error('Failed to update recurring reservation', {
        error: error.message,
        id: command.id,
        userId: command.userId
      });

      throw new BadRequestException(`Failed to update recurring reservation: ${error.message}`);
    }
  }
}

@Injectable()
@CommandHandler(CancelRecurringReservationCommand)
export class CancelRecurringReservationHandler implements ICommandHandler<CancelRecurringReservationCommand> {
  constructor(
    @Inject('RecurringReservationDomainService')
    private readonly recurringReservationService: RecurringReservationDomainService,
    private readonly eventBus: EventBusService,
    private readonly logger: LoggingService
  ) {}

  async execute(command: CancelRecurringReservationCommand): Promise<void> {
    this.logger.log('Cancelling recurring reservation', {
      id: command.id,
      userId: command.userId,
      cancelScope: command.cancelScope,
      reason: command.reason
    });

    try {
      // Cancel using domain service
      const result = await this.recurringReservationService.cancelRecurringSeries(
        command.id,
        command.cancelScope === 'FUTURE_ONLY',
        command.reason
      );

      this.logger.log('Recurring reservation cancelled successfully', {
        id: command.id,
        cancelledInstances: result.cancelledInstances.length,
        cancelledReservations: result.cancelledReservations.length
      });

      // Publish domain event
      await this.eventBus.publishEvent({
        eventId: `recurring_reservation_cancelled_${command.id}`,
        eventType: 'recurring_reservation.cancelled',
        aggregateId: command.id,
        aggregateType: 'RecurringReservation',
        eventData: {
          recurringReservationId: command.id,
          userId: command.userId,
          reason: command.reason,
          cancelScope: command.cancelScope,
          cancelledInstances: result.cancelledInstances.length,
          cancelledReservations: result.cancelledReservations.length
        },
        timestamp: new Date(),
        version: 1
      });

    } catch (error) {
      this.logger.error('Failed to cancel recurring reservation', {
        error: error.message,
        id: command.id,
        userId: command.userId
      });

      throw new BadRequestException(`Failed to cancel recurring reservation: ${error.message}`);
    }
  }
}

@Injectable()
@CommandHandler(GenerateRecurringReservationInstancesCommand)
export class GenerateRecurringReservationInstancesHandler implements ICommandHandler<GenerateRecurringReservationInstancesCommand> {
  constructor(
    @Inject('RecurringReservationDomainService')
    private readonly recurringReservationService: RecurringReservationDomainService,
    private readonly eventBus: EventBusService,
    private readonly logger: LoggingService
  ) {}

  async execute(command: GenerateRecurringReservationInstancesCommand): Promise<{ generatedCount: number; totalInstances: number }> {
    this.logger.log('Generating recurring reservation instances', {
      id: command.id,
      generateUntil: command.generateUntil,
      maxInstances: command.maxInstances
    });

    try {
      const generatedCount = await this.recurringReservationService.generateInstancesUntil(
        command.id,
        command.generateUntil,
        command.maxInstances,
        command.skipConflicts
      );

      // Publish event
      await this.eventBus.publishEvent({
        eventId: `generate-recurring-reservation-instances-${command.id}`,
        eventType: 'recurring-reservations.instances-generated',
        aggregateId: command.id,
        aggregateType: 'RecurringReservation',
        eventData: {
          recurringReservationId: command.id,
          generatedCount,
          generateUntil: command.generateUntil,
          generatedBy: command.generatedBy,
        },
        timestamp: new Date(),
        version: 1,
      });

      this.logger.log('Recurring reservation instances generated successfully', {
        id: command.id,
        generatedCount
      });

      return {
        generatedCount: generatedCount.instances.length - generatedCount.conflicts.length,
        totalInstances: generatedCount.instances.length
      };

    } catch (error) {
      this.logger.error('Failed to generate recurring reservation instances', error, LoggingHelper.logParams({
        id: command.id
      }));
      throw error;
    }
  }
}

@Injectable()
@CommandHandler(ConfirmRecurringReservationInstanceCommand)
export class ConfirmRecurringReservationInstanceHandler implements ICommandHandler<ConfirmRecurringReservationInstanceCommand> {
  constructor(
    @Inject('RecurringReservationDomainService')
    private readonly recurringReservationService: RecurringReservationDomainService,
    private readonly eventBus: EventBusService,
    private readonly logger: LoggingService
  ) {}

  async execute(command: ConfirmRecurringReservationInstanceCommand): Promise<void> {
    this.logger.log('Confirming recurring reservation instance', {
      recurringReservationId: command.recurringReservationId,
      instanceId: command.instanceId,
      userId: command.userId
    });

    try {
      await this.recurringReservationService.confirmInstance(
        command.recurringReservationId,
        command.instanceId,
        command.notes
      );

      // Publish event
      await this.eventBus.publishEvent({
        eventId: `confirm-recurring-reservation-instance-${command.recurringReservationId}-${command.instanceId}`,
        eventType: 'recurring-reservations.instance-confirmed',
        aggregateId: command.recurringReservationId,
        aggregateType: 'RecurringReservation',
        eventData: {
          recurringReservationId: command.recurringReservationId,
          instanceId: command.instanceId,
          userId: command.userId,
          confirmedBy: command.confirmedBy,
          notes: command.notes,
        },
        timestamp: new Date(),
        version: 1,
      });

      this.logger.log('Recurring reservation instance confirmed successfully', {
        recurringReservationId: command.recurringReservationId,
        instanceId: command.instanceId
      });

    } catch (error) {
      this.logger.error('Failed to confirm recurring reservation instance', error, LoggingHelper.logParams({
        recurringReservationId: command.recurringReservationId,
        instanceId: command.instanceId
      }));
      throw error;
    }
  }
}

@Injectable()
@CommandHandler(ValidateRecurringReservationCommand)
export class ValidateRecurringReservationHandler implements ICommandHandler<ValidateRecurringReservationCommand> {
  constructor(
    @Inject('RecurringReservationDomainService')
    private readonly recurringReservationService: RecurringReservationDomainService,
    private readonly logger: LoggingService
  ) {}

  async execute(command: ValidateRecurringReservationCommand): Promise<{ isValid: boolean; errors: string[]; warnings: string[] }> {
    this.logger.log('Validating recurring reservation', {
      userId: command.userId,
      resourceId: command.resourceId,
      frequency: command.frequency
    });

    try {
      // Create temporary entity for validation
      const tempReservation = RecurringReservationEntity.create({
        title: command.title,
        description: undefined,
        resourceId: command.resourceId,
        userId: command.userId,
        startDate: command.startDate,
        endDate: command.endDate,
        startTime: command.startTime,
        endTime: command.endTime,
        frequency: command.frequency,
        interval: command.interval,
        daysOfWeek: command.daysOfWeek,
        dayOfMonth: command.dayOfMonth,
        status: RecurringReservationStatus.ACTIVE,
        totalInstances: 0,
        confirmedInstances: 0,
        programId: command.programId
      });

      const validation = await this.recurringReservationService.validateRecurringReservation(
        tempReservation,
        command.maxInstances,
        command.allowOverlap
      );

      this.logger.log('Recurring reservation validation completed', {
        isValid: validation.isValid,
        errorsCount: validation.errors.length,
        warningsCount: validation.warnings.length
      });

      return validation;

    } catch (error) {
      this.logger.error('Failed to validate recurring reservation', error, LoggingHelper.logParams({
        userId: command.userId,
        resourceId: command.resourceId
      }));
      throw error;
    }
  }
}

@Injectable()
@CommandHandler(BulkCancelRecurringReservationsCommand)
export class BulkCancelRecurringReservationsHandler implements ICommandHandler<BulkCancelRecurringReservationsCommand> {
  constructor(
    @Inject('RecurringReservationDomainService')
    private readonly recurringReservationService: RecurringReservationDomainService,
    private readonly eventBus: EventBusService,
    private readonly logger: LoggingService
  ) {}

  async execute(command: BulkCancelRecurringReservationsCommand): Promise<{ cancelled: number; failed: string[] }> {
    this.logger.log('Bulk cancelling recurring reservations', {
      reservationIds: command.reservationIds,
      userId: command.userId,
      reason: command.reason
    });

    try {
      const result = await this.recurringReservationService.bulkCancelRecurringReservations(
        command.reservationIds,
        command.reason,
        command.cancelScope
      );

      // Publish event
      await this.eventBus.publishEvent({
        eventId: `bulk-cancel-recurring-reservations-${command.reservationIds.join('-')}`,
        eventType: 'recurring-reservations.bulk-cancelled',
        aggregateId: command.reservationIds.join('-'),
        userId: command.userId,
        aggregateType: 'RecurringReservation',
        eventData: {
          reservationIds: command.reservationIds,
          cancelled: result.cancelled,
          failed: result.failed,
          reason: command.reason,
          cancelScope: command.cancelScope,
          cancelledBy: command.cancelledBy,
          timestamp: new Date()
        },
        version: 1,
        timestamp: new Date()
      });

      this.logger.log('Bulk cancel recurring reservations completed', {
        cancelled: result.cancelled,
        failed: result.failed.length
      });

      return result;

    } catch (error) {
      this.logger.error('Failed to bulk cancel recurring reservations', error, LoggingHelper.logParams({
        reservationIds: command.reservationIds,
        userId: command.userId
      }));
      throw error;
    }
  }
}
