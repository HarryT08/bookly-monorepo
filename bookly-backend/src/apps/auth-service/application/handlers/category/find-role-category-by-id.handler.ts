import { QueryHandler, IQueryHandler } from '@nestjs/cqrs';
import { FindRoleCategoryByIdQuery } from '../../queries/category/find-category-by-id.query';
import { RoleCategoryService } from '../../services/role-category.service';
import { CategoryEntity } from '@libs/common/entities/category.entity';
import { LoggingService } from '@libs/logging/logging.service';

@QueryHandler(FindRoleCategoryByIdQuery)
export class FindCategoryByIdHandler implements IQueryHandler<FindRoleCategoryByIdQuery> {
  constructor(
    private readonly categoryService: RoleCategoryService,
    private readonly loggingService: LoggingService,
  ) {}

  async execute(query: FindRoleCategoryByIdQuery): Promise<CategoryEntity> {
    this.loggingService.log('Executing FindCategoryByIdQuery', {
      categoryId: query.id
    }, 'FindCategoryByIdHandler');

    try {
      const category = await this.categoryService.findRoleCategoryById(query.id);
      
      this.loggingService.log('Category found successfully', {
        categoryId: category.id,
        categoryName: category.name,
        categoryCode: category.code
      }, 'FindCategoryByIdHandler');

      return category;
    } catch (error) {
      this.loggingService.error('Failed to find category by ID', error, 'FindCategoryByIdHandler');
      throw error;
    }
  }
}
