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

  @ApiProperty({ description: 'Resource type', required: false })
  @IsOptional()
  @IsString()
  resourceType?: string;

  @ApiProperty({ description: 'Program ID', required: false })
  @IsOptional()
  @IsString()
  programId?: string;
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

  @ApiProperty({ description: 'Location', required: false })
  @IsOptional()
  @IsString()
  location?: string;

  @ApiProperty({ description: 'Additional notes', required: false })
  @IsOptional()
  @IsString()
  notes?: string;
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

  @ApiProperty({ description: 'Resource condition', required: false })
  @IsOptional()
  @IsString()
  condition?: string;

  @ApiProperty({ description: 'Additional notes', required: false })
  @IsOptional()
  @IsString()
  notes?: string;
}

/**
 * Request DTO for getting approval workflow status
 */
export class GetApprovalWorkflowStatusRequestDto {
  @ApiProperty({ description: 'Reservation ID' })
  @IsString()
  reservationId: string;
}
