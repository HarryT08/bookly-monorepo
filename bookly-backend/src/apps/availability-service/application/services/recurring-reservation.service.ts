/**
 * Recurring Reservation Application Service (RF-12)
 * Orchestrates CQRS commands and queries for recurring reservations
 */

import { Injectable, NotFoundException, BadRequestException, ConflictException } from "@nestjs/common";
import { CommandBus, QueryBus } from "@nestjs/cqrs";
import { LoggingService } from "@libs/logging/logging.service";
import { PrismaService } from "@libs/common/services/prisma.service";

// DTOs
import { CreateRecurringReservationDto } from "../../infrastructure/dtos/create-recurring-reservation.dto";
import { UpdateRecurringReservationDto } from "../../infrastructure/dtos/update-recurring-reservation.dto";
import { RecurringReservationResponseDto } from "../../infrastructure/dtos/recurring-reservation-response.dto";

// Commands
import {
  CreateRecurringReservationCommand,
  UpdateRecurringReservationCommand,
  CancelRecurringReservationCommand,
  CancelRecurringReservationInstanceCommand,
  GenerateRecurringReservationInstancesCommand,
  ConfirmRecurringReservationInstanceCommand,
  ValidateRecurringReservationCommand,
  BulkCancelRecurringReservationsCommand,
} from "../commands/create-recurring-reservation.command";

// Queries
import {
  GetRecurringReservationQuery,
  GetRecurringReservationsQuery,
  GetRecurringReservationInstancesQuery,
  GetRecurringReservationStatsQuery,
  ValidateRecurringReservationQuery,
  GetRecurringReservationConflictsQuery,
  GetUserRecurringReservationsQuery,
  GetResourceRecurringReservationsQuery,
  GetRecurringReservationsByProgramQuery,
  SearchRecurringReservationsQuery,
  GetRecurringReservationAnalyticsQuery,
  GetUpcomingRecurringInstancesQuery,
  GetRecurringReservationHistoryQuery,
  GetRecurringReservationSuggestionsQuery,
} from "../queries/recurring-reservation.queries";

// Entities
import { RecurringReservationEntity } from "../../domain/entities/recurring-reservation.entity";
import { RecurringReservationInstanceEntity } from "../../domain/entities/recurring-reservation-instance.entity";
import { RecurrenceFrequency } from "../../utils/recurrence-frequency.enum";
import { RecurringReservationStatus } from "../../utils/recurring-reservation-status.enum";
import { RecurringReservationPriority } from "../../utils";

@Injectable()
export class RecurringReservationService {
  constructor(
    private readonly loggingService: LoggingService,
    private readonly prisma: PrismaService,
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus
  ) {}
  async create(data: {
    userId: string;
    createdBy: string;
    title: string;
    description?: string;
    resourceId: string;
    startDate: string;
    endDate: string;
    startTime: string;
    endTime: string;
    frequency: RecurrenceFrequency;
    interval?: number;
    daysOfWeek?: number[];
    dayOfMonth?: number;
    programId?: string;
    maxInstances?: number;
    autoConfirm?: boolean;
    sendNotifications?: boolean;
    notes?: string;
    tags?: string[];
    priority?: "LOW" | "MEDIUM" | "HIGH";
    allowOverlap?: boolean;
    requireConfirmation?: boolean;
    reminderHours?: number;
    customRule?: string;
  }): Promise<RecurringReservationResponseDto> {
    this.loggingService.log('Creating recurring reservation', {
      userId: data.userId,
      resourceId: data.resourceId,
      title: data.title
    }, 'RecurringReservationService');

    try {
      // Validate resource exists
      const resource = await this.prisma.resource.findUnique({
        where: { id: data.resourceId },
        include: { category: true }
      });

      if (!resource) {
        throw new NotFoundException('Resource not found');
      }

      // Validate user exists
      const user = await this.prisma.user.findUnique({
        where: { id: data.userId },
        include: { userRoles: { include: { role: true } } }
      });

      if (!user) {
        throw new NotFoundException('User not found');
      }

      // Validate dates and times
      const startDate = new Date(data.startDate);
      const endDate = new Date(data.endDate);
      
      if (startDate >= endDate) {
        throw new BadRequestException('Start date must be before end date');
      }

      if (data.startTime >= data.endTime) {
        throw new BadRequestException('Start time must be before end time');
      }

      // Create recurring reservation entity for validation
      const entity = RecurringReservationEntity.create({
        title: data.title,
        description: data.description,
        resourceId: data.resourceId,
        userId: data.userId,
        startDate,
        endDate,
        startTime: data.startTime,
        endTime: data.endTime,
        frequency: data.frequency,
        interval: data.interval || 1,
        daysOfWeek: data.daysOfWeek,
        dayOfMonth: data.dayOfMonth,
        status: RecurringReservationStatus.ACTIVE,
        totalInstances: 0,
        confirmedInstances: 0
      });

      // Validate entity
      const validation = entity.validate();
      if (!validation.isValid) {
        throw new BadRequestException(`Validation failed: ${validation.errors.join(', ')}`);
      }

      // Check for conflicts if not allowing overlap
      if (!data.allowOverlap) {
        const conflicts = await this.checkForConflicts(data.resourceId, startDate, endDate, data.startTime, data.endTime, data.frequency, data.interval, data.daysOfWeek, data.dayOfMonth);
        if (conflicts.length > 0) {
          throw new ConflictException('Recurring reservation conflicts with existing reservations');
        }
      }

      // Create in database
      const created = await this.prisma.recurringReservation.create({
        data: {
          title: data.title,
          description: data.description,
          resourceId: data.resourceId,
          userId: data.userId,
          startDate,
          endDate,
          startTime: data.startTime,
          endTime: data.endTime,
          frequency: data.frequency,
          interval: data.interval || 1,
          daysOfWeek: data.daysOfWeek || [],
          dayOfMonth: data.dayOfMonth,
          status: 'ACTIVE',
          totalInstances: 0,
          confirmedInstances: 0
        },
        include: {
          resource: { include: { category: true } },
          user: { include: { userRoles: { include: { role: true } } } }
        }
      });

      // Generate initial instances
      await this.generateInstancesForRecurringReservation(created.id, startDate, endDate);

      this.loggingService.log('Recurring reservation created successfully', { id: created.id });

      return this.mapToResponseDto(created);
    } catch (error) {
      this.loggingService.error('Error creating recurring reservation', error, 'RecurringReservationService');
      throw error;
    }
  }
  async findAll(filters: {
    userId?: string;
    resourceId?: string;
    programId?: string;
    status?: string;
    frequency?: string;
    startDate?: Date;
    endDate?: Date;
    page?: number;
    limit?: number;
    sortBy?: string;
    sortOrder?: 'ASC' | 'DESC';
  }): Promise<{
    data: RecurringReservationResponseDto[];
    total: number;
    page: number;
    limit: number;
  }> {
    this.loggingService.log('Finding all recurring reservations', { filters });

    try {
      const page = filters.page || 1;
      const limit = Math.min(filters.limit || 10, 100); // Max 100 items per page
      const skip = (page - 1) * limit;
      const sortBy = filters.sortBy || 'createdAt';
      const sortOrder = filters.sortOrder || 'DESC';

      // Build where clause
      const where: any = {};
      
      if (filters.userId) where.userId = filters.userId;
      if (filters.resourceId) where.resourceId = filters.resourceId;
      if (filters.status) where.status = filters.status;
      if (filters.frequency) where.frequency = filters.frequency;
      if (filters.startDate || filters.endDate) {
        where.AND = [];
        if (filters.startDate) {
          where.AND.push({ endDate: { gte: filters.startDate } });
        }
        if (filters.endDate) {
          where.AND.push({ startDate: { lte: filters.endDate } });
        }
      }

      // Execute queries in parallel
      const [items, total] = await Promise.all([
        this.prisma.recurringReservation.findMany({
          where,
          include: {
            resource: { include: { category: true } },
            user: { include: { userRoles: { include: { role: true } } } },
            instances: {
              take: 5, // Include only first 5 instances for performance
              orderBy: { scheduledDate: 'asc' }
            }
          },
          skip,
          take: limit,
          orderBy: { [sortBy]: sortOrder.toLowerCase() }
        }),
        this.prisma.recurringReservation.count({ where })
      ]);

      const data = items.map(item => this.mapToResponseDto(item));

      this.loggingService.log('Found recurring reservations', { total, page, limit });

      return { data, total, page, limit };
    } catch (error) {
      this.loggingService.error('Error finding recurring reservations', error);
      throw error;
    }
  }
  async findById(
    id: string,
    options: {
      includeInstances?: boolean;
      includeStats?: boolean;
      userId?: string;
    } = {}
  ): Promise<RecurringReservationResponseDto> {
    this.loggingService.log('Finding recurring reservation by ID', { id, options });

    try {
      const recurringReservation = await this.prisma.recurringReservation.findUnique({
        where: { id },
        include: {
          resource: { include: { category: true } },
          user: { include: { userRoles: { include: { role: true } } } },
          instances: options.includeInstances ? {
            orderBy: { scheduledDate: 'asc' },
            take: 50 // Limit instances for performance
          } : false
        }
      });

      if (!recurringReservation) {
        throw new NotFoundException('Recurring reservation not found');
      }

      // Check access permissions if userId provided
      if (options.userId && recurringReservation.userId !== options.userId) {
        // Additional permission checks could be implemented here
        // For now, allow access to all users
      }

      const responseDto = this.mapToResponseDto(recurringReservation);

      // Add statistics if requested
      if (options.includeStats) {
        const stats = await this.calculateStats(id);
        responseDto.stats = stats;
      }

      this.loggingService.log('Found recurring reservation', { id });
      return responseDto;
    } catch (error) {
      this.loggingService.error('Error finding recurring reservation by ID', error);
      throw error;
    }
  }
  async update(
    id: string,
    updateDto: UpdateRecurringReservationDto,
    userId: string
  ): Promise<RecurringReservationResponseDto> {
    this.loggingService.log('Creating recurring reservation', { id, userId, updateScope: updateDto.updateScope });

    try {
      // Find existing recurring reservation
      const existing = await this.prisma.recurringReservation.findUnique({
        where: { id },
        include: {
          resource: { include: { category: true } },
          user: { include: { userRoles: { include: { role: true } } } }
        }
      });

      if (!existing) {
        throw new NotFoundException('Recurring reservation not found');
      }

      // Check permissions
      if (existing.userId !== userId) {
        // Additional permission checks could be implemented here
        // For now, allow updates only by the owner
        throw new BadRequestException('You can only update your own recurring reservations');
      }

      // Prepare update data
      const updateData: any = {};
      
      if (updateDto.title !== undefined) updateData.title = updateDto.title;
      if (updateDto.description !== undefined) updateData.description = updateDto.description;
      if (updateDto.startDate !== undefined) updateData.startDate = new Date(updateDto.startDate);
      if (updateDto.endDate !== undefined) updateData.endDate = new Date(updateDto.endDate);
      if (updateDto.startTime !== undefined) updateData.startTime = updateDto.startTime;
      if (updateDto.endTime !== undefined) updateData.endTime = updateDto.endTime;
      if (updateDto.frequency !== undefined) updateData.frequency = updateDto.frequency;
      if (updateDto.interval !== undefined) updateData.interval = updateDto.interval;
      if (updateDto.daysOfWeek !== undefined) updateData.daysOfWeek = updateDto.daysOfWeek;
      if (updateDto.dayOfMonth !== undefined) updateData.dayOfMonth = updateDto.dayOfMonth;

      // Validate changes if significant updates
      if (updateData.startDate || updateData.endDate || updateData.startTime || updateData.endTime || updateData.frequency) {
        // Check for conflicts with new schedule
        const conflicts = await this.checkForConflicts(
          existing.resourceId,
          updateData.startDate || existing.startDate,
          updateData.endDate || existing.endDate,
          updateData.startTime || existing.startTime,
          updateData.endTime || existing.endTime,
          updateData.frequency || existing.frequency as RecurrenceFrequency,
          updateData.interval || existing.interval,
          updateData.daysOfWeek || existing.daysOfWeek,
          updateData.dayOfMonth || existing.dayOfMonth,
          id // Exclude current reservation from conflict check
        );

        if (conflicts.length > 0) {
          throw new ConflictException('Updated schedule conflicts with existing reservations');
        }
      }

      // Update in database
      const updated = await this.prisma.recurringReservation.update({
        where: { id },
        data: updateData,
        include: {
          resource: { include: { category: true } },
          user: { include: { userRoles: { include: { role: true } } } }
        }
      });

      // Regenerate instances if schedule changed
      if (updateDto.regenerateInstances && (updateData.startDate || updateData.endDate || updateData.frequency || updateData.interval || updateData.daysOfWeek || updateData.dayOfMonth)) {
        // Delete existing pending instances
        await this.prisma.recurringReservationInstance.deleteMany({
          where: {
            recurringReservationId: id,
            status: 'PENDING'
          }
        });

        // Generate new instances
        await this.generateInstancesForRecurringReservation(
          id,
          updated.startDate,
          updated.endDate
        );
      }

      this.loggingService.log('Recurring reservation updated successfully', { id });
      return this.mapToResponseDto(updated);
    } catch (error) {
      this.loggingService.error('Error updating recurring reservation', error);
      throw error;
    }
  }
  async cancel(
    id: string,
    reason: string,
    cancelScope: 'FUTURE_ONLY' | 'ALL_INSTANCES' = 'FUTURE_ONLY',
    userId: string
  ): Promise<void> {
    this.loggingService.log('Cancelling recurring reservation', { id, reason, cancelScope, userId });

    try {
      // Find existing recurring reservation
      const existing = await this.prisma.recurringReservation.findUnique({
        where: { id }
      });

      if (!existing) {
        throw new NotFoundException('Recurring reservation not found');
      }

      // Check permissions
      if (existing.userId !== userId) {
        throw new BadRequestException('You can only cancel your own recurring reservations');
      }

      if (existing.status === 'CANCELLED') {
        throw new BadRequestException('Recurring reservation is already cancelled');
      }

      // Update recurring reservation status
      await this.prisma.recurringReservation.update({
        where: { id },
        data: {
          status: 'CANCELLED',
          updatedAt: new Date()
        }
      });

      // Cancel instances based on scope
      const instanceFilter: any = {
        recurringReservationId: id
      };

      if (cancelScope === 'FUTURE_ONLY') {
        instanceFilter.scheduledDate = { gte: new Date() };
      }

      instanceFilter.status = { in: ['PENDING', 'CONFIRMED'] };

      await this.prisma.recurringReservationInstance.updateMany({
        where: instanceFilter,
        data: {
          status: 'CANCELLED',
          cancelledAt: new Date()
        }
      });

      this.loggingService.log('Recurring reservation cancelled successfully', { id, cancelScope });
    } catch (error) {
      this.loggingService.error('Error cancelling recurring reservation', error);
      throw error;
    }
  }
  getInstances(
    id: string,
    filters: { status: string; from: Date; to: Date; userId: any }
  ): any[] | PromiseLike<any[]> {
    // TODO: Implement get instances logic
    // Mock implementation - would fetch recurring reservation instances
    return [];
  }
  cancelInstance(id: string, instanceId: string, reason: string, cancelScope: string) {
    // TODO: Implement cancel instance logic
    // Mock implementation - would cancel specific instance
    return;
  }
  getStatistics(id: string, filters: any): any {
    // TODO: Implement get statistics logic
    // Mock implementation - would calculate statistics
    return {
      totalInstances: 0,
      completedInstances: 0,
      cancelledInstances: 0,
      successRate: 0
    };
  }
  async validate(data: {
    userId: string;
    title: string;
    description?: string;
    resourceId: string;
    startDate: string;
    endDate: string;
    startTime: string;
    endTime: string;
    frequency: RecurrenceFrequency;
    interval?: number;
    daysOfWeek?: number[];
    dayOfMonth?: number;
    programId?: string;
    maxInstances?: number;
    autoConfirm?: boolean;
    sendNotifications?: boolean;
    notes?: string;
    tags?: string[];
    priority?: "LOW" | "MEDIUM" | "HIGH";
    allowOverlap?: boolean;
    requireConfirmation?: boolean;
    reminderHours?: number;
    customRule?: string;
    excludeId?: string;
  }): Promise<{
    isValid: boolean;
    violations: string[];
    warnings: string[];
    estimatedInstances: number;
    conflicts: any[];
  }> {
    this.loggingService.log('Validating recurring reservation', {
      userId: data.userId,
      resourceId: data.resourceId,
      title: data.title
    });

    try {
      const violations: string[] = [];
      const warnings: string[] = [];
      let conflicts: any[] = [];

      // Validate resource exists
      const resource = await this.prisma.resource.findUnique({
        where: { id: data.resourceId }
      });

      if (!resource) {
        violations.push('Resource not found');
      }

      // Validate user exists
      const user = await this.prisma.user.findUnique({
        where: { id: data.userId }
      });

      if (!user) {
        violations.push('User not found');
      }

      // Create entity for validation
      const entity = RecurringReservationEntity.create({
        title: data.title,
        description: data.description,
        resourceId: data.resourceId,
        userId: data.userId,
        startDate: new Date(data.startDate),
        endDate: new Date(data.endDate),
        startTime: data.startTime,
        endTime: data.endTime,
        frequency: data.frequency,
        interval: data.interval || 1,
        daysOfWeek: data.daysOfWeek,
        dayOfMonth: data.dayOfMonth,
        status: RecurringReservationStatus.ACTIVE,
        totalInstances: 0,
        confirmedInstances: 0
      });

      // Validate entity business rules
      const entityValidation = entity.validate();
      if (!entityValidation.isValid) {
        violations.push(...entityValidation.errors);
      }

      // Generate occurrences to estimate instances
      const occurrences = entity.generateOccurrences();
      const estimatedInstances = occurrences.length;

      // Check for conflicts if not allowing overlap
      if (!data.allowOverlap && violations.length === 0) {
        conflicts = await this.checkForConflicts(
          data.resourceId,
          new Date(data.startDate),
          new Date(data.endDate),
          data.startTime,
          data.endTime,
          data.frequency,
          data.interval || 1,
          data.daysOfWeek,
          data.dayOfMonth,
          data.excludeId
        );

        if (conflicts.length > 0) {
          violations.push(`Found ${conflicts.length} scheduling conflicts`);
        }
      }

      // Add warnings
      if (estimatedInstances > 100) {
        warnings.push('Large number of instances will be generated (>100)');
      }

      if (estimatedInstances === 0) {
        warnings.push('No instances will be generated with current configuration');
      }

      const isValid = violations.length === 0;

      this.loggingService.log('Validation completed', {
        isValid,
        violationsCount: violations.length,
        warningsCount: warnings.length,
        estimatedInstances,
        conflictsCount: conflicts.length
      });

      return {
        isValid,
        violations,
        warnings,
        estimatedInstances,
        conflicts
      };
    } catch (error) {
      this.loggingService.error('Error validating recurring reservation', error);
      return {
        isValid: false,
        violations: ['Validation error occurred'],
        warnings: [],
        estimatedInstances: 0,
        conflicts: []
      };
    }
  }
  async bulkCancel(
    reservationIds: string[],
    reason: string,
    cancelScope: 'FUTURE_ONLY' | 'ALL_INSTANCES' = 'FUTURE_ONLY',
    userId: string
  ): Promise<{
    successful: string[];
    failed: Array<{ id: string; error: string }>;
    totalProcessed: number;
  }> {
    this.loggingService.log('Bulk cancelling recurring reservations', {
      reservationIds,
      reason,
      cancelScope,
      userId
    });

    const successful: string[] = [];
    const failed: Array<{ id: string; error: string }> = [];

    try {
      // Process each reservation individually to handle partial failures
      for (const id of reservationIds) {
        try {
          await this.cancel(id, reason, cancelScope, userId);
          successful.push(id);
        } catch (error) {
          failed.push({
            id,
            error: error instanceof Error ? error.message : 'Unknown error'
          });
        }
      }

      this.loggingService.log('Bulk cancel completed', {
        successful: successful.length,
        failed: failed.length,
        total: reservationIds.length
      });

      return {
        successful,
        failed,
        totalProcessed: reservationIds.length
      };
    } catch (error) {
      this.loggingService.error('Error in bulk cancel operation', error);
      
      // If there's a general error, mark all as failed
      const allFailed = reservationIds.map(id => ({
        id,
        error: error instanceof Error ? error.message : 'Bulk operation failed'
      }));

      return {
        successful: [],
        failed: allFailed,
        totalProcessed: reservationIds.length
      };
    }
  }

  // Private Helper Methods

  private async checkForConflicts(
    resourceId: string,
    startDate: Date,
    endDate: Date,
    startTime: string,
    endTime: string,
    frequency: RecurrenceFrequency,
    interval: number,
    daysOfWeek?: number[],
    dayOfMonth?: number,
    excludeId?: string
  ): Promise<any[]> {
    this.loggingService.log('Checking for conflicts', { resourceId, startDate, endDate });

    try {
      // Create entity to generate occurrences
      const entity = RecurringReservationEntity.create({
        title: 'temp',
        resourceId,
        userId: 'temp',
        startDate,
        endDate,
        startTime,
        endTime,
        frequency,
        interval,
        daysOfWeek,
        dayOfMonth,
        status: RecurringReservationStatus.ACTIVE,
        totalInstances: 0,
        confirmedInstances: 0
      });

      const occurrences = entity.generateOccurrences();
      const conflicts = [];

      // Check each occurrence for conflicts
      for (const occurrence of occurrences) {
        const startDateTime = new Date(`${occurrence.toISOString().split('T')[0]}T${startTime}:00`);
        const endDateTime = new Date(`${occurrence.toISOString().split('T')[0]}T${endTime}:00`);

        // Check existing reservations (using startDate/endDate from schema)
        const existingReservations = await this.prisma.reservation.findMany({
          where: {
            resourceId,
            status: { in: ['APROBADA', 'PENDIENTE', 'SOLICITADO'] },
            OR: [
              {
                AND: [
                  { startDate: { lte: startDateTime } },
                  { endDate: { gt: startDateTime } }
                ]
              },
              {
                AND: [
                  { startDate: { lt: endDateTime } },
                  { endDate: { gte: endDateTime } }
                ]
              },
              {
                AND: [
                  { startDate: { gte: startDateTime } },
                  { endDate: { lte: endDateTime } }
                ]
              }
            ]
          }
        });

        // Check existing recurring reservations
        const existingRecurring = await this.prisma.recurringReservation.findMany({
          where: {
            resourceId,
            status: 'ACTIVE',
            id: excludeId ? { not: excludeId } : undefined,
            startDate: { lte: occurrence },
            endDate: { gte: occurrence }
          }
        });

        if (existingReservations.length > 0 || existingRecurring.length > 0) {
          conflicts.push({
            date: occurrence,
            startTime,
            endTime,
            conflictingReservations: existingReservations.length,
            conflictingRecurring: existingRecurring.length
          });
        }
      }

      return conflicts;
    } catch (error) {
      this.loggingService.error('Error checking for conflicts', error);
      return [];
    }
  }

  private async generateInstancesForRecurringReservation(
    recurringReservationId: string,
    startDate: Date,
    endDate: Date
  ): Promise<void> {
    this.loggingService.log('Generating instances for recurring reservation', {
      recurringReservationId,
      startDate,
      endDate
    });

    try {
      const recurringReservation = await this.prisma.recurringReservation.findUnique({
        where: { id: recurringReservationId }
      });

      if (!recurringReservation) {
        throw new NotFoundException('Recurring reservation not found');
      }

      // Create entity to generate occurrences
      const entity = RecurringReservationEntity.fromPersistence({
        id: recurringReservation.id,
        title: recurringReservation.title,
        description: recurringReservation.description,
        resourceId: recurringReservation.resourceId,
        userId: recurringReservation.userId,
        startDate: recurringReservation.startDate,
        endDate: recurringReservation.endDate,
        startTime: recurringReservation.startTime,
        endTime: recurringReservation.endTime,
        frequency: recurringReservation.frequency as RecurrenceFrequency,
        interval: recurringReservation.interval,
        daysOfWeek: recurringReservation.daysOfWeek,
        dayOfMonth: recurringReservation.dayOfMonth,
        status: recurringReservation.status as RecurringReservationStatus,
        totalInstances: recurringReservation.totalInstances,
        confirmedInstances: recurringReservation.confirmedInstances,
        createdAt: recurringReservation.createdAt,
        updatedAt: recurringReservation.updatedAt
      });

      const occurrences = entity.generateOccurrences();

      // Create instances in database
      const instances = occurrences.map(occurrence => ({
        recurringReservationId,
        scheduledDate: occurrence,
        startTime: recurringReservation.startTime,
        endTime: recurringReservation.endTime,
        status: 'PENDING'
      }));

      if (instances.length > 0) {
        await this.prisma.recurringReservationInstance.createMany({
          data: instances
        });

        // Update total instances count
        await this.prisma.recurringReservation.update({
          where: { id: recurringReservationId },
          data: { totalInstances: instances.length }
        });
      }

      this.loggingService.log('Generated instances successfully', {
        recurringReservationId,
        instanceCount: instances.length
      });
    } catch (error) {
      this.loggingService.error('Error generating instances', error);
      throw error;
    }
  }

  private mapToResponseDto(data: any): RecurringReservationResponseDto {
    return {
      id: data.id,
      title: data.title,
      description: data.description,
      resource: {
        id: data.resource.id,
        name: data.resource.name,
        type: data.resource.category?.name || 'UNKNOWN',
        capacity: data.resource.capacity || 0,
        location: data.resource.location || ''
      },
      user: {
        id: data.user.id,
        fullName: `${data.user.firstName} ${data.user.lastName}`,
        email: data.user.email,
        role: data.user.userRoles?.[0]?.role?.name || 'USER'
      },
      startDate: data.startDate.toISOString(),
      endDate: data.endDate.toISOString(),
      startTime: data.startTime,
      endTime: data.endTime,
      frequency: data.frequency,
      interval: data.interval,
      daysOfWeek: data.daysOfWeek,
      dayOfMonth: data.dayOfMonth,
      status: data.status,
      priority: 'MEDIUM', // Default priority
      tags: [], // Default empty tags
      autoConfirm: false,
      sendNotifications: true,
      requireConfirmation: true,
      stats: {
        totalInstances: data.totalInstances || 0,
        confirmedInstances: data.confirmedInstances || 0,
        cancelledInstances: 0,
        completedInstances: 0,
        noShowInstances: 0,
        confirmationRate: data.totalInstances > 0 ? (data.confirmedInstances / data.totalInstances) * 100 : 0,
        completionRate: 0,
        averageConfirmationTime: 0
      },
      createdAt: data.createdAt.toISOString(),
      updatedAt: data.updatedAt.toISOString(),
      createdBy: data.userId,
      canModify: true,
      canCancel: data.status === 'ACTIVE'
    };
  }

  private async calculateStats(recurringReservationId: string): Promise<any> {
    this.loggingService.log('Calculating stats for recurring reservation', { recurringReservationId });

    try {
      const instances = await this.prisma.recurringReservationInstance.findMany({
        where: { recurringReservationId }
      });

      const total = instances.length;
      const confirmed = instances.filter(i => i.status === 'CONFIRMED').length;
      const cancelled = instances.filter(i => i.status === 'CANCELLED').length;
      const pending = instances.filter(i => i.status === 'PENDING').length;

      return {
        totalInstances: total,
        confirmedInstances: confirmed,
        cancelledInstances: cancelled,
        pendingInstances: pending,
        completedInstances: 0, // Would need additional logic to track completed
        noShowInstances: 0, // Would need additional logic to track no-shows
        confirmationRate: total > 0 ? (confirmed / total) * 100 : 0,
        completionRate: 0,
        averageConfirmationTime: 0
      };
    } catch (error) {
      this.loggingService.error('Error calculating stats', error);
      return {
        totalInstances: 0,
        confirmedInstances: 0,
        cancelledInstances: 0,
        pendingInstances: 0,
        completedInstances: 0,
        noShowInstances: 0,
        confirmationRate: 0,
        completionRate: 0,
        averageConfirmationTime: 0
      };
    }
  }

  // Command Methods

  async createRecurringReservation(
    dto: CreateRecurringReservationDto,
    userId: string
  ): Promise<RecurringReservationEntity> {
    this.loggingService.log("Creating recurring reservation via application service", {
      userId,
      title: dto.title,
      resourceId: dto.resourceId,
    });

    const command = new CreateRecurringReservationCommand(
      dto.title,
      dto.resourceId,
      userId,
      new Date(dto.startDate),
      new Date(dto.endDate),
      dto.startTime,
      dto.endTime,
      dto.frequency,
      dto.interval,
      dto.daysOfWeek,
      dto.dayOfMonth,
      dto.description,
      dto.programId,
      dto.maxInstances,
      dto.autoConfirm,
      dto.sendNotifications,
      dto.notes,
      dto.tags,
      dto.priority,
      dto.allowOverlap,
      dto.requireConfirmation,
      dto.reminderHours,
      dto.customRule,
      userId
    );

    return await this.commandBus.execute(command);
  }

  async updateRecurringReservation(
    id: string,
    dto: UpdateRecurringReservationDto,
    userId: string
  ): Promise<RecurringReservationEntity> {
    this.loggingService.log("Updating recurring reservation via application service", {
      id,
      userId,
      updateScope: dto.updateScope,
    });

    const updateData: any = {};

    // Map DTO fields to update data
    if (dto.title !== undefined) updateData.title = dto.title;
    if (dto.description !== undefined) updateData.description = dto.description;
    if (dto.startDate !== undefined)
      updateData.startDate = new Date(dto.startDate);
    if (dto.endDate !== undefined) updateData.endDate = new Date(dto.endDate);
    if (dto.startTime !== undefined) updateData.startTime = dto.startTime;
    if (dto.endTime !== undefined) updateData.endTime = dto.endTime;
    if (dto.frequency !== undefined) updateData.frequency = dto.frequency;
    if (dto.interval !== undefined) updateData.interval = dto.interval;
    if (dto.daysOfWeek !== undefined) updateData.daysOfWeek = dto.daysOfWeek;
    if (dto.dayOfMonth !== undefined) updateData.dayOfMonth = dto.dayOfMonth;
    if (dto.programId !== undefined) updateData.programId = dto.programId;
    if (dto.maxInstances !== undefined)
      updateData.maxInstances = dto.maxInstances;
    if (dto.autoConfirm !== undefined) updateData.autoConfirm = dto.autoConfirm;
    if (dto.sendNotifications !== undefined)
      updateData.sendNotifications = dto.sendNotifications;
    if (dto.notes !== undefined) updateData.notes = dto.notes;
    if (dto.tags !== undefined) updateData.tags = dto.tags;
    if (dto.priority !== undefined) updateData.priority = dto.priority;
    if (dto.allowOverlap !== undefined)
      updateData.allowOverlap = dto.allowOverlap;
    if (dto.requireConfirmation !== undefined)
      updateData.requireConfirmation = dto.requireConfirmation;
    if (dto.reminderHours !== undefined)
      updateData.reminderHours = dto.reminderHours;
    if (dto.customRule !== undefined) updateData.customRule = dto.customRule;

    const command = new UpdateRecurringReservationCommand(
      id,
      userId,
      updateData,
      dto.updateScope,
      dto.updateReason,
      dto.notifyUsers,
      dto.regenerateInstances,
      userId
    );

    return await this.commandBus.execute(command);
  }

  async cancelRecurringReservation(
    id: string,
    reason: string,
    userId: string,
    cancelScope: "FUTURE_ONLY" | "ALL_INSTANCES" = "FUTURE_ONLY",
    notifyUsers: boolean = true
  ): Promise<void> {
    this.loggingService.log(
      "Cancelling recurring reservation via application service",
      {
        id,
        userId,
        reason,
        cancelScope,
      }
    );

    const command = new CancelRecurringReservationCommand(
      id,
      userId,
      reason,
      cancelScope,
      notifyUsers,
      userId
    );

    return await this.commandBus.execute(command);
  }

  async cancelRecurringReservationInstance(
    recurringReservationId: string,
    instanceId: string,
    reason: string,
    userId: string,
    notifyUsers: boolean = true
  ): Promise<void> {
    this.loggingService.log(
      "Cancelling recurring reservation instance via application service",
      {
        recurringReservationId,
        instanceId,
        userId,
        reason,
      }
    );

    const command = new CancelRecurringReservationInstanceCommand(
      recurringReservationId,
      instanceId,
      userId,
      reason,
      notifyUsers,
      userId
    );

    return await this.commandBus.execute(command);
  }

  async generateInstances(
    id: string,
    generateUntil: Date,
    userId: string,
    maxInstances?: number,
    skipConflicts: boolean = true
  ): Promise<{ generatedCount: number; totalInstances: number }> {
    this.loggingService.log(
      "Generating recurring reservation instances via application service",
      {
        id,
        generateUntil,
        userId,
        maxInstances,
      }
    );

    const command = new GenerateRecurringReservationInstancesCommand(
      id,
      generateUntil,
      userId,
      maxInstances,
      skipConflicts,
      userId
    );

    return await this.commandBus.execute(command);
  }

  async confirmInstance(
    recurringReservationId: string,
    instanceId: string,
    userId: string,
    notes?: string
  ): Promise<void> {
    this.loggingService.log(
      "Confirming recurring reservation instance via application service",
      {
        recurringReservationId,
        instanceId,
        userId,
      }
    );

    const command = new ConfirmRecurringReservationInstanceCommand(
      recurringReservationId,
      instanceId,
      userId,
      userId,
      notes
    );

    return await this.commandBus.execute(command);
  }

  async validateRecurringReservation(
    dto: CreateRecurringReservationDto,
    userId: string
  ): Promise<{ isValid: boolean; errors: string[]; warnings: string[] }> {
    this.loggingService.log(
      "Validating recurring reservation via application service",
      {
        userId,
        title: dto.title,
        resourceId: dto.resourceId,
      }
    );

    const command = new ValidateRecurringReservationCommand(
      dto.title,
      dto.resourceId,
      userId,
      new Date(dto.startDate),
      new Date(dto.endDate),
      dto.startTime,
      dto.endTime,
      dto.frequency,
      dto.interval,
      dto.daysOfWeek,
      dto.dayOfMonth,
      dto.maxInstances,
      dto.allowOverlap,
      dto.programId
    );

    return await this.commandBus.execute(command);
  }

  async bulkCancelRecurringReservations(
    reservationIds: string[],
    reason: string,
    userId: string,
    cancelScope: "FUTURE_ONLY" | "ALL_INSTANCES" = "FUTURE_ONLY",
    notifyUsers: boolean = true
  ): Promise<{ cancelled: number; failed: string[] }> {
    this.loggingService.log(
      "Bulk cancelling recurring reservations via application service",
      {
        reservationIds,
        userId,
        reason,
      }
    );

    const command = new BulkCancelRecurringReservationsCommand(
      reservationIds,
      reason,
      userId,
      cancelScope,
      notifyUsers,
      userId
    );

    return await this.commandBus.execute(command);
  }

  // Query Methods

  async getRecurringReservation(
    id: string,
    userId: string,
    includeInstances: boolean = false,
    includeStats: boolean = true
  ): Promise<
    RecurringReservationEntity & {
      instances?: RecurringReservationInstanceEntity[];
      stats?: any;
    }
  > {
    this.loggingService.log("Getting recurring reservation via application service", {
      id,
      userId,
      includeInstances,
      includeStats,
    });

    const query = new GetRecurringReservationQuery(
      id,
      userId,
      includeInstances,
      includeStats
    );
    return await this.queryBus.execute(query);
  }

  async getRecurringReservations(
    filters: {
      userId?: string;
      resourceId?: string;
      programId?: string;
      status?: RecurringReservationStatus;
      frequency?: any;
      startDate?: Date;
      endDate?: Date;
      priority?: RecurringReservationPriority;
      tags?: string[];
    },
    pagination: {
      page: number;
      limit: number;
      sortBy?: string;
      sortOrder?: "ASC" | "DESC";
    },
    options: {
      includeStats?: boolean;
      includeInstances?: boolean;
    },
    requestingUserId: string
  ): Promise<{
    items: RecurringReservationEntity[];
    total: number;
    page: number;
    limit: number;
  }> {
    this.loggingService.log("Getting recurring reservations via application service", {
      filters,
      pagination,
      requestingUserId,
    });

    const query = new GetRecurringReservationsQuery(
      filters.userId,
      filters.resourceId,
      filters.programId,
      filters.status,
      filters.frequency,
      filters.startDate,
      filters.endDate,
      filters.priority,
      filters.tags,
      options.includeStats || false,
      options.includeInstances || false,
      pagination.page,
      pagination.limit,
      pagination.sortBy || "createdAt",
      pagination.sortOrder || "DESC",
      requestingUserId
    );

    return await this.queryBus.execute(query);
  }

  async getRecurringReservationInstances(
    recurringReservationId: string,
    userId: string,
    filters: {
      status?: RecurringReservationStatus;
      startDate?: Date;
      endDate?: Date;
      includeConfirmed?: boolean;
      includePending?: boolean;
      includeCancelled?: boolean;
    },
    pagination: {
      page: number;
      limit: number;
      sortBy?: string;
      sortOrder?: "ASC" | "DESC";
    }
  ): Promise<{
    items: RecurringReservationInstanceEntity[];
    total: number;
    page: number;
    limit: number;
  }> {
    this.loggingService.log(
      "Getting recurring reservation instances via application service",
      {
        recurringReservationId,
        userId,
        filters,
        pagination,
      }
    );

    const query = new GetRecurringReservationInstancesQuery(
      recurringReservationId,
      userId,
      filters.status,
      filters.startDate,
      filters.endDate,
      filters.includeConfirmed !== false,
      filters.includePending !== false,
      filters.includeCancelled || false,
      pagination.page,
      pagination.limit,
      pagination.sortBy || "date",
      pagination.sortOrder || "ASC"
    );

    return await this.queryBus.execute(query);
  }

  async getRecurringReservationStats(
    id: string,
    userId: string,
    includeProjections: boolean = false,
    includeComparisons: boolean = false
  ): Promise<any> {
    this.loggingService.log(
      "Getting recurring reservation stats via application service",
      {
        id,
        userId,
        includeProjections,
        includeComparisons,
      }
    );

    const query = new GetRecurringReservationStatsQuery(
      id,
      userId,
      includeProjections,
      includeComparisons
    );
    return await this.queryBus.execute(query);
  }

  async validateRecurringReservationQuery(
    dto: CreateRecurringReservationDto,
    userId: string,
    excludeId?: string
  ): Promise<{ isValid: boolean; errors: string[]; warnings: string[] }> {
    this.loggingService.log(
      "Validating recurring reservation query via application service",
      {
        userId,
        title: dto.title,
        resourceId: dto.resourceId,
        excludeId,
      }
    );

    const query = new ValidateRecurringReservationQuery(
      dto.title,
      dto.resourceId,
      userId,
      new Date(dto.startDate),
      new Date(dto.endDate),
      dto.startTime,
      dto.endTime,
      dto.frequency,
      dto.interval,
      dto.daysOfWeek,
      dto.dayOfMonth,
      dto.maxInstances,
      dto.allowOverlap,
      dto.programId,
      excludeId
    );

    return await this.queryBus.execute(query);
  }

  async getRecurringReservationConflicts(
    id: string,
    userId: string,
    checkFutureOnly: boolean = true,
    includeResolutions: boolean = true
  ): Promise<any> {
    this.loggingService.log(
      "Getting recurring reservation conflicts via application service",
      {
        id,
        userId,
        checkFutureOnly,
        includeResolutions,
      }
    );

    const query = new GetRecurringReservationConflictsQuery(
      id,
      userId,
      checkFutureOnly,
      includeResolutions
    );
    return await this.queryBus.execute(query);
  }

  async getUserRecurringReservations(
    userId: string,
    status?: RecurringReservationStatus,
    includeStats: boolean = true,
    includeUpcoming: boolean = true,
    limit: number = 10,
    requestingUserId: string = userId
  ): Promise<any> {
    this.loggingService.log(
      "Getting user recurring reservations via application service",
      {
        userId,
        status,
        limit,
        requestingUserId,
      }
    );

    const query = new GetUserRecurringReservationsQuery(
      userId,
      status,
      includeStats,
      includeUpcoming,
      limit,
      requestingUserId
    );

    return await this.queryBus.execute(query);
  }

  async getRecurringReservationAnalytics(
    filters: {
      userId?: string;
      resourceId?: string;
      programId?: string;
      startDate?: Date;
      endDate?: Date;
    },
    options: {
      groupBy?: "day" | "week" | "month";
      metrics?: string[];
    },
    requestingUserId: string
  ): Promise<any> {
    this.loggingService.log(
      "Getting recurring reservation analytics via application service",
      {
        filters,
        options,
        requestingUserId,
      }
    );

    const query = new GetRecurringReservationAnalyticsQuery(
      filters.userId,
      filters.resourceId,
      filters.programId,
      filters.startDate,
      filters.endDate,
      options.groupBy || "month",
      options.metrics || ["total", "confirmed", "cancelled", "completion_rate"],
      requestingUserId
    );

    return await this.queryBus.execute(query);
  }

  async getUpcomingRecurringInstances(
    filters: {
      userId?: string;
      resourceId?: string;
      programId?: string;
    },
    days: number = 7,
    includeUnconfirmed: boolean = true,
    limit: number = 20,
    requestingUserId: string
  ): Promise<RecurringReservationInstanceEntity[]> {
    this.loggingService.log(
      "Getting upcoming recurring instances via application service",
      {
        filters,
        days,
        limit,
        requestingUserId,
      }
    );

    const query = new GetUpcomingRecurringInstancesQuery(
      filters.userId,
      filters.resourceId,
      filters.programId,
      days,
      includeUnconfirmed,
      limit,
      requestingUserId
    );

    return await this.queryBus.execute(query);
  }
}
