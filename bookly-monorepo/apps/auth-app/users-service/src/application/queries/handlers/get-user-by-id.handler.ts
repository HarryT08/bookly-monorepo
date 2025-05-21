import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { NotFoundException, Logger } from '@nestjs/common';

import { GetUserByIdQuery } from '../impl/get-user-by-id.query';
import { User } from '../../../domain/entities/user.entity';

@QueryHandler(GetUserByIdQuery)
export class GetUserByIdHandler implements IQueryHandler<GetUserByIdQuery> {
  private readonly logger = new Logger(GetUserByIdHandler.name);

  constructor(
    @InjectModel(User.name) private userModel: Model<User>,
  ) {}

  async execute(query: GetUserByIdQuery) {
    const { userId } = query;
    
    this.logger.log(`Fetching user with ID: ${userId}`);
    
    const user = await this.userModel.findById(userId);
    if (!user) {
      throw new NotFoundException(`User with ID ${userId} not found`);
    }
    
    return user.toJSON();
  }
}
