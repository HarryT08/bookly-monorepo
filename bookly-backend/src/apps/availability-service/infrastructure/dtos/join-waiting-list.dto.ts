/**
 * DTO for joining waiting lists (RF-14)
 */

import { ApiProperty } from '@nestjs/swagger';
import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsUUID,
  IsInt,
  Min,
  Max,
  IsEnum,
  IsBoolean,
  Length,
  IsDateString
} from 'class-validator';
import { Transform } from 'class-transformer';
import { WaitingListPriority } from '../../utils';

export class JoinWaitingListDto {
  @ApiProperty({
    description: 'Resource ID to join waiting list for',
    example: '550e8400-e29b-41d4-a716-446655440000',
    format: 'uuid'
  })
  @IsUUID()
  @IsNotEmpty()
  resourceId: string;

  @ApiProperty({
    description: 'Desired start date and time (ISO 8601)',
    example: '2024-01-15T08:00:00.000Z',
    format: 'date-time'
  })
  @IsDateString()
  @IsNotEmpty()
  desiredStartTime: string;

  @ApiProperty({
    description: 'Desired end date and time (ISO 8601)',
    example: '2024-01-15T10:00:00.000Z',
    format: 'date-time'
  })
  @IsDateString()
  @IsNotEmpty()
  desiredEndTime: string;

  @ApiProperty({
    description: 'Priority level for the waiting list entry',
    enum: WaitingListPriority,
    example: WaitingListPriority.MEDIUM,
    default: WaitingListPriority.MEDIUM,
    required: false
  })
  @IsOptional()
  @IsEnum(WaitingListPriority)
  priority?: WaitingListPriority = WaitingListPriority.MEDIUM;

  @ApiProperty({
    description: 'Time limit for confirmation in minutes',
    example: 10,
    minimum: 5,
    maximum: 60,
    default: 10,
    required: false
  })
  @IsOptional()
  @IsInt()
  @Min(5)
  @Max(60)
  @Transform(({ value }) => parseInt(value))
  confirmationTimeLimit?: number = 10;

  @ApiProperty({
    description: 'Reason for joining the waiting list',
    example: 'Need room for important presentation',
    required: false,
    maxLength: 500
  })
  @IsOptional()
  @IsString()
  @Length(0, 500)
  reason?: string;

  @ApiProperty({
    description: 'Program ID associated with the request',
    example: '550e8400-e29b-41d4-a716-446655440001',
    format: 'uuid',
    required: false
  })
  @IsOptional()
  @IsUUID()
  programId?: string;

  @ApiProperty({
    description: 'Accept alternative time slots',
    example: true,
    default: true,
    required: false
  })
  @IsOptional()
  @IsBoolean()
  @Transform(({ value }) => value === 'true' || value === true)
  acceptAlternatives?: boolean = true;

  @ApiProperty({
    description: 'Accept alternative resources of same type',
    example: false,
    default: false,
    required: false
  })
  @IsOptional()
  @IsBoolean()
  @Transform(({ value }) => value === 'true' || value === true)
  acceptAlternativeResources?: boolean = false;

  @ApiProperty({
    description: 'Maximum acceptable duration difference in minutes',
    example: 30,
    minimum: 0,
    maximum: 240,
    required: false
  })
  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(240)
  @Transform(({ value }) => parseInt(value))
  maxDurationDifference?: number;

  @ApiProperty({
    description: 'Minimum acceptable duration in minutes',
    example: 60,
    minimum: 15,
    maximum: 480,
    required: false
  })
  @IsOptional()
  @IsInt()
  @Min(15)
  @Max(480)
  @Transform(({ value }) => parseInt(value))
  minDuration?: number;

  @ApiProperty({
    description: 'Enable automatic notifications',
    example: true,
    default: true,
    required: false
  })
  @IsOptional()
  @IsBoolean()
  @Transform(({ value }) => value === 'true' || value === true)
  enableNotifications?: boolean = true;

  @ApiProperty({
    description: 'Notification methods',
    example: ['EMAIL', 'SMS'],
    type: [String],
    enum: ['EMAIL', 'SMS', 'PUSH'],
    required: false,
    isArray: true
  })
  @IsOptional()
  @IsString({ each: true })
  notificationMethods?: string[];

  @ApiProperty({
    description: 'Additional notes or requirements',
    example: 'Requires projector and sound system',
    required: false,
    maxLength: 1000
  })
  @IsOptional()
  @IsString()
  @Length(0, 1000)
  notes?: string;

  @ApiProperty({
    description: 'Tags for categorization',
    example: ['presentation', 'urgent', 'client-meeting'],
    type: [String],
    required: false,
    isArray: true,
    maxItems: 10
  })
  @IsOptional()
  @IsString({ each: true })
  @Length(1, 50, { each: true })
  tags?: string[];

  @ApiProperty({
    description: 'Expected number of attendees',
    example: 25,
    minimum: 1,
    maximum: 1000,
    required: false
  })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(1000)
  @Transform(({ value }) => parseInt(value))
  expectedAttendees?: number;

  @ApiProperty({
    description: 'Flexible start time range in minutes',
    example: 60,
    minimum: 0,
    maximum: 240,
    required: false
  })
  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(240)
  @Transform(({ value }) => parseInt(value))
  flexibleTimeRange?: number;

  @ApiProperty({
    description: 'Auto-accept if slot becomes available',
    example: false,
    default: false,
    required: false
  })
  @IsOptional()
  @IsBoolean()
  @Transform(({ value }) => value === 'true' || value === true)
  autoAccept?: boolean = false;

  @ApiProperty({
    description: 'Maximum wait time in hours',
    example: 24,
    minimum: 1,
    maximum: 168,
    required: false
  })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(168) // Max 1 week
  @Transform(({ value }) => parseInt(value))
  maxWaitTime?: number;
}
