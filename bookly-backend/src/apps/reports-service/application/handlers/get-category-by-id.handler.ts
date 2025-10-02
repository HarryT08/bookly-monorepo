import { QueryHandler, IQueryHandler } from '@nestjs/cqrs';
import { GetCategoryByIdQuery } from '@apps/reports-service/application/queries/get-category-by-id.query';
import { CategoryService } from '@apps/reports-service/application/services/category.service';
import { CategoryResponseDto } from '@libs/dto/categories/category-response.dto';

@QueryHandler(GetCategoryByIdQuery)
export class GetCategoryByIdHandler implements IQueryHandler<GetCategoryByIdQuery> {
  constructor(private readonly categoryService: CategoryService) {}

  async execute(query: GetCategoryByIdQuery): Promise<CategoryResponseDto> {
    return this.categoryService.findById(query.id);
  }
}
