/**
 * Penalties REST Controller
 * Handles HTTP requests for penalty and sanction management
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
import { CurrentUser } from "@libs/common";
import { UserRole } from "@libs/common";
import { AVAILABILITY_URLS } from "../../utils/maps/urls.map";

// DTOs (to be created)
import { CreatePenaltyEventDto } from "../dtos/create-penalty-event.dto";
import { CreatePenaltyDto } from "../dtos/create-penalty.dto";
import { ApplyPenaltyDto } from "../dtos/apply-penalty.dto";
import { PenaltyEventResponseDto } from "../dtos/penalty-event-response.dto";
import { PenaltyResponseDto } from "../dtos/penalty-response.dto";
import {
  UserPenaltyResponseDto,
  UserPenaltyStatus,
} from "../dtos/user-penalty-response.dto";
import { PenaltyAnalyticsDto } from "../dtos/penalty-analytics.dto";
import { PenaltyQueryDto } from "../dtos/penalty-query.dto";

// Services (to be created in application layer)
import { PenaltyService } from "../../application/services/penalty.service";
import { ResponseUtil } from "@/libs/common/utils/response.util";
import { ApiResponseBookly } from "@/libs/dto";
import { UserEntity } from "@/apps/auth-service/domain/entities/user.entity";

@ApiTags(AVAILABILITY_URLS.PENALTIES_TAG)
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller(AVAILABILITY_URLS.PENALTIES)
export class PenaltiesController {
  constructor(private readonly penaltyService: PenaltyService) {}

  // Penalty Events Management
  @Post(AVAILABILITY_URLS.PENALTY_EVENTS)
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: "Create penalty event",
    description: "Creates a new penalty event configuration for a program",
  })
  @ApiBody({ type: CreatePenaltyEventDto })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: "Penalty event created successfully",
    type: PenaltyEventResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: "Invalid penalty event configuration",
  })
  @Roles(UserRole.PROGRAM_ADMIN, UserRole.GENERAL_ADMIN)
  async createPenaltyEvent(
    @Body(ValidationPipe) createDto: CreatePenaltyEventDto,
    @CurrentUser() user: UserEntity
  ): Promise<ApiResponseBookly<PenaltyEventResponseDto>> {
    const result = await this.penaltyService.createPenaltyEvent({
      ...createDto,
      createdBy: user.id,
    });
    return ResponseUtil.success(result, "Penalty event created successfully");
  }

  @Get(AVAILABILITY_URLS.PENALTY_EVENTS)
  @ApiOperation({
    summary: "Get penalty events",
    description: "Retrieves penalty events with optional filtering",
  })
  @ApiQuery({
    name: "programId",
    description: "Filter by program ID",
    required: false,
    type: "string",
  })
  @ApiQuery({
    name: "isActive",
    description: "Filter by active status",
    required: false,
    type: "boolean",
  })
  @ApiQuery({
    name: "eventType",
    description: "Filter by event type",
    required: false,
    enum: [
      "NO_SHOW",
      "LATE_CANCELLATION",
      "RESOURCE_MISUSE",
      "POLICY_VIOLATION",
      "REPEATED_VIOLATIONS",
      "CUSTOM_EVENT",
    ],
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: "Penalty events retrieved successfully",
    type: [PenaltyEventResponseDto],
  })
  @Roles(UserRole.TEACHER, UserRole.PROGRAM_ADMIN, UserRole.GENERAL_ADMIN)
  async getPenaltyEvents(
    @CurrentUser() user: UserEntity,
    @Query("programId") programId?: string,
    @Query("isActive") isActive?: boolean,
    @Query("eventType") eventType?: string
  ): Promise<ApiResponseBookly<PenaltyEventResponseDto[]>> {
    const result = await this.penaltyService.getPenaltyEvents({
      programId,
      isActive,
      eventType,
    });
    return ResponseUtil.success(
      result,
      "Penalty events retrieved successfully"
    );
  }

  @Put(AVAILABILITY_URLS.PENALTY_EVENTS_UPDATE)
  @ApiOperation({
    summary: "Update penalty event",
    description: "Updates a penalty event configuration",
  })
  @ApiParam({
    name: "id",
    description: "Penalty event ID",
    type: "string",
    format: "uuid",
  })
  @ApiBody({ type: CreatePenaltyEventDto })
  @ApiResponse({
    status: HttpStatus.OK,
    description: "Penalty event updated successfully",
    type: PenaltyEventResponseDto,
  })
  @Roles(UserRole.PROGRAM_ADMIN, UserRole.GENERAL_ADMIN)
  async updatePenaltyEvent(
    @Param("id", ParseUUIDPipe) id: string,
    @Body(ValidationPipe) updateDto: CreatePenaltyEventDto,
    @CurrentUser() user: UserEntity
  ): Promise<ApiResponseBookly<PenaltyEventResponseDto>> {
    const result = await this.penaltyService.updatePenaltyEvent(
      id,
      updateDto,
      user.id
    );
    return ResponseUtil.success(result, "Penalty event updated successfully");
  }

  @Delete(AVAILABILITY_URLS.PENALTY_EVENTS_DELETE)
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({
    summary: "Deactivate penalty event",
    description: "Deactivates a penalty event (soft delete)",
  })
  @ApiParam({
    name: "id",
    description: "Penalty event ID",
    type: "string",
    format: "uuid",
  })
  @ApiResponse({
    status: HttpStatus.NO_CONTENT,
    description: "Penalty event deactivated successfully",
  })
  @Roles(UserRole.PROGRAM_ADMIN, UserRole.GENERAL_ADMIN)
  async deactivatePenaltyEvent(
    @Param("id", ParseUUIDPipe) id: string,
    @CurrentUser() user: UserEntity
  ): Promise<ApiResponseBookly<boolean>> {
    await this.penaltyService.deactivatePenaltyEvent(id, user.id);
    return ResponseUtil.success(null, "Penalty event deactivated successfully");
  }

  // Penalty Configurations Management
  @Post(AVAILABILITY_URLS.PENALTY_CONFIGURATIONS)
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: "Create penalty configuration",
    description: "Creates a new penalty configuration with sanctions",
  })
  @ApiBody({ type: CreatePenaltyDto })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: "Penalty configuration created successfully",
    type: PenaltyResponseDto,
  })
  @Roles(UserRole.PROGRAM_ADMIN, UserRole.GENERAL_ADMIN)
  async createPenalty(
    @Body(ValidationPipe) createDto: CreatePenaltyDto,
    @CurrentUser() user: UserEntity
  ): Promise<ApiResponseBookly<PenaltyResponseDto>> {
    const result = await this.penaltyService.createPenalty({
      ...createDto,
      createdBy: user.id,
    });
    return ResponseUtil.success(
      result,
      "Penalty configuration created successfully"
    );
  }

  @Get(AVAILABILITY_URLS.PENALTY_CONFIGURATIONS)
  @ApiOperation({
    summary: "Get penalty configurations",
    description: "Retrieves penalty configurations with optional filtering",
  })
  @ApiQuery({ type: PenaltyQueryDto })
  @ApiResponse({
    status: HttpStatus.OK,
    description: "Penalty configurations retrieved successfully",
    type: [PenaltyResponseDto],
  })
  @Roles(UserRole.TEACHER, UserRole.PROGRAM_ADMIN, UserRole.GENERAL_ADMIN)
  async getPenalties(
    @Query(ValidationPipe) queryDto: PenaltyQueryDto,
    @CurrentUser() user: UserEntity
  ): Promise<ApiResponseBookly<PenaltyResponseDto[]>> {
    const result = await this.penaltyService.getPenalties(queryDto);
    return ResponseUtil.success(
      result,
      "Penalty configurations retrieved successfully"
    );
  }

  // User Penalties Management
  @Post(AVAILABILITY_URLS.PENALTY_APPLY)
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: "Apply penalty to user",
    description: "Applies a penalty to a user based on a penalty event",
  })
  @ApiBody({ type: ApplyPenaltyDto })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: "Penalty applied successfully",
    type: UserPenaltyResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: "Invalid penalty application data",
  })
  @Roles(UserRole.PROGRAM_ADMIN, UserRole.GENERAL_ADMIN, UserRole.SECURITY)
  async applyPenalty(
    @Body(ValidationPipe) applyDto: ApplyPenaltyDto,
    @CurrentUser() user: any
  ): Promise<ApiResponseBookly<UserPenaltyResponseDto>> {
    const result = await this.penaltyService.applyPenalty({
      ...applyDto,
      appliedBy: user.id,
    });
    return ResponseUtil.success(result, "Penalty applied successfully");
  }

  @Get(AVAILABILITY_URLS.PENALTY_USER_PENALTIES)
  @ApiOperation({
    summary: "Get user penalties",
    description: "Retrieves all penalties for a specific user",
  })
  @ApiParam({
    name: "userId",
    description: "User ID",
    type: "string",
    format: "uuid",
  })
  @ApiQuery({
    name: "status",
    description: "Filter by penalty status",
    required: false,
    enum: ["ACTIVE", "EXPIRED", "REVOKED", "APPEALED"],
  })
  @ApiQuery({
    name: "includeExpired",
    description: "Include expired penalties",
    required: false,
    type: "boolean",
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: "User penalties retrieved successfully",
    type: [UserPenaltyResponseDto],
  })
  @Roles(UserRole.TEACHER, UserRole.PROGRAM_ADMIN, UserRole.GENERAL_ADMIN)
  async getUserPenalties(
    @Param("userId", ParseUUIDPipe) userId: string,
    @CurrentUser() user: UserEntity,
    @Query("status") status?: string,
    @Query("includeExpired") includeExpired: boolean = false
  ): Promise<ApiResponseBookly<UserPenaltyResponseDto[]>> {
    const result = await this.penaltyService.getUserPenalties(
      userId,
      status,
      includeExpired
    );
    return ResponseUtil.success(
      result,
      "User penalties retrieved successfully"
    );
  }

  @Get(AVAILABILITY_URLS.PENALTY_MY_PENALTIES)
  @ApiOperation({
    summary: "Get current user penalties",
    description: "Retrieves all penalties for the current user",
  })
  @ApiQuery({
    name: "includeExpired",
    description: "Include expired penalties",
    required: false,
    type: "boolean",
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: "Current user penalties retrieved successfully",
    type: [UserPenaltyResponseDto],
  })
  @Roles(
    UserRole.STUDENT,
    UserRole.TEACHER,
    UserRole.PROGRAM_ADMIN,
    UserRole.GENERAL_ADMIN
  )
  async getMyPenalties(
    @Query("includeExpired") includeExpired: boolean = false,
    @CurrentUser() user: UserEntity
  ): Promise<ApiResponseBookly<UserPenaltyResponseDto[]>> {
    const result = await this.penaltyService.getUserPenalties(
      user.id,
      UserPenaltyStatus.ACTIVE,
      includeExpired
    );
    return ResponseUtil.success(
      result,
      "Current user penalties retrieved successfully"
    );
  }

  @Delete(AVAILABILITY_URLS.PENALTY_USER_DELETE)
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({
    summary: "Remove user penalty",
    description: "Removes or revokes a penalty from a user",
  })
  @ApiParam({
    name: "id",
    description: "User penalty ID",
    type: "string",
    format: "uuid",
  })
  @ApiBody({
    schema: {
      type: "object",
      properties: {
        reason: {
          type: "string",
          description: "Reason for removing the penalty",
        },
      },
      required: ["reason"],
    },
  })
  @ApiResponse({
    status: HttpStatus.NO_CONTENT,
    description: "Penalty removed successfully",
  })
  @Roles(UserRole.PROGRAM_ADMIN, UserRole.GENERAL_ADMIN)
  async removePenalty(
    @Param("id", ParseUUIDPipe) id: string,
    @Body("reason") reason: string,
    @CurrentUser() user: UserEntity
  ): Promise<ApiResponseBookly<boolean>> {
    await this.penaltyService.removePenalty(id, user.id, reason);
    return ResponseUtil.success(null, "Penalty removed successfully");
  }

  // Penalty Validation and Checking
  @Post(AVAILABILITY_URLS.PENALTY_VALIDATION_AND_CHECKING)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: "Validate user action",
    description:
      "Validates if a user can perform a specific action considering active penalties",
  })
  @ApiBody({
    schema: {
      type: "object",
      properties: {
        userId: { type: "string", format: "uuid" },
        action: {
          type: "string",
          enum: [
            "CREATE_RESERVATION",
            "MODIFY_RESERVATION",
            "CANCEL_RESERVATION",
            "JOIN_WAITING_LIST",
          ],
        },
        resourceId: { type: "string", format: "uuid" },
        programId: { type: "string", format: "uuid" },
      },
      required: ["userId", "action"],
    },
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: "Action validation completed",
    schema: {
      type: "object",
      properties: {
        allowed: { type: "boolean" },
        restrictions: { type: "array", items: { type: "object" } },
        warnings: { type: "array", items: { type: "string" } },
        remainingActions: { type: "number" },
      },
    },
  })
  @Roles(
    UserRole.STUDENT,
    UserRole.TEACHER,
    UserRole.PROGRAM_ADMIN,
    UserRole.GENERAL_ADMIN
  )
  async validateUserAction(
    @Body("userId") userId: string,
    @Body("action")
    action:
      | "CREATE_RESERVATION"
      | "MODIFY_RESERVATION"
      | "CANCEL_RESERVATION"
      | "JOIN_WAITING_LIST",
    @CurrentUser() user: UserEntity,
    @Body("resourceId") resourceId?: string,
    @Body("programId") programId?: string
  ): Promise<
    ApiResponseBookly<{
      allowed: boolean;
      restrictions: any[];
      warnings: string[];
      remainingActions?: number;
    }>
  > {
    // Users can only validate their own actions unless they're admin
    if (user.id !== userId || !user.hasRole(UserRole.GENERAL_ADMIN)) {
      throw new Error("Unauthorized to validate action");
    }

    const targetUserId =
      user.hasRole(UserRole.STUDENT) || user.hasRole(UserRole.TEACHER)
        ? user.id
        : userId;

    const result = await this.penaltyService.validateUserAction(
      targetUserId,
      action,
      resourceId,
      programId
    );
    return ResponseUtil.success(result, "Action validated successfully");
  }

  @Get(AVAILABILITY_URLS.PENALTY_USER_SCORE)
  @ApiOperation({
    summary: "Get user penalty score",
    description: "Calculates the accumulated penalty score for a user",
  })
  @ApiParam({
    name: "userId",
    description: "User ID",
    type: "string",
    format: "uuid",
  })
  @ApiQuery({
    name: "programId",
    description: "Filter by program ID",
    required: false,
    type: "string",
  })
  @ApiQuery({
    name: "timeRange",
    description: "Time range for score calculation (7d, 30d, 90d)",
    required: false,
    enum: ["7d", "30d", "90d"],
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: "Penalty score calculated successfully",
    schema: {
      type: "object",
      properties: {
        totalScore: { type: "number" },
        scoreBreakdown: { type: "array", items: { type: "object" } },
        riskLevel: {
          type: "string",
          enum: ["LOW", "MEDIUM", "HIGH", "CRITICAL"],
        },
        recommendedActions: { type: "array", items: { type: "string" } },
      },
    },
  })
  @Roles(UserRole.TEACHER, UserRole.PROGRAM_ADMIN, UserRole.GENERAL_ADMIN)
  async getUserPenaltyScore(
    @Param("userId", ParseUUIDPipe) userId: string,
    @CurrentUser() user: UserEntity,
    @Query("programId") programId?: string,
    @Query("timeRange") timeRange: string = "30d"
  ): Promise<
    ApiResponseBookly<{
      totalScore: number;
      scoreBreakdown: any[];
      riskLevel: string;
      recommendedActions: string[];
    }>
  > {
    const timeRangeMap = {
      "7d": {
        start: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
        end: new Date(),
      },
      "30d": {
        start: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
        end: new Date(),
      },
      "90d": {
        start: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000),
        end: new Date(),
      },
    };

    const result = await this.penaltyService.calculatePenaltyScore(
      userId,
      programId,
      timeRangeMap[timeRange] || timeRangeMap["30d"]
    );
    return ResponseUtil.success(
      result,
      "Penalty score calculated successfully"
    );
  }

  // Analytics and Reporting
  @Get(AVAILABILITY_URLS.PENALTY_ANALYTICS)
  @ApiOperation({
    summary: "Get penalty analytics",
    description: "Retrieves comprehensive penalty analytics and patterns",
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
    description: "Analytics retrieved successfully",
    type: PenaltyAnalyticsDto,
  })
  @Roles(UserRole.PROGRAM_ADMIN, UserRole.GENERAL_ADMIN)
  async getPenaltyAnalytics(
    @CurrentUser() user: UserEntity,
    @Query("programId") programId?: string,
    @Query("timeRange") timeRange: string = "30d"
  ): Promise<ApiResponseBookly<PenaltyAnalyticsDto>> {
    const timeRangeMap = {
      "7d": {
        start: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
        end: new Date(),
      },
      "30d": {
        start: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
        end: new Date(),
      },
      "90d": {
        start: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000),
        end: new Date(),
      },
    };

    const result = await this.penaltyService.generateAnalytics(
      programId,
      timeRangeMap[timeRange] || timeRangeMap["30d"]
    );
    return ResponseUtil.success(result, "Analytics retrieved successfully");
  }

  @Post(AVAILABILITY_URLS.PENALTY_PROCESS_EXPIRED)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: "Process expired penalties",
    description:
      "Processes and cleans up expired penalties (system/admin only)",
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: "Expired penalties processed successfully",
    schema: {
      type: "object",
      properties: {
        expiredCount: { type: "number" },
        usersAffected: { type: "array", items: { type: "string" } },
        restoredPermissions: { type: "array", items: { type: "object" } },
      },
    },
  })
  @Roles(UserRole.PROGRAM_ADMIN, UserRole.GENERAL_ADMIN)
  async processExpiredPenalties(@CurrentUser() user: UserEntity): Promise<
    ApiResponseBookly<{
      expiredCount: number;
      usersAffected: string[];
      restoredPermissions: any[];
    }>
  > {
    const result = await this.penaltyService.processExpiredPenalties();
    return ResponseUtil.success(
      result,
      "Expired penalties processed successfully"
    );
  }

  @Post(AVAILABILITY_URLS.PENALTY_BULK_APPLY)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: "Bulk apply penalties",
    description: "Applies penalties to multiple users at once (admin only)",
  })
  @ApiBody({
    schema: {
      type: "object",
      properties: {
        operations: {
          type: "array",
          items: {
            type: "object",
            properties: {
              userId: { type: "string", format: "uuid" },
              penaltyId: { type: "string", format: "uuid" },
              reason: { type: "string" },
              customDuration: { type: "number" },
            },
            required: ["userId", "penaltyId", "reason"],
          },
        },
      },
      required: ["operations"],
    },
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: "Bulk penalty application completed",
    schema: {
      type: "object",
      properties: {
        successful: { type: "array", items: { type: "object" } },
        failed: { type: "array", items: { type: "object" } },
        summary: { type: "object" },
      },
    },
  })
  @Roles(UserRole.PROGRAM_ADMIN, UserRole.GENERAL_ADMIN)
  async bulkApplyPenalties(
    @Body("operations")
    operations: Array<{
      userId: string;
      penaltyId: string;
      reason: string;
      customDuration?: number;
    }>,
    @CurrentUser() user: UserEntity
  ): Promise<
    ApiResponseBookly<{ successful: any[]; failed: any[]; summary: any }>
  > {
    const result = await this.penaltyService.bulkApplyPenalties(
      operations,
      user.id
    );
    return ResponseUtil.success(result, "Bulk penalty application completed");
  }

  @Get(AVAILABILITY_URLS.PENALTY_RISK_PREDICTION)
  @ApiOperation({
    summary: "Predict penalty risk",
    description: "Predicts the penalty risk for a user based on patterns",
  })
  @ApiParam({
    name: "userId",
    description: "User ID",
    type: "string",
    format: "uuid",
  })
  @ApiQuery({
    name: "programId",
    description: "Filter by program ID",
    required: false,
    type: "string",
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: "Risk prediction completed",
    schema: {
      type: "object",
      properties: {
        riskScore: { type: "number" },
        riskLevel: {
          type: "string",
          enum: ["LOW", "MEDIUM", "HIGH", "CRITICAL"],
        },
        riskFactors: { type: "array", items: { type: "object" } },
        preventiveRecommendations: { type: "array", items: { type: "string" } },
        monitoringRequired: { type: "boolean" },
      },
    },
  })
  @Roles(UserRole.TEACHER, UserRole.PROGRAM_ADMIN, UserRole.GENERAL_ADMIN)
  async predictPenaltyRisk(
    @Param("userId", ParseUUIDPipe) userId: string,
    @CurrentUser() user: UserEntity,
    @Query("programId") programId?: string
  ): Promise<ApiResponseBookly<any>> {
    const result = await this.penaltyService.predictPenaltyRisk(
      userId,
      programId
    );
    return ResponseUtil.success(result, "Risk prediction completed");
  }

  @Post(AVAILABILITY_URLS.PENALTY_APPEAL)
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: "Appeal penalty",
    description: "Creates an appeal for a user penalty",
  })
  @ApiParam({
    name: "id",
    description: "User penalty ID",
    type: "string",
    format: "uuid",
  })
  @ApiBody({
    schema: {
      type: "object",
      properties: {
        reason: {
          type: "string",
          description: "Reason for the appeal",
        },
        evidence: {
          type: "array",
          items: { type: "string" },
          description: "Evidence supporting the appeal",
        },
      },
      required: ["reason"],
    },
  })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: "Appeal created successfully",
    schema: {
      type: "object",
      properties: {
        appealProcessed: { type: "boolean" },
        decision: {
          type: "string",
          enum: ["APPROVED", "DENIED", "PENDING_REVIEW"],
        },
        reviewNotes: { type: "string" },
        nextSteps: { type: "array", items: { type: "string" } },
      },
    },
  })
  @Roles(
    UserRole.STUDENT,
    UserRole.TEACHER,
    UserRole.PROGRAM_ADMIN,
    UserRole.GENERAL_ADMIN
  )
  async appealPenalty(
    @Param("id", ParseUUIDPipe) id: string,
    @Body("reason") reason: string,
    @CurrentUser() user: UserEntity,
    @Body("evidence") evidence?: string[]
  ): Promise<ApiResponseBookly<any>> {
    const result = await this.penaltyService.processPenaltyAppeal({
      userPenaltyId: id,
      appealedBy: user.id,
      reason,
      evidence,
    });
    return ResponseUtil.success(result, "Appeal processed successfully");
  }

  @Post(AVAILABILITY_URLS.PENALTY_CONFIGURATION_OPTIMIZE)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: "Optimize penalty configuration",
    description:
      "Optimizes penalty configuration based on effectiveness analysis (admin only)",
  })
  @ApiBody({
    schema: {
      type: "object",
      properties: {
        programId: {
          type: "string",
          format: "uuid",
          description: "Program ID to optimize configuration for",
        },
      },
      required: ["programId"],
    },
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: "Configuration optimization completed",
    schema: {
      type: "object",
      properties: {
        currentEffectiveness: { type: "number" },
        recommendedChanges: { type: "array", items: { type: "object" } },
        newPenaltyRecommendations: { type: "array", items: { type: "object" } },
      },
    },
  })
  @Roles(UserRole.GENERAL_ADMIN)
  async optimizePenaltyConfiguration(
    @Body("programId") programId: string,
    @CurrentUser() user: UserEntity
  ): Promise<ApiResponseBookly<any>> {
    const result =
      await this.penaltyService.optimizePenaltyConfiguration(programId);
    return ResponseUtil.success(result, "Configuration optimization completed");
  }
}
