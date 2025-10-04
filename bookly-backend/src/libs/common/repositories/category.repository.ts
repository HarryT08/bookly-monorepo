/**
 * Category Repository
 * Provides automatic type filtering for each microservice
 */

import { CategoryEntity } from "../entities/category.entity";

export interface CategoryFilter {
  type?: string;
  subtype?: string;
  isActive?: boolean;
  parentId?: string;
  search?: string;
  metadata?: any;
}

export interface BaseCategoryFilter {
  type?: string;
  subtype?: string;
  isActive?: boolean;
  parentId?: string;
  search?: string;
  metadata?: any;
  service?: string;
}

export interface CategoryRepository {
  findById(id: string): Promise<CategoryEntity | null>;
  findByCode(
    type: string,
    subtype: string,
    code: string
  ): Promise<CategoryEntity | null>;
  findByTypeAndSubtypeActive(
    type: string,
    subtype: string,
    filter?: CategoryFilter
  ): Promise<CategoryEntity[]>;
  findAll(filter?: CategoryFilter): Promise<CategoryEntity[]>;
  save(category: CategoryEntity): Promise<CategoryEntity>;
  update(category: CategoryEntity): Promise<CategoryEntity>;
  delete(id: string): Promise<void>;
  exists(type: string, subtype: string, code: string): Promise<boolean>;
}

/**
 * Base Category Repository with service-specific filtering
 */
export abstract class BaseCategoryRepository implements CategoryRepository {
  protected readonly serviceName: string;

  constructor(serviceName: string) {
    this.serviceName = serviceName;
  }

  abstract findById(id: string): Promise<CategoryEntity | null>;
  abstract findByCode(
    type: string,
    subtype: string,
    code: string
  ): Promise<CategoryEntity | null>;
  abstract findAll(filter?: CategoryFilter): Promise<CategoryEntity[]>;
  abstract save(category: CategoryEntity): Promise<CategoryEntity>;
  abstract update(category: CategoryEntity): Promise<CategoryEntity>;
  abstract delete(id: string): Promise<void>;
  abstract exists(
    type: string,
    subtype: string,
    code: string
  ): Promise<boolean>;

  /**
   * Find categories by type and subtype with automatic service filtering
   */
  async findByTypeAndSubtypeActive(
    type: string,
    subtype: string,
    filter?: CategoryFilter
  ): Promise<CategoryEntity[]> {
    const serviceFilter: BaseCategoryFilter = {
      ...filter,
      type: type.toUpperCase(),
      subtype: subtype.toUpperCase(),
      service: this.serviceName,
    };

    const categories = await this.findAll(serviceFilter);
    return categories;
  }

  /**
   * Get active categories by type and subtype
   */
  async getActiveByTypeAndSubtype(
    type: string,
    subtype: string
  ): Promise<CategoryEntity[]> {
    return this.findByTypeAndSubtypeActive(type, subtype, { isActive: true });
  }

  /**
   * Get categories for dropdown/select options
   */
  async getOptionsForSelect(
    type: string,
    subtype: string
  ): Promise<Array<{ value: string; label: string; code: string }>> {
    const categories = await this.getActiveByTypeAndSubtype(type, subtype);
    return categories
      .sort((a, b) => a.sortOrder - b.sortOrder)
      .map((category) => ({
        value: category.id,
        label: category.name,
        code: category.code,
      }));
  }

  /**
   * Validate if a category code exists and is active
   */
  async validateCategoryCode(
    type: string,
    subtype: string,
    code: string
  ): Promise<boolean> {
    const category = await this.findByCode(type, subtype, code);
    return (
      category !== null &&
      category.isActive &&
      category.service === this.serviceName
    );
  }

  /**
   * Get category by code with validation
   */
  async getCategoryByCode(
    type: string,
    subtype: string,
    code: string
  ): Promise<CategoryEntity | null> {
    const category = await this.findByCode(type, subtype, code);
    if (category && category.service === this.serviceName) {
      return category;
    }
    return null;
  }

  /**
   * Create default categories for the service
   */
  abstract createDefaultCategories(): Promise<void>;

  /**
   * Apply service filter to any query
   */
  protected applyServiceFilter(filter?: CategoryFilter): CategoryFilter {
    return {
      ...filter,
      // Service filtering is handled at the database level in concrete implementations
    };
  }
}

/**
 * Service-specific category repositories
 */

/**
 * Resources Service Category Repository
 */
export abstract class ResourcesCategoryRepository extends BaseCategoryRepository {
  constructor() {
    super("resources-service");
  }

  /**
   * Get valid resource types
   */
  async getValidResourceTypes(): Promise<CategoryEntity[]> {
    return this.getActiveByTypeAndSubtype("RESOURCE", "VALID_TYPE");
  }

  /**
   * Get resource statuses
   */
  async getResourceStatuses(): Promise<CategoryEntity[]> {
    return this.getActiveByTypeAndSubtype("RESOURCE", "STATUS");
  }

  /**
   * Validate resource type
   */
  async validateResourceType(typeCode: string): Promise<boolean> {
    return this.validateCategoryCode("RESOURCE", "VALID_TYPE", typeCode);
  }

  /**
   * Get resource type by code
   */
  async getResourceTypeByCode(
    typeCode: string
  ): Promise<CategoryEntity | null> {
    return this.getCategoryByCode("RESOURCE", "VALID_TYPE", typeCode);
  }

  async createDefaultCategories(): Promise<void> {
    const { CategoryFactory } = await import("../entities/category.entity");
    const resourceTypes = CategoryFactory.createResourceTypes();

    for (const category of resourceTypes) {
      const exists = await this.exists("RESOURCE", "VALID_TYPE", category.code);
      if (!exists) {
        await this.save(category);
      }
    }
  }
}

/**
 * Auth Service Category Repository
 */
export abstract class AuthCategoryRepository extends BaseCategoryRepository {
  constructor() {
    super("auth-service");
  }

  /**
   * Get user roles
   */
  async getUserRoles(): Promise<CategoryEntity[]> {
    return this.getActiveByTypeAndSubtype("USER", "ROLE");
  }

  /**
   * Get permissions
   */
  async getPermissions(): Promise<CategoryEntity[]> {
    return this.getActiveByTypeAndSubtype("USER", "PERMISSION");
  }

  /**
   * Validate user role
   */
  async validateUserRole(roleCode: string): Promise<boolean> {
    return this.validateCategoryCode("USER", "ROLE", roleCode);
  }

  /**
   * Get role by code
   */
  async getRoleByCode(roleCode: string): Promise<CategoryEntity | null> {
    return this.getCategoryByCode("USER", "ROLE", roleCode);
  }

  async createDefaultCategories(): Promise<void> {
    const { CategoryFactory } = await import("../entities/category.entity");
    const userRoles = CategoryFactory.createUserRoles();

    for (const category of userRoles) {
      const exists = await this.exists("USER", "ROLE", category.code);
      if (!exists) {
        await this.save(category);
      }
    }
  }
}

/**
 * Availability Service Category Repository
 */
export abstract class AvailabilityCategoryRepository extends BaseCategoryRepository {
  constructor() {
    super("availability-service");
  }

  /**
   * Get reservation statuses
   */
  async getReservationStatuses(): Promise<CategoryEntity[]> {
    return this.getActiveByTypeAndSubtype("RESERVATION", "STATUS");
  }

  /**
   * Get reservation types
   */
  async getReservationTypes(): Promise<CategoryEntity[]> {
    return this.getActiveByTypeAndSubtype("RESERVATION", "TYPE");
  }

  /**
   * Validate reservation status
   */
  async validateReservationStatus(statusCode: string): Promise<boolean> {
    return this.validateCategoryCode("RESERVATION", "STATUS", statusCode);
  }

  /**
   * Get reservation status by code
   */
  async getReservationStatusByCode(
    statusCode: string
  ): Promise<CategoryEntity | null> {
    return this.getCategoryByCode("RESERVATION", "STATUS", statusCode);
  }

  async createDefaultCategories(): Promise<void> {
    const { CategoryFactory } = await import("../entities/category.entity");
    const reservationStatuses = CategoryFactory.createReservationStatuses();

    for (const category of reservationStatuses) {
      const exists = await this.exists("RESERVATION", "STATUS", category.code);
      if (!exists) {
        await this.save(category);
      }
    }
  }
}

/**
 * Stockpile Service Category Repository
 */
export abstract class StockpileCategoryRepository extends BaseCategoryRepository {
  constructor() {
    super("stockpile-service");
  }

  /**
   * Get approval workflow types
   */
  async getApprovalWorkflowTypes(): Promise<CategoryEntity[]> {
    return this.getActiveByTypeAndSubtype("APPROVAL", "WORKFLOW_TYPE");
  }

  /**
   * Get approval statuses
   */
  async getApprovalStatuses(): Promise<CategoryEntity[]> {
    return this.getActiveByTypeAndSubtype("APPROVAL", "STATUS");
  }

  /**
   * Validate workflow type
   */
  async validateWorkflowType(workflowCode: string): Promise<boolean> {
    return this.validateCategoryCode("APPROVAL", "WORKFLOW_TYPE", workflowCode);
  }

  async createDefaultCategories(): Promise<void> {
    // Implementation would create default approval categories
  }
}

/**
 * Reports Service Category Repository
 */
export abstract class ReportsCategoryRepository extends BaseCategoryRepository {
  constructor() {
    super("reports-service");
  }

  /**
   * Get report types
   */
  async getReportTypes(): Promise<CategoryEntity[]> {
    return this.getActiveByTypeAndSubtype("REPORT", "TYPE");
  }

  /**
   * Get report formats
   */
  async getReportFormats(): Promise<CategoryEntity[]> {
    return this.getActiveByTypeAndSubtype("REPORT", "FORMAT");
  }

  /**
   * Validate report type
   */
  async validateReportType(typeCode: string): Promise<boolean> {
    return this.validateCategoryCode("REPORT", "TYPE", typeCode);
  }

  async createDefaultCategories(): Promise<void> {
    // Implementation would create default report categories
  }
}
