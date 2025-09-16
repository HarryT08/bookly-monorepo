import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { GetDefaultCategoriesQuery } from '../queries/get-default-categories.query';
import { ResourcesCategoryService } from '../services/resources-category.service';
import { CategoryEntity } from '@/libs/common/entities/category.entity';

/**
 * Get Default Categories Handler
 * 
 * Handles the retrieval of all default system categories following CQRS pattern.
 * Delegates business logic to CategoryService.
 */
@QueryHandler(GetDefaultCategoriesQuery)
export class GetDefaultCategoriesHandler implements IQueryHandler<GetDefaultCategoriesQuery> {
  constructor(private readonly categoryService: ResourcesCategoryService) {}

  async execute(query: GetDefaultCategoriesQuery): Promise<CategoryEntity[]> {
    return this.categoryService.findDefaultCategories();
  }
}
