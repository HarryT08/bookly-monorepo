import { QueryHandler, IQueryHandler } from '@nestjs/cqrs';
import { Logger } from '@nestjs/common';
import { EntityCategoryAssociationDto } from '@libs/dto/categories';
import { GetProgramCategoriesQuery } from '@apps/resources-service/application/queries/program-category/get-program-categories.query';
import { ResourcesProgramCategoryService } from '@apps/resources-service/application/services/resources-program-category.service';
import { LoggingService } from '@libs/logging/logging.service';

@QueryHandler(GetProgramCategoriesQuery)
export class GetProgramCategoriesHandler implements IQueryHandler<GetProgramCategoriesQuery> {
  private readonly logger = new Logger(GetProgramCategoriesHandler.name);

  constructor(
    private readonly programCategoryService: ResourcesProgramCategoryService,
    private readonly loggingService: LoggingService,
  ) {}

  async execute(query: GetProgramCategoriesQuery): Promise<EntityCategoryAssociationDto[]> {
    const { programId } = query;

    this.logger.log(`Executing GetProgramCategoriesQuery for program: ${programId}`);
    
    this.loggingService.log(
      'Getting categories for program',
      GetProgramCategoriesHandler.name
    );

    try {
      const result = await this.programCategoryService.getProgramCategories(programId);

      this.loggingService.log(
        'Program categories retrieved successfully',
        GetProgramCategoriesHandler.name
      );

      return result;
    } catch (error) {
      this.loggingService.error(
        'Failed to get program categories',
        error,
        GetProgramCategoriesHandler.name
      );
      throw error;
    }
  }
}
