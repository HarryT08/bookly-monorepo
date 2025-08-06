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
import { MaintenanceTypeService } from '../../application/services/maintenance-type.service';
import {
  CreateMaintenanceTypeDto,
  UpdateMaintenanceTypeDto,
  MaintenanceTypeResponseDto,
} from '../../application/dtos/maintenance-type.dto';
import { JwtAuthGuard } from '@libs/common/guards/jwt-auth.guard';
import { RolesGuard } from '@libs/common/guards/roles.guard';
import { Roles } from '@libs/common/decorators/roles.decorator';
import { CurrentUser } from '@libs/common/decorators/current-user.decorator';
import { UserEntity } from '../../../auth-service/domain/entities/user.entity';

/**
 * HITO 6 - RF-06: MaintenanceType Controller
 * Handles HTTP requests for maintenance type management
 */
@ApiTags('Maintenance Types')
@Controller('maintenance-types')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class MaintenanceTypeController {
  constructor(private readonly maintenanceTypeService: MaintenanceTypeService) {}

  /**
   * Creates a new maintenance type
   */
  @Post()
  @Roles('ADMIN_GENERAL', 'ADMIN_PROGRAMA')
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
    return await this.maintenanceTypeService.createMaintenanceType(createMaintenanceTypeDto);
  }

  /**
   * Gets all active maintenance types
   */
  @Get()
  @ApiOperation({
    summary: 'Get all active maintenance types',
    description: 'Retrieves all active maintenance types ordered by priority.',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Maintenance types retrieved successfully',
    type: [MaintenanceTypeResponseDto],
  })
  async getActiveMaintenanceTypes(): Promise<MaintenanceTypeResponseDto[]> {
    return await this.maintenanceTypeService.getActiveMaintenanceTypes();
  }

  /**
   * Gets all maintenance types (active and inactive)
   */
  @Get('all')
  @Roles('ADMIN_GENERAL', 'ADMIN_PROGRAMA')
  @ApiOperation({
    summary: 'Get all maintenance types',
    description: 'Retrieves all maintenance types including inactive ones. Only administrators can access this.',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'All maintenance types retrieved successfully',
    type: [MaintenanceTypeResponseDto],
  })
  @ApiResponse({
    status: HttpStatus.FORBIDDEN,
    description: 'Insufficient permissions',
  })
  async getAllMaintenanceTypes(): Promise<MaintenanceTypeResponseDto[]> {
    return await this.maintenanceTypeService.getAllMaintenanceTypes();
  }

  /**
   * Gets default maintenance types
   */
  @Get('defaults')
  @ApiOperation({
    summary: 'Get default maintenance types',
    description: 'Retrieves all default system maintenance types.',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Default maintenance types retrieved successfully',
    type: [MaintenanceTypeResponseDto],
  })
  async getDefaultMaintenanceTypes(): Promise<MaintenanceTypeResponseDto[]> {
    return await this.maintenanceTypeService.getDefaultMaintenanceTypes();
  }

  /**
   * Gets custom maintenance types
   */
  @Get('custom')
  @Roles('ADMIN_GENERAL', 'ADMIN_PROGRAMA')
  @ApiOperation({
    summary: 'Get custom maintenance types',
    description: 'Retrieves all custom maintenance types created by administrators.',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Custom maintenance types retrieved successfully',
    type: [MaintenanceTypeResponseDto],
  })
  @ApiResponse({
    status: HttpStatus.FORBIDDEN,
    description: 'Insufficient permissions',
  })
  async getCustomMaintenanceTypes(): Promise<MaintenanceTypeResponseDto[]> {
    return await this.maintenanceTypeService.getCustomMaintenanceTypes();
  }

  /**
   * Gets a maintenance type by ID
   */
  @Get(':id')
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
    type: MaintenanceTypeResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Maintenance type not found',
  })
  async getMaintenanceTypeById(@Param('id') id: string): Promise<MaintenanceTypeResponseDto> {
    return await this.maintenanceTypeService.getMaintenanceTypeById(id);
  }

  /**
   * Gets a maintenance type by name
   */
  @Get('name/:name')
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
    type: MaintenanceTypeResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Maintenance type not found',
  })
  async getMaintenanceTypeByName(@Param('name') name: string): Promise<MaintenanceTypeResponseDto> {
    return await this.maintenanceTypeService.getMaintenanceTypeByName(name);
  }

  /**
   * Updates an existing maintenance type
   */
  @Put(':id')
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
    type: MaintenanceTypeResponseDto,
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
  ): Promise<MaintenanceTypeResponseDto> {
    return await this.maintenanceTypeService.updateMaintenanceType(id, updateMaintenanceTypeDto);
  }

  /**
   * Deactivates a maintenance type
   */
  @Delete(':id')
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
    await this.maintenanceTypeService.deactivateMaintenanceType(id);
  }

  /**
   * Reactivates a maintenance type
   */
  @Put(':id/reactivate')
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
    type: MaintenanceTypeResponseDto,
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
  ): Promise<MaintenanceTypeResponseDto> {
    return await this.maintenanceTypeService.reactivateMaintenanceType(id);
  }

  /**
   * Validates if a maintenance type can be used
   */
  @Get(':id/validate')
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
    schema: {
      type: 'object',
      properties: {
        isValid: { type: 'boolean' },
      },
    },
  })
  async validateMaintenanceType(@Param('id') id: string): Promise<{ isValid: boolean }> {
    const isValid = await this.maintenanceTypeService.validateMaintenanceType(id);
    return { isValid };
  }
}
