/**
 * RF-15: Process Reassignment Response DTO
 * Response structure for processing reassignment requests
 */

import { ApiProperty } from '@nestjs/swagger';
import { IsUUID, IsString, IsEnum, IsOptional, IsDateString, IsBoolean, IsArray } from 'class-validator';
import { ReassignmentStatus, UserResponse } from '../../utils';

export class ProcessReassignmentResponseDto {
  @ApiProperty({
    description: 'Reassignment request ID',
    example: 'reassign123-456-789'
  })
  @IsUUID()
  reassignmentId: string;

  @ApiProperty({
    description: 'Original reservation ID',
    example: 'reservation456-789-012'
  })
  @IsUUID()
  reservationId: string;

  @ApiProperty({
    description: 'New status after processing',
    enum: ReassignmentStatus,
    example: ReassignmentStatus.ACCEPTED
  })
  @IsEnum(ReassignmentStatus)
  newStatus: ReassignmentStatus;

  @ApiProperty({
    description: 'User response to the reassignment',
    enum: UserResponse,
    example: UserResponse.ACCEPTED
  })
  @IsEnum(UserResponse)
  userResponse: UserResponse;

  @ApiProperty({
    description: 'Selected resource ID (if accepted)',
    example: 'resource789-012-345',
    required: false
  })
  @IsOptional()
  @IsUUID()
  selectedResourceId?: string;

  @ApiProperty({
    description: 'Whether the reservation was successfully updated',
    example: true
  })
  @IsBoolean()
  reservationUpdated: boolean;

  @ApiProperty({
    description: 'Whether notifications were sent to relevant parties',
    example: true
  })
  @IsBoolean()
  notificationsSent: boolean;

  @ApiProperty({
    description: 'Processing timestamp',
    example: '2024-03-15T14:30:00Z'
  })
  @IsDateString()
  processedAt: string;

  @ApiProperty({
    description: 'User ID who processed the request',
    example: 'admin456-789-012'
  })
  @IsUUID()
  processedBy: string;

  @ApiProperty({
    description: 'Reason provided by user (if rejected)',
    example: 'Alternative room is too small for the event',
    required: false
  })
  @IsOptional()
  @IsString()
  rejectionReason?: string;

  @ApiProperty({
    description: 'Additional processing notes',
    example: 'Processed automatically due to deadline expiration',
    required: false
  })
  @IsOptional()
  @IsString()
  processingNotes?: string;

  @ApiProperty({
    description: 'List of actions taken during processing',
    example: ['reservation_updated', 'user_notified', 'calendar_synced']
  })
  @IsArray()
  @IsString({ each: true })
  actionsTaken: string[];

  @ApiProperty({
    description: 'Any warnings or issues encountered during processing',
    example: ['calendar_sync_delayed'],
    required: false
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  warnings?: string[];

  @ApiProperty({
    description: 'Information about the selected resource',
    required: false
  })
  @IsOptional()
  selectedResource?: {
    id: string;
    name: string;
    type: string;
    capacity: number;
    location: string;
  };

  @ApiProperty({
    description: 'Updated reservation details',
    required: false
  })
  @IsOptional()
  updatedReservation?: {
    id: string;
    title: string;
    startTime: string;
    endTime: string;
    resourceId: string;
    resourceName: string;
  };

  @ApiProperty({
    description: 'Next steps or follow-up actions required',
    example: ['confirm_setup_requirements', 'notify_participants'],
    required: false
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  nextSteps?: string[];
}
