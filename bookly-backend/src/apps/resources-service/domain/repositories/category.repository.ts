import { CategoryEntity } from '../entities/category.entity';

/**
 * Category Repository Interface
 * Defines operations for category persistence
 */
export interface CategoryRepository {
  /**
   * Creates a new category
   */
  create(category: CategoryEntity): Promise<CategoryEntity>;

  /**
   * Updates an existing category
   */
  update(category: CategoryEntity): Promise<CategoryEntity>;

  /**
   * Finds a category by ID
   */
  findById(id: string): Promise<CategoryEntity | null>;

  /**
   * Finds a category by name
   */
  findByName(name: string): Promise<CategoryEntity | null>;

  /**
   * Finds all categories
   */
  findAll(): Promise<CategoryEntity[]>;

  /**
   * Finds all active categories
   */
  findActive(): Promise<CategoryEntity[]>;

  /**
   * Finds all default categories
   */
  findDefaults(): Promise<CategoryEntity[]>;

  /**
   * Finds all custom (non-default) categories
   */
  findCustom(): Promise<CategoryEntity[]>;

  /**
   * Deactivates a category
   */
  deactivate(id: string): Promise<void>;

  /**
   * Reactivates a category
   */
  reactivate(id: string): Promise<void>;

  /**
   * Checks if a category exists by name
   */
  existsByName(name: string): Promise<boolean>;

  /**
   * Gets categories with pagination
   */
  findWithPagination(
    page: number,
    limit: number,
    filters?: {
      isActive?: boolean;
      isDefault?: boolean;
      search?: string;
    }
  ): Promise<{
    categories: CategoryEntity[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  }>;
}
