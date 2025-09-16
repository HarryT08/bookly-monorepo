import { QueryHandler, IQueryHandler } from '@nestjs/cqrs';
import { GetDefaultCategoriesQuery } from '@apps/reports-service/application/queries/get-default-categories.query';
import { CategoryService } from '@apps/reports-service/application/services/category.service';
import { CategoryResponseDto } from '@libs/dto/categories/category-response.dto';

@QueryHandler(GetDefaultCategoriesQuery)
export class GetDefaultCategoriesHandler implements IQueryHandler<GetDefaultCategoriesQuery> {
  constructor(private readonly categoryService: CategoryService) {}

  async execute(query: GetDefaultCategoriesQuery): Promise<CategoryResponseDto[]> {
    return this.categoryService.findDefaultCategories();
  }
}
