import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  HttpCode,
  HttpStatus,
  Logger,
  Res,
} from "@nestjs/common";
import { CurrentUser } from "@libs/common/decorators/current-user.decorator";
import { UserEntity } from "@apps/auth-service/domain/entities/user.entity";
import { CommandBus, QueryBus } from "@nestjs/cqrs";
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiQuery,
  ApiBody,
} from "@nestjs/swagger";
import { AVAILABILITY_URLS } from "../../utils/maps/urls.map";

// Commands
import { CreateAvailabilityCommand } from "../../application/commands/create-availability.command";
import { CreateScheduleCommand } from "../../application/commands/create-schedule.command";
import { CreateReservationCommand } from "../../application/commands/create-reservation.command";
import { CreateCalendarIntegrationCommand } from "../../application/commands/create-calendar-integration.command";
import { SyncCalendarCommand } from "../../application/commands/sync-calendar.command";
import { CreateReservationHistoryCommand } from "../../application/commands/create-reservation-history.command";

// Queries
import {
  GetAvailabilityQuery,
  GetResourceAvailabilityQuery,
  CheckAvailabilityQuery,
} from "../../application/queries/get-availability.query";
import {
  GetReservationHistoryQuery,
  ExportReservationHistoryQuery,
} from "../../application/queries/get-reservation-history.query";
import { GetCalendarIntegrationsQuery } from "../../application/queries/get-calendar-integrations.query";
import { GetAvailabilityWithConflictsQuery } from "../../application/queries/get-availability-with-conflicts.query";
import { GetCalendarViewQuery } from "../../application/queries/get-calendar-view.query";
import { GetReservationHistoryDetailedQuery } from "../../application/queries/get-reservation-history-detailed.query";

// DTOs
import { CreateAvailabilityDto } from "@libs/dto/availability/create-availability.dto";
import { CreateScheduleDto } from "@libs/dto/availability/create-schedule.dto";
import { CreateReservationDto } from "@libs/dto/availability/create-reservation.dto";
import {
  CreateCalendarIntegrationDto,
  AvailabilityQueryDto,
} from "@libs/dto/availability/calendar-integration.dto";
import { ReservationHistoryQueryDto } from "@libs/dto/availability/reservation-history.dto";
import {
  ApiResponseBookly,
  PaginatedResponseDto,
  SuccessResponseDto,
} from "@libs/dto/common/response.dto";
import { ResponseUtil } from "@libs/common/utils/response.util";
import {
  CalendarViewQueryDto,
  CalendarViewType,
  EventType,
} from "@libs/dto/availability/calendar-view.dto";
import {
  CreateReservationHistoryDto,
  ReservationHistoryDetailedQueryDto,
  ReservationHistoryResponseDto,
  HistoryAction,
  HistorySource,
} from "@libs/dto/availability/reservation-history-detailed.dto";

/**
 * Availability Controller
 *
 * This controller implements all endpoints for the Bookly Availability Service,
 * covering the complete Hito 2 requirements:
 *
 * - RF-07: Schedule and Availability Management
 * - RF-08: Calendar Integration with External Providers
 * - RF-10: Calendar Visualization and Views
 * - RF-11: Reservation History and Audit Trail
 *
 * Architecture:
 * - Follows CQRS pattern with CommandBus and QueryBus
 * - Implements Clean Architecture principles
 * - Uses Event-Driven Architecture for cross-service communication
 * - Comprehensive error handling and validation
 * - Complete Swagger documentation for API consumers
 *
 * @author Bookly Development Team
 * @version 2.0.0
 * @since Hito 2
 */
@ApiTags("Availability")
@Controller("availability")
export class AvailabilityController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus
  ) {}

  // ========================================
  // RF-07: Availability Management
  // ========================================

  @Post(AVAILABILITY_URLS.AVAILABILITY_BASIC)
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: "Create basic availability hours (RF-07)",
    description:
      "Creates basic availability hours for a resource on specific days of the week",
  })
  @ApiResponse({
    status: 201,
    description: "Availability created successfully",
    type: SuccessResponseDto,
  })
  @ApiResponse({ status: 400, description: "Invalid input data" })
  @ApiResponse({
    status: 409,
    description: "Time slot conflicts with existing availability",
  })
  async createAvailability(
    @Body() createAvailabilityDto: CreateAvailabilityDto,
    @CurrentUser() currentUser: UserEntity
  ): Promise<ApiResponseBookly<any>> {
    const command = new CreateAvailabilityCommand(
      createAvailabilityDto.resourceId,
      createAvailabilityDto.dayOfWeek,
      createAvailabilityDto.startTime,
      createAvailabilityDto.endTime,
      createAvailabilityDto.isActive,
      currentUser.id
    );

    const result = await this.commandBus.execute(command);
    return ResponseUtil.success(result, "Availability created successfully");
  }

  @Post(AVAILABILITY_URLS.SCHEDULE_CREATE)
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: "Create complex schedule with restrictions (RF-07)",
    description:
      "Creates complex scheduling rules with institutional restrictions and recurrence patterns",
  })
  @ApiResponse({ status: 201, description: "Schedule created successfully" })
  @ApiResponse({ status: 400, description: "Invalid input data" })
  @ApiResponse({
    status: 409,
    description: "Schedule conflicts with existing schedules",
  })
  async createSchedule(
    @Body() createScheduleDto: CreateScheduleDto,
    @CurrentUser() currentUser: UserEntity
  ): Promise<ApiResponseBookly<any>> {
    const command = new CreateScheduleCommand(
      createScheduleDto.resourceId,
      createScheduleDto.name,
      createScheduleDto.type,
      new Date(createScheduleDto.startDate),
      createScheduleDto.endDate ? new Date(createScheduleDto.endDate) : null,
      createScheduleDto.recurrenceRule,
      createScheduleDto.restrictions,
      createScheduleDto.isActive,
      currentUser.id
    );

    const result = await this.commandBus.execute(command);
    return ResponseUtil.success(result, "Schedule created successfully");
  }

  @Get(AVAILABILITY_URLS.AVAILABILITY_GET)
  @ApiOperation({
    summary: "Get basic availability (RF-07)",
    description: "Retrieves basic availability hours with optional filtering",
  })
  @ApiQuery({
    name: "resourceId",
    required: false,
    description: "Filter by resource ID",
  })
  @ApiQuery({
    name: "dayOfWeek",
    required: false,
    description: "Filter by day of week (0-6)",
  })
  @ApiResponse({
    status: 200,
    description: "Availability retrieved successfully",
  })
  async getAvailability(
    @Query("resourceId") resourceId?: string,
    @Query("dayOfWeek") dayOfWeek?: string
  ): Promise<ApiResponseBookly<any>> {
    const query = new GetAvailabilityQuery(
      resourceId,
      undefined,
      undefined,
      dayOfWeek ? parseInt(dayOfWeek) : undefined
    );

    return ResponseUtil.success(await this.queryBus.execute(query), "Availability retrieved successfully");
  }

  // ========================================
  // RF-10: Calendar Visualization
  // ========================================

  @Get(AVAILABILITY_URLS.AVAILABILITY_CALENDAR)
  @ApiOperation({
    summary: "Get resource availability for calendar display (RF-10)",
    description:
      "Retrieves comprehensive availability data for calendar visualization including reservations and restrictions",
  })
  @ApiParam({ name: "resourceId", description: "Resource ID" })
  @ApiQuery({ name: "startDate", description: "Start date (ISO format)" })
  @ApiQuery({ name: "endDate", description: "End date (ISO format)" })
  @ApiQuery({
    name: "includeReservations",
    required: false,
    description: "Include existing reservations",
  })
  @ApiQuery({
    name: "includeScheduleRestrictions",
    required: false,
    description: "Include schedule restrictions",
  })
  @ApiResponse({
    status: 200,
    description: "Calendar availability retrieved successfully",
  })
  async getCalendarAvailability(
    @Param("resourceId") resourceId: string,
    @Query("startDate") startDate: string,
    @Query("endDate") endDate: string,
    @Query("includeReservations") includeReservations: string = "true",
    @Query("includeScheduleRestrictions")
    includeScheduleRestrictions: string = "true"
  ): Promise<ApiResponseBookly<any>> {
    const query = new GetResourceAvailabilityQuery(
      resourceId,
      new Date(startDate),
      new Date(endDate),
      includeReservations === "true",
      includeScheduleRestrictions === "true"
    );

    const result = await this.queryBus.execute(query);
    return ResponseUtil.success(
      result,
      "Calendar availability retrieved successfully"
    );
  }

  @Post(AVAILABILITY_URLS.AVAILABILITY_CHECK)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: "Check availability for specific time slot (RF-10)",
    description:
      "Validates if a specific time slot is available for reservation",
  })
  @ApiResponse({
    status: 200,
    description: "Availability checked successfully",
  })
  @ApiResponse({ status: 400, description: "Invalid input data" })
  async checkAvailability(@Body() availabilityQuery: AvailabilityQueryDto): Promise<ApiResponseBookly<any>> {
    const query = new CheckAvailabilityQuery(
      availabilityQuery.resourceId!,
      new Date(availabilityQuery.startDate),
      new Date(availabilityQuery.endDate)
    );

    const result = await this.queryBus.execute(query);
    return ResponseUtil.success(result, "Availability checked successfully");
  }

  // ========================================
  // Reservation Management
  // ========================================

  @Post(AVAILABILITY_URLS.RESERVATIONS)
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: "Create new reservation",
    description:
      "Creates a new reservation with comprehensive validation against availability and restrictions",
  })
  @ApiResponse({ status: 201, description: "Reservation created successfully" })
  @ApiResponse({ status: 400, description: "Invalid input data" })
  @ApiResponse({
    status: 409,
    description: "Reservation conflicts with existing reservations",
  })
  @ApiResponse({
    status: 403,
    description: "Reservation violates schedule restrictions",
  })
  async createReservation(
    @Body() createReservationDto: CreateReservationDto,
    @CurrentUser() currentUser: UserEntity
  ): Promise<ApiResponseBookly<any>> {
    const command = new CreateReservationCommand(
      createReservationDto.title,
      createReservationDto.description,
      new Date(createReservationDto.startDate),
      new Date(createReservationDto.endDate),
      createReservationDto.resourceId,
      createReservationDto.userId || currentUser.id,
      currentUser.id, // createdBy
      createReservationDto.isRecurring,
      createReservationDto.recurrence
    );

    const result = await this.commandBus.execute(command);
    return ResponseUtil.success(result, "Reservation created successfully");
  }

  // ========================================
  // RF-11: Reservation History
  // ========================================

  @Get(AVAILABILITY_URLS.HISTORY)
  @ApiOperation({
    summary: "Get reservation history (RF-11)",
    description:
      "Retrieves reservation history with filtering and pagination for audit purposes",
  })
  @ApiQuery({
    name: "reservationId",
    required: false,
    description: "Filter by reservation ID",
  })
  @ApiQuery({
    name: "userId",
    required: false,
    description: "Filter by user ID",
  })
  @ApiQuery({
    name: "resourceId",
    required: false,
    description: "Filter by resource ID",
  })
  @ApiQuery({
    name: "action",
    required: false,
    description: "Filter by action type",
  })
  @ApiQuery({
    name: "startDate",
    required: false,
    description: "Filter from date (ISO format)",
  })
  @ApiQuery({
    name: "endDate",
    required: false,
    description: "Filter to date (ISO format)",
  })
  @ApiQuery({
    name: "page",
    required: false,
    description: "Page number for pagination",
  })
  @ApiQuery({ name: "limit", required: false, description: "Items per page" })
  @ApiResponse({
    status: 200,
    description: "Reservation history retrieved successfully",
  })
  async getReservationHistory(
    @Query() queryParams: ReservationHistoryQueryDto
  ): Promise<ApiResponseBookly<any>> {
    const query = new GetReservationHistoryQuery(
      queryParams.reservationId,
      queryParams.userId,
      queryParams.resourceId,
      queryParams.action,
      queryParams.startDate ? new Date(queryParams.startDate) : undefined,
      queryParams.endDate ? new Date(queryParams.endDate) : undefined,
      queryParams.page,
      queryParams.limit
    );

    return await this.queryBus.execute(query);
  }

  // ========================================
  // RF-08: Calendar Integration Endpoints
  // ========================================

  @Post(AVAILABILITY_URLS.CALENDAR_INTEGRATION_CREATE)
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: "Create calendar integration (RF-08)",
    description:
      "Create integration with external calendar providers (Google, Outlook, iCal, Internal)",
  })
  @ApiResponse({
    status: 201,
    description: "Calendar integration created successfully",
  })
  @ApiResponse({
    status: 400,
    description: "Invalid credentials or configuration",
  })
  @ApiResponse({
    status: 409,
    description: "Integration already exists for this resource and provider",
  })
  async createCalendarIntegration(
    @Body() createCalendarIntegrationDto: CreateCalendarIntegrationDto,
    @CurrentUser() currentUser: UserEntity
  ): Promise<ApiResponseBookly<any>> {
    const command = new CreateCalendarIntegrationCommand(
      createCalendarIntegrationDto.resourceId,
      createCalendarIntegrationDto.provider,
      createCalendarIntegrationDto.name,
      createCalendarIntegrationDto.credentials,
      createCalendarIntegrationDto.calendarId,
      createCalendarIntegrationDto.syncInterval,
      createCalendarIntegrationDto.isActive,
      currentUser.id
    );
    const result = await this.commandBus.execute(command);
    return ResponseUtil.success(
      result,
      "Calendar integration created successfully"
    );
  }

  @Get(AVAILABILITY_URLS.CALENDAR_INTEGRATIONS)
  @ApiOperation({
    summary: "Get calendar integrations (RF-08)",
    description: "Retrieve calendar integrations with optional filters",
  })
  @ApiQuery({
    name: "resourceId",
    required: false,
    description: "Filter by resource ID",
  })
  @ApiQuery({
    name: "provider",
    required: false,
    description: "Filter by calendar provider",
  })
  @ApiQuery({
    name: "isActive",
    required: false,
    description: "Filter by active status",
  })
  @ApiResponse({
    status: 200,
    description: "Calendar integrations retrieved successfully",
  })
  async getCalendarIntegrations(
    @Query("resourceId") resourceId?: string,
    @Query("provider") provider?: string,
    @Query("isActive") isActive?: boolean
  ): Promise<ApiResponseBookly<any>> {
    const query = new GetCalendarIntegrationsQuery(
      resourceId,
      provider,
      isActive
    );
    const result = await this.queryBus.execute(query);
    return ResponseUtil.success(
      result,
      "Calendar integrations retrieved successfully"
    );
  }

  @Post(AVAILABILITY_URLS.CALENDAR_SYNC)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: "Sync calendar integration (RF-08)",
    description:
      "Manually trigger synchronization of events from external calendar",
  })
  @ApiParam({ name: "integrationId", description: "Calendar integration ID" })
  @ApiResponse({
    status: 200,
    description: "Calendar synchronization completed successfully",
  })
  @ApiResponse({ status: 404, description: "Calendar integration not found" })
  async syncCalendarIntegration(@Param("integrationId") integrationId: string) {
    const command = new SyncCalendarCommand(integrationId);
    return await this.commandBus.execute(command);
  }

  @Get(AVAILABILITY_URLS.AVAILABILITY_WITH_CONFLICTS)
  @ApiOperation({
    summary: "Get availability with calendar conflicts (RF-08)",
    description:
      "Check resource availability considering external calendar conflicts",
  })
  @ApiQuery({
    name: "resourceId",
    required: true,
    description: "Resource ID to check availability for",
  })
  @ApiQuery({
    name: "startDate",
    required: true,
    description: "Start date (ISO format)",
  })
  @ApiQuery({
    name: "endDate",
    required: true,
    description: "End date (ISO format)",
  })
  @ApiQuery({
    name: "includeConflicts",
    required: false,
    description: "Include external calendar conflicts",
  })
  @ApiResponse({
    status: 200,
    description: "Availability with conflicts retrieved successfully",
  })
  async getAvailabilityWithConflicts(
    @Query("resourceId") resourceId: string,
    @Query("startDate") startDate: string,
    @Query("endDate") endDate: string,
    @Query("includeConflicts") includeConflicts: boolean = true
  ): Promise<ApiResponseBookly<any>> {
    const query = new GetAvailabilityWithConflictsQuery(
      resourceId,
      new Date(startDate),
      new Date(endDate),
      includeConflicts
    );
    const result = await this.queryBus.execute(query);
    return ResponseUtil.success(
      result,
      "Availability with conflicts retrieved successfully"
    );
  }

  // ========================================
  // RF-10: Calendar View Endpoints
  // ========================================

  @Get(AVAILABILITY_URLS.CALENDAR_VIEW)
  @ApiOperation({
    summary: "Get calendar view with events (RF-10)",
    description:
      "Get calendar view showing reservations, schedules, availability, and external events",
  })
  @ApiQuery({
    name: "resourceId",
    required: false,
    description: "Resource ID to show calendar for",
  })
  @ApiQuery({
    name: "startDate",
    required: true,
    description: "Start date (ISO format)",
  })
  @ApiQuery({
    name: "endDate",
    required: true,
    description: "End date (ISO format)",
  })
  @ApiQuery({
    name: "viewType",
    required: false,
    enum: CalendarViewType,
    description: "Calendar view type",
  })
  @ApiQuery({
    name: "eventTypes",
    required: false,
    isArray: true,
    enum: EventType,
    description: "Event types to include",
  })
  @ApiQuery({
    name: "includeAvailability",
    required: false,
    description: "Include availability slots",
  })
  @ApiQuery({
    name: "includeExternalEvents",
    required: false,
    description: "Include external calendar events",
  })
  @ApiQuery({
    name: "userId",
    required: false,
    description: "User ID for personalized view",
  })
  @ApiResponse({
    status: 200,
    description: "Calendar view retrieved successfully",
  })
  async getCalendarView(
    @Query("resourceId") resourceId?: string,
    @Query("startDate") startDate?: string,
    @Query("endDate") endDate?: string,
    @Query("viewType") viewType?: CalendarViewType,
    @Query("eventTypes") eventTypes?: EventType[],
    @Query("includeAvailability") includeAvailability?: boolean,
    @Query("includeExternalEvents") includeExternalEvents?: boolean,
    @Query("userId") userId?: string
  ): Promise<ApiResponseBookly<any>> {
    if (!startDate || !endDate) {
      throw new Error("startDate and endDate are required");
    }

    const query = new GetCalendarViewQuery(
      new Date(startDate),
      new Date(endDate),
      resourceId,
      viewType || CalendarViewType.MONTH,
      eventTypes,
      includeAvailability !== false, // Default to true
      includeExternalEvents !== false, // Default to true
      userId
    );
    const result = await this.queryBus.execute(query);
    return ResponseUtil.success(result, "Calendar view retrieved successfully");
  }

  // ========================================
  // RF-11: Reservation History Endpoints
  // ========================================

  @Post(AVAILABILITY_URLS.RESERVATION_HISTORY)
  @ApiOperation({
    summary: "Create reservation history entry (RF-11)",
    description: "Create a new history entry for audit trail",
  })
  @ApiBody({ type: CreateReservationHistoryDto })
  @ApiResponse({
    status: 201,
    description: "History entry created successfully",
  })
  async createReservationHistory(
    @Body() createHistoryDto: CreateReservationHistoryDto,
    @CurrentUser() currentUser: UserEntity
  ): Promise<ApiResponseBookly<any>> {
    const command = new CreateReservationHistoryCommand(
      createHistoryDto.reservationId,
      currentUser.id,
      createHistoryDto.action,
      createHistoryDto.source,
      createHistoryDto.previousData,
      createHistoryDto.newData,
      createHistoryDto.details,
      createHistoryDto.ipAddress,
      createHistoryDto.userAgent
    );
    const result = await this.commandBus.execute(command);
    return ResponseUtil.success(result, "History entry created successfully");
  }

  @Get(AVAILABILITY_URLS.RESERVATION_HISTORY_DETAILED)
  @ApiOperation({
    summary: "Get detailed reservation history (RF-11)",
    description:
      "Get comprehensive audit trail with advanced filtering and analytics",
  })
  @ApiQuery({
    name: "reservationId",
    required: false,
    description: "Filter by reservation ID",
  })
  @ApiQuery({
    name: "userId",
    required: false,
    description: "Filter by user ID",
  })
  @ApiQuery({
    name: "resourceId",
    required: false,
    description: "Filter by resource ID",
  })
  @ApiQuery({
    name: "actions",
    required: false,
    isArray: true,
    enum: HistoryAction,
    description: "Filter by actions",
  })
  @ApiQuery({
    name: "sources",
    required: false,
    isArray: true,
    enum: HistorySource,
    description: "Filter by sources",
  })
  @ApiQuery({
    name: "startDate",
    required: false,
    description: "Start date filter (ISO format)",
  })
  @ApiQuery({
    name: "endDate",
    required: false,
    description: "End date filter (ISO format)",
  })
  @ApiQuery({
    name: "page",
    required: false,
    description: "Page number for pagination",
  })
  @ApiQuery({ name: "limit", required: false, description: "Items per page" })
  @ApiQuery({ name: "sortBy", required: false, description: "Sort field" })
  @ApiQuery({
    name: "sortOrder",
    required: false,
    enum: ["asc", "desc"],
    description: "Sort order",
  })
  @ApiQuery({
    name: "includeReservationData",
    required: false,
    description: "Include reservation details",
  })
  @ApiQuery({
    name: "includeUserData",
    required: false,
    description: "Include user information",
  })
  @ApiResponse({
    status: 200,
    description: "Detailed history retrieved successfully",
    type: ReservationHistoryResponseDto,
  })
  async getDetailedReservationHistory(
    @Query() queryDto: ReservationHistoryDetailedQueryDto
  ): Promise<ApiResponseBookly<any>> {
    const query = new GetReservationHistoryDetailedQuery(
      queryDto.reservationId,
      queryDto.userId,
      queryDto.resourceId,
      queryDto.actions,
      queryDto.sources,
      queryDto.startDate ? new Date(queryDto.startDate) : undefined,
      queryDto.endDate ? new Date(queryDto.endDate) : undefined,
      queryDto.page || 1,
      queryDto.limit || 20,
      queryDto.sortBy || "createdAt",
      queryDto.sortOrder || "desc",
      queryDto.includeReservationData || false,
      queryDto.includeUserData || false
    );
    const result = await this.queryBus.execute(query);
    return ResponseUtil.success(
      result,
      "Detailed history retrieved successfully"
    );
  }

  @Get(AVAILABILITY_URLS.RESERVATION_HISTORY_EXPORT)
  @ApiOperation({
    summary: "Export reservation history to CSV (RF-11)",
    description: "Export filtered history data in CSV format for analysis",
  })
  @ApiQuery({
    name: "reservationId",
    required: false,
    description: "Filter by reservation ID",
  })
  @ApiQuery({
    name: "userId",
    required: false,
    description: "Filter by user ID",
  })
  @ApiQuery({
    name: "resourceId",
    required: false,
    description: "Filter by resource ID",
  })
  @ApiQuery({
    name: "startDate",
    required: false,
    description: "Start date filter (ISO format)",
  })
  @ApiQuery({
    name: "endDate",
    required: false,
    description: "End date filter (ISO format)",
  })
  @ApiResponse({
    status: 200,
    description: "CSV export generated successfully",
  })
  async exportReservationHistory(
    @Query("reservationId") reservationId?: string,
    @Query("userId") userId?: string,
    @Query("resourceId") resourceId?: string,
    @Query("startDate") startDate?: string,
    @Query("endDate") endDate?: string,
    @Res() res?: any
  ) {
    // Create query for CSV export using CQRS pattern
    const query = new GetReservationHistoryDetailedQuery(
      reservationId,
      userId,
      resourceId,
      undefined, // actions
      undefined, // sources
      startDate ? new Date(startDate) : undefined,
      endDate ? new Date(endDate) : undefined,
      1, // page
      10000, // limit - large number for export
      "createdAt",
      "desc",
      true, // includeReservationData
      true // includeUserData
    );

    const result = await this.queryBus.execute(query);

    // Convert to CSV format
    const csvContent = this.convertToCsv(result.entries);

    res.setHeader("Content-Type", "text/csv");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename="reservation-history-${new Date().toISOString().split("T")[0]}.csv"`
    );
    res.send(csvContent);
  }

  /**
   * Converts history entries to CSV format
   * @private
   */
  private convertToCsv(entries: any[]): string {
    if (!entries || entries.length === 0) {
      return "No data available";
    }

    // CSV Headers
    const headers = [
      "ID",
      "Reservation ID",
      "User ID",
      "Action",
      "Source",
      "Date",
      "Details",
      "IP Address",
      "Has Data Changes",
    ];

    // Convert entries to CSV rows
    const rows = entries.map((entry) => [
      entry.id || "",
      entry.reservationId || "",
      entry.userId || "",
      entry.action || "",
      entry.source || "",
      entry.createdAt ? new Date(entry.createdAt).toISOString() : "",
      entry.details || "",
      entry.ipAddress || "",
      entry.hasDataChanges ? "Yes" : "No",
    ]);

    // Combine headers and rows
    const csvRows = [headers, ...rows];

    // Convert to CSV string
    return csvRows
      .map((row) =>
        row.map((field) => `"${String(field).replace(/"/g, '""')}"`).join(",")
      )
      .join("\n");
  }
}
