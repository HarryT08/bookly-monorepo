import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Param,
  Body,
  Query,
  HttpCode,
  HttpStatus,
  ValidationPipe,
  ParseIntPipe,
  DefaultValuePipe,
} from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
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
  ResourceResponseDto,
  PaginatedResourceResponseDto,
  ResourceAvailabilityResponseDto,
} from '../../../../libs/dto/resources';
import { CreateResourceDto, AvailableScheduleDto } from '../../../../libs/dto/resources/create-resource.dto';
import { CreateResourceCommand } from '../../application/commands/create-resource.command';
import { UpdateResourceCommand } from '../../application/commands/update-resource.command';
import { DeleteResourceCommand } from '../../application/commands/delete-resource.command';
import {
  GetResourceQuery,
  GetResourceByCodeQuery,
} from '../../application/queries/get-resource.query';
import {
  GetResourcesQuery,
  GetResourcesWithPaginationQuery,
  SearchResourcesQuery,
  CheckResourceAvailabilityQuery,
} from '../../application/queries/get-resources.query';
import { ResourceEntity } from '../../domain/entities/resource.entity';

/**
 * Resources Controller
 * Implements RF-01, RF-03, RF-05 from Hito 1
 * RESTful API for resource management with CQRS pattern
 */
@ApiTags('Resources')
@Controller('resources')
export class ResourcesController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
  ) {}

  /**
   * Create a new resource
   * Implements RF-01 (create resource)
   */
  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ 
    summary: 'Create new resource',
    description: 'Creates a new resource with auto-generated unique code. Implements RF-01 and RF-03.'
  })
  @ApiBody({ type: CreateResourceDto })
  @ApiResponse({ 
    status: 201, 
    description: 'Resource created successfully',
    type: ResourceResponseDto 
  })
  @ApiResponse({ status: 400, description: 'Invalid input data' })
  @ApiResponse({ status: 409, description: 'Resource code already exists' })
  async create(@Body(ValidationPipe) createResourceDto: CreateResourceDto): Promise<ResourceResponseDto> {
    const command = new CreateResourceCommand({
      name: createResourceDto.name,
      type: createResourceDto.type,
      capacity: createResourceDto.capacity || null,
      location: createResourceDto.location || null,
      programId: createResourceDto.programId,
      description: createResourceDto.description,
      attributes: createResourceDto.attributes,
      availableSchedules: createResourceDto.availableSchedules ? this.mapDtoToAvailableSchedule(createResourceDto.availableSchedules) : null,
      categoryId: createResourceDto.categoryId,
    });

    const resource: ResourceEntity = await this.commandBus.execute(command);
    return this.mapToResponseDto(resource);
  }

  /**
   * Get all resources with optional filters
   */
  @Get()
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
    type: [ResourceResponseDto] 
  })
  async findAll(
    @Query('type') type?: string,
    @Query('status') status?: string,
    @Query('categoryId') categoryId?: string,
    @Query('isActive') isActive?: boolean,
    @Query('location') location?: string,
  ): Promise<ResourceResponseDto[]> {
    const query = new GetResourcesQuery({
      type,
      status,
      categoryId,
      isActive,
      location,
    });

    const resources: ResourceEntity[] = await this.queryBus.execute(query);
    return resources.map(resource => this.mapToResponseDto(resource));
  }

  /**
   * Get resources with pagination
   */
  @Get('paginated')
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
  @ApiResponse({ 
    status: 200, 
    description: 'Paginated resources retrieved successfully',
    type: PaginatedResourceResponseDto 
  })
  async findWithPagination(
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('limit', new DefaultValuePipe(10), ParseIntPipe) limit: number,
    @Query('type') type?: string,
    @Query('status') status?: string,
    @Query('categoryId') categoryId?: string,
    @Query('isActive') isActive?: boolean,
  ): Promise<PaginatedResourceResponseDto> {
    const query = new GetResourcesWithPaginationQuery(page, limit, {
      type,
      status,
      categoryId,
      isActive,
    });

    const result = await this.queryBus.execute(query);
    
    return {
      resources: result.resources.map(resource => this.mapToResponseDto(resource)),
      total: result.total,
      page: result.page,
      limit: result.limit,
      totalPages: result.totalPages,
    };
  }

  /**
   * Search resources by name or description
   */
  @Get('search')
  @ApiOperation({ 
    summary: 'Search resources',
    description: 'Search resources by name, description, or code.'
  })
  @ApiQuery({ name: 'q', description: 'Search query' })
  @ApiResponse({ 
    status: 200, 
    description: 'Search results retrieved successfully',
    type: [ResourceResponseDto] 
  })
  async search(@Query('q') query: string): Promise<ResourceResponseDto[]> {
    const searchQuery = new SearchResourcesQuery(query);
    const resources: ResourceEntity[] = await this.queryBus.execute(searchQuery);
    return resources.map(resource => this.mapToResponseDto(resource));
  }

  /**
   * Get resource by ID
   */
  @Get(':id')
  @ApiOperation({ 
    summary: 'Get resource by ID',
    description: 'Retrieves a single resource by its unique identifier.'
  })
  @ApiParam({ name: 'id', description: 'Resource ID' })
  @ApiResponse({ 
    status: 200, 
    description: 'Resource retrieved successfully',
    type: ResourceResponseDto 
  })
  @ApiResponse({ status: 404, description: 'Resource not found' })
  async findById(@Param('id') id: string): Promise<ResourceResponseDto> {
    const query = new GetResourceQuery(id);
    const resource: ResourceEntity = await this.queryBus.execute(query);
    return this.mapToResponseDto(resource);
  }

  /**
   * Get resource by code
   */
  @Get('code/:code')
  @ApiOperation({ 
    summary: 'Get resource by code',
    description: 'Retrieves a single resource by its unique code.'
  })
  @ApiParam({ name: 'code', description: 'Resource code' })
  @ApiResponse({ 
    status: 200, 
    description: 'Resource retrieved successfully',
    type: ResourceResponseDto 
  })
  @ApiResponse({ status: 404, description: 'Resource not found' })
  async findByCode(@Param('code') code: string): Promise<ResourceResponseDto> {
    const query = new GetResourceByCodeQuery(code);
    const resource: ResourceEntity = await this.queryBus.execute(query);
    return this.mapToResponseDto(resource);
  }

  /**
   * Check resource availability
   * Implements RF-05 (availability rules)
   */
  @Get(':id/availability')
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
    type: ResourceAvailabilityResponseDto 
  })
  @ApiResponse({ status: 404, description: 'Resource not found' })
  async checkAvailability(
    @Param('id') id: string,
    @Query('date') date: string,
    @Query('userType') userType: string,
    @Query('duration', ParseIntPipe) duration: number,
  ): Promise<ResourceAvailabilityResponseDto> {
    const requestedDate = new Date(date);
    const query = new CheckResourceAvailabilityQuery(id, requestedDate, userType, duration);
    const result = await this.queryBus.execute(query);
    
    return {
      available: result.available,
      reason: result.reason,
      priority: result.priority,
    };
  }

  /**
   * Update an existing resource
   * Implements RF-01 (edit resource)
   */
  @Put(':id')
  @ApiOperation({ 
    summary: 'Update resource',
    description: 'Updates an existing resource. Implements RF-01 and RF-03.'
  })
  @ApiParam({ name: 'id', description: 'Resource ID' })
  @ApiBody({ type: UpdateResourceDto })
  @ApiResponse({ 
    status: 200, 
    description: 'Resource updated successfully',
    type: ResourceResponseDto 
  })
  @ApiResponse({ status: 400, description: 'Invalid input data' })
  @ApiResponse({ status: 404, description: 'Resource not found' })
  async update(
    @Param('id') id: string,
    @Body(ValidationPipe) updateResourceDto: UpdateResourceDto,
  ): Promise<ResourceResponseDto> {
    const command = new UpdateResourceCommand(
      id,
      updateResourceDto.name,
      updateResourceDto.type,
      updateResourceDto.capacity,
      updateResourceDto.location,
      updateResourceDto.status,
      updateResourceDto.description,
      updateResourceDto.attributes,
      updateResourceDto.availableSchedules ? this.mapDtoToAvailableSchedule(updateResourceDto.availableSchedules) : null,
      updateResourceDto.categoryId,
    );

    const resource: ResourceEntity = await this.commandBus.execute(command);
    return this.mapToResponseDto(resource);
  }

  /**
   * Delete a resource
   * Implements RF-01 (delete resource)
   * Supports both soft delete (when has relations) and hard delete (when no relations)
   */
  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ 
    summary: 'Delete resource',
    description: 'Deletes a resource. Uses soft delete if resource has active relations, hard delete otherwise. Implements RF-01.'
  })
  @ApiParam({ name: 'id', description: 'Resource ID' })
  @ApiQuery({ name: 'force', required: false, type: Boolean, description: 'Force hard delete even with relations' })
  @ApiResponse({ status: 204, description: 'Resource deleted successfully' })
  @ApiResponse({ status: 400, description: 'Cannot delete resource with active relations' })
  @ApiResponse({ status: 404, description: 'Resource not found' })
  async delete(
    @Param('id') id: string,
    @Query('force') force?: boolean,
  ): Promise<void> {
    const command = new DeleteResourceCommand(id, force || false);
    await this.commandBus.execute(command);
  }

  /**
   * Map AvailableScheduleDto to domain AvailableSchedule interface
   */
  private mapDtoToAvailableSchedule(dto: AvailableScheduleDto): any {
    // Create a basic mapping that maintains compatibility with existing functionality
    // This ensures the DTO can be used while preserving the domain structure
    return {
      operatingHours: dto.operatingHours,
      restrictions: dto.restrictions,
      priorities: dto.priorities,
      // Add default empty arrays for domain interface compatibility
      weeklySchedule: {},
      exceptions: [],
      maintenanceSchedules: []
    };
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
