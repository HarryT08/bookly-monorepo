import { Controller, Get, Post, Put, Delete, Param, Body, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { RoleService } from '../../application/services/role.service';
import { CreateRoleDto, UpdateRoleDto } from '@libs/dto/auth/user-operations.dto';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import { AUTH_URLS } from '../../utils/maps';
import { PaginatedResponseDto, SuccessResponseDto } from '@libs/dto/common/response.dto';
import { ResponseUtil } from '@libs/common/utils/response.util';

@ApiTags('Roles')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller(AUTH_URLS.ROLE)
export class RoleController {
  constructor(private readonly roleService: RoleService) {}

  @Get(AUTH_URLS.ROLE_FIND)
  @ApiOperation({ summary: 'Get all roles' })
  @ApiResponse({ 
    status: 200, 
    description: 'Roles retrieved successfully',
    type: PaginatedResponseDto
  })
  async findAll(
    @Query('page') page?: number,
    @Query('limit') limit?: number,
    @Query('search') search?: string,
  ) {
    const result = await this.roleService.findAll(page, limit, search);
    
    // Handle both paginated and array responses
    if (Array.isArray(result)) {
      return ResponseUtil.fromServiceResponse({
        items: result,
        total: result.length,
        page: page || 1,
        limit: limit || 20,
        message: 'Roles retrieved successfully'
      });
    } else {
      return ResponseUtil.fromServiceResponse({
        items: result.roles,
        total: result.total,
        page: page || 1,
        limit: limit || 20,
        message: 'Roles retrieved successfully'
      });
    }
  }

  @Get(AUTH_URLS.ROLE_FIND_BY_ACTIVE)
  @ApiOperation({ summary: 'Get all active roles' })
  @ApiResponse({ 
    status: 200, 
    description: 'Active roles retrieved successfully',
    type: [SuccessResponseDto]
  })
  async findActiveRoles() {
    const roles = await this.roleService.findActiveRoles();
    return ResponseUtil.list(roles, 'Active roles retrieved successfully');
  }

  @Get(AUTH_URLS.ROLE_FIND_BY_ID)
  @ApiOperation({ summary: 'Get role by ID' })
  @ApiResponse({ 
    status: 200, 
    description: 'Role retrieved successfully',
    type: SuccessResponseDto
  })
  @ApiResponse({ status: 404, description: 'Role not found' })
  async findById(@Param('id') id: string) {
    const role = await this.roleService.findById(id);
    return ResponseUtil.success(role, 'Role retrieved successfully');
  }

  @Post(AUTH_URLS.ROLE_CREATE)
  @ApiOperation({ summary: 'Create a new role' })
  @ApiResponse({ 
    status: 201, 
    description: 'Role created successfully',
    type: SuccessResponseDto
  })
  async create(@Body() data: CreateRoleDto) {
    const role = await this.roleService.create(data, 'admin-user-id');
    return ResponseUtil.success(role, 'Role created successfully');
  }

  @Put(AUTH_URLS.ROLE_UPDATE)
  @ApiOperation({ summary: 'Update a role' })
  @ApiResponse({ 
    status: 200, 
    description: 'Role updated successfully',
    type: SuccessResponseDto
  })
  async update(@Param('id') id: string, @Body() data: UpdateRoleDto) {
    const role = await this.roleService.update(id, data, 'admin-user-id');
    return ResponseUtil.success(role, 'Role updated successfully');
  }

  @Delete(AUTH_URLS.ROLE_DELETE)
  @ApiOperation({ summary: 'Delete a role' })
  @ApiResponse({ 
    status: 200, 
    description: 'Role deleted successfully',
    type: SuccessResponseDto
  })
  async delete(@Param('id') id: string) {
    await this.roleService.delete(id, 'admin-user-id');
    return ResponseUtil.success(null, 'Role deleted successfully');
  }
}
