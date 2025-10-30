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
  ParseUUIDPipe,
} from "@nestjs/common";
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiQuery,
  ApiBearerAuth,
  ApiBody,
} from "@nestjs/swagger";
import { JwtAuthGuard } from "@apps/auth-service/infrastructure/guards/jwt-auth.guard";
import { RolesGuard } from "@libs/common/guards/roles.guard";
import { Roles } from "@apps/auth-service/infrastructure/decorators/roles.decorator";
import { UserRole, CurrentUser } from "@libs/common";

// DTOs
import { JoinWaitingListDto } from "@/apps/availability-service/infrastructure/dtos/join-waiting-list.dto";
import { WaitingListEntryResponseDto } from "@/apps/availability-service/infrastructure/dtos/waiting-list-entry-response.dto";
import { WaitingListQueryDto } from "@/apps/availability-service/infrastructure/dtos/waiting-list-query.dto";
import { WaitingListStatsDto } from "@/apps/availability-service/infrastructure/dtos/waiting-list-stats.dto";
import { EscalatePriorityDto } from "@/apps/availability-service/infrastructure/dtos/escalate-priority.dto";

// Services
import { WaitingListService } from "@/apps/availability-service/application/services/waiting-list.service";
// URL Map
import { AVAILABILITY_URLS } from "../../utils/maps/urls.map";
import { ResponseUtil } from "@/libs/common/utils/response.util";
import { UserEntity } from "@/apps/auth-service/domain/entities/user.entity";
import { ApiResponseBookly } from "@/libs/dto";

@ApiTags(AVAILABILITY_URLS.WAITING_LIST_TAG)
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller(AVAILABILITY_URLS.WAITING_LIST)
export class WaitingListController {
  constructor(private readonly waitingListService: WaitingListService) {}

  @Post(AVAILABILITY_URLS.WAITING_LIST_JOIN)
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: "Join a waiting list",
    description:
      "Adds the current user to a waiting list with automatic priority assignment",
  })
  @ApiBody({ type: JoinWaitingListDto })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: "Successfully joined waiting list",
    type: WaitingListEntryResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: "Invalid request or user already in waiting list",
  })
  @ApiResponse({
    status: HttpStatus.CONFLICT,
    description: "User has reached maximum waiting list entries",
  })
  @Roles(
    UserRole.STUDENT,
    UserRole.TEACHER,
    UserRole.PROGRAM_ADMIN,
    UserRole.GENERAL_ADMIN
  )
  async joinWaitingList(
    @Body(ValidationPipe) joinDto: JoinWaitingListDto,
    @CurrentUser() user: UserEntity
  ): Promise<ApiResponseBookly<WaitingListEntryResponseDto>> {
    for (const role of [
      UserRole.TEACHER,
      UserRole.PROGRAM_ADMIN,
      UserRole.GENERAL_ADMIN,
    ]) {
      if (user.hasRole(role)) {
        return ResponseUtil.success(
          this.mapToResponseDto(
            (
              await this.waitingListService.joinWaitingList({
                userId: user.id,
                resourceId: joinDto.resourceId,
                programId: joinDto.programId,
                desiredStartTime: new Date(joinDto.desiredStartTime),
                desiredEndTime: new Date(joinDto.desiredEndTime),
                priority: this.getUserPriority(role),
                confirmationTimeLimit: joinDto.confirmationTimeLimit,
                requestedBy: user.id,
              })
            ).entry
          ),
          "Successfully joined waiting list"
        );
      }
    }
    const result = await this.waitingListService.joinWaitingList({
      userId: user.id,
      resourceId: joinDto.resourceId,
      programId: joinDto.programId,
      desiredStartTime: new Date(joinDto.desiredStartTime),
      desiredEndTime: new Date(joinDto.desiredEndTime),
      priority: this.getUserPriority(UserRole.STUDENT),
      confirmationTimeLimit: joinDto.confirmationTimeLimit,
      requestedBy: user.id,
    });

    return ResponseUtil.success(
      this.mapToResponseDto(result.entry),
      "Successfully joined waiting list"
    );
  }

  @Get(AVAILABILITY_URLS.MY_WAITING_LIST)
  @ApiOperation({
    summary: "Get current user waiting list entries",
    description: "Retrieves all waiting list entries for the current user",
  })
  @ApiQuery({
    name: "status",
    description: "Filter by entry status",
    required: false,
    enum: ["WAITING", "NOTIFIED", "CONFIRMED", "EXPIRED", "CANCELLED"],
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: "User waiting list entries retrieved successfully",
    type: [WaitingListEntryResponseDto],
  })
  @Roles(
    UserRole.STUDENT,
    UserRole.TEACHER,
    UserRole.PROGRAM_ADMIN,
    UserRole.GENERAL_ADMIN
  )
  async getMyWaitingListEntries(
    @CurrentUser() user: UserEntity,
    @Query("status") status?: string
  ): Promise<ApiResponseBookly<WaitingListEntryResponseDto[]>> {
    const entries = await this.waitingListService.getUserEntries(
      user.id,
      status
    );
    return ResponseUtil.success(
      entries.map((entry) => this.mapToResponseDto(entry)),
      "User waiting list entries retrieved successfully"
    );
  }

  @Get(AVAILABILITY_URLS.WAITING_LIST_ENTRY_BY_ID)
  @ApiOperation({
    summary: "Get waiting list entry by ID",
    description: "Retrieves a specific waiting list entry",
  })
  @ApiParam({
    name: "id",
    description: "Waiting list entry ID",
    type: "string",
    format: "uuid",
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: "Waiting list entry found",
    type: WaitingListEntryResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: "Waiting list entry not found",
  })
  @Roles(
    UserRole.STUDENT,
    UserRole.TEACHER,
    UserRole.PROGRAM_ADMIN,
    UserRole.GENERAL_ADMIN
  )
  async getWaitingListEntry(
    @Param("id", ParseUUIDPipe) id: string,
    @CurrentUser() user: UserEntity
  ): Promise<ApiResponseBookly<WaitingListEntryResponseDto>> {
    const entry = await this.waitingListService.getEntry(id, user.id);
    return ResponseUtil.success(
      this.mapToResponseDto(entry),
      "Waiting list entry found"
    );
  }

  @Post(AVAILABILITY_URLS.WAITING_LIST_ENTRY_CONFIRM)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: "Confirm waiting list notification",
    description:
      "Confirms that the user accepts the available slot from waiting list notification",
  })
  @ApiParam({
    name: "id",
    description: "Waiting list entry ID",
    type: "string",
    format: "uuid",
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: "Waiting list entry confirmed successfully",
    type: WaitingListEntryResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: "Entry is not in notified status or has expired",
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: "Waiting list entry not found",
  })
  @Roles(
    UserRole.STUDENT,
    UserRole.TEACHER,
    UserRole.PROGRAM_ADMIN,
    UserRole.GENERAL_ADMIN
  )
  async confirmWaitingListEntry(
    @Param("id", ParseUUIDPipe) id: string,
    @CurrentUser() user: UserEntity
  ): Promise<ApiResponseBookly<WaitingListEntryResponseDto>> {
    return ResponseUtil.success(
      await this.waitingListService.confirmEntry(id, user.id),
      "Waiting list entry confirmed successfully"
    );
  }

  @Delete(AVAILABILITY_URLS.WAITING_LIST_LEAVE_ENTRY)
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({
    summary: "Leave waiting list",
    description: "Removes the user from a waiting list",
  })
  @ApiParam({
    name: "id",
    description: "Waiting list entry ID",
    type: "string",
    format: "uuid",
  })
  @ApiResponse({
    status: HttpStatus.NO_CONTENT,
    description: "Successfully left waiting list",
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: "Waiting list entry not found",
  })
  @ApiResponse({
    status: HttpStatus.FORBIDDEN,
    description: "User not authorized to remove this entry",
  })
  @Roles(
    UserRole.STUDENT,
    UserRole.TEACHER,
    UserRole.PROGRAM_ADMIN,
    UserRole.GENERAL_ADMIN
  )
  async leaveWaitingList(
    @Param("id", ParseUUIDPipe) id: string,
    @CurrentUser() user: UserEntity
  ): Promise<ApiResponseBookly<boolean>> {
    await this.waitingListService.leaveWaitingList(id, user.id);
    return ResponseUtil.success(true, "Successfully left waiting list");
  }

  @Get(AVAILABILITY_URLS.WAITING_LIST_FOR_RESOURCE)
  @ApiOperation({
    summary: "Get waiting list for resource",
    description: "Retrieves the waiting list entries for a specific resource",
  })
  @ApiParam({
    name: "resourceId",
    description: "Resource ID",
    type: "string",
    format: "uuid",
  })
  @ApiQuery({ type: WaitingListQueryDto })
  @ApiResponse({
    status: HttpStatus.OK,
    description: "Resource waiting list retrieved successfully",
    schema: {
      type: "object",
      properties: {
        entries: {
          type: "array",
          items: { $ref: "#/components/schemas/WaitingListEntryResponseDto" },
        },
        total: { type: "number" },
        queueDepth: { type: "number" },
        averageWaitTime: { type: "number" },
      },
    },
  })
  @Roles(UserRole.TEACHER, UserRole.PROGRAM_ADMIN, UserRole.GENERAL_ADMIN)
  async getResourceWaitingList(
    @Param("resourceId", ParseUUIDPipe) resourceId: string,
    @Query(ValidationPipe) queryDto: WaitingListQueryDto,
    @CurrentUser() user: UserEntity
  ): Promise<ApiResponseBookly<WaitingListEntryResponseDto[]>> {
    return ResponseUtil.success(
      await this.waitingListService.getResourceWaitingList(
        resourceId,
        queryDto
      ),
      "Resource waiting list retrieved successfully"
    );
  }

  @Post(AVAILABILITY_URLS.WAITING_LIST_ENTRY_ESCALATE)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: "Escalate user priority",
    description: "Escalates a user's priority in the waiting list (admin only)",
  })
  @ApiParam({
    name: "id",
    description: "Waiting list entry ID",
    type: "string",
    format: "uuid",
  })
  @ApiBody({ type: EscalatePriorityDto })
  @ApiResponse({
    status: HttpStatus.OK,
    description: "Priority escalated successfully",
    type: WaitingListEntryResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: "Waiting list entry not found",
  })
  @Roles(UserRole.PROGRAM_ADMIN, UserRole.GENERAL_ADMIN)
  async escalatePriority(
    @Param("id", ParseUUIDPipe) id: string,
    @Body(ValidationPipe) escalateDto: EscalatePriorityDto,
    @CurrentUser() user: UserEntity
  ): Promise<ApiResponseBookly<WaitingListEntryResponseDto>> {
    // Get the entry first to find waitingListId
    const entry = await this.waitingListService.getEntry(id, user.id);

    await this.waitingListService.escalatePriority(
      entry.waitingListId,
      id,
      escalateDto.newPriority
    );

    const updatedEntry = await this.waitingListService.getEntry(id, user.id);
    return ResponseUtil.success(
      this.mapToResponseDto(updatedEntry),
      "Priority escalated successfully"
    );
  }

  @Post(AVAILABILITY_URLS.WAITING_LIST_PROCESS_AVAILABLE_SLOTS)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: "Process available slots",
    description:
      "Processes available slots and notifies next users in waiting lists (system/admin only)",
  })
  @ApiBody({
    schema: {
      type: "object",
      properties: {
        resourceId: { type: "string", format: "uuid" },
        availableSlots: { type: "number", minimum: 1 },
        timeSlot: {
          type: "object",
          properties: {
            date: { type: "string", format: "date" },
            startTime: { type: "string" },
            endTime: { type: "string" },
          },
        },
      },
      required: ["resourceId", "availableSlots"],
    },
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: "Available slots processed successfully",
    schema: {
      type: "object",
      properties: {
        notifiedUsers: { type: "array", items: { type: "string" } },
        remainingInQueue: { type: "number" },
        skippedUsers: { type: "array", items: { type: "object" } },
      },
    },
  })
  @Roles(UserRole.PROGRAM_ADMIN, UserRole.GENERAL_ADMIN)
  async processAvailableSlots(
    @Body("resourceId") resourceId: string,
    @Body("availableSlots") availableSlots: number,
    @CurrentUser() user: UserEntity,
    @Body("timeSlot") timeSlot?: any
  ): Promise<
    ApiResponseBookly<{
      remaining: number;
      skipped: number;
      notified: number;
      notifiedUsers: string[];
      remainingInQueue: number;
      skippedUsers: { userId: string; reason: string }[];
    }>
  > {
    return ResponseUtil.success(
      await this.waitingListService.processAvailableSlots(
        resourceId,
        availableSlots,
        timeSlot
      ),
      "Available slots processed successfully"
    );
  }

  @Get(AVAILABILITY_URLS.WAITING_LIST_STATS_RESOURCE)
  @ApiOperation({
    summary: "Get waiting list statistics",
    description:
      "Retrieves comprehensive statistics for a resource waiting list",
  })
  @ApiParam({
    name: "resourceId",
    description: "Resource ID",
    type: "string",
    format: "uuid",
  })
  @ApiQuery({
    name: "timeRange",
    description: "Time range for statistics (7d, 30d, 90d)",
    required: false,
    enum: ["7d", "30d", "90d"],
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: "Statistics retrieved successfully",
    type: WaitingListStatsDto,
  })
  @Roles(UserRole.TEACHER, UserRole.PROGRAM_ADMIN, UserRole.GENERAL_ADMIN)
  async getWaitingListStats(
    @Param("resourceId", ParseUUIDPipe) resourceId: string,
    @Query("timeRange") timeRange: string = "30d",
    @CurrentUser() user: UserEntity
  ): Promise<ApiResponseBookly<WaitingListStatsDto>> {
    return ResponseUtil.success(
      await this.waitingListService.getStatistics(resourceId, timeRange),
      "Statistics retrieved successfully"
    );
  }

  @Post(AVAILABILITY_URLS.WAITING_LIST_VALIDATE_JOIN)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: "Validate joining waiting list",
    description:
      "Validates if a user can join a waiting list without actually joining",
  })
  @ApiBody({ type: JoinWaitingListDto })
  @ApiResponse({
    status: HttpStatus.OK,
    description: "Validation completed",
    schema: {
      type: "object",
      properties: {
        canJoin: { type: "boolean" },
        violations: { type: "array", items: { type: "string" } },
        warnings: { type: "array", items: { type: "string" } },
        estimatedPosition: { type: "number" },
        estimatedWaitTime: { type: "number" },
      },
    },
  })
  @Roles(
    UserRole.STUDENT,
    UserRole.TEACHER,
    UserRole.PROGRAM_ADMIN,
    UserRole.GENERAL_ADMIN
  )
  async validateJoinWaitingList(
    @Body(ValidationPipe) joinDto: JoinWaitingListDto,
    @CurrentUser() user: UserEntity
  ): Promise<
    ApiResponseBookly<{
      canJoin: boolean;
      violations: string[];
      warnings: string[];
      estimatedPosition: number;
      estimatedWaitTime: number;
    }>
  > {
    for (const role of [
      UserRole.TEACHER,
      UserRole.PROGRAM_ADMIN,
      UserRole.GENERAL_ADMIN,
    ]) {
      if (user.hasRole(role)) {
        return ResponseUtil.success(
          await this.waitingListService.validateJoin({
            resourceId: joinDto.resourceId,
            userId: user.id,
            desiredStartTime: new Date(joinDto.desiredStartTime),
            desiredEndTime: new Date(joinDto.desiredEndTime),
            priority: this.getUserPriority(role),
          }),
          "Validation completed"
        );
      }
    }
    return ResponseUtil.success(
      await this.waitingListService.validateJoin({
        resourceId: joinDto.resourceId,
        userId: user.id,
        desiredStartTime: new Date(joinDto.desiredStartTime),
        desiredEndTime: new Date(joinDto.desiredEndTime),
        priority: this.getUserPriority(UserRole.STUDENT),
      }),
      "Validation completed"
    );
  }

  @Get(AVAILABILITY_URLS.WAITING_LIST_ENTRY_POSITION)
  @ApiOperation({
    summary: "Get current position in waiting list",
    description:
      "Gets the current position and estimated wait time for a waiting list entry",
  })
  @ApiParam({
    name: "id",
    description: "Waiting list entry ID",
    type: "string",
    format: "uuid",
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: "Position information retrieved successfully",
    schema: {
      type: "object",
      properties: {
        currentPosition: { type: "number" },
        totalInQueue: { type: "number" },
        estimatedWaitTime: { type: "number" },
        lastUpdated: { type: "string", format: "date-time" },
      },
    },
  })
  @Roles(
    UserRole.STUDENT,
    UserRole.TEACHER,
    UserRole.PROGRAM_ADMIN,
    UserRole.GENERAL_ADMIN
  )
  async getWaitingListPosition(
    @Param("id", ParseUUIDPipe) id: string,
    @CurrentUser() user: UserEntity
  ): Promise<
    ApiResponseBookly<{
      currentPosition: number;
      totalInQueue: number;
      estimatedWaitTime: number;
      lastUpdated: Date;
    }>
  > {
    return ResponseUtil.success(
      await this.waitingListService.getPosition(id, user.id),
      "Position information retrieved successfully"
    );
  }

  @Post(AVAILABILITY_URLS.WAITING_LIST_BULK_NOTIFY)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: "Bulk notify waiting list users",
    description:
      "Sends notifications to multiple users in waiting lists (admin only)",
  })
  @ApiBody({
    schema: {
      type: "object",
      properties: {
        entryIds: {
          type: "array",
          items: { type: "string", format: "uuid" },
          description: "Array of waiting list entry IDs to notify",
        },
        message: {
          type: "string",
          description: "Custom notification message",
        },
      },
      required: ["entryIds"],
    },
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: "Bulk notification completed",
    schema: {
      type: "object",
      properties: {
        successful: { type: "array", items: { type: "string" } },
        failed: { type: "array", items: { type: "object" } },
        totalProcessed: { type: "number" },
      },
    },
  })
  @Roles(UserRole.PROGRAM_ADMIN, UserRole.GENERAL_ADMIN)
  async bulkNotifyUsers(
    @Body("entryIds") entryIds: string[],
    @CurrentUser() user: UserEntity,
    @Body("message") message?: string
  ): Promise<
    ApiResponseBookly<{
      notifiedCount: number;
      successful: string[];
      failed: { id: string; error: string }[];
      totalProcessed: number;
    }>
  > {
    return ResponseUtil.success(
      await this.waitingListService.bulkNotify(entryIds, message),
      "Bulk notification completed"
    );
  }

  @Post(AVAILABILITY_URLS.WAITING_LIST_PROCESS_EXPIRED)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: "Process expired notifications",
    description:
      "Processes expired waiting list notifications and moves to next in line (system/admin only)",
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: "Expired notifications processed successfully",
    schema: {
      type: "object",
      properties: {
        expiredCount: { type: "number" },
        newlyNotified: { type: "number" },
        totalProcessed: { type: "number" },
      },
    },
  })
  @Roles(UserRole.PROGRAM_ADMIN, UserRole.GENERAL_ADMIN)
  async processExpiredNotifications(
    @CurrentUser() user: UserEntity
  ): Promise<
    ApiResponseBookly<{
      expiredCount: number;
      newlyNotified: number;
      totalProcessed: number;
    }>
  > {
    return ResponseUtil.success(
      await this.waitingListService.processExpiredNotifications(),
      "Expired notifications processed successfully"
    );
  }

  @Get(AVAILABILITY_URLS.WAITING_LIST_ANALYTICS_PERFORMANCE)
  @ApiOperation({
    summary: "Get waiting list performance analytics",
    description:
      "Retrieves performance analytics across all waiting lists (admin only)",
  })
  @ApiQuery({
    name: "programId",
    description: "Filter by program ID",
    required: false,
    type: "string",
  })
  @ApiQuery({
    name: "timeRange",
    description: "Time range for analytics (7d, 30d, 90d)",
    required: false,
    enum: ["7d", "30d", "90d"],
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: "Performance analytics retrieved successfully",
  })
  @Roles(UserRole.PROGRAM_ADMIN, UserRole.GENERAL_ADMIN)
  async getPerformanceAnalytics(
    @CurrentUser() user: UserEntity,
    @Query("programId") programId?: string,
    @Query("timeRange") timeRange: string = "30d"
  ): Promise<ApiResponseBookly<void>> {
    return ResponseUtil.success(
      await this.waitingListService.getPerformanceAnalytics(
        programId,
        timeRange
      ),
      "Performance analytics retrieved successfully"
    );
  }

  // Helper method to determine user priority based on role
  private getUserPriority(role: string): string {
    const priorityMap = {
      [UserRole.GENERAL_ADMIN]: "HIGH",
      [UserRole.PROGRAM_ADMIN]: "HIGH",
      [UserRole.TEACHER]: "MEDIUM",
      [UserRole.STUDENT]: "LOW",
    };
    return priorityMap[role] || "LOW";
  }

  private mapToResponseDto(entry: any): WaitingListEntryResponseDto {
    return {
      id: entry.id,
      userId: entry.userId,
      resourceId: entry.resourceId,
      requestedStartTime:
        entry.requestedAt?.toISOString() || new Date().toISOString(),
      requestedEndTime:
        entry.requestedAt?.toISOString() || new Date().toISOString(),
      priority: entry.priority || "LOW",
      status: entry.status || "WAITING",
      position: entry.position || 0,
      estimatedWaitTime: 0,
      createdAt: entry.requestedAt?.toISOString() || new Date().toISOString(),
      updatedAt: entry.requestedAt?.toISOString() || new Date().toISOString(),
    };
  }
}
