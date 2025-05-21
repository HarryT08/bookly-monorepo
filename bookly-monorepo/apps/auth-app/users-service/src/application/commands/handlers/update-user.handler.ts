import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { NotFoundException, Logger } from '@nestjs/common';

import { UpdateUserCommand } from '../impl/update-user.command';
import { User } from '../../../domain/entities/user.entity';

@CommandHandler(UpdateUserCommand)
export class UpdateUserHandler implements ICommandHandler<UpdateUserCommand> {
  private readonly logger = new Logger(UpdateUserHandler.name);

  constructor(
    @InjectModel(User.name) private userModel: Model<User>,
  ) {}

  async execute(command: UpdateUserCommand) {
    const { userId, userData } = command;
    
    this.logger.log(`Updating user with ID: ${userId}`);
    
    // Check if user exists
    const user = await this.userModel.findById(userId);
    if (!user) {
      throw new NotFoundException(`User with ID ${userId} not found`);
    }
    
    // Update the user
    Object.assign(user, userData);
    await user.save();
    
    this.logger.log(`User updated successfully with ID: ${userId}`);
    
    return user.toJSON();
  }
}
