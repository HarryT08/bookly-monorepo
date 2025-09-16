import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Logger } from '@nestjs/common';
import { RemoveCategoriesFromRoleCommand } from '@apps/auth-service/application/commands/role-category/remove-categories-from-role.command';
import { AuthRoleCategoryService } from '@apps/auth-service/application/services/auth-role-category.service';
import { LoggingService } from '@libs/logging/logging.service';

@CommandHandler(RemoveCategoriesFromRoleCommand)
export class RemoveCategoriesFromRoleHandler implements ICommandHandler<RemoveCategoriesFromRoleCommand> {
  private readonly logger = new Logger(RemoveCategoriesFromRoleHandler.name);

  constructor(
    private readonly authRoleCategoryService: AuthRoleCategoryService,
    private readonly loggingService: LoggingService,
  ) {}

  async execute(command: RemoveCategoriesFromRoleCommand): Promise<void> {
    const { roleId, dto, removedBy } = command;

    this.logger.log(`Executing RemoveCategoriesFromRoleCommand for role: ${roleId}`);
    
    this.loggingService.log(
      'Starting categories removal from role',
      RemoveCategoriesFromRoleHandler.name
    );

    try {
      await this.authRoleCategoryService.removeCategoriesFromRole(
        roleId,
        dto,
        removedBy,
      );

      this.loggingService.log(
        'Categories removed from role successfully',
        RemoveCategoriesFromRoleHandler.name
      );
    } catch (error) {
      this.loggingService.error(
        'Failed to remove categories from role',
        error,
        RemoveCategoriesFromRoleHandler.name
      );
      throw error;
    }
  }
}
