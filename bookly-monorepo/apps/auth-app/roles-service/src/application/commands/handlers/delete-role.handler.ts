import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { NotFoundException, Logger } from '@nestjs/common';

import { DeleteRoleCommand } from '../impl/delete-role.command';
import { Role } from '../../../domain/entities/role.entity';

@CommandHandler(DeleteRoleCommand)
export class DeleteRoleHandler implements ICommandHandler<DeleteRoleCommand> {
  private readonly logger = new Logger(DeleteRoleHandler.name);

  constructor(
    @InjectModel(Role.name) private roleModel: Model<Role>,
  ) {}

  async execute(command: DeleteRoleCommand) {
    const { roleId } = command;
    
    this.logger.log(`Deleting role with ID: ${roleId}`);
    
    // Check if role exists
    const role = await this.roleModel.findById(roleId);
    if (!role) {
      throw new NotFoundException(`Role with ID ${roleId} not found`);
    }
    
    // Delete the role
    await this.roleModel.findByIdAndDelete(roleId);
    
    this.logger.log(`Role deleted successfully with ID: ${roleId}`);
    
    return { id: roleId, message: 'Role deleted successfully' };
  }
}
