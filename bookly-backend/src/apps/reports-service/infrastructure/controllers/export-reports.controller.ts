import { 
  Controller, 
  Post,
  Get,
  Query, 
  Body,
  Param,
  UseGuards, 
  Request,
  Response,
  HttpException,
  HttpStatus,
  ValidationPipe,
  UsePipes
} from '@nestjs/common';
import { QueryBus } from '@nestjs/cqrs';
import { 
  ApiTags, 
  ApiOperation, 
  ApiResponse, 
  ApiBearerAuth,
  ApiParam,
  ApiConsumes,
  ApiProduces
} from '@nestjs/swagger';
import { JwtAuthGuard } from '@/libs/common/guards/jwt-auth.guard';
import { RolesGuard } from '@/apps/auth-service/infrastructure/guards/roles.guard';
import { Roles } from '@/apps/auth-service/infrastructure/decorators/roles.decorator';
import { ExportCsvDto } from '@dto/reports/export-csv.dto';
import { ExportResponseDto } from '@dto/reports/report-response.dto';
import { 
  ExportReportQuery, 
  ExportHistoryQuery, 
  DownloadExportQuery,
  CachedReportQuery 
} from '../../application/queries/export-report.query';
import { LoggingService } from '@logging/logging.service';
import { LoggingHelper } from '@/libs/logging/logging.helper';
import { Response as ExpressResponse } from 'express';

/**
 * RF-33: Export Reports Controller
 * Handles endpoints for exporting reports in CSV format and managing exports
 */
@ApiTags('Export Reports')
@Controller('reports/export')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class ExportReportsController {
  constructor(
    private readonly queryBus: QueryBus,
    private readonly loggingService: LoggingService,
  ) {}

  /**
   * Export report to CSV format
   * RF-33: Export reports in CSV format with customizable options
   */
  @Post('csv')
  @Roles('ADMIN', 'PROGRAM_ADMIN', 'ADMINISTRATIVE')
  @ApiOperation({ 
    summary: 'Export report to CSV',
    description: 'Export usage or user report to CSV format with customizable columns and options' 
  })
  @ApiConsumes('application/json')
  @ApiResponse({ 
    status: 201, 
    description: 'Export initiated successfully',
    type: ExportResponseDto 
  })
  @ApiResponse({ status: 400, description: 'Invalid export configuration' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Insufficient permissions' })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  @UsePipes(new ValidationPipe({ transform: true }))
  async exportToCsv(
    @Body() exportConfig: ExportCsvDto,
    @Request() req: any,
  ): Promise<ExportResponseDto> {
    const startTime = Date.now();
    const requestId = req.headers['x-request-id'] || `exp_${Date.now()}`;

    try {
      this.loggingService.log(
        `CSV export requested`,
        'ExportReportsController',
        LoggingHelper.logParams({ 
          userId: req.user.id, 
          reportType: exportConfig.reportType,
          format: exportConfig.format,
          requestId 
        })
      );

      const query = new ExportReportQuery(
        exportConfig,
        req.user.id,
        req.user.roles || [],
        requestId,
      );

      const result = await this.queryBus.execute<ExportReportQuery, ExportResponseDto>(query);

      const executionTime = Date.now() - startTime;

      this.loggingService.log(
        `CSV export completed successfully`,
        'ExportReportsController',
        LoggingHelper.logParams({ 
          userId: req.user.id,
          filename: result.filename,
          executionTime,
          requestId 
        })
      );

      return result;

    } catch (error) {
      const executionTime = Date.now() - startTime;

      this.loggingService.error(
        `Error exporting to CSV: ${error.message}`,
        error.stack,
        LoggingHelper.logParams({ 
          userId: req.user?.id,
          reportType: exportConfig?.reportType,
          executionTime,
          requestId 
        })
      );

      throw new HttpException(
        {
          message: 'Error exporting report to CSV',
          error: error.message,
          timestamp: new Date().toISOString(),
          path: '/reports/export/csv',
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * Download exported file
   */
  @Get('download/:exportId')
  @Roles('ADMIN', 'PROGRAM_ADMIN', 'ADMINISTRATIVE', 'TEACHER', 'STUDENT')
  @ApiOperation({ 
    summary: 'Download exported file',
    description: 'Download a previously exported report file' 
  })
  @ApiParam({ 
    name: 'exportId', 
    description: 'ID of the export to download' 
  })
  @ApiProduces('application/octet-stream')
  @ApiResponse({ 
    status: 200, 
    description: 'File downloaded successfully',
    schema: {
      type: 'string',
      format: 'binary',
    }
  })
  @ApiResponse({ status: 404, description: 'Export not found or expired' })
  @ApiResponse({ status: 403, description: 'Access denied to this export' })
  async downloadExport(
    @Param('exportId') exportId: string,
    @Request() req: any,
    @Response() res: ExpressResponse,
  ): Promise<void> {
    try {
      this.loggingService.log(
        `Export download requested`,
        'ExportReportsController',
        LoggingHelper.logParams({ 
          userId: req.user.id, 
          exportId 
        })
      );

      const query = new DownloadExportQuery(
        exportId,
        req.user.id,
        req.user.roles || [],
      );

      const result = await this.queryBus.execute(query);

      if (!result || !result.filePath) {
        throw new HttpException(
          'Export not found or expired',
          HttpStatus.NOT_FOUND,
        );
      }

      // Set appropriate headers for file download
      res.setHeader('Content-Type', result.mimeType || 'application/octet-stream');
      res.setHeader('Content-Disposition', `attachment; filename="${result.filename}"`);
      res.setHeader('Content-Length', result.fileSize);

      // Stream the file
      res.sendFile(result.filePath, (err) => {
        if (err) {
          this.loggingService.error(
            `Error streaming file: ${err.message}`,
            err.stack,
            LoggingHelper.logParams({ 
              userId: req.user.id,
              exportId,
              filePath: result.filePath 
            })
          );
        } else {
          this.loggingService.log(
            `Export downloaded successfully`,
            'ExportReportsController',
            LoggingHelper.logParams({ 
              userId: req.user.id,
              exportId,
              filename: result.filename 
            })
          );
        }
      });

    } catch (error) {
      this.loggingService.error(
        `Error downloading export: ${error.message}`,
        error.stack,
        LoggingHelper.logParams({ 
          userId: req.user?.id,
          exportId 
        })
      );

      if (error instanceof HttpException) {
        throw error;
      }

      throw new HttpException(
        {
          message: 'Error downloading export',
          error: error.message,
          timestamp: new Date().toISOString(),
          path: `/reports/export/download/${exportId}`,
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * Get export history for current user
   */
  @Get('history')
  @Roles('ADMIN', 'PROGRAM_ADMIN', 'ADMINISTRATIVE', 'TEACHER', 'STUDENT')
  @ApiOperation({ 
    summary: 'Get export history',
    description: 'Get history of exports created by the current user' 
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Export history retrieved successfully',
    schema: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          id: { type: 'string' },
          reportType: { type: 'string' },
          format: { type: 'string' },
          filename: { type: 'string' },
          status: { type: 'string' },
          createdAt: { type: 'string', format: 'date-time' },
          completedAt: { type: 'string', format: 'date-time' },
          expiresAt: { type: 'string', format: 'date-time' },
          fileSize: { type: 'number' },
          downloadCount: { type: 'number' },
          isAvailable: { type: 'boolean' },
        },
      },
    }
  })
  async getExportHistory(
    @Query('limit') limit?: number,
    @Query('reportType') reportType?: string,
    @Request() req?: any,
  ): Promise<any[]> {
    try {
      this.loggingService.log(
        `Export history requested`,
        'ExportReportsController',
        LoggingHelper.logParams({ 
          userId: req.user.id, 
          limit, 
          reportType 
        })
      );

      const query = new ExportHistoryQuery(
        req.user.id,
        reportType,
        limit,
      );

      const result = await this.queryBus.execute(query);

      return result;

    } catch (error) {
      this.loggingService.error(
        `Error getting export history: ${error.message}`,
        error.stack,
        LoggingHelper.logParams({ 
          userId: req.user?.id,
          limit,
          reportType 
        })
      );

      throw new HttpException(
        {
          message: 'Error getting export history',
          error: error.message,
          timestamp: new Date().toISOString(),
          path: '/reports/export/history',
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * Get cached report data (for quick re-export)
   */
  @Get('cached/:reportId')
  @Roles('ADMIN', 'PROGRAM_ADMIN', 'ADMINISTRATIVE')
  @ApiOperation({ 
    summary: 'Get cached report data',
    description: 'Get cached report data for quick re-export without regenerating' 
  })
  @ApiParam({ 
    name: 'reportId', 
    description: 'ID of the cached report' 
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Cached report data retrieved successfully',
    schema: {
      type: 'object',
      properties: {
        id: { type: 'string' },
        reportType: { type: 'string' },
        data: { type: 'object' },
        metadata: { type: 'object' },
        summary: { type: 'object' },
        createdAt: { type: 'string', format: 'date-time' },
        expiresAt: { type: 'string', format: 'date-time' },
        isValid: { type: 'boolean' },
      },
    }
  })
  @ApiResponse({ status: 404, description: 'Cached report not found or expired' })
  async getCachedReport(
    @Param('reportId') reportId: string,
    @Request() req: any,
  ): Promise<any> {
    try {
      this.loggingService.log(
        `Cached report requested`,
        'ExportReportsController',
        LoggingHelper.logParams({ 
          userId: req.user.id, 
          reportId 
        })
      );

      const query = new CachedReportQuery(
        reportId,
        req.user.id,
        req.user.roles || [],
      );

      const result = await this.queryBus.execute(query);

      if (!result) {
        throw new HttpException(
          'Cached report not found or expired',
          HttpStatus.NOT_FOUND,
        );
      }

      return result;

    } catch (error) {
      this.loggingService.error(
        `Error getting cached report: ${error.message}`,
        error.stack,
        LoggingHelper.logParams({ 
          userId: req.user?.id,
          reportId 
        })
      );

      if (error instanceof HttpException) {
        throw error;
      }

      throw new HttpException(
        {
          message: 'Error getting cached report',
          error: error.message,
          timestamp: new Date().toISOString(),
          path: `/reports/export/cached/${reportId}`,
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * Get export status
   */
  @Get('status/:exportId')
  @Roles('ADMIN', 'PROGRAM_ADMIN', 'ADMINISTRATIVE', 'TEACHER', 'STUDENT')
  @ApiOperation({ 
    summary: 'Get export status',
    description: 'Get current status of an export operation' 
  })
  @ApiParam({ 
    name: 'exportId', 
    description: 'ID of the export to check' 
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Export status retrieved successfully',
    schema: {
      type: 'object',
      properties: {
        id: { type: 'string' },
        status: { type: 'string', enum: ['PENDING', 'PROCESSING', 'COMPLETED', 'FAILED', 'EXPIRED'] },
        progress: { type: 'number', minimum: 0, maximum: 100 },
        message: { type: 'string' },
        createdAt: { type: 'string', format: 'date-time' },
        completedAt: { type: 'string', format: 'date-time' },
        expiresAt: { type: 'string', format: 'date-time' },
        isAvailable: { type: 'boolean' },
        downloadUrl: { type: 'string' },
      },
    }
  })
  async getExportStatus(
    @Param('exportId') exportId: string,
    @Request() req: any,
    @Query('reportType') reportType?: string,
    @Query('limit') limit?: number,
  ): Promise<any> {
    try {
      const query = new ExportHistoryQuery(
        req.user.id,
        reportType,
        limit,
      );

      const result = await this.queryBus.execute(query);
      const exportData = result[0];

      if (!exportData) {
        throw new HttpException(
          'Export not found',
          HttpStatus.NOT_FOUND,
        );
      }

      return {
        id: exportData.id,
        status: exportData.status,
        progress: exportData.status === 'COMPLETED' ? 100 : 
                 exportData.status === 'PROCESSING' ? 50 : 
                 exportData.status === 'PENDING' ? 0 : 0,
        message: exportData.status === 'COMPLETED' ? 'Export completed successfully' :
                exportData.status === 'FAILED' ? 'Export failed' :
                exportData.status === 'PROCESSING' ? 'Export in progress' :
                'Export pending',
        createdAt: exportData.createdAt,
        completedAt: exportData.completedAt,
        expiresAt: exportData.expiresAt,
        isAvailable: exportData.isAvailable,
        downloadUrl: exportData.isAvailable ? `/reports/export/download/${exportId}` : null,
      };

    } catch (error) {
      this.loggingService.error(
        `Error getting export status: ${error.message}`,
        error.stack,
        LoggingHelper.logParams({ 
          userId: req.user?.id,
          exportId 
        })
      );

      if (error instanceof HttpException) {
        throw error;
      }

      throw new HttpException(
        {
          message: 'Error getting export status',
          error: error.message,
          timestamp: new Date().toISOString(),
          path: `/reports/export/status/${exportId}`,
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
