import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { DeleteCategoryCommand } from '@apps/reports-service/application/commands/delete-category.command';
import { CategoryService } from '@apps/reports-service/application/services/category.service';
import { CategoryResponseDto } from '@libs/dto/categories';

@CommandHandler(DeleteCategoryCommand)
export class DeleteCategoryHandler implements ICommandHandler<DeleteCategoryCommand> {
  constructor(private readonly categoryService: CategoryService) {}

  async execute(command: DeleteCategoryCommand): Promise<CategoryResponseDto> {
    return this.categoryService.deactivate(command.id);
  }
}
