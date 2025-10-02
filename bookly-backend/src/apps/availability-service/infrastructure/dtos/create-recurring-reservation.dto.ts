/**
 * DTO for creating recurring reservations (RF-12)
 */

import { ApiProperty } from '@nestjs/swagger';
import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsDateString,
  IsArray,
  IsInt,
  Min,
  Max,
  IsEnum,
  ArrayMinSize,
  ArrayMaxSize,
  IsUUID,
  Length,
  Matches
} from 'class-validator';
import { Transform } from 'class-transformer';
import { RecurrenceFrequency } from '../../utils';

export class CreateRecurringReservationDto {
  @ApiProperty({
    description: 'Title of the recurring reservation',
    example: 'Weekly Programming Class',
    minLength: 3,
    maxLength: 100
  })
  @IsString()
  @IsNotEmpty()
  @Length(3, 100)
  title: string;

  @ApiProperty({
    description: 'Description of the recurring reservation',
    example: 'Advanced programming course for computer science students',
    required: false,
    maxLength: 500
  })
  @IsOptional()
  @IsString()
  @Length(0, 500)
  description?: string;

  @ApiProperty({
    description: 'Resource ID to reserve',
    example: '550e8400-e29b-41d4-a716-446655440000',
    format: 'uuid'
  })
  @IsUUID()
  @IsNotEmpty()
  resourceId: string;

  @ApiProperty({
    description: 'Start date of the recurring reservation series (ISO 8601)',
    example: '2024-01-15T00:00:00.000Z',
    format: 'date-time'
  })
  @IsDateString()
  @IsNotEmpty()
  startDate: string;

  @ApiProperty({
    description: 'End date of the recurring reservation series (ISO 8601)',
    example: '2024-06-15T00:00:00.000Z',
    format: 'date-time'
  })
  @IsDateString()
  @IsNotEmpty()
  endDate: string;

  @ApiProperty({
    description: 'Start time for each reservation (HH:mm format)',
    example: '08:00',
    pattern: '^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$'
  })
  @IsString()
  @IsNotEmpty()
  @Matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, {
    message: 'Start time must be in HH:mm format'
  })
  startTime: string;

  @ApiProperty({
    description: 'End time for each reservation (HH:mm format)',
    example: '10:00',
    pattern: '^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$'
  })
  @IsString()
  @IsNotEmpty()
  @Matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, {
    message: 'End time must be in HH:mm format'
  })
  endTime: string;

  @ApiProperty({
    description: 'Frequency of the recurring reservation',
    enum: RecurrenceFrequency,
    example: RecurrenceFrequency.WEEKLY
  })
  @IsEnum(RecurrenceFrequency)
  @IsNotEmpty()
  frequency: RecurrenceFrequency;

  @ApiProperty({
    description: 'Interval between occurrences (e.g., every 2 weeks)',
    example: 1,
    minimum: 1,
    maximum: 12,
    default: 1
  })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(12)
  @Transform(({ value }) => parseInt(value))
  interval?: number = 1;

  @ApiProperty({
    description: 'Days of the week for weekly frequency (0=Sunday, 1=Monday, etc.)',
    example: [1, 3, 5],
    type: [Number],
    required: false,
    isArray: true,
    minItems: 1,
    maxItems: 7
  })
  @IsOptional()
  @IsArray()
  @ArrayMinSize(1)
  @ArrayMaxSize(7)
  @IsInt({ each: true })
  @Min(0, { each: true })
  @Max(6, { each: true })
  @Transform(({ value }) => Array.isArray(value) ? value.map(v => parseInt(v)) : [])
  daysOfWeek?: number[];

  @ApiProperty({
    description: 'Day of the month for monthly frequency (1-31)',
    example: 15,
    minimum: 1,
    maximum: 31,
    required: false
  })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(31)
  @Transform(({ value }) => parseInt(value))
  dayOfMonth?: number;

  @ApiProperty({
    description: 'Program ID associated with the reservation',
    example: '550e8400-e29b-41d4-a716-446655440001',
    format: 'uuid',
    required: false
  })
  @IsOptional()
  @IsUUID()
  programId?: string;

  @ApiProperty({
    description: 'Maximum number of instances to generate initially',
    example: 20,
    minimum: 1,
    maximum: 100,
    default: 20,
    required: false
  })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(100)
  @Transform(({ value }) => parseInt(value))
  maxInstances?: number = 20;

  @ApiProperty({
    description: 'Auto-confirm instances without approval',
    example: false,
    default: false,
    required: false
  })
  @IsOptional()
  @Transform(({ value }) => value === 'true' || value === true)
  autoConfirm?: boolean = false;

  @ApiProperty({
    description: 'Send notifications for each instance',
    example: true,
    default: true,
    required: false
  })
  @IsOptional()
  @Transform(({ value }) => value === 'true' || value === true)
  sendNotifications?: boolean = true;

  @ApiProperty({
    description: 'Additional notes or requirements',
    example: 'Requires projector and whiteboard',
    required: false,
    maxLength: 1000
  })
  @IsOptional()
  @IsString()
  @Length(0, 1000)
  notes?: string;

  @ApiProperty({
    description: 'Tags for categorization',
    example: ['programming', 'computer-science', 'weekly'],
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
    description: 'Priority level for conflict resolution',
    example: 'MEDIUM',
    enum: ['LOW', 'MEDIUM', 'HIGH'],
    default: 'MEDIUM',
    required: false
  })
  @IsOptional()
  @IsEnum(['LOW', 'MEDIUM', 'HIGH'])
  priority?: 'LOW' | 'MEDIUM' | 'HIGH' = 'MEDIUM';

  @ApiProperty({
    description: 'Allow overlapping with other reservations',
    example: false,
    default: false,
    required: false
  })
  @IsOptional()
  @Transform(({ value }) => value === 'true' || value === true)
  allowOverlap?: boolean = false;

  @ApiProperty({
    description: 'Require confirmation for each instance',
    example: true,
    default: true,
    required: false
  })
  @IsOptional()
  @Transform(({ value }) => value === 'true' || value === true)
  requireConfirmation?: boolean = true;

  @ApiProperty({
    description: 'Hours before event to send reminder',
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
  reminderHours?: number;

  @ApiProperty({
    description: 'Custom recurrence rule (for CUSTOM frequency)',
    example: 'FREQ=WEEKLY;BYDAY=MO,WE,FR;INTERVAL=2',
    required: false,
    maxLength: 200
  })
  @IsOptional()
  @IsString()
  @Length(0, 200)
  customRule?: string;
}
