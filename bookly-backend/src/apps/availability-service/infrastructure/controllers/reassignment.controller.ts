/**
 * RF-15: Reassignment REST Controller
 * Handles HTTP requests for reservation reassignment management
 */

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
  ValidationPipe,
  ParseUUIDPipe
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiQuery,
  ApiBearerAuth,
  ApiBody
} from '@nestjs/swagger';
import { JwtAuthGuard } from '@apps/auth-service/infrastructure/guards/jwt-auth.guard';
import { RolesGuard } from '@libs/common/guards/roles.guard';
import { Roles } from '@apps/auth-service/infrastructure/decorators/roles.decorator';
import { UserRole, CurrentUser } from '@libs/common';

// DTOs
import { CreateReassignmentRequestDto } from '@/apps/availability-service/infrastructure/dtos/create-reassignment-request.dto';
import { ReassignmentRequestResponseDto } from '@/apps/availability-service/infrastructure/dtos/reassignment-request-response.dto';
import { ReassignmentQueryDto } from '@/apps/availability-service/infrastructure/dtos/reassignment-query.dto';
import { ProcessReassignmentResponseDto } from '@/apps/availability-service/infrastructure/dtos/process-reassignment-response.dto';
import { ResourceEquivalenceResponseDto } from '@/apps/availability-service/infrastructure/dtos/resource-equivalence-response.dto';
import { ReassignmentAnalyticsDto } from '@/apps/availability-service/infrastructure/dtos/reassignment-response.dto';

// Services
import { ReassignmentService } from '@/apps/availability-service/application/services/reassignment.service';

@ApiTags('Reassignment')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('reassignment')
export class ReassignmentController {
  constructor(
    private readonly reassignmentService: ReassignmentService
  ) {}

  @Post('request')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Create reassignment request',
    description: 'Creates a new reassignment request for a reservation with automatic resource suggestions'
  })
  @ApiBody({ type: CreateReassignmentRequestDto })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'Reassignment request created successfully',
    type: ReassignmentRequestResponseDto
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Invalid request data or business rule violation'
  })
  @ApiResponse({
    status: HttpStatus.CONFLICT,
    description: 'Existing pending reassignment request for this reservation'
  })
  @Roles(UserRole.PROGRAM_ADMIN, UserRole.GENERAL_ADMIN, UserRole.SECURITY)
  async createReassignmentRequest(
    @Body(ValidationPipe) createDto: CreateReassignmentRequestDto,
    @CurrentUser() user: any
  ): Promise<ReassignmentRequestResponseDto> {
    return await this.reassignmentService.createRequest({
      ...createDto,
      requestedBy: user.id,
      userPriority: this.getUserPriority(user.role)
    });
  }

  @Get('requests')
  @ApiOperation({
    summary: 'Get reassignment requests',
    description: 'Retrieves reassignment requests with optional filtering and pagination'
  })
  @ApiQuery({ type: ReassignmentQueryDto })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Reassignment requests retrieved successfully',
    schema: {
      type: 'object',
      properties: {
        data: { type: 'array', items: { $ref: '#/components/schemas/ReassignmentRequestResponseDto' } },
        total: { type: 'number' },
        page: { type: 'number' },
        limit: { type: 'number' }
      }
    }
  })
  @Roles(UserRole.STUDENT, UserRole.TEACHER, UserRole.PROGRAM_ADMIN, UserRole.GENERAL_ADMIN)
  async getReassignmentRequests(
    @Query(ValidationPipe) queryDto: ReassignmentQueryDto,
    @CurrentUser() user: any
  ): Promise<{
    data: ReassignmentRequestResponseDto[];
    total: number;
    page: number;
    limit: number;
  }> {
    // Students and teachers can only see their own requests
    const filteredQuery = user.role === UserRole.STUDENT || user.role === UserRole.TEACHER
      ? { ...queryDto, userId: user.id }
      : queryDto;

    return await this.reassignmentService.findAll(filteredQuery);
  }

  @Get('requests/:id')
  @ApiOperation({
    summary: 'Get reassignment request by ID',
    description: 'Retrieves a specific reassignment request with suggested resources'
  })
  @ApiParam({
    name: 'id',
    description: 'Reassignment request ID',
    type: 'string',
    format: 'uuid'
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Reassignment request found',
    type: ReassignmentRequestResponseDto
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Reassignment request not found'
  })
  @Roles(UserRole.STUDENT, UserRole.TEACHER, UserRole.PROGRAM_ADMIN, UserRole.GENERAL_ADMIN)
  async getReassignmentRequestById(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user: any
  ): Promise<ReassignmentRequestResponseDto> {
    return await this.reassignmentService.findById(id, user.id);
  }

  @Post('requests/:id/respond')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Respond to reassignment request',
    description: 'User responds to a reassignment request (accept/reject)'
  })
  @ApiParam({
    name: 'id',
    description: 'Reassignment request ID',
    type: 'string',
    format: 'uuid'
  })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        response: {
          type: 'string',
          enum: ['ACCEPT', 'REJECT'],
          description: 'User response to the reassignment request'
        },
        selectedResourceId: {
          type: 'string',
          format: 'uuid',
          description: 'Selected resource ID if accepting (optional)'
        },
        reason: {
          type: 'string',
          description: 'Reason for rejection (required if rejecting)'
        }
      },
      required: ['response']
    }
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Response processed successfully',
    type: ProcessReassignmentResponseDto
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Invalid response or request not in pending status'
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Reassignment request not found'
  })
  @Roles(UserRole.STUDENT, UserRole.TEACHER, UserRole.PROGRAM_ADMIN, UserRole.GENERAL_ADMIN)
  async respondToReassignmentRequest(
    @Param('id', ParseUUIDPipe) id: string,
    @Body('response') response: 'ACCEPT' | 'REJECT',
    @CurrentUser() user: any,
    @Body('selectedResourceId') selectedResourceId?: string,
    @Body('reason') reason?: string,
  ): Promise<ProcessReassignmentResponseDto> {
    return await this.reassignmentService.processUserResponse(
      id,
      response,
      user.id,
      selectedResourceId,
      reason
    );
  }

  @Get('equivalent-resources/:resourceId')
  @ApiOperation({
    summary: 'Find equivalent resources',
    description: 'Finds equivalent resources for reassignment purposes'
  })
  @ApiParam({
    name: 'resourceId',
    description: 'Original resource ID',
    type: 'string',
    format: 'uuid'
  })
  @ApiQuery({
    name: 'programId',
    description: 'Program ID for filtering equivalences',
    required: false,
    type: 'string'
  })
  @ApiQuery({
    name: 'capacity',
    description: 'Required capacity',
    required: false,
    type: 'number'
  })
  @ApiQuery({
    name: 'features',
    description: 'Preferred features (comma-separated)',
    required: false,
    type: 'string'
  })
  @ApiQuery({
    name: 'date',
    description: 'Date for availability check (ISO 8601)',
    required: false,
    type: 'string'
  })
  @ApiQuery({
    name: 'startTime',
    description: 'Start time for availability check (HH:mm)',
    required: false,
    type: 'string'
  })
  @ApiQuery({
    name: 'endTime',
    description: 'End time for availability check (HH:mm)',
    required: false,
    type: 'string'
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Equivalent resources found',
    schema: {
      type: 'object',
      properties: {
        exactMatches: { type: 'array', items: { $ref: '#/components/schemas/ResourceEquivalenceResponseDto' } },
        goodMatches: { type: 'array', items: { $ref: '#/components/schemas/ResourceEquivalenceResponseDto' } },
        acceptableMatches: { type: 'array', items: { $ref: '#/components/schemas/ResourceEquivalenceResponseDto' } },
        recommendations: { type: 'array', items: { type: 'object' } }
      }
    }
  })
  @Roles(UserRole.PROGRAM_ADMIN, UserRole.GENERAL_ADMIN, UserRole.SECURITY)
  async findEquivalentResources(
    @Param('resourceId', ParseUUIDPipe) resourceId: string,
    @CurrentUser() user: any,
    @Query('programId') programId?: string,
    @Query('capacity') capacity?: number,
    @Query('features') features?: string,
    @Query('date') date?: string,
    @Query('startTime') startTime?: string,
    @Query('endTime') endTime?: string,
  ): Promise<{
    exactMatches: ResourceEquivalenceResponseDto[];
    goodMatches: ResourceEquivalenceResponseDto[];
    acceptableMatches: ResourceEquivalenceResponseDto[];
    recommendations: any[];
  }> {
    const timeSlot = date && startTime && endTime ? {
      date: new Date(date),
      startTime,
      endTime
    } : undefined;

    const preferredFeatures = features ? features.split(',').map(f => f.trim()) : undefined;

    return await this.reassignmentService.findEquivalentResources(
      resourceId,
      new Date(timeSlot?.startTime),
      new Date(timeSlot?.endTime),
      capacity,
      null,
      preferredFeatures,
    );
  }

  @Post('validate-request')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Validate reassignment request',
    description: 'Validates a reassignment request without creating it'
  })
  @ApiBody({ type: CreateReassignmentRequestDto })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Validation completed',
    schema: {
      type: 'object',
      properties: {
        canCreate: { type: 'boolean' },
        violations: { type: 'array', items: { type: 'string' } },
        warnings: { type: 'array', items: { type: 'string' } },
        existingRequests: { type: 'array', items: { type: 'object' } },
        suggestedResources: { type: 'number' }
      }
    }
  })
  @Roles(UserRole.PROGRAM_ADMIN, UserRole.GENERAL_ADMIN, UserRole.SECURITY)
  async validateReassignmentRequest(
    @Body(ValidationPipe) createDto: CreateReassignmentRequestDto,
    @CurrentUser() user: any
  ): Promise<{
    canCreate: boolean;
    violations: string[];
    warnings: string[];
    existingRequests: any[];
    suggestedResources: number;
  }> {
    return await this.reassignmentService.validateRequest({
      ...createDto,
      requestedBy: user.id
    });
  }

  @Delete('requests/:id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({
    summary: 'Cancel reassignment request',
    description: 'Cancels a pending reassignment request'
  })
  @ApiParam({
    name: 'id',
    description: 'Reassignment request ID',
    type: 'string',
    format: 'uuid'
  })
  @ApiResponse({
    status: HttpStatus.NO_CONTENT,
    description: 'Reassignment request cancelled successfully'
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Reassignment request not found'
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Request cannot be cancelled in current status'
  })
  @Roles(UserRole.PROGRAM_ADMIN, UserRole.GENERAL_ADMIN)
  async cancelReassignmentRequest(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user: any
  ): Promise<void> {
    await this.reassignmentService.cancelRequest(id, user.id, 'Cancelled by admin');
  }

  @Post('requests/:id/auto-process')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Auto-process reassignment request',
    description: 'Automatically processes a reassignment request based on configuration (admin only)'
  })
  @ApiParam({
    name: 'id',
    description: 'Reassignment request ID',
    type: 'string',
    format: 'uuid'
  })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        hoursUntilEvent: {
          type: 'number',
          description: 'Hours until the event (affects auto-approval logic)'
        }
      },
      required: ['hoursUntilEvent']
    }
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Auto-processing completed',
    schema: {
      type: 'object',
      properties: {
        autoApproved: { type: 'boolean' },
        selectedResource: { type: 'object' },
        reason: { type: 'string' },
        notificationsSent: { type: 'boolean' }
      }
    }
  })
  @Roles(UserRole.PROGRAM_ADMIN, UserRole.GENERAL_ADMIN)
  async autoProcessReassignmentRequest(
    @Param('id', ParseUUIDPipe) id: string,
    @Body('hoursUntilEvent') hoursUntilEvent: number,
    @CurrentUser() user: any
  ): Promise<{
    autoApproved: boolean;
    selectedResource: any | null;
    reason: string;
    notificationsSent: boolean;
  }> {
    return await this.reassignmentService.autoProcessRequest(id, hoursUntilEvent);
  }

  @Get('analytics')
  @ApiOperation({
    summary: 'Get reassignment analytics',
    description: 'Retrieves comprehensive reassignment analytics and insights'
  })
  @ApiQuery({
    name: 'programId',
    description: 'Filter by program ID',
    required: false,
    type: 'string'
  })
  @ApiQuery({
    name: 'timeRange',
    description: 'Time range for analytics (7d, 30d, 90d)',
    required: false,
    enum: ['7d', '30d', '90d']
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Analytics retrieved successfully',
    type: ReassignmentAnalyticsDto
  })
  @Roles(UserRole.PROGRAM_ADMIN, UserRole.GENERAL_ADMIN)
  async getReassignmentAnalytics(
    @CurrentUser() user: any,
    @Query('programId') programId?: string,
    @Query('timeRange') timeRange: string = '30d',
  ): Promise<ReassignmentAnalyticsDto> {
    const timeRangeMap = {
      '7d': { start: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), end: new Date() },
      '30d': { start: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), end: new Date() },
      '90d': { start: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000), end: new Date() }
    };

    return await this.reassignmentService.generateAnalytics(
      programId,
      timeRangeMap[timeRange] || timeRangeMap['30d']
    );
  }

  @Post('bulk-process')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Bulk process reassignment requests',
    description: 'Processes multiple reassignment requests at once (admin only)'
  })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        operations: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              reservationId: { type: 'string', format: 'uuid' },
              reason: { type: 'string' },
              suggestedResourceId: { type: 'string', format: 'uuid' },
              priority: { type: 'string', enum: ['LOW', 'MEDIUM', 'HIGH'] }
            },
            required: ['reservationId', 'reason']
          }
        }
      },
      required: ['operations']
    }
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Bulk processing completed',
    schema: {
      type: 'object',
      properties: {
        successful: { type: 'array', items: { type: 'object' } },
        failed: { type: 'array', items: { type: 'object' } },
        summary: { type: 'object' }
      }
    }
  })
  @Roles(UserRole.PROGRAM_ADMIN, UserRole.GENERAL_ADMIN)
  async bulkProcessReassignments(
    @Body('operations') operations: Array<{
      reservationId: string;
      reason: string;
      suggestedResourceId?: string;
      priority: 'LOW' | 'MEDIUM' | 'HIGH';
    }>,
    @CurrentUser() user: any
  ): Promise<{
    successful: any[];
    failed: any[];
    summary: any;
  }> {
    return await this.reassignmentService.processBulkReassignment(operations);
  }

  @Get('requests/:id/success-prediction')
  @ApiOperation({
    summary: 'Predict reassignment success',
    description: 'Predicts the success probability of a reassignment request'
  })
  @ApiParam({
    name: 'id',
    description: 'Reassignment request ID',
    type: 'string',
    format: 'uuid'
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Success prediction completed',
    schema: {
      type: 'object',
      properties: {
        successProbability: { type: 'number' },
        confidenceLevel: { type: 'number' },
        keyFactors: { type: 'array', items: { type: 'object' } },
        recommendations: { type: 'array', items: { type: 'string' } }
      }
    }
  })
  @Roles(UserRole.PROGRAM_ADMIN, UserRole.GENERAL_ADMIN)
  async predictReassignmentSuccess(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user: any
  ): Promise<{
    successProbability: number;
    confidenceLevel: number;
    keyFactors: any[];
    recommendations: string[];
  }> {
    return await this.reassignmentService.predictSuccess(id);
  }

  @Get('user/:userId/history')
  @ApiOperation({
    summary: 'Get user reassignment history',
    description: 'Retrieves reassignment history for a specific user (admin only)'
  })
  @ApiParam({
    name: 'userId',
    description: 'User ID',
    type: 'string',
    format: 'uuid'
  })
  @ApiQuery({
    name: 'limit',
    description: 'Number of records to return',
    required: false,
    type: 'number'
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'User reassignment history retrieved successfully',
    type: [ReassignmentRequestResponseDto]
  })
  @Roles(UserRole.PROGRAM_ADMIN, UserRole.GENERAL_ADMIN)
  async getUserReassignmentHistory(
    @Param('userId', ParseUUIDPipe) userId: string,
    @Query('limit') limit: number = 50,
    @CurrentUser() user: any
  ): Promise<ReassignmentRequestResponseDto[]> {
    return await this.reassignmentService.getUserHistory(userId, limit);
  }

  @Post('configuration/optimize')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Optimize reassignment configuration',
    description: 'Optimizes reassignment configuration based on usage patterns (admin only)'
  })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        programId: {
          type: 'string',
          format: 'uuid',
          description: 'Program ID to optimize configuration for'
        }
      },
      required: ['programId']
    }
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Configuration optimization completed',
    schema: {
      type: 'object',
      properties: {
        currentConfig: { type: 'object' },
        recommendedChanges: { type: 'array', items: { type: 'object' } },
        testResults: { type: 'object' }
      }
    }
  })
  @Roles(UserRole.GENERAL_ADMIN)
  async optimizeReassignmentConfiguration(
    @Body('programId') programId: string,
    @CurrentUser() user: any
  ): Promise<{
    currentConfig: any;
    recommendedChanges: any[];
    testResults?: any;
  }> {
    return await this.reassignmentService.optimizeConfiguration(programId);
  }

  // Helper method to determine user priority based on role
  private getUserPriority(role: UserRole): string {
    const priorityMap = {
      [UserRole.GENERAL_ADMIN]: 'ADMIN_GENERAL',
      [UserRole.PROGRAM_ADMIN]: 'PROGRAM_DIRECTOR',
      [UserRole.TEACHER]: 'TEACHER',
      [UserRole.STUDENT]: 'STUDENT',
      [UserRole.SECURITY]: 'EXTERNAL',
      [UserRole.GENERAL_STAFF]: 'EXTERNAL'
    };
    return priorityMap[role] || 'EXTERNAL';
  }
}
