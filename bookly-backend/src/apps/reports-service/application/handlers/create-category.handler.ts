import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { CreateCategoryCommand } from '@apps/reports-service/application/commands/create-category.command';
import { CategoryService } from '@apps/reports-service/application/services/category.service';
import { CategoryResponseDto } from '@libs/dto/categories';

@CommandHandler(CreateCategoryCommand)
export class CreateCategoryHandler implements ICommandHandler<CreateCategoryCommand> {
  constructor(private readonly categoryService: CategoryService) {}

  async execute(command: CreateCategoryCommand): Promise<CategoryResponseDto> {
    return this.categoryService.create(command.createCategoryDto);
  }
}
