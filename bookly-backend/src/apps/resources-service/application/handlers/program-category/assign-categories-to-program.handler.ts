import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Logger } from '@nestjs/common';
import { AssignCategoriesToProgramCommand } from '@apps/resources-service/application/commands/program-category/assign-categories-to-program.command';
import { EntityCategoryAssociationDto } from '@libs/dto/categories';
import { ResourcesProgramCategoryService } from '@apps/resources-service/application/services/resources-program-category.service';
import { LoggingService } from '@libs/logging/logging.service';

@CommandHandler(AssignCategoriesToProgramCommand)
export class AssignCategoriesToProgramHandler implements ICommandHandler<AssignCategoriesToProgramCommand> {
  private readonly logger = new Logger(AssignCategoriesToProgramHandler.name);

  constructor(
    private readonly programCategoryService: ResourcesProgramCategoryService,
    private readonly loggingService: LoggingService,
  ) {}

  async execute(command: AssignCategoriesToProgramCommand): Promise<EntityCategoryAssociationDto[]> {
    const { programId, dto, assignedBy } = command;

    this.logger.log(`Executing AssignCategoriesToProgramCommand for program: ${programId}`);
    
    this.loggingService.log(
      'Starting categories assignment to program',
      AssignCategoriesToProgramHandler.name
    );

    try {
      const result = await this.programCategoryService.assignCategoriesToProgram(programId, dto, assignedBy);

      this.loggingService.log(
        'Categories assigned to program successfully',
        AssignCategoriesToProgramHandler.name
      );

      return result;
    } catch (error) {
      this.loggingService.error(
        'Failed to assign categories to program',
        error,
        AssignCategoriesToProgramHandler.name
      );
      throw error;
    }
  }
}
