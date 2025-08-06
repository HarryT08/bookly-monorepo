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
import { ProgramService } from '../../application/services/program.service';
import {
  CreateProgramDto,
  UpdateProgramDto,
  ProgramResponseDto,
} from '../../application/dtos/program.dto';
import { JwtAuthGuard } from '@libs/common/guards/jwt-auth.guard';
import { RolesGuard } from '@libs/common/guards/roles.guard';
import { Roles } from '@libs/common/decorators/roles.decorator';
import { CurrentUser } from '@libs/common/decorators/current-user.decorator';
import { UserEntity } from '../../../auth-service/domain/entities/user.entity';

/**
 * HITO 6 - RF-02: Program Controller
 * Handles HTTP requests for academic program management
 */
@ApiTags('Programs')
@Controller('programs')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class ProgramController {
  constructor(private readonly programService: ProgramService) {}

  /**
   * Creates a new academic program
   */
  @Post()
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
  ): Promise<ProgramResponseDto> {
    return await this.programService.createProgram(createProgramDto, user.id!);
  }

  /**
   * Gets all programs with pagination
   */
  @Get()
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
    schema: {
      type: 'object',
      properties: {
        programs: {
          type: 'array',
          items: { $ref: '#/components/schemas/ProgramResponseDto' },
        },
        total: { type: 'number' },
        page: { type: 'number' },
        limit: { type: 'number' },
      },
    },
  })
  async getPrograms(
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 10,
    @Query('search') search?: string,
    @Query('isActive') isActive?: boolean,
  ): Promise<{
    programs: ProgramResponseDto[];
    total: number;
    page: number;
    limit: number;
  }> {
    return await this.programService.getPrograms(page, limit, search, isActive);
  }

  /**
   * Gets active programs only
   */
  @Get('active')
  @ApiOperation({
    summary: 'Get all active programs',
    description: 'Retrieves all active academic programs without pagination.',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Active programs retrieved successfully',
    type: [ProgramResponseDto],
  })
  async getActivePrograms(): Promise<ProgramResponseDto[]> {
    return await this.programService.getActivePrograms();
  }

  /**
   * Gets a program by ID
   */
  @Get(':id')
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
    type: ProgramResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Program not found',
  })
  async getProgramById(@Param('id') id: string): Promise<ProgramResponseDto> {
    return await this.programService.getProgramById(id);
  }

  /**
   * Gets a program by code
   */
  @Get('code/:code')
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
    type: ProgramResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Program not found',
  })
  async getProgramByCode(@Param('code') code: string): Promise<ProgramResponseDto> {
    return await this.programService.getProgramByCode(code);
  }

  /**
   * Updates an existing program
   */
  @Put(':id')
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
    type: ProgramResponseDto,
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
  ): Promise<ProgramResponseDto> {
    return await this.programService.updateProgram(id, updateProgramDto, user.id!);
  }

  /**
   * Deactivates a program
   */
  @Delete(':id')
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
    await this.programService.deactivateProgram(id, user.id!);
  }

  /**
   * Reactivates a program
   */
  @Put(':id/reactivate')
  @Roles('ADMIN_GENERAL')
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
    type: ProgramResponseDto,
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
  ): Promise<ProgramResponseDto> {
    return await this.programService.reactivateProgram(id, user.id!);
  }
}
