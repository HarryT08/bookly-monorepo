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
} from "@nestjs/common";
import { CommandBus, QueryBus } from "@nestjs/cqrs";
import {
  ApiTags,
  ApiOperation,
  ApiResponse as SwaggerApiResponse,
} from "@nestjs/swagger";
import {
  ApiResponseBookly,
  PaginatedResponseDto,
  SuccessResponseDto,
} from "@libs/dto/common/response.dto";
import { ResponseUtil } from "@libs/common/utils/response.util";
import { LoggingService } from "@libs/logging/logging.service";

// DTOs
import { CategoryResponseDto } from "../../application/dto/category/category-response.dto";

// Commands
import { CreateRoleCategoryCommand } from "../../application/commands/category/create-category.command";
import { UpdateRoleCategoryCommand } from "../../application/commands/category/update-category.command";
import { DeleteRoleCategoryCommand } from "../../application/commands/category/delete-category.command";

// Queries
import { FindAllRoleCategoriesQuery } from "../../application/queries/category/find-all-categories.query";
import { FindRoleCategoryByIdQuery } from "../../application/queries/category/find-category-by-id.query";
import { FindDefaultRoleCategoriesQuery } from "../../application/queries/category/find-default-categories.query";
import { AUTH_URLS } from "../../utils/maps/urls.map";
import { FindRoleCategoryByActiveQuery } from "../../application/queries/category/find-category-by-active.query";
import { CreateCategoryDto, UpdateCategoryDto } from "@/libs/dto/categories";

@ApiTags("Role Categories")
@Controller(AUTH_URLS.CATEGORY)
export class RoleCategoryController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
    private readonly loggingService: LoggingService
  ) {}

  @Get()
  @ApiOperation({ summary: "Get all role categories" })
  @SwaggerApiResponse({
    status: 200,
    description: "Role categories retrieved successfully",
    type: SuccessResponseDto<PaginatedResponseDto<CategoryResponseDto>>,
  })
  async findAll(
    @Query("page") page?: number,
    @Query("limit") limit?: number,
    @Query("search") search?: string,
    @Query("isActive") isActive?: boolean
  ): Promise<ApiResponseBookly<CategoryResponseDto[]>> {
    try {
      const query = new FindAllRoleCategoriesQuery(
        page,
        limit,
        search,
        isActive
      );
      const result = await this.queryBus.execute(query);

      const responseData = CategoryResponseDto.fromEntities(result.data);

      return ResponseUtil.paginated(
        responseData,
        result.pagination.total,
        result.pagination.page,
        result.pagination.limit,
        "Role categories retrieved successfully"
      );
    } catch (error) {
      this.loggingService.error(
        "Failed to retrieve role categories",
        error,
        "RoleCategoryController"
      );
      throw error;
    }
  }

  @Get(AUTH_URLS.CATEGORY_DEFAULTS)
  @ApiOperation({ summary: "Get default role categories" })
  @SwaggerApiResponse({
    status: 200,
    description: "Default role categories retrieved successfully",
    type: SuccessResponseDto,
  })
  async getDefaults(): Promise<ApiResponseBookly<CategoryResponseDto[]>> {
    try {
      const query = new FindDefaultRoleCategoriesQuery();
      const categories = await this.queryBus.execute(query);

      const responseData = CategoryResponseDto.fromEntities(categories);

      return ResponseUtil.success(
        responseData,
        "Default role categories retrieved successfully"
      );
    } catch (error) {
      this.loggingService.error(
        "Failed to retrieve default role categories",
        error,
        "RoleCategoryController"
      );
      throw error;
    }
  }

  @Get(AUTH_URLS.CATEGORY_FIND_BY_ACTIVE)
  @ApiOperation({ summary: "Get active role categories" })
  @SwaggerApiResponse({
    status: 200,
    description: "Active role categories retrieved successfully",
    type: SuccessResponseDto,
  })
  async getActive(): Promise<ApiResponseBookly<CategoryResponseDto[]>> {
    try {
      const query = new FindRoleCategoryByActiveQuery();
      const categories = await this.queryBus.execute(query);

      const responseData = CategoryResponseDto.fromEntities(categories);

      return ResponseUtil.success(
        responseData,
        "Active role categories retrieved successfully"
      );
    } catch (error) {
      this.loggingService.error(
        "Failed to retrieve active role categories",
        error,
        "RoleCategoryController"
      );
      throw error;
    }
  }

  @Get(AUTH_URLS.CATEGORY_FIND_BY_ID)
  @ApiOperation({ summary: "Get role category by ID" })
  @SwaggerApiResponse({
    status: 200,
    description: "Role category retrieved successfully",
    type: SuccessResponseDto,
  })
  @SwaggerApiResponse({
    status: 404,
    description: "Role category not found",
  })
  async findById(
    @Param("id") id: string
  ): Promise<ApiResponseBookly<CategoryResponseDto>> {
    try {
      const query = new FindRoleCategoryByIdQuery(id);
      const category = await this.queryBus.execute(query);

      const responseData = CategoryResponseDto.fromEntity(category);

      return ResponseUtil.success(
        responseData,
        "Role category retrieved successfully"
      );
    } catch (error) {
      this.loggingService.error(
        "Failed to retrieve role category",
        error,
        "RoleCategoryController"
      );
      throw error;
    }
  }

  @Post(AUTH_URLS.CATEGORY_CREATE)
  @ApiOperation({ summary: "Create new role category" })
  @SwaggerApiResponse({
    status: 201,
    description: "Role category created successfully",
    type: SuccessResponseDto,
  })
  @SwaggerApiResponse({
    status: 400,
    description: "Invalid category data",
  })
  async create(
    @Body() createCategoryDto: CreateCategoryDto
  ): Promise<ApiResponseBookly<CategoryResponseDto>> {
    try {
      const command = new CreateRoleCategoryCommand(createCategoryDto);
      const category = await this.commandBus.execute(command);

      const responseData = CategoryResponseDto.fromEntity(category);

      return ResponseUtil.success(
        responseData,
        "Role category created successfully"
      );
    } catch (error) {
      this.loggingService.error(
        "Failed to create role category",
        error,
        "RoleCategoryController"
      );
      throw error;
    }
  }

  @Put(AUTH_URLS.CATEGORY_UPDATE)
  @ApiOperation({ summary: "Update role category" })
  @SwaggerApiResponse({
    status: 200,
    description: "Role category updated successfully",
    type: SuccessResponseDto,
  })
  @SwaggerApiResponse({
    status: 404,
    description: "Role category not found",
  })
  @SwaggerApiResponse({
    status: 400,
    description: "Invalid category data",
  })
  async update(
    @Param("id") id: string,
    @Body() updateCategoryDto: UpdateCategoryDto
  ): Promise<ApiResponseBookly<CategoryResponseDto>> {
    try {
      const command = new UpdateRoleCategoryCommand(id, updateCategoryDto);
      const category = await this.commandBus.execute(command);

      const responseData = CategoryResponseDto.fromEntity(category);

      return ResponseUtil.success(
        responseData,
        "Role category updated successfully"
      );
    } catch (error) {
      this.loggingService.error(
        "Failed to update role category",
        error,
        "AuthCategoryController"
      );
      throw error;
    }
  }

  @Delete(AUTH_URLS.CATEGORY_DELETE)
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: "Delete role category" })
  @SwaggerApiResponse({
    status: 204,
    description: "Role category deleted successfully",
  })
  @SwaggerApiResponse({
    status: 404,
    description: "Role category not found",
  })
  @SwaggerApiResponse({
    status: 400,
    description: "Cannot delete default role category",
  })
  async delete(
    @Param("id") id: string
  ): Promise<ApiResponseBookly<CategoryResponseDto>> {
    try {
      const command = new DeleteRoleCategoryCommand(id);
      await this.commandBus.execute(command);

      return ResponseUtil.success(null, "Role category deleted successfully");
    } catch (error) {
      this.loggingService.error(
        "Failed to delete role category",
        error,
        "AuthCategoryController"
      );
      throw error;
    }
  }
}
