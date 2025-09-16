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
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { CreateProgramCommand } from '@apps/resources-service/application/commands/create-program.command';
import { UpdateProgramCommand } from '@apps/resources-service/application/commands/update-program.command';
import { DeactivateProgramCommand } from '@apps/resources-service/application/commands/deactivate-program.command';
import { ReactivateProgramCommand } from '@apps/resources-service/application/commands/reactivate-program.command';
import { GetProgramQuery, GetProgramByCodeQuery, GetProgramsQuery, GetActiveProgramsQuery } from '@apps/resources-service/application/queries/get-program.query';
import {
  CreateProgramDto,
  UpdateProgramDto,
  ProgramResponseDto,
} from '@apps/resources-service/application/dtos/program.dto';
import { JwtAuthGuard } from '@libs/common/guards/jwt-auth.guard';
import { ResponseUtil } from '@libs/common/utils/response.util';
import { SuccessResponseDto, PaginatedResponseDto } from '@libs/dto/common/response.dto';
import { RolesGuard } from '@libs/common/guards/roles.guard';
import { Roles } from '@libs/common/decorators/roles.decorator';
import { CurrentUser } from '@libs/common/decorators/current-user.decorator';
import { UserEntity, UserRole } from '@apps/auth-service/domain/entities/user.entity';
import { RESOURCES_URLS } from '@apps/resources-service/utils/maps/urls.map';

/**
 * HITO 6 - RF-02: Program Controller
 * Handles HTTP requests for academic program management
 */
@ApiTags(RESOURCES_URLS.PROGRAMS_TAG)
@Controller(RESOURCES_URLS.PROGRAMS)
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class ProgramController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
  ) {}

  /**
   * Creates a new academic program
   */
  @Post(RESOURCES_URLS.PROGRAMS_CREATE)
  @Roles('ADMIN_GENERAL', 'ADMIN_PROGRAMA')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Create a new academic program',
    description: 'Creates a new academic program. Only administrators can create programs.',
  })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'Program created successfully',
    type: ProgramResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.CONFLICT,
    description: 'Program with same name or code already exists',
  })
  @ApiResponse({
    status: HttpStatus.FORBIDDEN,
    description: 'Insufficient permissions',
  })
  async createProgram(
    @Body() createProgramDto: CreateProgramDto,
    @CurrentUser() user: UserEntity,
  ) {
    const commandData = { ...createProgramDto, createdBy: user.id! };
    const command = new CreateProgramCommand(commandData);
    const result = await this.commandBus.execute(command);
    return ResponseUtil.success(result, 'Program created successfully');
  }

  /**
   * Gets all programs with pagination
   */
  @Get(RESOURCES_URLS.PROGRAMS_FIND)
  @ApiOperation({
    summary: 'Get all programs with pagination',
    description: 'Retrieves all academic programs with optional search and filtering.',
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
  @ApiQuery({
    name: 'search',
    required: false,
    type: String,
    description: 'Search term for program name or code',
  })
  @ApiQuery({
    name: 'isActive',
    required: false,
    type: Boolean,
    description: 'Filter by active status',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Programs retrieved successfully',
    type: PaginatedResponseDto,
  })
  async getPrograms(
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 10,
    @Query('search') search?: string,
    @Query('isActive') isActive?: boolean,
  ) {
    const query = new GetProgramsQuery(page, limit, search, isActive);
    const result = await this.queryBus.execute(query);
    return ResponseUtil.paginated(result.programs, result.total, page, limit, 'Programs retrieved successfully');
  }

  /**
   * Gets active programs only
   */
  @Get(RESOURCES_URLS.PROGRAMS_ACTIVE)
  @ApiOperation({
    summary: 'Get all active programs',
    description: 'Retrieves all active academic programs without pagination.',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Active programs retrieved successfully',
    type: SuccessResponseDto,
  })
  async getActivePrograms() {
    const query = new GetActiveProgramsQuery();
    const programs = await this.queryBus.execute(query);
    return ResponseUtil.success(programs, 'Active programs retrieved successfully');
  }

  /**
   * Gets a program by ID
   */
  @Get(RESOURCES_URLS.PROGRAMS_FIND_BY_ID)
  @ApiOperation({
    summary: 'Get program by ID',
    description: 'Retrieves a specific academic program by its ID.',
  })
  @ApiParam({
    name: 'id',
    description: 'Program ID',
    type: String,
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Program retrieved successfully',
    type: SuccessResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Program not found',
  })
  async getProgramById(@Param('id') id: string) {
    const query = new GetProgramQuery(id);
    const program = await this.queryBus.execute(query);
    return ResponseUtil.success(program, 'Program retrieved successfully');
  }

  /**
   * Gets a program by code
   */
  @Get(RESOURCES_URLS.PROGRAMS_FIND_BY_CODE)
  @ApiOperation({
    summary: 'Get program by code',
    description: 'Retrieves a specific academic program by its code.',
  })
  @ApiParam({
    name: 'code',
    description: 'Program code',
    type: String,
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Program retrieved successfully',
    type: SuccessResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Program not found',
  })
  async getProgramByCode(@Param('code') code: string) {
    const query = new GetProgramByCodeQuery(code);
    const program = await this.queryBus.execute(query);
    return ResponseUtil.success(program, 'Program retrieved successfully');
  }

  /**
   * Updates an existing program
   */
  @Put(RESOURCES_URLS.PROGRAMS_UPDATE)
  @Roles('ADMIN_GENERAL', 'ADMIN_PROGRAMA')
  @ApiOperation({
    summary: 'Update program',
    description: 'Updates an existing academic program. Only administrators can update programs.',
  })
  @ApiParam({
    name: 'id',
    description: 'Program ID',
    type: String,
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Program updated successfully',
    type: SuccessResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Program not found',
  })
  @ApiResponse({
    status: HttpStatus.CONFLICT,
    description: 'Program with same name or code already exists',
  })
  @ApiResponse({
    status: HttpStatus.FORBIDDEN,
    description: 'Insufficient permissions',
  })
  async updateProgram(
    @Param('id') id: string,
    @Body() updateProgramDto: UpdateProgramDto,
    @CurrentUser() user: UserEntity,
  ) {
    const commandData = { id, ...updateProgramDto, updatedBy: user.id! };
    const command = new UpdateProgramCommand(commandData);
    const updatedProgram = await this.commandBus.execute(command);
    return ResponseUtil.success(updatedProgram, 'Program updated successfully');
  }

  /**
   * Deactivates a program
   */
  @Delete(RESOURCES_URLS.PROGRAMS_DELETE)
  @Roles('ADMIN_GENERAL')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({
    summary: 'Deactivate program',
    description: 'Deactivates an academic program. Only general administrators can deactivate programs.',
  })
  @ApiParam({
    name: 'id',
    description: 'Program ID',
    type: String,
  })
  @ApiResponse({
    status: HttpStatus.NO_CONTENT,
    description: 'Program deactivated successfully',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Program not found',
  })
  @ApiResponse({
    status: HttpStatus.CONFLICT,
    description: 'Program is already inactive',
  })
  @ApiResponse({
    status: HttpStatus.FORBIDDEN,
    description: 'Insufficient permissions',
  })
  async deactivateProgram(
    @Param('id') id: string,
    @CurrentUser() user: UserEntity,
  ): Promise<void> {
    const command = new DeactivateProgramCommand(id, user.id!);
    await this.commandBus.execute(command);
  }

  /**
   * Reactivates a program
   */
  @Put(RESOURCES_URLS.PROGRAMS_REACTIVATE)
  @Roles(UserRole.GENERAL_ADMIN)
  @ApiOperation({
    summary: 'Reactivate program',
    description: 'Reactivates a deactivated academic program. Only general administrators can reactivate programs.',
  })
  @ApiParam({
    name: 'id',
    description: 'Program ID',
    type: String,
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Program reactivated successfully',
    type: SuccessResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Program not found',
  })
  @ApiResponse({
    status: HttpStatus.CONFLICT,
    description: 'Program is already active',
  })
  @ApiResponse({
    status: HttpStatus.FORBIDDEN,
    description: 'Insufficient permissions',
  })
  async reactivateProgram(
    @Param('id') id: string,
    @CurrentUser() user: UserEntity,
  ) {
    const command = new ReactivateProgramCommand(id, user.id!);
    const reactivatedProgram = await this.commandBus.execute(command);
    return ResponseUtil.success(reactivatedProgram, 'Program reactivated successfully');
  }
}
