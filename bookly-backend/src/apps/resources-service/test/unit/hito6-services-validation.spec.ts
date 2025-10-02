/**
 * HITO 6 - Validación de Servicios Implementados
 * Pruebas para verificar que todos los servicios del Hito 6 están correctamente implementados
 */
describe('Hito 6 - Services Implementation Validation', () => {
  describe('Service Classes Existence', () => {
    it('should have ProgramService class defined', () => {
      const ProgramService = require('../../application/services/program.service').ProgramService;
      expect(ProgramService).toBeDefined();
      expect(typeof ProgramService).toBe('function');
      expect(ProgramService.name).toBe('ProgramService');
    });

    it('should have MaintenanceTypeService class defined', () => {
      const MaintenanceTypeService = require('../../application/services/maintenance-type.service').MaintenanceTypeService;
      expect(MaintenanceTypeService).toBeDefined();
      expect(typeof MaintenanceTypeService).toBe('function');
      expect(MaintenanceTypeService.name).toBe('MaintenanceTypeService');
    });

    it('should have ResourceImportService class defined', () => {
      const ResourceImportService = require('../../application/services/resource-import.service').ResourceImportService;
      expect(ResourceImportService).toBeDefined();
      expect(typeof ResourceImportService).toBe('function');
      expect(ResourceImportService.name).toBe('ResourceImportService');
    });

    it('should have ResourceCategoryService class defined', () => {
      const ResourceCategoryService = require('../../application/services/resource-category.service').ResourceCategoryService;
      expect(ResourceCategoryService).toBeDefined();
      expect(typeof ResourceCategoryService).toBe('function');
      expect(ResourceCategoryService.name).toBe('ResourceCategoryService');
    });

    it('should have ResourceResponsibleService class defined', () => {
      const ResourceResponsibleService = require('../../application/services/resource-responsible.service').ResourceResponsibleService;
      expect(ResourceResponsibleService).toBeDefined();
      expect(typeof ResourceResponsibleService).toBe('function');
      expect(ResourceResponsibleService.name).toBe('ResourceResponsibleService');
    });
  });

  describe('Controller Classes Existence', () => {
    it('should have ProgramController class defined', () => {
      const ProgramController = require('../../infrastructure/controllers/program.controller').ProgramController;
      expect(ProgramController).toBeDefined();
      expect(typeof ProgramController).toBe('function');
      expect(ProgramController.name).toBe('ProgramController');
    });

    it('should have MaintenanceTypeController class defined', () => {
      const MaintenanceTypeController = require('../../infrastructure/controllers/maintenance-type.controller').MaintenanceTypeController;
      expect(MaintenanceTypeController).toBeDefined();
      expect(typeof MaintenanceTypeController).toBe('function');
      expect(MaintenanceTypeController.name).toBe('MaintenanceTypeController');
    });

    it('should have ResourceImportController class defined', () => {
      const ResourceImportController = require('../../infrastructure/controllers/resource-import.controller').ResourceImportController;
      expect(ResourceImportController).toBeDefined();
      expect(typeof ResourceImportController).toBe('function');
      expect(ResourceImportController.name).toBe('ResourceImportController');
    });

    it('should have ResourceCategoryController class defined', () => {
      const ResourceCategoryController = require('../../infrastructure/controllers/resource-category.controller').ResourceCategoryController;
      expect(ResourceCategoryController).toBeDefined();
      expect(typeof ResourceCategoryController).toBe('function');
      expect(ResourceCategoryController.name).toBe('ResourceCategoryController');
    });

    it('should have ResourceResponsibleController class defined', () => {
      const ResourceResponsibleController = require('../../infrastructure/controllers/resource-responsible.controller').ResourceResponsibleController;
      expect(ResourceResponsibleController).toBeDefined();
      expect(typeof ResourceResponsibleController).toBe('function');
      expect(ResourceResponsibleController.name).toBe('ResourceResponsibleController');
    });
  });

  describe('Entity Classes Existence', () => {
    it('should have ProgramEntity class defined', () => {
      const ProgramEntity = require('../../domain/entities/program.entity').ProgramEntity;
      expect(ProgramEntity).toBeDefined();
      expect(typeof ProgramEntity).toBe('function');
      expect(ProgramEntity.name).toBe('ProgramEntity');
    });

    it('should have MaintenanceTypeEntity class defined', () => {
      const MaintenanceTypeEntity = require('../../domain/entities/maintenance-type.entity').MaintenanceTypeEntity;
      expect(MaintenanceTypeEntity).toBeDefined();
      expect(typeof MaintenanceTypeEntity).toBe('function');
      expect(MaintenanceTypeEntity.name).toBe('MaintenanceTypeEntity');
    });

    it('should have ResourceImportEntity class defined', () => {
      const ResourceImportEntity = require('../../domain/entities/resource-import.entity').ResourceImportEntity;
      expect(ResourceImportEntity).toBeDefined();
      expect(typeof ResourceImportEntity).toBe('function');
      expect(ResourceImportEntity.name).toBe('ResourceImportEntity');
    });

    it('should have ResourceCategoryEntity class defined', () => {
      const ResourceCategoryEntity = require('../../domain/entities/resource-category.entity').ResourceCategoryEntity;
      expect(ResourceCategoryEntity).toBeDefined();
      expect(typeof ResourceCategoryEntity).toBe('function');
      expect(ResourceCategoryEntity.name).toBe('ResourceCategoryEntity');
    });

    it('should have ResourceResponsibleEntity class defined', () => {
      const ResourceResponsibleEntity = require('../../domain/entities/resource-responsible.entity').ResourceResponsibleEntity;
      expect(ResourceResponsibleEntity).toBeDefined();
      expect(typeof ResourceResponsibleEntity).toBe('function');
      expect(ResourceResponsibleEntity.name).toBe('ResourceResponsibleEntity');
    });
  });

  describe('Repository Classes Existence', () => {
    it('should have PrismaProgramRepository class defined', () => {
      const PrismaProgramRepository = require('../../infrastructure/repositories/prisma-program.repository').PrismaProgramRepository;
      expect(PrismaProgramRepository).toBeDefined();
      expect(typeof PrismaProgramRepository).toBe('function');
      expect(PrismaProgramRepository.name).toBe('PrismaProgramRepository');
    });

    it('should have PrismaMaintenanceTypeRepository class defined', () => {
      const PrismaMaintenanceTypeRepository = require('../../infrastructure/repositories/prisma-maintenance-type.repository').PrismaMaintenanceTypeRepository;
      expect(PrismaMaintenanceTypeRepository).toBeDefined();
      expect(typeof PrismaMaintenanceTypeRepository).toBe('function');
      expect(PrismaMaintenanceTypeRepository.name).toBe('PrismaMaintenanceTypeRepository');
    });

    it('should have PrismaResourceImportRepository class defined', () => {
      const PrismaResourceImportRepository = require('../../infrastructure/repositories/prisma-resource-import.repository').PrismaResourceImportRepository;
      expect(PrismaResourceImportRepository).toBeDefined();
      expect(typeof PrismaResourceImportRepository).toBe('function');
      expect(PrismaResourceImportRepository.name).toBe('PrismaResourceImportRepository');
    });

    it('should have PrismaResourceCategoryRepository class defined', () => {
      const PrismaResourceCategoryRepository = require('../../infrastructure/repositories/prisma-resource-category.repository').PrismaResourceCategoryRepository;
      expect(PrismaResourceCategoryRepository).toBeDefined();
      expect(typeof PrismaResourceCategoryRepository).toBe('function');
      expect(PrismaResourceCategoryRepository.name).toBe('PrismaResourceCategoryRepository');
    });

    it('should have PrismaResourceResponsibleRepository class defined', () => {
      const PrismaResourceResponsibleRepository = require('../../infrastructure/repositories/prisma-resource-responsible.repository').PrismaResourceResponsibleRepository;
      expect(PrismaResourceResponsibleRepository).toBeDefined();
      expect(typeof PrismaResourceResponsibleRepository).toBe('function');
      expect(PrismaResourceResponsibleRepository.name).toBe('PrismaResourceResponsibleRepository');
    });
  });

  describe('Service Methods Validation', () => {
    it('should have ProgramService with required methods', () => {
      const ProgramService = require('../../application/services/program.service').ProgramService;
      const prototype = ProgramService.prototype;
      
      expect(typeof prototype.createProgram).toBe('function');
      expect(typeof prototype.updateProgram).toBe('function');
      expect(typeof prototype.getProgramById).toBe('function');
      expect(typeof prototype.getPrograms).toBe('function');
      expect(typeof prototype.getActivePrograms).toBe('function');
      expect(typeof prototype.deactivateProgram).toBe('function');
      expect(typeof prototype.reactivateProgram).toBe('function');
    });

    it('should have MaintenanceTypeService with required methods', () => {
      const MaintenanceTypeService = require('../../application/services/maintenance-type.service').MaintenanceTypeService;
      const prototype = MaintenanceTypeService.prototype;
      
      expect(typeof prototype.createMaintenanceType).toBe('function');
      expect(typeof prototype.updateMaintenanceType).toBe('function');
      expect(typeof prototype.getMaintenanceTypeById).toBe('function');
      expect(typeof prototype.getActiveMaintenanceTypes).toBe('function');
      expect(typeof prototype.getAllMaintenanceTypes).toBe('function');
      expect(typeof prototype.getDefaultMaintenanceTypes).toBe('function');
      expect(typeof prototype.getCustomMaintenanceTypes).toBe('function');
      expect(typeof prototype.deactivateMaintenanceType).toBe('function');
      expect(typeof prototype.reactivateMaintenanceType).toBe('function');
      expect(typeof prototype.validateMaintenanceType).toBe('function');
    });

    it('should have ResourceImportService with required methods', () => {
      const ResourceImportService = require('../../application/services/resource-import.service').ResourceImportService;
      const prototype = ResourceImportService.prototype;
      
      expect(typeof prototype.previewImport).toBe('function');
      expect(typeof prototype.startImport).toBe('function');
      expect(typeof prototype.getImportById).toBe('function');
      expect(typeof prototype.getImports).toBe('function');
      expect(typeof prototype.getImportStatistics).toBe('function');
      expect(typeof prototype.cleanupOldImports).toBe('function');
    });

    it('should have ResourceCategoryService with required methods', () => {
      const ResourceCategoryService = require('../../application/services/resource-category.service').ResourceCategoryService;
      const prototype = ResourceCategoryService.prototype;
      
      expect(typeof prototype.assignCategoryToResource).toBe('function');
      expect(typeof prototype.assignCategoriesToResource).toBe('function');
      expect(typeof prototype.replaceResourceCategories).toBe('function');
      expect(typeof prototype.removeCategoryFromResource).toBe('function');
      expect(typeof prototype.getResourceCategories).toBe('function');
      expect(typeof prototype.bulkAssignCategoryToResources).toBe('function');
      expect(typeof prototype.validateResourceCategoryAssignment).toBe('function');
    });

    it('should have ResourceResponsibleService with required methods', () => {
      const ResourceResponsibleService = require('../../application/services/resource-responsible.service').ResourceResponsibleService;
      const prototype = ResourceResponsibleService.prototype;
      
      expect(typeof prototype.assignResponsible).toBe('function');
      expect(typeof prototype.assignMultipleResponsibles).toBe('function');
      expect(typeof prototype.replaceResourceResponsibles).toBe('function');
      expect(typeof prototype.deactivateResponsible).toBe('function');
      expect(typeof prototype.getResourceResponsibles).toBe('function');
      expect(typeof prototype.getUserResponsibilities).toBe('function');
      expect(typeof prototype.getResourcesByUser).toBe('function');
      expect(typeof prototype.isUserResponsibleForResource).toBe('function');
      expect(typeof prototype.bulkAssignResponsibleToResources).toBe('function');
      expect(typeof prototype.transferResponsibilities).toBe('function');
      expect(typeof prototype.validateResponsibilityAssignment).toBe('function');
      expect(typeof prototype.getResponsibilities).toBe('function');
      expect(typeof prototype.deactivateAllResourceResponsibles).toBe('function');
    });
  });

  describe('Entity Instantiation', () => {
    it('should create ProgramEntity instance', () => {
      const ProgramEntity = require('../../domain/entities/program.entity').ProgramEntity;
      const entity = new ProgramEntity(
        'test-id',
        'Test Program',
        'TEST',
        'Test Description',
        'Test Faculty',
        true,
        new Date(),
        new Date()
      );
      
      expect(entity).toBeDefined();
      expect(entity.id).toBe('test-id');
      expect(entity.name).toBe('Test Program');
      expect(entity.code).toBe('TEST');
      expect(entity.isActive).toBe(true);
    });

    it('should create MaintenanceTypeEntity instance', () => {
      const MaintenanceTypeEntity = require('../../domain/entities/maintenance-type.entity').MaintenanceTypeEntity;
      const entity = new MaintenanceTypeEntity(
        'test-id',
        'TEST_TYPE',
        'Test Type',
        '#000000',
        1,
        false,
        true,
        new Date(),
        new Date()
      );
      
      expect(entity).toBeDefined();
      expect(entity.id).toBe('test-id');
      expect(entity.name).toBe('TEST_TYPE');
      expect(entity.isDefault).toBe(false);
      expect(entity.isActive).toBe(true);
    });

    it('should create ResourceImportEntity instance', () => {
      const ResourceImportEntity = require('../../domain/entities/resource-import.entity').ResourceImportEntity;
      const entity = new ResourceImportEntity(
        'test-id',
        'test.csv',
        'test_original.csv',
        100,
        95,
        5,
        'COMPLETED',
        [],
        {},
        'user-id',
        new Date(),
        new Date()
      );
      
      expect(entity).toBeDefined();
      expect(entity.id).toBe('test-id');
      expect(entity.filename).toBe('test.csv');
      expect(entity.totalRows).toBe(100);
      expect(entity.successfulRows).toBe(95);
      expect(entity.failedRows).toBe(5);
    });

    it('should create ResourceCategoryEntity instance', () => {
      const ResourceCategoryEntity = require('../../domain/entities/resource-category.entity').ResourceCategoryEntity;
      const entity = new ResourceCategoryEntity(
        'test-id',
        'resource-id',
        'category-id',
        new Date(),
        'user-id'
      );
      
      expect(entity).toBeDefined();
      expect(entity.id).toBe('test-id');
      expect(entity.resourceId).toBe('resource-id');
      expect(entity.categoryId).toBe('category-id');
      expect(entity.assignedBy).toBe('user-id');
    });

    it('should create ResourceResponsibleEntity instance', () => {
      const ResourceResponsibleEntity = require('../../domain/entities/resource-responsible.entity').ResourceResponsibleEntity;
      const entity = new ResourceResponsibleEntity(
        'test-id',
        'resource-id',
        'user-id',
        'admin-id',
        new Date(),
        true
      );
      
      expect(entity).toBeDefined();
      expect(entity.id).toBe('test-id');
      expect(entity.resourceId).toBe('resource-id');
      expect(entity.userId).toBe('user-id');
      expect(entity.assignedBy).toBe('admin-id');
      expect(entity.isActive).toBe(true);
    });
  });

  describe('DTOs Existence', () => {
    it('should have Program DTOs defined', () => {
      const programDtos = require('../../application/dtos/program.dto');
      expect(programDtos.CreateProgramDto).toBeDefined();
      expect(programDtos.UpdateProgramDto).toBeDefined();
      expect(programDtos.ProgramResponseDto).toBeDefined();
    });

    it('should have MaintenanceType DTOs defined', () => {
      const maintenanceTypeDtos = require('../../application/dtos/maintenance-type.dto');
      expect(maintenanceTypeDtos.CreateMaintenanceTypeDto).toBeDefined();
      expect(maintenanceTypeDtos.UpdateMaintenanceTypeDto).toBeDefined();
      expect(maintenanceTypeDtos.MaintenanceTypeResponseDto).toBeDefined();
    });

    it('should have ResourceImport DTOs defined', () => {
      const resourceImportDtos = require('../../application/dtos/resource-import.dto');
      expect(resourceImportDtos.ImportPreviewDto).toBeDefined();
      expect(resourceImportDtos.ResourceImportResponseDto).toBeDefined();
      expect(resourceImportDtos.ImportStatisticsDto).toBeDefined();
    });

    it('should have ResourceCategory DTOs defined', () => {
      const resourceCategoryDtos = require('../../application/dtos/resource-category.dto');
      expect(resourceCategoryDtos.ResourceCategoryResponseDto).toBeDefined();
    });

    it('should have ResourceResponsible DTOs defined', () => {
      const resourceResponsibleDtos = require('../../application/dtos/resource-responsible.dto');
      expect(resourceResponsibleDtos.ResourceResponsibleResponseDto).toBeDefined();
    });
  });

  describe('Hito 6 Implementation Completeness', () => {
    it('should have all RF-02 components (Program Academic Association)', () => {
      // Verify Program-related components exist
      const ProgramService = require('../../application/services/program.service').ProgramService;
      const ProgramController = require('../../infrastructure/controllers/program.controller').ProgramController;
      const ProgramEntity = require('../../domain/entities/program.entity').ProgramEntity;
      
      expect(ProgramService).toBeDefined();
      expect(ProgramController).toBeDefined();
      expect(ProgramEntity).toBeDefined();
    });

    it('should have all RF-04 components (Mass Import)', () => {
      // Verify ResourceImport-related components exist
      const ResourceImportService = require('../../application/services/resource-import.service').ResourceImportService;
      const ResourceImportController = require('../../infrastructure/controllers/resource-import.controller').ResourceImportController;
      const ResourceImportEntity = require('../../domain/entities/resource-import.entity').ResourceImportEntity;
      
      expect(ResourceImportService).toBeDefined();
      expect(ResourceImportController).toBeDefined();
      expect(ResourceImportEntity).toBeDefined();
    });

    it('should have all RF-06 components (Maintenance Module)', () => {
      // Verify Maintenance and Responsible-related components exist
      const MaintenanceTypeService = require('../../application/services/maintenance-type.service').MaintenanceTypeService;
      const MaintenanceTypeController = require('../../infrastructure/controllers/maintenance-type.controller').MaintenanceTypeController;
      const ResourceResponsibleService = require('../../application/services/resource-responsible.service').ResourceResponsibleService;
      const ResourceResponsibleController = require('../../infrastructure/controllers/resource-responsible.controller').ResourceResponsibleController;
      
      expect(MaintenanceTypeService).toBeDefined();
      expect(MaintenanceTypeController).toBeDefined();
      expect(ResourceResponsibleService).toBeDefined();
      expect(ResourceResponsibleController).toBeDefined();
    });

    it('should have category association components', () => {
      // Verify ResourceCategory-related components exist
      const ResourceCategoryService = require('../../application/services/resource-category.service').ResourceCategoryService;
      const ResourceCategoryController = require('../../infrastructure/controllers/resource-category.controller').ResourceCategoryController;
      const ResourceCategoryEntity = require('../../domain/entities/resource-category.entity').ResourceCategoryEntity;
      
      expect(ResourceCategoryService).toBeDefined();
      expect(ResourceCategoryController).toBeDefined();
      expect(ResourceCategoryEntity).toBeDefined();
    });
  });
});
