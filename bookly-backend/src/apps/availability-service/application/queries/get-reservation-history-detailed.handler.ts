import { QueryHandler, IQueryHandler } from '@nestjs/cqrs';
import { Injectable, Logger } from '@nestjs/common';
import { GetReservationHistoryDetailedQuery } from './get-reservation-history-detailed.query';
import { ReservationHistoryRepository } from '../../domain/repositories/reservation-history.repository';
import { ReservationRepository } from '../../domain/repositories/reservation.repository';
import { 
  ReservationHistoryResponseDto, 
  ReservationHistoryEntryDto,
  HistoryAction,
  HistorySource
} from '../../../../libs/dto/availability/reservation-history-detailed.dto';

/**
 * Query Handler for getting detailed reservation history (RF-11)
 * Provides comprehensive audit trail with advanced filtering and analytics
 */
@Injectable()
@QueryHandler(GetReservationHistoryDetailedQuery)
export class GetReservationHistoryDetailedHandler implements IQueryHandler<GetReservationHistoryDetailedQuery> {
  private readonly logger = new Logger(GetReservationHistoryDetailedHandler.name);

  constructor(
    private readonly reservationHistoryRepository: ReservationHistoryRepository,
    private readonly reservationRepository: ReservationRepository
  ) {}

  async execute(query: GetReservationHistoryDetailedQuery): Promise<ReservationHistoryResponseDto> {
    const {
      reservationId,
      userId,
      resourceId,
      actions,
      sources,
      startDate,
      endDate,
      page,
      limit,
      sortBy,
      sortOrder,
      includeReservationData,
      includeUserData
    } = query;

    this.logger.log('Executing detailed reservation history query', {
      reservationId,
      userId,
      resourceId,
      page,
      limit,
      includeReservationData,
      includeUserData
    });

    try {
      // Build filter criteria
      const filters = {
        reservationId,
        userId,
        resourceId,
        actions,
        sources,
        startDate,
        endDate
      };

      // Get total count for pagination
      const totalCount = await this.reservationHistoryRepository.countByFilters(filters);

      // Calculate pagination
      const totalPages = Math.ceil(totalCount / limit);
      const offset = (page - 1) * limit;

      // Get history entries
      const historyEntries = await this.reservationHistoryRepository.findByFilters(
        filters,
        {
          limit,
          offset,
          sortBy,
          sortOrder,
          includeReservationData,
          includeUserData
        }
      );

      // Convert to DTOs
      const entryDtos: ReservationHistoryEntryDto[] = historyEntries.map(entry => ({
        id: entry.id,
        reservationId: entry.reservationId,
        userId: entry.userId,
        action: entry.action,
        source: entry.source,
        previousData: entry.previousData,
        newData: entry.newData,
        details: entry.details,
        ipAddress: entry.ipAddress,
        userAgent: entry.userAgent,
        createdAt: entry.createdAt,
        reservation: entry.reservation ? {
          id: entry.reservation.id,
          title: entry.reservation.title,
          resourceId: entry.reservation.resourceId,
          startDate: entry.reservation.startDate,
          endDate: entry.reservation.endDate,
          status: entry.reservation.status
        } : undefined,
        user: entry.user ? {
          id: entry.user.id,
          name: entry.user.name,
          email: entry.user.email,
          role: entry.user.role
        } : undefined
      }));

      // Generate summary statistics
      const summary = await this.generateSummaryStatistics(historyEntries, filters);

      // Build response
      const response: ReservationHistoryResponseDto = {
        entries: entryDtos,
        pagination: {
          page,
          limit,
          total: totalCount,
          totalPages,
          hasNext: page < totalPages,
          hasPrev: page > 1
        },
        summary,
        filters: {
          reservationId,
          userId,
          resourceId,
          actions,
          sources,
          startDate: startDate?.toISOString(),
          endDate: endDate?.toISOString(),
          page,
          limit,
          sortBy,
          sortOrder,
          includeReservationData,
          includeUserData
        }
      };

      this.logger.log('Detailed reservation history query executed successfully', {
        totalEntries: totalCount,
        returnedEntries: entryDtos.length,
        page,
        totalPages
      });

      return response;

    } catch (error) {
      this.logger.error('Failed to execute detailed reservation history query', {
        query,
        error: error.message
      });
      throw error;
    }
  }

  /**
   * Generate comprehensive summary statistics for the history data
   */
  private async generateSummaryStatistics(entries: any[], filters: any) {
    // Count actions
    const actionCounts: Record<HistoryAction, number> = Object.values(HistoryAction).reduce(
      (acc, action) => ({ ...acc, [action]: 0 }),
      {} as Record<HistoryAction, number>
    );

    // Count sources
    const sourceCounts: Record<HistorySource, number> = Object.values(HistorySource).reduce(
      (acc, source) => ({ ...acc, [source]: 0 }),
      {} as Record<HistorySource, number>
    );

    const uniqueUsers = new Set<string>();
    const uniqueReservations = new Set<string>();
    let earliest: Date | null = null;
    let latest: Date | null = null;

    entries.forEach(entry => {
      // Count actions and sources
      actionCounts[entry.action]++;
      sourceCounts[entry.source]++;

      // Track unique users and reservations
      uniqueUsers.add(entry.userId);
      uniqueReservations.add(entry.reservationId);

      // Track date range
      const entryDate = new Date(entry.createdAt);
      if (!earliest || entryDate < earliest) earliest = entryDate;
      if (!latest || entryDate > latest) latest = entryDate;
    });

    // Get total count from repository if filtering is applied
    const totalEntries = await this.reservationHistoryRepository.countByFilters(filters);

    return {
      totalEntries,
      actionCounts,
      sourceCounts,
      uniqueUsers: uniqueUsers.size,
      uniqueReservations: uniqueReservations.size,
      dateRange: {
        earliest: earliest || new Date(),
        latest: latest || new Date()
      }
    };
  }
}
