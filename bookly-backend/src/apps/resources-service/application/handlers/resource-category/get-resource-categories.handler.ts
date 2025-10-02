import { QueryHandler, IQueryHandler } from '@nestjs/cqrs';
import { Logger } from '@nestjs/common';
import { EntityCategoryAssociationDto } from '@libs/dto/categories';
import { GetResourceCategoriesQuery } from '@apps/resources-service/application/queries/resource-category/get-resource-categories.query';
import { ResourcesResourceCategoryService } from '@apps/resources-service/application/services/resources-resource-category.service';
import { LoggingService } from '@libs/logging/logging.service';

@QueryHandler(GetResourceCategoriesQuery)
export class GetResourceCategoriesHandler implements IQueryHandler<GetResourceCategoriesQuery> {
  private readonly logger = new Logger(GetResourceCategoriesHandler.name);

  constructor(
    private readonly resourceCategoryService: ResourcesResourceCategoryService,
    private readonly loggingService: LoggingService,
  ) {}

  async execute(query: GetResourceCategoriesQuery): Promise<EntityCategoryAssociationDto[]> {
    const { resourceId } = query;

    this.logger.log(`Executing GetResourceCategoriesQuery for resource: ${resourceId}`);
    
    this.loggingService.log(
      'Getting categories for resource',
      GetResourceCategoriesHandler.name
    );

    try {
      const result = await this.resourceCategoryService.getResourceCategories(resourceId);

      this.loggingService.log(
        'Resource categories retrieved successfully',
        GetResourceCategoriesHandler.name
      );

      return result;
    } catch (error) {
      this.loggingService.error(
        'Failed to get resource categories',
        error,
        GetResourceCategoriesHandler.name
      );
      throw error;
    }
  }
}
