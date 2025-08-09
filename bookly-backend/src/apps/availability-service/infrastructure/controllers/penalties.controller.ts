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
import { RolesGuard } from "@apps/auth-service/infrastructure/guards/roles.guard";
import { Roles } from "@apps/auth-service/infrastructure/decorators/roles.decorator";
import { CurrentUser } from '@libs/common';
import { UserRole } from '@libs/common';

// DTOs (to be created)
import { CreatePenaltyEventDto } from "../dtos/create-penalty-event.dto";
import { CreatePenaltyDto } from "../dtos/create-penalty.dto";
import { ApplyPenaltyDto } from "../dtos/apply-penalty.dto";
import { PenaltyEventResponseDto } from "../dtos/penalty-event-response.dto";
import { PenaltyResponseDto } from "../dtos/penalty-response.dto";
import { UserPenaltyResponseDto, UserPenaltyStatus } from "../dtos/user-penalty-response.dto";
import { PenaltyAnalyticsDto } from "../dtos/penalty-analytics.dto";
import { PenaltyQueryDto } from "../dtos/penalty-query.dto";

// Services (to be created in application layer)
import { PenaltyService } from "../../application/services/penalty.service";

@ApiTags("Penalties")
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller("penalties")
export class PenaltiesController {
  constructor(private readonly penaltyService: PenaltyService) {}

  // Penalty Events Management
  @Post("events")
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
    @CurrentUser() user: any
  ): Promise<PenaltyEventResponseDto> {
    return await this.penaltyService.createPenaltyEvent({
      ...createDto,
      createdBy: user.id,
    });
  }

  @Get("events")
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
    @CurrentUser() user: any,
    @Query("programId") programId?: string,
    @Query("isActive") isActive?: boolean,
    @Query("eventType") eventType?: string
  ): Promise<PenaltyEventResponseDto[]> {
    return await this.penaltyService.getPenaltyEvents({
      programId,
      isActive,
      eventType,
    });
  }

  @Put("events/:id")
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
    @CurrentUser() user: any
  ): Promise<PenaltyEventResponseDto> {
    return await this.penaltyService.updatePenaltyEvent(id, updateDto, user.id);
  }

  @Delete("events/:id")
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
    @CurrentUser() user: any
  ): Promise<void> {
    await this.penaltyService.deactivatePenaltyEvent(id, user.id);
  }

  // Penalty Configurations Management
  @Post("configurations")
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
    @CurrentUser() user: any
  ): Promise<PenaltyResponseDto> {
    return await this.penaltyService.createPenalty({
      ...createDto,
      createdBy: user.id,
    });
  }

  @Get("configurations")
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
    @CurrentUser() user: any
  ): Promise<PenaltyResponseDto[]> {
    return await this.penaltyService.getPenalties(queryDto);
  }

  // User Penalties Management
  @Post("apply")
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
  ): Promise<UserPenaltyResponseDto> {
    return await this.penaltyService.applyPenalty({
      ...applyDto,
      appliedBy: user.id,
    });
  }

  @Get("user/:userId")
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
    @CurrentUser() user: any,
    @Query("status") status?: string,
    @Query("includeExpired") includeExpired: boolean = false
  ): Promise<UserPenaltyResponseDto[]> {
    return await this.penaltyService.getUserPenalties(
      userId,
      status,
      includeExpired
    );
  }

  @Get("my-penalties")
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
    @CurrentUser() user: any
  ): Promise<UserPenaltyResponseDto[]> {
    return await this.penaltyService.getUserPenalties(user.id, UserPenaltyStatus.ACTIVE, includeExpired);
  }

  @Delete("user-penalties/:id")
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
    @CurrentUser() user: any
  ): Promise<void> {
    await this.penaltyService.removePenalty(id, user.id, reason);
  }

  // Penalty Validation and Checking
  @Post("validate-action")
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
    @CurrentUser() user: any,
    @Body("resourceId") resourceId?: string,
    @Body("programId") programId?: string
  ): Promise<{
    allowed: boolean;
    restrictions: any[];
    warnings: string[];
    remainingActions?: number;
  }> {
    // Users can only validate their own actions unless they're admin
    const targetUserId =
      user.role === UserRole.STUDENT || user.role === UserRole.TEACHER
        ? user.id
        : userId;

    return await this.penaltyService.validateUserAction(
      targetUserId,
      action,
      resourceId,
      programId
    );
  }

  @Get("user/:userId/score")
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
    @CurrentUser() user: any,
    @Query("programId") programId?: string,
    @Query("timeRange") timeRange: string = "30d"
  ): Promise<{
    totalScore: number;
    scoreBreakdown: any[];
    riskLevel: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
    recommendedActions: string[];
  }> {
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

    return await this.penaltyService.calculatePenaltyScore(
      userId,
      programId,
      timeRangeMap[timeRange] || timeRangeMap["30d"]
    );
  }

  // Analytics and Reporting
  @Get("analytics")
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
    @CurrentUser() user: any,
    @Query("programId") programId?: string,
    @Query("timeRange") timeRange: string = "30d"
  ): Promise<PenaltyAnalyticsDto> {
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

    return await this.penaltyService.generateAnalytics(
      programId,
      timeRangeMap[timeRange] || timeRangeMap["30d"]
    );
  }

  @Post("process-expired")
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
  async processExpiredPenalties(@CurrentUser() user: any): Promise<{
    expiredCount: number;
    usersAffected: string[];
    restoredPermissions: any[];
  }> {
    return await this.penaltyService.processExpiredPenalties();
  }

  @Post("bulk-apply")
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
    @CurrentUser() user: any
  ): Promise<{
    successful: any[];
    failed: any[];
    summary: any;
  }> {
    return await this.penaltyService.bulkApplyPenalties(operations, user.id);
  }

  @Get("user/:userId/risk-prediction")
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
    @CurrentUser() user: any,
    @Query("programId") programId?: string
  ): Promise<{
    riskScore: number;
    riskLevel: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
    riskFactors: any[];
    preventiveRecommendations: string[];
    monitoringRequired: boolean;
  }> {
    return await this.penaltyService.predictPenaltyRisk(userId, programId);
  }

  @Post("user-penalties/:id/appeal")
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
    @CurrentUser() user: any,
    @Body("evidence") evidence?: string[],
  ): Promise<{
    appealProcessed: boolean;
    decision: "APPROVED" | "DENIED" | "PENDING_REVIEW";
    reviewNotes?: string;
    nextSteps: string[];
  }> {
    return await this.penaltyService.processPenaltyAppeal({
      userPenaltyId: id,
      appealedBy: user.id,
      reason,
      evidence,
    });
  }

  @Post("configuration/optimize")
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
    @CurrentUser() user: any
  ): Promise<{
    currentEffectiveness: number;
    recommendedChanges: any[];
    newPenaltyRecommendations: any[];
  }> {
    return await this.penaltyService.optimizePenaltyConfiguration(programId);
  }
}
