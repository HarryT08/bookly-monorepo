/**
 * RF-12: Recurring Reservation Query DTO
 * Query parameters for filtering and pagination of recurring reservations
 */

import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsEnum, IsUUID, IsDateString, IsNumber, Min, Max, IsString, IsBoolean } from 'class-validator';
import { Transform, Type } from 'class-transformer';
import { RecurringReservationStatus, RecurrenceFrequency } from '../../utils';

export class RecurringReservationQueryDto {
  @ApiProperty({
    description: 'Filter by recurring reservation status',
    enum: RecurringReservationStatus,
    required: false,
    example: RecurringReservationStatus.ACTIVE
  })
  @IsOptional()
  @IsEnum(RecurringReservationStatus)
  status?: RecurringReservationStatus;

  @ApiProperty({
    description: 'Filter by recurrence frequency',
    enum: RecurrenceFrequency,
    required: false,
    example: RecurrenceFrequency.WEEKLY
  })
  @IsOptional()
  @IsEnum(RecurrenceFrequency)
  frequency?: RecurrenceFrequency;

  @ApiProperty({
    description: 'Filter by resource ID',
    required: false,
    example: 'resource456-789-012'
  })
  @IsOptional()
  @IsUUID()
  resourceId?: string;

  @ApiProperty({
    description: 'Filter by user ID (owner of the recurring reservation)',
    required: false,
    example: 'user123-456-789'
  })
  @IsOptional()
  @IsUUID()
  userId?: string;

  @ApiProperty({
    description: 'Filter by program ID',
    required: false,
    example: 'program789-012-345'
  })
  @IsOptional()
  @IsUUID()
  programId?: string;

  @ApiProperty({
    description: 'Filter reservations starting from this date',
    required: false,
    example: '2024-03-15T00:00:00Z'
  })
  @IsOptional()
  @IsDateString()
  startFrom?: string;

  @ApiProperty({
    description: 'Filter reservations ending before this date',
    required: false,
    example: '2024-06-15T23:59:59Z'
  })
  @IsOptional()
  @IsDateString()
  endBefore?: string;

  @ApiProperty({
    description: 'Filter by resource type',
    required: false,
    example: 'CLASSROOM'
  })
  @IsOptional()
  @IsString()
  resourceType?: string;

  @ApiProperty({
    description: 'Filter by minimum capacity',
    required: false,
    example: 20
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  minCapacity?: number;

  @ApiProperty({
    description: 'Filter by maximum capacity',
    required: false,
    example: 100
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  maxCapacity?: number;

  @ApiProperty({
    description: 'Filter by day of the week (0=Sunday, 1=Monday, etc.)',
    required: false,
    example: 1
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  @Max(6)
  dayOfWeek?: number;

  @ApiProperty({
    description: 'Filter by time of day (HH:MM format)',
    required: false,
    example: '09:00'
  })
  @IsOptional()
  @IsString()
  timeOfDay?: string;

  @ApiProperty({
    description: 'Include only reservations with conflicts',
    required: false,
    default: false
  })
  @IsOptional()
  @Transform(({ value }) => value === 'true' || value === true)
  @IsBoolean()
  hasConflicts?: boolean = false;

  @ApiProperty({
    description: 'Include expired reservations',
    required: false,
    default: false
  })
  @IsOptional()
  @Transform(({ value }) => value === 'true' || value === true)
  @IsBoolean()
  includeExpired?: boolean = false;

  @ApiProperty({
    description: 'Page number for pagination',
    required: false,
    default: 1,
    minimum: 1,
    example: 1
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  page?: number = 1;

  @ApiProperty({
    description: 'Number of items per page',
    required: false,
    default: 10,
    minimum: 1,
    maximum: 100,
    example: 10
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  @Max(100)
  limit?: number = 10;

  @ApiProperty({
    description: 'Sort field',
    required: false,
    enum: ['createdAt', 'startDate', 'endDate', 'pattern', 'status'],
    default: 'createdAt',
    example: 'createdAt'
  })
  @IsOptional()
  @IsString()
  sortBy?: string = 'createdAt';

  @ApiProperty({
    description: 'Sort order',
    required: false,
    enum: ['ASC', 'DESC'],
    default: 'DESC',
    example: 'DESC'
  })
  @IsOptional()
  @IsEnum(['ASC', 'DESC'])
  sortOrder?: 'ASC' | 'DESC' = 'DESC';

  @ApiProperty({
    description: 'Include user information in response',
    required: false,
    default: false
  })
  @IsOptional()
  @Transform(({ value }) => value === 'true' || value === true)
  @IsBoolean()
  includeUser?: boolean = false;

  @ApiProperty({
    description: 'Include resource information in response',
    required: false,
    default: false
  })
  @IsOptional()
  @Transform(({ value }) => value === 'true' || value === true)
  @IsBoolean()
  includeResource?: boolean = false;

  @ApiProperty({
    description: 'Include instance statistics in response',
    required: false,
    default: false
  })
  @IsOptional()
  @Transform(({ value }) => value === 'true' || value === true)
  @IsBoolean()
  includeStats?: boolean = false;

  @ApiProperty({
    description: 'Search term for filtering by title, description, or resource name',
    required: false,
    example: 'weekly meeting'
  })
  @IsOptional()
  @IsString()
  search?: string;
}
