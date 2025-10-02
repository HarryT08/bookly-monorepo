import { QueryHandler, IQueryHandler } from '@nestjs/cqrs';
import { FindAllRoleCategoriesQuery } from '../../queries/category/find-all-categories.query';
import { RoleCategoryService } from '../../services/role-category.service';
import { LoggingService } from '@libs/logging/logging.service';

@QueryHandler(FindAllRoleCategoriesQuery)
export class FindAllCategoriesHandler implements IQueryHandler<FindAllRoleCategoriesQuery> {
  constructor(
    private readonly categoryService: RoleCategoryService,
    private readonly loggingService: LoggingService,
  ) {}

  async execute(query: FindAllRoleCategoriesQuery) {
    this.loggingService.log('Executing FindAllCategoriesQuery', {
      page: query.page,
      limit: query.limit,
      search: query.search,
      isActive: query.isActive
    }, 'FindAllCategoriesHandler');

    try {
      const result = await this.categoryService.findAll({
        page: query.page || 1,
        limit: query.limit || 10,
        search: query.search,
        isActive: query.isActive
      });
      
      this.loggingService.log('Categories retrieved successfully', {
        count: result.data.length,
        total: result.pagination.total,
        page: result.pagination.page
      }, 'FindAllCategoriesHandler');

      return result;
    } catch (error) {
      this.loggingService.error('Failed to find categories', error, 'FindAllCategoriesHandler');
      throw error;
    }
  }
}
