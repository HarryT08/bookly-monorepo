import { CategoryEntity } from "@/libs/common/entities/category.entity";

export interface CategoryFilters {
  name?: string;
  code?: string;
  isActive?: boolean;
  isDefault?: boolean;
  search?: string;
  sortOrder?: number;
}

export interface PaginationOptions {
  skip?: number;
  limit?: number;
}

export interface CategoryRepository {
  /**
   * Save a category entity
   * @param category The category entity to save
   * @returns The saved category entity
   */
  save(category: CategoryEntity): Promise<CategoryEntity>;

  /**
   * Find a category by its ID
   * @param id The category ID
   * @returns The category entity if found, null otherwise
   */
  findById(id: string): Promise<CategoryEntity | null>;

  /**
   * Find a category by its name
   * @param name The category name
   * @returns The category entity if found, null otherwise
   */
  findByName(name: string): Promise<CategoryEntity | null>;

  /**
   * Find a category by its code
   * @param code The category code
   * @returns The category entity if found, null otherwise
   */
  findByCode(code: string): Promise<CategoryEntity | null>;

  /**
   * Find categories by status (active/inactive)
   * @param isActive The active status
   * @returns Array of category entities
   */
  findByStatus(isActive: boolean): Promise<CategoryEntity[]>;

  /**
   * Find categories by default status
   * @param isDefault The default status
   * @returns Array of category entities
   */
  findByDefault(isDefault: boolean): Promise<CategoryEntity[]>;

  /**
   * Find all categories with optional filters and pagination
   * @param filters Optional filters to apply
   * @param pagination Optional pagination parameters
   * @returns Object containing categories array and total count
   */
  findWithFilters(
    filters?: CategoryFilters,
    pagination?: PaginationOptions,
  ): Promise<{ categories: CategoryEntity[]; total: number }>;

  /**
   * Find all active categories
   * @returns Array of active category entities
   */
  findAllActive(): Promise<CategoryEntity[]>;

  /**
   * Find all default categories
   * @returns Array of default category entities
   */
  findAllDefault(): Promise<CategoryEntity[]>;

  /**
   * Check if a category name exists (excluding a specific ID)
   * @param name The category name to check
   * @param excludeId Optional ID to exclude from the check
   * @returns Boolean indicating if the name exists
   */
  nameExists(name: string, excludeId?: string): Promise<boolean>;

  /**
   * Check if a category code exists (excluding a specific ID)
   * @param code The category code to check
   * @param excludeId Optional ID to exclude from the check
   * @returns Boolean indicating if the code exists
   */
  codeExists(code: string, excludeId?: string): Promise<boolean>;

  /**
   * Get categories count
   * @param filters Optional filters to apply
   * @returns Total count of categories matching the filters
   */
  count(filters?: CategoryFilters): Promise<number>;

  /**
   * Delete a category by ID
   * @param id The category ID to delete
   * @returns Boolean indicating if the deletion was successful
   */
  delete(id: string): Promise<boolean>;

  /**
   * Find categories by multiple IDs
   * @param ids Array of category IDs
   * @returns Array of category entities
   */
  findByIds(ids: string[]): Promise<CategoryEntity[]>;

  /**
   * Get categories ordered by sort order
   * @param isActive Optional filter by active status
   * @returns Array of category entities ordered by sortOrder
   */
  findOrderedBySortOrder(isActive?: boolean): Promise<CategoryEntity[]>;

  /**
   * Bulk update categories
   * @param categories Array of category entities to update
   * @returns Array of updated category entities
   */
  bulkSave(categories: CategoryEntity[]): Promise<CategoryEntity[]>;

  /**
   * Search categories by name or description
   * @param searchTerm The search term
   * @param isActive Optional filter by active status
   * @returns Array of matching category entities
   */
  search(searchTerm: string, isActive?: boolean): Promise<CategoryEntity[]>;
}
