import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaCategoryRepository } from '../../../resources-service/infrastructure/repositories/prisma-category.repository';
import { CategoryEntity } from '@libs/common/entities/category.entity';
import { LoggingService } from '@libs/logging/logging.service';

/**
 * Category Service for Auth Service
 * 
 * Provides category management specifically for AUTH service,
 * automatically filtering by type='AUTH' and subtype='ROLE'
 */
@Injectable()
export class AuthCategoryService {
  private readonly AUTH_TYPE = 'AUTH';
  private readonly ROLE_SUBTYPE = 'ROLE';

  constructor(
    private readonly categoryRepository: PrismaCategoryRepository,
    private readonly loggingService: LoggingService,
  ) {}

  /**
   * Find all role categories (AUTH/ROLE)
   */
  async findAllRoleCategories(): Promise<CategoryEntity[]> {
    try {
      const categories = await this.categoryRepository.findByTypeAndSubtype(
        this.AUTH_TYPE,
        this.ROLE_SUBTYPE
      );

      this.loggingService.log('Retrieved role categories', {
        count: categories.length,
        type: this.AUTH_TYPE,
        subtype: this.ROLE_SUBTYPE
      }, 'AuthCategoryService');

      return categories;
    } catch (error) {
      this.loggingService.error('Failed to find role categories', error, 'AuthCategoryService');
      throw error;
    }
  }

  /**
   * Find active role categories only
   */
  async findActiveRoleCategories(): Promise<CategoryEntity[]> {
    try {
      const allCategories = await this.findAllRoleCategories();
      return allCategories.filter(category => category.isActive);
    } catch (error) {
      this.loggingService.error('Failed to find active role categories', error, 'AuthCategoryService');
      throw error;
    }
  }

  /**
   * Find role category by code
   */
  async findRoleCategoryByCode(code: string): Promise<CategoryEntity | null> {
    try {
      const categories = await this.findAllRoleCategories();
      const category = categories.find(cat => cat.code === code);

      if (!category) {
        this.loggingService.warn('Role category not found', {
          code,
          type: this.AUTH_TYPE,
          subtype: this.ROLE_SUBTYPE
        });
        return null;
      }

      return category;
    } catch (error) {
      this.loggingService.error('Failed to find role category by code', error);
      throw error;
    }
  }

  /**
   * Find role category by name
   */
  async findRoleCategoryByName(name: string): Promise<CategoryEntity | null> {
    try {
      const categories = await this.findAllRoleCategories();
      const category = categories.find(cat => cat.name === name);

      if (!category) {
        this.loggingService.warn('Role category not found', {
          name,
          type: this.AUTH_TYPE,
          subtype: this.ROLE_SUBTYPE
        });
        return null;
      }

      return category;
    } catch (error) {
      this.loggingService.error('Failed to find role category by name', error);
      throw error;
    }
  }

  /**
   * Get default role categories (using metadata to identify defaults)
   */
  async findDefaultRoleCategories(): Promise<CategoryEntity[]> {
    try {
      const categories = await this.findAllRoleCategories();
      return categories.filter(category => 
        category.metadata?.isDefault === true || 
        ['ACADEMIC', 'ADMINISTRATIVE', 'SECURITY'].includes(category.code)
      );
    } catch (error) {
      this.loggingService.error('Failed to find default role categories', error);
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
      this.loggingService.error('Failed to validate role category code', error);
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
      this.loggingService.error('Failed to get role category display name', error);
      return code;
    }
  }

  /**
   * Create default role categories if they don't exist
   */
  async ensureDefaultRoleCategories(): Promise<void> {
    try {
      const existingCategories = await this.findAllRoleCategories();
      const existingCodes = existingCategories.map(cat => cat.code);

      const defaultCategories = [
        {
          type: this.AUTH_TYPE,
          subtype: this.ROLE_SUBTYPE,
          name: 'Académico',
          code: 'ACADEMIC',
          description: 'Roles académicos (estudiantes, docentes)',
          metadata: { isDefault: true, color: '#3B82F6' },
          isActive: true,
          sortOrder: 1,
          service: 'auth-service'
        },
        {
          type: this.AUTH_TYPE,
          subtype: this.ROLE_SUBTYPE,
          name: 'Administrativo',
          code: 'ADMINISTRATIVE',
          description: 'Roles administrativos del sistema',
          metadata: { isDefault: true, color: '#10B981' },
          isActive: true,
          sortOrder: 2,
          service: 'auth-service'
        },
        {
          type: this.AUTH_TYPE,
          subtype: this.ROLE_SUBTYPE,
          name: 'Seguridad',
          code: 'SECURITY',
          description: 'Roles de seguridad y vigilancia',
          metadata: { isDefault: true, color: '#F59E0B' },
          isActive: true,
          sortOrder: 3,
          service: 'auth-service'
        }
      ];

      for (const categoryData of defaultCategories) {
        const existing = await this.categoryRepository.findByCode(categoryData.code, 'AUTH', 'ROLE');
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
          
          this.loggingService.log('Default role category created', {
            categoryCode: categoryData.code,
            categoryName: categoryData.name,
          });
        }
      }
    } catch (error) {
      this.loggingService.error('Failed to ensure default role categories exist', error);
      throw error;
    }
  }

  /**
   * Find all role categories with pagination
   */
  async findAll(options: { page?: number; limit?: number; search?: string }) {
    try {
      const { page = 1, limit = 10, search } = options;
      
      const categories = await this.categoryRepository.findByTypeAndSubtype('AUTH', 'ROLE');
      
      // Apply search filter if provided
      let filteredCategories = categories;
      if (search) {
        const searchLower = search.toLowerCase();
        filteredCategories = categories.filter(cat => 
          cat.name.toLowerCase().includes(searchLower) ||
          cat.code.toLowerCase().includes(searchLower) ||
          (cat.description && cat.description.toLowerCase().includes(searchLower))
        );
      }

      // Apply pagination
      const startIndex = (page - 1) * limit;
      const endIndex = startIndex + limit;
      const paginatedCategories = filteredCategories.slice(startIndex, endIndex);

      return {
        data: paginatedCategories,
        pagination: {
          page,
          limit,
          total: filteredCategories.length,
          totalPages: Math.ceil(filteredCategories.length / limit),
        },
      };
    } catch (error) {
      this.loggingService.error('Failed to find role categories', error);
      throw error;
    }
  }

  /**
   * Find role category by ID
   */
  async findById(id: string): Promise<CategoryEntity> {
    try {
      const category = await this.categoryRepository.findById(id);
      if (!category || category.type !== 'AUTH' || category.subtype !== 'ROLE') {
        throw new Error(`Role category with ID ${id} not found`);
      }
      return category;
    } catch (error) {
      this.loggingService.error('Failed to find role category by ID', error);
      throw error;
    }
  }

  /**
   * Create new role category
   */
  async create(data: any): Promise<CategoryEntity> {
    try {
      const category = new CategoryEntity({
        name: data.name,
        code: data.code || data.name.toUpperCase().replace(/\s+/g, '_'),
        description: data.description,
        type: 'AUTH',
        subtype: 'ROLE',
        service: 'auth-service',
        isActive: data.isActive ?? true,
        metadata: data.metadata || {},
        sortOrder: data.sortOrder || 999,
        createdAt: new Date(),
        updatedAt: new Date(),
      });
      
      await this.categoryRepository.save(category);
      return category;
    } catch (error) {
      this.loggingService.error('Failed to create role category', error);
      throw error;
    }
  }

  /**
   * Update role category
   */
  async update(id: string, data: any): Promise<CategoryEntity> {
    try {
      const existingCategory = await this.findById(id);
      
      // Create updated category with new data
      const updatedCategory = new CategoryEntity({
        id: existingCategory.id,
        name: data.name || existingCategory.name,
        code: existingCategory.code, // Code should not be changed
        description: data.description || existingCategory.description,
        type: existingCategory.type,
        subtype: existingCategory.subtype,
        service: existingCategory.service,
        isActive: data.isActive !== undefined ? data.isActive : existingCategory.isActive,
        metadata: data.metadata ? { ...existingCategory.metadata, ...data.metadata } : existingCategory.metadata,
        sortOrder: data.sortOrder || existingCategory.sortOrder,
        createdAt: existingCategory.createdAt,
        updatedAt: new Date(),
        createdBy: existingCategory.createdBy,
      });
      
      await this.categoryRepository.save(updatedCategory);
      return updatedCategory;
    } catch (error) {
      this.loggingService.error('Failed to update role category', error);
      throw error;
    }
  }

  /**
   * Delete role category
   */
  async delete(id: string): Promise<void> {
    try {
      const category = await this.findById(id);
      
      // Check if it's a default category
      if (category.metadata?.isDefault) {
        throw new Error('Cannot delete default role category');
      }
      
      await this.categoryRepository.delete(id);
    } catch (error) {
      this.loggingService.error('Failed to delete role category', error);
      throw error;
    }
  }

  /**
   * Find default role categories
   */
  async findDefaults(): Promise<CategoryEntity[]> {
    try {
      const categories = await this.categoryRepository.findByTypeAndSubtype('AUTH', 'ROLE');
      return categories.filter(cat => cat.metadata?.isDefault === true);
    } catch (error) {
      this.loggingService.error('Failed to find default role categories', error);
      throw error;
    }
  }

  /**
   * Find role category by code
   */
  async findByCode(code: string): Promise<CategoryEntity> {
    try {
      const category = await this.categoryRepository.findByCode(code, 'AUTH', 'ROLE');
      if (!category || category.type !== 'AUTH' || category.subtype !== 'ROLE') {
        throw new Error(`Role category with code ${code} not found`);
      }
      return category;
    } catch (error) {
      this.loggingService.error('Failed to find role category by code', error);
      throw error;
    }
  }

  /**
   * Validate if category code is valid for role categories
   */
  async isValidCategoryCode(code: string): Promise<boolean> {
    try {
      const category = await this.categoryRepository.findByCode(code, 'AUTH', 'ROLE');
      return category !== null && category.type === 'AUTH' && category.subtype === 'ROLE';
    } catch (error) {
      this.loggingService.error('Failed to validate role category code', error);
      return false;
    }
  }
}
