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
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiQuery,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { ResourceResponsibleService } from '@apps/resources-service/application/services/resource-responsible.service';
import { AssignResourceResponsibleDto, AssignMultipleResourceResponsiblesDto, ResourceResponsibleResponseDto } from '@apps/resources-service/application/dtos/resource-responsible.dto';
import { ResourceResponsibleEntity } from '@apps/resources-service/domain/entities/resource-responsible.entity';
import { JwtAuthGuard } from '@libs/common/guards/jwt-auth.guard';
import { ResponseUtil } from '@libs/common/utils/response.util';
import { SuccessResponseDto } from '@libs/dto/common/response.dto';
import { RolesGuard } from '@libs/common/guards/roles.guard';
import { Roles } from '@libs/common/decorators/roles.decorator';
import { CurrentUser } from '@libs/common/decorators/current-user.decorator';
import { UserEntity } from '@apps/auth-service/domain/entities/user.entity';

/**
 * HITO 6 - RF-06: ResourceResponsible Controller
 * Handles HTTP requests for resource responsibility assignments
 */
@ApiTags('Resource Responsibles')
@Controller('resource-responsibles')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class ResourceResponsibleController {
  constructor(private readonly resourceResponsibleService: ResourceResponsibleService) {}

  /**
   * Assigns a user as responsible for a resource
   */
  @Post(':resourceId/users/:userId')
  @Roles('ADMIN_GENERAL', 'ADMIN_PROGRAMA')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Assign user as responsible for resource',
    description: 'Assigns a user as responsible for a resource. Only administrators can manage resource responsibilities.',
  })
  @ApiParam({
    name: 'resourceId',
    description: 'Resource ID',
    type: String,
  })
  @ApiParam({
    name: 'userId',
    description: 'User ID',
    type: String,
  })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'User assigned as responsible successfully',
    type: SuccessResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Resource or user not found',
  })
  @ApiResponse({
    status: HttpStatus.CONFLICT,
    description: 'User is already responsible for this resource',
  })
  @ApiResponse({
    status: HttpStatus.FORBIDDEN,
    description: 'Insufficient permissions',
  })
  async assignResponsible(
    @Param('resourceId') resourceId: string,
    @Param('userId') userId: string,
    @CurrentUser() user: UserEntity,
  ) {
    const assignment = await this.resourceResponsibleService.assignResponsible({
      resourceId,
      userId,
      assignedBy: user.id!,
    });
    return ResponseUtil.success(assignment, 'User assigned as responsible successfully');
  }

  /**
   * Assigns multiple users as responsible for a resource
   */
  @Post(':resourceId/users')
  @Roles('ADMIN_GENERAL', 'ADMIN_PROGRAMA')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Assign multiple users as responsible for resource',
    description: 'Assigns multiple users as responsible for a resource.',
  })
  @ApiParam({
    name: 'resourceId',
    description: 'Resource ID',
    type: String,
  })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'Users assigned as responsible successfully',
    type: SuccessResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'At least one user must be provided',
  })
  @ApiResponse({
    status: HttpStatus.FORBIDDEN,
    description: 'Insufficient permissions',
  })
  async assignMultipleResponsibles(
    @Param('resourceId') resourceId: string,
    @Body() body: { userIds: string[] },
    @CurrentUser() user: UserEntity,
  ) {
    const assignments = await this.resourceResponsibleService.assignMultipleResponsibles(
      resourceId,
      body.userIds,
      user.id!,
    );
    return ResponseUtil.success(assignments, 'Users assigned as responsible successfully');
  }

  /**
   * Replaces all responsible users for a resource
   */
  @Put(':resourceId/users')
  @Roles('ADMIN_GENERAL', 'ADMIN_PROGRAMA')
  @ApiOperation({
    summary: 'Replace resource responsible users',
    description: 'Replaces all responsible users for a resource with new ones.',
  })
  @ApiParam({
    name: 'resourceId',
    description: 'Resource ID',
    type: String,
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Resource responsible users replaced successfully',
    type: SuccessResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'At least one user must be provided',
  })
  @ApiResponse({
    status: HttpStatus.FORBIDDEN,
    description: 'Insufficient permissions',
  })
  async replaceResourceResponsibles(
    @Param('resourceId') resourceId: string,
    @Body() body: { userIds: string[] },
    @CurrentUser() user: UserEntity,
  ) {
    const replacedResponsibles = await this.resourceResponsibleService.replaceResourceResponsibles(
      resourceId,
      body.userIds,
      user.id!,
    );
    return ResponseUtil.success(replacedResponsibles, 'Resource responsible users replaced successfully');
  }

  /**
   * Gets all users responsible for a resource
   */
  @Get(':resourceId/users')
  @ApiOperation({
    summary: 'Get resource responsible users',
    description: 'Retrieves all users responsible for a specific resource.',
  })
  @ApiParam({
    name: 'resourceId',
    description: 'Resource ID',
    type: String,
  })
  @ApiQuery({
    name: 'activeOnly',
    required: false,
    type: Boolean,
    description: 'Filter by active assignments only (default: true)',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Resource responsible users retrieved successfully',
    type: SuccessResponseDto,
  })
  async getResourceResponsibles(
    @Param('resourceId') resourceId: string,
    @Query('activeOnly') activeOnly: boolean = true,
  ) {
    const responsibles = await this.resourceResponsibleService.getResourceResponsibles({ resourceId, activeOnly });
    return ResponseUtil.success(responsibles, 'Resource responsible users retrieved successfully');
  }

  /**
   * Gets all resources a user is responsible for
   */
  @Get('users/:userId/resources')
  @ApiOperation({
    summary: 'Get user responsibilities',
    description: 'Retrieves all resources a user is responsible for.',
  })
  @ApiParam({
    name: 'userId',
    description: 'User ID',
    type: String,
  })
  @ApiQuery({
    name: 'activeOnly',
    required: false,
    type: Boolean,
    description: 'Filter by active assignments only (default: true)',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'User responsibilities retrieved successfully',
    type: SuccessResponseDto,
  })
  async getUserResponsibilities(
    @Param('userId') userId: string,
    @Query('activeOnly') activeOnly: boolean = true,
  ) {
    const responsibilities = await this.resourceResponsibleService.getUserResponsibilities({ userId, activeOnly });
    return ResponseUtil.success(responsibilities, 'User responsibilities retrieved successfully');
  }

  /**
   * Gets resources managed by current user
   */
  @Get('my-resources')
  @ApiOperation({
    summary: 'Get my managed resources',
    description: 'Retrieves all resources the current user is responsible for.',
  })
  @ApiQuery({
    name: 'activeOnly',
    required: false,
    type: Boolean,
    description: 'Filter by active assignments only (default: true)',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'User managed resources retrieved successfully',
    type: SuccessResponseDto,
  })
  async getMyResponsibilities(
    @CurrentUser() user: UserEntity,
    @Query('activeOnly') activeOnly: boolean = true,
  ) {
    const myResponsibilities = await this.resourceResponsibleService.getUserResponsibilities(user.id!, activeOnly);
    return ResponseUtil.success(myResponsibilities, 'User managed resources retrieved successfully');
  }

  /**
   * Gets resources managed by a user with pagination
   */
  @Get('users/:userId/resources/paginated')
  @ApiOperation({
    summary: 'Get user resources with pagination',
    description: 'Retrieves resources managed by a user with pagination.',
  })
  @ApiParam({
    name: 'userId',
    description: 'User ID',
    type: String,
  })
  @ApiQuery({
    name: 'page',
    required: false,
    type: Number,
    description: 'Page number (default: 1)',
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    type: Number,
    description: 'Items per page (default: 10)',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'User resources retrieved successfully',
    schema: {
      type: 'object',
      properties: {
        assignments: {
          type: 'array',
          items: { $ref: '#/components/schemas/ResourceResponsibleResponseDto' },
        },
        total: { type: 'number' },
        page: { type: 'number' },
        limit: { type: 'number' },
      },
    },
  })
  async getResourcesByUser(
    @Param('userId') userId: string,
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 10,
  ): Promise<{
    assignments: ResourceResponsibleResponseDto[];
    total: number;
    page: number;
    limit: number;
  }> {
    return await this.resourceResponsibleService.getResourcesByUser({ userId, page, limit });
  }

  /**
   * Checks if a user is responsible for a specific resource
   */
  @Get(':resourceId/users/:userId/exists')
  @ApiOperation({
    summary: 'Check user responsibility',
    description: 'Checks if a user is responsible for a specific resource.',
  })
  @ApiParam({
    name: 'resourceId',
    description: 'Resource ID',
    type: String,
  })
  @ApiParam({
    name: 'userId',
    description: 'User ID',
    type: String,
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Responsibility check completed',
    schema: {
      type: 'object',
      properties: {
        isResponsible: { type: 'boolean' },
      },
    },
  })
  async isUserResponsibleForResource(
    @Param('resourceId') resourceId: string,
    @Param('userId') userId: string,
  ): Promise<{ isResponsible: boolean }> {
    const isResponsible = await this.resourceResponsibleService.isUserResponsibleForResource({
      resourceId,
      userId,
    });
    return { isResponsible };
  }

  /**
   * Deactivates a user's responsibility for a resource
   */
  @Delete(':resourceId/users/:userId')
  @Roles('ADMIN_GENERAL', 'ADMIN_PROGRAMA')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({
    summary: 'Deactivate user responsibility',
    description: 'Deactivates a user\'s responsibility for a resource.',
  })
  @ApiParam({
    name: 'resourceId',
    description: 'Resource ID',
    type: String,
  })
  @ApiParam({
    name: 'userId',
    description: 'User ID',
    type: String,
  })
  @ApiResponse({
    status: HttpStatus.NO_CONTENT,
    description: 'User responsibility deactivated successfully',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'User is not assigned as responsible for this resource',
  })
  @ApiResponse({
    status: HttpStatus.CONFLICT,
    description: 'User responsibility is already inactive',
  })
  @ApiResponse({
    status: HttpStatus.FORBIDDEN,
    description: 'Insufficient permissions',
  })
  async deactivateResponsible(
    @Param('resourceId') resourceId: string,
    @Param('userId') userId: string,
    @CurrentUser() user: UserEntity,
  ): Promise<void> {
    await this.resourceResponsibleService.deactivateResponsible({ resourceId, userId });
  }

  /**
   * Deactivates all responsibilities for a resource
   */
  @Delete(':resourceId/users')
  @Roles('ADMIN_GENERAL', 'ADMIN_PROGRAMA')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({
    summary: 'Deactivate all resource responsibilities',
    description: 'Deactivates all user responsibilities for a resource.',
  })
  @ApiParam({
    name: 'resourceId',
    description: 'Resource ID',
    type: String,
  })
  @ApiResponse({
    status: HttpStatus.NO_CONTENT,
    description: 'All resource responsibilities deactivated successfully',
  })
  @ApiResponse({
    status: HttpStatus.FORBIDDEN,
    description: 'Insufficient permissions',
  })
  async deactivateAllResourceResponsibles(
    @Param('resourceId') resourceId: string,
    @CurrentUser() user: UserEntity,
  ): Promise<void> {
    await this.resourceResponsibleService.deactivateAllResourceResponsibles(resourceId);
  }

  /**
   * Gets responsibility assignments with pagination and filters
   */
  @Get()
  @Roles('ADMIN_GENERAL', 'ADMIN_PROGRAMA')
  @ApiOperation({
    summary: 'Get all responsibilities with pagination',
    description: 'Retrieves all responsibility assignments with optional filtering.',
  })
  @ApiQuery({
    name: 'page',
    required: false,
    type: Number,
    description: 'Page number (default: 1)',
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    type: Number,
    description: 'Items per page (default: 10)',
  })
  @ApiQuery({
    name: 'resourceId',
    required: false,
    type: String,
    description: 'Filter by resource ID',
  })
  @ApiQuery({
    name: 'userId',
    required: false,
    type: String,
    description: 'Filter by user ID',
  })
  @ApiQuery({
    name: 'isActive',
    required: false,
    type: Boolean,
    description: 'Filter by active status',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Responsibilities retrieved successfully',
    schema: {
      type: 'object',
      properties: {
        responsibles: {
          type: 'array',
          items: { $ref: '#/components/schemas/ResourceResponsibleResponseDto' },
        },
        total: { type: 'number' },
        page: { type: 'number' },
        limit: { type: 'number' },
      },
    },
  })
  @ApiResponse({
    status: HttpStatus.FORBIDDEN,
    description: 'Insufficient permissions',
  })
  async getResponsibilities(
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 10,
    @Query('resourceId') resourceId?: string,
    @Query('userId') userId?: string,
    @Query('isActive') isActive?: boolean,
  ): Promise<{
    responsibles: ResourceResponsibleResponseDto[];
    total: number;
    page: number;
    limit: number;
  }> {
    const filters: any = {};
    
    if (resourceId) filters.resourceId = resourceId;
    if (userId) filters.userId = userId;
    if (isActive !== undefined) filters.isActive = isActive;

    return await this.resourceResponsibleService.getResponsibilities({ page, limit, ...filters });
  }

  /**
   * Bulk assigns a user as responsible for multiple resources
   */
  @Post('users/:userId/resources')
  @Roles('ADMIN_GENERAL', 'ADMIN_PROGRAMA')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Bulk assign user to resources',
    description: 'Assigns a user as responsible for multiple resources in bulk.',
  })
  @ApiParam({
    name: 'userId',
    description: 'User ID',
    type: String,
  })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'User assigned to resources successfully',
    type: [ResourceResponsibleResponseDto],
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'At least one resource must be provided',
  })
  @ApiResponse({
    status: HttpStatus.FORBIDDEN,
    description: 'Insufficient permissions',
  })
  async bulkAssignResponsibleToResources(
    @Param('userId') userId: string,
    @Body() body: { resourceIds: string[] },
    @CurrentUser() user: UserEntity,
  ): Promise<ResourceResponsibleResponseDto[]> {
    return await this.resourceResponsibleService.bulkAssignResponsibleToResources({
      resourceIds: body.resourceIds,
      userId,
      assignedBy: user.id!,
    });
  }

  /**
   * Transfers responsibilities from one user to another
   */
  @Post('transfer')
  @Roles('ADMIN_GENERAL', 'ADMIN_PROGRAMA')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Transfer responsibilities',
    description: 'Transfers resource responsibilities from one user to another.',
  })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'Responsibilities transferred successfully',
    type: [ResourceResponsibleResponseDto],
  })
  @ApiResponse({
    status: HttpStatus.FORBIDDEN,
    description: 'Insufficient permissions',
  })
  async transferResponsibilities(
    @Body() body: {
      fromUserId: string;
      toUserId: string;
      resourceIds?: string[];
    },
    @CurrentUser() user: UserEntity,
  ): Promise<ResourceResponsibleResponseDto[]> {
    return await this.resourceResponsibleService.transferResponsibilities({
      fromUserId: body.fromUserId,
      toUserId: body.toUserId,
      assignedBy: user.id!,
      resourceIds: body.resourceIds,
    });
  }

  /**
   * Validates responsibility assignment data
   */
  @Post('validate')
  @Roles('ADMIN_GENERAL', 'ADMIN_PROGRAMA')
  @ApiOperation({
    summary: 'Validate responsibility assignment',
    description: 'Validates responsibility assignment data before processing.',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Validation completed',
    schema: {
      type: 'object',
      properties: {
        isValid: { type: 'boolean' },
        errors: {
          type: 'array',
          items: { type: 'string' },
        },
      },
    },
  })
  @ApiResponse({
    status: HttpStatus.FORBIDDEN,
    description: 'Insufficient permissions',
  })
  async validateResponsibilityAssignment(
    @Body() body: { resourceId: string; userIds: string[] },
  ): Promise<{ isValid: boolean; errors: string[] }> {
    return await this.resourceResponsibleService.validateResponsibilityAssignment(
      body.resourceId,
      body.userIds,
    );
  }
}
