import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Logger } from '@nestjs/common';
import { RemoveCategoriesFromUserCommand } from '@apps/auth-service/application/commands/user-category/remove-categories-from-user.command';
import { AuthUserCategoryService } from '@apps/auth-service/application/services/auth-user-category.service';
import { LoggingService } from '@libs/logging/logging.service';

@CommandHandler(RemoveCategoriesFromUserCommand)
export class RemoveCategoriesFromUserHandler implements ICommandHandler<RemoveCategoriesFromUserCommand> {
  private readonly logger = new Logger(RemoveCategoriesFromUserHandler.name);

  constructor(
    private readonly authUserCategoryService: AuthUserCategoryService,
    private readonly loggingService: LoggingService,
  ) {}

  async execute(command: RemoveCategoriesFromUserCommand): Promise<void> {
    const { userId, dto, removedBy } = command;

    this.logger.log(`Executing RemoveCategoriesFromUserCommand for user: ${userId}`);
    
    this.loggingService.log(
      'Starting categories removal from user',
      RemoveCategoriesFromUserHandler.name
    );

    try {
      await this.authUserCategoryService.removeCategoriesFromUser(
        userId,
        dto,
        removedBy,
      );

      this.loggingService.log(
        'Categories removal from user completed successfully',
        RemoveCategoriesFromUserHandler.name
      );
    } catch (error) {
      this.loggingService.error(
        'Failed to remove categories from user',
        error,
        RemoveCategoriesFromUserHandler.name
      );
      throw error;
    }
  }
}
