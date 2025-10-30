import { ApiProperty } from '@nestjs/swagger';
import { BaseEntityDto } from '../common/base-entity.dto';
import { IsString, IsOptional, IsBoolean, IsInt, IsArray, Min } from 'class-validator';

export class CreateApprovalFlowDto {
  @ApiProperty({ description: 'Flow name', example: 'Standard Classroom Approval' })
  @IsString()
  name: string;

  @ApiProperty({ description: 'Flow description', required: false })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ description: 'Program ID scope', required: false })
  @IsOptional()
  @IsString()
  programId?: string;

  @ApiProperty({ description: 'Resource type scope', required: false, example: 'ROOM' })
  @IsOptional()
  @IsString()
  resourceType?: string;

  @ApiProperty({ description: 'Category ID scope', required: false })
  @IsOptional()
  @IsString()
  categoryId?: string;

  @ApiProperty({ description: 'Is default flow for scope', default: false })
  @IsOptional()
  @IsBoolean()
  isDefault?: boolean;

  @ApiProperty({ description: 'Requires all approval levels', default: true })
  @IsOptional()
  @IsBoolean()
  requiresAllApprovals?: boolean;

  @ApiProperty({ description: 'Auto approval enabled', default: false })
  @IsOptional()
  @IsBoolean()
  autoApprovalEnabled?: boolean;

  @ApiProperty({ description: 'Review time in hours before auto-cancel', required: false })
  @IsOptional()
  @IsInt()
  @Min(1)
  reviewTimeHours?: number;

  @ApiProperty({ description: 'Reminder time in hours', required: false })
  @IsOptional()
  @IsInt()
  @Min(1)
  reminderHours?: number;

  @ApiProperty({ description: 'Created by user ID' })
  @IsString()
  createdBy: string;
}

export class UpdateApprovalFlowDto {
  @ApiProperty({ description: 'Flow name', required: false })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiProperty({ description: 'Flow description', required: false })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ description: 'Requires all approval levels', required: false })
  @IsOptional()
  @IsBoolean()
  requiresAllApprovals?: boolean;

  @ApiProperty({ description: 'Auto approval enabled', required: false })
  @IsOptional()
  @IsBoolean()
  autoApprovalEnabled?: boolean;

  @ApiProperty({ description: 'Review time in hours before auto-cancel', required: false })
  @IsOptional()
  @IsInt()
  @Min(1)
  reviewTimeHours?: number;

  @ApiProperty({ description: 'Reminder time in hours', required: false })
  @IsOptional()
  @IsInt()
  @Min(1)
  reminderHours?: number;

  @ApiProperty({ description: 'Is active', required: false })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}

export class ApprovalFlowDto extends BaseEntityDto {
  @ApiProperty({ description: 'Flow name' })
  name: string;

  @ApiProperty({ description: 'Flow description' })
  description?: string;

  @ApiProperty({ description: 'Program ID scope' })
  programId?: string;

  @ApiProperty({ description: 'Resource type scope' })
  resourceType?: string;

  @ApiProperty({ description: 'Category ID scope' })
  categoryId?: string;

  @ApiProperty({ description: 'Is default flow for scope' })
  isDefault: boolean;

  @ApiProperty({ description: 'Requires all approval levels' })
  requiresAllApprovals: boolean;

  @ApiProperty({ description: 'Auto approval enabled' })
  autoApprovalEnabled: boolean;

  @ApiProperty({ description: 'Review time in hours before auto-cancel' })
  reviewTimeHours?: number;

  @ApiProperty({ description: 'Reminder time in hours' })
  reminderHours?: number;

  @ApiProperty({ description: 'Is active' })
  isActive: boolean;

  @ApiProperty({ description: 'Created by user ID' })
  createdBy: string;

  @ApiProperty({ description: 'Approval levels', type: [Object] })
  levels?: ApprovalLevelDto[];
}

export class CreateApprovalLevelDto {
  @ApiProperty({ description: 'Flow ID' })
  @IsString()
  flowId: string;

  @ApiProperty({ description: 'Level order', example: 1 })
  @IsInt()
  @Min(1)
  level: number;

  @ApiProperty({ description: 'Level name', example: 'Department Head' })
  @IsString()
  name: string;

  @ApiProperty({ description: 'Level description', required: false })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ description: 'Approver roles', type: [String] })
  @IsArray()
  @IsString({ each: true })
  approverRoles: string[];

  @ApiProperty({ description: 'Approver user IDs', type: [String] })
  @IsArray()
  @IsString({ each: true })
  approverUsers: string[];

  @ApiProperty({ description: 'Requires all approvers', default: false })
  @IsOptional()
  @IsBoolean()
  requiresAll?: boolean;

  @ApiProperty({ description: 'Timeout in hours', required: false })
  @IsOptional()
  @IsInt()
  @Min(1)
  timeoutHours?: number;
}

export class ApprovalLevelDto extends BaseEntityDto {
  @ApiProperty({ description: 'Flow ID' })
  flowId: string;

  @ApiProperty({ description: 'Level order' })
  level: number;

  @ApiProperty({ description: 'Level name' })
  name: string;

  @ApiProperty({ description: 'Level description' })
  description?: string;

  @ApiProperty({ description: 'Approver roles', type: [String] })
  approverRoles: string[];

  @ApiProperty({ description: 'Approver user IDs', type: [String] })
  approverUsers: string[];

  @ApiProperty({ description: 'Requires all approvers' })
  requiresAll: boolean;

  @ApiProperty({ description: 'Timeout in hours' })
  timeoutHours?: number;

  @ApiProperty({ description: 'Is active' })
  isActive: boolean;
}

export class ApprovalRequestDto extends BaseEntityDto {
  @ApiProperty({ description: 'Reservation ID' })
  reservationId: string;

  @ApiProperty({ description: 'Level ID' })
  levelId: string;

  @ApiProperty({ description: 'Request status', example: 'PENDING' })
  status: string;

  @ApiProperty({ description: 'Approver ID' })
  approverId?: string;

  @ApiProperty({ description: 'Comments' })
  comments?: string;

  @ApiProperty({ description: 'Requested at' })
  requestedAt: Date;

  @ApiProperty({ description: 'Responded at' })
  respondedAt?: Date;

  @ApiProperty({ description: 'Timeout at' })
  timeoutAt?: Date;

  @ApiProperty({ description: 'Notifications sent', type: Object })
  notificationsSent?: any;
}

export class CreateApprovalRequestDto {
  @ApiProperty({ description: 'Reservation ID' })
  @IsString()
  reservationId: string;

  @ApiProperty({ description: 'Level ID' })
  @IsString()
  levelId: string;

  @ApiProperty({ description: 'Timeout at', required: false })
  @IsOptional()
  timeoutAt?: Date;
}

export class ProcessApprovalRequestDto {
  @ApiProperty({ description: 'Approver ID' })
  @IsString()
  approverId: string;

  @ApiProperty({ description: 'Action', enum: ['APPROVE', 'REJECT'] })
  @IsString()
  action: 'APPROVE' | 'REJECT';

  @ApiProperty({ description: 'Comments', required: false })
  @IsOptional()
  @IsString()
  comments?: string;
}

export class SubmitReservationForApprovalDto {
  @ApiProperty({ description: 'Reservation ID' })
  @IsString()
  reservationId: string;

  @ApiProperty({ description: 'User ID' })
  @IsString()
  userId: string;

  @ApiProperty({ description: 'Resource ID' })
  @IsString()
  resourceId: string;

  @ApiProperty({ description: 'Resource type', required: false })
  @IsOptional()
  @IsString()
  resourceType?: string;

  @ApiProperty({ description: 'Category ID', required: false })
  @IsOptional()
  @IsString()
  categoryId?: string;

  @ApiProperty({ description: 'Program ID', required: false })
  @IsOptional()
  @IsString()
  programId?: string;
}

export class CancelReservationDto {
  @ApiProperty({ description: 'Reservation ID' })
  @IsString()
  reservationId: string;

  @ApiProperty({ description: 'User ID' })
  @IsString()
  userId: string;

  @ApiProperty({ description: 'Cancellation reason', required: false })
  @IsOptional()
  @IsString()
  reason?: string;
}

export class GetApprovalFlowsDto {
  @ApiProperty({ description: 'Program ID filter', required: false })
  @IsOptional()
  @IsString()
  programId?: string;

  @ApiProperty({ description: 'Resource type filter', required: false })
  @IsOptional()
  @IsString()
  resourceType?: string;

  @ApiProperty({ description: 'Category ID filter', required: false })
  @IsOptional()
  @IsString()
  categoryId?: string;

  @ApiProperty({ description: 'Active status filter', required: false })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}

export class GetPendingApprovalRequestsDto {
  @ApiProperty({ description: 'Approver ID filter', required: false })
  @IsOptional()
  @IsString()
  approverId?: string;

  @ApiProperty({ description: 'Program ID filter', required: false })
  @IsOptional()
  @IsString()
  programId?: string;

  @ApiProperty({ description: 'Resource type filter', required: false })
  @IsOptional()
  @IsString()
  resourceType?: string;

  @ApiProperty({ description: 'Category ID filter', required: false })
  @IsOptional()
  @IsString()
  categoryId?: string;

  @ApiProperty({ description: 'Page number', default: 1 })
  @IsOptional()
  @IsInt()
  @Min(1)
  page?: number;

  @ApiProperty({ description: 'Items per page', default: 10 })
  @IsOptional()
  @IsInt()
  @Min(1)
  limit?: number;
}
