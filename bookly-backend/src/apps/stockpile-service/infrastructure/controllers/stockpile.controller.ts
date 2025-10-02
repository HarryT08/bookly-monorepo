import { Controller, Get, Post, Put, Param, Body, Query, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiParam, ApiQuery, ApiBody, ApiResponse } from '@nestjs/swagger';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { CurrentUser } from '@libs/common/decorators/current-user.decorator';
import { UserEntity } from '@apps/auth-service/domain/entities/user.entity';
import { STOCKPILE_URLS } from '@apps/stockpile-service/utils/maps/urls.map';
import { PaginatedResponseDto, SuccessResponseDto } from '@libs/dto/common/response.dto';
import { ResponseUtil } from '@libs/common/utils/response.util';

// Import Commands
import { ApproveRequestCommand } from '@apps/stockpile-service/application/commands/approve-request.command';
import { RejectRequestCommand } from '@apps/stockpile-service/application/commands/reject-request.command';
import { GenerateDocumentCommand } from '@apps/stockpile-service/application/commands/generate-document.command';
import { SendNotificationCommand } from '@apps/stockpile-service/application/commands/send-notification.command';
import { CheckInCommand } from '@apps/stockpile-service/application/commands/check-in.command';
import { CheckOutCommand } from '@apps/stockpile-service/application/commands/check-out.command';

// Import Queries
import { GetApprovalsQuery } from '@apps/stockpile-service/application/queries/get-approvals.query';
import { GetApprovalByIdQuery } from '@apps/stockpile-service/application/queries/get-approval-by-id.query';
import { GetApprovalFlowsQuery } from '@apps/stockpile-service/application/queries/get-approval-flows.query';
import { GetCheckInStatusQuery } from '@apps/stockpile-service/application/queries/get-checkin-status.query';

/**
 * Stockpile Controller
 * 
 * Implements CQRS pattern for all approval workflow and validation operations.
 * Follows Clean Architecture principles with CommandBus and QueryBus separation.
 * 
 * Coverage:
 * - RF-20: Request validation and approval workflows
 * - RF-21: Document generation (PDFs, letters)
 * - RF-22: Automated notifications
 * - RF-23: Security and access control
 * - RF-24: Configurable approval flows
 * - RF-25: Audit trail and traceability
 * - RF-26: Check-in/check-out digital workflows
 * - RF-27: Multi-channel messaging integration
 */
@ApiTags('Stockpile')
@Controller(STOCKPILE_URLS.BASE)
export class StockpileController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
  ) {}

  @Get(STOCKPILE_URLS.APPROVAL_REQUESTS)
  @ApiOperation({ 
    summary: 'Get all approval requests (RF-20, RF-25)',
    description: 'Retrieve approval requests with filtering and pagination for audit purposes'
  })
  @ApiQuery({ name: 'status', required: false, description: 'Filter by approval status' })
  @ApiQuery({ name: 'requesterId', required: false, description: 'Filter by requester ID' })
  @ApiQuery({ name: 'approverId', required: false, description: 'Filter by approver ID' })
  @ApiQuery({ name: 'resourceId', required: false, description: 'Filter by resource ID' })
  @ApiQuery({ name: 'startDate', required: false, description: 'Start date filter (ISO format)' })
  @ApiQuery({ name: 'endDate', required: false, description: 'End date filter (ISO format)' })
  @ApiQuery({ name: 'page', required: false, type: Number, description: 'Page number' })
  @ApiQuery({ name: 'limit', required: false, type: Number, description: 'Items per page' })
  @ApiResponse({ 
    status: 200, 
    description: 'Approval requests retrieved successfully',
    type: PaginatedResponseDto
  })
  async findAllApprovals(
    @Query('status') status?: string,
    @Query('requesterId') requesterId?: string,
    @Query('approverId') approverId?: string,
    @Query('resourceId') resourceId?: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
    @Query('page') page?: number,
    @Query('limit') limit?: number
  ) {
    const query = new GetApprovalsQuery(
      status,
      approverId,
      requesterId,
      startDate ? new Date(startDate) : undefined,
      endDate ? new Date(endDate) : undefined,
      page || 1,
      limit || 20
    );
    const result = await this.queryBus.execute(query);
    return ResponseUtil.fromServiceResponse({
      items: result.approvals || result.data || result,
      total: result.total || (Array.isArray(result) ? result.length : 0),
      page: page || 1,
      limit: limit || 20,
      message: 'Approval requests retrieved successfully'
    });
  }

  @Get(STOCKPILE_URLS.APPROVAL_REQUEST_STATUS)
  @ApiOperation({ 
    summary: 'Get approval request by ID (RF-20)',
    description: 'Retrieve detailed information for a specific approval request'
  })
  @ApiParam({ name: 'id', description: 'Approval request ID' })
  @ApiResponse({ 
    status: 200, 
    description: 'Approval request retrieved successfully',
    type: SuccessResponseDto
  })
  @ApiResponse({ status: 404, description: 'Approval request not found' })
  async findApprovalById(@Param('id') id: string) {
    const query = new GetApprovalByIdQuery(id);
    const approval = await this.queryBus.execute(query);
    return ResponseUtil.success(approval, 'Approval request retrieved successfully');
  }


  @Post(STOCKPILE_URLS.APPROVAL_REQUEST_APPROVE)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ 
    summary: 'Approve a request (RF-20, RF-21, RF-22)',
    description: 'Approve a reservation request, generate approval document, and send notifications'
  })
  @ApiParam({ name: 'id', description: 'Approval request ID' })
  @ApiBody({
    description: 'Approval data',
    schema: {
      type: 'object',
      properties: {
        comments: { type: 'string', description: 'Optional approval comments' },
        conditions: { type: 'array', items: { type: 'string' }, description: 'Approval conditions' },
        notificationChannels: { type: 'array', items: { type: 'string' }, description: 'Notification channels to use' }
      }
    }
  })
  @ApiResponse({ status: 200, description: 'Request approved successfully' })
  @ApiResponse({ status: 403, description: 'Insufficient permissions' })
  @ApiResponse({ status: 404, description: 'Approval request not found' })
  async approveRequest(
    @Param('id') id: string,
    @Body() data: { 
      comments?: string;
      conditions?: string[];
      notificationChannels?: string[];
    },
    @CurrentUser() currentUser: UserEntity
  ) {
    const command = new ApproveRequestCommand(
      id,
      currentUser.id,
      currentUser.id,
      data.comments,
      data.conditions
    );
    const result = await this.commandBus.execute(command);
    return ResponseUtil.success(result, 'Request approved successfully');
  }

  @Post(STOCKPILE_URLS.APPROVAL_REQUEST_REJECT)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ 
    summary: 'Reject a request (RF-20, RF-21, RF-22)',
    description: 'Reject a reservation request, generate rejection document, and send notifications'
  })
  @ApiParam({ name: 'id', description: 'Approval request ID' })
  @ApiBody({
    description: 'Rejection data',
    schema: {
      type: 'object',
      properties: {
        comments: { type: 'string', description: 'Required rejection reason' },
        rejectionCategory: { type: 'string', description: 'Category of rejection' },
        notificationChannels: { type: 'array', items: { type: 'string' }, description: 'Notification channels to use' }
      },
      required: ['comments']
    }
  })
  @ApiResponse({ status: 200, description: 'Request rejected successfully' })
  @ApiResponse({ status: 403, description: 'Insufficient permissions' })
  @ApiResponse({ status: 404, description: 'Approval request not found' })
  async rejectRequest(
    @Param('id') id: string,
    @Body() data: { 
      comments: string;
      rejectionCategory?: string;
      notificationChannels?: string[];
    },
    @CurrentUser() currentUser: UserEntity
  ) {
    const command = new RejectRequestCommand(
      id,
      currentUser.id,
      data.rejectionCategory || 'General rejection',
      data.comments
    );
    const result = await this.commandBus.execute(command);
    return ResponseUtil.success(result, 'Request rejected successfully');
  }

  @Post(STOCKPILE_URLS.APPROVAL_REQUEST_DOCUMENT)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ 
    summary: 'Generate approval document (RF-21)',
    description: 'Generate PDF document for approved or rejected requests'
  })
  @ApiParam({ name: 'id', description: 'Approval request ID' })
  @ApiBody({
    description: 'Document generation options',
    schema: {
      type: 'object',
      properties: {
        templateId: { type: 'string', description: 'Document template ID (optional)' },
        format: { type: 'string', enum: ['PDF', 'WORD'], description: 'Document format' },
        includeQrCode: { type: 'boolean', description: 'Include QR code for verification' },
        language: { type: 'string', description: 'Document language (es/en)' }
      }
    }
  })
  @ApiResponse({ status: 200, description: 'Document generated successfully' })
  @ApiResponse({ status: 404, description: 'Approval request not found' })
  async generateDocument(
    @Param('id') id: string,
    @CurrentUser() currentUser: UserEntity,
    @Body() options?: {
      documentType?: 'APPROVAL_LETTER' | 'REJECTION_LETTER' | 'CONDITIONAL_APPROVAL';
      templateId?: string;
      format?: string;
      includeQrCode?: boolean;
      language?: string;
    }
  ) {
    const command = new GenerateDocumentCommand(
      id,
      options?.documentType || 'APPROVAL_LETTER',
      options?.templateId,
      { ...options }
    );
    const result = await this.commandBus.execute(command);
    return ResponseUtil.success(result, 'Document generated successfully');
  }

  @Post(STOCKPILE_URLS.NOTIFICATION_SEND)
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ 
    summary: 'Send notification to user (RF-22, RF-27)',
    description: 'Send notifications via multiple channels (email, SMS, WhatsApp, push)'
  })
  @ApiBody({
    description: 'Notification data',
    schema: {
      type: 'object',
      properties: {
        userId: { type: 'string', description: 'Target user ID' },
        message: { type: 'string', description: 'Notification message' },
        channels: { type: 'array', items: { type: 'string' }, description: 'Notification channels' },
        priority: { type: 'string', enum: ['LOW', 'NORMAL', 'HIGH', 'URGENT'], description: 'Message priority' },
        templateId: { type: 'string', description: 'Notification template ID (optional)' },
        data: { type: 'object', description: 'Template data variables' }
      },
      required: ['userId', 'message']
    }
  })
  @ApiResponse({ status: 201, description: 'Notification sent successfully' })
  @ApiResponse({ status: 400, description: 'Invalid notification data' })
  async sendNotification(
    @Body() data: { 
      userId: string; 
      message: string;
      channels?: string[];
      templateId?: string;
      data?: any;
      priority?: string;
    },
    @CurrentUser() currentUser: UserEntity
  ) {
    const command = new SendNotificationCommand(
      data.userId,
      (data.channels?.[0] as 'EMAIL' | 'WHATSAPP' | 'SMS' | 'PUSH') || 'EMAIL',
      data.templateId,
      data.data,
      (data.priority as 'low' | 'medium' | 'high' | 'urgent') || 'medium',
      currentUser.id
    );
    const result = await this.commandBus.execute(command);
    return ResponseUtil.success(result, 'Notification sent successfully');
  }

  @Post(STOCKPILE_URLS.CHECKIN_RESERVATION)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ 
    summary: 'Check-in for reservation (RF-26)',
    description: 'Digital check-in process with QR code verification and access control'
  })
  @ApiParam({ name: 'reservationId', description: 'Reservation ID' })
  @ApiBody({
    description: 'Check-in data',
    schema: {
      type: 'object',
      properties: {
        qrCode: { type: 'string', description: 'QR code for verification' },
        location: { type: 'string', description: 'Check-in location' },
        timestamp: { type: 'string', description: 'Check-in timestamp (ISO format)' },
        deviceInfo: { type: 'object', description: 'Device information' }
      }
    }
  })
  @ApiResponse({ status: 200, description: 'Check-in completed successfully' })
  @ApiResponse({ status: 403, description: 'Check-in not authorized or invalid QR code' })
  @ApiResponse({ status: 404, description: 'Reservation not found' })
  async checkIn(
    @Param('reservationId') reservationId: string,
    @Body() data: {
      qrCode?: string;
      location?: string;
      timestamp?: string;
      deviceInfo?: any;
    },
    @CurrentUser() currentUser: UserEntity
  ) {
    const command = new CheckInCommand(
      reservationId,
      currentUser.id,
      data.timestamp ? new Date(data.timestamp) : new Date(),
      data.location
    );
    const result = await this.commandBus.execute(command);
    return ResponseUtil.success(result, 'Check-in completed successfully');
  }

  @Post(STOCKPILE_URLS.CHECKOUT_RESERVATION)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ 
    summary: 'Check-out for reservation (RF-26)',
    description: 'Digital check-out process with resource condition verification'
  })
  @ApiParam({ name: 'reservationId', description: 'Reservation ID' })
  @ApiBody({
    description: 'Check-out data',
    schema: {
      type: 'object',
      properties: {
        resourceCondition: { type: 'string', enum: ['GOOD', 'DAMAGED', 'MISSING_ITEMS'], description: 'Resource condition' },
        notes: { type: 'string', description: 'Check-out notes' },
        timestamp: { type: 'string', description: 'Check-out timestamp (ISO format)' },
        photos: { type: 'array', items: { type: 'string' }, description: 'Photo URLs for condition documentation' }
      },
      required: ['resourceCondition']
    }
  })
  @ApiResponse({ status: 200, description: 'Check-out completed successfully' })
  @ApiResponse({ status: 404, description: 'Reservation not found' })
  async checkOut(
    @Param('reservationId') reservationId: string,
    @Body() data: {
      resourceCondition: string;
      notes?: string;
      timestamp?: string;
      photos?: string[];
    },
    @CurrentUser() currentUser: UserEntity
  ) {
    const command = new CheckOutCommand(
      reservationId,
      currentUser.id,
      data.timestamp ? new Date(data.timestamp) : new Date(),
      data.notes,
      data.resourceCondition
    );
    const result = await this.commandBus.execute(command);
    return ResponseUtil.success(result, 'Check-out completed successfully');
  }

  @Get(STOCKPILE_URLS.APPROVAL_FLOWS + '/search')
  @ApiOperation({ 
    summary: 'Get approval flows (RF-24)',
    description: 'Retrieve configured approval workflows with differentiated flows by resource type'
  })
  @ApiQuery({ name: 'resourceType', required: false, description: 'Filter by resource type' })
  @ApiQuery({ name: 'programId', required: false, description: 'Filter by program ID' })
  @ApiQuery({ name: 'isActive', required: false, type: Boolean, description: 'Filter by active status' })
  @ApiResponse({ status: 200, description: 'Approval flows retrieved successfully' })
  async getApprovalFlows(
    @Query('resourceType') resourceType?: string,
    @Query('programId') programId?: string,
    @Query('isActive') isActive?: boolean
  ) {
    const query = new GetApprovalFlowsQuery(
      isActive,
      resourceType,
      undefined, // isDefault
      undefined, // page
      undefined  // limit
    );
    const result = await this.queryBus.execute(query);
    return ResponseUtil.success(result, 'Approval flows retrieved successfully');
  }

  @Get(STOCKPILE_URLS.CHECKIN_STATUS)
  @ApiOperation({ 
    summary: 'Get check-in status (RF-26)',
    description: 'Check current check-in/check-out status for a reservation'
  })
  @ApiParam({ name: 'reservationId', description: 'Reservation ID' })
  @ApiResponse({ status: 200, description: 'Check-in status retrieved successfully' })
  @ApiResponse({ status: 404, description: 'Reservation not found' })
  async getCheckInStatus(@Param('reservationId') reservationId: string) {
    const query = new GetCheckInStatusQuery(reservationId);
    const result = await this.queryBus.execute(query);
    return ResponseUtil.success(result, 'Check-in status retrieved successfully');
  }
}
