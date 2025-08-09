/**
 * Command Handlers for Recurring Reservations (RF-12)
 * CQRS Command Handler Pattern Implementation
 */

import { CommandHandler, ICommandHandler, EventBus } from '@nestjs/cqrs';
import { Injectable, NotFoundException, BadRequestException, ForbiddenException } from '@nestjs/common';
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
} from '../commands/create-recurring-reservation.command';

// Domain Services
import { RecurringReservationDomainService } from '../../domain/services/recurring-reservation-domain.service';
import { ReservationLimitsDomainService } from '../../domain/services/reservation-limits-domain.service';

// Repositories
import { RecurringReservationRepository } from '../../domain/repositories/recurring-reservation.repository';
import { ResourceRepository } from '@/apps/resources-service/domain/repositories/resource.repository';
import { UserRepository } from '@/apps/auth-service/domain/repositories/user.repository';

// Entities
import { RecurringReservationEntity } from '../../domain/entities/recurring-reservation.entity';
import { LoggingHelper } from '@/libs/logging/logging.helper';
import { RecurringReservationStatus } from '../../utils/recurring-reservation-status.enum';

@Injectable()
@CommandHandler(CreateRecurringReservationCommand)
export class CreateRecurringReservationHandler implements ICommandHandler<CreateRecurringReservationCommand> {
  constructor(
    private readonly recurringReservationService: RecurringReservationDomainService,
    private readonly reservationLimitsService: ReservationLimitsDomainService,
    private readonly recurringReservationRepository: RecurringReservationRepository,
    private readonly resourceRepository: ResourceRepository,
    private readonly userRepository: UserRepository,
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

    try {
      // Validate resource exists
      const resource = await this.resourceRepository.findById(command.resourceId);
      if (!resource) {
        throw new NotFoundException(`Resource with ID ${command.resourceId} not found`);
      }

      // Validate user exists
      const user = await this.userRepository.findById(command.userId);
      if (!user) {
        throw new NotFoundException(`User with ID ${command.userId} not found`);
      }

      // Check reservation limits
      const canCreate = await this.reservationLimitsService.validateReservationLimits({
        userId: command.userId,
        resourceId: command.resourceId,
        programId: command.programId,
        startDate: command.startDate,
        endDate: command.endDate,
        isRecurring: true,
        recurringInstanceCount: command.maxInstances
      });

      if (!canCreate.isValid) {
        throw new BadRequestException(`Reservation limit exceeded: ${canCreate.reason}`);
      }

      // Create recurring reservation entity
      const recurringReservation = RecurringReservationEntity.create({
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
        status: RecurringReservationStatus.ACTIVE,
        totalInstances: 0, // totalInstances - will be calculated
        confirmedInstances: 0, // confirmedInstances
        programId: command.programId
      });

      // Validate the recurring reservation
      const validation = await this.recurringReservationService.validateRecurringReservation(
        recurringReservation,
        command.maxInstances,
        command.allowOverlap
      );

      if (!validation.isValid) {
        throw new BadRequestException(`Validation failed: ${validation.errors.join(', ')}`);
      }

      // Save the recurring reservation
      const savedReservation = await this.recurringReservationRepository.create(recurringReservation);

      // Generate initial instances
      await this.recurringReservationService.generateInstances(
        savedReservation,
        command.maxInstances,
        //true // skipConflicts
      );

      // Publish event
      await this.eventBus.publishEvent({
        eventId: `create-recurring-reservation-${savedReservation.id}`,
        eventType: 'recurring-reservations.created',
        aggregateId: savedReservation.id,
        aggregateType: 'RecurringReservation',
        userId: command.userId,
        eventData: {
          recurringReservationId: savedReservation.id,
          userId: command.userId,
          resourceId: command.resourceId,
          title: command.title,
          frequency: command.frequency,
          startDate: command.startDate,
          endDate: command.endDate,
          timestamp: new Date()
        },
        version: 1,
        timestamp: new Date()
      });

      this.logger.log('Recurring reservation created successfully', {
        id: savedReservation.id,
        userId: command.userId,
        resourceId: command.resourceId
      });

      return savedReservation;

    } catch (error) {
      this.logger.error('Failed to create recurring reservation', error, LoggingHelper.logParams({
        userId: command.userId,
        resourceId: command.resourceId,
        title: command.title
      }));
      throw error;
    }
  }
}

@Injectable()
@CommandHandler(UpdateRecurringReservationCommand)
export class UpdateRecurringReservationHandler implements ICommandHandler<UpdateRecurringReservationCommand> {
  constructor(
    private readonly recurringReservationService: RecurringReservationDomainService,
    private readonly recurringReservationRepository: RecurringReservationRepository,
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
      // Get existing reservation
      const existingReservation = await this.recurringReservationRepository.findById(command.id);
      if (!existingReservation) {
        throw new NotFoundException(`Recurring reservation with ID ${command.id} not found`);
      }

      // Check permissions
      if (existingReservation.userId !== command.userId) {
        // TODO: Add role-based permission check for admins
        throw new ForbiddenException('You can only update your own reservations');
      }

      // Update the reservation
      const updatedReservation = await this.recurringReservationService.updateRecurringReservation(
        command.id,
        command.updateData,
        command.updateScope,
        command.regenerateInstances
      );

      // Publish event
      await this.eventBus.publishEvent({
        eventId: `update-recurring-reservation-${command.id}`,
        eventType: 'recurring-reservations.updated',
        aggregateId: command.id,
        aggregateType: 'RecurringReservation',
        userId: command.userId,
        eventData: {
          recurringReservationId: command.id,
          userId: command.userId,
          updateScope: command.updateScope,
          updateData: command.updateData,
          updateReason: command.updateReason,
          updatedBy: command.updatedBy,
          timestamp: new Date()
        },
        version: 1,
        timestamp: new Date()
      });

      this.logger.log('Recurring reservation updated successfully', {
        id: command.id,
        userId: command.userId,
        updateScope: command.updateScope
      });

      return updatedReservation;

    } catch (error) {
      this.logger.error('Failed to update recurring reservation', error, LoggingHelper.logParams({
        id: command.id,
        userId: command.userId
      }));
      throw error;
    }
  }
}

@Injectable()
@CommandHandler(CancelRecurringReservationCommand)
export class CancelRecurringReservationHandler implements ICommandHandler<CancelRecurringReservationCommand> {
  constructor(
    private readonly recurringReservationService: RecurringReservationDomainService,
    private readonly recurringReservationRepository: RecurringReservationRepository,
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
      // Get existing reservation
      const existingReservation = await this.recurringReservationRepository.findById(command.id);
      if (!existingReservation) {
        throw new NotFoundException(`Recurring reservation with ID ${command.id} not found`);
      }

      // Check permissions
      if (existingReservation.userId !== command.userId) {
        // TODO: Add role-based permission check for admins
        throw new ForbiddenException('You can only cancel your own reservations');
      }

      // Cancel the reservation
      await this.recurringReservationService.cancelRecurringReservation(
        command.id,
        command.reason,
        command.cancelScope
      );

      // Publish event
      await this.eventBus.publishEvent({
        eventId: `cancel-recurring-reservation-${command.id}`,
        eventType: 'recurring-reservations.cancelled',
        aggregateId: command.id,
        aggregateType: 'RecurringReservation',
        userId: command.userId,
        eventData: {
          recurringReservationId: command.id,
          cancelScope: command.cancelScope,
          reason: command.reason,
          cancelledBy: command.cancelledBy,
          timestamp: new Date()
        },
        version: 1,
        timestamp: new Date()
      });

      this.logger.log('Recurring reservation cancelled successfully', {
        id: command.id,
        userId: command.userId,
        cancelScope: command.cancelScope
      });

    } catch (error) {
      this.logger.error('Failed to cancel recurring reservation', error, LoggingHelper.logParams({
        id: command.id,
        userId: command.userId
      }));
      throw error;
    }
  }
}

@Injectable()
@CommandHandler(GenerateRecurringReservationInstancesCommand)
export class GenerateRecurringReservationInstancesHandler implements ICommandHandler<GenerateRecurringReservationInstancesCommand> {
  constructor(
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
