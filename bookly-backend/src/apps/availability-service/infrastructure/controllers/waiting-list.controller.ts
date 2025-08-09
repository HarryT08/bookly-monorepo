/**
 * RF-14: Waiting List REST Controller
 * Handles HTTP requests for waiting list management
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
import { RolesGuard } from '@apps/auth-service/infrastructure/guards/roles.guard';
import { Roles } from '@apps/auth-service/infrastructure/decorators/roles.decorator';
import { UserRole, CurrentUser } from '@libs/common';

// DTOs
import { JoinWaitingListDto } from '@/apps/availability-service/infrastructure/dtos/join-waiting-list.dto';
import { WaitingListEntryResponseDto } from '@/apps/availability-service/infrastructure/dtos/waiting-list-entry-response.dto';
import { WaitingListQueryDto } from '@/apps/availability-service/infrastructure/dtos/waiting-list-query.dto';
import { WaitingListStatsDto } from '@/apps/availability-service/infrastructure/dtos/waiting-list-stats.dto';
import { EscalatePriorityDto } from '@/apps/availability-service/infrastructure/dtos/escalate-priority.dto';

// Services
import { WaitingListService } from '@/apps/availability-service/application/services/waiting-list.service';

@ApiTags('Waiting List')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('waiting-list')
export class WaitingListController {
  constructor(
    private readonly waitingListService: WaitingListService
  ) {}

  @Post('join')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Join a waiting list',
    description: 'Adds the current user to a waiting list with automatic priority assignment'
  })
  @ApiBody({ type: JoinWaitingListDto })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'Successfully joined waiting list',
    type: WaitingListEntryResponseDto
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Invalid request or user already in waiting list'
  })
  @ApiResponse({
    status: HttpStatus.CONFLICT,
    description: 'User has reached maximum waiting list entries'
  })
  @Roles(UserRole.STUDENT, UserRole.TEACHER, UserRole.PROGRAM_ADMIN, UserRole.GENERAL_ADMIN)
  async joinWaitingList(
    @Body(ValidationPipe) joinDto: JoinWaitingListDto,
    @CurrentUser() user: any
  ): Promise<WaitingListEntryResponseDto> {
    return await this.waitingListService.joinWaitingList({
      ...joinDto,
      userId: user.id,
      userPriority: this.getUserPriority(user.role)
    });
  }

  @Get('my-entries')
  @ApiOperation({
    summary: 'Get current user waiting list entries',
    description: 'Retrieves all waiting list entries for the current user'
  })
  @ApiQuery({
    name: 'status',
    description: 'Filter by entry status',
    required: false,
    enum: ['WAITING', 'NOTIFIED', 'CONFIRMED', 'EXPIRED', 'CANCELLED']
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'User waiting list entries retrieved successfully',
    type: [WaitingListEntryResponseDto]
  })
  @Roles(UserRole.STUDENT, UserRole.TEACHER, UserRole.PROGRAM_ADMIN, UserRole.GENERAL_ADMIN)
  async getMyWaitingListEntries(
    @CurrentUser() user: any,
    @Query('status') status?: string,
  ): Promise<WaitingListEntryResponseDto[]> {
    return await this.waitingListService.getUserEntries(user.id, status);
  }

  @Get('entries/:id')
  @ApiOperation({
    summary: 'Get waiting list entry by ID',
    description: 'Retrieves a specific waiting list entry'
  })
  @ApiParam({
    name: 'id',
    description: 'Waiting list entry ID',
    type: 'string',
    format: 'uuid'
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Waiting list entry found',
    type: WaitingListEntryResponseDto
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Waiting list entry not found'
  })
  @Roles(UserRole.STUDENT, UserRole.TEACHER, UserRole.PROGRAM_ADMIN, UserRole.GENERAL_ADMIN)
  async getWaitingListEntry(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user: any
  ): Promise<WaitingListEntryResponseDto> {
    return await this.waitingListService.getEntry(id, user.id);
  }

  @Post('entries/:id/confirm')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Confirm waiting list notification',
    description: 'Confirms that the user accepts the available slot from waiting list notification'
  })
  @ApiParam({
    name: 'id',
    description: 'Waiting list entry ID',
    type: 'string',
    format: 'uuid'
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Waiting list entry confirmed successfully',
    type: WaitingListEntryResponseDto
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Entry is not in notified status or has expired'
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Waiting list entry not found'
  })
  @Roles(UserRole.STUDENT, UserRole.TEACHER, UserRole.PROGRAM_ADMIN, UserRole.GENERAL_ADMIN)
  async confirmWaitingListEntry(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user: any
  ): Promise<WaitingListEntryResponseDto> {
    return await this.waitingListService.confirmEntry(id, user.id);
  }

  @Delete('entries/:id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({
    summary: 'Leave waiting list',
    description: 'Removes the user from a waiting list'
  })
  @ApiParam({
    name: 'id',
    description: 'Waiting list entry ID',
    type: 'string',
    format: 'uuid'
  })
  @ApiResponse({
    status: HttpStatus.NO_CONTENT,
    description: 'Successfully left waiting list'
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Waiting list entry not found'
  })
  @ApiResponse({
    status: HttpStatus.FORBIDDEN,
    description: 'User not authorized to remove this entry'
  })
  @Roles(UserRole.STUDENT, UserRole.TEACHER, UserRole.PROGRAM_ADMIN, UserRole.GENERAL_ADMIN)
  async leaveWaitingList(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user: any
  ): Promise<void> {
    await this.waitingListService.leaveWaitingList(id, user.id);
  }

  @Get('resource/:resourceId')
  @ApiOperation({
    summary: 'Get waiting list for resource',
    description: 'Retrieves the waiting list entries for a specific resource'
  })
  @ApiParam({
    name: 'resourceId',
    description: 'Resource ID',
    type: 'string',
    format: 'uuid'
  })
  @ApiQuery({ type: WaitingListQueryDto })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Resource waiting list retrieved successfully',
    schema: {
      type: 'object',
      properties: {
        entries: { type: 'array', items: { $ref: '#/components/schemas/WaitingListEntryResponseDto' } },
        total: { type: 'number' },
        queueDepth: { type: 'number' },
        averageWaitTime: { type: 'number' }
      }
    }
  })
  @Roles(UserRole.TEACHER, UserRole.PROGRAM_ADMIN, UserRole.GENERAL_ADMIN)
  async getResourceWaitingList(
    @Param('resourceId', ParseUUIDPipe) resourceId: string,
    @Query(ValidationPipe) queryDto: WaitingListQueryDto,
    @CurrentUser() user: any
  ): Promise<{
    entries: WaitingListEntryResponseDto[];
    total: number;
    queueDepth: number;
    averageWaitTime: number;
  }> {
    return await this.waitingListService.getResourceWaitingList(resourceId, queryDto);
  }

  @Post('entries/:id/escalate')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Escalate user priority',
    description: 'Escalates a user\'s priority in the waiting list (admin only)'
  })
  @ApiParam({
    name: 'id',
    description: 'Waiting list entry ID',
    type: 'string',
    format: 'uuid'
  })
  @ApiBody({ type: EscalatePriorityDto })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Priority escalated successfully',
    type: WaitingListEntryResponseDto
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Waiting list entry not found'
  })
  @Roles(UserRole.PROGRAM_ADMIN, UserRole.GENERAL_ADMIN)
  async escalatePriority(
    @Param('id', ParseUUIDPipe) id: string,
    @Body(ValidationPipe) escalateDto: EscalatePriorityDto,
    @CurrentUser() user: any
  ): Promise<WaitingListEntryResponseDto> {
    return await this.waitingListService.escalatePriority(
      id,
      escalateDto.newPriority,
      user.id,
      escalateDto.escalationReason
    );
  }

  @Post('process-available-slots')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Process available slots',
    description: 'Processes available slots and notifies next users in waiting lists (system/admin only)'
  })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        resourceId: { type: 'string', format: 'uuid' },
        availableSlots: { type: 'number', minimum: 1 },
        timeSlot: {
          type: 'object',
          properties: {
            date: { type: 'string', format: 'date' },
            startTime: { type: 'string' },
            endTime: { type: 'string' }
          }
        }
      },
      required: ['resourceId', 'availableSlots']
    }
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Available slots processed successfully',
    schema: {
      type: 'object',
      properties: {
        notifiedUsers: { type: 'array', items: { type: 'string' } },
        remainingInQueue: { type: 'number' },
        skippedUsers: { type: 'array', items: { type: 'object' } }
      }
    }
  })
  @Roles(UserRole.PROGRAM_ADMIN, UserRole.GENERAL_ADMIN)
  async processAvailableSlots(
    @Body('resourceId') resourceId: string,
    @Body('availableSlots') availableSlots: number,
    @CurrentUser() user: any,
    @Body('timeSlot') timeSlot?: any,
  ): Promise<{
    notifiedUsers: string[];
    remainingInQueue: number;
    skippedUsers: Array<{ userId: string; reason: string }>;
  }> {
    return await this.waitingListService.processAvailableSlots(
      resourceId,
      availableSlots,
      timeSlot
    );
  }

  @Get('stats/resource/:resourceId')
  @ApiOperation({
    summary: 'Get waiting list statistics',
    description: 'Retrieves comprehensive statistics for a resource waiting list'
  })
  @ApiParam({
    name: 'resourceId',
    description: 'Resource ID',
    type: 'string',
    format: 'uuid'
  })
  @ApiQuery({
    name: 'timeRange',
    description: 'Time range for statistics (7d, 30d, 90d)',
    required: false,
    enum: ['7d', '30d', '90d']
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Statistics retrieved successfully',
    type: WaitingListStatsDto
  })
  @Roles(UserRole.TEACHER, UserRole.PROGRAM_ADMIN, UserRole.GENERAL_ADMIN)
  async getWaitingListStats(
    @Param('resourceId', ParseUUIDPipe) resourceId: string,
    @Query('timeRange') timeRange: string = '30d',
    @CurrentUser() user: any
  ): Promise<WaitingListStatsDto> {
    return await this.waitingListService.getStatistics(resourceId, timeRange);
  }

  @Post('validate-join')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Validate joining waiting list',
    description: 'Validates if a user can join a waiting list without actually joining'
  })
  @ApiBody({ type: JoinWaitingListDto })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Validation completed',
    schema: {
      type: 'object',
      properties: {
        canJoin: { type: 'boolean' },
        violations: { type: 'array', items: { type: 'string' } },
        warnings: { type: 'array', items: { type: 'string' } },
        estimatedPosition: { type: 'number' },
        estimatedWaitTime: { type: 'number' }
      }
    }
  })
  @Roles(UserRole.STUDENT, UserRole.TEACHER, UserRole.PROGRAM_ADMIN, UserRole.GENERAL_ADMIN)
  async validateJoinWaitingList(
    @Body(ValidationPipe) joinDto: JoinWaitingListDto,
    @CurrentUser() user: any
  ): Promise<{
    canJoin: boolean;
    violations: string[];
    warnings: string[];
    estimatedPosition: number;
    estimatedWaitTime: number | null;
  }> {
    return await this.waitingListService.validateJoin({
      ...joinDto,
      userId: user.id,
      userPriority: this.getUserPriority(user.role)
    });
  }

  @Get('entries/:id/position')
  @ApiOperation({
    summary: 'Get current position in waiting list',
    description: 'Gets the current position and estimated wait time for a waiting list entry'
  })
  @ApiParam({
    name: 'id',
    description: 'Waiting list entry ID',
    type: 'string',
    format: 'uuid'
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Position information retrieved successfully',
    schema: {
      type: 'object',
      properties: {
        currentPosition: { type: 'number' },
        totalInQueue: { type: 'number' },
        estimatedWaitTime: { type: 'number' },
        lastUpdated: { type: 'string', format: 'date-time' }
      }
    }
  })
  @Roles(UserRole.STUDENT, UserRole.TEACHER, UserRole.PROGRAM_ADMIN, UserRole.GENERAL_ADMIN)
  async getWaitingListPosition(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user: any
  ): Promise<{
    currentPosition: number;
    totalInQueue: number;
    estimatedWaitTime: number | null;
    lastUpdated: Date;
  }> {
    return await this.waitingListService.getPosition(id, user.id);
  }

  @Post('bulk-notify')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Bulk notify waiting list users',
    description: 'Sends notifications to multiple users in waiting lists (admin only)'
  })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        entryIds: {
          type: 'array',
          items: { type: 'string', format: 'uuid' },
          description: 'Array of waiting list entry IDs to notify'
        },
        message: {
          type: 'string',
          description: 'Custom notification message'
        }
      },
      required: ['entryIds']
    }
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Bulk notification completed',
    schema: {
      type: 'object',
      properties: {
        successful: { type: 'array', items: { type: 'string' } },
        failed: { type: 'array', items: { type: 'object' } },
        totalProcessed: { type: 'number' }
      }
    }
  })
  @Roles(UserRole.PROGRAM_ADMIN, UserRole.GENERAL_ADMIN)
  async bulkNotifyUsers(
    @Body('entryIds') entryIds: string[],
    @CurrentUser() user: any,
    @Body('message') message?: string,
  ): Promise<{
    successful: string[];
    failed: Array<{ id: string; error: string }>;
    totalProcessed: number;
  }> {
    return await this.waitingListService.bulkNotify(entryIds, message, user.id);
  }

  @Post('process-expired')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Process expired notifications',
    description: 'Processes expired waiting list notifications and moves to next in line (system/admin only)'
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Expired notifications processed successfully',
    schema: {
      type: 'object',
      properties: {
        expiredCount: { type: 'number' },
        newlyNotified: { type: 'number' },
        totalProcessed: { type: 'number' }
      }
    }
  })
  @Roles(UserRole.PROGRAM_ADMIN, UserRole.GENERAL_ADMIN)
  async processExpiredNotifications(
    @CurrentUser() user: any
  ): Promise<{
    expiredCount: number;
    newlyNotified: number;
    totalProcessed: number;
  }> {
    return await this.waitingListService.processExpiredNotifications();
  }

  @Get('analytics/performance')
  @ApiOperation({
    summary: 'Get waiting list performance analytics',
    description: 'Retrieves performance analytics across all waiting lists (admin only)'
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
    description: 'Performance analytics retrieved successfully'
  })
  @Roles(UserRole.PROGRAM_ADMIN, UserRole.GENERAL_ADMIN)
  async getPerformanceAnalytics(
    @CurrentUser() user: any,
    @Query('programId') programId?: string,
    @Query('timeRange') timeRange: string = '30d',
  ): Promise<any> {
    return await this.waitingListService.getPerformanceAnalytics(programId, timeRange);
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
