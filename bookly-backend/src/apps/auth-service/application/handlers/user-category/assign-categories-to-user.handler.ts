import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Logger } from '@nestjs/common';
import { AssignCategoriesToUserCommand } from '@apps/auth-service/application/commands/user-category/assign-categories-to-user.command';
import { EntityCategoryAssociationDto } from '@libs/dto/categories';
import { AuthUserCategoryService } from '@apps/auth-service/application/services/auth-user-category.service';
import { LoggingService } from '@libs/logging/logging.service';

@CommandHandler(AssignCategoriesToUserCommand)
export class AssignCategoriesToUserHandler implements ICommandHandler<AssignCategoriesToUserCommand> {
  private readonly logger = new Logger(AssignCategoriesToUserHandler.name);

  constructor(
    private readonly authUserCategoryService: AuthUserCategoryService,
    private readonly loggingService: LoggingService,
  ) {}

  async execute(command: AssignCategoriesToUserCommand): Promise<EntityCategoryAssociationDto[]> {
    const { userId, dto, assignedBy } = command;

    this.logger.log(`Executing AssignCategoriesToUserCommand for user: ${userId}`);
    
    this.loggingService.log(
      'Starting categories assignment to user',
      AssignCategoriesToUserHandler.name
    );

    try {
      const result = await this.authUserCategoryService.assignCategoriesToUser(
        userId,
        dto,
        assignedBy,
      );

      this.loggingService.log(
        'Categories assignment to user completed successfully',
        AssignCategoriesToUserHandler.name
      );

      return result;
    } catch (error) {
      this.loggingService.error(
        'Failed to assign categories to user',
        error,
        AssignCategoriesToUserHandler.name
      );
      throw error;
    }
  }
}
