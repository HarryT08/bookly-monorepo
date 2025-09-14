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
import { ResponseUtil } from '@libs/common/utils/response.util';
import { ApiResponse as StandardApiResponse } from '@libs/dto/common/response.dto';
import { 
  ApiTags, 
  ApiOperation, 
  ApiResponse, 
  ApiParam, 
  ApiQuery,
  ApiBearerAuth
} from '@nestjs/swagger';
import { JwtAuthGuard } from '@apps/auth-service/infrastructure/guards/jwt-auth.guard';
import { AuthGuard } from '@nestjs/passport';
import { SetMetadata, Injectable, CanActivate } from '@nestjs/common';
import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';

// Temporary decorators and guards until shared library is created
export const Roles = (...roles: string[]) => SetMetadata('roles', roles);
export const CurrentUser = createParamDecorator(
  (data: unknown, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    return request.user;
  },
);

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<string[]>('roles', [
      context.getHandler(),
      context.getClass(),
    ]);
    if (!requiredRoles) {
      return true;
    }
    const { user } = context.switchToHttp().getRequest();
    return requiredRoles.some((role) => user.roles?.includes(role));
  }
}
import { ApprovalFlowService } from '@apps/stockpile-service/application/services/approval-flow.service';
import {
  CreateApprovalFlowDto,
  UpdateApprovalFlowDto,
  CreateApprovalLevelDto,
  ProcessApprovalRequestDto,
  ApprovalFlowDto,
  ApprovalLevelDto,
  ApprovalRequestDto
} from '@dto/stockpile/approval-flow.dto';
import { STOCKPILE_URLS } from '@apps/stockpile-service/utils/maps/urls.map';

@ApiTags('Approval Flow')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller(STOCKPILE_URLS.APPROVAL_FLOWS)
export class ApprovalFlowController {
  constructor(private readonly approvalFlowService: ApprovalFlowService) {}

  @Post(STOCKPILE_URLS.APPROVAL_FLOW_CREATE)
  @Roles('COORDINATOR', 'ADMIN')
  @ApiOperation({ summary: 'Create approval flow' })
  @ApiResponse({ status: HttpStatus.CREATED, description: 'Approval flow created successfully', type: ApprovalFlowDto })
  @ApiResponse({ status: HttpStatus.FORBIDDEN, description: 'Insufficient permissions' })
  async createApprovalFlow(
    @Body() dto: CreateApprovalFlowDto,
    @CurrentUser() user: any
  ): Promise<StandardApiResponse<ApprovalFlowDto>> {
    dto.createdBy = user.id;
    const result = await this.approvalFlowService.createApprovalFlow(dto);
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
  ): Promise<StandardApiResponse<ApprovalFlowDto>> {
    const result = await this.approvalFlowService.updateApprovalFlow(id, dto);
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
  ): Promise<StandardApiResponse<ApprovalFlowDto[]>> {
    const result = await this.approvalFlowService.getApprovalFlows({
      programId,
      resourceType,
      categoryId,
      isActive
    });
    return ResponseUtil.list(result, 'Approval flows retrieved successfully');
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get approval flow by ID' })
  @ApiParam({ name: 'id', description: 'Approval flow ID' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Approval flow retrieved successfully', type: ApprovalFlowDto })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Approval flow not found' })
  async getApprovalFlowById(@Param('id') id: string): Promise<StandardApiResponse<ApprovalFlowDto | null>> {
    const result = await this.approvalFlowService.getApprovalFlowById(id);
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
  ): Promise<ApprovalFlowDto | null> {
    return await this.approvalFlowService.getDefaultApprovalFlow(programId, resourceType, categoryId);
  }

  @Post(STOCKPILE_URLS.APPROVAL_FLOW_LEVELS)
  @Roles('COORDINATOR', 'ADMIN')
  @ApiOperation({ summary: 'Create approval level' })
  @ApiParam({ name: 'id', description: 'Approval flow ID' })
  @ApiResponse({ status: HttpStatus.CREATED, description: 'Approval level created successfully', type: ApprovalLevelDto })
  async createApprovalLevel(
    @Param('id') flowId: string,
    @Body() dto: CreateApprovalLevelDto
  ): Promise<ApprovalLevelDto> {
    dto.flowId = flowId;
    return await this.approvalFlowService.createApprovalLevel(dto);
  }

  @Get(STOCKPILE_URLS.APPROVAL_FLOW_LEVELS)
  @ApiOperation({ summary: 'Get approval levels by flow ID' })
  @ApiParam({ name: 'id', description: 'Approval flow ID' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Approval levels retrieved successfully', type: [ApprovalLevelDto] })
  async getApprovalLevelsByFlowId(@Param('id') flowId: string): Promise<ApprovalLevelDto[]> {
    return await this.approvalFlowService.getApprovalLevelsByFlowId(flowId);
  }

  @Post(STOCKPILE_URLS.APPROVAL_FLOW_SUBMIT)
  @ApiOperation({ summary: 'Submit reservation for approval' })
  @ApiParam({ name: 'reservationId', description: 'Reservation ID' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Reservation submitted for approval successfully' })
  async submitReservationForApproval(
    @Param('reservationId') reservationId: string,
    @Body() body: { resourceId: string; resourceType?: string; categoryId?: string; programId?: string },
    @CurrentUser() user: any
  ): Promise<void> {
    return await this.approvalFlowService.submitReservationForApproval({
      reservationId,
      userId: user.id,
      resourceId: body.resourceId,
      resourceType: body.resourceType,
      categoryId: body.categoryId,
      programId: body.programId
    });
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
  ): Promise<StandardApiResponse<ApprovalRequestDto[]>> {
    const result = await this.approvalFlowService.getPendingApprovalRequests({
      approverId,
      programId,
      resourceType,
      categoryId,
      page,
      limit
    });
    return ResponseUtil.paginated(result.requests, result.total, page, limit, 'Pending approval requests retrieved successfully');
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
  ): Promise<void> {
    dto.approverId = user.id;
    return await this.approvalFlowService.processApprovalRequest(requestId, dto);
  }

  @Get(STOCKPILE_URLS.APPROVAL_FLOW_REQUESTS_BY_RESERVATION)
  @ApiOperation({ summary: 'Get approval requests by reservation' })
  @ApiParam({ name: 'reservationId', description: 'Reservation ID' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Approval requests retrieved successfully', type: [ApprovalRequestDto] })
  async getApprovalRequestsByReservation(
    @Param('reservationId') reservationId: string
  ): Promise<ApprovalRequestDto[]> {
    return await this.approvalFlowService.getApprovalRequestsByReservation(reservationId);
  }

  @Get(STOCKPILE_URLS.APPROVAL_FLOW_REQUESTS_STATUS)
  @ApiOperation({ summary: 'Get reservation approval status' })
  @ApiParam({ name: 'reservationId', description: 'Reservation ID' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Reservation status retrieved successfully' })
  async getReservationStatus(@Param('reservationId') reservationId: string): Promise<{
    reservationId: string;
    status: string;
    currentLevel?: number;
    pendingRequests: ApprovalRequestDto[];
    completedRequests: ApprovalRequestDto[];
  }> {
    return await this.approvalFlowService.getReservationStatus(reservationId);
  }

  @Post(STOCKPILE_URLS.APPROVAL_FLOW_REQUESTS_CANCEL)
  @ApiOperation({ summary: 'Cancel reservation' })
  @ApiParam({ name: 'reservationId', description: 'Reservation ID' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Reservation cancelled successfully' })
  async cancelReservation(
    @Param('reservationId') reservationId: string,
    @Body() body: { reason?: string },
    @CurrentUser() user: any
  ): Promise<void> {
    return await this.approvalFlowService.cancelReservation({
      reservationId,
      userId: user.id,
      reason: body.reason
    });
  }
}
