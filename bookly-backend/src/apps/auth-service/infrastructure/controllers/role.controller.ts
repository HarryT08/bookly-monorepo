import { Controller, Get, Post, Put, Delete, Param, Body, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { RoleService } from '../../application/services/role.service';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import { AUTH_URLS } from '../../utils/maps';

@ApiTags('Roles')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller(AUTH_URLS.ROLE)
export class RoleController {
  constructor(private readonly roleService: RoleService) {}

  @Get(AUTH_URLS.ROLE_FIND)
  @ApiOperation({ summary: 'Get all roles' })
  @ApiResponse({ status: 200, description: 'Roles retrieved successfully' })
  async findAll(
    @Query('page') page?: number,
    @Query('limit') limit?: number,
    @Query('search') search?: string,
  ) {
    return this.roleService.findAll(page, limit, search);
  }

  @Get(AUTH_URLS.ROLE_FIND_BY_ACTIVE)
  @ApiOperation({ summary: 'Get all active roles' })
  @ApiResponse({ status: 200, description: 'Active roles retrieved successfully' })
  async findActiveRoles() {
    return this.roleService.findActiveRoles();
  }

  @Get(AUTH_URLS.ROLE_FIND_BY_ID)
  @ApiOperation({ summary: 'Get role by ID' })
  @ApiResponse({ status: 200, description: 'Role retrieved successfully' })
  @ApiResponse({ status: 404, description: 'Role not found' })
  async findById(@Param('id') id: string) {
    return this.roleService.findById(id);
  }

  @Post(AUTH_URLS.ROLE_CREATE)
  @ApiOperation({ summary: 'Create a new role' })
  @ApiResponse({ status: 201, description: 'Role created successfully' })
  async create(@Body() data: any) {
    return this.roleService.create(data, 'admin-user-id');
  }

  @Put(AUTH_URLS.ROLE_UPDATE)
  @ApiOperation({ summary: 'Update a role' })
  @ApiResponse({ status: 200, description: 'Role updated successfully' })
  async update(@Param('id') id: string, @Body() data: any) {
    return this.roleService.update(id, data, 'admin-user-id');
  }

  @Delete(AUTH_URLS.ROLE_DELETE)
  @ApiOperation({ summary: 'Delete a role' })
  @ApiResponse({ status: 200, description: 'Role deleted successfully' })
  async delete(@Param('id') id: string) {
    return this.roleService.delete(id, 'admin-user-id');
  }
}
