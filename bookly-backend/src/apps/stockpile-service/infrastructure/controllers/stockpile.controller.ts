import { Controller, Get, Post, Put, Param, Body } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { StockpileService } from '../../application/services/stockpile.service';

@ApiTags('Stockpile')
@Controller('stockpile')
export class StockpileController {
  constructor(private readonly stockpileService: StockpileService) {}

  @Get('approvals')
  @ApiOperation({ summary: 'Get all approval requests' })
  @ApiResponse({ status: 200, description: 'Approval requests retrieved successfully' })
  async findAllApprovals() {
    return this.stockpileService.findAllApprovals();
  }

  @Get('approvals/:id')
  @ApiOperation({ summary: 'Get approval request by ID' })
  @ApiResponse({ status: 200, description: 'Approval request retrieved successfully' })
  async findApprovalById(@Param('id') id: string) {
    return this.stockpileService.findApprovalById(id);
  }

  @Post('approvals/:id/approve')
  @ApiOperation({ summary: 'Approve a request' })
  @ApiResponse({ status: 200, description: 'Request approved successfully' })
  async approveRequest(
    @Param('id') id: string,
    @Body() data: { approverId: string; comments?: string }
  ) {
    return this.stockpileService.approveRequest(id, data.approverId, data.comments);
  }

  @Post('approvals/:id/reject')
  @ApiOperation({ summary: 'Reject a request' })
  @ApiResponse({ status: 200, description: 'Request rejected successfully' })
  async rejectRequest(
    @Param('id') id: string,
    @Body() data: { approverId: string; comments?: string }
  ) {
    return this.stockpileService.rejectRequest(id, data.approverId, data.comments);
  }

  @Post('approvals/:id/document')
  @ApiOperation({ summary: 'Generate approval document' })
  @ApiResponse({ status: 200, description: 'Document generated successfully' })
  async generateDocument(@Param('id') id: string) {
    return this.stockpileService.generateApprovalDocument(id);
  }

  @Post('notifications')
  @ApiOperation({ summary: 'Send notification to user' })
  @ApiResponse({ status: 200, description: 'Notification sent successfully' })
  async sendNotification(@Body() data: { userId: string; message: string }) {
    return this.stockpileService.sendNotification(data.userId, data.message);
  }

  @Post('check-in/:reservationId')
  @ApiOperation({ summary: 'Check-in for reservation' })
  @ApiResponse({ status: 200, description: 'Check-in completed successfully' })
  async checkIn(@Param('reservationId') reservationId: string) {
    return this.stockpileService.checkIn(reservationId);
  }

  @Post('check-out/:reservationId')
  @ApiOperation({ summary: 'Check-out for reservation' })
  @ApiResponse({ status: 200, description: 'Check-out completed successfully' })
  async checkOut(@Param('reservationId') reservationId: string) {
    return this.stockpileService.checkOut(reservationId);
  }
}
