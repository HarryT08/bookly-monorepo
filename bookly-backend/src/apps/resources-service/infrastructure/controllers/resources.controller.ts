import { 
  Controller, 
  Get, 
  Post, 
  Put, 
  Delete, 
  Body, 
  Param, 
  Query, 
  HttpCode, 
  HttpStatus, 
  ValidationPipe,
  NotFoundException,
  ParseIntPipe 
} from '@nestjs/common';
import { CurrentUser } from '@libs/common/decorators/current-user.decorator';
import { UserEntity } from '@apps/auth-service/domain/entities/user.entity';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiQuery,
  ApiBody,
} from '@nestjs/swagger';
import {
  UpdateResourceDto,
  DeleteResourceDto,
  ResourceResponseDto,
  PaginatedResourceResponseDto,
  ResourceAvailabilityResponseDto,
} from '@libs/dto/resources';
import { CreateResourceDto, AvailableScheduleDto } from '@libs/dto/resources/create-resource.dto';
import { PaginatedResponseDto, SuccessResponseDto } from '@libs/dto/common/response.dto';
import { ResponseUtil } from '@libs/common/utils/response.util';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { ResourceEntity } from '@apps/resources-service/domain/entities/resource.entity';
import { CreateResourceCommand } from '@apps/resources-service/application/commands/create-resource.command';
import { UpdateResourceCommand } from '@apps/resources-service/application/commands/update-resource.command';
import { DeleteResourceCommand } from '@apps/resources-service/application/commands/delete-resource.command';
import { GetResourceQuery, GetResourceByCodeQuery } from '@apps/resources-service/application/queries/get-resource.query';
import { GetResourcesQuery, GetResourcesWithPaginationQuery, SearchResourcesQuery, CheckResourceAvailabilityQuery } from '@apps/resources-service/application/queries/get-resources.query';
import { RESOURCES_URLS } from '../../utils/maps/urls.map';

/**
 * Resources Controller
 * Implements RF-01, RF-03, RF-05 from Hito 1
 * RESTful API for resource management with CQRS pattern
 */
@ApiTags('Resources')
@Controller(RESOURCES_URLS.RESOURCES)
export class ResourcesController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
  ) {}

  /**
   * Create a new resource
   * Implements RF-01 (create resource)
   */
  @Post(RESOURCES_URLS.RESOURCE_CREATE)
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ 
    summary: 'Create new resource',
    description: 'Creates a new resource with auto-generated unique code. Implements RF-01 and RF-03.'
  })
  @ApiBody({ type: CreateResourceDto })
  @ApiResponse({ 
    status: 201, 
    description: 'Resource created successfully',
    type: SuccessResponseDto 
  })
  @ApiResponse({ status: 400, description: 'Invalid input data' })
  @ApiResponse({ status: 409, description: 'Resource code already exists' })
  async create(@Body(ValidationPipe) createResourceDto: CreateResourceDto, @CurrentUser() currentUser: UserEntity) {
    const command = new CreateResourceCommand(createResourceDto, currentUser.id);
    const resource: ResourceEntity = await this.commandBus.execute(command);
    const responseData = this.mapToResponseDto(resource);
    return ResponseUtil.success(responseData, 'Resource created successfully');
  }

  /**
   * Get all resources with optional filters
   */
  @Get('/')
  @ApiOperation({ 
    summary: 'Get all resources',
    description: 'Retrieves all resources with optional filtering by type, status, category, etc.'
  })
  @ApiQuery({ name: 'type', required: false, description: 'Filter by resource type' })
  @ApiQuery({ name: 'status', required: false, description: 'Filter by resource status' })
  @ApiQuery({ name: 'categoryId', required: false, description: 'Filter by category ID' })
  @ApiQuery({ name: 'isActive', required: false, type: Boolean, description: 'Filter by active status' })
  @ApiQuery({ name: 'location', required: false, description: 'Filter by location (partial match)' })
  @ApiResponse({ 
    status: 200, 
    description: 'Resources retrieved successfully',
    type: SuccessResponseDto
  })
  async findAll(
    @Query('type') type?: string,
    @Query('status') status?: string,
    @Query('categoryId') categoryId?: string,
    @Query('isActive') isActive?: boolean,
    @Query('location') location?: string,
  ) {
    const filters = {
      type,
      status,
      categoryId,
      isActive,
      location,
    };

    const query = new GetResourcesQuery(filters);
    const resources: ResourceEntity[] = await this.queryBus.execute(query);
    const responseData = resources.map(resource => this.mapToResponseDto(resource));
    return ResponseUtil.list(responseData, 'Resources retrieved successfully');
  }

  /**
   * Get resources with pagination
   */
  @Get('/paginated')
  @ApiOperation({ 
    summary: 'Get resources with pagination',
    description: 'Retrieves resources with pagination support and optional filtering.'
  })
  @ApiQuery({ name: 'page', required: false, type: Number, description: 'Page number (default: 1)' })
  @ApiQuery({ name: 'limit', required: false, type: Number, description: 'Items per page (default: 10)' })
  @ApiQuery({ name: 'type', required: false, description: 'Filter by resource type' })
  @ApiQuery({ name: 'status', required: false, description: 'Filter by resource status' })
  @ApiQuery({ name: 'categoryId', required: false, description: 'Filter by category ID' })
  @ApiQuery({ name: 'isActive', required: false, type: Boolean, description: 'Filter by active status' })
  @ApiQuery({ name: 'location', required: false, description: 'Filter by location (partial match)' })
  @ApiResponse({ 
    status: 200, 
    description: 'Paginated resources retrieved successfully',
    type: PaginatedResponseDto
  })
  async findAllPaginated(
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 10,
    @Query('type') type?: string,
    @Query('status') status?: string,
    @Query('categoryId') categoryId?: string,
    @Query('isActive') isActive?: boolean,
    @Query('location') location?: string,
  ) {
    const filters = {
      type,
      status,
      categoryId,
      isActive,
      location,
    };

    const query = new GetResourcesWithPaginationQuery(Number(page), Number(limit), filters);
    const result = await this.queryBus.execute(query);
    const responseData = result.resources.map(resource => this.mapToResponseDto(resource));
    return ResponseUtil.paginated(responseData, result.total, Number(page), Number(limit), 'Resources retrieved successfully');
  }

  /**
   * Search resources by name or description
   */
  @Get('/search')
  @ApiOperation({ 
    summary: 'Search resources',
    description: 'Search resources by name, description, or code.'
  })
  @ApiQuery({ name: 'query', description: 'Search query' })
  @ApiQuery({ name: 'type', required: false, description: 'Filter by resource type' })
  @ApiResponse({ 
    status: 200, 
    description: 'Search results retrieved successfully',
    type: SuccessResponseDto
  })
  async search(
    @Query('query') query: string,
    @Query('type') type?: string,
  ) {
    const searchQuery = new SearchResourcesQuery(query);
    const resources: ResourceEntity[] = await this.queryBus.execute(searchQuery);
    const responseData = resources.map(resource => this.mapToResponseDto(resource));
    return ResponseUtil.list(responseData, 'Search completed successfully');
  }

  /**
   * Get resource by ID
   */
  @Get(RESOURCES_URLS.RESOURCE_UPDATE)
  @ApiOperation({ 
    summary: 'Get resource by ID',
    description: 'Retrieves a single resource by its unique identifier.'
  })
  @ApiParam({ name: 'id', description: 'Resource ID' })
  @ApiResponse({ 
    status: 200, 
    description: 'Resource retrieved successfully',
    type: SuccessResponseDto
  })
  @ApiResponse({ status: 404, description: 'Resource not found' })
  async findOne(@Param('id') id: string) {
    const query = new GetResourceQuery(id);
    const resource: ResourceEntity = await this.queryBus.execute(query);
    const responseData = this.mapToResponseDto(resource);
    return ResponseUtil.success(responseData, 'Resource retrieved successfully');
  }

  /**
   * Get resource by code
   */
  @Get('/code/:code')
  @ApiOperation({ 
    summary: 'Get resource by code',
    description: 'Retrieves a single resource by its unique code.'
  })
  @ApiParam({ name: 'code', description: 'Resource code' })
  @ApiResponse({ 
    status: 200, 
    description: 'Resource retrieved successfully',
    type: SuccessResponseDto 
  })
  @ApiResponse({ status: 404, description: 'Resource not found' })
  async findByCode(@Param('code') code: string) {
    const query = new GetResourceByCodeQuery(code);
    const resource: ResourceEntity = await this.queryBus.execute(query);
    const responseData = this.mapToResponseDto(resource);
    return ResponseUtil.success(responseData, 'Resource retrieved successfully');
  }

  /**
   * Check resource availability
   * Implements RF-05 (availability rules)
   */
  @Get('/:id/availability')
  @ApiOperation({ 
    summary: 'Check resource availability',
    description: 'Checks if a resource is available for reservation based on configured rules. Implements RF-05.'
  })
  @ApiParam({ name: 'id', description: 'Resource ID' })
  @ApiQuery({ name: 'date', description: 'Requested date (ISO string)' })
  @ApiQuery({ name: 'userType', description: 'User type making the request' })
  @ApiQuery({ name: 'duration', type: Number, description: 'Reservation duration in minutes' })
  @ApiResponse({ 
    status: 200, 
    description: 'Availability check completed',
    type: SuccessResponseDto 
  })
  @ApiResponse({ status: 404, description: 'Resource not found' })
  async checkAvailability(
    @Param('id') id: string,
    @Query('date') date: string,
    @Query('userType') userType: string,
    @Query('duration', ParseIntPipe) duration: number,
  ) {
    const requestedDate = new Date(date);
    const query = new CheckResourceAvailabilityQuery(id, requestedDate, userType, duration);
    const result = await this.queryBus.execute(query);
    
    const responseData = {
      available: result.available,
      reason: result.reason,
      priority: result.priority,
    };
    
    return ResponseUtil.success(responseData, 'Availability check completed');
  }

  /**
   * Update an existing resource
   * Implements RF-01 (edit resource)
   */
  @Put(RESOURCES_URLS.RESOURCE_UPDATE)
  @ApiOperation({ 
    summary: 'Update resource',
    description: 'Updates an existing resource. Implements RF-01 and RF-03.'
  })
  @ApiParam({ name: 'id', description: 'Resource ID' })
  @ApiBody({ type: UpdateResourceDto })
  @ApiResponse({ 
    status: 200, 
    description: 'Resource updated successfully',
    type: SuccessResponseDto 
  })
  @ApiResponse({ status: 400, description: 'Invalid input data' })
  @ApiResponse({ status: 404, description: 'Resource not found' })
  async update(
    @Param('id') id: string,
    @Body(ValidationPipe) updateResourceDto: UpdateResourceDto,
    @CurrentUser() currentUser: UserEntity,
  ) {
    const updateData = {
      ...updateResourceDto,
      updatedBy: currentUser.id,
    };

    const commandData = { id, ...updateData };
    const command = new UpdateResourceCommand(commandData);
    const resource: ResourceEntity = await this.commandBus.execute(command);
    const responseData = this.mapToResponseDto(resource);
    return ResponseUtil.success(responseData, 'Resource updated successfully');
  }

  /**
   * Delete a resource
   * Implements RF-01 (delete resource)
   * Supports both soft delete (when has relations) and hard delete (when no relations)
   */
  @Delete(RESOURCES_URLS.RESOURCE_DELETE)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ 
    summary: 'Delete resource',
    description: 'Deletes a resource. Uses soft delete if resource has active relations, hard delete otherwise. Implements RF-01.'
  })
  @ApiParam({ name: 'id', description: 'Resource ID' })
  @ApiQuery({ name: 'force', required: false, type: Boolean, description: 'Force hard delete even with relations' })
  @ApiResponse({ status: 200, description: 'Resource deleted successfully', type: SuccessResponseDto })
  @ApiResponse({ status: 400, description: 'Cannot delete resource with active relations' })
  @ApiResponse({ status: 404, description: 'Resource not found' })
  async delete(
    @Param('id') id: string,
    @CurrentUser() currentUser: UserEntity,
    @Query('force') force?: boolean,
  ) {
    const deleteData = {
      id,
      deletedBy: currentUser.id,
      force: force || false,
    };
    const command = new DeleteResourceCommand(deleteData);
    await this.commandBus.execute(command);
    return ResponseUtil.success(null, 'Resource deleted successfully');
  }


  /**
   * Map resource entity to response DTO
   */
  private mapToResponseDto(resource: ResourceEntity): ResourceResponseDto {
    return {
      id: resource.id,
      name: resource.name,
      code: resource.code,
      type: resource.type,
      description: resource.description,
      capacity: resource.capacity,
      location: resource.location,
      programId: resource.programId,
      status: resource.status,
      attributes: resource.attributes,
      availableSchedules: resource.availableSchedules,
      categoryId: resource.categoryId,
      isActive: resource.isActive,
      createdAt: resource.createdAt,
      updatedAt: resource.updatedAt,
    };
  }
}
