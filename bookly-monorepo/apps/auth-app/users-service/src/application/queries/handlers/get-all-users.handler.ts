import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Logger } from '@nestjs/common';

import { GetAllUsersQuery } from '../impl/get-all-users.query';
import { User } from '../../../domain/entities/user.entity';

@QueryHandler(GetAllUsersQuery)
export class GetAllUsersHandler implements IQueryHandler<GetAllUsersQuery> {
  private readonly logger = new Logger(GetAllUsersHandler.name);

  constructor(
    @InjectModel(User.name) private userModel: Model<User>,
  ) {}

  async execute(query: GetAllUsersQuery) {
    this.logger.log('Fetching all users');
    
    const users = await this.userModel.find().exec();
    
    return users.map(user => user.toJSON());
  }
}
