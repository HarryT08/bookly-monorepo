/**
 * RF-14: Waiting List Statistics DTO
 * Statistics and analytics for waiting list performance
 */

import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, IsString, IsDateString, IsOptional, IsArray, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

export class WaitingListMetricsDto {
  @ApiProperty({
    description: 'Total entries in waiting list',
    example: 25
  })
  @IsNumber()
  totalEntries: number;

  @ApiProperty({
    description: 'Currently waiting entries',
    example: 15
  })
  @IsNumber()
  currentlyWaiting: number;

  @ApiProperty({
    description: 'Notified entries awaiting confirmation',
    example: 3
  })
  @IsNumber()
  notifiedEntries: number;

  @ApiProperty({
    description: 'Confirmed entries',
    example: 5
  })
  @IsNumber()
  confirmedEntries: number;

  @ApiProperty({
    description: 'Expired entries',
    example: 2
  })
  @IsNumber()
  expiredEntries: number;

  @ApiProperty({
    description: 'Cancelled entries',
    example: 0
  })
  @IsNumber()
  cancelledEntries: number;
}

export class WaitingListTimingDto {
  @ApiProperty({
    description: 'Average wait time in minutes',
    example: 45.5
  })
  @IsNumber()
  averageWaitTime: number;

  @ApiProperty({
    description: 'Median wait time in minutes',
    example: 30
  })
  @IsNumber()
  medianWaitTime: number;

  @ApiProperty({
    description: 'Maximum wait time in minutes',
    example: 120
  })
  @IsNumber()
  maxWaitTime: number;

  @ApiProperty({
    description: 'Minimum wait time in minutes',
    example: 5
  })
  @IsNumber()
  minWaitTime: number;

  @ApiProperty({
    description: 'Average notification response time in minutes',
    example: 15.2
  })
  @IsNumber()
  averageResponseTime: number;
}

export class WaitingListPriorityStatsDto {
  @ApiProperty({
    description: 'Priority level',
    example: 'STUDENT'
  })
  @IsString()
  priority: string;

  @ApiProperty({
    description: 'Number of entries with this priority',
    example: 12
  })
  @IsNumber()
  count: number;

  @ApiProperty({
    description: 'Average wait time for this priority in minutes',
    example: 35.5
  })
  @IsNumber()
  averageWaitTime: number;

  @ApiProperty({
    description: 'Success rate (confirmed/total) as percentage',
    example: 85.5
  })
  @IsNumber()
  successRate: number;
}

export class WaitingListHourlyStatsDto {
  @ApiProperty({
    description: 'Hour of the day (0-23)',
    example: 9
  })
  @IsNumber()
  hour: number;

  @ApiProperty({
    description: 'Number of entries created in this hour',
    example: 5
  })
  @IsNumber()
  entriesCreated: number;

  @ApiProperty({
    description: 'Number of entries processed in this hour',
    example: 3
  })
  @IsNumber()
  entriesProcessed: number;

  @ApiProperty({
    description: 'Average wait time for entries in this hour',
    example: 25.5
  })
  @IsNumber()
  averageWaitTime: number;
}

export class WaitingListStatsDto {
  @ApiProperty({
    description: 'Resource ID for these statistics',
    example: 'resource456-789-012'
  })
  @IsString()
  resourceId: string;

  @ApiProperty({
    description: 'Resource name',
    example: 'Aula Magna'
  })
  @IsString()
  resourceName: string;

  @ApiProperty({
    description: 'Statistics period start date',
    example: '2024-03-01T00:00:00Z'
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
    description: 'Overall waiting list metrics',
    type: WaitingListMetricsDto
  })
  @ValidateNested()
  @Type(() => WaitingListMetricsDto)
  metrics: WaitingListMetricsDto;

  @ApiProperty({
    description: 'Timing statistics',
    type: WaitingListTimingDto
  })
  @ValidateNested()
  @Type(() => WaitingListTimingDto)
  timing: WaitingListTimingDto;

  @ApiProperty({
    description: 'Statistics by priority level',
    type: [WaitingListPriorityStatsDto]
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => WaitingListPriorityStatsDto)
  priorityStats: WaitingListPriorityStatsDto[];

  @ApiProperty({
    description: 'Hourly distribution statistics',
    type: [WaitingListHourlyStatsDto]
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => WaitingListHourlyStatsDto)
  hourlyStats: WaitingListHourlyStatsDto[];

  @ApiProperty({
    description: 'Current queue depth',
    example: 8
  })
  @IsNumber()
  currentQueueDepth: number;

  @ApiProperty({
    description: 'Peak queue depth in the period',
    example: 15
  })
  @IsNumber()
  peakQueueDepth: number;

  @ApiProperty({
    description: 'Success rate (confirmed entries / total entries) as percentage',
    example: 78.5
  })
  @IsNumber()
  overallSuccessRate: number;

  @ApiProperty({
    description: 'Abandonment rate (cancelled entries / total entries) as percentage',
    example: 12.3
  })
  @IsNumber()
  abandonmentRate: number;

  @ApiProperty({
    description: 'Most active day of the week',
    example: 'Monday'
  })
  @IsString()
  mostActiveDayOfWeek: string;

  @ApiProperty({
    description: 'Most active hour of the day',
    example: 9
  })
  @IsNumber()
  mostActiveHour: number;

  @ApiProperty({
    description: 'Last statistics update timestamp',
    example: '2024-03-15T10:30:00Z'
  })
  @IsDateString()
  lastUpdated: string;

  @ApiProperty({
    description: 'Additional insights and recommendations',
    required: false
  })
  @IsOptional()
  insights?: {
    recommendations: string[];
    trends: string[];
    alerts: string[];
  };
}
