import { IsString, IsDateString, IsOptional, IsBoolean, IsObject, IsEnum } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export enum ScheduleType {
  REGULAR = 'REGULAR',
  RESTRICTED = 'RESTRICTED',
  EXCEPTION = 'EXCEPTION',
  MAINTENANCE = 'MAINTENANCE',
  ACADEMIC_EVENT = 'ACADEMIC_EVENT'
}

/**
 * DTO for creating complex schedules (RF-07)
 * Supports institutional restrictions and complex scheduling rules
 */
export class CreateScheduleDto {
  @ApiProperty({
    description: 'Resource ID',
    example: '507f1f77bcf86cd799439011'
  })
  @IsString()
  resourceId: string;

  @ApiProperty({
    description: 'Schedule name',
    example: 'Semester 1 Schedule'
  })
  @IsString()
  name: string;

  @ApiProperty({
    description: 'Schedule type',
    enum: ScheduleType,
    example: ScheduleType.REGULAR
  })
  @IsEnum(ScheduleType)
  type: ScheduleType;

  @ApiProperty({
    description: 'Start date of the schedule',
    example: '2024-01-15T00:00:00.000Z'
  })
  @IsDateString()
  startDate: string;

  @ApiProperty({
    description: 'End date of the schedule (optional for ongoing schedules)',
    example: '2024-06-15T23:59:59.999Z',
    required: false
  })
  @IsOptional()
  @IsDateString()
  endDate?: string;

  @ApiProperty({
    description: 'Recurrence rule in RRULE format (RFC 5545)',
    example: { freq: 'WEEKLY', byweekday: ['MO', 'WE', 'FR'], byhour: [9, 14] },
    required: false
  })
  @IsOptional()
  @IsObject()
  recurrenceRule?: any;

  @ApiProperty({
    description: 'User type restrictions and priority rules',
    example: { 
      allowedUserTypes: ['PROFESSOR', 'ADMIN'], 
      priority: 'HIGH',
      minAdvanceNotice: 24 
    },
    required: false
  })
  @IsOptional()
  @IsObject()
  restrictions?: any;

  @ApiProperty({
    description: 'Whether this schedule is active',
    default: true
  })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean = true;
}
