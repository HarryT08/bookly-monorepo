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
import { AssignCategoriesToProgramCommand } from '@apps/resources-service/application/commands/program-category/assign-categories-to-program.command';
import { RemoveCategoriesFromProgramCommand } from '@apps/resources-service/application/commands/program-category/remove-categories-from-program.command';
import { GetProgramCategoriesQuery } from '@apps/resources-service/application/queries/program-category/get-program-categories.query';
import { ResponseUtil } from '@/libs/common/utils/response.util';

@ApiTags('Program Categories')
@Controller('resources/program-categories')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class ResourcesProgramCategoryController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
  ) {}

  @Post(':programId/assign')
  @Roles(UserRole.GENERAL_ADMIN, UserRole.PROGRAM_ADMIN)
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Assign categories to program',
    description: 'Assigns multiple categories to a program',
  })
  @ApiParam({
    name: 'programId',
    description: 'Program ID',
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
  async assignCategoriesToProgram(
    @Param('programId') programId: string,
    @Body() dto: AssignCategoriesDto,
    @CurrentUser('id') assignedBy: string,
  ) {
    const command = new AssignCategoriesToProgramCommand(programId, dto, assignedBy);
    return ResponseUtil.success(await this.commandBus.execute(command), 'Categories assigned successfully');
  }

  @Delete(':programId/remove')
  @Roles(UserRole.GENERAL_ADMIN, UserRole.PROGRAM_ADMIN)
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({
    summary: 'Remove categories from program',
    description: 'Removes multiple categories from a program',
  })
  @ApiParam({
    name: 'programId',
    description: 'Program ID',
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
  async removeCategoriesFromProgram(
    @Param('programId') programId: string,
    @Body() dto: RemoveCategoriesDto,
    @CurrentUser('id') removedBy: string,
  ) {
    const command = new RemoveCategoriesFromProgramCommand(programId, dto, removedBy);
    await this.commandBus.execute(command);
    return ResponseUtil.success('Categories removed successfully');
  }

  @Get(':programId')
  @ApiOperation({
    summary: 'Get program categories',
    description: 'Gets all categories assigned to a program',
  })
  @ApiParam({
    name: 'programId',
    description: 'Program ID',
    type: String,
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Program categories retrieved successfully',
    type: [EntityCategoryAssociationDto],
  })
  async getProgramCategories(
    @Param('programId') programId: string,
  ) {
    const query = new GetProgramCategoriesQuery(programId);
    return ResponseUtil.success(await this.queryBus.execute(query), 'Program categories retrieved successfully');
  }
}
