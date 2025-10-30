import { QueryHandler, IQueryHandler } from '@nestjs/cqrs';
import { Logger } from '@nestjs/common';
import { EntityCategoryAssociationDto } from '@libs/dto/categories';
import { GetUserCategoriesQuery } from '@apps/auth-service/application/queries/user-category/get-user-categories.query';
import { AuthUserCategoryService } from '@apps/auth-service/application/services/auth-user-category.service';
import { LoggingService } from '@libs/logging/logging.service';

@QueryHandler(GetUserCategoriesQuery)
export class GetUserCategoriesHandler implements IQueryHandler<GetUserCategoriesQuery> {
  private readonly logger = new Logger(GetUserCategoriesHandler.name);

  constructor(
    private readonly authUserCategoryService: AuthUserCategoryService,
    private readonly loggingService: LoggingService,
  ) {}

  async execute(query: GetUserCategoriesQuery): Promise<EntityCategoryAssociationDto[]> {
    const { userId } = query;

    this.logger.log(`Executing GetUserCategoriesQuery for user: ${userId}`);
    
    this.loggingService.log(
      'Getting categories for user',
      GetUserCategoriesHandler.name
    );

    try {
      const result = await this.authUserCategoryService.getUserCategories(userId);

      this.loggingService.log(
        'User categories retrieved successfully',
        GetUserCategoriesHandler.name
      );

      return result;
    } catch (error) {
      this.loggingService.error(
        'Failed to get user categories',
        error,
        GetUserCategoriesHandler.name
      );
      throw error;
    }
  }
}
