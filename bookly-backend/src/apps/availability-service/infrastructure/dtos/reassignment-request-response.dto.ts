/**
 * RF-15: Reassignment Request Response DTO
 * Response structure for reassignment requests
 */

import { ApiProperty } from '@nestjs/swagger';
import { IsUUID, IsString, IsEnum, IsOptional, IsDateString, IsNumber, IsArray, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { ReassignmentStatus, ReassignmentReason, ReassignmentPriority } from '../../utils';

export class SuggestedResourceDto {
  @ApiProperty({
    description: 'Resource ID',
    example: 'resource456-789-012'
  })
  @IsUUID()
  id: string;

  @ApiProperty({
    description: 'Resource name',
    example: 'Aula 201'
  })
  @IsString()
  name: string;

  @ApiProperty({
    description: 'Resource type',
    example: 'CLASSROOM'
  })
  @IsString()
  type: string;

  @ApiProperty({
    description: 'Resource capacity',
    example: 30
  })
  @IsNumber()
  capacity: number;

  @ApiProperty({
    description: 'Match score (0-100)',
    example: 85
  })
  @IsNumber()
  matchScore: number;

  @ApiProperty({
    description: 'Availability status for requested time',
    example: 'AVAILABLE'
  })
  @IsString()
  availabilityStatus: string;

  @ApiProperty({
    description: 'Distance from original resource in meters',
    example: 50,
    required: false
  })
  @IsOptional()
  @IsNumber()
  distance?: number;
}

export class ReassignmentRequestResponseDto {
  @ApiProperty({
    description: 'Reassignment request unique identifier',
    example: 'reassign123-456-789'
  })
  @IsUUID()
  id: string;

  @ApiProperty({
    description: 'Original reservation ID',
    example: 'reservation456-789-012'
  })
  @IsUUID()
  reservationId: string;

  @ApiProperty({
    description: 'Original resource ID',
    example: 'resource789-012-345'
  })
  @IsUUID()
  originalResourceId: string;

  @ApiProperty({
    description: 'Suggested new resource ID',
    example: 'resource012-345-678',
    required: false
  })
  @IsOptional()
  @IsUUID()
  suggestedResourceId?: string;

  @ApiProperty({
    description: 'Current status of the reassignment request',
    enum: ReassignmentStatus,
    example: ReassignmentStatus.PENDING
  })
  @IsEnum(ReassignmentStatus)
  status: ReassignmentStatus;

  @ApiProperty({
    description: 'Reason for reassignment',
    enum: ReassignmentReason,
    example: ReassignmentReason.RESOURCE_UNAVAILABLE
  })
  @IsEnum(ReassignmentReason)
  reason: ReassignmentReason;

  @ApiProperty({
    description: 'Priority level of the reassignment',
    enum: ReassignmentPriority,
    example: ReassignmentPriority.MEDIUM
  })
  @IsEnum(ReassignmentPriority)
  priority: ReassignmentPriority;

  @ApiProperty({
    description: 'User ID who requested the reassignment',
    example: 'user123-456-789'
  })
  @IsUUID()
  requestedBy: string;

  @ApiProperty({
    description: 'User ID who processed the reassignment',
    example: 'admin456-789-012',
    required: false
  })
  @IsOptional()
  @IsUUID()
  processedBy?: string;

  @ApiProperty({
    description: 'Detailed description of the reassignment request',
    example: 'Original room has technical issues, need alternative with same capacity'
  })
  @IsString()
  description: string;

  @ApiProperty({
    description: 'List of suggested alternative resources',
    type: [SuggestedResourceDto]
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => SuggestedResourceDto)
  suggestedResources: SuggestedResourceDto[];

  @ApiProperty({
    description: 'Response from the user (if any)',
    example: 'Accepted alternative room',
    required: false
  })
  @IsOptional()
  @IsString()
  userResponse?: string;

  @ApiProperty({
    description: 'Admin notes or comments',
    example: 'Processed automatically due to emergency',
    required: false
  })
  @IsOptional()
  @IsString()
  adminNotes?: string;

  @ApiProperty({
    description: 'Deadline for user response',
    example: '2024-03-15T14:00:00Z',
    required: false
  })
  @IsOptional()
  @IsDateString()
  responseDeadline?: string;

  @ApiProperty({
    description: 'Request creation timestamp',
    example: '2024-03-15T10:00:00Z'
  })
  @IsDateString()
  createdAt: string;

  @ApiProperty({
    description: 'Request last update timestamp',
    example: '2024-03-15T12:00:00Z'
  })
  @IsDateString()
  updatedAt: string;

  @ApiProperty({
    description: 'Request processing timestamp',
    example: '2024-03-15T13:00:00Z',
    required: false
  })
  @IsOptional()
  @IsDateString()
  processedAt?: string;

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
    description: 'Original resource information',
    required: false
  })
  @IsOptional()
  originalResource?: {
    id: string;
    name: string;
    type: string;
    capacity: number;
  };

  @ApiProperty({
    description: 'Reservation information',
    required: false
  })
  @IsOptional()
  reservation?: {
    id: string;
    title: string;
    startTime: string;
    endTime: string;
    status: string;
  };
}
