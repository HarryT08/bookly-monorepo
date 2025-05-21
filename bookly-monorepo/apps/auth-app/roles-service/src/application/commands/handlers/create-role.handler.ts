import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { ConflictException, Logger } from '@nestjs/common';

import { CreateRoleCommand } from '../impl/create-role.command';
import { Role } from '../../../domain/entities/role.entity';

@CommandHandler(CreateRoleCommand)
export class CreateRoleHandler implements ICommandHandler<CreateRoleCommand> {
  private readonly logger = new Logger(CreateRoleHandler.name);

  constructor(
    @InjectModel(Role.name) private roleModel: Model<Role>,
  ) {}

  async execute(command: CreateRoleCommand) {
    const { roleData } = command;
    
    this.logger.log(`Creating role with name: ${roleData.name}`);
    
    // Check if role with this name already exists
    const existingRole = await this.roleModel.findOne({ name: roleData.name });
    if (existingRole) {
      throw new ConflictException(`Role with name ${roleData.name} already exists`);
    }
    
    // Create and save the role
    const newRole = new this.roleModel(roleData);
    await newRole.save();
    
    this.logger.log(`Role created successfully with ID: ${newRole._id}`);
    
    return newRole.toJSON();
  }
}
