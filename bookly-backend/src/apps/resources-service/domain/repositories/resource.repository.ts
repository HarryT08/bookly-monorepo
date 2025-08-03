import { ResourceEntity } from '../entities/resource.entity';

/**
 * Resource Repository Interface
 * Defines the contract for resource data persistence
 * Follows Repository pattern from Domain-Driven Design
 */
export interface ResourceRepository {
  /**
   * Create a new resource
   * Implements RF-01 (create resource)
   */
  create(resource: ResourceEntity): Promise<ResourceEntity>;

  /**
   * Find resource by ID
   */
  findById(id: string): Promise<ResourceEntity | null>;

  /**
   * Find resource by unique code
   */
  findByCode(code: string): Promise<ResourceEntity | null>;

  /**
   * Find all resources with optional filters
   */
  findAll(filters?: {
    type?: string;
    status?: string;
    categoryId?: string;
    isActive?: boolean;
    location?: string;
  }): Promise<ResourceEntity[]>;

  /**
   * Update an existing resource
   * Implements RF-01 (edit resource)
   */
  update(id: string, resource: ResourceEntity): Promise<ResourceEntity>;

  /**
   * Delete a resource (hard delete)
   * Implements RF-01 (delete resource - when no relations exist)
   */
  delete(id: string): Promise<void>;

  /**
   * Check if resource has active relations (reservations, maintenance)
   * Used to determine if soft delete or hard delete should be used
   */
  hasActiveRelations(id: string): Promise<boolean>;

  /**
   * Check if code is unique (excluding current resource)
   */
  isCodeUnique(code: string, excludeId?: string): Promise<boolean>;

  /**
   * Find resources by type
   */
  findByType(type: string): Promise<ResourceEntity[]>;

  /**
   * Find resources by status
   */
  findByStatus(status: string): Promise<ResourceEntity[]>;

  /**
   * Find resources by category
   */
  findByCategory(categoryId: string): Promise<ResourceEntity[]>;

  /**
   * Search resources by name or description
   */
  search(query: string): Promise<ResourceEntity[]>;

  /**
   * Count total resources with optional filters
   */
  count(filters?: {
    type?: string;
    status?: string;
    categoryId?: string;
    isActive?: boolean;
  }): Promise<number>;

  /**
   * Find resources with pagination
   */
  findWithPagination(
    page: number,
    limit: number,
    filters?: {
      type?: string;
      status?: string;
      categoryId?: string;
      isActive?: boolean;
    }
  ): Promise<{
    resources: ResourceEntity[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  }>;
}
