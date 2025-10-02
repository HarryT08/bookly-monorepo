import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { UpdateCategoryCommand } from '../commands/update-category.command';
import { ResourcesCategoryService } from '../services/resources-category.service';
import { CategoryEntity } from '@/libs/common/entities/category.entity';

/**
 * Update Category Handler
 * 
 * Handles the update of existing categories following CQRS pattern.
 * Delegates business logic to CategoryService.
 */
@CommandHandler(UpdateCategoryCommand)
export class UpdateCategoryHandler implements ICommandHandler<UpdateCategoryCommand> {
  constructor(private readonly categoryService: ResourcesCategoryService) {}

  async execute(command: UpdateCategoryCommand): Promise<CategoryEntity> {
    return this.categoryService.updateCategory(command.id, command.updateCategoryDto, command.userId);
  }
}
