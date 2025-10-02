import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Logger } from '@nestjs/common';
import { RemoveCategoriesFromResourceCommand } from '@apps/resources-service/application/commands/resource-category/remove-categories-from-resource.command';
import { ResourcesResourceCategoryService } from '@apps/resources-service/application/services/resources-resource-category.service';
import { LoggingService } from '@libs/logging/logging.service';

@CommandHandler(RemoveCategoriesFromResourceCommand)
export class RemoveCategoriesFromResourceHandler implements ICommandHandler<RemoveCategoriesFromResourceCommand> {
  private readonly logger = new Logger(RemoveCategoriesFromResourceHandler.name);

  constructor(
    private readonly resourceCategoryService: ResourcesResourceCategoryService,
    private readonly loggingService: LoggingService,
  ) {}

  async execute(command: RemoveCategoriesFromResourceCommand): Promise<void> {
    const { resourceId, dto, removedBy } = command;

    this.logger.log(`Executing RemoveCategoriesFromResourceCommand for resource: ${resourceId}`);
    
    this.loggingService.log(
      'Starting categories removal from resource',
      RemoveCategoriesFromResourceHandler.name
    );

    try {
      await this.resourceCategoryService.removeCategoriesFromResource(
        resourceId,
        dto,
        removedBy,
      );

      this.loggingService.log(
        'Categories removal from resource completed successfully',
        RemoveCategoriesFromResourceHandler.name
      );
    } catch (error) {
      this.loggingService.error(
        'Failed to remove categories from resource',
        error,
        RemoveCategoriesFromResourceHandler.name
      );
      throw error;
    }
  }
}
