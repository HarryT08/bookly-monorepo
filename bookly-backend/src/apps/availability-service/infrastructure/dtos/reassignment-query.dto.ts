/**
 * RF-15: Reassignment Query DTO
 * Query parameters for filtering and pagination of reassignment requests
 */

import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsEnum, IsUUID, IsDateString, IsNumber, Min, Max, IsString, IsBoolean } from 'class-validator';
import { Transform, Type } from 'class-transformer';
import { ReassignmentStatus, ReassignmentReason, ReassignmentPriority } from '../../utils';

export class ReassignmentQueryDto {
  @ApiProperty({
    description: 'Filter by reassignment status',
    enum: ReassignmentStatus,
    required: false,
    example: ReassignmentStatus.PENDING
  })
  @IsOptional()
  @IsEnum(ReassignmentStatus)
  status?: ReassignmentStatus;

  @ApiProperty({
    description: 'Filter by reassignment reason',
    enum: ReassignmentReason,
    required: false,
    example: ReassignmentReason.RESOURCE_UNAVAILABLE
  })
  @IsOptional()
  @IsEnum(ReassignmentReason)
  reason?: ReassignmentReason;

  @ApiProperty({
    description: 'Filter by priority level',
    enum: ReassignmentPriority,
    required: false,
    example: ReassignmentPriority.MEDIUM
  })
  @IsOptional()
  @IsEnum(ReassignmentPriority)
  priority?: ReassignmentPriority;

  @ApiProperty({
    description: 'Filter by user ID (requester)',
    required: false,
    example: 'user123-456-789'
  })
  @IsOptional()
  @IsUUID()
  userId?: string;

  @ApiProperty({
    description: 'Filter by original resource ID',
    required: false,
    example: 'resource456-789-012'
  })
  @IsOptional()
  @IsUUID()
  originalResourceId?: string;

  @ApiProperty({
    description: 'Filter by suggested resource ID',
    required: false,
    example: 'resource789-012-345'
  })
  @IsOptional()
  @IsUUID()
  suggestedResourceId?: string;

  @ApiProperty({
    description: 'Filter by reservation ID',
    required: false,
    example: 'reservation012-345-678'
  })
  @IsOptional()
  @IsUUID()
  reservationId?: string;

  @ApiProperty({
    description: 'Filter by program ID',
    required: false,
    example: 'program345-678-901'
  })
  @IsOptional()
  @IsUUID()
  programId?: string;

  @ApiProperty({
    description: 'Filter requests created from this date',
    required: false,
    example: '2024-03-15T00:00:00Z'
  })
  @IsOptional()
  @IsDateString()
  createdFrom?: string;

  @ApiProperty({
    description: 'Filter requests created until this date',
    required: false,
    example: '2024-03-20T23:59:59Z'
  })
  @IsOptional()
  @IsDateString()
  createdTo?: string;

  @ApiProperty({
    description: 'Filter by response deadline from this date',
    required: false,
    example: '2024-03-16T00:00:00Z'
  })
  @IsOptional()
  @IsDateString()
  deadlineFrom?: string;

  @ApiProperty({
    description: 'Filter by response deadline until this date',
    required: false,
    example: '2024-03-18T23:59:59Z'
  })
  @IsOptional()
  @IsDateString()
  deadlineTo?: string;

  @ApiProperty({
    description: 'Filter by resource type',
    required: false,
    example: 'CLASSROOM'
  })
  @IsOptional()
  @IsString()
  resourceType?: string;

  @ApiProperty({
    description: 'Filter by minimum resource capacity',
    required: false,
    example: 20
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  minCapacity?: number;

  @ApiProperty({
    description: 'Filter by maximum resource capacity',
    required: false,
    example: 100
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  maxCapacity?: number;

  @ApiProperty({
    description: 'Include only urgent requests',
    required: false,
    default: false
  })
  @IsOptional()
  @Transform(({ value }) => value === 'true' || value === true)
  @IsBoolean()
  urgentOnly?: boolean = false;

  @ApiProperty({
    description: 'Include only overdue requests',
    required: false,
    default: false
  })
  @IsOptional()
  @Transform(({ value }) => value === 'true' || value === true)
  @IsBoolean()
  overdueOnly?: boolean = false;

  @ApiProperty({
    description: 'Include processed requests',
    required: false,
    default: true
  })
  @IsOptional()
  @Transform(({ value }) => value === 'false' ? false : true)
  @IsBoolean()
  includeProcessed?: boolean = true;

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
    enum: ['createdAt', 'updatedAt', 'priority', 'status', 'responseDeadline'],
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
    description: 'Include reservation information in response',
    required: false,
    default: false
  })
  @IsOptional()
  @Transform(({ value }) => value === 'true' || value === true)
  @IsBoolean()
  includeReservation?: boolean = false;

  @ApiProperty({
    description: 'Search term for filtering by description, user name, or resource name',
    required: false,
    example: 'technical issues'
  })
  @IsOptional()
  @IsString()
  search?: string;
}
