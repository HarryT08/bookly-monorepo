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
import { AssignCategoriesToIncidentReportCommand } from '@apps/resources-service/application/commands/incident-report-category/assign-categories-to-incident-report.command';
import { RemoveCategoriesFromIncidentReportCommand } from '@apps/resources-service/application/commands/incident-report-category/remove-categories-from-incident-report.command';
import { GetIncidentReportCategoriesQuery } from '@apps/resources-service/application/queries/incident-report-category/get-incident-report-categories.query';
import { ResponseUtil } from '../../../../libs/common/utils/response.util';

@ApiTags('Incident Report Categories')
@Controller('resources/incident-report-categories')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class ResourcesIncidentReportCategoryController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
  ) {}

  @Post(':incidentReportId/assign')
  @Roles(UserRole.GENERAL_ADMIN, UserRole.PROGRAM_ADMIN)
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Assign categories to incident report',
    description: 'Assigns multiple categories to an incident report',
  })
  @ApiParam({
    name: 'incidentReportId',
    description: 'Incident Report ID',
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
  async assignCategoriesToIncidentReport(
    @Param('incidentReportId') incidentReportId: string,
    @Body() dto: AssignCategoriesDto,
    @CurrentUser('id') assignedBy: string,
  ) {
    const command = new AssignCategoriesToIncidentReportCommand(incidentReportId, dto, assignedBy);
    return ResponseUtil.success(await this.commandBus.execute(command), 'Categories assigned successfully');
  }

  @Delete(':incidentReportId/remove')
  @Roles(UserRole.GENERAL_ADMIN, UserRole.PROGRAM_ADMIN)
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({
    summary: 'Remove categories from incident report',
    description: 'Removes multiple categories from an incident report',
  })
  @ApiParam({
    name: 'incidentReportId',
    description: 'Incident Report ID',
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
  async removeCategoriesFromIncidentReport(
    @Param('incidentReportId') incidentReportId: string,
    @Body() dto: RemoveCategoriesDto,
    @CurrentUser('id') removedBy: string,
  ) {
    const command = new RemoveCategoriesFromIncidentReportCommand(incidentReportId, dto, removedBy);
    await this.commandBus.execute(command);
    return ResponseUtil.success('Categories removed successfully');
  }

  @Get(':incidentReportId')
  @ApiOperation({
    summary: 'Get incident report categories',
    description: 'Gets all categories assigned to an incident report',
  })
  @ApiParam({
    name: 'incidentReportId',
    description: 'Incident Report ID',
    type: String,
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Incident report categories retrieved successfully',
    type: [EntityCategoryAssociationDto],
  })
  async getIncidentReportCategories(
    @Param('incidentReportId') incidentReportId: string,
  ) {
    const query = new GetIncidentReportCategoriesQuery(incidentReportId);
    return ResponseUtil.success(await this.queryBus.execute(query), 'Incident report categories retrieved successfully');
  }
}
