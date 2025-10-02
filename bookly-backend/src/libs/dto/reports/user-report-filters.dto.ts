import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, IsDateString, IsEnum, IsArray, IsInt, Min, Max } from 'class-validator';
import { Transform } from 'class-transformer';

export enum ReservationStatus {
  PENDING = 'PENDING',
  CONFIRMED = 'CONFIRMED',
  CANCELLED = 'CANCELLED',
  COMPLETED = 'COMPLETED',
  NO_SHOW = 'NO_SHOW',
}

export enum UserType {
  STUDENT = 'STUDENT',
  TEACHER = 'TEACHER',
  ADMINISTRATIVE = 'ADMINISTRATIVE',
  GUARD = 'GUARD',
  ADMIN = 'ADMIN',
}

/**
 * DTO for RF-32: User/Professor report filters
 * Filters for generating reports about reservations made by specific users or professors
 */
export class UserReportFiltersDto {
  @ApiPropertyOptional({
    description: 'Specific user IDs to filter by',
    type: [String],
    example: ['60f7b3b3b3b3b3b3b3b3b3b3', '60f7b3b3b3b3b3b3b3b3b3b4'],
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  userIds?: string[];

  @ApiPropertyOptional({
    description: 'Filter by user email',
    type: [String],
    example: ['profesor@ufps.edu.co', 'estudiante@ufps.edu.co'],
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  userEmails?: string[];

  @ApiPropertyOptional({
    description: 'Filter by user type/role',
    enum: UserType,
    isArray: true,
    example: [UserType.TEACHER, UserType.STUDENT],
  })
  @IsOptional()
  @IsArray()
  @IsEnum(UserType, { each: true })
  userTypes?: UserType[];

  @ApiPropertyOptional({
    description: 'Academic program IDs to filter by',
    type: [String],
    example: ['60f7b3b3b3b3b3b3b3b3b3b3'],
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  programIds?: string[];

  @ApiPropertyOptional({
    description: 'Resource types to filter by',
    type: [String],
    example: ['CLASSROOM', 'LABORATORY', 'AUDITORIUM'],
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  resourceTypes?: string[];

  @ApiPropertyOptional({
    description: 'Reservation statuses to include',
    enum: ReservationStatus,
    isArray: true,
    example: [ReservationStatus.CONFIRMED, ReservationStatus.COMPLETED],
  })
  @IsOptional()
  @IsArray()
  @IsEnum(ReservationStatus, { each: true })
  statuses?: ReservationStatus[];

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
    description: 'Minimum number of reservations to include user in report',
    example: 1,
    minimum: 0,
  })
  @IsOptional()
  @IsInt()
  @Min(0)
  @Transform(({ value }) => parseInt(value))
  minReservations?: number = 0;

  @ApiPropertyOptional({
    description: 'Maximum number of reservations to include user in report',
    example: 100,
    minimum: 1,
  })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Transform(({ value }) => parseInt(value))
  maxReservations?: number;

  @ApiPropertyOptional({
    description: 'Include detailed reservation information',
    example: true,
    default: false,
  })
  @IsOptional()
  @Transform(({ value }) => value === 'true' || value === true)
  includeDetails?: boolean = false;

  @ApiPropertyOptional({
    description: 'Sort results by field',
    enum: ['reservationCount', 'lastName', 'email', 'utilizationRate', 'cancellationRate'],
    example: 'reservationCount',
  })
  @IsOptional()
  @IsString()
  sortBy?: 'reservationCount' | 'lastName' | 'email' | 'utilizationRate' | 'cancellationRate' = 'reservationCount';

  @ApiPropertyOptional({
    description: 'Sort order',
    enum: ['asc', 'desc'],
    example: 'desc',
  })
  @IsOptional()
  @IsString()
  sortOrder?: 'asc' | 'desc' = 'desc';

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
