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
import { ResourceImportService } from '../../application/services/resource-import.service';
import {
  ResourceImportResponseDto,
  ImportPreviewDto,
} from '../../application/dtos/resource-import.dto';
import { ImportStatus } from '../../utils/import-status.enum';
import { JwtAuthGuard } from '@libs/common/guards/jwt-auth.guard';
import { RolesGuard } from '@libs/common/guards/roles.guard';
import { Roles } from '@libs/common/decorators/roles.decorator';
import { CurrentUser } from '@libs/common/decorators/current-user.decorator';
import { UserEntity } from '../../../auth-service/domain/entities/user.entity';
import { Multer } from 'multer';

/**
 * HITO 6 - RF-04: ResourceImport Controller
 * Handles HTTP requests for bulk resource imports
 */
@ApiTags('Resource Import')
@Controller('resource-import')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class ResourceImportController {
  constructor(private readonly resourceImportService: ResourceImportService) {}

  /**
   * Previews CSV file before import
   */
  @Post('preview')
  @Roles('ADMIN_GENERAL', 'ADMIN_PROGRAMA')
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
    return await this.resourceImportService.previewImport(file, user.id!);
  }

  /**
   * Starts the import process
   */
  @Post('start')
  @Roles('ADMIN_GENERAL', 'ADMIN_PROGRAMA')
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
    type: ResourceImportResponseDto,
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
  ): Promise<ResourceImportResponseDto> {
    return await this.resourceImportService.startImport(file, user.id!);
  }

  /**
   * Gets import status and details
   */
  @Get(':id')
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
    type: ResourceImportResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Import not found',
  })
  async getImportById(@Param('id') id: string): Promise<ResourceImportResponseDto> {
    return await this.resourceImportService.getImportById(id);
  }

  /**
   * Gets imports by current user
   */
  @Get('user/my-imports')
  @ApiOperation({
    summary: 'Get my imports',
    description: 'Retrieves all import operations initiated by the current user.',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'User imports retrieved successfully',
    type: [ResourceImportResponseDto],
  })
  async getMyImports(@CurrentUser() user: UserEntity): Promise<ResourceImportResponseDto[]> {
    return await this.resourceImportService.getImportsByUser(user.id!);
  }

  /**
   * Gets imports with pagination and filters
   */
  @Get()
  @Roles('ADMIN_GENERAL', 'ADMIN_PROGRAMA')
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

    return await this.resourceImportService.getImports(page, limit, filters);
  }

  /**
   * Gets import statistics
   */
  @Get('statistics/overview')
  @Roles('ADMIN_GENERAL', 'ADMIN_PROGRAMA')
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
    return await this.resourceImportService.getImportStatistics(userId);
  }

  /**
   * Gets user's import statistics
   */
  @Get('statistics/my-stats')
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
    return await this.resourceImportService.getImportStatistics(user.id!);
  }
}
