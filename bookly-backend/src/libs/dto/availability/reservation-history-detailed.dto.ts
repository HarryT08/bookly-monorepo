import { IsString, IsDateString, IsOptional, IsEnum, IsObject, IsInt, Min, Max } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export enum HistoryAction {
  CREATED = 'CREATED',
  UPDATED = 'UPDATED',
  CANCELLED = 'CANCELLED',
  CONFIRMED = 'CONFIRMED',
  REJECTED = 'REJECTED',
  RESCHEDULED = 'RESCHEDULED',
  CHECKED_IN = 'CHECKED_IN',
  CHECKED_OUT = 'CHECKED_OUT',
  NO_SHOW = 'NO_SHOW'
}

export enum HistorySource {
  USER = 'USER',
  SYSTEM = 'SYSTEM',
  ADMIN = 'ADMIN',
  API = 'API',
  CALENDAR_SYNC = 'CALENDAR_SYNC'
}

/**
 * DTO for creating reservation history entries (RF-11)
 * Records all actions performed on reservations for audit trail
 */
export class CreateReservationHistoryDto {
  @ApiProperty({
    description: 'Reservation ID',
    example: '507f1f77bcf86cd799439011'
  })
  @IsString()
  reservationId: string;

  @ApiProperty({
    description: 'User ID who performed the action',
    example: 'prof-martinez-123'
  })
  @IsString()
  userId: string;

  @ApiProperty({
    description: 'Action performed',
    enum: HistoryAction,
    example: HistoryAction.CREATED
  })
  @IsEnum(HistoryAction)
  action: HistoryAction;

  @ApiProperty({
    description: 'Source of the action',
    enum: HistorySource,
    example: HistorySource.USER
  })
  @IsEnum(HistorySource)
  source: HistorySource;

  @ApiProperty({
    description: 'Previous data before the change',
    required: false,
    example: { title: 'Old Meeting', startDate: '2024-01-15T10:00:00Z' }
  })
  @IsOptional()
  @IsObject()
  previousData?: any;

  @ApiProperty({
    description: 'New data after the change',
    required: false,
    example: { title: 'New Meeting', startDate: '2024-01-15T11:00:00Z' }
  })
  @IsOptional()
  @IsObject()
  newData?: any;

  @ApiProperty({
    description: 'Additional details or reason for the action',
    required: false,
    example: 'Rescheduled due to conflict with another meeting'
  })
  @IsOptional()
  @IsString()
  details?: string;

  @ApiProperty({
    description: 'IP address of the user (for security audit)',
    required: false,
    example: '192.168.1.100'
  })
  @IsOptional()
  @IsString()
  ipAddress?: string;

  @ApiProperty({
    description: 'User agent string (for security audit)',
    required: false,
    example: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
  })
  @IsOptional()
  @IsString()
  userAgent?: string;
}

/**
 * DTO for querying detailed reservation history (RF-11)
 * Supports advanced filtering and pagination
 */
export class ReservationHistoryDetailedQueryDto {
  @ApiProperty({
    description: 'Reservation ID to filter by',
    required: false,
    example: '507f1f77bcf86cd799439011'
  })
  @IsOptional()
  @IsString()
  reservationId?: string;

  @ApiProperty({
    description: 'User ID to filter by',
    required: false,
    example: 'prof-martinez-123'
  })
  @IsOptional()
  @IsString()
  userId?: string;

  @ApiProperty({
    description: 'Resource ID to filter by',
    required: false,
    example: 'classroom-a101'
  })
  @IsOptional()
  @IsString()
  resourceId?: string;

  @ApiProperty({
    description: 'Actions to filter by',
    enum: HistoryAction,
    isArray: true,
    required: false,
    example: [HistoryAction.CREATED, HistoryAction.UPDATED]
  })
  @IsOptional()
  @IsEnum(HistoryAction, { each: true })
  actions?: HistoryAction[];

  @ApiProperty({
    description: 'Sources to filter by',
    enum: HistorySource,
    isArray: true,
    required: false,
    example: [HistorySource.USER, HistorySource.ADMIN]
  })
  @IsOptional()
  @IsEnum(HistorySource, { each: true })
  sources?: HistorySource[];

  @ApiProperty({
    description: 'Start date for filtering',
    required: false,
    example: '2024-01-01T00:00:00.000Z'
  })
  @IsOptional()
  @IsDateString()
  startDate?: string;

  @ApiProperty({
    description: 'End date for filtering',
    required: false,
    example: '2024-01-31T23:59:59.999Z'
  })
  @IsOptional()
  @IsDateString()
  endDate?: string;

  @ApiProperty({
    description: 'Page number for pagination',
    minimum: 1,
    default: 1,
    required: false
  })
  @IsOptional()
  @IsInt()
  @Min(1)
  page?: number = 1;

  @ApiProperty({
    description: 'Items per page',
    minimum: 1,
    maximum: 100,
    default: 20,
    required: false
  })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(100)
  limit?: number = 20;

  @ApiProperty({
    description: 'Sort field',
    enum: ['createdAt', 'action', 'userId'],
    default: 'createdAt',
    required: false
  })
  @IsOptional()
  @IsString()
  sortBy?: string = 'createdAt';

  @ApiProperty({
    description: 'Sort order',
    enum: ['asc', 'desc'],
    default: 'desc',
    required: false
  })
  @IsOptional()
  @IsString()
  sortOrder?: 'asc' | 'desc' = 'desc';

  @ApiProperty({
    description: 'Include related reservation data',
    default: false,
    required: false
  })
  @IsOptional()
  includeReservationData?: boolean = false;

  @ApiProperty({
    description: 'Include user information',
    default: false,
    required: false
  })
  @IsOptional()
  includeUserData?: boolean = false;
}

/**
 * Response DTO for reservation history entries (RF-11)
 */
export class ReservationHistoryEntryDto {
  @ApiProperty({
    description: 'History entry ID',
    example: 'history-123'
  })
  id: string;

  @ApiProperty({
    description: 'Reservation ID',
    example: '507f1f77bcf86cd799439011'
  })
  reservationId: string;

  @ApiProperty({
    description: 'User ID who performed the action',
    example: 'prof-martinez-123'
  })
  userId: string;

  @ApiProperty({
    description: 'Action performed',
    enum: HistoryAction
  })
  action: HistoryAction;

  @ApiProperty({
    description: 'Source of the action',
    enum: HistorySource
  })
  source: HistorySource;

  @ApiProperty({
    description: 'Previous data before the change',
    required: false
  })
  previousData?: any;

  @ApiProperty({
    description: 'New data after the change',
    required: false
  })
  newData?: any;

  @ApiProperty({
    description: 'Additional details or reason',
    required: false
  })
  details?: string;

  @ApiProperty({
    description: 'IP address',
    required: false
  })
  ipAddress?: string;

  @ApiProperty({
    description: 'User agent',
    required: false
  })
  userAgent?: string;

  @ApiProperty({
    description: 'Timestamp of the action',
    example: '2024-01-15T10:30:00.000Z'
  })
  createdAt: Date;

  @ApiProperty({
    description: 'Related reservation data',
    required: false
  })
  reservation?: {
    id: string;
    title: string;
    resourceId: string;
    startDate: Date;
    endDate: Date;
    status: string;
  };

  @ApiProperty({
    description: 'User information',
    required: false
  })
  user?: {
    id: string;
    name: string;
    email: string;
    role: string;
  };
}

/**
 * Response DTO for paginated reservation history (RF-11)
 */
export class ReservationHistoryResponseDto {
  @ApiProperty({
    description: 'History entries',
    type: [ReservationHistoryEntryDto]
  })
  entries: ReservationHistoryEntryDto[];

  @ApiProperty({
    description: 'Pagination information'
  })
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };

  @ApiProperty({
    description: 'Summary statistics'
  })
  summary: {
    totalEntries: number;
    actionCounts: Record<HistoryAction, number>;
    sourceCounts: Record<HistorySource, number>;
    uniqueUsers: number;
    uniqueReservations: number;
    dateRange: {
      earliest: Date;
      latest: Date;
    };
  };

  @ApiProperty({
    description: 'Applied filters'
  })
  filters: ReservationHistoryDetailedQueryDto;
}
