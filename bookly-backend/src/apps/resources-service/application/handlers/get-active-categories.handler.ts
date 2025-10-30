import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { GetActiveCategoriesQuery } from '../queries/get-active-categories.query';
import { ResourcesCategoryService } from '../services/resources-category.service';
import { CategoryEntity } from '@/libs/common/entities/category.entity';

/**
 * Get Active Categories Handler
 * 
 * Handles the retrieval of all active categories following CQRS pattern.
 * Delegates business logic to CategoryService.
 */
@QueryHandler(GetActiveCategoriesQuery)
export class GetActiveCategoriesHandler implements IQueryHandler<GetActiveCategoriesQuery> {
  constructor(private readonly categoryService: ResourcesCategoryService) {}

  async execute(query: GetActiveCategoriesQuery): Promise<CategoryEntity[]> {
    return this.categoryService.findActiveCategories();
  }
}
