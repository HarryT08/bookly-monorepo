import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import { CreateRoleCategoryCommand } from '../../commands/category/create-category.command';
import { RoleCategoryService } from '../../services/role-category.service';
import { CategoryEntity } from '@libs/common/entities/category.entity';
import { LoggingService } from '@libs/logging/logging.service';

@CommandHandler(CreateRoleCategoryCommand)
export class CreateCategoryHandler implements ICommandHandler<CreateRoleCategoryCommand> {
  constructor(
    private readonly categoryService: RoleCategoryService,
    private readonly loggingService: LoggingService,
  ) {}

  async execute(command: CreateRoleCategoryCommand): Promise<CategoryEntity> {
    this.loggingService.log('Executing CreateCategoryCommand', {
      categoryName: command.categoryData.name,
      categoryCode: command.categoryData.code
    }, 'CreateCategoryHandler');

    try {
      const category = await this.categoryService.createRoleCategory(command.categoryData);
      
      this.loggingService.log('Category created successfully', {
        categoryId: category.id,
        categoryName: category.name,
        categoryCode: category.code
      }, 'CreateCategoryHandler');

      return category;
    } catch (error) {
      this.loggingService.error('Failed to create category', error, 'CreateCategoryHandler');
      throw error;
    }
  }
}
