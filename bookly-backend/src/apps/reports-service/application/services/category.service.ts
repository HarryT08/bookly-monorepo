import { Injectable, Inject } from '@nestjs/common';
import { LoggingService } from '@libs/logging/logging.service';
import { 
  CreateCategoryDto, 
  UpdateCategoryDto, 
  CategoryResponseDto 
} from '@libs/dto/categories';
import { CategoryRepository } from '@apps/reports-service/domain/repositories/category.repository';
import { CategoryEntity } from '@/libs/common/entities/category.entity';

interface CategoryFilters {
  name?: string;
  isActive?: boolean;
  isDefault?: boolean;
  search?: string;
}

interface PaginationParams {
  page?: number;
  limit?: number;
}

interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

@Injectable()
export class CategoryService {
  constructor(
    @Inject('CategoryRepository')
    private readonly categoryRepository: CategoryRepository,
    private readonly loggingService: LoggingService,
  ) {}

  async create(createCategoryDto: CreateCategoryDto): Promise<CategoryResponseDto> {
    this.loggingService.log(
      'Creating new category in reports-service',
      `CategoryService - name: ${createCategoryDto.name}`,
      'CategoryService'
    );

    // Check if category with same name exists
    const existingCategory = await this.categoryRepository.findByName(createCategoryDto.name);
    if (existingCategory) {
      throw new Error('Category with this name already exists');
    }

    const categoryData = {
      id: Date.now().toString(),
      name: createCategoryDto.name,
      code: createCategoryDto.code || this.generateCategoryCode(createCategoryDto.name),
      description: createCategoryDto.description || null,
      metadata: createCategoryDto.metadata || null,
      sortOrder: createCategoryDto.sortOrder || 0,
      isActive: createCategoryDto.isActive !== undefined ? createCategoryDto.isActive : true,
      isDefault: false,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

      const categoryEntity = new CategoryEntity({
        id: categoryData.id,
        type: 'reports',
        service: 'reports-service',
        subtype: 'reports',
        name: categoryData.name,
        code: categoryData.code,
        description: categoryData.description,
        metadata: categoryData.metadata,
        sortOrder: categoryData.sortOrder,
        isActive: categoryData.isActive,
        createdAt: categoryData.createdAt,
        updatedAt: categoryData.updatedAt,
      });

    const savedCategory = await this.categoryRepository.save(categoryEntity);

    this.loggingService.log(
      `Category created successfully with id: ${savedCategory.id}`,
      'CategoryService'
    );

    return this.mapToResponseDto(savedCategory);
  }

  async findAll(filters: CategoryFilters = {}, pagination: PaginationParams = {}): Promise<PaginatedResponse<CategoryResponseDto>> {
    this.loggingService.log(
      'Finding categories with filters and pagination',
      `CategoryService - filters: ${JSON.stringify(filters)}`,
      'CategoryService'
    );

    const page = pagination.page || 1;
    const limit = pagination.limit || 10;
    const skip = (page - 1) * limit;

    const { categories, total } = await this.categoryRepository.findWithFilters(filters, { skip, limit });

    const responseData = categories.map(category => this.mapToResponseDto(category));

    return {
      data: responseData,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async findById(id: string): Promise<CategoryResponseDto> {
    this.loggingService.log(
      `Finding category by id: ${id}`,
      'CategoryService'
    );

    const category = await this.categoryRepository.findById(id);
    if (!category) {
      throw new Error('Category not found');
    }

    return this.mapToResponseDto(category);
  }

  async findActiveCategories(): Promise<CategoryResponseDto[]> {
    this.loggingService.log('Finding all active categories', 'CategoryService');

    const categories = await this.categoryRepository.findByStatus(true);
    return categories.map(category => this.mapToResponseDto(category));
  }

  async findDefaultCategories(): Promise<CategoryResponseDto[]> {
    this.loggingService.log('Finding default categories', 'CategoryService');

    const categories = await this.categoryRepository.findByDefault(true);
    return categories.map(category => this.mapToResponseDto(category));
  }

  async update(id: string, updateCategoryDto: UpdateCategoryDto): Promise<CategoryResponseDto> {
    this.loggingService.log(
      `Updating category with id: ${id}`,
      `CategoryService - data: ${JSON.stringify(updateCategoryDto)}`,
      'CategoryService'
    );

    const existingCategory = await this.categoryRepository.findById(id);
    if (!existingCategory) {
      throw new Error('Category not found');
    }

    // Check if trying to update name to existing name
    if (updateCategoryDto.name && updateCategoryDto.name !== existingCategory.name) {
      const categoryWithSameName = await this.categoryRepository.findByName(updateCategoryDto.name);
      if (categoryWithSameName) {
        throw new Error('Category with this name already exists');
      }
    }

    const updatedCategory = existingCategory.update({
      name: updateCategoryDto.name,
      description: updateCategoryDto.description,
      metadata: updateCategoryDto.metadata,
      sortOrder: updateCategoryDto.sortOrder,
      isActive: updateCategoryDto.isActive,
    });

    const savedCategory = await this.categoryRepository.save(updatedCategory);

    this.loggingService.log(
      `Category updated successfully with id: ${savedCategory.id}`,
      'CategoryService'
    );

    return this.mapToResponseDto(savedCategory);
  }

  async deactivate(id: string): Promise<CategoryResponseDto> {
    this.loggingService.log(`Deactivating category with id: ${id}`, 'CategoryService');

    const existingCategory = await this.categoryRepository.findById(id);
    if (!existingCategory) {
      throw new Error('Category not found');
    }

    const deactivatedCategory = existingCategory.deactivate();
    const savedCategory = await this.categoryRepository.save(deactivatedCategory);

    this.loggingService.log(
      `Category deactivated successfully with id: ${savedCategory.id}`,
      'CategoryService'
    );

    return this.mapToResponseDto(savedCategory);
  }

  async reactivate(id: string): Promise<CategoryResponseDto> {
    this.loggingService.log(`Reactivating category with id: ${id}`, 'CategoryService');

    const existingCategory = await this.categoryRepository.findById(id);
    if (!existingCategory) {
      throw new Error('Category not found');
    }

    const reactivatedCategory = existingCategory.reactivate();
    const savedCategory = await this.categoryRepository.save(reactivatedCategory);

    this.loggingService.log(
      `Category reactivated successfully with id: ${savedCategory.id}`,
      'CategoryService'
    );

    return this.mapToResponseDto(savedCategory);
  }

  private generateCategoryCode(name: string): string {
    return name
      .toUpperCase()
      .replace(/\s+/g, '_')
      .replace(/[^A-Z0-9_]/g, '')
      .substring(0, 20);
  }

  private mapToResponseDto(category: CategoryEntity): CategoryResponseDto {
    return {
      id: category.id,
      name: category.name,
      code: category.code,
      description: category.description,
      metadata: category.metadata,
      sortOrder: category.sortOrder,
      isActive: category.isActive,
      isDefault: category.metadata?.isDefault,
      createdAt: category.createdAt,
      updatedAt: category.updatedAt,
    } as unknown as CategoryResponseDto;
  }
}
