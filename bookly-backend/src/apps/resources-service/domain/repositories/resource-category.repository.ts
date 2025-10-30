import { ResourceCategoryEntity } from '../entities/resource-category.entity';

/**
 * HITO 6 - RF-02: ResourceCategory Repository Interface
 */
export interface ResourceCategoryRepository {
  /**
   * Creates a new resource-category association
   */
  create(resourceCategory: ResourceCategoryEntity): Promise<ResourceCategoryEntity>;


    /**
     * Gets resource-category associations with pagination
     */
    findWithPagination(
      page: number,
      limit: number,
      filters?: {
        resourceId?: string;
        categoryId?: string;
        search?: string;
      },
    ): Promise<{
      associations: ResourceCategoryEntity[];
      total: number;
    }>;
  /**
   * Finds associations by resource ID
   */
  findByResourceId(resourceId: string): Promise<ResourceCategoryEntity[]>;

  /**
   * Finds associations by category ID
   */
  findByCategoryId(categoryId: string): Promise<ResourceCategoryEntity[]>;

  /**
   * Finds a specific association
   */
  findByResourceAndCategory(resourceId: string, categoryId: string): Promise<ResourceCategoryEntity | null>;

  /**
   * Checks if association exists
   */
  exists(resourceId: string, categoryId: string): Promise<boolean>;

  /**
   * Removes a specific association
   */
  remove(resourceId: string, categoryId: string): Promise<void>;

  /**
   * Removes all associations for a resource
   */
  removeAllByResource(resourceId: string): Promise<void>;

  /**
   * Removes all associations for a category
   */
  removeAllByCategory(categoryId: string): Promise<void>;

  /**
   * Assigns multiple categories to a resource
   */
  assignCategoriesToResource(
    resourceId: string,
    categoryIds: string[],
    assignedBy: string,
  ): Promise<ResourceCategoryEntity[]>;

  /**
   * Replaces all categories for a resource
   */
  replaceResourceCategories(
    resourceId: string,
    categoryIds: string[],
    assignedBy: string,
  ): Promise<ResourceCategoryEntity[]>;

  /**
   * Gets resources by category with pagination
   */
  findResourcesByCategory(
    categoryId: string,
    page: number,
    limit: number,
  ): Promise<{
    associations: ResourceCategoryEntity[];
    total: number;
  }>;
}
