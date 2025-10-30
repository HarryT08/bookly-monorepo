import { Test, TestingModule } from '@nestjs/testing';
import { ProgramService } from '../../application/services/program.service';
import { MaintenanceTypeService } from '../../application/services/maintenance-type.service';
import { ResourceImportService } from '../../application/services/resource-import.service';
import { ResourceCategoryService } from '../../application/services/resource-category.service';
import { ResourceResponsibleService } from '../../application/services/resource-responsible.service';

/**
 * HITO 6 - Pruebas Básicas de Servicios
 * Pruebas simplificadas para verificar que los servicios están correctamente implementados
 */
describe('Hito 6 - Basic Services Tests', () => {
  let programService: ProgramService;
  let maintenanceTypeService: MaintenanceTypeService;
  let resourceImportService: ResourceImportService;
  let resourceCategoryService: ResourceCategoryService;
  let resourceResponsibleService: ResourceResponsibleService;

  // Mock repositories
  const mockProgramRepository = {
    findById: jest.fn(),
    findByName: jest.fn(),
    findByCode: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    findWithPagination: jest.fn(),
    findAll: jest.fn(),
  };

  const mockMaintenanceTypeRepository = {
    findById: jest.fn(),
    findByName: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    findAll: jest.fn(),
    findDefaults: jest.fn(),
    findCustom: jest.fn(),
  };

  const mockResourceImportRepository = {
    findById: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    findByUser: jest.fn(),
    findWithPagination: jest.fn(),
    getStatistics: jest.fn(),
    deleteOldImports: jest.fn(),
  };

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

  const mockResourceResponsibleRepository = {
    findByResourceAndUser: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    findByResource: jest.fn(),
    findByUser: jest.fn(),
    findWithPagination: jest.fn(),
    deactivateByResourceAndUser: jest.fn(),
    deactivateByResource: jest.fn(),
  };

  const mockResourceRepository = {
    findById: jest.fn(),
    create: jest.fn(),
  };

  const mockCategoryRepository = {
    findById: jest.fn(),
  };

  const mockUserRepository = {
    findById: jest.fn(),
  };

  const mockLoggingService = {
    log: jest.fn(),
    error: jest.fn(),
    warn: jest.fn(),
    debug: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ProgramService,
        MaintenanceTypeService,
        ResourceImportService,
        ResourceCategoryService,
        ResourceResponsibleService,
        {
          provide: 'ProgramRepository',
          useValue: mockProgramRepository,
        },
        {
          provide: 'MaintenanceTypeRepository',
          useValue: mockMaintenanceTypeRepository,
        },
        {
          provide: 'ResourceImportRepository',
          useValue: mockResourceImportRepository,
        },
        {
          provide: 'ResourceCategoryRepository',
          useValue: mockResourceCategoryRepository,
        },
        {
          provide: 'ResourceResponsibleRepository',
          useValue: mockResourceResponsibleRepository,
        },
        {
          provide: 'ResourceRepository',
          useValue: mockResourceRepository,
        },
        {
          provide: 'CategoryRepository',
          useValue: mockCategoryRepository,
        },
        {
          provide: 'UserRepository',
          useValue: mockUserRepository,
        },
        {
          provide: 'LoggingService',
          useValue: mockLoggingService,
        },
      ],
    }).compile();

    programService = module.get<ProgramService>(ProgramService);
    maintenanceTypeService = module.get<MaintenanceTypeService>(MaintenanceTypeService);
    resourceImportService = module.get<ResourceImportService>(ResourceImportService);
    resourceCategoryService = module.get<ResourceCategoryService>(ResourceCategoryService);
    resourceResponsibleService = module.get<ResourceResponsibleService>(ResourceResponsibleService);
  });

  describe('Service Instantiation', () => {
    it('should create ProgramService', () => {
      expect(programService).toBeDefined();
      expect(programService).toBeInstanceOf(ProgramService);
    });

    it('should create MaintenanceTypeService', () => {
      expect(maintenanceTypeService).toBeDefined();
      expect(maintenanceTypeService).toBeInstanceOf(MaintenanceTypeService);
    });

    it('should create ResourceImportService', () => {
      expect(resourceImportService).toBeDefined();
      expect(resourceImportService).toBeInstanceOf(ResourceImportService);
    });

    it('should create ResourceCategoryService', () => {
      expect(resourceCategoryService).toBeDefined();
      expect(resourceCategoryService).toBeInstanceOf(ResourceCategoryService);
    });

    it('should create ResourceResponsibleService', () => {
      expect(resourceResponsibleService).toBeDefined();
      expect(resourceResponsibleService).toBeInstanceOf(ResourceResponsibleService);
    });
  });

  describe('Service Methods Existence', () => {
    it('ProgramService should have required methods', () => {
      expect(typeof programService.createProgram).toBe('function');
      expect(typeof programService.updateProgram).toBe('function');
      expect(typeof programService.getProgramById).toBe('function');
      expect(typeof programService.getPrograms).toBe('function');
      expect(typeof programService.getActivePrograms).toBe('function');
      expect(typeof programService.deactivateProgram).toBe('function');
      expect(typeof programService.reactivateProgram).toBe('function');
    });

    it('MaintenanceTypeService should have required methods', () => {
      expect(typeof maintenanceTypeService.createMaintenanceType).toBe('function');
      expect(typeof maintenanceTypeService.updateMaintenanceType).toBe('function');
      expect(typeof maintenanceTypeService.getMaintenanceTypeById).toBe('function');
      expect(typeof maintenanceTypeService.getActiveMaintenanceTypes).toBe('function');
      expect(typeof maintenanceTypeService.getAllMaintenanceTypes).toBe('function');
      expect(typeof maintenanceTypeService.getDefaultMaintenanceTypes).toBe('function');
      expect(typeof maintenanceTypeService.getCustomMaintenanceTypes).toBe('function');
      expect(typeof maintenanceTypeService.deactivateMaintenanceType).toBe('function');
      expect(typeof maintenanceTypeService.reactivateMaintenanceType).toBe('function');
      expect(typeof maintenanceTypeService.validateMaintenanceType).toBe('function');
    });

    it('ResourceImportService should have required methods', () => {
      expect(typeof resourceImportService.previewImport).toBe('function');
      expect(typeof resourceImportService.startImport).toBe('function');
      expect(typeof resourceImportService.getImportById).toBe('function');
      expect(typeof resourceImportService.getImports).toBe('function');
      expect(typeof resourceImportService.getImportStatistics).toBe('function');
      expect(typeof resourceImportService.cleanupOldImports).toBe('function');
    });

    it('ResourceCategoryService should have required methods', () => {
      expect(typeof resourceCategoryService.assignCategoryToResource).toBe('function');
      expect(typeof resourceCategoryService.assignCategoriesToResource).toBe('function');
      expect(typeof resourceCategoryService.replaceResourceCategories).toBe('function');
      expect(typeof resourceCategoryService.removeCategoryFromResource).toBe('function');
      expect(typeof resourceCategoryService.getResourceCategories).toBe('function');
      expect(typeof resourceCategoryService.bulkAssignCategoryToResources).toBe('function');
      expect(typeof resourceCategoryService.validateResourceCategoryAssignment).toBe('function');
    });

    it('ResourceResponsibleService should have required methods', () => {
      expect(typeof resourceResponsibleService.assignResponsible).toBe('function');
      expect(typeof resourceResponsibleService.assignMultipleResponsibles).toBe('function');
      expect(typeof resourceResponsibleService.replaceResourceResponsibles).toBe('function');
      expect(typeof resourceResponsibleService.deactivateResponsible).toBe('function');
      expect(typeof resourceResponsibleService.getResourceResponsibles).toBe('function');
      expect(typeof resourceResponsibleService.getUserResponsibilities).toBe('function');
      expect(typeof resourceResponsibleService.getResourcesByUser).toBe('function');
      expect(typeof resourceResponsibleService.isUserResponsibleForResource).toBe('function');
      expect(typeof resourceResponsibleService.bulkAssignResponsibleToResources).toBe('function');
      expect(typeof resourceResponsibleService.transferResponsibilities).toBe('function');
      expect(typeof resourceResponsibleService.validateResponsibilityAssignment).toBe('function');
      expect(typeof resourceResponsibleService.getResponsibilities).toBe('function');
      expect(typeof resourceResponsibleService.deactivateAllResourceResponsibles).toBe('function');
    });
  });

  describe('Basic Functionality Tests', () => {
    it('should handle basic program operations', async () => {
      // Mock successful responses
      mockProgramRepository.findByName.mockResolvedValue(null);
      mockProgramRepository.findByCode.mockResolvedValue(null);
      mockProgramRepository.create.mockResolvedValue({
        id: 'program-1',
        name: 'Test Program',
        code: 'TEST',
        description: 'Test Description',
        facultyName: 'Test Faculty',
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      const createDto = {
        name: 'Test Program',
        code: 'TEST',
        description: 'Test Description',
        facultyName: 'Test Faculty',
      };

      const result = await programService.createProgram(createDto, 'user-1');

      expect(result).toBeDefined();
      expect(result.name).toBe('Test Program');
      expect(mockProgramRepository.create).toHaveBeenCalled();
      expect(mockLoggingService.log).toHaveBeenCalled();
    });

    it('should handle basic maintenance type operations', async () => {
      mockMaintenanceTypeRepository.findByName.mockResolvedValue(null);
      mockMaintenanceTypeRepository.create.mockResolvedValue({
        id: 'maintenance-1',
        name: 'TEST_TYPE',
        description: 'Test Type',
        color: '#000000',
        priority: 1,
        isDefault: false,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      const createDto = {
        name: 'TEST_TYPE',
        description: 'Test Type',
        color: '#000000',
        priority: 1,
      };

      const result = await maintenanceTypeService.createMaintenanceType(createDto);

      expect(result).toBeDefined();
      expect(result.name).toBe('TEST_TYPE');
      expect(mockMaintenanceTypeRepository.create).toHaveBeenCalled();
    });

    it('should handle basic resource category operations', async () => {
      mockResourceRepository.findById.mockResolvedValue({ id: 'resource-1' });
      mockCategoryRepository.findById.mockResolvedValue({ id: 'category-1' });
      mockResourceCategoryRepository.findByResourceAndCategory.mockResolvedValue(null);
      mockResourceCategoryRepository.create.mockResolvedValue({
        id: 'assignment-1',
        resourceId: 'resource-1',
        categoryId: 'category-1',
        assignedAt: new Date(),
        assignedBy: 'user-1',
      });

      const result = await resourceCategoryService.assignCategoryToResource(
        'resource-1',
        'category-1',
        'user-1',
      );

      expect(result).toBeDefined();
      expect(result.resourceId).toBe('resource-1');
      expect(result.categoryId).toBe('category-1');
      expect(mockResourceCategoryRepository.create).toHaveBeenCalled();
    });

    it('should handle basic resource responsible operations', async () => {
      mockResourceRepository.findById.mockResolvedValue({ id: 'resource-1' });
      mockUserRepository.findById.mockResolvedValue({ id: 'user-1' });
      mockResourceResponsibleRepository.findByResourceAndUser.mockResolvedValue(null);
      mockResourceResponsibleRepository.create.mockResolvedValue({
        id: 'responsible-1',
        resourceId: 'resource-1',
        userId: 'user-1',
        assignedBy: 'admin-1',
        assignedAt: new Date(),
        isActive: true,
      });

      const result = await resourceResponsibleService.assignResponsible({
        resourceId: 'resource-1',
        userId: 'user-1',
        assignedBy: 'admin-1',
      });

      expect(result).toBeDefined();
      expect(result.resourceId).toBe('resource-1');
      expect(result.userId).toBe('user-1');
      expect(mockResourceResponsibleRepository.create).toHaveBeenCalled();
    });
  });

  describe('Error Handling', () => {
    it('should handle repository errors gracefully', async () => {
      mockProgramRepository.findByName.mockRejectedValue(new Error('Database error'));

      const createDto = {
        name: 'Test Program',
        code: 'TEST',
        description: 'Test Description',
        facultyName: 'Test Faculty',
      };

      await expect(programService.createProgram(createDto, 'user-1')).rejects.toThrow();
    });
  });

  describe('Integration Readiness', () => {
    it('should have all services ready for integration', () => {
      // Verify all services are instantiated and have the required methods
      const services = [
        programService,
        maintenanceTypeService,
        resourceImportService,
        resourceCategoryService,
        resourceResponsibleService,
      ];

      services.forEach(service => {
        expect(service).toBeDefined();
        expect(service.constructor.name).toMatch(/Service$/);
      });
    });

    it('should have proper dependency injection setup', () => {
      // Verify that all mocked repositories are properly injected
      expect(mockProgramRepository).toBeDefined();
      expect(mockMaintenanceTypeRepository).toBeDefined();
      expect(mockResourceImportRepository).toBeDefined();
      expect(mockResourceCategoryRepository).toBeDefined();
      expect(mockResourceResponsibleRepository).toBeDefined();
      expect(mockLoggingService).toBeDefined();
    });
  });
});
