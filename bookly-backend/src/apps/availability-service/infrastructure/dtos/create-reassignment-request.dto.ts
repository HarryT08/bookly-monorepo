/**
 * DTO for creating reassignment requests (RF-15)
 */

import { ApiProperty } from '@nestjs/swagger';
import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsUUID,
  IsEnum,
  IsBoolean,
  IsDateString,
  Length,
  IsArray,
  ArrayMaxSize
} from 'class-validator';
import { Transform } from 'class-transformer';
import { ReassignmentPriority, ReassignmentReason } from '../../utils';

export class CreateReassignmentRequestDto {
  @ApiProperty({
    description: 'Original reservation ID to be reassigned',
    example: '550e8400-e29b-41d4-a716-446655440000',
    format: 'uuid'
  })
  @IsUUID()
  @IsNotEmpty()
  originalReservationId: string;

  @ApiProperty({
    description: 'Reason for the reassignment request',
    enum: ReassignmentReason,
    example: ReassignmentReason.RESOURCE_UNAVAILABLE
  })
  @IsEnum(ReassignmentReason)
  @IsNotEmpty()
  reason: ReassignmentReason;

  @ApiProperty({
    description: 'Detailed explanation of the reassignment reason',
    example: 'Original room is under maintenance due to HVAC system repair',
    minLength: 10,
    maxLength: 1000
  })
  @IsString()
  @IsNotEmpty()
  @Length(10, 1000)
  reasonDescription: string;

  @ApiProperty({
    description: 'Suggested alternative resource ID',
    example: '550e8400-e29b-41d4-a716-446655440001',
    format: 'uuid',
    required: false
  })
  @IsOptional()
  @IsUUID()
  suggestedResourceId?: string;

  @ApiProperty({
    description: 'Priority level for the reassignment request',
    enum: ReassignmentPriority,
    example: ReassignmentPriority.MEDIUM,
    default: ReassignmentPriority.MEDIUM,
    required: false
  })
  @IsOptional()
  @IsEnum(ReassignmentPriority)
  priority?: ReassignmentPriority = ReassignmentPriority.MEDIUM;

  @ApiProperty({
    description: 'Response deadline (ISO 8601)',
    example: '2024-01-15T18:00:00.000Z',
    format: 'date-time',
    required: false
  })
  @IsOptional()
  @IsDateString()
  responseDeadline?: string;

  @ApiProperty({
    description: 'Accept equivalent resources automatically',
    example: true,
    default: true,
    required: false
  })
  @IsOptional()
  @IsBoolean()
  @Transform(({ value }) => value === 'true' || value === true)
  acceptEquivalentResources?: boolean = true;

  @ApiProperty({
    description: 'Accept alternative time slots',
    example: false,
    default: false,
    required: false
  })
  @IsOptional()
  @IsBoolean()
  @Transform(({ value }) => value === 'true' || value === true)
  acceptAlternativeTimeSlots?: boolean = false;

  @ApiProperty({
    description: 'Maximum acceptable capacity difference percentage',
    example: 10,
    minimum: 0,
    maximum: 50,
    required: false
  })
  @IsOptional()
  capacityTolerancePercent?: number;

  @ApiProperty({
    description: 'Required resource features',
    example: ['PROJECTOR', 'WHITEBOARD', 'SOUND_SYSTEM'],
    type: [String],
    required: false,
    isArray: true,
    maxItems: 20
  })
  @IsOptional()
  @IsArray()
  @ArrayMaxSize(20)
  @IsString({ each: true })
  requiredFeatures?: string[];

  @ApiProperty({
    description: 'Preferred resource features',
    example: ['AIR_CONDITIONING', 'NATURAL_LIGHT'],
    type: [String],
    required: false,
    isArray: true,
    maxItems: 20
  })
  @IsOptional()
  @IsArray()
  @ArrayMaxSize(20)
  @IsString({ each: true })
  preferredFeatures?: string[];

  @ApiProperty({
    description: 'Maximum distance from original resource in meters',
    example: 100,
    minimum: 0,
    maximum: 5000,
    required: false
  })
  @IsOptional()
  maxDistanceMeters?: number;

  @ApiProperty({
    description: 'Notify user immediately about the request',
    example: true,
    default: true,
    required: false
  })
  @IsOptional()
  @IsBoolean()
  @Transform(({ value }) => value === 'true' || value === true)
  notifyUser?: boolean = true;

  @ApiProperty({
    description: 'Notification methods',
    example: ['EMAIL', 'SMS'],
    type: [String],
    enum: ['EMAIL', 'SMS', 'PUSH', 'IN_APP'],
    required: false,
    isArray: true
  })
  @IsOptional()
  @IsString({ each: true })
  notificationMethods?: string[];

  @ApiProperty({
    description: 'Auto-process if only one suitable alternative found',
    example: false,
    default: false,
    required: false
  })
  @IsOptional()
  @IsBoolean()
  @Transform(({ value }) => value === 'true' || value === true)
  autoProcessSingleOption?: boolean = false;

  @ApiProperty({
    description: 'Include compensation or benefits information',
    example: 'Upgraded to premium room with additional equipment',
    required: false,
    maxLength: 500
  })
  @IsOptional()
  @IsString()
  @Length(0, 500)
  compensationInfo?: string;

  @ApiProperty({
    description: 'Internal notes for administrators',
    example: 'Urgent maintenance required, coordinate with facilities team',
    required: false,
    maxLength: 1000
  })
  @IsOptional()
  @IsString()
  @Length(0, 1000)
  internalNotes?: string;

  @ApiProperty({
    description: 'Tags for categorization and tracking',
    example: ['maintenance', 'urgent', 'hvac-repair'],
    type: [String],
    required: false,
    isArray: true,
    maxItems: 10
  })
  @IsOptional()
  @IsArray()
  @ArrayMaxSize(10)
  @IsString({ each: true })
  @Length(1, 50, { each: true })
  tags?: string[];

  @ApiProperty({
    description: 'Expected impact on user experience (1-5 scale)',
    example: 2,
    minimum: 1,
    maximum: 5,
    required: false
  })
  @IsOptional()
  impactLevel?: number;

  @ApiProperty({
    description: 'Estimated time to resolve in hours',
    example: 24,
    minimum: 1,
    maximum: 168,
    required: false
  })
  @IsOptional()
  estimatedResolutionHours?: number;

  @ApiProperty({
    description: 'Reference to related maintenance or incident ticket',
    example: 'MAINT-2024-001',
    required: false,
    maxLength: 100
  })
  @IsOptional()
  @IsString()
  @Length(0, 100)
  relatedTicketId?: string;

  @ApiProperty({
    description: 'Department or program affected',
    example: '550e8400-e29b-41d4-a716-446655440002',
    format: 'uuid',
    required: false
  })
  @IsOptional()
  @IsUUID()
  affectedProgramId?: string;

  @ApiProperty({
    description: 'Minimum advance notice required for user in hours',
    example: 2,
    minimum: 0,
    maximum: 72,
    required: false
  })
  @IsOptional()
  minAdvanceNoticeHours?: number;

  @ApiProperty({
    description: 'Allow partial time slot reassignment',
    example: false,
    default: false,
    required: false
  })
  @IsOptional()
  @IsBoolean()
  @Transform(({ value }) => value === 'true' || value === true)
  allowPartialReassignment?: boolean = false;

  @ApiProperty({
    description: 'Require user confirmation before processing',
    example: true,
    default: true,
    required: false
  })
  @IsOptional()
  @IsBoolean()
  @Transform(({ value }) => value === 'true' || value === true)
  requireUserConfirmation?: boolean = true;
}
