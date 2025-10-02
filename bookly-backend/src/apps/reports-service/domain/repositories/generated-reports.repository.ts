/**
 * Repository interface for persistent report storage
 * Handles caching and historical report data
 */
export interface GeneratedReportsRepository {
  /**
   * Save a generated report to persistent storage
   */
  saveReport(reportData: {
    reportType: string;
    title: string;
    description?: string;
    generatedBy: string;
    filters: any;
    parameters?: any;
    data: any;
    metadata: any;
    summary?: any;
    cacheKey: string;
    expiresAt?: Date;
    isPublic?: boolean;
    allowedUsers?: string[];
    allowedRoles?: string[];
  }): Promise<{ id: string; cacheKey: string }>;

  /**
   * Find a report by cache key
   */
  findByCacheKey(cacheKey: string): Promise<any | null>;

  /**
   * Find reports by user and filters
   */
  findByUserAndFilters(
    userId: string,
    reportType: string,
    filters?: any,
  ): Promise<any[]>;

  /**
   * Update report access count and last accessed time
   */
  updateAccess(reportId: string, userId: string): Promise<void>;

  /**
   * Mark report as invalid (for cache invalidation)
   */
  invalidateReport(reportId: string): Promise<void>;

  /**
   * Clean up expired reports
   */
  cleanupExpiredReports(): Promise<number>;

  /**
   * Get report history for a user
   */
  getReportHistory(
    userId: string,
    reportType?: string,
    limit?: number,
  ): Promise<any[]>;

  /**
   * Check if user can access report
   */
  canUserAccessReport(reportId: string, userId: string, userRoles: string[]): Promise<boolean>;
}

/**
 * Repository interface for report exports
 */
export interface ReportExportsRepository {
  /**
   * Save export information
   */
  saveExport(exportData: {
    reportId: string;
    format: string;
    filename: string;
    filePath: string;
    fileSize: number;
    columns: string[];
    customHeaders?: string[];
    includeMetadata: boolean;
    delimiter?: string;
    exportedBy: string;
    expiresAt?: Date;
    sendByEmail?: boolean;
    emailAddress?: string;
  }): Promise<{ id: string; filename: string; filePath: string }>;

  /**
   * Find export by ID
   */
  findById(exportId: string): Promise<any | null>;

  /**
   * Find exports by report ID
   */
  findByReportId(reportId: string): Promise<any[]>;

  /**
   * Update download count
   */
  updateDownloadCount(exportId: string): Promise<void>;

  /**
   * Mark export as unavailable
   */
  markUnavailable(exportId: string): Promise<void>;

  /**
   * Clean up expired exports
   */
  cleanupExpiredExports(): Promise<number>;

  /**
   * Get user's export history
   */
  getUserExportHistory(userId: string, limit?: number): Promise<any[]>;
}
