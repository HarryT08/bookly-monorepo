/**
 * RF-14: Waiting List Query DTO
 * Query parameters for filtering and pagination of waiting list entries
 */

import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsEnum, IsUUID, IsDateString, IsNumber, Min, Max, IsString } from 'class-validator';
import { Transform, Type } from 'class-transformer';
import { WaitingListStatus, WaitingListPriority } from '../../utils';

export class WaitingListQueryDto {
  @ApiProperty({
    description: 'Filter by waiting list status',
    enum: WaitingListStatus,
    required: false,
    example: WaitingListStatus.ACTIVE
  })
  @IsOptional()
  @IsEnum(WaitingListStatus)
  status?: WaitingListStatus;

  @ApiProperty({
    description: 'Filter by user priority level',
    enum: WaitingListPriority,
    required: false,
    example: WaitingListPriority.LOW
  })
  @IsOptional()
  @IsEnum(WaitingListPriority)
  priority?: WaitingListPriority;

  @ApiProperty({
    description: 'Filter by resource ID',
    required: false,
    example: 'resource456-789-012'
  })
  @IsOptional()
  @IsUUID()
  resourceId?: string;

  @ApiProperty({
    description: 'Filter by user ID',
    required: false,
    example: 'user123-456-789'
  })
  @IsOptional()
  @IsUUID()
  userId?: string;

  @ApiProperty({
    description: 'Filter entries from this date',
    required: false,
    example: '2024-03-15T00:00:00Z'
  })
  @IsOptional()
  @IsDateString()
  fromDate?: string;

  @ApiProperty({
    description: 'Filter entries until this date',
    required: false,
    example: '2024-03-20T23:59:59Z'
  })
  @IsOptional()
  @IsDateString()
  toDate?: string;

  @ApiProperty({
    description: 'Filter by resource type',
    required: false,
    example: 'CLASSROOM'
  })
  @IsOptional()
  @IsString()
  resourceType?: string;

  @ApiProperty({
    description: 'Filter by program ID',
    required: false,
    example: 'program789-012-345'
  })
  @IsOptional()
  @IsUUID()
  programId?: string;

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
    enum: ['createdAt', 'position', 'priority', 'requestedStartTime'],
    default: 'position',
    example: 'position'
  })
  @IsOptional()
  @IsString()
  sortBy?: string = 'position';

  @ApiProperty({
    description: 'Sort order',
    required: false,
    enum: ['ASC', 'DESC'],
    default: 'ASC',
    example: 'ASC'
  })
  @IsOptional()
  @IsEnum(['ASC', 'DESC'])
  sortOrder?: 'ASC' | 'DESC' = 'ASC';

  @ApiProperty({
    description: 'Include expired entries',
    required: false,
    default: false,
    example: false
  })
  @IsOptional()
  @Transform(({ value }) => value === 'true' || value === true)
  includeExpired?: boolean = false;

  @ApiProperty({
    description: 'Include user information in response',
    required: false,
    default: false,
    example: false
  })
  @IsOptional()
  @Transform(({ value }) => value === 'true' || value === true)
  includeUser?: boolean = false;

  @ApiProperty({
    description: 'Include resource information in response',
    required: false,
    default: false,
    example: false
  })
  @IsOptional()
  @Transform(({ value }) => value === 'true' || value === true)
  includeResource?: boolean = false;

  @ApiProperty({
    description: 'Search term for filtering by user name or resource name',
    required: false,
    example: 'John Doe'
  })
  @IsOptional()
  @IsString()
  search?: string;
}
