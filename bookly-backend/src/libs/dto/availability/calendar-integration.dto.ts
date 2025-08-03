import { IsString, IsOptional, IsBoolean, IsObject, IsEnum, IsInt, Min } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export enum CalendarProvider {
  GOOGLE = 'GOOGLE',
  OUTLOOK = 'OUTLOOK',
  ICAL = 'ICAL',
  INTERNAL = 'INTERNAL'
}

/**
 * DTO for creating calendar integration (RF-08)
 * Supports integration with external calendar providers
 */
export class CreateCalendarIntegrationDto {
  @ApiProperty({
    description: 'Resource ID (optional for global integration)',
    example: '507f1f77bcf86cd799439011',
    required: false
  })
  @IsOptional()
  @IsString()
  resourceId?: string;

  @ApiProperty({
    description: 'Calendar provider',
    enum: CalendarProvider,
    example: CalendarProvider.GOOGLE
  })
  @IsEnum(CalendarProvider)
  provider: CalendarProvider;

  @ApiProperty({
    description: 'Integration name',
    example: 'Main Conference Room Calendar'
  })
  @IsString()
  name: string;

  @ApiProperty({
    description: 'Calendar credentials (API keys, tokens, etc.)',
    example: { apiKey: 'xxx', clientId: 'yyy', clientSecret: 'zzz' }
  })
  @IsObject()
  credentials: any;

  @ApiProperty({
    description: 'External calendar ID',
    example: 'primary',
    required: false
  })
  @IsOptional()
  @IsString()
  calendarId?: string;

  @ApiProperty({
    description: 'Sync interval in minutes',
    minimum: 5,
    default: 30
  })
  @IsOptional()
  @IsInt()
  @Min(5)
  syncInterval?: number = 30;

  @ApiProperty({
    description: 'Whether this integration is active',
    default: true
  })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean = true;
}

/**
 * DTO for querying availability with calendar conflicts (RF-10)
 */
export class AvailabilityQueryDto {
  @ApiProperty({
    description: 'Resource ID to check availability for',
    example: '507f1f77bcf86cd799439011',
    required: false
  })
  @IsOptional()
  @IsString()
  resourceId?: string;

  @ApiProperty({
    description: 'Start date for availability check',
    example: '2024-01-15T00:00:00.000Z'
  })
  @IsString()
  startDate: string;

  @ApiProperty({
    description: 'End date for availability check',
    example: '2024-01-22T23:59:59.999Z'
  })
  @IsString()
  endDate: string;

  @ApiProperty({
    description: 'Resource type filter',
    example: 'ROOM',
    required: false
  })
  @IsOptional()
  @IsString()
  resourceType?: string;

  @ApiProperty({
    description: 'Location filter',
    example: 'Building A',
    required: false
  })
  @IsOptional()
  @IsString()
  location?: string;
}
