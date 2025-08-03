import { IsString, IsDateString, IsOptional, IsBoolean, IsEnum, IsArray } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export enum CalendarViewType {
  MONTH = 'MONTH',
  WEEK = 'WEEK',
  DAY = 'DAY',
  AGENDA = 'AGENDA'
}

export enum EventType {
  RESERVATION = 'RESERVATION',
  SCHEDULE = 'SCHEDULE',
  MAINTENANCE = 'MAINTENANCE',
  EXTERNAL_CALENDAR = 'EXTERNAL_CALENDAR',
  AVAILABILITY = 'AVAILABILITY'
}

export enum EventStatus {
  CONFIRMED = 'CONFIRMED',
  TENTATIVE = 'TENTATIVE',
  CANCELLED = 'CANCELLED',
  PENDING = 'PENDING'
}

/**
 * DTO for calendar view query (RF-10)
 * Supports different calendar views and filtering options
 */
export class CalendarViewQueryDto {
  @ApiProperty({
    description: 'Resource ID to show calendar for',
    example: '507f1f77bcf86cd799439011',
    required: false
  })
  @IsOptional()
  @IsString()
  resourceId?: string;

  @ApiProperty({
    description: 'Start date for calendar view',
    example: '2024-01-01T00:00:00.000Z'
  })
  @IsDateString()
  startDate: string;

  @ApiProperty({
    description: 'End date for calendar view',
    example: '2024-01-31T23:59:59.999Z'
  })
  @IsDateString()
  endDate: string;

  @ApiProperty({
    description: 'Calendar view type',
    enum: CalendarViewType,
    default: CalendarViewType.MONTH
  })
  @IsOptional()
  @IsEnum(CalendarViewType)
  viewType?: CalendarViewType = CalendarViewType.MONTH;

  @ApiProperty({
    description: 'Event types to include',
    enum: EventType,
    isArray: true,
    required: false
  })
  @IsOptional()
  @IsArray()
  @IsEnum(EventType, { each: true })
  eventTypes?: EventType[];

  @ApiProperty({
    description: 'Include availability slots',
    default: true
  })
  @IsOptional()
  @IsBoolean()
  includeAvailability?: boolean = true;

  @ApiProperty({
    description: 'Include external calendar events',
    default: true
  })
  @IsOptional()
  @IsBoolean()
  includeExternalEvents?: boolean = true;

  @ApiProperty({
    description: 'User ID for personalized view',
    required: false
  })
  @IsOptional()
  @IsString()
  userId?: string;
}

/**
 * Calendar event representation for UI (RF-10)
 */
export class CalendarEventDto {
  @ApiProperty({
    description: 'Event ID',
    example: 'event-123'
  })
  id: string;

  @ApiProperty({
    description: 'Event title',
    example: 'Team Meeting'
  })
  title: string;

  @ApiProperty({
    description: 'Event description',
    example: 'Weekly team standup meeting'
  })
  description?: string;

  @ApiProperty({
    description: 'Event start date and time',
    example: '2024-01-15T10:00:00.000Z'
  })
  startDate: Date;

  @ApiProperty({
    description: 'Event end date and time',
    example: '2024-01-15T11:00:00.000Z'
  })
  endDate: Date;

  @ApiProperty({
    description: 'Event type',
    enum: EventType
  })
  type: EventType;

  @ApiProperty({
    description: 'Event status',
    enum: EventStatus
  })
  status: EventStatus;

  @ApiProperty({
    description: 'Resource ID',
    example: '507f1f77bcf86cd799439011'
  })
  resourceId: string;

  @ApiProperty({
    description: 'User ID (for reservations)',
    required: false
  })
  userId?: string;

  @ApiProperty({
    description: 'Whether this is an all-day event',
    default: false
  })
  isAllDay: boolean;

  @ApiProperty({
    description: 'Event color for UI display',
    example: '#3498db'
  })
  color: string;

  @ApiProperty({
    description: 'Whether event is editable by current user',
    default: false
  })
  editable: boolean;

  @ApiProperty({
    description: 'Event location',
    required: false
  })
  location?: string;

  @ApiProperty({
    description: 'Event attendees',
    required: false
  })
  attendees?: string[];

  @ApiProperty({
    description: 'Additional metadata',
    required: false
  })
  metadata?: any;
}

/**
 * Calendar view response (RF-10)
 */
export class CalendarViewResponseDto {
  @ApiProperty({
    description: 'Calendar events',
    type: [CalendarEventDto]
  })
  events: CalendarEventDto[];

  @ApiProperty({
    description: 'View configuration'
  })
  view: {
    type: CalendarViewType;
    startDate: Date;
    endDate: Date;
    resourceId?: string;
  };

  @ApiProperty({
    description: 'Availability summary'
  })
  summary: {
    totalEvents: number;
    reservations: number;
    availableSlots: number;
    conflicts: number;
    eventsByType: Record<EventType, number>;
  };

  @ApiProperty({
    description: 'Resource information',
    required: false
  })
  resource?: {
    id: string;
    name: string;
    type: string;
    capacity?: number;
  };
}
