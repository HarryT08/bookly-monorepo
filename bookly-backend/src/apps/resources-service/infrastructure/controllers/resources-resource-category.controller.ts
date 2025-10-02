import {
  Controller,
  Post,
  Delete,
  Get,
  Body,
  Param,
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
  ApiBearerAuth,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '@libs/common/guards/jwt-auth.guard';
import { RolesGuard } from '@libs/common/guards/roles.guard';
import { Roles } from '@libs/common/decorators/roles.decorator';
import { CurrentUser } from '@libs/common/decorators/current-user.decorator';
import { UserRole } from '@libs/common/enums/user-role.enum';
import {
  AssignCategoriesDto,
  RemoveCategoriesDto,
  EntityCategoryAssociationDto,
} from '@libs/dto/categories';
import { AssignCategoriesToResourceCommand } from '@apps/resources-service/application/commands/resource-category/assign-categories-to-resource.command';
import { RemoveCategoriesFromResourceCommand } from '@apps/resources-service/application/commands/resource-category/remove-categories-from-resource.command';
import { GetResourceCategoriesQuery } from '@apps/resources-service/application/queries/resource-category/get-resource-categories.query';
import { ResponseUtil } from '@/libs/common/utils/response.util';

@ApiTags('Resource Categories')
@Controller('resources/resource-categories')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class ResourcesResourceCategoryController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
  ) {}

  @Post(':resourceId/assign')
  @Roles(UserRole.GENERAL_ADMIN, UserRole.PROGRAM_ADMIN)
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Assign categories to resource',
    description: 'Assigns multiple categories to a resource',
  })
  @ApiParam({
    name: 'resourceId',
    description: 'Resource ID',
    type: String,
  })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'Categories assigned successfully',
    type: [EntityCategoryAssociationDto],
  })
  @ApiResponse({
    status: HttpStatus.FORBIDDEN,
    description: 'Insufficient permissions',
  })
  async assignCategoriesToResource(
    @Param('resourceId') resourceId: string,
    @Body() dto: AssignCategoriesDto,
    @CurrentUser('id') assignedBy: string,
  ) {
    const command = new AssignCategoriesToResourceCommand(resourceId, dto, assignedBy);
    return ResponseUtil.success(await this.commandBus.execute(command), 'Categories assigned successfully');
  }

  @Delete(':resourceId/remove')
  @Roles(UserRole.GENERAL_ADMIN, UserRole.PROGRAM_ADMIN)
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({
    summary: 'Remove categories from resource',
    description: 'Removes multiple categories from a resource',
  })
  @ApiParam({
    name: 'resourceId',
    description: 'Resource ID',
    type: String,
  })
  @ApiResponse({
    status: HttpStatus.NO_CONTENT,
    description: 'Categories removed successfully',
  })
  @ApiResponse({
    status: HttpStatus.FORBIDDEN,
    description: 'Insufficient permissions',
  })
  async removeCategoriesFromResource(
    @Param('resourceId') resourceId: string,
    @Body() dto: RemoveCategoriesDto,
    @CurrentUser('id') removedBy: string,
  ) {
    const command = new RemoveCategoriesFromResourceCommand(resourceId, dto, removedBy);
    await this.commandBus.execute(command);
    return ResponseUtil.success('Categories removed successfully');
  }

  @Get(':resourceId')
  @ApiOperation({
    summary: 'Get resource categories',
    description: 'Gets all categories assigned to a resource',
  })
  @ApiParam({
    name: 'resourceId',
    description: 'Resource ID',
    type: String,
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Resource categories retrieved successfully',
    type: [EntityCategoryAssociationDto],
  })
  async getResourceCategories(
    @Param('resourceId') resourceId: string,
  ) {
    const query = new GetResourceCategoriesQuery(resourceId);
    return ResponseUtil.success(await this.queryBus.execute(query), 'Resource categories retrieved successfully');
  }
}
