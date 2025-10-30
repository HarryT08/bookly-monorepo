import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { UpdateRoleCategoryCommand } from '../../commands/category/update-category.command';
import { RoleCategoryService } from '../../services/role-category.service';
import { CategoryEntity } from '@libs/common/entities/category.entity';
import { LoggingService } from '@libs/logging/logging.service';

@CommandHandler(UpdateRoleCategoryCommand)
export class UpdateCategoryHandler implements ICommandHandler<UpdateRoleCategoryCommand> {
  constructor(
    private readonly categoryService: RoleCategoryService,
    private readonly loggingService: LoggingService,
  ) {}

  async execute(command: UpdateRoleCategoryCommand): Promise<CategoryEntity> {
    this.loggingService.log('Executing UpdateCategoryCommand', {
      categoryId: command.id,
      updateData: command.categoryData
    }, 'UpdateCategoryHandler');

    try {
      const category = await this.categoryService.updateRoleCategory(command.id, command.categoryData);
      
      this.loggingService.log('Category updated successfully', {
        categoryId: category.id,
        categoryName: category.name,
        categoryCode: category.code
      }, 'UpdateCategoryHandler');

      return category;
    } catch (error) {
      this.loggingService.error('Failed to update category', error, 'UpdateCategoryHandler');
      throw error;
    }
  }
}
