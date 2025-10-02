import { QueryHandler, IQueryHandler } from '@nestjs/cqrs';
import { Injectable } from '@nestjs/common';
import { GetAvailabilityQuery, GetResourceAvailabilityQuery, CheckAvailabilityQuery } from '../queries/get-availability.query';
import { AvailabilityDto } from '@libs/dto/availability/availability.dto';
import { LoggingService } from '@libs/logging/logging.service';
import { AvailabilityService } from '../services/availability.service';

/**
 * Get Availability Query Handler (RF-07, RF-10)
 * Handles availability queries for calendar visualization
 */
@Injectable()
@QueryHandler(GetAvailabilityQuery)
export class GetAvailabilityHandler implements IQueryHandler<GetAvailabilityQuery> {
  constructor(
    private readonly availabilityService: AvailabilityService,
    private readonly logger: LoggingService
  ) {}

  async execute(query: GetAvailabilityQuery): Promise<AvailabilityDto[]> {
    this.logger.log(
      `Orchestrating availability query for resource ${query.resourceId}`,
      'GetAvailabilityHandler'
    );

    try {
      if (query.resourceId && query.dayOfWeek !== undefined) {
        return await this.availabilityService.findByResourceAndDay(
          query.resourceId,
          query.dayOfWeek
        );
      }

      if (query.resourceId) {
        return await this.availabilityService.findByResourceId(query.resourceId);
      }

      return await this.availabilityService.findAllActive();

    } catch (error) {
      this.logger.error(
        `Failed to orchestrate availability query for resource ${query.resourceId}`,
        'GetAvailabilityHandler',
        error
      );
      throw error;
    }
  }
}

/**
 * Get Resource Availability Query Handler (RF-10)
 * Provides comprehensive availability data for calendar display
 */
@Injectable()
@QueryHandler(GetResourceAvailabilityQuery)
export class GetResourceAvailabilityHandler implements IQueryHandler<GetResourceAvailabilityQuery> {
  constructor(
    private readonly availabilityService: AvailabilityService,
    private readonly logger: LoggingService
  ) {}

  async execute(query: GetResourceAvailabilityQuery): Promise<any> {
    this.logger.log(
      `Orchestrating comprehensive availability query for resource ${query.resourceId} from ${query.startDate} to ${query.endDate}`,
      'GetResourceAvailabilityHandler'
    );

    try {
      return await this.availabilityService.getResourceAvailabilityComprehensive({
        resourceId: query.resourceId,
        startDate: query.startDate,
        endDate: query.endDate,
        includeReservations: query.includeReservations,
        includeScheduleRestrictions: query.includeScheduleRestrictions
      });

    } catch (error) {
      this.logger.error(
        `Failed to orchestrate comprehensive availability query for ${query.resourceId}`,
        'GetResourceAvailabilityHandler',
        error
      );
      throw error;
    }
  }

  // generateTimeSlots method moved to AvailabilityService for centralized business logic
}

/**
 * Check Availability Query Handler
 * Validates if a specific time slot is available
 */
@Injectable()
@QueryHandler(CheckAvailabilityQuery)
export class CheckAvailabilityHandler implements IQueryHandler<CheckAvailabilityQuery> {
  constructor(
    private readonly availabilityService: AvailabilityService,
    private readonly logger: LoggingService
  ) {}

  async execute(query: CheckAvailabilityQuery): Promise<{ available: boolean; conflicts: string[]; restrictions: string[] }> {
    this.logger.log(
      `Orchestrating detailed availability check for resource ${query.resourceId} from ${query.startDate} to ${query.endDate}`,
      'CheckAvailabilityHandler'
    );

    try {
      return await this.availabilityService.checkAvailabilityDetailed({
        resourceId: query.resourceId,
        startDate: query.startDate,
        endDate: query.endDate
      });

    } catch (error) {
      this.logger.error(
        `Failed to orchestrate availability check for resource ${query.resourceId}`,
        'CheckAvailabilityHandler',
        error
      );
      throw error;
    }
  }
}
