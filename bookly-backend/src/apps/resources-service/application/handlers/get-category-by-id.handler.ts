import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { GetCategoryByIdQuery } from '../queries/get-category-by-id.query';
import { ResourcesCategoryService } from '../services/resources-category.service';
import { CategoryEntity } from '@/libs/common/entities/category.entity';

/**
 * Get Category By ID Handler
 * 
 * Handles the retrieval of a specific category by ID following CQRS pattern.
 * Delegates business logic to CategoryService.
 */
@QueryHandler(GetCategoryByIdQuery)
export class GetCategoryByIdHandler implements IQueryHandler<GetCategoryByIdQuery> {
  constructor(private readonly categoryService: ResourcesCategoryService) {}

  async execute(query: GetCategoryByIdQuery): Promise<CategoryEntity> {
    return this.categoryService.findCategoryById(query.id);
  }
}
