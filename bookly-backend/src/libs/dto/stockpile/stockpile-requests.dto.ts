import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsOptional, IsObject } from 'class-validator';

/**
 * Request DTO for processing reservation approval
 * RF-20: Validate and process reservation approval requests
 */
export class ProcessReservationApprovalRequestDto {
  @ApiProperty({ description: 'Reservation ID' })
  @IsString()
  reservationId: string;

  @ApiProperty({ description: 'User ID requesting approval' })
  @IsString()
  userId: string;

  @ApiProperty({ description: 'Resource ID' })
  @IsString()
  resourceId: string;

  @ApiProperty({ description: 'User ID who requested the approval' })
  @IsString()
  requestedBy: string;

  @ApiProperty({ description: 'Resource type', required: false })
  @IsOptional()
  @IsString()
  resourceType?: string;

  @ApiProperty({ description: 'Program ID', required: false })
  @IsOptional()
  @IsString()
  programId?: string;

  @ApiProperty({ description: 'Additional comments', required: false })
  @IsOptional()
  @IsString()
  comments?: string;

  @ApiProperty({ description: 'Approval conditions', required: false })
  @IsOptional()
  conditions?: string[];

  @ApiProperty({ description: 'Request priority', required: false })
  @IsOptional()
  @IsString()
  priority?: string;
}

/**
 * Request DTO for generating approval documents
 * RF-21: Generate approval/rejection documents
 */
export class GenerateApprovalDocumentRequestDto {
  @ApiProperty({ description: 'Approval ID' })
  @IsString()
  approvalId: string;

  @ApiProperty({ description: 'Template ID', required: false })
  @IsOptional()
  @IsString()
  templateId?: string;

  @ApiProperty({ description: 'Template variables', required: false })
  @IsOptional()
  @IsObject()
  variables?: Record<string, any>;
}

/**
 * Request DTO for sending approval notifications
 * RF-22: Send contextual notifications
 */
export class SendApprovalNotificationRequestDto {
  @ApiProperty({ description: 'User ID to notify' })
  @IsString()
  userId: string;

  @ApiProperty({ description: 'Reservation ID' })
  @IsString()
  reservationId: string;

  @ApiProperty({ description: 'Notification type', enum: ['APPROVED', 'REJECTED', 'PENDING'] })
  @IsString()
  notificationType: 'APPROVED' | 'REJECTED' | 'PENDING';

  @ApiProperty({ description: 'Additional context', required: false })
  @IsOptional()
  @IsObject()
  additionalContext?: Record<string, any>;
}

/**
 * Request DTO for check-in operations
 * RF-26: Digital check-in
 */
export class PerformCheckInRequestDto {
  @ApiProperty({ description: 'Reservation ID' })
  @IsString()
  reservationId: string;

  @ApiProperty({ description: 'User ID performing check-in' })
  @IsString()
  userId: string;

  @ApiProperty({ description: 'Check-in timestamp', required: false })
  @IsOptional()
  checkInTime?: Date;

  @ApiProperty({ description: 'Location', required: false })
  @IsOptional()
  @IsString()
  location?: string;

  @ApiProperty({ description: 'Additional notes', required: false })
  @IsOptional()
  @IsString()
  notes?: string;

  @ApiProperty({ description: 'QR code for check-in', required: false })
  @IsOptional()
  @IsString()
  qrCode?: string;

  @ApiProperty({ description: 'Device information', required: false })
  @IsOptional()
  deviceInfo?: Record<string, any>;
}

/**
 * Request DTO for check-out operations
 * RF-26: Digital check-out
 */
export class PerformCheckOutRequestDto {
  @ApiProperty({ description: 'Reservation ID' })
  @IsString()
  reservationId: string;

  @ApiProperty({ description: 'User ID performing check-out' })
  @IsString()
  userId: string;

  @ApiProperty({ description: 'Check-out timestamp', required: false })
  @IsOptional()
  checkOutTime?: Date;

  @ApiProperty({ description: 'Resource condition', required: false })
  @IsOptional()
  @IsString()
  condition?: string;

  @ApiProperty({ description: 'Additional notes', required: false })
  @IsOptional()
  @IsString()
  notes?: string;

  @ApiProperty({ description: 'Resource condition after use', required: false })
  @IsOptional()
  @IsString()
  resourceCondition?: string;

  @ApiProperty({ description: 'Photos during checkout', required: false })
  @IsOptional()
  photos?: string[];
}

/**
 * Request DTO for getting approval workflow status
 */
export class GetApprovalWorkflowStatusRequestDto {
  @ApiProperty({ description: 'Reservation ID' })
  @IsString()
  reservationId: string;
}

/**
 * Request DTO for getting entities by ID
 */
export class GetByIdRequestDto {
  @ApiProperty({ description: 'Entity ID' })
  @IsString()
  id: string;
}

/**
 * Request DTO for getting generated documents by reservation
 */
export class GetGeneratedDocumentsByReservationRequestDto {
  @ApiProperty({ description: 'Reservation ID' })
  @IsString()
  reservationId: string;
}

/**
 * Request DTO for getting document template variables
 */
export class GetDocumentTemplateVariablesRequestDto {
  @ApiProperty({ description: 'Template ID' })
  @IsString()
  templateId: string;
}

/**
 * Request DTO for marking notification as read
 */
export class MarkNotificationAsReadRequestDto {
  @ApiProperty({ description: 'Notification ID' })
  @IsString()
  notificationId: string;

  @ApiProperty({ description: 'User ID' })
  @IsString()
  userId: string;
}

/**
 * Request DTO for getting notification channels
 */
export class GetNotificationChannelsRequestDto {
  @ApiProperty({ description: 'Filter by active status', required: false })
  @IsOptional()
  isActive?: boolean;
}
