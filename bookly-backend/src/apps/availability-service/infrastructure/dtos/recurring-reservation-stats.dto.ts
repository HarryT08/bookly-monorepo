/**
 * RF-12: Recurring Reservation Statistics DTO
 * Statistics and analytics for recurring reservation performance
 */

import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, IsString, IsDateString, IsOptional, IsArray, ValidateNested, IsEnum } from 'class-validator';
import { Type } from 'class-transformer';
import { RecurringReservationStatus, RecurrenceFrequency } from '../../utils';

export class RecurringReservationMetricsDto {
  @ApiProperty({
    description: 'Total number of instances generated',
    example: 48
  })
  @IsNumber()
  totalInstances: number;

  @ApiProperty({
    description: 'Number of completed instances',
    example: 35
  })
  @IsNumber()
  completedInstances: number;

  @ApiProperty({
    description: 'Number of cancelled instances',
    example: 3
  })
  @IsNumber()
  cancelledInstances: number;

  @ApiProperty({
    description: 'Number of pending instances',
    example: 10
  })
  @IsNumber()
  pendingInstances: number;

  @ApiProperty({
    description: 'Number of instances with conflicts',
    example: 2
  })
  @IsNumber()
  conflictedInstances: number;

  @ApiProperty({
    description: 'Completion rate as percentage',
    example: 85.4
  })
  @IsNumber()
  completionRate: number;

  @ApiProperty({
    description: 'Cancellation rate as percentage',
    example: 6.25
  })
  @IsNumber()
  cancellationRate: number;

  @ApiProperty({
    description: 'Conflict rate as percentage',
    example: 4.17
  })
  @IsNumber()
  conflictRate: number;
}

export class RecurringReservationUsageDto {
  @ApiProperty({
    description: 'Total hours reserved',
    example: 96
  })
  @IsNumber()
  totalHoursReserved: number;

  @ApiProperty({
    description: 'Total hours actually used',
    example: 88
  })
  @IsNumber()
  totalHoursUsed: number;

  @ApiProperty({
    description: 'Average duration per instance in minutes',
    example: 120
  })
  @IsNumber()
  averageDurationMinutes: number;

  @ApiProperty({
    description: 'Usage efficiency as percentage',
    example: 91.67
  })
  @IsNumber()
  usageEfficiency: number;

  @ApiProperty({
    description: 'Peak usage day of the week',
    example: 'Tuesday'
  })
  @IsString()
  peakUsageDay: string;

  @ApiProperty({
    description: 'Peak usage hour of the day',
    example: 10
  })
  @IsNumber()
  peakUsageHour: number;
}

export class RecurringReservationPatternStatsDto {
  @ApiProperty({
    description: 'Recurrence frequency',
    enum: RecurrenceFrequency,
    example: RecurrenceFrequency.WEEKLY
  })
  @IsEnum(RecurrenceFrequency)
  frequency: RecurrenceFrequency;

  @ApiProperty({
    description: 'Number of reservations with this pattern',
    example: 15
  })
  @IsNumber()
  count: number;

  @ApiProperty({
    description: 'Average completion rate for this pattern',
    example: 87.5
  })
  @IsNumber()
  averageCompletionRate: number;

  @ApiProperty({
    description: 'Average duration in weeks',
    example: 12.5
  })
  @IsNumber()
  averageDurationWeeks: number;
}

export class RecurringReservationTimelineDto {
  @ApiProperty({
    description: 'Week number or date identifier',
    example: '2024-W12'
  })
  @IsString()
  period: string;

  @ApiProperty({
    description: 'Number of instances in this period',
    example: 4
  })
  @IsNumber()
  instanceCount: number;

  @ApiProperty({
    description: 'Number of completed instances',
    example: 3
  })
  @IsNumber()
  completedCount: number;

  @ApiProperty({
    description: 'Number of cancelled instances',
    example: 1
  })
  @IsNumber()
  cancelledCount: number;

  @ApiProperty({
    description: 'Total hours used in this period',
    example: 6
  })
  @IsNumber()
  hoursUsed: number;
}

export class RecurringReservationStatsDto {
  @ApiProperty({
    description: 'Recurring reservation ID',
    example: 'recurring123-456-789'
  })
  @IsString()
  recurringReservationId: string;

  @ApiProperty({
    description: 'Reservation title',
    example: 'Weekly Team Meeting'
  })
  @IsString()
  title: string;

  @ApiProperty({
    description: 'Current status',
    enum: RecurringReservationStatus,
    example: RecurringReservationStatus.ACTIVE
  })
  @IsEnum(RecurringReservationStatus)
  status: RecurringReservationStatus;

  @ApiProperty({
    description: 'Recurrence frequency',
    enum: RecurrenceFrequency,
    example: RecurrenceFrequency.WEEKLY
  })
  @IsEnum(RecurrenceFrequency)
  frequency: RecurrenceFrequency;

  @ApiProperty({
    description: 'Statistics period start date',
    example: '2024-01-01T00:00:00Z'
  })
  @IsDateString()
  periodStart: string;

  @ApiProperty({
    description: 'Statistics period end date',
    example: '2024-03-31T23:59:59Z'
  })
  @IsDateString()
  periodEnd: string;

  @ApiProperty({
    description: 'Overall metrics for this recurring reservation',
    type: RecurringReservationMetricsDto
  })
  @ValidateNested()
  @Type(() => RecurringReservationMetricsDto)
  metrics: RecurringReservationMetricsDto;

  @ApiProperty({
    description: 'Usage statistics',
    type: RecurringReservationUsageDto
  })
  @ValidateNested()
  @Type(() => RecurringReservationUsageDto)
  usage: RecurringReservationUsageDto;

  @ApiProperty({
    description: 'Timeline breakdown by periods',
    type: [RecurringReservationTimelineDto]
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => RecurringReservationTimelineDto)
  timeline: RecurringReservationTimelineDto[];

  @ApiProperty({
    description: 'Next scheduled instances count',
    example: 8
  })
  @IsNumber()
  upcomingInstances: number;

  @ApiProperty({
    description: 'Days until next instance',
    example: 3
  })
  @IsNumber()
  daysUntilNext: number;

  @ApiProperty({
    description: 'Estimated end date based on current pattern',
    example: '2024-12-31T23:59:59Z',
    required: false
  })
  @IsOptional()
  @IsDateString()
  estimatedEndDate?: string;

  @ApiProperty({
    description: 'Resource utilization score (0-100)',
    example: 85.5
  })
  @IsNumber()
  utilizationScore: number;

  @ApiProperty({
    description: 'Reliability score based on completion rate (0-100)',
    example: 92.3
  })
  @IsNumber()
  reliabilityScore: number;

  @ApiProperty({
    description: 'Most frequent cancellation reasons',
    required: false
  })
  @IsOptional()
  @IsArray()
  frequentCancellationReasons?: string[];

  @ApiProperty({
    description: 'Performance insights and recommendations',
    required: false
  })
  @IsOptional()
  insights?: {
    recommendations: string[];
    trends: string[];
    warnings: string[];
  };

  @ApiProperty({
    description: 'Last statistics update timestamp',
    example: '2024-03-15T10:30:00Z'
  })
  @IsDateString()
  lastUpdated: string;
}
