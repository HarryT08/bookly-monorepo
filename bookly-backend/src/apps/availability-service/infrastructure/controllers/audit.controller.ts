/**
 * Audit Controller
 * Provides REST API endpoints for audit management and querying
 * Allows administrators to view audit trails and generate reports
 */

import { Controller, Get, Post, Body, Query, Param, Logger, HttpStatus, HttpException, Delete, HttpCode, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam, ApiQuery, ApiBody, ApiBearerAuth } from '@nestjs/swagger';
import { AVAILABILITY_URLS } from '../../utils/maps/urls.map';
import { ResponseUtil } from '@libs/common/utils/response.util';
import { SuccessResponseDto } from '@libs/dto/common/response.dto';
import { AuditExportDto, CreateTestAuditDto } from '@libs/dto';
import { Inject } from '@nestjs/common';
import { LoggingService } from '@logging/logging.service';
import { AuditService, AuditEventType, AuditCategory } from '../services/audit.service';
import { AuditRepository, AuditQueryFilters } from '../repositories/audit.repository';
import { LoggingHelper } from '@/libs/logging/logging.helper';
import { JwtAuthGuard, RolesGuard, Roles, UserRole } from '@/libs/common';

@ApiTags('Audit')
@Controller('audit')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class AuditController {
  constructor(
    private readonly auditService: AuditService,
    private readonly auditRepository: AuditRepository,
    private readonly logger: LoggingService
  ) {}

  /**
   * Get audit entries with filtering and pagination
   */
  @Get('entries')
  @Roles(UserRole.GENERAL_ADMIN, UserRole.PROGRAM_ADMIN)
  @ApiOperation({
    summary: 'Get audit entries',
    description: 'Retrieve audit entries with optional filtering and pagination'
  })
  @ApiResponse({
    status: 200,
    description: 'Audit entries retrieved successfully',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean' },
        data: {
          type: 'object',
          properties: {
            entries: {
              type: 'array',
              items: { type: 'object' }
            },
            total: { type: 'number' },
            page: { type: 'number' },
            limit: { type: 'number' }
          }
        }
      }
    }
  })
  @ApiQuery({ name: 'eventType', required: false, description: 'Filter by event type' })
  @ApiQuery({ name: 'category', required: false, description: 'Filter by category' })
  @ApiQuery({ name: 'resource', required: false, description: 'Filter by resource' })
  @ApiQuery({ name: 'resourceId', required: false, description: 'Filter by resource ID' })
  @ApiQuery({ name: 'userId', required: false, description: 'Filter by user ID' })
  @ApiQuery({ name: 'userRole', required: false, description: 'Filter by user role' })
  @ApiQuery({ name: 'status', required: false, description: 'Filter by status' })
  @ApiQuery({ name: 'severity', required: false, description: 'Filter by severity' })
  @ApiQuery({ name: 'dateFrom', required: false, description: 'Filter from date (ISO string)' })
  @ApiQuery({ name: 'dateTo', required: false, description: 'Filter to date (ISO string)' })
  @ApiQuery({ name: 'correlationId', required: false, description: 'Filter by correlation ID' })
  @ApiQuery({ name: 'page', required: false, description: 'Page number (default: 1)' })
  @ApiQuery({ name: 'limit', required: false, description: 'Items per page (default: 50)' })
  @ApiQuery({ name: 'sortBy', required: false, description: 'Sort field (timestamp, severity, duration)' })
  @ApiQuery({ name: 'sortOrder', required: false, description: 'Sort order (asc, desc)' })
  async getAuditEntries(@Query() query: any) {
    try {
      const page = parseInt(query.page) || 1;
      const limit = parseInt(query.limit) || 50;
      const offset = (page - 1) * limit;

      const filters: AuditQueryFilters = {
        eventType: query.eventType,
        category: query.category,
        resource: query.resource,
        resourceId: query.resourceId,
        userId: query.userId,
        userRole: query.userRole,
        status: query.status,
        severity: query.severity,
        dateFrom: query.dateFrom ? new Date(query.dateFrom) : undefined,
        dateTo: query.dateTo ? new Date(query.dateTo) : undefined,
        correlationId: query.correlationId,
        limit,
        offset,
        sortBy: query.sortBy,
        sortOrder: query.sortOrder,
      };

      const entries = await this.auditRepository.find(filters);

      // Get total count for pagination
      const totalFilters = { ...filters };
      delete totalFilters.limit;
      delete totalFilters.offset;
      const allEntries = await this.auditRepository.find(totalFilters);
      const total = allEntries.length;

      this.logger.log('Audit entries retrieved via API', {
        page,
        limit,
        total,
        filters
      });

      return {
        success: true,
        data: {
          entries,
          total,
          page,
          limit,
          totalPages: Math.ceil(total / limit)
        }
      };

    } catch (error) {
      this.logger.error('Failed to get audit entries via API', error, LoggingHelper.logParams({ query }));
      throw error;
    }
  }

  /**
   * Get audit entry by ID
   */
  @Get('entries/:id')
  @Roles(UserRole.GENERAL_ADMIN, UserRole.PROGRAM_ADMIN)
  @ApiOperation({
    summary: 'Get audit entry by ID',
    description: 'Retrieve a specific audit entry by its ID'
  })
  @ApiParam({ name: 'id', description: 'Audit entry ID' })
  @ApiResponse({
    status: 200,
    description: 'Audit entry retrieved successfully',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean' },
        data: { type: 'object' }
      }
    }
  })
  @ApiResponse({
    status: 404,
    description: 'Audit entry not found'
  })
  async getAuditEntryById(@Param('id') id: string) {
    try {
      const entry = await this.auditRepository.findById(id);

      if (!entry) {
        return {
          success: false,
          error: 'Audit entry not found',
          code: 'AUDIT_ENTRY_NOT_FOUND'
        };
      }

      this.logger.log('Audit entry retrieved by ID via API', { id });

      return {
        success: true,
        data: entry
      };

    } catch (error) {
      this.logger.error('Failed to get audit entry by ID via API', error, LoggingHelper.logParams({ id }));
      throw error;
    }
  }

  /**
   * Get audit statistics
   */
  @Get('statistics')
  @Roles(UserRole.GENERAL_ADMIN, UserRole.PROGRAM_ADMIN)
  @ApiOperation({
    summary: 'Get audit statistics',
    description: 'Retrieve comprehensive audit statistics and analytics'
  })
  @ApiResponse({
    status: 200,
    description: 'Audit statistics retrieved successfully',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean' },
        data: { type: 'object' }
      }
    }
  })
  @ApiQuery({ name: 'dateFrom', required: false, description: 'Statistics from date (ISO string)' })
  @ApiQuery({ name: 'dateTo', required: false, description: 'Statistics to date (ISO string)' })
  async getAuditStatistics(@Query() query: any) {
    try {
      const filters: AuditQueryFilters = {
        dateFrom: query.dateFrom ? new Date(query.dateFrom) : undefined,
        dateTo: query.dateTo ? new Date(query.dateTo) : undefined,
      };

      const statistics = await this.auditRepository.getStatistics(filters);

      this.logger.log('Audit statistics retrieved via API', { filters });

      return {
        success: true,
        data: statistics
      };

    } catch (error) {
      this.logger.error('Failed to get audit statistics via API', error, LoggingHelper.logParams({ query }));
      throw error;
    }
  }

  /**
   * Export audit entries to JSON
   */
  @Post('export')
  @Roles(UserRole.GENERAL_ADMIN, UserRole.PROGRAM_ADMIN)
  @ApiOperation({
    summary: 'Export audit entries',
    description: 'Export audit entries to JSON format with optional filtering'
  })
  @ApiBody({
    description: 'Export filters',
    schema: {
      type: 'object',
      properties: {
        eventType: { type: 'string' },
        category: { type: 'string' },
        resource: { type: 'string' },
        userId: { type: 'string' },
        dateFrom: { type: 'string', format: 'date-time' },
        dateTo: { type: 'string', format: 'date-time' },
        limit: { type: 'number', default: 10000 }
      }
    }
  })
  @ApiResponse({
    status: 200,
    description: 'Audit entries exported successfully',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean' },
        data: {
          type: 'object',
          properties: {
            exportData: { type: 'string' },
            filename: { type: 'string' },
            count: { type: 'number' }
          }
        }
      }
    }
  })
  async exportAuditEntries(@Body() filters: AuditExportDto) {
    try {
      const exportFilters: AuditQueryFilters = {
        eventType: filters.eventType,
        category: filters.category,
        resource: filters.resource,
        userId: filters.userId,
        dateFrom: filters.dateFrom ? new Date(filters.dateFrom) : undefined,
        dateTo: filters.dateTo ? new Date(filters.dateTo) : undefined,
        limit: filters.limit || 10000,
      };

      const exportData = await this.auditRepository.exportToJson(exportFilters);
      const filename = `audit_export_${new Date().toISOString().split('T')[0]}.json`;

      this.logger.log('Audit entries exported via API', {
        filters: exportFilters,
        filename
      });

      return {
        success: true,
        data: {
          exportData,
          filename,
          count: JSON.parse(exportData).count
        }
      };

    } catch (error) {
      this.logger.error('Failed to export audit entries via API', error, LoggingHelper.logParams({ filters }));
      throw error;
    }
  }

  /**
   * Get audit event types
   */
  @Get('event-types')
  @Roles(UserRole.GENERAL_ADMIN, UserRole.PROGRAM_ADMIN)
  @ApiOperation({
    summary: 'Get available audit event types',
    description: 'Retrieve list of all available audit event types for filtering'
  })
  @ApiResponse({
    status: 200,
    description: 'Event types retrieved successfully',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean' },
        data: {
          type: 'array',
          items: { type: 'string' }
        }
      }
    }
  })
  async getAuditEventTypes() {
    try {
      const eventTypes = Object.values(AuditEventType);

      return {
        success: true,
        data: eventTypes
      };

    } catch (error) {
      this.logger.error('Failed to get audit event types via API', error);
      throw error;
    }
  }

  /**
   * Get audit categories
   */
  @Get('categories')
  @Roles(UserRole.GENERAL_ADMIN, UserRole.PROGRAM_ADMIN)
  @ApiOperation({
    summary: 'Get available audit categories',
    description: 'Retrieve list of all available audit categories for filtering'
  })
  @ApiResponse({
    status: 200,
    description: 'Categories retrieved successfully',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean' },
        data: {
          type: 'array',
          items: { type: 'string' }
        }
      }
    }
  })
  async getAuditCategories() {
    try {
      const categories = Object.values(AuditCategory);

      return {
        success: true,
        data: categories
      };

    } catch (error) {
      this.logger.error('Failed to get audit categories via API', error);
      throw error;
    }
  }

  /**
   * Clean up old audit entries
   */
  @Delete('cleanup')
  @Roles(UserRole.GENERAL_ADMIN)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Clean up old audit entries',
    description: 'Delete audit entries older than specified retention period (Admin only)'
  })
  @ApiQuery({ name: 'retentionDays', description: 'Number of days to retain (default: 365)' })
  @ApiResponse({
    status: 200,
    description: 'Old audit entries cleaned up successfully',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean' },
        data: {
          type: 'object',
          properties: {
            deletedCount: { type: 'number' },
            retentionDays: { type: 'number' }
          }
        }
      }
    }
  })
  async cleanupOldEntries(@Query('retentionDays') retentionDays?: string) {
    try {
      const retention = parseInt(retentionDays || '365');
      const deletedCount = await this.auditRepository.deleteOldEntries(retention);

      this.logger.log('Old audit entries cleaned up via API', {
        deletedCount,
        retentionDays: retention
      });

      return {
        success: true,
        data: {
          deletedCount,
          retentionDays: retention
        }
      };

    } catch (error) {
      this.logger.error('Failed to cleanup old audit entries via API', error, LoggingHelper.logParams({ retentionDays }));
      throw error;
    }
  }

  /**
   * Manual audit entry creation (for testing)
   */
  @Post('test-entry')
  @Roles(UserRole.GENERAL_ADMIN)
  @ApiOperation({
    summary: 'Create test audit entry',
    description: 'Create a test audit entry for testing purposes (Admin only)'
  })
  @ApiBody({
    description: 'Test audit entry data',
    schema: {
      type: 'object',
      properties: {
        eventType: { type: 'string' },
        category: { type: 'string' },
        action: { type: 'string' },
        resource: { type: 'string' },
        resourceId: { type: 'string' },
        payload: { type: 'object' }
      },
      required: ['eventType', 'category', 'action', 'resource']
    }
  })
  @ApiResponse({
    status: 201,
    description: 'Test audit entry created successfully',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean' },
        data: {
          type: 'object',
          properties: {
            auditId: { type: 'string' }
          }
        }
      }
    }
  })
  async createTestAuditEntry(@Body() testData: CreateTestAuditDto) {
    try {
      const auditContext = {
        userId: 'test-user',
        userRole: 'ADMIN_GENERAL',
        ipAddress: '127.0.0.1',
        userAgent: 'Test Agent',
        correlationId: `test-${Date.now()}`
      };

      await this.auditService.audit(
        testData.eventType as AuditEventType,
        testData.category as AuditCategory,
        testData.action,
        testData.resource,
        auditContext,
        {
          resourceId: testData.resourceId,
          payload: testData.payload,
          tags: ['test', 'manual']
        }
      );

      this.logger.log('Test audit entry created via API', { testData });

      return {
        success: true,
        data: {
          message: 'Test audit entry created successfully'
        }
      };

    } catch (error) {
      this.logger.error('Failed to create test audit entry via API', error, LoggingHelper.logParams({ testData }));
      throw error;
    }
  }
}
