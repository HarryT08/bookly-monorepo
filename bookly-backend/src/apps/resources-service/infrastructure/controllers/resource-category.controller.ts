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
import { ResourceCategoryService } from '@apps/resources-service/application/services/resource-category.service';
import {
  ResourceCategoryResponseDto,
} from '@apps/resources-service/application/dtos/resource-category.dto';
import { JwtAuthGuard } from '@libs/common/guards/jwt-auth.guard';
import { RolesGuard } from '@libs/common/guards/roles.guard';
import { Roles } from '@libs/common/decorators/roles.decorator';
import { CurrentUser } from '@libs/common/decorators/current-user.decorator';
import { UserEntity } from '@apps/auth-service/domain/entities/user.entity';
import { RESOURCES_URLS } from '@apps/resources-service/utils/maps/urls.map';
import { UserRole } from '@libs/common/enums/user-role.enum';

/**
 * HITO 6 - RF-02: ResourceCategory Controller
 * Handles HTTP requests for resource-category associations
 */
@ApiTags(RESOURCES_URLS.RESOURCE_CATEGORY_TAG)
@Controller(RESOURCES_URLS.RESOURCE_CATEGORY)
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class ResourceCategoryController {
  constructor(private readonly resourceCategoryService: ResourceCategoryService) {}

  /**
   * Assigns a single category to a resource
   */
  @Post(RESOURCES_URLS.RESOURCE_CATEGORY_ASSIGN)
  @Roles(UserRole.GENERAL_ADMIN, UserRole.PROGRAM_ADMIN)
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Assign category to resource',
    description: 'Assigns a single category to a resource. Only administrators can manage resource categories.',
  })
  @ApiParam({
    name: 'resourceId',
    description: 'Resource ID',
    type: String,
  })
  @ApiParam({
    name: 'categoryId',
    description: 'Category ID',
    type: String,
  })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'Category assigned to resource successfully',
    type: ResourceCategoryResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.CONFLICT,
    description: 'Resource is already assigned to this category',
  })
  @ApiResponse({
    status: HttpStatus.FORBIDDEN,
    description: 'Insufficient permissions',
  })
  async assignCategoryToResource(
    @Param('resourceId') resourceId: string,
    @Param('categoryId') categoryId: string,
    @CurrentUser() user: UserEntity,
  ): Promise<ResourceCategoryResponseDto> {
    return await this.resourceCategoryService.assignCategoryToResource(
      resourceId,
      categoryId,
      user.id!,
    );
  }

  /**
   * Assigns multiple categories to a resource
   */
  @Post(RESOURCES_URLS.RESOURCE_CATEGORY_ASSIGN_MULTIPLE)
  @Roles(UserRole.GENERAL_ADMIN, UserRole.PROGRAM_ADMIN)
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Assign multiple categories to resource',
    description: 'Assigns multiple categories to a resource. Only administrators can manage resource categories.',
  })
  @ApiParam({
    name: 'resourceId',
    description: 'Resource ID',
    type: String,
  })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'Categories assigned to resource successfully',
    type: [ResourceCategoryResponseDto],
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'At least one category must be provided',
  })
  @ApiResponse({
    status: HttpStatus.FORBIDDEN,
    description: 'Insufficient permissions',
  })
  async assignCategoriesToResource(
    @Param('resourceId') resourceId: string,
    @Body() body: { categoryIds: string[] },
    @CurrentUser() user: UserEntity,
  ): Promise<ResourceCategoryResponseDto[]> {
    return await this.resourceCategoryService.assignCategoriesToResource(
      resourceId,
      body.categoryIds,
      user.id!,
    );
  }

  /**
   * Replaces all categories for a resource
   */
  @Put(RESOURCES_URLS.RESOURCE_CATEGORY_REPLACE)
  @Roles(UserRole.GENERAL_ADMIN, UserRole.PROGRAM_ADMIN)
  @ApiOperation({
    summary: 'Replace resource categories',
    description: 'Replaces all categories assigned to a resource with new ones.',
  })
  @ApiParam({
    name: 'resourceId',
    description: 'Resource ID',
    type: String,
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Resource categories replaced successfully',
    type: [ResourceCategoryResponseDto],
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'At least one category must be provided',
  })
  @ApiResponse({
    status: HttpStatus.FORBIDDEN,
    description: 'Insufficient permissions',
  })
  async replaceResourceCategories(
    @Param('resourceId') resourceId: string,
    @Body() body: { categoryIds: string[] },
    @CurrentUser() user: UserEntity,
  ): Promise<ResourceCategoryResponseDto[]> {
    return await this.resourceCategoryService.replaceResourceCategories(
      resourceId,
      body.categoryIds,
      user.id!,
    );
  }

  /**
   * Gets all categories assigned to a resource
   */
  @Get(RESOURCES_URLS.RESOURCE_CATEGORY_GET)
  @ApiOperation({
    summary: 'Get resource categories',
    description: 'Retrieves all categories assigned to a specific resource.',
  })
  @ApiParam({
    name: 'resourceId',
    description: 'Resource ID',
    type: String,
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Resource categories retrieved successfully',
    type: [ResourceCategoryResponseDto],
  })
  async getResourceCategories(
    @Param('resourceId') resourceId: string,
  ): Promise<ResourceCategoryResponseDto[]> {
    return await this.resourceCategoryService.getResourceCategories(resourceId);
  }

  /**
   * Gets all resources assigned to a category with pagination
   */
  @Get(RESOURCES_URLS.CATEGORY_RESOURCES_GET)
  @ApiOperation({
    summary: 'Get resources by category',
    description: 'Retrieves all resources assigned to a specific category with pagination.',
  })
  @ApiParam({
    name: 'categoryId',
    description: 'Category ID',
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
    description: 'Resources by category retrieved successfully',
    schema: {
      type: 'object',
      properties: {
        associations: {
          type: 'array',
          items: { $ref: '#/components/schemas/ResourceCategoryResponseDto' },
        },
        total: { type: 'number' },
        page: { type: 'number' },
        limit: { type: 'number' },
      },
    },
  })
  async getResourcesByCategory(
    @Param('categoryId') categoryId: string,
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 10,
  ): Promise<{
    associations: ResourceCategoryResponseDto[];
    total: number;
    page: number;
    limit: number;
  }> {
    return await this.resourceCategoryService.getResourcesByCategory(categoryId, page, limit);
  }

  /**
   * Checks if a resource is assigned to a specific category
   */
  @Get(RESOURCES_URLS.RESOURCE_CATEGORY_EXISTS)
  @ApiOperation({
    summary: 'Check resource-category assignment',
    description: 'Checks if a resource is assigned to a specific category.',
  })
  @ApiParam({
    name: 'resourceId',
    description: 'Resource ID',
    type: String,
  })
  @ApiParam({
    name: 'categoryId',
    description: 'Category ID',
    type: String,
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Assignment check completed',
    schema: {
      type: 'object',
      properties: {
        exists: { type: 'boolean' },
      },
    },
  })
  async isResourceAssignedToCategory(
    @Param('resourceId') resourceId: string,
    @Param('categoryId') categoryId: string,
  ): Promise<{ exists: boolean }> {
    const exists = await this.resourceCategoryService.isResourceAssignedToCategory(
      resourceId,
      categoryId,
    );
    return { exists };
  }

  /**
   * Removes a category from a resource
   */
  @Delete(RESOURCES_URLS.RESOURCE_CATEGORY_REMOVE)
  @Roles(UserRole.GENERAL_ADMIN, UserRole.PROGRAM_ADMIN)
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({
    summary: 'Remove category from resource',
    description: 'Removes a specific category assignment from a resource.',
  })
  @ApiParam({
    name: 'resourceId',
    description: 'Resource ID',
    type: String,
  })
  @ApiParam({
    name: 'categoryId',
    description: 'Category ID',
    type: String,
  })
  @ApiResponse({
    status: HttpStatus.NO_CONTENT,
    description: 'Category removed from resource successfully',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Resource is not assigned to this category',
  })
  @ApiResponse({
    status: HttpStatus.FORBIDDEN,
    description: 'Insufficient permissions',
  })
  async removeCategoryFromResource(
    @Param('resourceId') resourceId: string,
    @Param('categoryId') categoryId: string,
    @CurrentUser() user: UserEntity,
  ): Promise<void> {
    await this.resourceCategoryService.removeCategoryFromResource(resourceId, categoryId);
  }

  /**
   * Removes all categories from a resource
   */
  @Delete(RESOURCES_URLS.RESOURCE_CATEGORY_REMOVE_ALL)
  @Roles(UserRole.GENERAL_ADMIN, UserRole.PROGRAM_ADMIN)
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({
    summary: 'Remove all categories from resource',
    description: 'Removes all category assignments from a resource.',
  })
  @ApiParam({
    name: 'resourceId',
    description: 'Resource ID',
    type: String,
  })
  @ApiResponse({
    status: HttpStatus.NO_CONTENT,
    description: 'All categories removed from resource successfully',
  })
  @ApiResponse({
    status: HttpStatus.FORBIDDEN,
    description: 'Insufficient permissions',
  })
  async removeAllCategoriesFromResource(
    @Param('resourceId') resourceId: string,
    @CurrentUser() user: UserEntity,
  ): Promise<void> {
    await this.resourceCategoryService.removeAllCategoriesFromResource(resourceId);
  }

  /**
   * Bulk assigns a category to multiple resources
   */
  @Post(RESOURCES_URLS.CATEGORY_BULK_ASSIGN)
  @Roles(UserRole.GENERAL_ADMIN, UserRole.PROGRAM_ADMIN)
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Bulk assign category to resources',
    description: 'Assigns a category to multiple resources in bulk.',
  })
  @ApiParam({
    name: 'categoryId',
    description: 'Category ID',
    type: String,
  })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'Category assigned to resources successfully',
    type: [ResourceCategoryResponseDto],
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'At least one resource must be provided',
  })
  @ApiResponse({
    status: HttpStatus.FORBIDDEN,
    description: 'Insufficient permissions',
  })
  async bulkAssignCategoryToResources(
    @Param('categoryId') categoryId: string,
    @Body() body: { resourceIds: string[] },
    @CurrentUser() user: UserEntity,
  ): Promise<ResourceCategoryResponseDto[]> {
    return await this.resourceCategoryService.bulkAssignCategoryToResources(
      body.resourceIds,
      categoryId,
      user.id!,
    );
  }

  /**
   * Validates resource-category assignment data
   */
  @Post(RESOURCES_URLS.RESOURCE_CATEGORY_VALIDATE)
  @Roles(UserRole.GENERAL_ADMIN, UserRole.PROGRAM_ADMIN)
  @ApiOperation({
    summary: 'Validate resource-category assignment',
    description: 'Validates resource-category assignment data before processing.',
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
  async validateResourceCategoryAssignment(
    @Body() body: { resourceId: string; categoryIds: string[] },
  ): Promise<{ isValid: boolean; errors: string[] }> {
    return await this.resourceCategoryService.validateResourceCategoryAssignment(
      body.resourceId,
      body.categoryIds,
    );
  }
}
