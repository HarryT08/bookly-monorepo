import { Injectable, Inject } from '@nestjs/common';
import { CategoryRepository } from '../../domain/repositories/category.repository';
import { CreateCategoryDto, UpdateCategoryDto } from '@libs/dto/categories';
import { CategoryFiltersDto } from '@libs/dto/categories/filter-categories.dto';
import { CategoryEntity } from '@libs/common/entities/category.entity';
import { LoggingService } from '@libs/logging/logging.service';
import { DomainEvent, EventBusService } from '@libs/event-bus/services/event-bus.service';
import { v4 as uuidv4 } from 'uuid';

export interface CategoryServiceResponse {
  data: CategoryEntity[];
  total: number;
}

/**
 * Category Service
 * 
 * Business logic for category management in resources service.
 * Handles category CRUD operations and business rules.
 */
@Injectable()
export class ResourcesCategoryService {
  constructor(
    private readonly loggingService: LoggingService,
    @Inject('CategoryRepository') private readonly categoryRepository: CategoryRepository,
    private readonly eventBusService: EventBusService,
  ) {}

  /**
   * Creates a new category
   */
  async createCategory(createCategoryDto: CreateCategoryDto, userId: string): Promise<CategoryEntity> {
    // Check if category with same name exists
    const existingCategory = await this.categoryRepository.findByNameAndService(
      createCategoryDto.name,
      'resources-service'
    );

    if (existingCategory) {
      throw new Error(`Category with name "${createCategoryDto.name}" already exists`);
    }

    // Create category entity
    const categoryEntity = new CategoryEntity({
      type: 'RESOURCE',
      subtype: 'CATEGORY',
      service: 'resources-service',
      name: createCategoryDto.name,
      code: createCategoryDto.name.toUpperCase(),
      description: createCategoryDto.description || null,
      isActive: true,
      sortOrder: createCategoryDto.sortOrder || 0,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    // Save category
    return await this.categoryRepository.create(categoryEntity);
  }

  /**
   * Updates an existing category
   */
  async updateCategory(id: string, updateCategoryDto: UpdateCategoryDto, userId: string): Promise<CategoryEntity> {
    this.loggingService.log('CategoryService', 'updateCategory', 'Starting category update', {
      categoryId: id,
      userId,
    });

    try {
      // Get existing category
      const existingCategory = await this.categoryRepository.findById(id);
      if (!existingCategory) {
        throw new Error('Category not found');
      }

      // Check if name change conflicts with existing category
      if (updateCategoryDto.name && updateCategoryDto.name !== existingCategory.name) {
        const conflictCategory = await this.categoryRepository.findByNameAndService(
          updateCategoryDto.name,
          'resources-service'
        );
        if (conflictCategory && conflictCategory.id !== id) {
          throw new Error(`Category with name "${updateCategoryDto.name}" already exists`);
        }
      }

      // Update category
      const updatedCategory = existingCategory.update(updateCategoryDto, userId);

      // Save updated category
      const savedCategory = await this.categoryRepository.update(id, updatedCategory);

      // Publish domain event
      const domainEvent: DomainEvent = {
                eventId: uuidv4(),
                eventType: 'category.updated',
                aggregateId: savedCategory.id,
                aggregateType: 'Category',
                eventData: {
                  categoryId: savedCategory.id,
                  name: savedCategory.name,
                  changes: updateCategoryDto,
                  service: 'resources-service',
                  userId,
                },
                timestamp: new Date(),
                version: 1
              };
      await this.eventBusService.publishEvent(domainEvent);

      this.loggingService.log('CategoryService', {
        categoryId: savedCategory.id,
        name: savedCategory.name,
      }, 'updateCategory');

      return savedCategory;
    } catch (error) {
      this.loggingService.error('CategoryService', error, 'updateCategory');
      throw error;
    }
  }

  /**
   * Deactivates a category
   */
  async deleteCategory(id: string, userId: string): Promise<void> {
    this.loggingService.log('CategoryService', 'deleteCategory', 'Starting category deactivation', {
      categoryId: id,
      userId,
    });

    try {
      // Get existing category
      const existingCategory = await this.categoryRepository.findById(id);
      if (!existingCategory) {
        throw new Error('Category not found');
      }

      // Check if it's a default category
      if (existingCategory.metadata.isDefault) {
        throw new Error('Default categories cannot be deactivated');
      }

      // Deactivate category
      const deactivatedCategory = existingCategory.deactivate();
      await this.categoryRepository.update(id, deactivatedCategory);

      // Publish domain event
      const domainEvent: DomainEvent = {
        eventId: uuidv4(),
        eventType: 'category.deactivated',
        aggregateId: id,
        aggregateType: 'Category',
        eventData: {
          categoryId: id,
          name: existingCategory.name,
          service: 'resources-service',
          userId,
          timestamp: new Date().toISOString(),
        },
        timestamp: new Date(),
        version: 1
      };
      await this.eventBusService.publishEvent(domainEvent);

      this.loggingService.log('CategoryService', {
        categoryId: id,
        name: existingCategory.name,
      }, 'deleteCategory');
    } catch (error) {
      this.loggingService.error('CategoryService', error, 'deleteCategory');
      throw error;
    }
  }

  /**
   * Reactivates a category
   */
  async reactivateCategory(id: string, userId: string): Promise<CategoryEntity> {
    this.loggingService.log('CategoryService', 'reactivateCategory', 'Starting category reactivation', {
      categoryId: id,
      userId,
    });

    try {
      // Get existing category
      const existingCategory = await this.categoryRepository.findById(id);
      if (!existingCategory) {
        throw new Error('Category not found');
      }

      // Reactivate category
      const reactivatedCategory = existingCategory.reactivate();
      const savedCategory = await this.categoryRepository.update(id, reactivatedCategory);

      // Publish domain event
      const domainEvent: DomainEvent = {
        eventId: uuidv4(),
        eventType: 'category.reactivated',
        aggregateId: savedCategory.id,
        aggregateType: 'Category',
        eventData: {
          categoryId: savedCategory.id,
          name: savedCategory.name,
          service: 'resources-service',
          userId,
        },
        timestamp: new Date(),
        version: 1
      };
      await this.eventBusService.publishEvent(domainEvent);

      this.loggingService.log('CategoryService', {
        categoryId: savedCategory.id,
        name: savedCategory.name,
      },'reactivateCategory');

      return savedCategory;
    } catch (error) {
      this.loggingService.error('CategoryService', error, 'reactivateCategory');
      throw error;
    }
  }

  /**
   * Gets categories with pagination and filters
   */
  async findCategories(filters: CategoryFiltersDto): Promise<CategoryServiceResponse> {
    this.loggingService.log('CategoryService', {
        page: filters.page,
        limit: filters.limit,
        search: filters.search,
        type: filters.type,
        isActive: filters.isActive,
      }, 'findCategories');

    try {
      const result = await this.categoryRepository.findWithFilters({
        page: filters.page,
        limit: filters.limit,
        search: filters.search,
        type: filters.type,
        isActive: filters.isActive,
      });

      this.loggingService.log('CategoryService', {
        count: result.data.length,
        total: result.total,
      }, 'findCategories');

      return result;
    } catch (error) {
      this.loggingService.error('CategoryService',error, 'findCategories');
      throw error;
    }
  }

  /**
   * Gets a category by ID
   */
  async findCategoryById(id: string): Promise<CategoryEntity> {
    this.loggingService.log('CategoryService', {
        categoryId: id,
      }, 'findCategoryById');

    try {
      const category = await this.categoryRepository.findById(id);
      if (!category) {
        throw new Error('Category not found');
      }

      this.loggingService.log('CategoryService', {
        categoryId: id,
        name: category.name,
      }, 'findCategoryById');

      return category;
    } catch (error) {
      this.loggingService.error('CategoryService', error, 'findCategoryById');
      throw error;
    }
  }

  /**
   * Gets all active categories
   */
  async findActiveCategories(): Promise<CategoryEntity[]> {
    this.loggingService.log('CategoryService', 'findActiveCategories', 'Fetching active categories');

    try {
      const categories = await this.categoryRepository.findByService('resources-service');
      const activeCategories = categories.filter(cat => cat.isActive);

      this.loggingService.log('CategoryService', {
        count: activeCategories.length,
      }, 'findActiveCategories');

      return activeCategories;
    } catch (error) {
      this.loggingService.error('CategoryService', error, 'findActiveCategories');
      throw error;
    }
  }

  /**
   * Gets all default categories
   */
  async findDefaultCategories(): Promise<CategoryEntity[]> {
    this.loggingService.log('CategoryService', 'findDefaultCategories', 'Fetching default categories');

    try {
      const categories = await this.categoryRepository.findDefaults('resources-service');

      this.loggingService.log('CategoryService', {
        count: categories.length,
      }, 'findDefaultCategories');

      return categories;
    } catch (error) {
      this.loggingService.error('CategoryService', error, 'findDefaultCategories');
      throw error;
    }
  }
}
