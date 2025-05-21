import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { NotFoundException, Logger } from '@nestjs/common';

import { GetRoleByIdQuery } from '../impl/get-role-by-id.query';
import { Role } from '../../../domain/entities/role.entity';

@QueryHandler(GetRoleByIdQuery)
export class GetRoleByIdHandler implements IQueryHandler<GetRoleByIdQuery> {
  private readonly logger = new Logger(GetRoleByIdHandler.name);

  constructor(
    @InjectModel(Role.name) private roleModel: Model<Role>,
  ) {}

  async execute(query: GetRoleByIdQuery) {
    const { roleId } = query;
    
    this.logger.log(`Fetching role with ID: ${roleId}`);
    
    const role = await this.roleModel.findById(roleId);
    if (!role) {
      throw new NotFoundException(`Role with ID ${roleId} not found`);
    }
    
    return role.toJSON();
  }
}
