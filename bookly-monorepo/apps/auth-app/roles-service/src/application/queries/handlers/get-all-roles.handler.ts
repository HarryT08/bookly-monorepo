import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Logger } from '@nestjs/common';

import { GetAllRolesQuery } from '../impl/get-all-roles.query';
import { Role } from '../../../domain/entities/role.entity';

@QueryHandler(GetAllRolesQuery)
export class GetAllRolesHandler implements IQueryHandler<GetAllRolesQuery> {
  private readonly logger = new Logger(GetAllRolesHandler.name);

  constructor(
    @InjectModel(Role.name) private roleModel: Model<Role>,
  ) {}

  async execute(query: GetAllRolesQuery) {
    this.logger.log('Fetching all roles');
    
    const roles = await this.roleModel.find().exec();
    
    return roles.map(role => role.toJSON());
  }
}
