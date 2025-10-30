import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { ReactivateCategoryCommand } from '../commands/reactivate-category.command';
import { ResourcesCategoryService } from '../services/resources-category.service';
import { CategoryEntity } from '@/libs/common/entities/category.entity';

/**
 * Reactivate Category Handler
 * 
 * Handles the reactivation of categories following CQRS pattern.
 * Delegates business logic to CategoryService.
 */
@CommandHandler(ReactivateCategoryCommand)
export class ReactivateCategoryHandler implements ICommandHandler<ReactivateCategoryCommand> {
  constructor(private readonly categoryService: ResourcesCategoryService) {}

  async execute(command: ReactivateCategoryCommand): Promise<CategoryEntity> {
    return this.categoryService.reactivateCategory(command.id, command.userId);
  }
}
