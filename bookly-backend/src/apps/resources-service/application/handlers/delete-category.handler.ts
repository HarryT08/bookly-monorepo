import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { DeleteCategoryCommand } from '../commands/delete-category.command';
import { ResourcesCategoryService } from '../services/resources-category.service';

/**
 * Delete Category Handler
 * 
 * Handles the deactivation of categories following CQRS pattern.
 * Delegates business logic to CategoryService.
 */
@CommandHandler(DeleteCategoryCommand)
export class DeleteCategoryHandler implements ICommandHandler<DeleteCategoryCommand> {
  constructor(private readonly categoryService: ResourcesCategoryService) {}

  async execute(command: DeleteCategoryCommand): Promise<void> {
    return this.categoryService.deleteCategory(command.id, command.userId);
  }
}
