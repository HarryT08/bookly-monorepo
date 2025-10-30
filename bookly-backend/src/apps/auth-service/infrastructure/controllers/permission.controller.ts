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
} from "@nestjs/common";
import {
  ApiTags,
  ApiOperation,
  ApiResponse as SwaggerApiResponse,
  ApiBearerAuth,
  ApiQuery,
} from "@nestjs/swagger";
import {
  ApiResponseBookly,
  PaginatedResponseDto,
  SuccessResponseDto,
} from "@libs/dto/common/response.dto";
import { ResponseUtil } from "@libs/common/utils/response.util";
import { JwtAuthGuard } from "@libs/common/guards/jwt-auth.guard";
import { RolesGuard } from "@libs/common/guards/roles.guard";
import { Roles } from "@libs/common/decorators/roles.decorator";
import { PermissionService } from "../../application/services/permission.service";
import {
  CreatePermissionDto,
  UpdatePermissionDto,
  PermissionResponseDto,
} from "../../../../libs/dto/auth/permission.dto";
import { AUTH_URLS } from "../../utils/maps/urls.map";

@ApiTags("Permissions")
@ApiBearerAuth()
@Controller(AUTH_URLS.PERMISSION)
@UseGuards(JwtAuthGuard, RolesGuard)
export class PermissionController {
  constructor(private readonly permissionService: PermissionService) {}

  @Post()
  @Roles("Administrador General")
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: "Create a new permission" })
  @SwaggerApiResponse({
    status: 201,
    description: "Permission created successfully",
    type: SuccessResponseDto,
  })
  @SwaggerApiResponse({ status: 400, description: "Invalid permission data" })
  @SwaggerApiResponse({ status: 409, description: "Permission already exists" })
  @SwaggerApiResponse({ status: 403, description: "Insufficient permissions" })
  async createPermission(
    @Body() createPermissionDto: CreatePermissionDto
  ): Promise<ApiResponseBookly<PermissionResponseDto>> {
    const permission =
      await this.permissionService.createPermission(createPermissionDto);
    const responseDto = this.mapToResponseDto(permission);
    return ResponseUtil.success(responseDto, "Permission created successfully");
  }

  @Get()
  @Roles("Administrador General", "Administrador de Programa")
  @ApiOperation({ summary: "Get all permissions with optional filters" })
  @ApiQuery({
    name: "resource",
    required: false,
    description: "Filter by resource",
  })
  @ApiQuery({
    name: "action",
    required: false,
    description: "Filter by action",
  })
  @ApiQuery({ name: "scope", required: false, description: "Filter by scope" })
  @ApiQuery({
    name: "isActive",
    required: false,
    description: "Filter by active status",
  })
  @SwaggerApiResponse({
    status: 200,
    description: "Permissions retrieved successfully",
    type: PaginatedResponseDto,
  })
  async getAllPermissions(
    @Query("resource") resource?: string,
    @Query("action") action?: string,
    @Query("scope") scope?: string,
    @Query("isActive") isActive?: boolean
  ): Promise<ApiResponseBookly<PermissionResponseDto[]>> {
    const filters = {
      ...(resource && { resource }),
      ...(action && { action }),
      ...(scope && { scope }),
      ...(isActive !== undefined && { isActive }),
    };

    const permissions =
      await this.permissionService.findAllPermissions(filters);
    const data = permissions.map((permission) =>
      this.mapToResponseDto(permission)
    );
    return ResponseUtil.success(data, "Permissions retrieved successfully");
  }

  @Get(AUTH_URLS.PERMISSION_FIND_BY_ACTIVE)
  @Roles("Administrador General", "Administrador de Programa")
  @ApiOperation({ summary: "Get all active permissions" })
  @SwaggerApiResponse({
    status: 200,
    description: "Active permissions retrieved successfully",
    type: SuccessResponseDto,
  })
  async getActivePermissions(): Promise<
    ApiResponseBookly<PermissionResponseDto[]>
  > {
    const permissions = await this.permissionService.findActivePermissions();
    const data = permissions.map((permission) =>
      this.mapToResponseDto(permission)
    );
    return ResponseUtil.success(
      data,
      "Active permissions retrieved successfully"
    );
  }

  @Get(AUTH_URLS.PERMISSION_FIND_BY_RESOURCE)
  @Roles("Administrador General", "Administrador de Programa")
  @ApiOperation({ summary: "Get permissions by resource" })
  @ApiQuery({
    name: "action",
    required: false,
    description: "Filter by action",
  })
  @ApiQuery({ name: "scope", required: false, description: "Filter by scope" })
  @SwaggerApiResponse({
    status: 200,
    description: "Permissions retrieved successfully",
    type: SuccessResponseDto,
  })
  async getPermissionsByResource(
    @Param("resource") resource: string,
    @Query("action") action?: string,
    @Query("scope") scope?: string
  ): Promise<ApiResponseBookly<PermissionResponseDto[]>> {
    const permissions = await this.permissionService.findPermissionsByResource(
      resource,
      action,
      scope
    );
    const data = permissions.map((permission) =>
      this.mapToResponseDto(permission)
    );
    return ResponseUtil.success(data, "Permissions retrieved successfully");
  }

  @Get(AUTH_URLS.PERMISSION_FIND_BY_ID)
  @Roles("Administrador General", "Administrador de Programa")
  @ApiOperation({ summary: "Get permission by ID" })
  @SwaggerApiResponse({
    status: 200,
    description: "Permission retrieved successfully",
    type: SuccessResponseDto,
  })
  @SwaggerApiResponse({ status: 404, description: "Permission not found" })
  async getPermissionById(
    @Param("id") id: string
  ): Promise<ApiResponseBookly<PermissionResponseDto>> {
    const permission = await this.permissionService.findPermissionById(id);
    const data = this.mapToResponseDto(permission);
    return ResponseUtil.success(data, "Permission retrieved successfully");
  }

  @Put(AUTH_URLS.PERMISSION_UPDATE)
  @Roles("Administrador General")
  @ApiOperation({ summary: "Update permission" })
  @SwaggerApiResponse({
    status: 200,
    description: "Permission updated successfully",
    type: SuccessResponseDto,
  })
  @SwaggerApiResponse({ status: 404, description: "Permission not found" })
  @SwaggerApiResponse({
    status: 409,
    description: "Permission name already exists",
  })
  @SwaggerApiResponse({ status: 403, description: "Insufficient permissions" })
  async updatePermission(
    @Param("id") id: string,
    @Body() updatePermissionDto: UpdatePermissionDto
  ): Promise<ApiResponseBookly<PermissionResponseDto>> {
    const permission = await this.permissionService.updatePermission(
      id,
      updatePermissionDto
    );
    const data = this.mapToResponseDto(permission);
    return ResponseUtil.success(data, "Permission updated successfully");
  }

  @Put(AUTH_URLS.PERMISSION_ACTIVATE)
  @Roles("Administrador General")
  @ApiOperation({ summary: "Activate permission" })
  @SwaggerApiResponse({
    status: 200,
    description: "Permission activated successfully",
    type: SuccessResponseDto,
  })
  @SwaggerApiResponse({ status: 404, description: "Permission not found" })
  @SwaggerApiResponse({ status: 403, description: "Insufficient permissions" })
  async activatePermission(
    @Param("id") id: string
  ): Promise<ApiResponseBookly<PermissionResponseDto>> {
    const permission = await this.permissionService.activatePermission(id);
    const data = this.mapToResponseDto(permission);
    return ResponseUtil.success(data, "Permission activated successfully");
  }

  @Put(AUTH_URLS.PERMISSION_DEACTIVATE)
  @Roles("Administrador General")
  @ApiOperation({ summary: "Deactivate permission" })
  @SwaggerApiResponse({
    status: 200,
    description: "Permission deactivated successfully",
    type: SuccessResponseDto,
  })
  @SwaggerApiResponse({ status: 404, description: "Permission not found" })
  @SwaggerApiResponse({ status: 403, description: "Insufficient permissions" })
  async deactivatePermission(
    @Param("id") id: string
  ): Promise<ApiResponseBookly<PermissionResponseDto>> {
    const permission = await this.permissionService.deactivatePermission(id);
    const data = this.mapToResponseDto(permission);
    return ResponseUtil.success(data, "Permission deactivated successfully");
  }

  @Delete(AUTH_URLS.PERMISSION_DELETE)
  @Roles("Administrador General")
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: "Delete permission" })
  @SwaggerApiResponse({
    status: 200,
    description: "Permission deleted successfully",
    type: SuccessResponseDto,
  })
  @SwaggerApiResponse({ status: 404, description: "Permission not found" })
  @SwaggerApiResponse({ status: 403, description: "Insufficient permissions" })
  async deletePermission(
    @Param("id") id: string
  ): Promise<ApiResponseBookly<PermissionResponseDto>> {
    await this.permissionService.deletePermission(id);
    return ResponseUtil.success(null, "Permission deleted successfully");
  }

  @Post(AUTH_URLS.PERMISSION_SEED_DEFAULTS)
  @Roles("Administrador General")
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: "Create default system permissions" })
  @SwaggerApiResponse({
    status: 201,
    description: "Default permissions created successfully",
    type: SuccessResponseDto,
  })
  @SwaggerApiResponse({ status: 403, description: "Insufficient permissions" })
  async seedDefaultPermissions(): Promise<
    ApiResponseBookly<PermissionResponseDto[]>
  > {
    const permissions = await this.permissionService.createDefaultPermissions();
    const data = permissions.map((permission) =>
      this.mapToResponseDto(permission)
    );
    return ResponseUtil.success(
      data,
      "Default permissions created successfully"
    );
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
