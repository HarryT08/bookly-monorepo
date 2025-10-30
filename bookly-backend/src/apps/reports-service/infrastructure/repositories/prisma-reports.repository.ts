import { Injectable } from '@nestjs/common';
import { LoggingService } from '@logging/logging.service';
import { ReportsRepository } from '../../domain/repositories/reports.repository';
import { UsageReportFiltersDto, ResourceType, ReportPeriod } from '@dto/reports/usage-report-filters.dto';
import { UserReportFiltersDto, ReservationStatus, UserType } from '@dto/reports/user-report-filters.dto';
import { UsageReportDataDto, UserReportDataDto } from '@dto/reports/report-response.dto';
import { LoggingHelper } from '@/libs/logging/logging.helper';
import { PrismaService } from '@/libs/common/services/prisma.service';

/**
 * Prisma implementation of ReportsRepository
 * Handles complex queries for report generation with MongoDB aggregation
 */
@Injectable()
export class PrismaReportsRepository implements ReportsRepository {
  constructor(
    private readonly prisma: PrismaService,
    private readonly loggingService: LoggingService,
  ) {}

  /**
   * RF-31: Generate usage report by program, period, and resource type
   */
  async generateUsageReport(filters: UsageReportFiltersDto): Promise<{
    data: UsageReportDataDto[];
    totalCount: number;
    executionTime: number;
  }> {
    const startTime = Date.now();

    try {
      // Build date range filter
      const dateFilter = this.buildDateFilter(filters.startDate, filters.endDate, filters.period);
      
      // Build aggregation pipeline
      const pipeline = this.buildUsageReportPipeline(filters, dateFilter);

      // Execute aggregation
      const results = await this.prisma.reservation.aggregateRaw({
        pipeline,
      });

      // Process results
      const data = this.processUsageReportResults(results as any);
      
      // Get total count for pagination
      const totalCount = await this.getUsageReportTotalCount(filters, dateFilter);

      const executionTime = Date.now() - startTime;

      this.loggingService.log(
        `Usage report generated`,
        'PrismaReportsRepository',
        LoggingHelper.logParams({ 
          recordCount: data.length, 
          totalCount, 
          executionTime,
          filters: JSON.stringify(filters) 
        })
      );

      return { data, totalCount, executionTime };

    } catch (error) {
      this.loggingService.error(
        `Error generating usage report: ${error.message}`,
        error.stack,
        LoggingHelper.logParams({ filters })
      );
      throw error;
    }
  }

  /**
   * RF-32: Generate user reservations report
   */
  async generateUserReport(filters: UserReportFiltersDto): Promise<{
    data: UserReportDataDto[];
    totalCount: number;
    executionTime: number;
  }> {
    const startTime = Date.now();

    try {
      // Build date range filter
      const dateFilter = this.buildDateFilter(filters.startDate, filters.endDate);
      
      // Build aggregation pipeline
      const pipeline = this.buildUserReportPipeline(filters, dateFilter);

      // Execute aggregation
      const results = await this.prisma.user.aggregateRaw({
        pipeline,
      });

      // Process results
      const data = this.processUserReportResults(results as any, filters.includeDetails);
      
      // Get total count for pagination
      const totalCount = await this.getUserReportTotalCount(filters, dateFilter);

      const executionTime = Date.now() - startTime;

      this.loggingService.log(
        `User report generated`,
        'PrismaReportsRepository',
        LoggingHelper.logParams({ 
          recordCount: data.length, 
          totalCount, 
          executionTime,
          filters: JSON.stringify(filters) 
        })
      );

      return { data, totalCount, executionTime };

    } catch (error) {
      this.loggingService.error(
        `Error generating user report: ${error.message}`,
        error.stack,
        LoggingHelper.logParams({ filters })
      );
      throw error;
    }
  }

  /**
   * Get summary statistics for usage reports
   */
  async getUsageReportSummary(filters: UsageReportFiltersDto): Promise<{
    totalResources: number;
    totalReservations: number;
    averageUtilization: number;
    mostUsedResource: string;
    leastUsedResource: string;
  }> {
    try {
      const dateFilter = this.buildDateFilter(filters.startDate, filters.endDate, filters.period);
      
      const summaryPipeline = [
        {
          $match: {
            ...dateFilter,
            ...(filters.resourceTypes?.length && {
              'resource.type': { $in: filters.resourceTypes }
            }),
          }
        },
        {
          $lookup: {
            from: 'resources',
            localField: 'resourceId',
            foreignField: '_id',
            as: 'resource'
          }
        },
        {
          $unwind: '$resource'
        },
        {
          $group: {
            _id: '$resource._id',
            resourceName: { $first: '$resource.name' },
            reservationCount: { $sum: 1 },
            totalHours: {
              $sum: {
                $divide: [
                  { $subtract: ['$endDate', '$startDate'] },
                  3600000 // Convert to hours
                ]
              }
            }
          }
        },
        {
          $sort: { reservationCount: -1 }
        }
      ];

      const summaryResults: any = await this.prisma.reservation.aggregateRaw({
        pipeline: summaryPipeline,
      });

      const totalResources = summaryResults.length;
      const totalReservations = summaryResults.reduce((sum: number, item: any) => sum + item.reservationCount, 0);
      const averageUtilization = totalReservations > 0 ? 
        summaryResults.reduce((sum: number, item: any) => sum + item.totalHours, 0) / totalResources : 0;
      
      const mostUsedResource = summaryResults[0]?.resourceName || 'N/A';
      const leastUsedResource = summaryResults[summaryResults.length - 1]?.resourceName || 'N/A';

      return {
        totalResources,
        totalReservations,
        averageUtilization: Math.round(averageUtilization * 100) / 100,
        mostUsedResource,
        leastUsedResource,
      };

    } catch (error) {
      this.loggingService.error(
        `Error generating usage report summary: ${error.message}`,
        error.stack,
        'PrismaReportsRepository'
      );
      throw error;
    }
  }

  /**
   * Get summary statistics for user reports
   */
  async getUserReportSummary(filters: UserReportFiltersDto): Promise<{
    totalUsers: number;
    totalReservations: number;
    averageReservationsPerUser: number;
    topUser: string;
    averageUtilization: number;
  }> {
    try {
      const dateFilter = this.buildDateFilter(filters.startDate, filters.endDate);
      
      const summaryPipeline = [
        {
          $match: dateFilter
        },
        {
          $lookup: {
            from: 'users',
            localField: 'userId',
            foreignField: '_id',
            as: 'user'
          }
        },
        {
          $unwind: '$user'
        },
        {
          $group: {
            _id: '$user._id',
            userEmail: { $first: '$user.email' },
            reservationCount: { $sum: 1 },
            confirmedCount: {
              $sum: { $cond: [{ $eq: ['$status', 'CONFIRMED'] }, 1, 0] }
            }
          }
        },
        {
          $sort: { reservationCount: -1 }
        }
      ];

      const summaryResults: any = await this.prisma.reservation.aggregateRaw({
        pipeline: summaryPipeline,
      });

      const totalUsers = summaryResults.length;
      const totalReservations = summaryResults.reduce((sum: number, item: any) => sum + item.reservationCount, 0);
      const averageReservationsPerUser = totalUsers > 0 ? totalReservations / totalUsers : 0;
      const topUser = summaryResults[0]?.userEmail || 'N/A';
      const averageUtilization = totalReservations > 0 ?
        summaryResults.reduce((sum: number, item: any) => sum + (item.confirmedCount / item.reservationCount * 100), 0) / totalUsers : 0;

      return {
        totalUsers: totalUsers,
        totalReservations: totalReservations,
        averageReservationsPerUser: Math.round(averageReservationsPerUser * 100) / 100,
        topUser: topUser,
        averageUtilization: Math.round(averageUtilization * 100) / 100,
      };

    } catch (error) {
      this.loggingService.error(
        `Error generating user report summary: ${error.message}`,
        error.stack,
        'PrismaReportsRepository'
      );
      throw error;
    }
  }

  /**
   * Check if report data exists for given filters
   */
  async hasDataForFilters(filters: any): Promise<boolean> {
    try {
      const count = await this.prisma.reservation.count({
        where: {
          ...(filters.startDate && { startDate: { gte: new Date(filters.startDate) } }),
          ...(filters.endDate && { endDate: { lte: new Date(filters.endDate) } }),
        },
        take: 1,
      });

      return count > 0;
    } catch (error) {
      this.loggingService.warn(
        `Error checking data availability: ${error.message}`,
        'PrismaReportsRepository'
      );
      return false;
    }
  }

  /**
   * Get available programs for filters
   */
  async getAvailablePrograms(): Promise<Array<{ id: string; name: string; code: string }>> {
    try {
      // Note: This would need to be implemented based on your program model
      // For now, returning mock data
      return [
        { id: '1', name: 'Ingeniería de Sistemas', code: 'IS' },
        { id: '2', name: 'Ingeniería Industrial', code: 'II' },
        { id: '3', name: 'Administración de Empresas', code: 'AE' },
      ];
    } catch (error) {
      this.loggingService.error(
        `Error getting available programs: ${error.message}`,
        error.stack,
        'PrismaReportsRepository'
      );
      return [];
    }
  }

  /**
   * Get available resource types for filters
   */
  async getAvailableResourceTypes(): Promise<Array<{ type: string; count: number }>> {
    try {
      const results = await this.prisma.resource.groupBy({
        by: ['type'],
        _count: {
          id: true,
        },
        where: {
          isActive: true,
        },
      });

      return results.map(result => ({
        type: result.type,
        count: result._count.id,
      }));
    } catch (error) {
      this.loggingService.error(
        `Error getting available resource types: ${error.message}`,
        error.stack,
        'PrismaReportsRepository'
      );
      return [];
    }
  }

  /**
   * Get available categories for filters
   */
  async getAvailableCategories(): Promise<Array<{ id: string; name: string; count: number }>> {
    try {
      const categories = await this.prisma.category.findMany({
        where: { isActive: true },
        include: {
          _count: {
            select: { resources: true },
          },
        },
      });

      return categories.map(category => ({
        id: category.id,
        name: category.name,
        count: category._count.resources,
      }));
    } catch (error) {
      this.loggingService.error(
        `Error getting available categories: ${error.message}`,
        error.stack,
        'PrismaReportsRepository'
      );
      return [];
    }
  }

  /**
   * Get available users for filters
   */
  async getAvailableUsers(userType?: string): Promise<Array<{ id: string; email: string; firstName: string; lastName: string }>> {
    try {
      const users = await this.prisma.user.findMany({
        where: {
          isActive: true,
          ...(userType && {
            userRoles: {
              some: {
                role: {
                  category: userType.toUpperCase(),
                },
              },
            },
          }),
        },
        select: {
          id: true,
          email: true,
          firstName: true,
          lastName: true,
        },
        take: 100, // Limit for performance
      });

      return users;
    } catch (error) {
      this.loggingService.error(
        `Error getting available users: ${error.message}`,
        error.stack,
        'PrismaReportsRepository'
      );
      return [];
    }
  }

  // Private helper methods

  private buildDateFilter(startDate?: string, endDate?: string, period?: ReportPeriod): any {
    const filter: any = {};

    if (startDate && endDate) {
      filter.startDate = { $gte: new Date(startDate) };
      filter.endDate = { $lte: new Date(endDate) };
    } else if (period) {
      const dateRange = this.getDateRangeForPeriod(period);
      filter.startDate = { $gte: dateRange.start };
      filter.endDate = { $lte: dateRange.end };
    }

    return filter;
  }

  private getDateRangeForPeriod(period: ReportPeriod): { start: Date; end: Date } {
    const now = new Date();
    const start = new Date();
    const end = new Date();

    switch (period) {
      case ReportPeriod.DAILY:
        start.setHours(0, 0, 0, 0);
        end.setHours(23, 59, 59, 999);
        break;
      case ReportPeriod.WEEKLY:
        start.setDate(now.getDate() - 7);
        break;
      case ReportPeriod.MONTHLY:
        start.setMonth(now.getMonth() - 1);
        break;
      case ReportPeriod.QUARTERLY:
        start.setMonth(now.getMonth() - 3);
        break;
      case ReportPeriod.SEMESTER:
        start.setMonth(now.getMonth() - 6);
        break;
      case ReportPeriod.ANNUAL:
        start.setFullYear(now.getFullYear() - 1);
        break;
      default:
        start.setMonth(now.getMonth() - 1); // Default to monthly
    }

    return { start, end };
  }

  private buildUsageReportPipeline(filters: UsageReportFiltersDto, dateFilter: any): any[] {
    const pipeline: any[] = [
      { $match: dateFilter },
      {
        $lookup: {
          from: 'resources',
          localField: 'resourceId',
          foreignField: '_id',
          as: 'resource'
        }
      },
      { $unwind: '$resource' },
    ];

    // Add additional filters
    if (filters.resourceTypes?.length) {
      pipeline.push({
        $match: { 'resource.type': { $in: filters.resourceTypes } }
      });
    }

    if (filters.categoryIds?.length) {
      pipeline.push({
        $match: { 'resource.categoryId': { $in: filters.categoryIds.map(id => ({ $oid: id })) } }
      });
    }

    if (filters.resourceIds?.length) {
      pipeline.push({
        $match: { 'resource._id': { $in: filters.resourceIds.map(id => ({ $oid: id })) } }
      });
    }

    // Group and aggregate
    pipeline.push(
      {
        $group: {
          _id: '$resource._id',
          resource: { $first: '$resource' },
          totalReservations: { $sum: 1 },
          confirmedReservations: {
            $sum: { $cond: [{ $eq: ['$status', 'CONFIRMED'] }, 1, 0] }
          },
          cancelledReservations: {
            $sum: { $cond: [{ $eq: ['$status', 'CANCELLED'] }, 1, 0] }
          },
          totalHours: {
            $sum: {
              $divide: [
                { $subtract: ['$endDate', '$startDate'] },
                3600000
              ]
            }
          }
        }
      },
      {
        $addFields: {
          utilizationRate: {
            $multiply: [
              { $divide: ['$confirmedReservations', '$totalReservations'] },
              100
            ]
          },
          cancellationRate: {
            $multiply: [
              { $divide: ['$cancelledReservations', '$totalReservations'] },
              100
            ]
          }
        }
      }
    );

    // Add pagination
    if (filters.page && filters.limit) {
      const skip = (filters.page - 1) * filters.limit;
      pipeline.push({ $skip: skip }, { $limit: filters.limit });
    }

    return pipeline;
  }

  private buildUserReportPipeline(filters: UserReportFiltersDto, dateFilter: any): any[] {
    const pipeline: any[] = [
      {
        $lookup: {
          from: 'reservations',
          localField: '_id',
          foreignField: 'userId',
          as: 'reservations'
        }
      },
      {
        $addFields: {
          reservations: {
            $filter: {
              input: '$reservations',
              cond: {
                $and: [
                  dateFilter.startDate ? { $gte: ['$$this.startDate', dateFilter.startDate.$gte] } : true,
                  dateFilter.endDate ? { $lte: ['$$this.endDate', dateFilter.endDate.$lte] } : true,
                ]
              }
            }
          }
        }
      },
      {
        $match: {
          'reservations.0': { $exists: true } // Only users with reservations
        }
      }
    ];

    // Add user type filter
    if (filters.userTypes?.length) {
      pipeline.unshift({
        $lookup: {
          from: 'user_roles',
          localField: '_id',
          foreignField: 'userId',
          as: 'userRoles'
        }
      });
      pipeline.push({
        $match: {
          'userRoles.role.category': { $in: filters.userTypes }
        }
      });
    }

    // Group and calculate statistics
    pipeline.push(
      {
        $addFields: {
          totalReservations: { $size: '$reservations' },
          confirmedReservations: {
            $size: {
              $filter: {
                input: '$reservations',
                cond: { $eq: ['$$this.status', 'CONFIRMED'] }
              }
            }
          },
          cancelledReservations: {
            $size: {
              $filter: {
                input: '$reservations',
                cond: { $eq: ['$$this.status', 'CANCELLED'] }
              }
            }
          },
          noShowReservations: {
            $size: {
              $filter: {
                input: '$reservations',
                cond: { $eq: ['$$this.status', 'NO_SHOW'] }
              }
            }
          }
        }
      },
      {
        $addFields: {
          utilizationRate: {
            $multiply: [
              { $divide: ['$confirmedReservations', '$totalReservations'] },
              100
            ]
          },
          cancellationRate: {
            $multiply: [
              { $divide: ['$cancelledReservations', '$totalReservations'] },
              100
            ]
          },
          totalHours: {
            $sum: {
              $map: {
                input: '$reservations',
                as: 'reservation',
                in: {
                  $divide: [
                    { $subtract: ['$$reservation.endDate', '$$reservation.startDate'] },
                    3600000
                  ]
                }
              }
            }
          }
        }
      }
    );

    // Add sorting
    if (filters.sortBy) {
      const sortField = filters.sortBy === 'reservationCount' ? 'totalReservations' : filters.sortBy;
      const sortOrder = filters.sortOrder === 'asc' ? 1 : -1;
      pipeline.push({ $sort: { [sortField]: sortOrder } });
    }

    // Add pagination
    if (filters.page && filters.limit) {
      const skip = (filters.page - 1) * filters.limit;
      pipeline.push({ $skip: skip }, { $limit: filters.limit });
    }

    return pipeline;
  }

  private processUsageReportResults(results: any[]): UsageReportDataDto[] {
    return results.map(result => ({
      resource: {
        id: result._id,
        name: result.resource.name,
        code: result.resource.code,
        type: result.resource.type,
        capacity: result.resource.capacity,
      },
      totalReservations: result.totalReservations,
      confirmedReservations: result.confirmedReservations,
      cancelledReservations: result.cancelledReservations,
      totalHours: Math.round(result.totalHours * 100) / 100,
      utilizationRate: Math.round(result.utilizationRate * 100) / 100,
      cancellationRate: Math.round(result.cancellationRate * 100) / 100,
    }));
  }

  private processUserReportResults(results: any[], includeDetails?: boolean): UserReportDataDto[] {
    return results.map(result => ({
      user: {
        id: result._id,
        email: result.email,
        firstName: result.firstName,
        lastName: result.lastName,
        userType: result.userRoles?.[0]?.role?.category || 'UNKNOWN',
      },
      totalReservations: result.totalReservations,
      confirmedReservations: result.confirmedReservations,
      cancelledReservations: result.cancelledReservations,
      noShowReservations: result.noShowReservations,
      utilizationRate: Math.round(result.utilizationRate * 100) / 100,
      cancellationRate: Math.round(result.cancellationRate * 100) / 100,
      totalHours: Math.round(result.totalHours * 100) / 100,
      frequentResources: [], // TODO: Calculate from reservations
      ...(includeDetails && {
        reservationDetails: result.reservations?.slice(0, 10).map((res: any) => ({
          id: res._id,
          title: res.title,
          resourceName: res.resource?.name || 'Unknown',
          startDate: res.startDate,
          endDate: res.endDate,
          status: res.status,
        })) || []
      }),
    }));
  }

  private async getUsageReportTotalCount(filters: UsageReportFiltersDto, dateFilter: any): Promise<number> {
    const countPipeline = [
      { $match: dateFilter },
      {
        $lookup: {
          from: 'resources',
          localField: 'resourceId',
          foreignField: '_id',
          as: 'resource'
        }
      },
      { $unwind: '$resource' },
      { $group: { _id: '$resource._id' } },
      { $count: 'total' }
    ];

    const result: any = await this.prisma.reservation.aggregateRaw({
      pipeline: countPipeline,
    });

    return result[0]?.total || 0;
  }

  private async getUserReportTotalCount(filters: UserReportFiltersDto, dateFilter: any): Promise<number> {
    const countPipeline = [
      {
        $lookup: {
          from: 'reservations',
          localField: '_id',
          foreignField: 'userId',
          as: 'reservations'
        }
      },
      {
        $match: {
          'reservations.0': { $exists: true }
        }
      },
      { $count: 'total' }
    ];

    const result: any = await this.prisma.user.aggregateRaw({
      pipeline: countPipeline,
    });

    return result[0]?.total || 0;
  }
}
