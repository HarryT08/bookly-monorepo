import { QueryHandler, IQueryHandler } from '@nestjs/cqrs';
import { GetCategoriesQuery } from '@apps/reports-service/application/queries/get-categories.query';
import { CategoryService } from '@apps/reports-service/application/services/category.service';

@QueryHandler(GetCategoriesQuery)
export class GetCategoriesHandler implements IQueryHandler<GetCategoriesQuery> {
  constructor(private readonly categoryService: CategoryService) {}

  async execute(query: GetCategoriesQuery): Promise<any> {
    return this.categoryService.findAll(query.filters, query.pagination);
  }
}
