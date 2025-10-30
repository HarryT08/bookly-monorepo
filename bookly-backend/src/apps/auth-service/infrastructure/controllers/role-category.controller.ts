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
import { AssignCategoriesToRoleCommand } from "@apps/auth-service/application/commands/role-category/assign-categories-to-role.command";
import { RemoveCategoriesFromRoleCommand } from "@apps/auth-service/application/commands/role-category/remove-categories-from-role.command";
import { GetRoleCategoriesQuery } from "@apps/auth-service/application/queries/role-category/get-role-categories.query";
import { UserRole } from "@libs/common/enums/user-role.enum";
import { ResponseUtil } from "../../../../libs/common/utils/response.util";
import { ApiResponseBookly, SuccessResponseDto } from "@/libs/dto";
import { CurrentUser } from "@libs/common/decorators/current-user.decorator";
import { UserEntity } from "../../domain/entities/user.entity";

@ApiTags("Role Categories")
@ApiBearerAuth()
@Controller("roles/:roleId/categories")
@UseGuards(JwtAuthGuard, RolesGuard)
export class RoleCategoryController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus
  ) {}

  @Post()
  @HttpCode(HttpStatus.OK)
  @Roles(UserRole.GENERAL_ADMIN, UserRole.PROGRAM_ADMIN)
  @ApiOperation({
    summary: "Assign categories to role",
    description: "Assign multiple categories to a specific role",
  })
  @ApiParam({
    name: "roleId",
    description: "Role ID",
    example: "507f1f77bcf86cd799439011",
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: "Categories assigned to role successfully",
    type: SuccessResponseDto<EntityCategoryAssociationDto[]>,
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: "Invalid input data or role not found",
  })
  @ApiResponse({
    status: HttpStatus.FORBIDDEN,
    description: "Insufficient permissions to assign categories to role",
  })
  async assignCategoriesToRole(
    @Param("roleId") roleId: string,
    @Body() dto: AssignCategoriesDto,
    @CurrentUser() user: UserEntity
  ): Promise<ApiResponseBookly<EntityCategoryAssociationDto[]>> {
    const command = new AssignCategoriesToRoleCommand(roleId, dto, user.id);
    return ResponseUtil.success(
      await this.commandBus.execute(command),
      "Categories assigned to role successfully"
    );
  }

  @Delete()
  @HttpCode(HttpStatus.NO_CONTENT)
  @Roles(UserRole.GENERAL_ADMIN, UserRole.PROGRAM_ADMIN)
  @ApiOperation({
    summary: "Remove categories from role",
    description: "Remove multiple categories from a specific role",
  })
  @ApiParam({
    name: "roleId",
    description: "Role ID",
    example: "507f1f77bcf86cd799439011",
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: "Categories removed from role successfully",
    type: SuccessResponseDto<boolean>,
  })
  @ApiResponse({
    status: HttpStatus.NO_CONTENT,
    description: "Categories removed from role successfully",
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: "Invalid input data or role not found",
  })
  @ApiResponse({
    status: HttpStatus.FORBIDDEN,
    description: "Insufficient permissions to remove categories from role",
  })
  async removeCategoriesFromRole(
    @Param("roleId") roleId: string,
    @Body() dto: RemoveCategoriesDto,
    @CurrentUser() userEntity: UserEntity
  ): Promise<ApiResponseBookly<boolean>> {
    const command = new RemoveCategoriesFromRoleCommand(
      roleId,
      dto,
      userEntity.id
    );
    await this.commandBus.execute(command);
    return ResponseUtil.success(
      true,
      "Categories removed from role successfully"
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
    summary: "Get role categories",
    description: "Get all categories assigned to a specific role",
  })
  @ApiParam({
    name: "roleId",
    description: "Role ID",
    example: "507f1f77bcf86cd799439011",
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: "Role categories retrieved successfully",
    type: SuccessResponseDto<EntityCategoryAssociationDto[]>,
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: "Role not found",
  })
  async getRoleCategories(
    @Param("roleId") roleId: string
  ): Promise<ApiResponseBookly<EntityCategoryAssociationDto[]>> {
    const query = new GetRoleCategoriesQuery(roleId);
    return ResponseUtil.success(
      await this.queryBus.execute(query),
      "Role categories retrieved successfully"
    );
  }
}
