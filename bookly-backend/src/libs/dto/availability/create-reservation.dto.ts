import { IsString, IsDateString, IsOptional, IsBoolean, IsObject } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

/**
 * DTO for creating reservations
 * Supports both simple and recurring reservations
 */
export class CreateReservationDto {
  @ApiProperty({
    description: 'Reservation title',
    example: 'Team Meeting'
  })
  @IsString()
  title: string;

  @ApiProperty({
    description: 'Reservation description',
    example: 'Weekly team standup meeting',
    required: false
  })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({
    description: 'Start date and time',
    example: '2024-01-15T09:00:00.000Z'
  })
  @IsDateString()
  startDate: string;

  @ApiProperty({
    description: 'End date and time',
    example: '2024-01-15T10:00:00.000Z'
  })
  @IsDateString()
  endDate: string;

  @ApiProperty({
    description: 'Resource ID to reserve',
    example: '507f1f77bcf86cd799439011'
  })
  @IsString()
  resourceId: string;

  @ApiProperty({
    description: 'User ID making the reservation',
    example: 'prof-martinez-123'
  })
  @IsString()
  userId: string;

  @ApiProperty({
    description: 'Whether this is a recurring reservation',
    default: false
  })
  @IsOptional()
  @IsBoolean()
  isRecurring?: boolean = false;

  @ApiProperty({
    description: 'Recurrence pattern for recurring reservations',
    example: { freq: 'WEEKLY', count: 10, byweekday: ['MO'] },
    required: false
  })
  @IsOptional()
  @IsObject()
  recurrence?: any;
}
