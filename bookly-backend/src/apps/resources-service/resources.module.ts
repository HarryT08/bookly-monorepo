import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { ResourcesController } from '@apps/resources-service/infrastructure/controllers/resources.controller';
import { ResourcesResourceCategoryController } from '@apps/resources-service/infrastructure/controllers/resources-resource-category.controller';
import { ResourcesProgramCategoryController } from '@apps/resources-service/infrastructure/controllers/resources-program-category.controller';
import { ResourcesIncidentReportCategoryController } from '@apps/resources-service/infrastructure/controllers/resources-incident-report-category.controller';
import { CategoryController } from '@apps/resources-service/infrastructure/controllers/category.controller';
import { MaintenanceTypeController } from '@apps/resources-service/infrastructure/controllers/maintenance-type.controller';
import { ProgramController } from '@apps/resources-service/infrastructure/controllers/program.controller';
import { ResourceCategoryController } from '@apps/resources-service/infrastructure/controllers/resource-category.controller';
import { ResourceImportController } from '@apps/resources-service/infrastructure/controllers/resource-import.controller';
import { ResourceResponsibleController } from '@apps/resources-service/infrastructure/controllers/resource-responsible.controller';
import { PrismaResourceRepository } from '@apps/resources-service/infrastructure/repositories/prisma-resource.repository';
import { PrismaCategoryRepository } from '@apps/resources-service/infrastructure/repositories/prisma-category.repository';
import { PrismaResourceCategoryRepository } from '@apps/resources-service/infrastructure/repositories/prisma-resource-category.repository';
import { ResourceCategoryRepository } from '@libs/common/repositories/resource-category.repository';
import { ProgramCategoryRepository } from '@libs/common/repositories/program-category.repository';
import { IncidentReportCategoryRepository } from '@libs/common/repositories/incident-report-category.repository';
import { ResourcesService } from '@apps/resources-service/application/services/resources.service';
import { ResourceCategoryService } from '@apps/resources-service/application/services/resource-category.service';
import { ResourcesResourceCategoryService } from '@apps/resources-service/application/services/resources-resource-category.service';
import { ResourcesProgramCategoryService } from '@apps/resources-service/application/services/resources-program-category.service';
import { ResourcesIncidentReportCategoryService } from '@apps/resources-service/application/services/resources-incident-report-category.service';
import { MaintenanceTypeService } from '@apps/resources-service/application/services/maintenance-type.service';
import { ResourceImportService } from '@apps/resources-service/application/services/resource-import.service';
import { ResourceResponsibleService } from '@apps/resources-service/application/services/resource-responsible.service';
import { PrismaMaintenanceTypeRepository } from '@apps/resources-service/infrastructure/repositories/prisma-maintenance-type.repository';
import { PrismaResourceImportRepository } from '@apps/resources-service/infrastructure/repositories/prisma-resource-import.repository';
import { PrismaResourceResponsibleRepository } from '@apps/resources-service/infrastructure/repositories/prisma-resource-responsible.repository';
import { LoggingModule } from '@libs/logging/logging.module';
import { CommonModule } from '@libs/common/common.module';
import { EventBusModule } from '@libs/event-bus/event-bus.module';
import { HealthModule } from '../../health/health.module';

// Command Handlers
import { CreateResourceHandler } from '@apps/resources-service/application/handlers/create-resource.handler';
import { UpdateResourceHandler } from '@apps/resources-service/application/handlers/update-resource.handler';
import { DeleteResourceHandler } from '@apps/resources-service/application/handlers/delete-resource.handler';

// Resource Category Handlers
import { 
  AssignCategoryToResourceHandler,
  ReplaceResourceCategoriesHandler,
  RemoveCategoryFromResourceHandler 
} from '@apps/resources-service/application/handlers/create-resource-category.handler';
import { 
  GetResourceCategoriesHandler,
  GetResourcesByCategoryHandler,
  CheckResourceCategoryAssignmentHandler 
} from '@apps/resources-service/application/handlers/get-resource-category.handler';

// New ResourceCategory CQRS Handlers
import { AssignCategoriesToResourceHandler } from '@apps/resources-service/application/handlers/resource-category/assign-categories-to-resource.handler';
import { RemoveCategoriesFromResourceHandler } from '@apps/resources-service/application/handlers/resource-category/remove-categories-from-resource.handler';
import { GetResourceCategoriesHandler as GetResourceCategoriesQueryHandler } from '@apps/resources-service/application/handlers/resource-category/get-resource-categories.handler';

// ProgramCategory CQRS Handlers
import { AssignCategoriesToProgramHandler } from '@apps/resources-service/application/handlers/program-category/assign-categories-to-program.handler';
import { RemoveCategoriesFromProgramHandler } from '@apps/resources-service/application/handlers/program-category/remove-categories-from-program.handler';
import { GetProgramCategoriesHandler } from '@apps/resources-service/application/handlers/program-category/get-program-categories.handler';

// IncidentReportCategory CQRS Handlers
import { AssignCategoriesToIncidentReportHandler } from '@apps/resources-service/application/handlers/incident-report-category/assign-categories-to-incident-report.handler';
import { RemoveCategoriesFromIncidentReportHandler } from '@apps/resources-service/application/handlers/incident-report-category/remove-categories-from-incident-report.handler';
import { GetIncidentReportCategoriesHandler } from '@apps/resources-service/application/handlers/incident-report-category/get-incident-report-categories.handler';

// Maintenance Type Handlers
import { CreateMaintenanceTypeHandler } from '@apps/resources-service/application/handlers/create-maintenance-type.handler';
import { UpdateMaintenanceTypeHandler } from '@apps/resources-service/application/handlers/update-maintenance-type.handler';
import { GetMaintenanceTypeHandler } from '@apps/resources-service/application/handlers/get-maintenance-type.handler';

// Resource Import Handlers
import { 
  PreviewImportHandler,
  StartImportHandler,
  GetImportByIdHandler,
  GetImportsByUserHandler,
  GetImportsHandler,
  GetImportStatisticsHandler 
} from '@apps/resources-service/application/handlers/resource-import-extended.handler';
import { GetImportStatusHandler, GetImportHistoryHandler, GetImportTemplateHandler } from '@apps/resources-service/application/handlers/get-import-status.handler';

// Query Handlers
import { BulkAssignResponsibleHandler, TransferResponsibilitiesHandler, ValidateResponsibilityAssignmentHandler } from './application/handlers/bulk-assign-responsible.handler';
import { 
  AssignResourceResponsibleHandler,
  RemoveResourceResponsibleHandler,
  AssignMultipleResourceResponsibleHandler,
  ReplaceResourceResponsiblesHandler,
  DeactivateAllResourceResponsiblesHandler,
  GetResourceResponsiblesHandler,
  GetUserResponsibilitiesHandler,
  GetResponsibilitiesHandler,
  CheckResourceResponsibleHandler
} from './application/handlers/create-resource-responsible.handler';
import { GetResourceHandler, GetResourceByCodeHandler } from '@apps/resources-service/application/handlers/get-resource.handler';
import {
  GetResourcesHandler,
  GetResourcesWithPaginationHandler,
  SearchResourcesHandler,
  CheckResourceAvailabilityHandler,
} from '@apps/resources-service/application/handlers/get-resources.handler';

const CommandHandlers = [
  CreateResourceHandler,
  UpdateResourceHandler,
  DeleteResourceHandler,
  // Resource Category Commands
  AssignCategoryToResourceHandler,
  ReplaceResourceCategoriesHandler,
  RemoveCategoryFromResourceHandler,
  // New CQRS Resource Category Commands
  AssignCategoriesToResourceHandler,
  RemoveCategoriesFromResourceHandler,
  // Program Category Commands
  AssignCategoriesToProgramHandler,
  RemoveCategoriesFromProgramHandler,
  // IncidentReport Category Commands
  AssignCategoriesToIncidentReportHandler,
  RemoveCategoriesFromIncidentReportHandler,
  // Maintenance Type Commands
  CreateMaintenanceTypeHandler,
  UpdateMaintenanceTypeHandler,
  // Resource Import Commands
  PreviewImportHandler,
  StartImportHandler,
];

const QueryHandlers = [
  // Resource Responsible Handlers
  BulkAssignResponsibleHandler,
  TransferResponsibilitiesHandler,
  ValidateResponsibilityAssignmentHandler,
  AssignResourceResponsibleHandler,
  RemoveResourceResponsibleHandler,
  AssignMultipleResourceResponsibleHandler,
  ReplaceResourceResponsiblesHandler,
  DeactivateAllResourceResponsiblesHandler,
  GetResourceResponsiblesHandler,
  GetUserResponsibilitiesHandler,
  GetResponsibilitiesHandler,
  CheckResourceResponsibleHandler,
  GetResourceHandler,
  GetResourceByCodeHandler,
  GetResourcesHandler,
  GetResourcesWithPaginationHandler,
  SearchResourcesHandler,
  CheckResourceAvailabilityHandler,
  // Resource Category Queries
  GetResourceCategoriesHandler,
  GetResourcesByCategoryHandler,
  CheckResourceCategoryAssignmentHandler,
  // New CQRS Resource Category Queries
  GetResourceCategoriesQueryHandler,
  // Program Category Queries
  GetProgramCategoriesHandler,
  // IncidentReport Category Queries
  GetIncidentReportCategoriesHandler,
  // Maintenance Type Queries
  GetMaintenanceTypeHandler,
  // Resource Import Queries
  GetImportByIdHandler,
  GetImportsByUserHandler,
  GetImportsHandler,
  GetImportStatisticsHandler,
  GetImportStatusHandler,
  GetImportHistoryHandler,
  GetImportTemplateHandler,
];

/**
 * Resources Module
 * Implements RF-01, RF-03, RF-05 from Hito 1
 * Provides complete resource management functionality with CQRS pattern
 */
@Module({
  imports: [
    CqrsModule,
    LoggingModule,
    CommonModule,
    EventBusModule,
    HealthModule,
  ],
  controllers: [
    ResourcesController,
    ResourcesResourceCategoryController,
    ResourcesProgramCategoryController,
    ResourcesIncidentReportCategoryController,
    CategoryController,
    MaintenanceTypeController,
    ProgramController,
    ResourceCategoryController,
    ResourceImportController,
    ResourceResponsibleController,
  ],
  providers: [
    // Services
    ResourcesService,
    ResourceCategoryService,
    ResourcesResourceCategoryService,
    ResourcesProgramCategoryService,
    ResourcesIncidentReportCategoryService,
    MaintenanceTypeService,
    ResourceImportService,
    ResourceResponsibleService,
    // Repositories
    {
      provide: 'ResourceRepository',
      useClass: PrismaResourceRepository,
    },
    {
      provide: 'CategoryRepository',
      useClass: PrismaCategoryRepository,
    },
    {
      provide: 'ResourceCategoryRepository',
      useClass: PrismaResourceCategoryRepository,
    },
    ResourceCategoryRepository,
    ProgramCategoryRepository,
    IncidentReportCategoryRepository,
    {
      provide: 'MaintenanceTypeRepository',
      useClass: PrismaMaintenanceTypeRepository,
    },
    {
      provide: 'ResourceImportRepository',
      useClass: PrismaResourceImportRepository,
    },
    {
      provide: 'ResourceResponsibleRepository',
      useClass: PrismaResourceResponsibleRepository,
    },
    // Command Handlers
    ...CommandHandlers,
    // Query Handlers
    ...QueryHandlers,
  ],
  exports: [
    'ResourceRepository',
    'CategoryRepository',
    'ResourceCategoryRepository',
    'MaintenanceTypeRepository',
    'ResourceImportRepository',
    'ResourceResponsibleRepository',
    ResourcesService,
    ResourceCategoryService,
    MaintenanceTypeService,
    ResourceImportService,
    ResourceResponsibleService,
    ...CommandHandlers,
    ...QueryHandlers,
  ],
})
export class ResourcesModule {}
