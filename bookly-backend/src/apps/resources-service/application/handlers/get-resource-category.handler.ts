import { QueryHandler, IQueryHandler } from '@nestjs/cqrs';
import { Injectable } from '@nestjs/common';
import { 
  GetResourceCategoriesQuery,
  GetResourcesByCategoryQuery,
  CheckResourceCategoryAssignmentQuery
} from '@apps/resources-service/application/queries/get-resource-category.query';
import { ResourceCategoryService } from '@apps/resources-service/application/services/resource-category.service';
import { ResourceCategoryResponseDto } from '@apps/resources-service/application/dtos/resource-category.dto';
import { LoggingService } from '@libs/logging/logging.service';

@Injectable()
@QueryHandler(GetResourceCategoriesQuery)
export class GetResourceCategoriesHandler implements IQueryHandler<GetResourceCategoriesQuery> {
  constructor(
    private readonly resourceCategoryService: ResourceCategoryService,
    private readonly logger: LoggingService,
  ) {}

  async execute(query: GetResourceCategoriesQuery): Promise<ResourceCategoryResponseDto[]> {
    try {
      this.logger.log(
        'Executing get resource categories query',
        `GetResourceCategoriesHandler - resourceId: ${query.resourceId}`,
        'GetResourceCategoriesHandler'
      );

      return await this.resourceCategoryService.getResourceCategories(query.resourceId);
    } catch (error) {
      this.logger.error(
        `Failed to get resource categories: ${error.message}`,
        error.stack,
        'GetResourceCategoriesHandler'
      );
      throw error;
    }
  }
}

@Injectable()
@QueryHandler(GetResourcesByCategoryQuery)
export class GetResourcesByCategoryHandler implements IQueryHandler<GetResourcesByCategoryQuery> {
  constructor(
    private readonly resourceCategoryService: ResourceCategoryService,
    private readonly logger: LoggingService,
  ) {}

  async execute(query: GetResourcesByCategoryQuery): Promise<{
    associations: ResourceCategoryResponseDto[]; 
    total: number; 
    page: number; 
    limit: number; 
  }> {
    try {
      this.logger.log(
        'Executing get resources by category query',
        `GetResourcesByCategoryHandler - categoryId: ${query.categoryId}`,
        'GetResourcesByCategoryHandler'
      );

      return await this.resourceCategoryService.getResourcesByCategory(
        query.categoryId, 
        query.page, 
        query.limit
      );
    } catch (error) {
      this.logger.error(
        `Failed to get resources by category: ${error.message}`,
        error.stack,
        'GetResourcesByCategoryHandler'
      );
      throw error;
    }
  }
}


@Injectable()
@QueryHandler(CheckResourceCategoryAssignmentQuery)
export class CheckResourceCategoryAssignmentHandler implements IQueryHandler<CheckResourceCategoryAssignmentQuery> {
  constructor(
    private readonly resourceCategoryService: ResourceCategoryService,
    private readonly logger: LoggingService,
  ) {}

  async execute(query: CheckResourceCategoryAssignmentQuery): Promise<{ isAssigned: boolean }> {
    try {
      this.logger.log(
        'Executing check resource category assignment query',
        `CheckResourceCategoryAssignmentHandler - resourceId: ${query.resourceId}, categoryId: ${query.categoryId}`,
        'CheckResourceCategoryAssignmentHandler'
      );

      const isAssigned = await this.resourceCategoryService.isResourceAssignedToCategory(
        query.resourceId, 
        query.categoryId
      );
      return { isAssigned };
    } catch (error) {
      this.logger.error(
        `Failed to check resource category assignment: ${error.message}`,
        error.stack,
        'CheckResourceCategoryAssignmentHandler'
      );
      throw error;
    }
  }
}

