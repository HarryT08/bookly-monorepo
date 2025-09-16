import { QueryHandler, IQueryHandler } from '@nestjs/cqrs';
import { Logger } from '@nestjs/common';
import { EntityCategoryAssociationDto } from '@libs/dto/categories';
import { GetRoleCategoriesQuery } from '@apps/auth-service/application/queries/role-category/get-role-categories.query';
import { AuthRoleCategoryService } from '@apps/auth-service/application/services/auth-role-category.service';
import { LoggingService } from '@libs/logging/logging.service';

@QueryHandler(GetRoleCategoriesQuery)
export class GetRoleCategoriesHandler implements IQueryHandler<GetRoleCategoriesQuery> {
  private readonly logger = new Logger(GetRoleCategoriesHandler.name);

  constructor(
    private readonly authRoleCategoryService: AuthRoleCategoryService,
    private readonly loggingService: LoggingService,
  ) {}

  async execute(query: GetRoleCategoriesQuery): Promise<EntityCategoryAssociationDto[]> {
    const { roleId } = query;

    this.logger.log(`Executing GetRoleCategoriesQuery for role: ${roleId}`);
    
    this.loggingService.log(
      'Getting categories for role',
      GetRoleCategoriesHandler.name
    );

    try {
      const result = await this.authRoleCategoryService.getRoleCategories(roleId);

      this.loggingService.log(
        'Role categories retrieved successfully',
        GetRoleCategoriesHandler.name
      );

      return result;
    } catch (error) {
      this.loggingService.error(
        'Failed to get role categories',
        error,
        GetRoleCategoriesHandler.name
      );
      throw error;
    }
  }
}
