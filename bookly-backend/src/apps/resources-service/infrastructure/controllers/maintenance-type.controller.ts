import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  UseGuards,
  HttpStatus,
  HttpCode,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { CreateMaintenanceTypeCommand } from '@apps/resources-service/application/commands/create-maintenance-type.command';
import { UpdateMaintenanceTypeCommand, DeactivateMaintenanceTypeCommand, ReactivateMaintenanceTypeCommand } from '@apps/resources-service/application/commands/update-maintenance-type.command';
import { GetMaintenanceTypeQuery, GetMaintenanceTypeByCodeQuery, GetMaintenanceTypesQuery, GetActiveMaintenanceTypesQuery } from '@apps/resources-service/application/queries/get-maintenance-type.query';
import {
  CreateMaintenanceTypeDto,
  UpdateMaintenanceTypeDto,
  MaintenanceTypeResponseDto,
} from '@apps/resources-service/application/dtos/maintenance-type.dto';
import { MaintenanceTypeEntity } from '@apps/resources-service/domain/entities/maintenance-type.entity';
import { RolesGuard } from '@libs/common/guards/roles.guard';
import { Roles } from '@libs/common/decorators/roles.decorator';
import { CurrentUser } from '@libs/common/decorators/current-user.decorator';
import { UserEntity, UserRole } from '@apps/auth-service/domain/entities/user.entity';
import { JwtAuthGuard } from '@libs/common/guards/jwt-auth.guard';
import { ResponseUtil } from '@libs/common/utils/response.util';
import { SuccessResponseDto } from '@libs/dto/common/response.dto';
import { RESOURCES_URLS } from '@apps/resources-service/utils/maps/urls.map';

/**
 * HITO 6 - RF-06: MaintenanceType Controller
 * Handles HTTP requests for maintenance type management
 */
@ApiTags(RESOURCES_URLS.MAINTENANCE_TYPES_TAG)
@Controller(RESOURCES_URLS.MAINTENANCE_TYPES)
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class MaintenanceTypeController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
  ) {}

  /**
   * Creates a new maintenance type
   */
  @Post(RESOURCES_URLS.MAINTENANCE_TYPES_CREATE)
  @Roles(UserRole.GENERAL_ADMIN, UserRole.PROGRAM_ADMIN)
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Create a new maintenance type',
    description: 'Creates a new custom maintenance type. Only administrators can create maintenance types.',
  })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'Maintenance type created successfully',
    type: MaintenanceTypeResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.CONFLICT,
    description: 'Maintenance type with same name already exists',
  })
  @ApiResponse({
    status: HttpStatus.FORBIDDEN,
    description: 'Insufficient permissions',
  })
  async createMaintenanceType(
    @Body() createMaintenanceTypeDto: CreateMaintenanceTypeDto,
    @CurrentUser() user: UserEntity,
  ): Promise<MaintenanceTypeResponseDto> {
    const commandData = { ...createMaintenanceTypeDto, createdBy: user.id! };
    const command = new CreateMaintenanceTypeCommand(commandData);
    return await this.commandBus.execute(command);
  }

  /**
   * Gets all active maintenance types
   */
  @Get(RESOURCES_URLS.MAINTENANCE_TYPES_ACTIVE)
  @ApiOperation({
    summary: 'Get all active maintenance types',
    description: 'Retrieves all active maintenance types ordered by priority.',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Maintenance types retrieved successfully',
    type: SuccessResponseDto,
  })
  async getActiveMaintenanceTypes() {
    const query = new GetActiveMaintenanceTypesQuery();
    const maintenanceTypes = await this.queryBus.execute(query);
    return ResponseUtil.success(maintenanceTypes, 'Active maintenance types retrieved successfully');
  }

  /**
   * Gets all maintenance types (active and inactive)
   */
  @Get(RESOURCES_URLS.MAINTENANCE_TYPES_ALL)
  @Roles(UserRole.GENERAL_ADMIN, UserRole.PROGRAM_ADMIN)
  @ApiOperation({
    summary: 'Get all maintenance types',
    description: 'Retrieves all maintenance types including inactive ones. Only administrators can access this.',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'All maintenance types retrieved successfully',
    type: SuccessResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.FORBIDDEN,
    description: 'Insufficient permissions',
  })
  async getAllMaintenanceTypes() {
    const query = new GetMaintenanceTypesQuery(1, 100, undefined, undefined);
    const result = await this.queryBus.execute(query);
    return ResponseUtil.success(result.maintenanceTypes, 'All maintenance types retrieved successfully');
  }

  /**
   * Gets default maintenance types
   */
  @Get(RESOURCES_URLS.MAINTENANCE_TYPES_DEFAULTS)
  @ApiOperation({
    summary: 'Get default maintenance types',
    description: 'Retrieves all default system maintenance types.',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Default maintenance types retrieved successfully',
    type: SuccessResponseDto,
  })
  async getDefaultMaintenanceTypes() {
    const query = new GetMaintenanceTypesQuery(1, 100, undefined, true);
    const result = await this.queryBus.execute(query);
    const defaultTypes = result.maintenanceTypes.filter(mt => mt.isDefault);
    return ResponseUtil.success(defaultTypes, 'Default maintenance types retrieved successfully');
  }

  /**
   * Gets custom maintenance types
   */
  @Get(RESOURCES_URLS.MAINTENANCE_TYPES_CUSTOM)
  @Roles('ADMIN_GENERAL', 'ADMIN_PROGRAMA')
  @ApiOperation({
    summary: 'Get custom maintenance types',
    description: 'Retrieves all custom maintenance types created by administrators.',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Custom maintenance types retrieved successfully',
    type: SuccessResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.FORBIDDEN,
    description: 'Insufficient permissions',
  })
  async getCustomMaintenanceTypes() {
    const query = new GetMaintenanceTypesQuery(1, 100, undefined, true);
    const result = await this.queryBus.execute(query);
    const customTypes = result.maintenanceTypes.filter(mt => !mt.isDefault);
    return ResponseUtil.success(customTypes, 'Custom maintenance types retrieved successfully');
  }

  /**
   * Gets a maintenance type by ID
   */
  @Get(RESOURCES_URLS.MAINTENANCE_TYPES_ID)
  @ApiOperation({
    summary: 'Get maintenance type by ID',
    description: 'Retrieves a specific maintenance type by its ID.',
  })
  @ApiParam({
    name: 'id',
    description: 'Maintenance type ID',
    type: String,
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Maintenance type retrieved successfully',
    type: SuccessResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Maintenance type not found',
  })
  async getMaintenanceTypeById(@Param('id') id: string) {
    const query = new GetMaintenanceTypeQuery(id);
    const maintenanceType = await this.queryBus.execute(query);
    return ResponseUtil.success(maintenanceType, 'Maintenance type retrieved successfully');
  }

  /**
   * Gets a maintenance type by name
   */
  @Get(RESOURCES_URLS.MAINTENANCE_TYPES_NAME)
  @ApiOperation({
    summary: 'Get maintenance type by name',
    description: 'Retrieves a specific maintenance type by its name.',
  })
  @ApiParam({
    name: 'name',
    description: 'Maintenance type name',
    type: String,
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Maintenance type retrieved successfully',
    type: SuccessResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Maintenance type not found',
  })
  async getMaintenanceTypeByName(@Param('name') name: string) {
    const query = new GetMaintenanceTypeByCodeQuery(name);
    const maintenanceType = await this.queryBus.execute(query);
    return ResponseUtil.success(maintenanceType, 'Maintenance type retrieved successfully');
  }

  /**
   * Updates an existing maintenance type
   */
  @Put(RESOURCES_URLS.MAINTENANCE_TYPES_ID)
  @Roles('ADMIN_GENERAL', 'ADMIN_PROGRAMA')
  @ApiOperation({
    summary: 'Update maintenance type',
    description: 'Updates an existing custom maintenance type. Default types cannot be modified.',
  })
  @ApiParam({
    name: 'id',
    description: 'Maintenance type ID',
    type: String,
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Maintenance type updated successfully',
    type: SuccessResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Maintenance type not found',
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Cannot modify default maintenance types',
  })
  @ApiResponse({
    status: HttpStatus.CONFLICT,
    description: 'Maintenance type with same name already exists',
  })
  @ApiResponse({
    status: HttpStatus.FORBIDDEN,
    description: 'Insufficient permissions',
  })
  async updateMaintenanceType(
    @Param('id') id: string,
    @Body() updateMaintenanceTypeDto: UpdateMaintenanceTypeDto,
    @CurrentUser() user: UserEntity,
  ) {
    const commandData = { id, ...updateMaintenanceTypeDto, updatedBy: user.id! };
    const command = new UpdateMaintenanceTypeCommand(commandData);
    const updatedMaintenanceType = await this.commandBus.execute(command);
    return ResponseUtil.success(updatedMaintenanceType, 'Maintenance type updated successfully');
  }

  /**
   * Deactivates a maintenance type
   */
  @Delete(RESOURCES_URLS.MAINTENANCE_TYPES_ID)
  @Roles('ADMIN_GENERAL', 'ADMIN_PROGRAMA')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({
    summary: 'Deactivate maintenance type',
    description: 'Deactivates a custom maintenance type. Default types cannot be deactivated.',
  })
  @ApiParam({
    name: 'id',
    description: 'Maintenance type ID',
    type: String,
  })
  @ApiResponse({
    status: HttpStatus.NO_CONTENT,
    description: 'Maintenance type deactivated successfully',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Maintenance type not found',
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Cannot deactivate default maintenance types',
  })
  @ApiResponse({
    status: HttpStatus.CONFLICT,
    description: 'Maintenance type is already inactive',
  })
  @ApiResponse({
    status: HttpStatus.FORBIDDEN,
    description: 'Insufficient permissions',
  })
  async deactivateMaintenanceType(
    @Param('id') id: string,
    @CurrentUser() user: UserEntity,
  ): Promise<void> {
    const command = new DeactivateMaintenanceTypeCommand(id, user.id!);
    await this.commandBus.execute(command);
  }

  /**
   * Reactivates a maintenance type
   */
  @Put(RESOURCES_URLS.MAINTENANCE_TYPES_REACTIVATE)
  @Roles('ADMIN_GENERAL', 'ADMIN_PROGRAMA')
  @ApiOperation({
    summary: 'Reactivate maintenance type',
    description: 'Reactivates a deactivated custom maintenance type.',
  })
  @ApiParam({
    name: 'id',
    description: 'Maintenance type ID',
    type: String,
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Maintenance type reactivated successfully',
    type: SuccessResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Maintenance type not found',
  })
  @ApiResponse({
    status: HttpStatus.CONFLICT,
    description: 'Maintenance type is already active',
  })
  @ApiResponse({
    status: HttpStatus.FORBIDDEN,
    description: 'Insufficient permissions',
  })
  async reactivateMaintenanceType(
    @Param('id') id: string,
    @CurrentUser() user: UserEntity,
  ) {
    const command = new ReactivateMaintenanceTypeCommand(id, user.id!);
    const reactivatedMaintenanceType = await this.commandBus.execute(command);
    return ResponseUtil.success(reactivatedMaintenanceType, 'Maintenance type reactivated successfully');
  }

  /**
   * Validates if a maintenance type can be used
   */
  @Get(RESOURCES_URLS.MAINTENANCE_TYPES_VALIDATE)
  @ApiOperation({
    summary: 'Validate maintenance type',
    description: 'Checks if a maintenance type exists and is active for use.',
  })
  @ApiParam({
    name: 'id',
    description: 'Maintenance type ID',
    type: String,
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Validation result',
    type: SuccessResponseDto,
  })
  async validateMaintenanceType(@Param('id') id: string) {
    const query = new GetMaintenanceTypeQuery(id);
    try {
      const maintenanceType = await this.queryBus.execute(query);
      const isValid = maintenanceType && maintenanceType.isActive;
      return ResponseUtil.success({ isValid }, 'Maintenance type validation completed');
    } catch (error) {
      return ResponseUtil.success({ isValid: false }, 'Maintenance type validation completed');
    }
  }
}
