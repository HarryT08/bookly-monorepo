import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { DeleteRoleCategoryCommand } from '../../commands/category/delete-category.command';
import { RoleCategoryService } from '../../services/role-category.service';
import { LoggingService } from '@libs/logging/logging.service';

@CommandHandler(DeleteRoleCategoryCommand)
export class DeleteCategoryHandler implements ICommandHandler<DeleteRoleCategoryCommand> {
  constructor(
    private readonly categoryService: RoleCategoryService,
    private readonly loggingService: LoggingService,
  ) {}

  async execute(command: DeleteRoleCategoryCommand): Promise<void> {
    this.loggingService.log('Executing DeleteCategoryCommand', {
      categoryId: command.id
    }, 'DeleteCategoryHandler');

    try {
      await this.categoryService.deleteRoleCategory(command.id);
      
      this.loggingService.log('Category deleted successfully', {
        categoryId: command.id
      }, 'DeleteCategoryHandler');
    } catch (error) {
      this.loggingService.error('Failed to delete category', error, 'DeleteCategoryHandler');
      throw error;
    }
  }
}
