import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Patch,
  Body,
  Param,
  Query,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiQuery,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '@libs/common/guards/jwt-auth.guard';
import { RolesGuard } from '@libs/common/guards/roles.guard';
import { Roles } from '@libs/common/decorators/roles.decorator';
import { UserRole } from '@libs/common/enums/user-role.enum';
import {
  CreateCategoryDto,
  UpdateCategoryDto,
  CategoryResponseDto,
} from '@libs/dto/categories';
import { REPORTS_URLS } from '@apps/reports-service/utils/maps/urls.map';

// Commands
import { CreateCategoryCommand } from '@apps/reports-service/application/commands/create-category.command';
import { UpdateCategoryCommand } from '@apps/reports-service/application/commands/update-category.command';
import { DeleteCategoryCommand } from '@apps/reports-service/application/commands/delete-category.command';
import { ReactivateCategoryCommand } from '@apps/reports-service/application/commands/reactivate-category.command';

// Queries
import { GetCategoriesQuery } from '@apps/reports-service/application/queries/get-categories.query';
import { GetCategoryByIdQuery } from '@apps/reports-service/application/queries/get-category-by-id.query';
import { GetActiveCategoriesQuery } from '@apps/reports-service/application/queries/get-active-categories.query';
import { GetDefaultCategoriesQuery } from '@apps/reports-service/application/queries/get-default-categories.query';

@ApiTags(REPORTS_URLS.REPORTS_CATEGORIES_TAG)
@Controller(REPORTS_URLS.REPORTS_CATEGORIES)
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class ReportsCategoryController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
  ) {}

  @Post()
  @Roles(UserRole.GENERAL_ADMIN, UserRole.PROGRAM_ADMIN)
  @ApiOperation({
    summary: 'Create a new category',
    description: 'Creates a new category for report classification in the reports service',
  })
  @ApiResponse({
    status: 201,
    description: 'Category created successfully',
    type: CategoryResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid input data or category name already exists',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized access',
  })
  @ApiResponse({
    status: 403,
    description: 'Insufficient permissions',
  })
  async createCategory(
    @Body() createCategoryDto: CreateCategoryDto,
  ): Promise<CategoryResponseDto> {
    const command = new CreateCategoryCommand(createCategoryDto);
    return this.commandBus.execute(command);
  }

  @Get()
  @Roles(UserRole.GENERAL_ADMIN, UserRole.GENERAL_STAFF, UserRole.PROGRAM_ADMIN, UserRole.STUDENT)
  @ApiOperation({
    summary: 'Get all categories with pagination and filters',
    description: 'Retrieves categories with optional filtering and pagination',
  })
  @ApiQuery({
    name: 'page',
    required: false,
    description: 'Page number (default: 1)',
    example: 1,
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    description: 'Items per page (default: 10)',
    example: 10,
  })
  @ApiQuery({
    name: 'name',
    required: false,
    description: 'Filter by category name',
    example: 'Academic',
  })
  @ApiQuery({
    name: 'isActive',
    required: false,
    description: 'Filter by active status',
    example: true,
  })
  @ApiQuery({
    name: 'isDefault',
    required: false,
    description: 'Filter by default status',
    example: false,
  })
  @ApiQuery({
    name: 'search',
    required: false,
    description: 'Search in name and description',
    example: 'report',
  })
  @ApiResponse({
    status: 200,
    description: 'Categories retrieved successfully',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized access',
  })
  async getCategories(
    @Query('page') page?: number,
    @Query('limit') limit?: number,
    @Query('name') name?: string,
    @Query('isActive') isActive?: boolean,
    @Query('isDefault') isDefault?: boolean,
    @Query('search') search?: string,
  ): Promise<any> {
    const filters = { name, isActive, isDefault, search };
    const pagination = { page: page || 1, limit: limit || 10 };
    const query = new GetCategoriesQuery(filters, pagination);
    return this.queryBus.execute(query);
  }

  @Get(REPORTS_URLS.REPORTS_CATEGORY_BY_ID)
  @Roles(UserRole.GENERAL_ADMIN, UserRole.GENERAL_STAFF, UserRole.PROGRAM_ADMIN, UserRole.STUDENT)
  @ApiOperation({
    summary: 'Get category by ID',
    description: 'Retrieves a specific category by its ID',
  })
  @ApiParam({
    name: 'id',
    description: 'Category ID',
    example: '507f1f77bcf86cd799439011',
  })
  @ApiResponse({
    status: 200,
    description: 'Category found successfully',
    type: CategoryResponseDto,
  })
  @ApiResponse({
    status: 404,
    description: 'Category not found',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized access',
  })
  async getCategoryById(@Param('id') id: string): Promise<CategoryResponseDto> {
    const query = new GetCategoryByIdQuery(id);
    return this.queryBus.execute(query);
  }

  @Get(REPORTS_URLS.REPORTS_CATEGORIES_ACTIVE)
  @Roles(UserRole.GENERAL_ADMIN, UserRole.GENERAL_STAFF, UserRole.PROGRAM_ADMIN, UserRole.STUDENT)
  @ApiOperation({
    summary: 'Get all active categories',
    description: 'Retrieves all categories that are currently active',
  })
  @ApiResponse({
    status: 200,
    description: 'Active categories retrieved successfully',
    type: [CategoryResponseDto],
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized access',
  })
  async getActiveCategories(): Promise<CategoryResponseDto[]> {
    const query = new GetActiveCategoriesQuery();
    return this.queryBus.execute(query);
  }

  @Get(REPORTS_URLS.REPORTS_CATEGORIES_DEFAULTS)
  @Roles(UserRole.GENERAL_ADMIN, UserRole.GENERAL_STAFF, UserRole.PROGRAM_ADMIN)
  @ApiOperation({
    summary: 'Get all default categories',
    description: 'Retrieves all categories that are marked as default',
  })
  @ApiResponse({
    status: 200,
    description: 'Default categories retrieved successfully',
    type: [CategoryResponseDto],
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized access',
  })
  async getDefaultCategories(): Promise<CategoryResponseDto[]> {
    const query = new GetDefaultCategoriesQuery();
    return this.queryBus.execute(query);
  }

  @Put(REPORTS_URLS.REPORTS_CATEGORY_UPDATE)
  @Roles(UserRole.GENERAL_ADMIN, UserRole.GENERAL_STAFF, UserRole.PROGRAM_ADMIN)
  @ApiOperation({
    summary: 'Update category',
    description: 'Updates an existing category with new information',
  })
  @ApiParam({
    name: 'id',
    description: 'Category ID',
    example: '507f1f77bcf86cd799439011',
  })
  @ApiResponse({
    status: 200,
    description: 'Category updated successfully',
    type: CategoryResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid input data or category name already exists',
  })
  @ApiResponse({
    status: 404,
    description: 'Category not found',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized access',
  })
  @ApiResponse({
    status: 403,
    description: 'Insufficient permissions',
  })
  async updateCategory(
    @Param('id') id: string,
    @Body() updateCategoryDto: UpdateCategoryDto,
  ): Promise<CategoryResponseDto> {
    const command = new UpdateCategoryCommand(id, updateCategoryDto);
    return this.commandBus.execute(command);
  }

  @Delete(REPORTS_URLS.REPORTS_CATEGORY_DELETE)
  @Roles(UserRole.GENERAL_ADMIN, UserRole.GENERAL_STAFF, UserRole.PROGRAM_ADMIN)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Deactivate category',
    description: 'Deactivates a category (soft delete). Default categories cannot be deactivated.',
  })
  @ApiParam({
    name: 'id',
    description: 'Category ID',
    example: '507f1f77bcf86cd799439011',
  })
  @ApiResponse({
    status: 200,
    description: 'Category deactivated successfully',
    type: CategoryResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: 'Cannot deactivate default category',
  })
  @ApiResponse({
    status: 404,
    description: 'Category not found',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized access',
  })
  @ApiResponse({
    status: 403,
    description: 'Insufficient permissions',
  })
  async deactivateCategory(@Param('id') id: string): Promise<CategoryResponseDto> {
    const command = new DeleteCategoryCommand(id);
    return this.commandBus.execute(command);
  }

  @Patch(REPORTS_URLS.REPORTS_CATEGORY_REACTIVATE)
  @Roles(UserRole.GENERAL_ADMIN, UserRole.GENERAL_STAFF, UserRole.PROGRAM_ADMIN)
  @ApiOperation({
    summary: 'Reactivate category',
    description: 'Reactivates a previously deactivated category',
  })
  @ApiParam({
    name: 'id',
    description: 'Category ID',
    example: '507f1f77bcf86cd799439011',
  })
  @ApiResponse({
    status: 200,
    description: 'Category reactivated successfully',
    type: CategoryResponseDto,
  })
  @ApiResponse({
    status: 404,
    description: 'Category not found',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized access',
  })
  @ApiResponse({
    status: 403,
    description: 'Insufficient permissions',
  })
  async reactivateCategory(@Param('id') id: string): Promise<CategoryResponseDto> {
    const command = new ReactivateCategoryCommand(id);
    return this.commandBus.execute(command);
  }
}
