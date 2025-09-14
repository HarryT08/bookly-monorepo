import { QueryHandler, IQueryHandler } from '@nestjs/cqrs';
import { Injectable } from '@nestjs/common';
import { GetReservationHistoryQuery, ExportReservationHistoryQuery } from '../queries/get-reservation-history.query';
import { LoggingService } from '@libs/logging/logging.service';
import { AvailabilityService } from '../services/availability.service';

/**
 * Get Reservation History Query Handler (RF-11)
 * Handles reservation history queries with pagination and filtering
 */
@Injectable()
@QueryHandler(GetReservationHistoryQuery)
export class GetReservationHistoryHandler implements IQueryHandler<GetReservationHistoryQuery> {
  constructor(
    private readonly availabilityService: AvailabilityService,
    private readonly logger: LoggingService
  ) {}

  async execute(query: GetReservationHistoryQuery): Promise<any> {
    this.logger.log(
      `Orchestrating reservation history query for reservation ${query.reservationId || 'all'} by user ${query.userId || 'all'}`,
      'GetReservationHistoryHandler'
    );

    try {
      const filters = {
        reservationId: query.reservationId,
        userId: query.userId,
        resourceId: query.resourceId,
        action: query.action,
        startDate: query.startDate,
        endDate: query.endDate,
        page: query.page,
        limit: query.limit
      };

      return await this.availabilityService.getReservationHistory(filters);

    } catch (error) {
      this.logger.error(
        `Failed to orchestrate reservation history query for reservation ${query.reservationId || 'all'}`,
        'GetReservationHistoryHandler',
        error
      );
      throw error;
    }
  }
}

/**
 * Export Reservation History Query Handler (RF-11)
 * Handles CSV export of reservation history
 */
@Injectable()
@QueryHandler(ExportReservationHistoryQuery)
export class ExportReservationHistoryHandler implements IQueryHandler<ExportReservationHistoryQuery> {
  constructor(
    private readonly availabilityService: AvailabilityService,
    private readonly logger: LoggingService
  ) {}

  async execute(query: ExportReservationHistoryQuery): Promise<string> {
    this.logger.log(
      `Orchestrating reservation history CSV export for reservation ${query.reservationId || 'all'} by user ${query.userId || 'all'}`,
      'ExportReservationHistoryHandler'
    );

    try {
      const filters = {
        reservationId: query.reservationId,
        userId: query.userId,
        resourceId: query.resourceId,
        action: query.action,
        startDate: query.startDate,
        endDate: query.endDate
      };

      return await this.availabilityService.exportReservationHistoryToCsv(filters);

    } catch (error) {
      this.logger.error(
        `Failed to orchestrate reservation history CSV export for reservation ${query.reservationId || 'all'}`,
        'ExportReservationHistoryHandler',
        error
      );
      throw error;
    }
  }
}
