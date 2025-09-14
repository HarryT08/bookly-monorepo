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
  HttpStatus
} from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { ResponseUtil } from '@libs/common/utils/response.util';
import { PaginatedResponseDto, SuccessResponseDto } from '@libs/dto/common/response.dto';
import { 
  ApiTags, 
  ApiOperation, 
  ApiResponse, 
  ApiParam, 
  ApiQuery,
  ApiBody 
} from '@nestjs/swagger';
import { STOCKPILE_URLS } from '@apps/stockpile-service/utils/maps/urls.map';
import { CurrentUser } from '@libs/common/decorators/current-user.decorator';
import { Roles } from '@libs/common/decorators/roles.decorator';
import { JwtAuthGuard } from '@libs/common/guards/jwt-auth.guard';
import { RolesGuard } from '@libs/common/guards/roles.guard';

// Import Commands
import {
  CreateApprovalFlowCommand,
  UpdateApprovalFlowCommand,
  CreateApprovalLevelCommand,
  SubmitReservationForApprovalCommand,
  ProcessApprovalRequestCommand,
  CancelReservationCommand
} from '@apps/stockpile-service/application/commands/approval-flow.commands';

// Import Queries
import {
  GetApprovalFlowsQuery,
  GetApprovalFlowByIdQuery,
  GetDefaultApprovalFlowQuery,
  GetApprovalLevelsByFlowIdQuery,
  GetPendingApprovalRequestsQuery,
  GetApprovalRequestsByReservationQuery,
  GetReservationStatusQuery
} from '@apps/stockpile-service/application/queries/approval-flow.queries';

// Import DTOs
import {
  ApprovalFlowDto,
  CreateApprovalFlowDto,
  UpdateApprovalFlowDto,
  ApprovalLevelDto,
  CreateApprovalLevelDto,
  ApprovalRequestDto,
  SubmitReservationForApprovalDto,
  ProcessApprovalRequestDto
} from '@libs/dto';

@ApiTags('Approval Flow Management')
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller(STOCKPILE_URLS.APPROVAL_FLOWS)
export class ApprovalFlowController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus
  ) {}

  @Post(STOCKPILE_URLS.APPROVAL_FLOW_CREATE)
  @Roles('COORDINATOR', 'ADMIN')
  @ApiOperation({ summary: 'Create approval flow' })
  @ApiResponse({ status: HttpStatus.CREATED, description: 'Approval flow created successfully', type: ApprovalFlowDto })
  @ApiResponse({ status: HttpStatus.FORBIDDEN, description: 'Insufficient permissions' })
  async createApprovalFlow(
    @Body() dto: CreateApprovalFlowDto,
    @CurrentUser() user: any
  ) {
    const command = new CreateApprovalFlowCommand(
      dto.name,
      dto.description,
      dto.programId,
      dto.resourceType,
      dto.categoryId,
      false, // isDefault
      true,  // requiresAllApprovals
      false, // autoApprovalEnabled
      user.id
    );
    const result = await this.commandBus.execute(command);
    return ResponseUtil.success(result, 'Approval flow created successfully');
  }

  @Put(STOCKPILE_URLS.APPROVAL_FLOW_UPDATE)
  @Roles('COORDINATOR', 'ADMIN')
  @ApiOperation({ summary: 'Update approval flow' })
  @ApiParam({ name: 'id', description: 'Approval flow ID' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Approval flow updated successfully', type: ApprovalFlowDto })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Approval flow not found' })
  async updateApprovalFlow(
    @Param('id') id: string,
    @Body() dto: UpdateApprovalFlowDto
  ) {
    const command = new UpdateApprovalFlowCommand(
      id,
      dto.name,
      dto.description
    );
    const result = await this.commandBus.execute(command);
    return ResponseUtil.success(result, 'Approval flow updated successfully');
  }

  @Get(STOCKPILE_URLS.APPROVAL_FLOWS)
  @ApiOperation({ summary: 'Get approval flows' })
  @ApiQuery({ name: 'programId', required: false, description: 'Filter by program ID' })
  @ApiQuery({ name: 'resourceType', required: false, description: 'Filter by resource type' })
  @ApiQuery({ name: 'categoryId', required: false, description: 'Filter by category ID' })
  @ApiQuery({ name: 'isActive', required: false, description: 'Filter by active status' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Approval flows retrieved successfully', type: [ApprovalFlowDto] })
  async getApprovalFlows(
    @Query('programId') programId?: string,
    @Query('resourceType') resourceType?: string,
    @Query('categoryId') categoryId?: string,
    @Query('isActive') isActive?: boolean
  ) {
    const query = new GetApprovalFlowsQuery(
      programId,
      resourceType,
      categoryId,
      isActive
    );
    const result = await this.queryBus.execute(query);
    return ResponseUtil.success(result, 'Approval flows retrieved successfully');
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get approval flow by ID' })
  @ApiParam({ name: 'id', description: 'Approval flow ID' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Approval flow retrieved successfully', type: ApprovalFlowDto })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Approval flow not found' })
  async getApprovalFlowById(@Param('id') id: string) {
    const query = new GetApprovalFlowByIdQuery(id);
    const result = await this.queryBus.execute(query);
    return ResponseUtil.success(result, 'Approval flow retrieved successfully');
  }

  @Get(STOCKPILE_URLS.APPROVAL_FLOW_DEFAULT_SEARCH)
  @ApiOperation({ summary: 'Get default approval flow for scope' })
  @ApiQuery({ name: 'programId', required: false, description: 'Program ID' })
  @ApiQuery({ name: 'resourceType', required: false, description: 'Resource type' })
  @ApiQuery({ name: 'categoryId', required: false, description: 'Category ID' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Default approval flow retrieved successfully', type: ApprovalFlowDto })
  async getDefaultApprovalFlow(
    @Query('programId') programId?: string,
    @Query('resourceType') resourceType?: string,
    @Query('categoryId') categoryId?: string
  ) {
    const query = new GetDefaultApprovalFlowQuery(
      programId,
      resourceType,
      categoryId
    );
    const result = await this.queryBus.execute(query);
    return ResponseUtil.success(result, 'Default approval flow retrieved successfully');
  }

  @Post(STOCKPILE_URLS.APPROVAL_FLOW_LEVELS)
  @Roles('COORDINATOR', 'ADMIN')
  @ApiOperation({ summary: 'Create approval level' })
  @ApiParam({ name: 'id', description: 'Approval flow ID' })
  @ApiResponse({ status: HttpStatus.CREATED, description: 'Approval level created successfully', type: ApprovalLevelDto })
  async createApprovalLevel(
    @Param('id') flowId: string,
    @Body() dto: CreateApprovalLevelDto
  ) {
    const command = new CreateApprovalLevelCommand(
      flowId,
      dto.level,
      dto.name || `Level ${dto.level}`,
      dto.description,
      [], // approverRoles
      [], // approverUsers
      false // requiresAll
    );
    const result = await this.commandBus.execute(command);
    return ResponseUtil.success(result, 'Approval level created successfully');
  }

  @Get(STOCKPILE_URLS.APPROVAL_FLOW_LEVELS)
  @ApiOperation({ summary: 'Get approval levels by flow ID' })
  @ApiParam({ name: 'id', description: 'Approval flow ID' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Approval levels retrieved successfully', type: [ApprovalLevelDto] })
  async getApprovalLevelsByFlowId(@Param('id') flowId: string) {
    const query = new GetApprovalLevelsByFlowIdQuery(flowId);
    const result = await this.queryBus.execute(query);
    return ResponseUtil.success(result, 'Approval levels retrieved successfully');
  }

  @Post(STOCKPILE_URLS.APPROVAL_FLOW_SUBMIT)
  @ApiOperation({ summary: 'Submit reservation for approval' })
  @ApiParam({ name: 'reservationId', description: 'Reservation ID' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Reservation submitted for approval successfully' })
  async submitReservationForApproval(
    @Param('reservationId') reservationId: string,
    @Body() body: { resourceId: string; resourceType?: string; categoryId?: string; programId?: string },
    @CurrentUser() user: any
  ) {
    const command = new SubmitReservationForApprovalCommand(
      reservationId,
      user.id,
      body.resourceId,
      body.resourceType,
      body.categoryId,
      body.programId
    );
    const result = await this.commandBus.execute(command);
    return ResponseUtil.success(result, 'Reservation submitted for approval successfully');
  }

  @Get(STOCKPILE_URLS.APPROVAL_FLOW_REQUESTS_PENDING)
  @ApiOperation({ summary: 'Get pending approval requests' })
  @ApiQuery({ name: 'approverId', required: false, description: 'Filter by approver ID' })
  @ApiQuery({ name: 'programId', required: false, description: 'Filter by program ID' })
  @ApiQuery({ name: 'resourceType', required: false, description: 'Filter by resource type' })
  @ApiQuery({ name: 'categoryId', required: false, description: 'Filter by category ID' })
  @ApiQuery({ name: 'page', required: false, description: 'Page number', type: Number })
  @ApiQuery({ name: 'limit', required: false, description: 'Items per page', type: Number })
  @ApiResponse({ status: HttpStatus.OK, description: 'Pending approval requests retrieved successfully' })
  async getPendingApprovalRequests(
    @Query('approverId') approverId?: string,
    @Query('programId') programId?: string,
    @Query('resourceType') resourceType?: string,
    @Query('categoryId') categoryId?: string,
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 10
  ) {
    const query = new GetPendingApprovalRequestsQuery(
      approverId,
      programId,
      resourceType,
      categoryId,
      page,
      limit
    );
    const result = await this.queryBus.execute(query);
    return ResponseUtil.fromServiceResponse({
      items: Array.isArray(result) ? result : (result as any)?.requests || (result as any)?.data || [],
      total: Array.isArray(result) ? result.length : (result as any)?.total || 0,
      page,
      limit,
      message: 'Pending approval requests retrieved successfully'
    });
  }

  @Post(STOCKPILE_URLS.APPROVAL_FLOW_REQUESTS_PROCESS)
  @Roles('APPROVER', 'COORDINATOR', 'ADMIN')
  @ApiOperation({ summary: 'Process approval request' })
  @ApiParam({ name: 'requestId', description: 'Approval request ID' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Approval request processed successfully' })
  async processApprovalRequest(
    @Param('requestId') requestId: string,
    @Body() dto: ProcessApprovalRequestDto,
    @CurrentUser() user: any
  ) {
    const command = new ProcessApprovalRequestCommand(
      requestId,
      user.id,
      dto.action,
      dto.comments
    );
    const result = await this.commandBus.execute(command);
    return ResponseUtil.success(result, 'Approval request processed successfully');
  }

  @Get(STOCKPILE_URLS.APPROVAL_FLOW_REQUESTS_BY_RESERVATION)
  @ApiOperation({ summary: 'Get approval requests by reservation' })
  @ApiParam({ name: 'reservationId', description: 'Reservation ID' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Approval requests retrieved successfully', type: [ApprovalRequestDto] })
  async getApprovalRequestsByReservation(
    @Param('reservationId') reservationId: string
  ) {
    const query = new GetApprovalRequestsByReservationQuery(reservationId);
    const result = await this.queryBus.execute(query);
    return ResponseUtil.success(result, 'Approval requests retrieved successfully');
  }

  @Get(STOCKPILE_URLS.APPROVAL_FLOW_REQUESTS_STATUS)
  @ApiOperation({ summary: 'Get reservation approval status' })
  @ApiParam({ name: 'reservationId', description: 'Reservation ID' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Reservation status retrieved successfully' })
  async getReservationStatus(@Param('reservationId') reservationId: string) {
    const query = new GetReservationStatusQuery(reservationId);
    const result = await this.queryBus.execute(query);
    return ResponseUtil.success(result, 'Reservation status retrieved successfully');
  }

  @Post(STOCKPILE_URLS.APPROVAL_FLOW_REQUESTS_CANCEL)
  @ApiOperation({ summary: 'Cancel reservation' })
  @ApiParam({ name: 'reservationId', description: 'Reservation ID' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Reservation cancelled successfully' })
  async cancelReservation(
    @Param('reservationId') reservationId: string,
    @Body() body: { reason?: string },
    @CurrentUser() user: any
  ) {
    const command = new CancelReservationCommand(reservationId, user.id, body.reason);
    const result = await this.commandBus.execute(command);
    return ResponseUtil.success(result, 'Reservation cancelled successfully');
  }
}
