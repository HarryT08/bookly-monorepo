import { QueryHandler, IQueryHandler } from '@nestjs/cqrs';
import { FindDefaultRoleCategoriesQuery } from '../../queries/category/find-default-categories.query';
import { RoleCategoryService } from '../../services/role-category.service';
import { CategoryEntity } from '@libs/common/entities/category.entity';
import { LoggingService } from '@libs/logging/logging.service';

@QueryHandler(FindDefaultRoleCategoriesQuery)
export class FindDefaultCategoriesHandler implements IQueryHandler<FindDefaultRoleCategoriesQuery> {
  constructor(
    private readonly categoryService: RoleCategoryService,
    private readonly loggingService: LoggingService,
  ) {}

  async execute(query: FindDefaultRoleCategoriesQuery): Promise<CategoryEntity[]> {
    this.loggingService.log('Executing FindDefaultCategoriesQuery', {}, 'FindDefaultCategoriesHandler');

    try {
      const categories = await this.categoryService.findRoleCategoryDefaults();
      
      this.loggingService.log('Default categories retrieved successfully', {
        count: categories.length,
        codes: categories.map(cat => cat.code)
      }, 'FindDefaultCategoriesHandler');

      return categories;
    } catch (error) {
      this.loggingService.error('Failed to find default categories', error, 'FindDefaultCategoriesHandler');
      throw error;
    }
  }
}
