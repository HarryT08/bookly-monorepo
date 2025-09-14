import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { ResourcesController } from '@apps/resources-service/infrastructure/controllers/resources.controller';
import { PrismaResourceRepository } from '@apps/resources-service/infrastructure/repositories/prisma-resource.repository';
import { PrismaCategoryRepository } from '@apps/resources-service/infrastructure/repositories/prisma-category.repository';
import { ResourcesService } from '@apps/resources-service/application/services/resources.service';
import { LoggingModule } from '@libs/logging/logging.module';
import { CommonModule } from '@libs/common/common.module';
import { EventBusModule } from '@libs/event-bus/event-bus.module';

// Command Handlers
import { CreateResourceHandler } from '@apps/resources-service/application/handlers/create-resource.handler';
import { UpdateResourceHandler } from '@apps/resources-service/application/handlers/update-resource.handler';
import { DeleteResourceHandler } from '@apps/resources-service/application/handlers/delete-resource.handler';

// Query Handlers
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
];

const QueryHandlers = [
  GetResourceHandler,
  GetResourceByCodeHandler,
  GetResourcesHandler,
  GetResourcesWithPaginationHandler,
  SearchResourcesHandler,
  CheckResourceAvailabilityHandler,
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
    // Repositories
    {
      provide: 'ResourceRepository',
      useClass: PrismaResourceRepository,
    },
    {
      provide: 'CategoryRepository',
      useClass: PrismaCategoryRepository,
    },
    // Command Handlers
    ...CommandHandlers,
    // Query Handlers
    ...QueryHandlers,
  ],
  exports: [
    'ResourceRepository',
    'CategoryRepository',
    ...CommandHandlers,
    ...QueryHandlers,
  ],
})
export class ResourcesModule {}
