import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { CreateCategoryCommand } from '../commands/create-category.command';
import { ResourcesCategoryService } from '../services/resources-category.service';
import { CategoryEntity } from '@/libs/common/entities/category.entity';

/**
 * Create Category Handler
 * 
 * Handles the creation of new categories following CQRS pattern.
 * Delegates business logic to CategoryService.
 */
@CommandHandler(CreateCategoryCommand)
export class CreateCategoryHandler implements ICommandHandler<CreateCategoryCommand> {
  constructor(private readonly categoryService: ResourcesCategoryService) {}

  async execute(command: CreateCategoryCommand): Promise<CategoryEntity> {
    return this.categoryService.createCategory(command.createCategoryDto, command.userId);
  }
}
