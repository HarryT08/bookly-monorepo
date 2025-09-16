import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Query,
  UseGuards,
  UseInterceptors,
  UploadedFile,
  HttpStatus,
  HttpCode,
} from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { FileInterceptor } from '@nestjs/platform-express';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiQuery,
  ApiConsumes,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { 
  PreviewImportCommand,
  StartImportCommand 
} from '@apps/resources-service/application/commands/import-resources.command';
import { 
  GetImportByIdQuery,
  GetImportsByUserQuery,
  GetImportsQuery,
  GetImportStatisticsQuery 
} from '@apps/resources-service/application/queries/get-import-status.query';
import { ImportResourcesDto, ResourceImportResponseDto, ImportPreviewDto } from '@apps/resources-service/application/dtos/resource-import.dto';
import { ImportStatus } from '@apps/resources-service/utils/import-status.enum';
import { JwtAuthGuard } from '@libs/common/guards/jwt-auth.guard';
import { ResponseUtil } from '@libs/common/utils/response.util';
import { SuccessResponseDto, PaginatedResponseDto } from '@libs/dto/common/response.dto';
import { RolesGuard } from '@libs/common/guards/roles.guard';
import { Roles } from '@libs/common/decorators/roles.decorator';
import { CurrentUser } from '@libs/common/decorators/current-user.decorator';
import { UserEntity, UserRole } from '@apps/auth-service/domain/entities/user.entity';
import { Multer } from 'multer';
import { RESOURCES_URLS } from '../../utils/maps';

/**
 * HITO 6 - RF-04: ResourceImport Controller
 * Handles HTTP requests for bulk resource imports
 */
@ApiTags(RESOURCES_URLS.IMPORT_TAG)
@Controller(RESOURCES_URLS.IMPORT)
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class ResourceImportController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
  ) {}

  /**
   * Previews CSV file before import
   */
  @Post(RESOURCES_URLS.IMPORT_PREVIEW)
  @Roles(UserRole.GENERAL_ADMIN, UserRole.PROGRAM_ADMIN)
  @UseInterceptors(FileInterceptor('file'))
  @ApiConsumes('multipart/form-data')
  @ApiOperation({
    summary: 'Preview CSV import',
    description: 'Validates and previews a CSV file before starting the actual import process.',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'CSV preview generated successfully',
    type: ImportPreviewDto,
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Invalid CSV file or format',
  })
  @ApiResponse({
    status: HttpStatus.FORBIDDEN,
    description: 'Insufficient permissions',
  })
  async previewImport(
    @UploadedFile() file: Multer.File,
    @CurrentUser() user: UserEntity,
  ): Promise<ImportPreviewDto> {
    return await this.commandBus.execute(
      new PreviewImportCommand(file, user.id!)
    );
  }

  /**
   * Starts the import process
   */
  @Post(RESOURCES_URLS.IMPORT_START)
  @Roles(UserRole.GENERAL_ADMIN, UserRole.PROGRAM_ADMIN)
  @UseInterceptors(FileInterceptor('file'))
  @HttpCode(HttpStatus.ACCEPTED)
  @ApiConsumes('multipart/form-data')
  @ApiOperation({
    summary: 'Start resource import',
    description: 'Starts the bulk import process for resources from a CSV file.',
  })
  @ApiResponse({
    status: HttpStatus.ACCEPTED,
    description: 'Import started successfully',
    type: SuccessResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Invalid CSV file or validation errors prevent import',
  })
  @ApiResponse({
    status: HttpStatus.FORBIDDEN,
    description: 'Insufficient permissions',
  })
  async startImport(
    @UploadedFile() file: Multer.File,
    @CurrentUser() user: UserEntity,
  ) {
    const importResult = await this.commandBus.execute(
      new StartImportCommand(file, user.id!)
    );
    return ResponseUtil.success(importResult, 'Import started successfully');
  }

  /**
   * Gets import status and details
   */
  @Get(RESOURCES_URLS.IMPORT_FIND_BY_ID)
  @ApiOperation({
    summary: 'Get import by ID',
    description: 'Retrieves the status and details of a specific import operation.',
  })
  @ApiParam({
    name: 'id',
    description: 'Import ID',
    type: String,
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Import details retrieved successfully',
    type: SuccessResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Import not found',
  })
  async getImportById(@Param('id') id: string) {
    const importDetails = await this.queryBus.execute(
      new GetImportByIdQuery(id)
    );
    return ResponseUtil.success(importDetails, 'Import details retrieved successfully');
  }

  /**
   * Gets imports by current user
   */
  @Get(RESOURCES_URLS.IMPORT_HISTORY)
  @ApiOperation({
    summary: 'Get my imports',
    description: 'Retrieves all import operations initiated by the current user.',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'User imports retrieved successfully',
    type: SuccessResponseDto,
  })
  async getMyImports(@CurrentUser() user: UserEntity) {
    const myImports = await this.queryBus.execute(
      new GetImportsByUserQuery(user.id!)
    );
    return ResponseUtil.success(myImports, 'User imports retrieved successfully');
  }

  /**
   * Gets imports with pagination and filters
   */
  @Get(RESOURCES_URLS.IMPORT_PAGINATED)
  @Roles(UserRole.GENERAL_ADMIN, UserRole.PROGRAM_ADMIN)
  @ApiOperation({
    summary: 'Get all imports with pagination',
    description: 'Retrieves all import operations with optional filtering. Only administrators can access this.',
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
    name: 'userId',
    required: false,
    type: String,
    description: 'Filter by user ID',
  })
  @ApiQuery({
    name: 'status',
    required: false,
    enum: ImportStatus,
    description: 'Filter by import status',
  })
  @ApiQuery({
    name: 'dateFrom',
    required: false,
    type: String,
    description: 'Filter by start date (ISO string)',
  })
  @ApiQuery({
    name: 'dateTo',
    required: false,
    type: String,
    description: 'Filter by end date (ISO string)',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Imports retrieved successfully',
    schema: {
      type: 'object',
      properties: {
        imports: {
          type: 'array',
          items: { $ref: '#/components/schemas/ResourceImportResponseDto' },
        },
        total: { type: 'number' },
        page: { type: 'number' },
        limit: { type: 'number' },
      },
    },
  })
  @ApiResponse({
    status: HttpStatus.FORBIDDEN,
    description: 'Insufficient permissions',
  })
  async getImports(
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 10,
    @Query('userId') userId?: string,
    @Query('status') status?: ImportStatus,
    @Query('dateFrom') dateFrom?: string,
    @Query('dateTo') dateTo?: string,
  ): Promise<{
    imports: ResourceImportResponseDto[];
    total: number;
    page: number;
    limit: number;
  }> {
    const filters: any = {};
    
    if (userId) filters.userId = userId;
    if (status) filters.status = status;
    if (dateFrom) filters.dateFrom = new Date(dateFrom);
    if (dateTo) filters.dateTo = new Date(dateTo);

    return await this.queryBus.execute(
      new GetImportsQuery(page, limit, filters)
    );
  }

  /**
   * Gets import statistics
   */
  @Get(RESOURCES_URLS.IMPORT_STATISTICS_OVERVIEW)
  @Roles(UserRole.GENERAL_ADMIN, UserRole.PROGRAM_ADMIN)
  @ApiOperation({
    summary: 'Get import statistics',
    description: 'Retrieves overall statistics about import operations.',
  })
  @ApiQuery({
    name: 'userId',
    required: false,
    type: String,
    description: 'Get statistics for specific user (optional)',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Import statistics retrieved successfully',
    schema: {
      type: 'object',
      properties: {
        totalImports: { type: 'number' },
        successfulImports: { type: 'number' },
        failedImports: { type: 'number' },
        totalResourcesImported: { type: 'number' },
        averageSuccessRate: { type: 'number' },
      },
    },
  })
  @ApiResponse({
    status: HttpStatus.FORBIDDEN,
    description: 'Insufficient permissions',
  })
  async getImportStatistics(
    @Query('userId') userId?: string,
  ): Promise<{
    totalImports: number;
    successfulImports: number;
    failedImports: number;
    totalResourcesImported: number;
    averageSuccessRate: number;
  }> {
    return await this.queryBus.execute(
      new GetImportStatisticsQuery(userId)
    );
  }

  /**
   * Gets user's import statistics
   */
  @Get(RESOURCES_URLS.IMPORT_STATISTICS_MY_STATS)
  @ApiOperation({
    summary: 'Get my import statistics',
    description: 'Retrieves import statistics for the current user.',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'User import statistics retrieved successfully',
    schema: {
      type: 'object',
      properties: {
        totalImports: { type: 'number' },
        successfulImports: { type: 'number' },
        failedImports: { type: 'number' },
        totalResourcesImported: { type: 'number' },
        averageSuccessRate: { type: 'number' },
      },
    },
  })
  async getMyImportStatistics(
    @CurrentUser() user: UserEntity,
  ): Promise<{
    totalImports: number;
    successfulImports: number;
    failedImports: number;
    totalResourcesImported: number;
    averageSuccessRate: number;
  }> {
    return await this.queryBus.execute(
      new GetImportStatisticsQuery(user.id!)
    );
  }
}
