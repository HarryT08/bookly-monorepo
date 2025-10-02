import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Logger } from '@nestjs/common';
import { RemoveCategoriesFromProgramCommand } from '@apps/resources-service/application/commands/program-category/remove-categories-from-program.command';
import { ResourcesProgramCategoryService } from '@apps/resources-service/application/services/resources-program-category.service';
import { LoggingService } from '@libs/logging/logging.service';

@CommandHandler(RemoveCategoriesFromProgramCommand)
export class RemoveCategoriesFromProgramHandler implements ICommandHandler<RemoveCategoriesFromProgramCommand> {
  private readonly logger = new Logger(RemoveCategoriesFromProgramHandler.name);

  constructor(
    private readonly programCategoryService: ResourcesProgramCategoryService,
    private readonly loggingService: LoggingService,
  ) {}

  async execute(command: RemoveCategoriesFromProgramCommand): Promise<void> {
    const { programId, dto, removedBy } = command;

    this.logger.log(`Executing RemoveCategoriesFromProgramCommand for program: ${programId}`);
    
    this.loggingService.log(
      'Starting categories removal from program',
      RemoveCategoriesFromProgramHandler.name
    );

    try {
      await this.programCategoryService.removeCategoriesFromProgram(programId, dto, removedBy);

      this.loggingService.log(
        'Categories removed from program successfully',
        RemoveCategoriesFromProgramHandler.name
      );
    } catch (error) {
      this.loggingService.error(
        'Failed to remove categories from program',
        error,
        RemoveCategoriesFromProgramHandler.name
      );
      throw error;
    }
  }
}
