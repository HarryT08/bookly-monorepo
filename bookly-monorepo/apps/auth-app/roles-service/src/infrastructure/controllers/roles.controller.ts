import { Controller, Get, Post, Body, Param, Put, Delete, Inject } from '@nestjs/common';
// Importamos nuestro CommandBus y QueryBus personalizados
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { EventBusService } from '@bookly-monorepo/event-bus';

// DTOs compartidos desde la biblioteca dto
import { CreateRoleDto, UpdateRoleDto, IRole } from '@bookly-monorepo/dto';

// Los comandos y queries se implementan directamente con objetos tipo
// No necesitamos importar clases específicas

@ApiTags('roles')
@Controller('roles')
export class RolesController {
  constructor(
    @Inject('CommandBus') private readonly commandBus: any,
    @Inject('QueryBus') private readonly queryBus: any,
    private readonly eventBus: EventBusService,
  ) {}

  @Post()
  @ApiOperation({ summary: 'Create a new role' })
  @ApiResponse({ status: 201, description: 'Role successfully created.' })
  async createRole(@Body() createRoleDto: CreateRoleDto) {
    const role = await this.commandBus.execute({
      type: 'roles.createRole',
      ...createRoleDto
    });

    // Publish an event that a role was created
    this.eventBus.publish({
      eventName: 'role.created',
      version: '1.0',
      timestamp: new Date(),
      correlationId: `role-${role.id}`,
      payload: { role }
    });

    return role;
  }

  @Get()
  @ApiOperation({ summary: 'Get all roles' })
  @ApiResponse({ status: 200, description: 'Return all roles.' })
  async getAllRoles() {
    return this.queryBus.execute({
      type: 'roles.getAllRoles'
    })
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a role by ID' })
  @ApiResponse({ status: 200, description: 'Return the role.' })
  @ApiResponse({ status: 404, description: 'Role not found.' })
  async getRoleById(@Param('id') id: string) {
    return this.queryBus.execute({
      type: 'roles.getRoleById',
      id
    })
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update a role' })
  @ApiResponse({ status: 200, description: 'Role successfully updated.' })
  @ApiResponse({ status: 404, description: 'Role not found.' })
  async updateRole(
    @Param('id') id: string,
    @Body() updateRoleDto: UpdateRoleDto,
  ) {
    const updatedRole = await this.commandBus.execute({
      type: 'roles.updateRole',
      id,
      ...updateRoleDto
    });

    // Publish an event that a role was updated
    this.eventBus.publish({
      eventName: 'role.updated',
      version: '1.0',
      timestamp: new Date(),
      correlationId: `role-${updatedRole.id}`,
      payload: { role: updatedRole }
    });

    return updatedRole;
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a role' })
  @ApiResponse({ status: 200, description: 'Role successfully deleted.' })
  @ApiResponse({ status: 404, description: 'Role not found.' })
  async deleteRole(@Param('id') id: string) {
    const result = await this.commandBus.execute({
      type: 'roles.deleteRole',
      id
    });

    // Publish an event that a role was deleted
    this.eventBus.publish({
      eventName: 'role.deleted',
      version: '1.0',
      timestamp: new Date(),
      correlationId: `role-${id}`,
      payload: { roleId: id }
    });

    return result;
  }
}
