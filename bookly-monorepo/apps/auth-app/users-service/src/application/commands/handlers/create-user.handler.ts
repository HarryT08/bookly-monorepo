import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { ConflictException, Logger } from '@nestjs/common';

import { CreateUserCommand } from '../impl/create-user.command';
import { User } from '../../../domain/entities/user.entity';

@CommandHandler(CreateUserCommand)
export class CreateUserHandler implements ICommandHandler<CreateUserCommand> {
  private readonly logger = new Logger(CreateUserHandler.name);

  constructor(
    @InjectModel(User.name) private userModel: Model<User>,
  ) {}

  async execute(command: CreateUserCommand) {
    const { userData } = command;
    
    this.logger.log(`Creating user with email: ${userData.email}`);
    
    // Check if user with this email already exists
    const existingUser = await this.userModel.findOne({ email: userData.email });
    if (existingUser) {
      throw new ConflictException(`User with email ${userData.email} already exists`);
    }
    
    // Create and save the user
    const newUser = new this.userModel(userData);
    await newUser.save();
    
    this.logger.log(`User created successfully with ID: ${newUser._id}`);
    
    return newUser.toJSON();
  }
}
