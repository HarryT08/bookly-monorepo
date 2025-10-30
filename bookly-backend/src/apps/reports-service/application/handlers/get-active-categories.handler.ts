import { QueryHandler, IQueryHandler } from '@nestjs/cqrs';
import { GetActiveCategoriesQuery } from '@apps/reports-service/application/queries/get-active-categories.query';
import { CategoryService } from '@apps/reports-service/application/services/category.service';
import { CategoryResponseDto } from '@libs/dto/categories/category-response.dto';

@QueryHandler(GetActiveCategoriesQuery)
export class GetActiveCategoriesHandler implements IQueryHandler<GetActiveCategoriesQuery> {
  constructor(private readonly categoryService: CategoryService) {}

  async execute(query: GetActiveCategoriesQuery): Promise<CategoryResponseDto[]> {
    return this.categoryService.findActiveCategories();
  }
}
