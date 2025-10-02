import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { ReactivateCategoryCommand } from '@apps/reports-service/application/commands/reactivate-category.command';
import { CategoryService } from '@apps/reports-service/application/services/category.service';
import { CategoryResponseDto } from '@libs/dto/categories';

@CommandHandler(ReactivateCategoryCommand)
export class ReactivateCategoryHandler implements ICommandHandler<ReactivateCategoryCommand> {
  constructor(private readonly categoryService: CategoryService) {}

  async execute(command: ReactivateCategoryCommand): Promise<CategoryResponseDto> {
    return this.categoryService.reactivate(command.id);
  }
}
