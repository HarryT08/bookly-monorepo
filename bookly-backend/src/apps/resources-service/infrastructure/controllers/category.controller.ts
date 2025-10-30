import {
  UserEntity,
  UserRole,
} from "@apps/auth-service/domain/entities/user.entity";
import { CurrentUser } from "@libs/common/decorators/current-user.decorator";
import { Roles } from "@libs/common/decorators/roles.decorator";
import { JwtAuthGuard } from "@libs/common/guards/jwt-auth.guard";
import { RolesGuard } from "@libs/common/guards/roles.guard";
import { ResponseUtil } from "@libs/common/utils/response.util";
import {
  ApiResponseBookly,
  PaginatedResponseDto,
  SuccessResponseDto,
} from "@libs/dto/common/response.dto";
import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  Put,
  Query,
  UseGuards,
  UsePipes,
  ValidationPipe,
} from "@nestjs/common";
import { CommandBus, QueryBus } from "@nestjs/cqrs";
import {
  ApiBearerAuth,
  ApiBody,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiResponse,
  ApiTags,
} from "@nestjs/swagger";
import { RESOURCES_URLS } from "../../utils/maps/urls.map";

// Import commands and queries
import { CreateCategoryCommand } from "../../application/commands/create-category.command";
import { DeleteCategoryCommand } from "../../application/commands/delete-category.command";
import { ReactivateCategoryCommand } from "../../application/commands/reactivate-category.command";
import { UpdateCategoryCommand } from "../../application/commands/update-category.command";

import { GetActiveCategoriesQuery } from "../../application/queries/get-active-categories.query";
import { GetCategoriesQuery } from "../../application/queries/get-categories.query";
import { GetCategoryByIdQuery } from "../../application/queries/get-category-by-id.query";
import { GetDefaultCategoriesQuery } from "../../application/queries/get-default-categories.query";

// Import DTOs
import { CategoryEntity } from "@libs/common/entities/category.entity";
import { CreateCategoryDto } from "@libs/dto/categories/create-category.dto";
import { CategoryFiltersDto } from "@libs/dto/categories/filter-categories.dto";
import { UpdateCategoryDto } from "@libs/dto/categories/update-category.dto";

/**
 * Categories Controller
 *
 * Manages resource categories following CQRS pattern.
 * Provides CRUD operations for categories within the resources service context.
 *
 * Coverage:
 * - RF-02: Category management and association
 * - Category CRUD operations
 * - Default and custom categories
 * - Category activation/deactivation
 */
@ApiTags(RESOURCES_URLS.RESOURCE_CATEGORIES_TAG)
@Controller(RESOURCES_URLS.RESOURCE_CATEGORIES)
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class CategoryController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus
  ) {}

  @Post(RESOURCES_URLS.RESOURCE_CATEGORY_CREATE)
  @Roles(UserRole.GENERAL_ADMIN, UserRole.PROGRAM_ADMIN)
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: "Create a new category",
    description:
      "Creates a new resource category. Only administrators can create categories.",
  })
  @ApiBody({
    description: "Category creation data",
    type: CreateCategoryDto,
  })
  @ApiResponse({
    status: 201,
    description: "Category created successfully",
    type: SuccessResponseDto,
  })
  @ApiResponse({ status: 400, description: "Invalid category data" })
  @ApiResponse({
    status: 409,
    description: "Category with this name already exists",
  })
  @UsePipes(new ValidationPipe({ transform: true }))
  async createCategory(
    @Body() createCategoryDto: CreateCategoryDto,
    @CurrentUser() currentUser: UserEntity
  ): Promise<ApiResponseBookly<CategoryEntity>> {
    const command = new CreateCategoryCommand(
      createCategoryDto,
      currentUser.id
    );
    const category = await this.commandBus.execute(command);
    return ResponseUtil.success(category, "Category created successfully");
  }

  @Get(RESOURCES_URLS.RESOURCE_CATEGORIES_FIND_ALL)
  @ApiOperation({
    summary: "Get all categories with pagination",
    description:
      "Retrieves all categories with optional filtering and pagination.",
  })
  @ApiQuery({
    name: "page",
    required: false,
    type: Number,
    description: "Page number",
  })
  @ApiQuery({
    name: "limit",
    required: false,
    type: Number,
    description: "Items per page",
  })
  @ApiQuery({ name: "search", required: false, description: "Search by name" })
  @ApiQuery({
    name: "type",
    required: false,
    description: "Filter by category type",
  })
  @ApiResponse({
    status: 200,
    description: "Categories retrieved successfully",
    type: PaginatedResponseDto,
  })
  async findAllCategories(
    @Query() filters: CategoryFiltersDto
  ): Promise<ApiResponseBookly<CategoryEntity[]>> {
    const query = new GetCategoriesQuery({
      page: filters.page || 1,
      limit: filters.limit || 20,
      search: filters.search,
      type: filters.type,
      isActive: filters.isActive,
    });
    const result = await this.queryBus.execute(query);
    return ResponseUtil.paginated(
      result.data,
      result.total,
      filters.page || 1,
      filters.limit || 20,
      "Categories retrieved successfully"
    );
  }

  @Get(RESOURCES_URLS.RESOURCE_CATEGORIES_ACTIVE)
  @ApiOperation({
    summary: "Get all active categories",
    description: "Retrieves all active categories without pagination.",
  })
  @ApiResponse({
    status: 200,
    description: "Active categories retrieved successfully",
    type: SuccessResponseDto,
  })
  async getActiveCategories(): Promise<ApiResponseBookly<CategoryEntity[]>> {
    const query = new GetActiveCategoriesQuery();
    const categories = await this.queryBus.execute(query);
    return ResponseUtil.success(
      categories,
      "Active categories retrieved successfully"
    );
  }

  @Get(RESOURCES_URLS.RESOURCE_CATEGORIES_DEFAULTS)
  @ApiOperation({
    summary: "Get default categories",
    description: "Retrieves all default system categories.",
  })
  @ApiResponse({
    status: 200,
    description: "Default categories retrieved successfully",
    type: SuccessResponseDto,
  })
  async getDefaultCategories(): Promise<ApiResponseBookly<CategoryEntity[]>> {
    const query = new GetDefaultCategoriesQuery();
    const categories = await this.queryBus.execute(query);
    return ResponseUtil.success(
      categories,
      "Default categories retrieved successfully"
    );
  }

  @Get(RESOURCES_URLS.RESOURCE_CATEGORIES_FIND_BY_ID)
  @ApiOperation({
    summary: "Get category by ID",
    description: "Retrieves a specific category by its ID.",
  })
  @ApiParam({ name: "id", description: "Category ID" })
  @ApiResponse({
    status: 200,
    description: "Category retrieved successfully",
    type: SuccessResponseDto,
  })
  @ApiResponse({ status: 404, description: "Category not found" })
  async getCategoryById(
    @Param("id") id: string
  ): Promise<ApiResponseBookly<CategoryEntity>> {
    const query = new GetCategoryByIdQuery(id);
    const category = await this.queryBus.execute(query);
    return ResponseUtil.success(category, "Category retrieved successfully");
  }

  @Put(RESOURCES_URLS.RESOURCE_CATEGORY_UPDATE)
  @Roles(UserRole.GENERAL_ADMIN, UserRole.PROGRAM_ADMIN)
  @ApiOperation({
    summary: "Update category",
    description:
      "Updates an existing category. Default categories have restricted updates.",
  })
  @ApiParam({ name: "id", description: "Category ID" })
  @ApiBody({
    description: "Category update data",
    type: UpdateCategoryDto,
  })
  @ApiResponse({
    status: 200,
    description: "Category updated successfully",
    type: SuccessResponseDto,
  })
  @ApiResponse({ status: 404, description: "Category not found" })
  @ApiResponse({ status: 400, description: "Invalid update data" })
  @UsePipes(new ValidationPipe({ transform: true }))
  async updateCategory(
    @Param("id") id: string,
    @Body() updateCategoryDto: UpdateCategoryDto,
    @CurrentUser() currentUser: UserEntity
  ): Promise<ApiResponseBookly<CategoryEntity>> {
    const command = new UpdateCategoryCommand(
      id,
      updateCategoryDto,
      currentUser.id
    );
    const category = await this.commandBus.execute(command);
    return ResponseUtil.success(category, "Category updated successfully");
  }

  @Delete(RESOURCES_URLS.RESOURCE_CATEGORY_DELETE)
  @Roles(UserRole.GENERAL_ADMIN, UserRole.PROGRAM_ADMIN)
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({
    summary: "Deactivate category",
    description:
      "Deactivates a category. Default categories cannot be deactivated.",
  })
  @ApiParam({ name: "id", description: "Category ID" })
  @ApiResponse({
    status: 204,
    description: "Category deactivated successfully",
  })
  @ApiResponse({ status: 404, description: "Category not found" })
  @ApiResponse({
    status: 400,
    description: "Cannot deactivate default category",
  })
  async deleteCategory(
    @Param("id") id: string,
    @CurrentUser() currentUser: UserEntity
  ): Promise<ApiResponseBookly<CategoryEntity>> {
    const command = new DeleteCategoryCommand(id, currentUser.id);
    await this.commandBus.execute(command);
    return ResponseUtil.success(null, "Category deactivated successfully");
  }

  @Put(RESOURCES_URLS.RESOURCE_CATEGORY_REACTIVATE)
  @Roles(UserRole.GENERAL_ADMIN, UserRole.PROGRAM_ADMIN)
  @ApiOperation({
    summary: "Reactivate category",
    description: "Reactivates a deactivated category.",
  })
  @ApiParam({ name: "id", description: "Category ID" })
  @ApiResponse({
    status: 200,
    description: "Category reactivated successfully",
    type: SuccessResponseDto,
  })
  @ApiResponse({ status: 404, description: "Category not found" })
  async reactivateCategory(
    @Param("id") id: string,
    @CurrentUser() currentUser: UserEntity
  ): Promise<ApiResponseBookly<CategoryEntity>> {
    const command = new ReactivateCategoryCommand(id, currentUser.id);
    const category = await this.commandBus.execute(command);
    return ResponseUtil.success(category, "Category reactivated successfully");
  }
}
