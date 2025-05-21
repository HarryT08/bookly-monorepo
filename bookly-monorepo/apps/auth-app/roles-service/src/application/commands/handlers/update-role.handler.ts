import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { NotFoundException, Logger } from '@nestjs/common';

import { UpdateRoleCommand } from '../impl/update-role.command';
import { Role } from '../../../domain/entities/role.entity';

@CommandHandler(UpdateRoleCommand)
export class UpdateRoleHandler implements ICommandHandler<UpdateRoleCommand> {
  private readonly logger = new Logger(UpdateRoleHandler.name);

  constructor(
    @InjectModel(Role.name) private roleModel: Model<Role>,
  ) {}

  async execute(command: UpdateRoleCommand) {
    const { roleId, roleData } = command;
    
    this.logger.log(`Updating role with ID: ${roleId}`);
    
    // Check if role exists
    const role = await this.roleModel.findById(roleId);
    if (!role) {
      throw new NotFoundException(`Role with ID ${roleId} not found`);
    }
    
    // Update the role
    Object.assign(role, roleData);
    await role.save();
    
    this.logger.log(`Role updated successfully with ID: ${roleId}`);
    
    return role.toJSON();
  }
}
