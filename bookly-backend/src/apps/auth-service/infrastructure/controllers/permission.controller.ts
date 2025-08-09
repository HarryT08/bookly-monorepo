import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  HttpStatus,
  HttpCode,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import { RolesGuard } from '../guards/roles.guard';
import { Roles } from '../decorators/roles.decorator';
import { PermissionService } from '../../application/services/permission.service';
import { CreatePermissionDto, UpdatePermissionDto, PermissionResponseDto } from '../../../../libs/dto/auth/permission.dto';
import { AUTH_URLS } from '../../utils/maps';

@ApiTags('Permissions')
@ApiBearerAuth()
@Controller(AUTH_URLS.PERMISSION)
@UseGuards(JwtAuthGuard, RolesGuard)
export class PermissionController {
  constructor(private readonly permissionService: PermissionService) {}

  @Post()
  @Roles('Administrador General')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create a new permission' })
  @ApiResponse({
    status: 201,
    description: 'Permission created successfully',
    type: PermissionResponseDto,
  })
  @ApiResponse({ status: 400, description: 'Invalid permission data' })
  @ApiResponse({ status: 409, description: 'Permission already exists' })
  @ApiResponse({ status: 403, description: 'Insufficient permissions' })
  async createPermission(@Body() createPermissionDto: CreatePermissionDto): Promise<PermissionResponseDto> {
    const permission = await this.permissionService.createPermission(createPermissionDto);
    return this.mapToResponseDto(permission);
  }

  @Get()
  @Roles('Administrador General', 'Administrador de Programa')
  @ApiOperation({ summary: 'Get all permissions with optional filters' })
  @ApiQuery({ name: 'resource', required: false, description: 'Filter by resource' })
  @ApiQuery({ name: 'action', required: false, description: 'Filter by action' })
  @ApiQuery({ name: 'scope', required: false, description: 'Filter by scope' })
  @ApiQuery({ name: 'isActive', required: false, description: 'Filter by active status' })
  @ApiResponse({
    status: 200,
    description: 'Permissions retrieved successfully',
    type: [PermissionResponseDto],
  })
  async getAllPermissions(
    @Query('resource') resource?: string,
    @Query('action') action?: string,
    @Query('scope') scope?: string,
    @Query('isActive') isActive?: boolean,
  ): Promise<PermissionResponseDto[]> {
    const filters = {
      ...(resource && { resource }),
      ...(action && { action }),
      ...(scope && { scope }),
      ...(isActive !== undefined && { isActive }),
    };

    const permissions = await this.permissionService.findAllPermissions(filters);
    return permissions.map(permission => this.mapToResponseDto(permission));
  }

  @Get(AUTH_URLS.PERMISSION_FIND_BY_ACTIVE)
  @Roles('Administrador General', 'Administrador de Programa')
  @ApiOperation({ summary: 'Get all active permissions' })
  @ApiResponse({
    status: 200,
    description: 'Active permissions retrieved successfully',
    type: [PermissionResponseDto],
  })
  async getActivePermissions(): Promise<PermissionResponseDto[]> {
    const permissions = await this.permissionService.findActivePermissions();
    return permissions.map(permission => this.mapToResponseDto(permission));
  }

  @Get(AUTH_URLS.PERMISSION_FIND_BY_RESOURCE)
  @Roles('Administrador General', 'Administrador de Programa')
  @ApiOperation({ summary: 'Get permissions by resource' })
  @ApiQuery({ name: 'action', required: false, description: 'Filter by action' })
  @ApiQuery({ name: 'scope', required: false, description: 'Filter by scope' })
  @ApiResponse({
    status: 200,
    description: 'Permissions retrieved successfully',
    type: [PermissionResponseDto],
  })
  async getPermissionsByResource(
    @Param('resource') resource: string,
    @Query('action') action?: string,
    @Query('scope') scope?: string,
  ): Promise<PermissionResponseDto[]> {
    const permissions = await this.permissionService.findPermissionsByResource(resource, action, scope);
    return permissions.map(permission => this.mapToResponseDto(permission));
  }

  @Get(AUTH_URLS.PERMISSION_FIND_BY_ID)
  @Roles('Administrador General', 'Administrador de Programa')
  @ApiOperation({ summary: 'Get permission by ID' })
  @ApiResponse({
    status: 200,
    description: 'Permission retrieved successfully',
    type: PermissionResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Permission not found' })
  async getPermissionById(@Param('id') id: string): Promise<PermissionResponseDto> {
    const permission = await this.permissionService.findPermissionById(id);
    return this.mapToResponseDto(permission);
  }

  @Put(AUTH_URLS.PERMISSION_UPDATE)
  @Roles('Administrador General')
  @ApiOperation({ summary: 'Update permission' })
  @ApiResponse({
    status: 200,
    description: 'Permission updated successfully',
    type: PermissionResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Permission not found' })
  @ApiResponse({ status: 409, description: 'Permission name already exists' })
  @ApiResponse({ status: 403, description: 'Insufficient permissions' })
  async updatePermission(
    @Param('id') id: string,
    @Body() updatePermissionDto: UpdatePermissionDto,
  ): Promise<PermissionResponseDto> {
    const permission = await this.permissionService.updatePermission(id, updatePermissionDto);
    return this.mapToResponseDto(permission);
  }

  @Put(AUTH_URLS.PERMISSION_ACTIVATE)
  @Roles('Administrador General')
  @ApiOperation({ summary: 'Activate permission' })
  @ApiResponse({
    status: 200,
    description: 'Permission activated successfully',
    type: PermissionResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Permission not found' })
  @ApiResponse({ status: 403, description: 'Insufficient permissions' })
  async activatePermission(@Param('id') id: string): Promise<PermissionResponseDto> {
    const permission = await this.permissionService.activatePermission(id);
    return this.mapToResponseDto(permission);
  }

  @Put(AUTH_URLS.PERMISSION_DEACTIVATE)
  @Roles('Administrador General')
  @ApiOperation({ summary: 'Deactivate permission' })
  @ApiResponse({
    status: 200,
    description: 'Permission deactivated successfully',
    type: PermissionResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Permission not found' })
  @ApiResponse({ status: 403, description: 'Insufficient permissions' })
  async deactivatePermission(@Param('id') id: string): Promise<PermissionResponseDto> {
    const permission = await this.permissionService.deactivatePermission(id);
    return this.mapToResponseDto(permission);
  }

  @Delete(AUTH_URLS.PERMISSION_DELETE)
  @Roles('Administrador General')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete permission' })
  @ApiResponse({ status: 204, description: 'Permission deleted successfully' })
  @ApiResponse({ status: 404, description: 'Permission not found' })
  @ApiResponse({ status: 403, description: 'Insufficient permissions' })
  async deletePermission(@Param('id') id: string): Promise<void> {
    await this.permissionService.deletePermission(id);
  }

  @Post(AUTH_URLS.PERMISSIONS_SEED_DEFAULTS)
  @Roles('Administrador General')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create default system permissions' })
  @ApiResponse({
    status: 201,
    description: 'Default permissions created successfully',
    type: [PermissionResponseDto],
  })
  @ApiResponse({ status: 403, description: 'Insufficient permissions' })
  async seedDefaultPermissions(): Promise<PermissionResponseDto[]> {
    const permissions = await this.permissionService.createDefaultPermissions();
    return permissions.map(permission => this.mapToResponseDto(permission));
  }

  private mapToResponseDto(permission: any): PermissionResponseDto {
    return {
      id: permission.id,
      name: permission.name,
      resource: permission.resource,
      action: permission.action,
      scope: permission.scope,
      conditions: permission.conditions,
      description: permission.description,
      isActive: permission.isActive,
      createdAt: permission.createdAt,
      updatedAt: permission.updatedAt,
    };
  }
}
