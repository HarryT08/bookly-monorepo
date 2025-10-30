import { CategoryEntity } from "@libs/common/entities/category.entity";
import { CategoryRepository } from "@libs/common/repositories/category.repository";
import { LoggingService } from "@libs/logging/logging.service";
import { Inject, Injectable } from "@nestjs/common";

/**
 * Category Service for Auth Service
 *
 * Provides category management specifically for AUTH service,
 * automatically filtering by type='AUTH' and subtype='ROLE'
 */
@Injectable()
export class RoleCategoryService {
  private readonly AUTH_TYPE = "AUTH";
  private readonly ROLE_SUBTYPE = "ROLE";
  private readonly SERVICE_NAME = "auth-service";

  constructor(
    @Inject("CategoryRepository")
    private readonly categoryRepository: CategoryRepository,
    private readonly loggingService: LoggingService
  ) {}

  /**
   * Find all role categories (AUTH/ROLE)
   */
  async findAllRoleCategories(): Promise<CategoryEntity[]> {
    try {
      const categories =
        await this.categoryRepository.findByTypeAndSubtypeActive(
          this.AUTH_TYPE,
          this.ROLE_SUBTYPE
        );

      this.loggingService.log(
        "Retrieved role categories",
        {
          count: categories.length,
          type: this.AUTH_TYPE,
          subtype: this.ROLE_SUBTYPE,
        },
        "AuthCategoryService"
      );

      return categories;
    } catch (error) {
      this.loggingService.error(
        "Failed to find role categories",
        error,
        "AuthCategoryService"
      );
      throw error;
    }
  }

  /**
   * Find active role categories only
   */
  async findActiveRoleCategories(): Promise<CategoryEntity[]> {
    try {
      const categories =
        await this.categoryRepository.findByTypeAndSubtypeActive(
          this.AUTH_TYPE,
          this.ROLE_SUBTYPE,
          { isActive: true }
        );

      this.loggingService.log(
        "Retrieved active role categories",
        {
          count: categories.length,
          type: this.AUTH_TYPE,
          subtype: this.ROLE_SUBTYPE,
        },
        "AuthCategoryService"
      );

      return categories;
    } catch (error) {
      this.loggingService.error(
        "Failed to find active role categories",
        error,
        "AuthCategoryService"
      );
      throw error;
    }
  }

  /**
   * Find role category by name
   */
  async findRoleCategoryByName(name: string): Promise<CategoryEntity | null> {
    try {
      const categories =
        await this.categoryRepository.findByTypeAndSubtypeActive(
          this.AUTH_TYPE,
          this.ROLE_SUBTYPE,
          { search: name }
        );

      // Find exact match by name
      const category = categories.find((cat) => cat.name === name);

      if (!category) {
        this.loggingService.warn(
          "Role category not found",
          {
            name,
            type: this.AUTH_TYPE,
            subtype: this.ROLE_SUBTYPE,
          },
          "AuthCategoryService"
        );
        return null;
      }

      this.loggingService.log(
        "Role category found by name",
        {
          name,
          categoryCode: category.code,
          isActive: category.isActive,
        },
        "AuthCategoryService"
      );

      return category;
    } catch (error) {
      this.loggingService.error(
        "Failed to find role category by name",
        error,
        "AuthCategoryService"
      );
      throw error;
    }
  }

  /**
   * Validate if a category code is valid for roles
   */
  async validateRoleCategoryCode(code: string): Promise<boolean> {
    try {
      const category = await this.findRoleCategoryByCode(code);
      return category !== null && category.isActive;
    } catch (error) {
      this.loggingService.error("Failed to validate role category code", error);
      return false;
    }
  }

  /**
   * Get role category display name
   */
  async getRoleCategoryDisplayName(code: string): Promise<string> {
    try {
      const category = await this.findRoleCategoryByCode(code);
      return category?.name || code;
    } catch (error) {
      this.loggingService.error(
        "Failed to get role category display name",
        error
      );
      return code;
    }
  }

  /**
   * Create default role categories if they don't exist
   */
  async ensureDefaultRoleCategories(): Promise<void> {
    try {
      const existingCategories = await this.findAllRoleCategories();
      const existingCodes = existingCategories.map((cat) => cat.code);

      const defaultCategories = [
        {
          type: this.AUTH_TYPE,
          subtype: this.ROLE_SUBTYPE,
          name: "Académico",
          code: "ACADEMIC",
          description: "Roles académicos (estudiantes, docentes)",
          metadata: { isDefault: true, color: "#3B82F6" },
          isActive: true,
          sortOrder: 1,
          service: this.SERVICE_NAME,
        },
        {
          type: this.AUTH_TYPE,
          subtype: this.ROLE_SUBTYPE,
          name: "Administrativo",
          code: "ADMINISTRATIVE",
          description: "Roles administrativos del sistema",
          metadata: { isDefault: true, color: "#10B981" },
          isActive: true,
          sortOrder: 2,
          service: this.SERVICE_NAME,
        },
        {
          type: this.AUTH_TYPE,
          subtype: this.ROLE_SUBTYPE,
          name: "Seguridad",
          code: "SECURITY",
          description: "Roles de seguridad y vigilancia",
          metadata: { isDefault: true, color: "#F59E0B" },
          isActive: true,
          sortOrder: 3,
          service: this.SERVICE_NAME,
        },
      ];

      for (const categoryData of defaultCategories) {
        const existing = await this.categoryRepository.findByCode(
          categoryData.code,
          this.AUTH_TYPE,
          this.ROLE_SUBTYPE
        );
        if (!existing) {
          const category = new CategoryEntity({
            name: categoryData.name,
            code: categoryData.code,
            description: categoryData.description,
            type: categoryData.type,
            subtype: categoryData.subtype,
            service: categoryData.service,
            isActive: categoryData.isActive,
            metadata: categoryData.metadata,
            sortOrder: categoryData.sortOrder,
            createdAt: new Date(),
            updatedAt: new Date(),
          });

          await this.categoryRepository.save(category);

          this.loggingService.log(
            "Default role category created",
            {
              categoryCode: categoryData.code,
              categoryName: categoryData.name,
            },
            "AuthCategoryService"
          );
        }
      }
    } catch (error) {
      this.loggingService.error(
        "Failed to ensure default role categories exist",
        error
      );
      throw error;
    }
  }

  /**
   * Find all role categories with pagination
   */
  async findAll(options: {
    page?: number;
    limit?: number;
    search?: string;
    isActive?: boolean;
  }) {
    try {
      const { page = 1, limit = 10, search, isActive } = options;

      // Use repository filters instead of in-memory filtering
      const filter = {
        search,
        isActive,
      };

      const categories =
        await this.categoryRepository.findByTypeAndSubtypeActive(
          this.AUTH_TYPE,
          this.ROLE_SUBTYPE,
          filter
        );

      // Apply pagination
      const startIndex = (page - 1) * limit;
      const endIndex = startIndex + limit;
      const paginatedCategories = categories.slice(startIndex, endIndex);

      this.loggingService.log(
        "Retrieved paginated role categories",
        {
          page,
          limit,
          total: categories.length,
          returned: paginatedCategories.length,
          search: search || "none",
          isActive: isActive !== undefined ? isActive : "all",
        },
        "AuthCategoryService"
      );

      return {
        data: paginatedCategories,
        pagination: {
          page,
          limit,
          total: categories.length,
          totalPages: Math.ceil(categories.length / limit),
        },
      };
    } catch (error) {
      this.loggingService.error(
        "Failed to find role categories",
        error,
        "AuthCategoryService"
      );
      throw error;
    }
  }

  /**
   * Find role category by ID
   */
  async findRoleCategoryById(id: string): Promise<CategoryEntity> {
    try {
      const category = await this.categoryRepository.findById(id);
      if (
        !category ||
        category.type !== "AUTH" ||
        category.subtype !== "ROLE"
      ) {
        throw new Error(`Role category with ID ${id} not found`);
      }
      return category;
    } catch (error) {
      this.loggingService.error("Failed to find role category by ID", error);
      throw error;
    }
  }

  /**
   * Create new role category
   */
  async createRoleCategory(data: any): Promise<CategoryEntity> {
    try {
      const category = new CategoryEntity({
        name: data.name,
        code: data.code || data.name.toUpperCase().replace(/\s+/g, "_"),
        description: data.description,
        type: this.AUTH_TYPE,
        subtype: this.ROLE_SUBTYPE,
        service: this.SERVICE_NAME,
        isActive: data.isActive ?? true,
        metadata: data.metadata || {},
        sortOrder: data.sortOrder || 999,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      await this.categoryRepository.save(category);
      return category;
    } catch (error) {
      this.loggingService.error("Failed to create role category", error);
      throw error;
    }
  }

  /**
   * Update role category
   */
  async updateRoleCategory(id: string, data: any): Promise<CategoryEntity> {
    try {
      const existingCategory = await this.findRoleCategoryById(id);

      // Create updated category with new data
      const updatedCategory = new CategoryEntity({
        id: existingCategory.id,
        name: data.name || existingCategory.name,
        code: existingCategory.code, // Code should not be changed
        description: data.description || existingCategory.description,
        type: existingCategory.type,
        subtype: existingCategory.subtype,
        service: existingCategory.service,
        isActive:
          data.isActive !== undefined
            ? data.isActive
            : existingCategory.isActive,
        metadata: data.metadata
          ? { ...existingCategory.metadata, ...data.metadata }
          : existingCategory.metadata,
        sortOrder: data.sortOrder || existingCategory.sortOrder,
        createdAt: existingCategory.createdAt,
        updatedAt: new Date(),
        createdBy: existingCategory.createdBy,
      });

      await this.categoryRepository.save(updatedCategory);
      return updatedCategory;
    } catch (error) {
      this.loggingService.error("Failed to update role category", error);
      throw error;
    }
  }

  /**
   * Delete role category
   */
  async deleteRoleCategory(id: string): Promise<void> {
    try {
      const category = await this.findRoleCategoryById(id);

      // Check if it's a default category
      if (category.metadata?.isDefault) {
        throw new Error("Cannot delete default role category");
      }

      await this.categoryRepository.delete(id);
    } catch (error) {
      this.loggingService.error("Failed to delete role category", error);
      throw error;
    }
  }

  /**
   * Find default role categories
   */
  async findRoleCategoryDefaults(): Promise<CategoryEntity[]> {
    try {
      const categories =
        await this.categoryRepository.findByTypeAndSubtypeActive(
          this.AUTH_TYPE,
          this.ROLE_SUBTYPE,
          { metadata: { isDefault: true } }
        );

      this.loggingService.log(
        "Retrieved default role categories",
        {
          count: categories.length,
          codes: categories.map((cat) => cat.code),
        },
        "AuthCategoryService"
      );

      return categories;
    } catch (error) {
      this.loggingService.error(
        "Failed to find default role categories",
        error,
        "AuthCategoryService"
      );
      throw error;
    }
  }

  /**
   * Find role category by code
   */
  async findRoleCategoryByCode(code: string): Promise<CategoryEntity> {
    try {
      const category = await this.categoryRepository.findByCode(
        code,
        this.AUTH_TYPE,
        this.ROLE_SUBTYPE
      );
      if (
        !category ||
        category.type !== this.AUTH_TYPE ||
        category.subtype !== this.ROLE_SUBTYPE
      ) {
        throw new Error(`Role category with code ${code} not found`);
      }
      return category;
    } catch (error) {
      this.loggingService.error("Failed to find role category by code", error);
      throw error;
    }
  }

  /**
   * Validate if category code is valid for role categories
   */
  async isValidRoleCategoryCode(code: string): Promise<boolean> {
    try {
      const category = await this.categoryRepository.findByCode(
        code,
        this.AUTH_TYPE,
        this.ROLE_SUBTYPE
      );
      return (
        category !== null &&
        category.type === this.AUTH_TYPE &&
        category.subtype === this.ROLE_SUBTYPE
      );
    } catch (error) {
      this.loggingService.error("Failed to validate role category code", error);
      return false;
    }
  }
}
