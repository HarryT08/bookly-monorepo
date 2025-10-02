import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Logger } from '@nestjs/common';
import { AssignCategoriesToRoleCommand } from '@apps/auth-service/application/commands/role-category/assign-categories-to-role.command';
import { EntityCategoryAssociationDto } from '@libs/dto/categories';
import { AuthRoleCategoryService } from '@apps/auth-service/application/services/auth-role-category.service';
import { LoggingService } from '@libs/logging/logging.service';

@CommandHandler(AssignCategoriesToRoleCommand)
export class AssignCategoriesToRoleHandler implements ICommandHandler<AssignCategoriesToRoleCommand> {
  private readonly logger = new Logger(AssignCategoriesToRoleHandler.name);

  constructor(
    private readonly authRoleCategoryService: AuthRoleCategoryService,
    private readonly loggingService: LoggingService,
  ) {}

  async execute(command: AssignCategoriesToRoleCommand): Promise<EntityCategoryAssociationDto[]> {
    const { roleId, dto, assignedBy } = command;

    this.logger.log(`Executing AssignCategoriesToRoleCommand for role: ${roleId}`);
    
    this.loggingService.log(
      'Starting categories assignment to role',
      AssignCategoriesToRoleHandler.name
    );

    try {
      const result = await this.authRoleCategoryService.assignCategoriesToRole(
        roleId,
        dto,
        assignedBy,
      );

      this.loggingService.log(
        'Categories assigned to role successfully',
        AssignCategoriesToRoleHandler.name
      );

      return result;
    } catch (error) {
      this.loggingService.error(
        'Failed to assign categories to role',
        error,
        AssignCategoriesToRoleHandler.name
      );
      throw error;
    }
  }
}
