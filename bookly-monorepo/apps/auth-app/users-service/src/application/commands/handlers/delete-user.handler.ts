import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { NotFoundException, Logger } from '@nestjs/common';

import { DeleteUserCommand } from '../impl/delete-user.command';
import { User } from '../../../domain/entities/user.entity';

@CommandHandler(DeleteUserCommand)
export class DeleteUserHandler implements ICommandHandler<DeleteUserCommand> {
  private readonly logger = new Logger(DeleteUserHandler.name);

  constructor(
    @InjectModel(User.name) private userModel: Model<User>,
  ) {}

  async execute(command: DeleteUserCommand) {
    const { userId } = command;
    
    this.logger.log(`Deleting user with ID: ${userId}`);
    
    // Check if user exists
    const user = await this.userModel.findById(userId);
    if (!user) {
      throw new NotFoundException(`User with ID ${userId} not found`);
    }
    
    // Delete the user
    await this.userModel.findByIdAndDelete(userId);
    
    this.logger.log(`User deleted successfully with ID: ${userId}`);
    
    return { id: userId, message: 'User deleted successfully' };
  }
}
