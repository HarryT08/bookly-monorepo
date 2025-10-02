import { IsString, IsOptional, IsObject, IsEnum, IsDateString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export enum ReservationAction {
  CREATED = 'CREATED',
  MODIFIED = 'MODIFIED',
  CANCELLED = 'CANCELLED',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED',
  COMPLETED = 'COMPLETED'
}

/**
 * DTO for creating reservation history entries (RF-11)
 * Tracks all actions performed on reservations for audit trail
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
    example: '507f1f77bcf86cd799439012'
  })
  @IsString()
  userId: string;

  @ApiProperty({
    description: 'Action performed',
    enum: ReservationAction,
    example: ReservationAction.CREATED
  })
  @IsEnum(ReservationAction)
  action: ReservationAction;

  @ApiProperty({
    description: 'Previous state data',
    example: { status: 'PENDING', startDate: '2024-01-15T09:00:00.000Z' },
    required: false
  })
  @IsOptional()
  @IsObject()
  previousData?: any;

  @ApiProperty({
    description: 'New state data',
    example: { status: 'APPROVED', startDate: '2024-01-15T10:00:00.000Z' }
  })
  @IsObject()
  newData: any;

  @ApiProperty({
    description: 'Reason for the change',
    example: 'Resource conflict resolved',
    required: false
  })
  @IsOptional()
  @IsString()
  reason?: string;

  @ApiProperty({
    description: 'IP address of the user',
    example: '192.168.1.100',
    required: false
  })
  @IsOptional()
  @IsString()
  ipAddress?: string;

  @ApiProperty({
    description: 'User agent string',
    example: 'Mozilla/5.0...',
    required: false
  })
  @IsOptional()
  @IsString()
  userAgent?: string;
}

/**
 * DTO for querying reservation history (RF-11)
 */
export class ReservationHistoryQueryDto {
  @ApiProperty({
    description: 'Reservation ID to filter by',
    example: '507f1f77bcf86cd799439011',
    required: false
  })
  @IsOptional()
  @IsString()
  reservationId?: string;

  @ApiProperty({
    description: 'User ID to filter by',
    example: '507f1f77bcf86cd799439012',
    required: false
  })
  @IsOptional()
  @IsString()
  userId?: string;

  @ApiProperty({
    description: 'Resource ID to filter by',
    example: '507f1f77bcf86cd799439013',
    required: false
  })
  @IsOptional()
  @IsString()
  resourceId?: string;

  @ApiProperty({
    description: 'Action to filter by',
    enum: ReservationAction,
    required: false
  })
  @IsOptional()
  @IsEnum(ReservationAction)
  action?: ReservationAction;

  @ApiProperty({
    description: 'Start date for filtering',
    example: '2024-01-01T00:00:00.000Z',
    required: false
  })
  @IsOptional()
  @IsDateString()
  startDate?: string;

  @ApiProperty({
    description: 'End date for filtering',
    example: '2024-12-31T23:59:59.999Z',
    required: false
  })
  @IsOptional()
  @IsDateString()
  endDate?: string;

  @ApiProperty({
    description: 'Page number for pagination',
    example: 1,
    required: false
  })
  @IsOptional()
  page?: number = 1;

  @ApiProperty({
    description: 'Items per page',
    example: 20,
    required: false
  })
  @IsOptional()
  limit?: number = 20;
}
