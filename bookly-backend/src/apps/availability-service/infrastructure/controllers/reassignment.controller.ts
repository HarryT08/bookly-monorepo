/**
 * RF-15: Reassignment REST Controller
 * Handles HTTP requests for reservation reassignment management
 */

import {
  Controller,
  Get,
  Post,
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
import { AVAILABILITY_URLS } from "@/apps/availability-service/utils/maps/urls.map";

// DTOs
import { CreateReassignmentRequestDto } from "@/apps/availability-service/infrastructure/dtos/create-reassignment-request.dto";
import { ReassignmentRequestResponseDto } from "@/apps/availability-service/infrastructure/dtos/reassignment-request-response.dto";
import { ReassignmentQueryDto } from "@/apps/availability-service/infrastructure/dtos/reassignment-query.dto";
import { ProcessReassignmentResponseDto } from "@/apps/availability-service/infrastructure/dtos/process-reassignment-response.dto";
import { ResourceEquivalenceResponseDto } from "@/apps/availability-service/infrastructure/dtos/resource-equivalence-response.dto";
import { ReassignmentAnalyticsDto } from "@/apps/availability-service/infrastructure/dtos/reassignment-response.dto";

// Services
import { ReassignmentService } from "@/apps/availability-service/application/services/reassignment.service";
import { ResponseUtil } from "@/libs/common/utils/response.util";
import { ApiResponseBookly } from "@/libs/dto";
import { UserEntity } from "@/apps/auth-service/domain/entities/user.entity";

@ApiTags(AVAILABILITY_URLS.REASSIGNMENTS_TAG)
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller(AVAILABILITY_URLS.REASSIGNMENTS)
export class ReassignmentController {
  constructor(private readonly reassignmentService: ReassignmentService) {}

  @Post(AVAILABILITY_URLS.REASSIGNMENT_REQUEST_CREATE)
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: "Create reassignment request",
    description:
      "Creates a new reassignment request for a reservation with automatic resource suggestions",
  })
  @ApiBody({ type: CreateReassignmentRequestDto })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: "Reassignment request created successfully",
    type: ReassignmentRequestResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: "Invalid request data or business rule violation",
  })
  @ApiResponse({
    status: HttpStatus.CONFLICT,
    description: "Existing pending reassignment request for this reservation",
  })
  @Roles(UserRole.PROGRAM_ADMIN, UserRole.GENERAL_ADMIN, UserRole.SECURITY)
  async createReassignmentRequest(
    @Body(ValidationPipe) createDto: CreateReassignmentRequestDto,
    @CurrentUser() user: UserEntity
  ): Promise<ApiResponseBookly<ReassignmentRequestResponseDto>> {
    for (const role of [
      UserRole.STUDENT,
      UserRole.TEACHER,
      UserRole.SECURITY,
      UserRole.GENERAL_STAFF,
      UserRole.PROGRAM_ADMIN,
      UserRole.GENERAL_ADMIN,
    ]) {
      if (user.hasRole(role)) {
        const result = await this.reassignmentService.createRequest({
          ...createDto,
          requestedBy: user.id,
          userPriority: this.getUserPriority(role),
        });
        return ResponseUtil.success(
          result,
          "Reassignment request created successfully"
        );
      }
    }
  }

  @Get(AVAILABILITY_URLS.REASSIGNMENT_REQUEST)
  @ApiOperation({
    summary: "Get reassignment requests",
    description:
      "Retrieves reassignment requests with optional filtering and pagination",
  })
  @ApiQuery({ type: ReassignmentQueryDto })
  @ApiResponse({
    status: HttpStatus.OK,
    description: "Reassignment requests retrieved successfully",
    schema: {
      type: "object",
      properties: {
        data: {
          type: "array",
          items: {
            $ref: "#/components/schemas/ReassignmentRequestResponseDto",
          },
        },
        total: { type: "number" },
        page: { type: "number" },
        limit: { type: "number" },
      },
    },
  })
  @Roles(
    UserRole.STUDENT,
    UserRole.TEACHER,
    UserRole.PROGRAM_ADMIN,
    UserRole.GENERAL_ADMIN
  )
  async getReassignmentRequests(
    @Query(ValidationPipe) queryDto: ReassignmentQueryDto,
    @CurrentUser() user: UserEntity
  ): Promise<ApiResponseBookly<ReassignmentRequestResponseDto[]>> {
    // Students and teachers can only see their own requests
    const filteredQuery =
      user.hasRole(UserRole.STUDENT) || user.hasRole(UserRole.TEACHER)
        ? { ...queryDto, userId: user.id }
        : queryDto;
    const result = await this.reassignmentService.findAll(filteredQuery);
    return ResponseUtil.success(
      result,
      "Reassignment requests retrieved successfully"
    );
  }

  @Get(AVAILABILITY_URLS.REASSIGNMENT_REQUEST_FIND_BY_ID)
  @ApiOperation({
    summary: "Get reassignment request by ID",
    description:
      "Retrieves a specific reassignment request with suggested resources",
  })
  @ApiParam({
    name: "id",
    description: "Reassignment request ID",
    type: "string",
    format: "uuid",
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: "Reassignment request found",
    type: ReassignmentRequestResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: "Reassignment request not found",
  })
  @Roles(
    UserRole.STUDENT,
    UserRole.TEACHER,
    UserRole.PROGRAM_ADMIN,
    UserRole.GENERAL_ADMIN
  )
  async getReassignmentRequestById(
    @Param("id", ParseUUIDPipe) id: string,
    @CurrentUser() user: UserEntity
  ): Promise<ApiResponseBookly<ReassignmentRequestResponseDto>> {
    const result = await this.reassignmentService.findById(id, user.id);
    return ResponseUtil.success(result, "Reassignment request found");
  }

  @Post(AVAILABILITY_URLS.REASSIGNMENT_REQUEST_RESPOND)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: "Respond to reassignment request",
    description: "User responds to a reassignment request (accept/reject)",
  })
  @ApiParam({
    name: "id",
    description: "Reassignment request ID",
    type: "string",
    format: "uuid",
  })
  @ApiBody({
    schema: {
      type: "object",
      properties: {
        response: {
          type: "string",
          enum: ["ACCEPT", "REJECT"],
          description: "User response to the reassignment request",
        },
        selectedResourceId: {
          type: "string",
          format: "uuid",
          description: "Selected resource ID if accepting (optional)",
        },
        reason: {
          type: "string",
          description: "Reason for rejection (required if rejecting)",
        },
      },
      required: ["response"],
    },
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: "Response processed successfully",
    type: ProcessReassignmentResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: "Invalid response or request not in pending status",
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: "Reassignment request not found",
  })
  @Roles(
    UserRole.STUDENT,
    UserRole.TEACHER,
    UserRole.PROGRAM_ADMIN,
    UserRole.GENERAL_ADMIN
  )
  async respondToReassignmentRequest(
    @Param("id", ParseUUIDPipe) id: string,
    @Body("response") response: "ACCEPT" | "REJECT",
    @CurrentUser() user: UserEntity,
    @Body("selectedResourceId") selectedResourceId?: string,
    @Body("reason") reason?: string
  ): Promise<ApiResponseBookly<ProcessReassignmentResponseDto>> {
    const result = await this.reassignmentService.processUserResponse(
      id,
      user.id,
      response,
      selectedResourceId,
      reason
    );
    return ResponseUtil.success(result, "Response processed successfully");
  }

  @Get(AVAILABILITY_URLS.REASSIGNMENT_EQUIVALENT_RESOURCES)
  @ApiOperation({
    summary: "Find equivalent resources",
    description: "Finds equivalent resources for reassignment purposes",
  })
  @ApiParam({
    name: "resourceId",
    description: "Original resource ID",
    type: "string",
    format: "uuid",
  })
  @ApiQuery({
    name: "programId",
    description: "Program ID for filtering equivalences",
    required: false,
    type: "string",
  })
  @ApiQuery({
    name: "capacity",
    description: "Required capacity",
    required: false,
    type: "number",
  })
  @ApiQuery({
    name: "features",
    description: "Preferred features (comma-separated)",
    required: false,
    type: "string",
  })
  @ApiQuery({
    name: "date",
    description: "Date for availability check (ISO 8601)",
    required: false,
    type: "string",
  })
  @ApiQuery({
    name: "startTime",
    description: "Start time for availability check (HH:mm)",
    required: false,
    type: "string",
  })
  @ApiQuery({
    name: "endTime",
    description: "End time for availability check (HH:mm)",
    required: false,
    type: "string",
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: "Equivalent resources found",
    schema: {
      type: "object",
      properties: {
        exactMatches: {
          type: "array",
          items: {
            $ref: "#/components/schemas/ResourceEquivalenceResponseDto",
          },
        },
        goodMatches: {
          type: "array",
          items: {
            $ref: "#/components/schemas/ResourceEquivalenceResponseDto",
          },
        },
        acceptableMatches: {
          type: "array",
          items: {
            $ref: "#/components/schemas/ResourceEquivalenceResponseDto",
          },
        },
        recommendations: { type: "array", items: { type: "object" } },
      },
    },
  })
  @Roles(UserRole.PROGRAM_ADMIN, UserRole.GENERAL_ADMIN, UserRole.SECURITY)
  async findEquivalentResources(
    @CurrentUser() user: UserEntity,
    @Param("resourceId", ParseUUIDPipe) resourceId: string,
    @Query("capacity") capacity?: number,
    @Query("features") features?: string,
    @Query("date") date?: string,
    @Query("startTime") startTime?: string,
    @Query("endTime") endTime?: string
  ): Promise<
    ApiResponseBookly<{
      exactMatches: ResourceEquivalenceResponseDto[];
      goodMatches: ResourceEquivalenceResponseDto[];
      acceptableMatches: ResourceEquivalenceResponseDto[];
      recommendations: any[];
    }>
  > {
    const timeSlot =
      date && startTime && endTime
        ? {
            date: new Date(date),
            startTime,
            endTime,
          }
        : undefined;

    const preferredFeatures = features
      ? features.split(",").map((f) => f.trim())
      : undefined;

    const result = await this.reassignmentService.findEquivalentResources(
      resourceId,
      new Date(timeSlot?.startTime),
      new Date(timeSlot?.endTime),
      capacity,
      null,
      preferredFeatures
    );
    return ResponseUtil.success(result, "Equivalent resources found");
  }

  @Post(AVAILABILITY_URLS.REASSIGNMENT_REQUEST_VALIDATE)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: "Validate reassignment request",
    description: "Validates a reassignment request without creating it",
  })
  @ApiBody({ type: CreateReassignmentRequestDto })
  @ApiResponse({
    status: HttpStatus.OK,
    description: "Validation completed",
    schema: {
      type: "object",
      properties: {
        canCreate: { type: "boolean" },
        violations: { type: "array", items: { type: "string" } },
        warnings: { type: "array", items: { type: "string" } },
        existingRequests: { type: "array", items: { type: "object" } },
        suggestedResources: { type: "number" },
      },
    },
  })
  @Roles(UserRole.PROGRAM_ADMIN, UserRole.GENERAL_ADMIN, UserRole.SECURITY)
  async validateReassignmentRequest(
    @Body(ValidationPipe) createDto: CreateReassignmentRequestDto,
    @CurrentUser() user: UserEntity
  ): Promise<
    ApiResponseBookly<{
      canCreate: boolean;
      violations: string[];
      warnings: string[];
      existingRequests: any[];
      suggestedResources: number;
    }>
  > {
    const validation = await this.reassignmentService.validateRequest({
      ...createDto,
      requestedBy: user.id,
    });

    return ResponseUtil.success(
      {
        canCreate: validation.isValid,
        violations: validation.errors,
        warnings: validation.warnings,
        existingRequests: [],
        suggestedResources: 0,
      },
      "Validation completed"
    );
  }

  @Delete(AVAILABILITY_URLS.REASSIGNMENT_REQUEST_CANCEL)
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({
    summary: "Cancel reassignment request",
    description: "Cancels a pending reassignment request",
  })
  @ApiParam({
    name: "id",
    description: "Reassignment request ID",
    type: "string",
    format: "uuid",
  })
  @ApiResponse({
    status: HttpStatus.NO_CONTENT,
    description: "Reassignment request cancelled successfully",
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: "Reassignment request not found",
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: "Request cannot be cancelled in current status",
  })
  @Roles(UserRole.PROGRAM_ADMIN, UserRole.GENERAL_ADMIN)
  async cancelReassignmentRequest(
    @Param("id", ParseUUIDPipe) id: string,
    @CurrentUser() user: UserEntity
  ): Promise<ApiResponseBookly<void>> {
    await this.reassignmentService.cancelRequest(
      id,
      user.id,
      "Cancelled by admin"
    );
    return ResponseUtil.success(
      null,
      "Reassignment request cancelled successfully"
    );
  }

  @Post(AVAILABILITY_URLS.REASSIGNMENT_REQUEST_AUTO_PROCESS)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: "Auto-process reassignment request",
    description:
      "Automatically processes a reassignment request based on configuration (admin only)",
  })
  @ApiParam({
    name: "id",
    description: "Reassignment request ID",
    type: "string",
    format: "uuid",
  })
  @ApiBody({
    schema: {
      type: "object",
      properties: {
        hoursUntilEvent: {
          type: "number",
          description: "Hours until the event (affects auto-approval logic)",
        },
      },
      required: ["hoursUntilEvent"],
    },
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: "Auto-processing completed",
    schema: {
      type: "object",
      properties: {
        autoApproved: { type: "boolean" },
        selectedResource: { type: "object" },
        reason: { type: "string" },
        notificationsSent: { type: "boolean" },
      },
    },
  })
  @Roles(UserRole.PROGRAM_ADMIN, UserRole.GENERAL_ADMIN)
  async autoProcessReassignmentRequest(
    @Param("id", ParseUUIDPipe) id: string,
    @Body("hoursUntilEvent") hoursUntilEvent: number,
    @CurrentUser() user: UserEntity
  ): Promise<
    ApiResponseBookly<{
      autoApproved: boolean;
      selectedResource: any;
      reason: string;
      notificationsSent: boolean;
    }>
  > {
    const result = await this.reassignmentService.autoProcessRequest(
      id,
      hoursUntilEvent
    );
    return ResponseUtil.success(result, "Auto-processing completed");
  }

  @Get(AVAILABILITY_URLS.REASSIGNMENT_ANALYTICS)
  @ApiOperation({
    summary: "Get reassignment analytics",
    description: "Retrieves comprehensive reassignment analytics and insights",
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
    description: "Analytics retrieved successfully",
    type: ReassignmentAnalyticsDto,
  })
  @Roles(UserRole.PROGRAM_ADMIN, UserRole.GENERAL_ADMIN)
  async getAnalytics(
    @CurrentUser() user: UserEntity,
    @Query("programId") programId?: string,
    @Query("timeRange") timeRangeParam: string = "30d"
  ): Promise<ApiResponseBookly<ReassignmentAnalyticsDto>> {
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

    const selectedRange = timeRangeMap[timeRangeParam] || timeRangeMap["30d"];
    const result = await this.reassignmentService.generateAnalytics({
      programId,
      startDate: selectedRange.start,
      endDate: selectedRange.end,
    });
    return ResponseUtil.success(result, "Analytics generated successfully");
  }

  @Post(AVAILABILITY_URLS.REASSIGNMENT_BULK_PROCESS)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: "Bulk process reassignment requests",
    description:
      "Processes multiple reassignment requests at once (admin only)",
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
              reservationId: { type: "string", format: "uuid" },
              reason: { type: "string" },
              suggestedResourceId: { type: "string", format: "uuid" },
              priority: { type: "string", enum: ["LOW", "MEDIUM", "HIGH"] },
            },
            required: ["reservationId", "reason"],
          },
        },
      },
      required: ["operations"],
    },
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: "Bulk processing completed",
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
  async bulkProcessReassignments(
    @Body("operations")
    operations: Array<{
      reservationId: string;
      reason: string;
      suggestedResourceId?: string;
      priority: "LOW" | "MEDIUM" | "HIGH";
    }>,
    @CurrentUser() user: UserEntity
  ): Promise<
    ApiResponseBookly<{ successful: any[]; failed: any[]; summary: any }>
  > {
    const result =
      await this.reassignmentService.processBulkReassignment(operations);
    return ResponseUtil.success(result, "Bulk processing completed");
  }

  @Get(AVAILABILITY_URLS.REASSIGNMENT_SUCCESS_PREDICTION)
  @ApiOperation({
    summary: "Predict reassignment success",
    description: "Predicts the success probability of a reassignment request",
  })
  @ApiParam({
    name: "id",
    description: "Reassignment request ID",
    type: "string",
    format: "uuid",
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: "Success prediction completed",
    schema: {
      type: "object",
      properties: {
        successProbability: { type: "number" },
        confidenceLevel: { type: "number" },
        keyFactors: { type: "array", items: { type: "object" } },
        recommendations: { type: "array", items: { type: "string" } },
      },
    },
  })
  @Roles(UserRole.PROGRAM_ADMIN, UserRole.GENERAL_ADMIN)
  async predictReassignmentSuccess(
    @Param("id", ParseUUIDPipe) id: string,
    @CurrentUser() user: any
  ) {
    const result = await this.reassignmentService.predictSuccess(id);
    return ResponseUtil.success(result, "Success prediction completed");
  }

  @Get(AVAILABILITY_URLS.REASSIGNMENT_USER_HISTORY)
  @ApiOperation({
    summary: "Get user reassignment history",
    description:
      "Retrieves reassignment history for a specific user (admin only)",
  })
  @ApiParam({
    name: "userId",
    description: "User ID",
    type: "string",
    format: "uuid",
  })
  @ApiQuery({
    name: "limit",
    description: "Number of records to return",
    required: false,
    type: "number",
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: "User reassignment history retrieved successfully",
    type: [ReassignmentRequestResponseDto],
  })
  @Roles(UserRole.PROGRAM_ADMIN, UserRole.GENERAL_ADMIN)
  async getUserReassignmentHistory(
    @Param("userId", ParseUUIDPipe) userId: string,
    @Query("limit") limit: number = 50,
    @CurrentUser() user: any
  ) {
    const result = await this.reassignmentService.getUserHistory(userId, limit);
    return ResponseUtil.success(
      result,
      "User reassignment history retrieved successfully"
    );
  }

  @Post(AVAILABILITY_URLS.REASSIGNMENT_CONFIGURATION_OPTIMIZE)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: "Optimize reassignment configuration",
    description:
      "Optimizes reassignment configuration based on usage patterns (admin only)",
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
        currentConfig: { type: "object" },
        recommendedChanges: { type: "array", items: { type: "object" } },
        testResults: { type: "object" },
      },
    },
  })
  @Roles(UserRole.GENERAL_ADMIN)
  async optimizeReassignmentConfiguration(
    @Body("programId") programId: string,
    @CurrentUser() user: any
  ) {
    const result =
      await this.reassignmentService.optimizeConfiguration(programId);
    return ResponseUtil.success(result, "Configuration optimized successfully");
  }

  // Helper method to determine user priority based on role
  private getUserPriority(role: UserRole): string {
    const priorityMap = {
      [UserRole.GENERAL_ADMIN]: "ADMIN_GENERAL",
      [UserRole.PROGRAM_ADMIN]: "PROGRAM_DIRECTOR",
      [UserRole.TEACHER]: "TEACHER",
      [UserRole.STUDENT]: "STUDENT",
      [UserRole.SECURITY]: "EXTERNAL",
      [UserRole.GENERAL_STAFF]: "EXTERNAL",
    };
    return priorityMap[role] || "EXTERNAL";
  }
}
