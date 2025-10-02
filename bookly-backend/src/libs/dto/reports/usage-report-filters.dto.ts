import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, IsDateString, IsEnum, IsArray, IsInt, Min, Max } from 'class-validator';
import { Transform } from 'class-transformer';

export enum ResourceType {
  CLASSROOM = 'CLASSROOM',
  LABORATORY = 'LABORATORY',
  AUDITORIUM = 'AUDITORIUM',
  EQUIPMENT = 'EQUIPMENT',
  SPORTS_FACILITY = 'SPORTS_FACILITY',
  LIBRARY_SPACE = 'LIBRARY_SPACE',
}

export enum ReportPeriod {
  DAILY = 'DAILY',
  WEEKLY = 'WEEKLY',
  MONTHLY = 'MONTHLY',
  QUARTERLY = 'QUARTERLY',
  SEMESTER = 'SEMESTER',
  ANNUAL = 'ANNUAL',
  CUSTOM = 'CUSTOM',
}

/**
 * DTO for RF-31: Usage report filters
 * Filters for generating reports about resource utilization by academic program, period, and resource type
 */
export class UsageReportFiltersDto {
  @ApiPropertyOptional({
    description: 'Academic program IDs to filter by',
    type: [String],
    example: ['60f7b3b3b3b3b3b3b3b3b3b3', '60f7b3b3b3b3b3b3b3b3b3b4'],
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  programIds?: string[];

  @ApiPropertyOptional({
    description: 'Subject/course names to filter by',
    type: [String],
    example: ['Matemáticas I', 'Física II', 'Programación Web'],
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  subjects?: string[];

  @ApiPropertyOptional({
    description: 'Resource types to filter by',
    enum: ResourceType,
    isArray: true,
    example: [ResourceType.CLASSROOM, ResourceType.LABORATORY],
  })
  @IsOptional()
  @IsArray()
  @IsEnum(ResourceType, { each: true })
  resourceTypes?: ResourceType[];

  @ApiPropertyOptional({
    description: 'Category IDs to filter by',
    type: [String],
    example: ['60f7b3b3b3b3b3b3b3b3b3b3'],
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  categoryIds?: string[];

  @ApiPropertyOptional({
    description: 'Specific resource IDs to filter by',
    type: [String],
    example: ['60f7b3b3b3b3b3b3b3b3b3b3'],
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  resourceIds?: string[];

  @ApiPropertyOptional({
    description: 'Start date for the report period (ISO 8601 format)',
    example: '2024-01-01T00:00:00.000Z',
  })
  @IsOptional()
  @IsDateString()
  startDate?: string;

  @ApiPropertyOptional({
    description: 'End date for the report period (ISO 8601 format)',
    example: '2024-12-31T23:59:59.999Z',
  })
  @IsOptional()
  @IsDateString()
  endDate?: string;

  @ApiPropertyOptional({
    description: 'Predefined report period',
    enum: ReportPeriod,
    example: ReportPeriod.MONTHLY,
  })
  @IsOptional()
  @IsEnum(ReportPeriod)
  period?: ReportPeriod;

  @ApiPropertyOptional({
    description: 'Include cancelled reservations in the report',
    example: false,
    default: false,
  })
  @IsOptional()
  @Transform(({ value }) => value === 'true' || value === true)
  includeCancelled?: boolean = false;

  @ApiPropertyOptional({
    description: 'Include pending reservations in the report',
    example: true,
    default: true,
  })
  @IsOptional()
  @Transform(({ value }) => value === 'true' || value === true)
  includePending?: boolean = true;

  @ApiPropertyOptional({
    description: 'Group results by this field',
    enum: ['program', 'subject', 'resourceType', 'category', 'day', 'week', 'month'],
    example: 'program',
  })
  @IsOptional()
  @IsString()
  groupBy?: 'program' | 'subject' | 'resourceType' | 'category' | 'day' | 'week' | 'month';

  @ApiPropertyOptional({
    description: 'Page number for pagination',
    example: 1,
    minimum: 1,
  })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Transform(({ value }) => parseInt(value))
  page?: number = 1;

  @ApiPropertyOptional({
    description: 'Number of items per page',
    example: 50,
    minimum: 1,
    maximum: 1000,
  })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(1000)
  @Transform(({ value }) => parseInt(value))
  limit?: number = 50;
}
