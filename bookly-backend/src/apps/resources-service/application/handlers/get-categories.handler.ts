import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { GetCategoriesQuery } from '../queries/get-categories.query';
import { ResourcesCategoryService, CategoryServiceResponse } from '../services/resources-category.service';

/**
 * Get Categories Handler
 * 
 * Handles the retrieval of categories with pagination and filters following CQRS pattern.
 * Delegates business logic to CategoryService.
 */
@QueryHandler(GetCategoriesQuery)
export class GetCategoriesHandler implements IQueryHandler<GetCategoriesQuery> {
  constructor(private readonly categoryService: ResourcesCategoryService) {}

  async execute(query: GetCategoriesQuery): Promise<CategoryServiceResponse> {
    return this.categoryService.findCategories(query.filters);
  }
}
