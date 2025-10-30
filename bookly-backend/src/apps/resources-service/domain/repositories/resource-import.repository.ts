import { ResourceImportEntity } from '../entities/resource-import.entity';
import { ImportStatus } from '../../utils/import-status.enum';

/**
 * HITO 6 - RF-04: ResourceImport Repository Interface
 */
export interface ResourceImportRepository {
  /**
   * Creates a new resource import record
   */
  create(resourceImport: ResourceImportEntity): Promise<ResourceImportEntity>;

  /**
   * Updates an existing resource import
   */
  update(id: string, resourceImport: ResourceImportEntity): Promise<ResourceImportEntity>;

  /**
   * Finds a resource import by ID
   */
  findById(id: string): Promise<ResourceImportEntity | null>;

  /**
   * Gets imports by user
   */
  findByUser(userId: string): Promise<ResourceImportEntity[]>;

  /**
   * Gets imports by status
   */
  findByStatus(status: ImportStatus): Promise<ResourceImportEntity[]>;

  /**
   * Gets imports with pagination
   */
  findWithPagination(
    page: number,
    limit: number,
    filters?: {
      userId?: string;
      status?: ImportStatus;
      dateFrom?: Date;
      dateTo?: Date;
    },
  ): Promise<{
    imports: ResourceImportEntity[];
    total: number;
  }>;

  /**
   * Gets recent imports (last 30 days)
   */
  findRecent(limit?: number): Promise<ResourceImportEntity[]>;

  /**
   * Gets import statistics
   */
  getStatistics(userId?: string): Promise<{
    totalImports: number;
    successfulImports: number;
    failedImports: number;
    totalResourcesImported: number;
    averageSuccessRate: number;
  }>;

  /**
   * Deletes old completed imports (cleanup)
   */
  deleteOldImports(olderThanDays: number): Promise<number>;
}
