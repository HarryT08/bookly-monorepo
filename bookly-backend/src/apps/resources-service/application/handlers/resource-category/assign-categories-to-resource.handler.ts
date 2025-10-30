import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Logger } from '@nestjs/common';
import { AssignCategoriesToResourceCommand } from '@apps/resources-service/application/commands/resource-category/assign-categories-to-resource.command';
import { EntityCategoryAssociationDto } from '@libs/dto/categories';
import { ResourcesResourceCategoryService } from '@apps/resources-service/application/services/resources-resource-category.service';
import { LoggingService } from '@libs/logging/logging.service';

@CommandHandler(AssignCategoriesToResourceCommand)
export class AssignCategoriesToResourceHandler implements ICommandHandler<AssignCategoriesToResourceCommand> {
  private readonly logger = new Logger(AssignCategoriesToResourceHandler.name);

  constructor(
    private readonly resourceCategoryService: ResourcesResourceCategoryService,
    private readonly loggingService: LoggingService,
  ) {}

  async execute(command: AssignCategoriesToResourceCommand): Promise<EntityCategoryAssociationDto[]> {
    const { resourceId, dto, assignedBy } = command;

    this.logger.log(`Executing AssignCategoriesToResourceCommand for resource: ${resourceId}`);
    
    this.loggingService.log(
      'Starting categories assignment to resource',
      AssignCategoriesToResourceHandler.name
    );

    try {
      const result = await this.resourceCategoryService.assignCategoriesToResource(
        resourceId,
        dto,
        assignedBy,
      );

      this.loggingService.log(
        'Categories assignment to resource completed successfully',
        AssignCategoriesToResourceHandler.name
      );

      return result;
    } catch (error) {
      this.loggingService.error(
        'Failed to assign categories to resource',
        error,
        AssignCategoriesToResourceHandler.name
      );
      throw error;
    }
  }
}
