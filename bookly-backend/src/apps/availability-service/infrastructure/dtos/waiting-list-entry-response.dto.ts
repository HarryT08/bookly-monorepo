/**
 * RF-14: Waiting List Entry Response DTO
 * Response structure for waiting list entries
 */

import { ApiProperty } from '@nestjs/swagger';
import { IsUUID, IsString, IsEnum, IsOptional, IsDateString, IsNumber } from 'class-validator';
import { WaitingListStatus, WaitingListPriority } from '../../utils';

export class WaitingListEntryResponseDto {
  @ApiProperty({
    description: 'Waiting list entry unique identifier',
    example: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890'
  })
  @IsUUID()
  id: string;

  @ApiProperty({
    description: 'User ID who joined the waiting list',
    example: 'user123-456-789'
  })
  @IsUUID()
  userId: string;

  @ApiProperty({
    description: 'Resource ID for the waiting list',
    example: 'resource456-789-012'
  })
  @IsUUID()
  resourceId: string;

  @ApiProperty({
    description: 'Requested start time',
    example: '2024-03-15T09:00:00Z'
  })
  @IsDateString()
  requestedStartTime: string;

  @ApiProperty({
    description: 'Requested end time',
    example: '2024-03-15T11:00:00Z'
  })
  @IsDateString()
  requestedEndTime: string;

  @ApiProperty({
    description: 'Current status of the waiting list entry',
    enum: WaitingListStatus,
    example: WaitingListStatus.ACTIVE
  })
  @IsEnum(WaitingListStatus)
  status: WaitingListStatus;

  @ApiProperty({
    description: 'User priority level',
    enum: WaitingListPriority,
    example: WaitingListPriority.LOW
  })
  @IsEnum(WaitingListPriority)
  priority: WaitingListPriority;

  @ApiProperty({
    description: 'Current position in the waiting list',
    example: 3
  })
  @IsNumber()
  position: number;

  @ApiProperty({
    description: 'Estimated wait time in minutes',
    example: 45,
    required: false
  })
  @IsOptional()
  @IsNumber()
  estimatedWaitTime?: number;

  @ApiProperty({
    description: 'Notification sent timestamp',
    example: '2024-03-15T08:30:00Z',
    required: false
  })
  @IsOptional()
  @IsDateString()
  notifiedAt?: string;

  @ApiProperty({
    description: 'Notification expiration timestamp',
    example: '2024-03-15T09:00:00Z',
    required: false
  })
  @IsOptional()
  @IsDateString()
  notificationExpiresAt?: string;

  @ApiProperty({
    description: 'Reason for joining the waiting list',
    example: 'Need room for important presentation',
    required: false
  })
  @IsOptional()
  @IsString()
  reason?: string;

  @ApiProperty({
    description: 'Additional notes or comments',
    example: 'Flexible with time if needed',
    required: false
  })
  @IsOptional()
  @IsString()
  notes?: string;

  @ApiProperty({
    description: 'Entry creation timestamp',
    example: '2024-03-15T08:00:00Z'
  })
  @IsDateString()
  createdAt: string;

  @ApiProperty({
    description: 'Entry last update timestamp',
    example: '2024-03-15T08:30:00Z'
  })
  @IsDateString()
  updatedAt: string;

  @ApiProperty({
    description: 'User information',
    required: false
  })
  @IsOptional()
  user?: {
    id: string;
    name: string;
    email: string;
    role: string;
  };

  @ApiProperty({
    description: 'Resource information',
    required: false
  })
  @IsOptional()
  resource?: {
    id: string;
    name: string;
    type: string;
    capacity: number;
  };
}
