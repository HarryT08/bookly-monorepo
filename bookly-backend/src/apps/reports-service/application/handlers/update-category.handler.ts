import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { UpdateCategoryCommand } from '@apps/reports-service/application/commands/update-category.command';
import { CategoryService } from '@apps/reports-service/application/services/category.service';
import { CategoryResponseDto } from '@libs/dto/categories';

@CommandHandler(UpdateCategoryCommand)
export class UpdateCategoryHandler implements ICommandHandler<UpdateCategoryCommand> {
  constructor(private readonly categoryService: CategoryService) {}

  async execute(command: UpdateCategoryCommand): Promise<CategoryResponseDto> {
    return this.categoryService.update(command.id, command.updateCategoryDto);
  }
}
