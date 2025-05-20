import { Controller, Post, Get, Put, Delete, Body, Param, Inject } from '@nestjs/common';
import { Logger } from '@bookly-monorepo/logging';

// Define DTOs locally until properly shared in @bookly-monorepo/dto
class CreateRoleDto {
  name: string;
  description?: string;
  permissions?: string[];
}

class AssignRoleDto {
  userId: string;
  roleId: string;
}

import { CommandBus } from '../../application/buses/cqrs-bus';

@Controller('roles')
export class RolesController {
  private readonly logger = new Logger(RolesController.name);

  constructor(
    @Inject('CommandBus') private readonly commandBus: CommandBus
  ) {}

  @Post()
  async createRole(@Body() createRoleDto: CreateRoleDto) {
    this.logger.info('Create role', { name: createRoleDto.name });
    // Command pattern implementation
    const command = { type: 'roles.createRole', role: createRoleDto };
    return await this.commandBus.execute(command);
  }

  @Get()
  async getRoles() {
    this.logger.info('Get all roles');
    // Query pattern implementation
    const query = { type: 'roles.getAllRoles' };
    return await this.commandBus.execute(query);
  }

  @Put(':id')
  async updateRole(@Param('id') id: string, @Body() createRoleDto: CreateRoleDto) {
    this.logger.info('Update role', { id, name: createRoleDto.name });
    // Command pattern implementation
    const command = { type: 'roles.updateRole', id, role: createRoleDto };
    return await this.commandBus.execute(command);
  }

  @Delete(':id')
  async deleteRole(@Param('id') id: string) {
    this.logger.info('Delete role', { id });
    // Command pattern implementation
    const command = { type: 'roles.deleteRole', id };
    return await this.commandBus.execute(command);
  }

  @Post('assign')
  async assignRole(@Body() assignRoleDto: AssignRoleDto) {
    this.logger.info('Assign role', assignRoleDto);
    // Command pattern implementation
    const command = { type: 'roles.assignRole', assignment: assignRoleDto };
    return await this.commandBus.execute(command);
  }
}
