import { UsageReportFiltersDto } from '@dto/reports/usage-report-filters.dto';
import { UserReportFiltersDto } from '@dto/reports/user-report-filters.dto';
import { UsageReportDataDto, UserReportDataDto } from '@dto/reports/report-response.dto';

/**
 * Repository interface for reports data access
 * Following Clean Architecture principles - domain layer defines the contract
 */
export interface ReportsRepository {
  /**
   * RF-31: Generate usage report by program, period, and resource type
   */
  generateUsageReport(filters: UsageReportFiltersDto): Promise<{
    data: UsageReportDataDto[];
    totalCount: number;
    executionTime: number;
  }>;

  /**
   * RF-32: Generate user reservations report
   */
  generateUserReport(filters: UserReportFiltersDto): Promise<{
    data: UserReportDataDto[];
    totalCount: number;
    executionTime: number;
  }>;

  /**
   * Get summary statistics for usage reports
   */
  getUsageReportSummary(filters: UsageReportFiltersDto): Promise<{
    totalResources: number;
    totalReservations: number;
    averageUtilization: number;
    mostUsedResource: string;
    leastUsedResource: string;
  }>;

  /**
   * Get summary statistics for user reports
   */
  getUserReportSummary(filters: UserReportFiltersDto): Promise<{
    totalUsers: number;
    totalReservations: number;
    averageReservationsPerUser: number;
    topUser: string;
    averageUtilization: number;
  }>;

  /**
   * Check if report data exists for given filters (for cache validation)
   */
  hasDataForFilters(filters: any): Promise<boolean>;

  /**
   * Get available filter options (for frontend dropdowns)
   */
  getAvailablePrograms(): Promise<Array<{ id: string; name: string; code: string }>>;
  getAvailableResourceTypes(): Promise<Array<{ type: string; count: number }>>;
  getAvailableCategories(): Promise<Array<{ id: string; name: string; count: number }>>;
  getAvailableUsers(userType?: string): Promise<Array<{ id: string; email: string; firstName: string; lastName: string }>>;
}
