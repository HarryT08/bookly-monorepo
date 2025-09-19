import {
  Controller,
  Post,
  Delete,
  Get,
  Param,
  Body,
  UseGuards,
  HttpStatus,
  HttpCode,
} from "@nestjs/common";
import { CommandBus, QueryBus } from "@nestjs/cqrs";
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiBearerAuth,
} from "@nestjs/swagger";
import { JwtAuthGuard } from "@apps/auth-service/infrastructure/guards/jwt-auth.guard";
import { RolesGuard } from "@apps/auth-service/infrastructure/guards/roles.guard";
import { Roles } from "@apps/auth-service/infrastructure/decorators/roles.decorator";
import {
  AssignCategoriesDto,
  RemoveCategoriesDto,
  EntityCategoryAssociationDto,
} from "@libs/dto/categories";
import { AssignCategoriesToUserCommand } from "@apps/auth-service/application/commands/user-category/assign-categories-to-user.command";
import { RemoveCategoriesFromUserCommand } from "@apps/auth-service/application/commands/user-category/remove-categories-from-user.command";
import { GetUserCategoriesQuery } from "@apps/auth-service/application/queries/user-category/get-user-categories.query";
import { UserRole } from "@libs/common/enums/user-role.enum";
import { ResponseUtil } from "../../../../libs/common/utils/response.util";
import { CurrentUser } from "@libs/common/decorators/current-user.decorator";
import { UserEntity } from "../../domain/entities/user.entity";
import { ApiResponseBookly } from "@/libs/dto";

@ApiTags("User Categories")
@ApiBearerAuth()
@Controller("users/:userId/categories")
@UseGuards(JwtAuthGuard, RolesGuard)
export class UserCategoryController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus
  ) {}

  @Post()
  @Roles(UserRole.GENERAL_ADMIN, UserRole.PROGRAM_ADMIN)
  @ApiOperation({
    summary: "Assign categories to user",
    description: "Assign multiple categories to a specific user",
  })
  @ApiParam({
    name: "userId",
    description: "User ID",
    example: "507f1f77bcf86cd799439011",
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: "Categories assigned to user successfully",
    type: [EntityCategoryAssociationDto],
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: "Invalid input data or user not found",
  })
  @ApiResponse({
    status: HttpStatus.FORBIDDEN,
    description: "Insufficient permissions to assign categories to user",
  })
  async assignCategoriesToUser(
    @Param("userId") userId: string,
    @Body() dto: AssignCategoriesDto,
    @CurrentUser() user: UserEntity
  ): Promise<ApiResponseBookly<EntityCategoryAssociationDto[]>> {
    const command = new AssignCategoriesToUserCommand(userId, dto, user.id);
    return ResponseUtil.success(
      await this.commandBus.execute(command),
      "Categories assigned to user successfully"
    );
  }

  @Delete()
  @HttpCode(HttpStatus.NO_CONTENT)
  @Roles(UserRole.GENERAL_ADMIN, UserRole.PROGRAM_ADMIN)
  @ApiOperation({
    summary: "Remove categories from user",
    description: "Remove multiple categories from a specific user",
  })
  @ApiParam({
    name: "userId",
    description: "User ID",
    example: "507f1f77bcf86cd799439011",
  })
  @ApiResponse({
    status: HttpStatus.NO_CONTENT,
    description: "Categories removed from user successfully",
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: "Invalid input data or user not found",
  })
  @ApiResponse({
    status: HttpStatus.FORBIDDEN,
    description: "Insufficient permissions to remove categories from user",
  })
  async removeCategoriesFromUser(
    @Param("userId") userId: string,
    @Body() dto: RemoveCategoriesDto,
    @CurrentUser() user: UserEntity
  ): Promise<ApiResponseBookly<boolean>> {
    const command = new RemoveCategoriesFromUserCommand(userId, dto, user.id);
    await this.commandBus.execute(command);
    return ResponseUtil.success(
      true,
      "Categories removed from user successfully"
    );
  }

  @Get()
  @Roles(
    UserRole.GENERAL_ADMIN,
    UserRole.PROGRAM_ADMIN,
    UserRole.TEACHER,
    UserRole.STUDENT,
    UserRole.SECURITY,
    UserRole.GENERAL_STAFF
  )
  @ApiOperation({
    summary: "Get user categories",
    description: "Get all categories assigned to a specific user",
  })
  @ApiParam({
    name: "userId",
    description: "User ID",
    example: "507f1f77bcf86cd799439011",
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: "User categories retrieved successfully",
    type: [EntityCategoryAssociationDto],
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: "User not found",
  })
  async getUserCategories(
    @Param("userId") userId: string
  ): Promise<ApiResponseBookly<EntityCategoryAssociationDto[]>> {
    const query = new GetUserCategoriesQuery(userId);
    return ResponseUtil.success(
      await this.queryBus.execute(query),
      "User categories retrieved successfully"
    );
  }
}
