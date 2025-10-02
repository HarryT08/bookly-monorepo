import { Test, TestingModule } from '@nestjs/testing';
import { ResourceCategoryService } from '../../application/services/resource-category.service';
import { ResourceCategoryRepository } from '../../domain/repositories/resource-category.repository';
import { CategoryRepository } from '../../domain/repositories/category.repository';
import { ResourceRepository } from '../../domain/repositories/resource.repository';
import { LoggingService } from '@libs/logging/logging.service';
import { ResourceCategoryEntity } from '../../domain/entities/resource-category.entity';
import { ConflictException, NotFoundException, BadRequestException } from '@nestjs/common';

/**
 * ResourceCategoryService tests with proper CategoryRepository integration
 */
describe('ResourceCategoryService', () => {
  let service: ResourceCategoryService;
  let resourceCategoryRepository: jest.Mocked<ResourceCategoryRepository>;
  let categoryRepository: jest.Mocked<CategoryRepository>;
  let resourceRepository: jest.Mocked<ResourceRepository>;
  let loggingService: jest.Mocked<LoggingService>;

  const mockResourceCategoryEntity = new ResourceCategoryEntity(
    'resource-category-id-1',
    'resource-id-1',
    'category-id-1',
    new Date('2024-01-01'),
    'user-id-1',
  );

  const mockResource = {
    id: 'resource-id-1',
    name: 'Aula 101',
    type: 'SALON',
    capacity: 40,
  };

  const mockCategory = {
    id: 'category-id-1',
    name: 'Salón',
    description: 'Aulas magistrales',
    isDefault: true,
    isActive: true,
  };

  beforeEach(async () => {
    const mockResourceCategoryRepository = {
      findByResourceAndCategory: jest.fn(),
      create: jest.fn(),
      findByResourceId: jest.fn(),
      findByCategoryId: jest.fn(),
      exists: jest.fn(),
      remove: jest.fn(),
      removeAllByResource: jest.fn(),
      removeAllByCategory: jest.fn(),
      assignCategoriesToResource: jest.fn(),
      replaceResourceCategories: jest.fn(),
      findResourcesByCategory: jest.fn(),
    };

    const mockResourceRepository = {
      findById: jest.fn(),
    };

    const mockCategoryRepository = {
      findById: jest.fn(),
    };

    const mockLoggingService = {
      log: jest.fn(),
      error: jest.fn(),
      warn: jest.fn(),
      debug: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ResourceCategoryService,
        {
          provide: 'ResourceCategoryRepository',
          useValue: mockResourceCategoryRepository,
        },
        {
          provide: 'CategoryRepository',
          useValue: mockCategoryRepository,
        },
        {
          provide: 'ResourceRepository',
          useValue: mockResourceRepository,
        },
        {
          provide: LoggingService,
          useValue: mockLoggingService,
        },
      ],
    }).compile();

    service = module.get<ResourceCategoryService>(ResourceCategoryService);
    resourceCategoryRepository = module.get('ResourceCategoryRepository');
    categoryRepository = module.get('CategoryRepository');
    resourceRepository = module.get('ResourceRepository');
    loggingService = module.get(LoggingService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should have assignCategoryToResource method', () => {
    expect(typeof service.assignCategoryToResource).toBe('function');
  });

  it('should have assignCategoriesToResource method', () => {
    expect(typeof service.assignCategoriesToResource).toBe('function');
  });

  it('should have getResourceCategories method', () => {
    expect(typeof service.getResourceCategories).toBe('function');
  });

  it('should have removeCategoryFromResource method', () => {
    expect(typeof service.removeCategoryFromResource).toBe('function');
  });

  it('should have replaceResourceCategories method', () => {
    expect(typeof service.replaceResourceCategories).toBe('function');
  });

  describe('assignCategoryToResource', () => {
    it('should assign category to resource successfully', async () => {
      resourceRepository.findById.mockResolvedValue(mockResource as any);
      categoryRepository.findById.mockResolvedValue(mockCategory as any);
      resourceCategoryRepository.findByResourceAndCategory.mockResolvedValue(null);
      resourceCategoryRepository.create.mockResolvedValue(mockResourceCategoryEntity);

      const result = await service.assignCategoryToResource(
        mockResourceCategoryEntity.resourceId,
        mockResourceCategoryEntity.categoryId,
        mockResourceCategoryEntity.assignedBy,
      );

      expect(result).toEqual({
        id: mockResourceCategoryEntity.id,
        resourceId: mockResourceCategoryEntity.resourceId,
        categoryId: mockResourceCategoryEntity.categoryId,
        assignedAt: mockResourceCategoryEntity.assignedAt,
        assignedBy: mockResourceCategoryEntity.assignedBy,
      });

      expect(loggingService.log).toHaveBeenCalledWith(
        'Category assigned to resource successfully',
        expect.any(Object),
      );
    });

    it('should throw NotFoundException when resource does not exist', async () => {
      resourceRepository.findById.mockResolvedValue(null);

      await expect(
        service.assignCategoryToResource('non-existent-resource', 'category-id-1', 'user-id-1'),
      ).rejects.toThrow(NotFoundException);
      expect(categoryRepository.findById).not.toHaveBeenCalled();
      expect(resourceCategoryRepository.create).not.toHaveBeenCalled();
    });

    it('should throw NotFoundException if category does not exist', async () => {
      resourceRepository.findById.mockResolvedValue(mockResource as any);
      categoryRepository.findById.mockResolvedValue(null);

      await expect(
        service.assignCategoryToResource('resource-id-1', 'non-existent-category', 'user-id-1'),
      ).rejects.toThrow(NotFoundException);
      expect(resourceCategoryRepository.create).not.toHaveBeenCalled();
    });

    it('should throw ConflictException if assignment already exists', async () => {
      resourceRepository.findById.mockResolvedValue(mockResource as any);
      categoryRepository.findById.mockResolvedValue(mockCategory as any);
      resourceCategoryRepository.findByResourceAndCategory.mockResolvedValue(
        mockResourceCategoryEntity,
      );

      await expect(
        service.assignCategoryToResource('resource-id-1', 'category-id-1', 'user-id-1'),
      ).rejects.toThrow(ConflictException);
      expect(resourceCategoryRepository.create).not.toHaveBeenCalled();
    });
  });

  describe('assignCategoriesToResource', () => {
    it('should assign multiple categories to resource successfully', async () => {
      const categoryIds = ['category-id-1', 'category-id-2'];
      resourceRepository.findById.mockResolvedValue(mockResource as any);
      categoryRepository.findById.mockResolvedValue(mockCategory as any);
      resourceCategoryRepository.findByResourceAndCategory.mockResolvedValue(null);
      resourceCategoryRepository.create.mockResolvedValue(mockResourceCategoryEntity);

      const result = await service.assignCategoriesToResource(
        'resource-id-1',
        categoryIds,
        'user-id-1',
      );

      expect(resourceRepository.findById).toHaveBeenCalledWith('resource-id-1');
      expect(categoryRepository.findById).toHaveBeenCalledTimes(2);
      expect(resourceCategoryRepository.create).toHaveBeenCalledTimes(2);
      expect(result).toHaveLength(2);
      expect(loggingService.log).toHaveBeenCalled();
    });

    it('should throw BadRequestException if no categories provided', async () => {
      await expect(
        service.assignCategoriesToResource('resource-id-1', [], 'user-id-1'),
      ).rejects.toThrow(BadRequestException);
    });

    it('should skip already assigned categories', async () => {
      const categoryIds = ['category-id-1', 'category-id-2'];
      resourceRepository.findById.mockResolvedValue(mockResource as any);
      categoryRepository.findById.mockResolvedValue(mockCategory as any);
      
      // First category already assigned, second one not
      resourceCategoryRepository.findByResourceAndCategory
        .mockResolvedValueOnce(mockResourceCategoryEntity) // Already exists
        .mockResolvedValueOnce(null); // Doesn't exist
      
      resourceCategoryRepository.create.mockResolvedValue(mockResourceCategoryEntity);

      const result = await service.assignCategoriesToResource(
        'resource-id-1',
        categoryIds,
        'user-id-1',
      );

      expect(resourceCategoryRepository.create).toHaveBeenCalledTimes(1); // Only one new assignment
      expect(result).toHaveLength(1);
    });
  });

  describe('replaceResourceCategories', () => {
    it('should replace all resource categories successfully', async () => {
      const newCategoryIds = ['category-id-2', 'category-id-3'];
      resourceRepository.findById.mockResolvedValue(mockResource as any);
      categoryRepository.findById.mockResolvedValue(mockCategory as any);
      resourceCategoryRepository.removeAllByResource.mockResolvedValue(undefined);
      resourceCategoryRepository.create.mockResolvedValue(mockResourceCategoryEntity);

      const result = await service.replaceResourceCategories(
        'resource-id-1',
        newCategoryIds,
        'user-id-1',
      );

      expect(resourceRepository.findById).toHaveBeenCalledWith('resource-id-1');
      expect(resourceCategoryRepository.removeAllByResource).toHaveBeenCalledWith('resource-id-1');
      expect(categoryRepository.findById).toHaveBeenCalledTimes(2);
      expect(resourceCategoryRepository.create).toHaveBeenCalledTimes(2);
      expect(result).toHaveLength(2);
      expect(loggingService.log).toHaveBeenCalled();
    });

    it('should throw BadRequestException if no categories provided', async () => {
      await expect(
        service.replaceResourceCategories('resource-id-1', [], 'user-id-1'),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('removeCategoryFromResource', () => {
    it('should remove category from resource successfully', async () => {
      resourceCategoryRepository.findByResourceAndCategory.mockResolvedValue(
        mockResourceCategoryEntity,
      );
      resourceCategoryRepository.remove.mockResolvedValue(undefined);

      await service.removeCategoryFromResource('resource-id-1', 'category-id-1');

      expect(resourceCategoryRepository.findByResourceAndCategory).toHaveBeenCalledWith(
        'resource-id-1',
        'category-id-1',
      );
      expect(resourceCategoryRepository.remove).toHaveBeenCalledWith(
        'resource-id-1',
        'category-id-1',
      );
      expect(loggingService.log).toHaveBeenCalled();
    });

    it('should throw NotFoundException if assignment does not exist', async () => {
      resourceCategoryRepository.findByResourceAndCategory.mockResolvedValue(null);

      await expect(
        service.removeCategoryFromResource('resource-id-1', 'category-id-1'),
      ).rejects.toThrow(NotFoundException);
      expect(resourceCategoryRepository.remove).not.toHaveBeenCalled();
    });
  });

  describe('getResourceCategories', () => {
    it('should return resource categories', async () => {
      const mockAssignments = [mockResourceCategoryEntity];
      resourceCategoryRepository.findByResourceId.mockResolvedValue(mockAssignments);

      const result = await service.getResourceCategories('resource-id-1');

      expect(resourceCategoryRepository.findByResourceId).toHaveBeenCalledWith('resource-id-1');
      expect(result).toHaveLength(1);
      expect(result[0]).toEqual({
        id: mockResourceCategoryEntity.id,
        resourceId: mockResourceCategoryEntity.resourceId,
        categoryId: mockResourceCategoryEntity.categoryId,
        assignedAt: mockResourceCategoryEntity.assignedAt,
        assignedBy: mockResourceCategoryEntity.assignedBy,
      });
    });
  });

  describe('getResourcesByCategory', () => {
    it('should return category resources with pagination', async () => {
      const mockAssignments = [mockResourceCategoryEntity];
      resourceCategoryRepository.findByCategoryId.mockResolvedValue(mockAssignments);

      const result = await service.getResourcesByCategory('category-id-1', 1, 10);

      expect(resourceCategoryRepository.findByCategoryId).toHaveBeenCalledWith(
        'category-id-1',
        1,
        10,
      );
      expect(result).toHaveLength(1);
      expect(result[0]).toEqual({
        id: mockResourceCategoryEntity.id,
        resourceId: mockResourceCategoryEntity.resourceId,
        categoryId: mockResourceCategoryEntity.categoryId,
        assignedAt: mockResourceCategoryEntity.assignedAt,
        assignedBy: mockResourceCategoryEntity.assignedBy,
      });
    });
  });

  describe('bulkAssignCategoryToResources', () => {
    it('should bulk assign category to multiple resources successfully', async () => {
      const resourceIds = ['resource-id-1', 'resource-id-2'];
      resourceRepository.findById.mockResolvedValue(mockResource as any);
      categoryRepository.findById.mockResolvedValue(mockCategory as any);
      resourceCategoryRepository.findByResourceAndCategory.mockResolvedValue(null);
      resourceCategoryRepository.create.mockResolvedValue(mockResourceCategoryEntity);

      const result = await service.bulkAssignCategoryToResources(
        resourceIds,
        'category-id-1',
        'user-id-1',
      );

      expect(categoryRepository.findById).toHaveBeenCalledWith('category-id-1');
      expect(resourceRepository.findById).toHaveBeenCalledTimes(2);
      expect(resourceCategoryRepository.create).toHaveBeenCalledTimes(2);
      expect(result).toHaveLength(2);
      expect(loggingService.log).toHaveBeenCalled();
    });

    it('should throw BadRequestException if no resources provided', async () => {
      await expect(
        service.bulkAssignCategoryToResources([], 'category-id-1', 'user-id-1'),
      ).rejects.toThrow(BadRequestException);
    });

    it('should skip non-existent resources', async () => {
      const resourceIds = ['resource-id-1', 'non-existent-resource'];
      categoryRepository.findById.mockResolvedValue(mockCategory as any);
      resourceRepository.findById
        .mockResolvedValueOnce(mockResource as any) // First resource exists
        .mockResolvedValueOnce(null); // Second resource doesn't exist
      resourceCategoryRepository.findByResourceAndCategory.mockResolvedValue(null);
      resourceCategoryRepository.create.mockResolvedValue(mockResourceCategoryEntity);

      const result = await service.bulkAssignCategoryToResources(
        resourceIds,
        'category-id-1',
        'user-id-1',
      );

      expect(resourceCategoryRepository.create).toHaveBeenCalledTimes(1); // Only one assignment
      expect(result).toHaveLength(1);
    });
  });

  describe('validateResourceCategoryAssignment', () => {
    it('should return valid for correct assignment data', async () => {
      resourceRepository.findById.mockResolvedValue(mockResource as any);
      categoryRepository.findById.mockResolvedValue(mockCategory as any);
      resourceCategoryRepository.findByResourceAndCategory.mockResolvedValue(null);

      const result = await service.validateResourceCategoryAssignment(
        'resource-id-1',
        ['category-id-1'],
      );

      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should return invalid for non-existent resource', async () => {
      resourceRepository.findById.mockResolvedValue(null);

      const result = await service.validateResourceCategoryAssignment(
        'non-existent-resource',
        ['category-id-1'],
      );

      expect(result.isValid).toBe(false);
      expect(result.errors.some(error => error.includes('recurso no existe'))).toBe(true);
    });

    it('should return invalid for non-existent categories', async () => {
      resourceRepository.findById.mockResolvedValue(mockResource as any);
      categoryRepository.findById.mockResolvedValue(null);

      const result = await service.validateResourceCategoryAssignment(
        'resource-id-1',
        ['non-existent-category'],
      );

      expect(result.isValid).toBe(false);
      expect(result.errors.some(error => error.includes('categoría no existe'))).toBe(true);
    });

    it('should return invalid for already assigned categories', async () => {
      resourceRepository.findById.mockResolvedValue(mockResource as any);
      categoryRepository.findById.mockResolvedValue(mockCategory as any);
      resourceCategoryRepository.findByResourceAndCategory.mockResolvedValue(
        mockResourceCategoryEntity,
      );

      const result = await service.validateResourceCategoryAssignment(
        'resource-id-1',
        ['category-id-1'],
      );

      expect(result.isValid).toBe(false);
      expect(result.errors.some(error => error.includes('ya está asignada'))).toBe(true);
    });

    it('should throw BadRequestException if no categories provided', async () => {
      await expect(
        service.validateResourceCategoryAssignment('resource-id-1', []),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('getAssignments', () => {
    it('should return assignments with pagination and filters', async () => {
      const mockAssignments = [mockResourceCategoryEntity];
      resourceCategoryRepository.findResourcesByCategory.mockResolvedValue({
        associations: mockAssignments,
        total: 1,
      });

      const result = await service.getResourcesByCategory('category-id-1', 1, 10);

      expect(resourceCategoryRepository.findResourcesByCategory).toHaveBeenCalledWith('category-id-1', 1, 10);
      expect(result.associations).toHaveLength(1);
      expect(result.total).toBe(1);
      expect(result.page).toBe(1);
      expect(result.limit).toBe(10);
    });

    it('should return assignments without filters', async () => {
      const mockAssignments = [mockResourceCategoryEntity];
      resourceCategoryRepository.findWithPagination.mockResolvedValue({
        associations: mockAssignments,
        total: 1,
      });

      const result = await service.getResourcesByCategory('category-id-1', 1, 10);

      expect(resourceCategoryRepository.findWithPagination).toHaveBeenCalledWith('category-id-1', 1, 10);
      expect(result.associations).toHaveLength(1);
      expect(result.total).toBe(1);
      expect(result.page).toBe(1);
      expect(result.limit).toBe(10);
    });
  });
});
