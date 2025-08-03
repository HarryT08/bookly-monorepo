import { QueryHandler, IQueryHandler } from '@nestjs/cqrs';
import { Injectable, Inject } from '@nestjs/common';
import { GetReservationHistoryQuery, ExportReservationHistoryQuery } from '../queries/get-reservation-history.query';
import { ReservationHistoryRepository } from '../../domain/repositories/reservation-history.repository';
import { LoggingService } from '../../../../libs/logging/logging.service';

/**
 * Get Reservation History Query Handler (RF-11)
 * Handles reservation history queries with pagination and filtering
 */
@Injectable()
@QueryHandler(GetReservationHistoryQuery)
export class GetReservationHistoryHandler implements IQueryHandler<GetReservationHistoryQuery> {
  constructor(
    @Inject('ReservationHistoryRepository')
    private readonly reservationHistoryRepository: ReservationHistoryRepository,
    private readonly logger: LoggingService
  ) {}

  async execute(query: GetReservationHistoryQuery): Promise<any> {
    this.logger.log(
      `Getting reservation history for reservation ${query.reservationId || 'all'} by user ${query.userId || 'all'}`,
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

      const result = await this.reservationHistoryRepository.findWithFilters(filters);

      this.logger.log(
        `Retrieved ${result.total} reservation history records (page ${query.page}, limit ${query.limit})`,
        'GetReservationHistoryHandler'
      );

      return result;

    } catch (error) {
      this.logger.error(
        `Failed to get reservation history for reservation ${query.reservationId || 'all'}`,
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
    @Inject('ReservationHistoryRepository')
    private readonly reservationHistoryRepository: ReservationHistoryRepository,
    private readonly logger: LoggingService
  ) {}

  async execute(query: ExportReservationHistoryQuery): Promise<string> {
    this.logger.log(
      `Exporting reservation history for reservation ${query.reservationId || 'all'} by user ${query.userId || 'all'}`,
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

      const csvData = await this.reservationHistoryRepository.exportToCsv(filters);

      this.logger.log(
        `Exported ${csvData.length} characters of reservation history data`,
        'ExportReservationHistoryHandler'
      );

      return csvData;

    } catch (error) {
      this.logger.error(
        `Failed to export reservation history for reservation ${query.reservationId || 'all'}`,
        'ExportReservationHistoryHandler',
        error
      );
      throw error;
    }
  }
}
