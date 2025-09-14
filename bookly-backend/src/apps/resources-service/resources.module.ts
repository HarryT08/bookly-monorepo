import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { ResourcesController } from '@apps/resources-service/infrastructure/controllers/resources.controller';
import { PrismaResourceRepository } from '@apps/resources-service/infrastructure/repositories/prisma-resource.repository';
import { PrismaCategoryRepository } from '@apps/resources-service/infrastructure/repositories/prisma-category.repository';
import { PrismaResourceCategoryRepository } from '@apps/resources-service/infrastructure/repositories/prisma-resource-category.repository';
import { ResourcesService } from '@apps/resources-service/application/services/resources.service';
import { ResourceCategoryService } from '@apps/resources-service/application/services/resource-category.service';
import { MaintenanceTypeService } from '@apps/resources-service/application/services/maintenance-type.service';
import { ResourceImportService } from '@apps/resources-service/application/services/resource-import.service';
import { ResourceResponsibleService } from '@apps/resources-service/application/services/resource-responsible.service';
import { PrismaMaintenanceTypeRepository } from '@apps/resources-service/infrastructure/repositories/prisma-maintenance-type.repository';
import { PrismaResourceImportRepository } from '@apps/resources-service/infrastructure/repositories/prisma-resource-import.repository';
import { PrismaResourceResponsibleRepository } from '@apps/resources-service/infrastructure/repositories/prisma-resource-responsible.repository';
import { LoggingModule } from '@libs/logging/logging.module';
import { CommonModule } from '@libs/common/common.module';
import { EventBusModule } from '@libs/event-bus/event-bus.module';

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
  ],
  controllers: [ResourcesController],
  providers: [
    // Services
    ResourcesService,
    ResourceCategoryService,
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
