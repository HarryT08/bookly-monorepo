import { CategoryEntity } from "@/libs/common/entities/category.entity";


export interface CategoryFilters {
  page?: number;
  limit?: number;
  search?: string;
  type?: string;
  service?: string;
  isActive?: boolean;
}

export interface CategoryRepositoryResponse {
  data: CategoryEntity[];
  total: number;
}

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
  update(id: string, category: CategoryEntity): Promise<CategoryEntity>;

  /**
   * Finds a category by ID
   */
  findById(id: string): Promise<CategoryEntity | null>;

  /**
   * Finds a category by name
   */
  findByName(name: string): Promise<CategoryEntity | null>;

  /**
   * Finds a category by name and service
   */
  findByNameAndService(name: string, service: string): Promise<CategoryEntity | null>;

  /**
   * Finds all categories
   */
  findAll(): Promise<CategoryEntity[]>;

  /**
   * Finds categories by service
   */
  findByService(service: string): Promise<CategoryEntity[]>;

  /**
   * Finds all active categories
   */
  findActive(): Promise<CategoryEntity[]>;

  /**
   * Finds default categories by service
   */
  findDefaults(service: string): Promise<CategoryEntity[]>;

  /**
   * Finds all custom (non-default) categories
   */
  findCustom(): Promise<CategoryEntity[]>;

  /**
   * Finds categories with filters and pagination
   */
  findWithFilters(filters: CategoryFilters): Promise<CategoryRepositoryResponse>;

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
