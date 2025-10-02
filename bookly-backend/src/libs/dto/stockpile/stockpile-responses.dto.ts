import { ApiProperty } from '@nestjs/swagger';
import { ApprovalRequestDto } from './approval-flow.dto';
import { ApprovalDto } from './approval.dto';
import { CheckInOutDto } from './check-in-out.dto';
import { ApprovalRequestStatus } from '@apps/stockpile-service/utils';

/**
 * Response DTO for processing reservation approval
 * RF-20: Process reservation approval response
 */
export class ProcessReservationApprovalResponseDto {
  @ApiProperty({ description: 'Created approval request' })
  approval: ApprovalDto;

  @ApiProperty({ description: 'Success message' })
  message: string;

  @ApiProperty({ description: 'Processing timestamp' })
  processedAt: Date;
}

/**
 * Response DTO for document generation
 * RF-21: Generate approval/rejection documents response
 */
export class GenerateApprovalDocumentResponseDto {
  @ApiProperty({ description: 'Generated document ID' })
  documentId: string;

  @ApiProperty({ description: 'Document download URL' })
  documentUrl: string;

  @ApiProperty({ description: 'Generation timestamp' })
  generatedAt: Date;

  @ApiProperty({ description: 'Template used for generation' })
  templateId: string;

  @ApiProperty({ description: 'Document format' })
  format: string;

  @ApiProperty({ description: 'Document size in bytes', required: false })
  sizeBytes?: number;
}

/**
 * Response DTO for sending notifications
 * RF-22: Send notification response
 */
export class SendApprovalNotificationResponseDto {
  @ApiProperty({ description: 'Notification sent successfully' })
  success: boolean;

  @ApiProperty({ description: 'Notification ID' })
  notificationId: string;

  @ApiProperty({ description: 'Delivery channel used' })
  channel: string;

  @ApiProperty({ description: 'Sent timestamp' })
  sentAt: Date;

  @ApiProperty({ description: 'Template used' })
  templateId: string;
}

/**
 * Response DTO for check-in operations
 * RF-26: Check-in response
 */
export class PerformCheckInResponseDto {
  @ApiProperty({ description: 'Check-in record' })
  checkIn: CheckInOutDto;

  @ApiProperty({ description: 'Success message' })
  message: string;

  @ApiProperty({ description: 'Check-in timestamp' })
  checkedInAt: Date;
}

/**
 * Response DTO for check-out operations
 * RF-26: Check-out response
 */
export class PerformCheckOutResponseDto {
  @ApiProperty({ description: 'Check-out record' })
  checkOut: CheckInOutDto;

  @ApiProperty({ description: 'Success message' })
  message: string;

  @ApiProperty({ description: 'Check-out timestamp' })
  checkedOutAt: Date;
}

/**
 * Response DTO for approval workflow status
 */
export class GetApprovalWorkflowStatusResponseDto {
  @ApiProperty({ description: 'Reservation ID' })
  reservationId: string;

  @ApiProperty({ description: 'Current approval status', enum: ApprovalRequestStatus })
  currentStatus: ApprovalRequestStatus;

  @ApiProperty({ description: 'Current approval level' })
  currentLevel: number;

  @ApiProperty({ description: 'Total approval levels' })
  totalLevels: number;

  @ApiProperty({ description: 'Pending approver IDs', type: [String] })
  pendingApprovers: string[];

  @ApiProperty({ description: 'Completed approvals', type: [ApprovalRequestDto] })
  completedApprovals: ApprovalRequestDto[];

  @ApiProperty({ description: 'Estimated completion time', required: false })
  estimatedCompletionTime?: Date;

  @ApiProperty({ description: 'Workflow progress percentage' })
  progressPercentage: number;

  @ApiProperty({ description: 'Next required action', required: false })
  nextAction?: string;
}
