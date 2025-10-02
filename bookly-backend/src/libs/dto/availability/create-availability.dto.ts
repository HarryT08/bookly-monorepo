import { IsString, IsInt, IsBoolean, IsOptional, Min, Max, Matches } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

/**
 * DTO for creating resource availability (RF-07)
 * Defines basic availability hours for a resource on specific days
 */
export class CreateAvailabilityDto {
  @ApiProperty({
    description: 'Resource ID',
    example: '507f1f77bcf86cd799439011'
  })
  @IsString()
  resourceId: string;

  @ApiProperty({
    description: 'Day of week (0=Sunday, 1=Monday, ..., 6=Saturday)',
    minimum: 0,
    maximum: 6,
    example: 1
  })
  @IsInt()
  @Min(0)
  @Max(6)
  dayOfWeek: number;

  @ApiProperty({
    description: 'Start time in HH:mm format',
    example: '08:00'
  })
  @IsString()
  @Matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, {
    message: 'startTime must be in HH:mm format'
  })
  startTime: string;

  @ApiProperty({
    description: 'End time in HH:mm format',
    example: '18:00'
  })
  @IsString()
  @Matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, {
    message: 'endTime must be in HH:mm format'
  })
  endTime: string;

  @ApiProperty({
    description: 'Whether this availability is active',
    default: true
  })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean = true;
}
