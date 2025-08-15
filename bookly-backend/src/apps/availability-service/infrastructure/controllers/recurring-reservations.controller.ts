/**
 * RF-12: Recurring Reservations REST Controller
 * Handles HTTP requests for periodic reservation management
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
import { CurrentUser, UserRole } from "@libs/common";

// DTOs (to be created)
import { CreateRecurringReservationDto } from "../dtos/create-recurring-reservation.dto";
import { UpdateRecurringReservationDto } from "../dtos/update-recurring-reservation.dto";
import { RecurringReservationResponseDto } from "../dtos/recurring-reservation-response.dto";
import { RecurringReservationQueryDto } from "../dtos/recurring-reservation-query.dto";
import { RecurringReservationStatsDto } from "../dtos/recurring-reservation-stats.dto";

// Services (to be created in application layer)
import { RecurringReservationService } from "../../application/services/recurring-reservation.service";

@ApiTags("Recurring Reservations")
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller("recurring-reservations")
export class RecurringReservationsController {
  constructor(
    private readonly recurringReservationService: RecurringReservationService
  ) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: "Create a new recurring reservation",
    description:
      "Creates a periodic reservation with specified frequency and generates initial instances",
  })
  @ApiBody({ type: CreateRecurringReservationDto })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: "Recurring reservation created successfully",
    type: RecurringReservationResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: "Invalid request data or business rule violation",
  })
  @ApiResponse({
    status: HttpStatus.CONFLICT,
    description: "Scheduling conflict or resource unavailable",
  })
  @Roles(
    UserRole.STUDENT,
    UserRole.TEACHER,
    UserRole.PROGRAM_ADMIN,
    UserRole.GENERAL_ADMIN
  )
  async createRecurringReservation(
    @Body(ValidationPipe) createDto: CreateRecurringReservationDto,
    @CurrentUser() user: any
  ): Promise<RecurringReservationResponseDto> {
    return await this.recurringReservationService.create({
      ...createDto,
      userId: user.id,
      createdBy: user.id,
    });
  }

  @Get()
  @ApiOperation({
    summary: "Get recurring reservations",
    description:
      "Retrieves recurring reservations with optional filtering and pagination",
  })
  @ApiQuery({ type: RecurringReservationQueryDto })
  @ApiResponse({
    status: HttpStatus.OK,
    description: "Recurring reservations retrieved successfully",
    type: [RecurringReservationResponseDto],
  })
  @Roles(
    UserRole.STUDENT,
    UserRole.TEACHER,
    UserRole.PROGRAM_ADMIN,
    UserRole.GENERAL_ADMIN
  )
  async getRecurringReservations(
    @Query(ValidationPipe) queryDto: RecurringReservationQueryDto,
    @CurrentUser() user: any
  ): Promise<{
    data: RecurringReservationResponseDto[];
    total: number;
    page: number;
    limit: number;
  }> {
    return await this.recurringReservationService.findAll({
      ...queryDto,
      userId: user.role === UserRole.STUDENT ? user.id : queryDto.userId,
    });
  }

  @Get(":id")
  @ApiOperation({
    summary: "Get recurring reservation by ID",
    description:
      "Retrieves a specific recurring reservation with its instances",
  })
  @ApiParam({
    name: "id",
    description: "Recurring reservation ID",
    type: "string",
    format: "uuid",
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: "Recurring reservation found",
    type: RecurringReservationResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: "Recurring reservation not found",
  })
  @Roles(
    UserRole.STUDENT,
    UserRole.TEACHER,
    UserRole.PROGRAM_ADMIN,
    UserRole.GENERAL_ADMIN
  )
  async getRecurringReservationById(
    @Param("id", ParseUUIDPipe) id: string,
    @CurrentUser() user: any
  ): Promise<RecurringReservationResponseDto> {
    return await this.recurringReservationService.findById(id, user.id);
  }

  @Put(":id")
  @ApiOperation({
    summary: "Update recurring reservation",
    description:
      "Updates a recurring reservation. Changes affect only future instances.",
  })
  @ApiParam({
    name: "id",
    description: "Recurring reservation ID",
    type: "string",
    format: "uuid",
  })
  @ApiBody({ type: UpdateRecurringReservationDto })
  @ApiResponse({
    status: HttpStatus.OK,
    description: "Recurring reservation updated successfully",
    type: RecurringReservationResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: "Recurring reservation not found",
  })
  @ApiResponse({
    status: HttpStatus.FORBIDDEN,
    description: "User not authorized to update this reservation",
  })
  @Roles(
    UserRole.STUDENT,
    UserRole.TEACHER,
    UserRole.PROGRAM_ADMIN,
    UserRole.GENERAL_ADMIN
  )
  async updateRecurringReservation(
    @Param("id", ParseUUIDPipe) id: string,
    @Body(ValidationPipe) updateDto: UpdateRecurringReservationDto,
    @CurrentUser() user: any
  ): Promise<RecurringReservationResponseDto> {
    return await this.recurringReservationService.update(
      id,
      updateDto,
      user.id
    );
  }

  @Delete(":id")
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({
    summary: "Cancel recurring reservation",
    description:
      "Cancels a recurring reservation. All future instances will be cancelled.",
  })
  @ApiParam({
    name: "id",
    description: "Recurring reservation ID",
    type: "string",
    format: "uuid",
  })
  @ApiResponse({
    status: HttpStatus.NO_CONTENT,
    description: "Recurring reservation cancelled successfully",
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: "Recurring reservation not found",
  })
  @ApiResponse({
    status: HttpStatus.FORBIDDEN,
    description: "User not authorized to cancel this reservation",
  })
  @Roles(
    UserRole.STUDENT,
    UserRole.TEACHER,
    UserRole.PROGRAM_ADMIN,
    UserRole.GENERAL_ADMIN
  )
  async cancelRecurringReservation(
    @Param("id", ParseUUIDPipe) id: string,
    @CurrentUser() user: any
  ): Promise<void> {
    await this.recurringReservationService.cancel(
      id,
      "Cancelled by user",
      'FUTURE_ONLY',
      user.id
    );
  }

  @Get(":id/instances")
  @ApiOperation({
    summary: "Get recurring reservation instances",
    description:
      "Retrieves all instances of a recurring reservation with their status",
  })
  @ApiParam({
    name: "id",
    description: "Recurring reservation ID",
    type: "string",
    format: "uuid",
  })
  @ApiQuery({
    name: "status",
    description: "Filter by instance status",
    required: false,
    enum: ["PENDING", "CONFIRMED", "CANCELLED", "COMPLETED"],
  })
  @ApiQuery({
    name: "from",
    description: "Filter instances from date (ISO 8601)",
    required: false,
    type: "string",
  })
  @ApiQuery({
    name: "to",
    description: "Filter instances to date (ISO 8601)",
    required: false,
    type: "string",
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: "Instances retrieved successfully",
  })
  @Roles(
    UserRole.STUDENT,
    UserRole.TEACHER,
    UserRole.PROGRAM_ADMIN,
    UserRole.GENERAL_ADMIN
  )
  async getRecurringReservationInstances(
    @Param("id", ParseUUIDPipe) id: string,
    @CurrentUser() user: any,
    @Query("status") status?: string,
    @Query("from") from?: string,
    @Query("to") to?: string,
  ): Promise<any[]> {
    return await this.recurringReservationService.getInstances(id, {
      status,
      from: from ? new Date(from) : undefined,
      to: to ? new Date(to) : undefined,
      userId: user.id,
    });
  }

  @Delete(":id/instances/:instanceId")
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({
    summary: "Cancel single recurring reservation instance",
    description:
      "Cancels a specific instance of a recurring reservation without affecting the series",
  })
  @ApiParam({
    name: "id",
    description: "Recurring reservation ID",
    type: "string",
    format: "uuid",
  })
  @ApiParam({
    name: "instanceId",
    description: "Instance ID to cancel",
    type: "string",
    format: "uuid",
  })
  @ApiResponse({
    status: HttpStatus.NO_CONTENT,
    description: "Instance cancelled successfully",
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: "Recurring reservation or instance not found",
  })
  @Roles(
    UserRole.STUDENT,
    UserRole.TEACHER,
    UserRole.PROGRAM_ADMIN,
    UserRole.GENERAL_ADMIN
  )
  async cancelRecurringReservationInstance(
    @Param("id", ParseUUIDPipe) id: string,
    @Param("instanceId", ParseUUIDPipe) instanceId: string,
    @CurrentUser() user: any
  ): Promise<void> {
    await this.recurringReservationService.cancelInstance(
      id,
      instanceId,
      user.id,
      "Cancelled by user"
    );
  }

  @Post(":id/generate-instances")
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: "Generate additional instances",
    description:
      "Generates additional instances for a recurring reservation up to a specified date",
  })
  @ApiParam({
    name: "id",
    description: "Recurring reservation ID",
    type: "string",
    format: "uuid",
  })
  @ApiBody({
    schema: {
      type: "object",
      properties: {
        generateUntil: {
          type: "string",
          format: "date-time",
          description: "Generate instances until this date",
        },
      },
      required: ["generateUntil"],
    },
  })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: "Instances generated successfully",
  })
  @Roles(UserRole.PROGRAM_ADMIN, UserRole.GENERAL_ADMIN)
  async generateAdditionalInstances(
    @Param("id", ParseUUIDPipe) id: string,
    @Body("generateUntil") generateUntil: string,
    @CurrentUser() user: any
  ): Promise<{ generatedCount: number; totalInstances: number }> {
    return await this.recurringReservationService.generateInstances(
      id,
      new Date(generateUntil),
      user.id
    );
  }

  @Get(":id/stats")
  @ApiOperation({
    summary: "Get recurring reservation statistics",
    description:
      "Retrieves usage statistics and analytics for a recurring reservation",
  })
  @ApiParam({
    name: "id",
    description: "Recurring reservation ID",
    type: "string",
    format: "uuid",
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: "Statistics retrieved successfully",
    type: RecurringReservationStatsDto,
  })
  @Roles(UserRole.TEACHER, UserRole.PROGRAM_ADMIN, UserRole.GENERAL_ADMIN)
  async getRecurringReservationStats(
    @Param("id", ParseUUIDPipe) id: string,
    @CurrentUser() user: any
  ): Promise<RecurringReservationStatsDto> {
    return await this.recurringReservationService.getStatistics(id, user.id);
  }

  @Post("validate")
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: "Validate recurring reservation",
    description:
      "Validates a recurring reservation configuration without creating it",
  })
  @ApiBody({ type: CreateRecurringReservationDto })
  @ApiResponse({
    status: HttpStatus.OK,
    description: "Validation completed",
    schema: {
      type: "object",
      properties: {
        isValid: { type: "boolean" },
        violations: { type: "array", items: { type: "string" } },
        warnings: { type: "array", items: { type: "string" } },
        estimatedInstances: { type: "number" },
        conflicts: { type: "array", items: { type: "object" } },
      },
    },
  })
  @Roles(
    UserRole.STUDENT,
    UserRole.TEACHER,
    UserRole.PROGRAM_ADMIN,
    UserRole.GENERAL_ADMIN
  )
  async validateRecurringReservation(
    @Body(ValidationPipe) createDto: CreateRecurringReservationDto,
    @CurrentUser() user: any
  ): Promise<{
    isValid: boolean;
    violations: string[];
    warnings: string[];
    estimatedInstances: number;
    conflicts: any[];
  }> {
    return await this.recurringReservationService.validate({
      ...createDto,
      userId: user.id,
    });
  }

  @Get("user/:userId")
  @ApiOperation({
    summary: "Get user recurring reservations",
    description:
      "Retrieves all recurring reservations for a specific user (admin only)",
  })
  @ApiParam({
    name: "userId",
    description: "User ID",
    type: "string",
    format: "uuid",
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: "User recurring reservations retrieved successfully",
    type: [RecurringReservationResponseDto],
  })
  @Roles(UserRole.PROGRAM_ADMIN, UserRole.GENERAL_ADMIN)
  async getUserRecurringReservations(
    @Param("userId", ParseUUIDPipe) userId: string,
    @Query(ValidationPipe) queryDto: RecurringReservationQueryDto,
    @CurrentUser() user: any
  ): Promise<{
    data: RecurringReservationResponseDto[];
    total: number;
    page: number;
    limit: number;
  }> {
    return await this.recurringReservationService.findAll({
      ...queryDto,
      userId,
    });
  }

  @Get("resource/:resourceId")
  @ApiOperation({
    summary: "Get resource recurring reservations",
    description:
      "Retrieves all recurring reservations for a specific resource (admin only)",
  })
  @ApiParam({
    name: "resourceId",
    description: "Resource ID",
    type: "string",
    format: "uuid",
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: "Resource recurring reservations retrieved successfully",
    type: [RecurringReservationResponseDto],
  })
  @Roles(UserRole.PROGRAM_ADMIN, UserRole.GENERAL_ADMIN)
  async getResourceRecurringReservations(
    @Param("resourceId", ParseUUIDPipe) resourceId: string,
    @Query(ValidationPipe) queryDto: RecurringReservationQueryDto,
    @CurrentUser() user: any
  ): Promise<{
    data: RecurringReservationResponseDto[];
    total: number;
    page: number;
    limit: number;
  }> {
    return await this.recurringReservationService.findAll({
      ...queryDto,
      resourceId,
    });
  }

  @Post("bulk-cancel")
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: "Bulk cancel recurring reservations",
    description: "Cancels multiple recurring reservations at once (admin only)",
  })
  @ApiBody({
    schema: {
      type: "object",
      properties: {
        reservationIds: {
          type: "array",
          items: { type: "string", format: "uuid" },
          description: "Array of recurring reservation IDs to cancel",
        },
        reason: {
          type: "string",
          description: "Reason for bulk cancellation",
        },
      },
      required: ["reservationIds", "reason"],
    },
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: "Bulk cancellation completed",
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
  async bulkCancelRecurringReservations(
    @Body("reservationIds") reservationIds: string[],
    @Body("reason") reason: string,
    @CurrentUser() user: any
  ): Promise<{
    successful: string[];
    failed: Array<{ id: string; error: string }>;
    totalProcessed: number;
  }> {
    return await this.recurringReservationService.bulkCancel(
      reservationIds,
      reason,
      'FUTURE_ONLY',
      user.id
    );
  }
}
