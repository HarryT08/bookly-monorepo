import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Injectable } from '@nestjs/common';
import { 
  ReplaceResourceCategoriesCommand,
  RemoveCategoryFromResourceCommand 
} from '@apps/resources-service/application/commands/update-resource-category.command';
import { ResourceCategoryService } from '@apps/resources-service/application/services/resource-category.service';
import { ResourceCategoryResponseDto } from '@apps/resources-service/application/dtos/resource-category.dto';
import { LoggingService } from '@libs/logging/logging.service';

@Injectable()
@CommandHandler(ReplaceResourceCategoriesCommand)
export class ReplaceResourceCategoriesHandler implements ICommandHandler<ReplaceResourceCategoriesCommand> {
  constructor(
    private readonly resourceCategoryService: ResourceCategoryService,
    private readonly logger: LoggingService,
  ) {}

  async execute(command: ReplaceResourceCategoriesCommand): Promise<ResourceCategoryResponseDto[]> {
    try {
      this.logger.log(
        'Executing replace resource categories command',
        `ReplaceResourceCategoriesHandler - resourceId: ${command.resourceId}`,
        'ReplaceResourceCategoriesHandler'
      );

      const result = await this.resourceCategoryService.replaceResourceCategories(
        command.resourceId, 
        command.categoryIds, 
        command.assignedBy
      );
      return result;
    } catch (error) {
      this.logger.error(
        `Failed to replace resource categories: ${error.message}`,
        error.stack,
        'ReplaceResourceCategoriesHandler'
      );
      throw error;
    }
  }
}

@Injectable()
@CommandHandler(RemoveCategoryFromResourceCommand)
export class RemoveCategoryFromResourceHandler implements ICommandHandler<RemoveCategoryFromResourceCommand> {
  constructor(
    private readonly resourceCategoryService: ResourceCategoryService,
    private readonly logger: LoggingService,
  ) {}

  async execute(command: RemoveCategoryFromResourceCommand): Promise<void> {
    try {
      this.logger.log(
        'Executing remove category from resource command',
        `RemoveCategoryFromResourceHandler - resourceId: ${command.resourceId}, categoryId: ${command.categoryId}`,
        'RemoveCategoryFromResourceHandler'
      );

      await this.resourceCategoryService.removeCategoryFromResource(
        command.resourceId, 
        command.categoryId
      );
    } catch (error) {
      this.logger.error(
        `Failed to remove category from resource: ${error.message}`,
        error.stack,
        'RemoveCategoryFromResourceHandler'
      );
      throw error;
    }
  }
}
