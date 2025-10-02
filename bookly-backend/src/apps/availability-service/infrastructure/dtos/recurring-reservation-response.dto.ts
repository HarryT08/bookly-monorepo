/**
 * DTO for recurring reservation responses (RF-12)
 */

import { ApiProperty } from '@nestjs/swagger';
import { RecurrenceFrequency } from '../../utils';

export class RecurringReservationInstanceDto {
  @ApiProperty({
    description: 'Instance ID',
    example: '550e8400-e29b-41d4-a716-446655440000'
  })
  id: string;

  @ApiProperty({
    description: 'Date of this instance',
    example: '2024-01-15T00:00:00.000Z'
  })
  date: string;

  @ApiProperty({
    description: 'Start time of this instance',
    example: '08:00'
  })
  startTime: string;

  @ApiProperty({
    description: 'End time of this instance',
    example: '10:00'
  })
  endTime: string;

  @ApiProperty({
    description: 'Status of this instance',
    enum: ['PENDING', 'CONFIRMED', 'CANCELLED', 'COMPLETED', 'NO_SHOW'],
    example: 'CONFIRMED'
  })
  status: string;

  @ApiProperty({
    description: 'Whether this instance was confirmed by user',
    example: true
  })
  isConfirmed: boolean;

  @ApiProperty({
    description: 'Confirmation date',
    example: '2024-01-10T10:30:00.000Z',
    required: false
  })
  confirmedAt?: string;

  @ApiProperty({
    description: 'Cancellation reason if cancelled',
    required: false
  })
  cancellationReason?: string;

  @ApiProperty({
    description: 'Notes for this specific instance',
    required: false
  })
  notes?: string;
}

export class ResourceSummaryDto {
  @ApiProperty({
    description: 'Resource ID',
    example: '550e8400-e29b-41d4-a716-446655440000'
  })
  id: string;

  @ApiProperty({
    description: 'Resource name',
    example: 'Computer Lab A'
  })
  name: string;

  @ApiProperty({
    description: 'Resource type',
    example: 'LABORATORY'
  })
  type: string;

  @ApiProperty({
    description: 'Resource capacity',
    example: 30
  })
  capacity: number;

  @ApiProperty({
    description: 'Resource location',
    example: 'Building A, Floor 2'
  })
  location: string;
}

export class UserSummaryDto {
  @ApiProperty({
    description: 'User ID',
    example: '550e8400-e29b-41d4-a716-446655440000'
  })
  id: string;

  @ApiProperty({
    description: 'User full name',
    example: 'John Doe'
  })
  fullName: string;

  @ApiProperty({
    description: 'User email',
    example: 'john.doe@ufps.edu.co'
  })
  email: string;

  @ApiProperty({
    description: 'User role',
    example: 'TEACHER'
  })
  role: string;
}

export class RecurringReservationStatsDto {
  @ApiProperty({
    description: 'Total instances generated',
    example: 15
  })
  totalInstances: number;

  @ApiProperty({
    description: 'Confirmed instances',
    example: 12
  })
  confirmedInstances: number;

  @ApiProperty({
    description: 'Cancelled instances',
    example: 2
  })
  cancelledInstances: number;

  @ApiProperty({
    description: 'Completed instances',
    example: 8
  })
  completedInstances: number;

  @ApiProperty({
    description: 'No-show instances',
    example: 1
  })
  noShowInstances: number;

  @ApiProperty({
    description: 'Confirmation rate percentage',
    example: 80.0
  })
  confirmationRate: number;

  @ApiProperty({
    description: 'Completion rate percentage',
    example: 66.7
  })
  completionRate: number;

  @ApiProperty({
    description: 'Average days between booking and confirmation',
    example: 2.5
  })
  averageConfirmationTime: number;

  @ApiProperty({
    description: 'Next upcoming instance date',
    example: '2024-01-22T08:00:00.000Z',
    required: false
  })
  nextInstanceDate?: string;

  @ApiProperty({
    description: 'Last instance date',
    example: '2024-06-15T08:00:00.000Z',
    required: false
  })
  lastInstanceDate?: string;
}

export class RecurringReservationResponseDto {
  @ApiProperty({
    description: 'Recurring reservation ID',
    example: '550e8400-e29b-41d4-a716-446655440000'
  })
  id: string;

  @ApiProperty({
    description: 'Title of the recurring reservation',
    example: 'Weekly Programming Class'
  })
  title: string;

  @ApiProperty({
    description: 'Description of the recurring reservation',
    example: 'Advanced programming course for computer science students',
    required: false
  })
  description?: string;

  @ApiProperty({
    description: 'Resource information',
    type: ResourceSummaryDto
  })
  resource: ResourceSummaryDto;

  @ApiProperty({
    description: 'User who created the reservation',
    type: UserSummaryDto
  })
  user: UserSummaryDto;

  @ApiProperty({
    description: 'Start date of the series',
    example: '2024-01-15T00:00:00.000Z'
  })
  startDate: string;

  @ApiProperty({
    description: 'End date of the series',
    example: '2024-06-15T00:00:00.000Z'
  })
  endDate: string;

  @ApiProperty({
    description: 'Start time for each reservation',
    example: '08:00'
  })
  startTime: string;

  @ApiProperty({
    description: 'End time for each reservation',
    example: '10:00'
  })
  endTime: string;

  @ApiProperty({
    description: 'Frequency of the recurring reservation',
    enum: RecurrenceFrequency,
    example: RecurrenceFrequency.WEEKLY
  })
  frequency: RecurrenceFrequency;

  @ApiProperty({
    description: 'Interval between occurrences',
    example: 1
  })
  interval: number;

  @ApiProperty({
    description: 'Days of the week (for weekly frequency)',
    type: [Number],
    example: [1, 3, 5],
    required: false
  })
  daysOfWeek?: number[];

  @ApiProperty({
    description: 'Day of the month (for monthly frequency)',
    example: 15,
    required: false
  })
  dayOfMonth?: number;

  @ApiProperty({
    description: 'Current status of the recurring reservation',
    enum: ['ACTIVE', 'PAUSED', 'CANCELLED', 'COMPLETED'],
    example: 'ACTIVE'
  })
  status: string;

  @ApiProperty({
    description: 'Program ID associated with the reservation',
    example: '550e8400-e29b-41d4-a716-446655440001',
    required: false
  })
  programId?: string;

  @ApiProperty({
    description: 'Priority level',
    enum: ['LOW', 'MEDIUM', 'HIGH'],
    example: 'MEDIUM'
  })
  priority: string;

  @ApiProperty({
    description: 'Tags for categorization',
    type: [String],
    example: ['programming', 'computer-science', 'weekly'],
    required: false
  })
  tags?: string[];

  @ApiProperty({
    description: 'Additional notes',
    example: 'Requires projector and whiteboard',
    required: false
  })
  notes?: string;

  @ApiProperty({
    description: 'Auto-confirm instances',
    example: false
  })
  autoConfirm: boolean;

  @ApiProperty({
    description: 'Send notifications',
    example: true
  })
  sendNotifications: boolean;

  @ApiProperty({
    description: 'Require confirmation for each instance',
    example: true
  })
  requireConfirmation: boolean;

  @ApiProperty({
    description: 'Hours before event to send reminder',
    example: 24,
    required: false
  })
  reminderHours?: number;

  @ApiProperty({
    description: 'Statistics for this recurring reservation',
    type: RecurringReservationStatsDto
  })
  stats: RecurringReservationStatsDto;

  @ApiProperty({
    description: 'Recent instances (last 5)',
    type: [RecurringReservationInstanceDto],
    required: false
  })
  recentInstances?: RecurringReservationInstanceDto[];

  @ApiProperty({
    description: 'Upcoming instances (next 5)',
    type: [RecurringReservationInstanceDto],
    required: false
  })
  upcomingInstances?: RecurringReservationInstanceDto[];

  @ApiProperty({
    description: 'Creation timestamp',
    example: '2024-01-01T10:00:00.000Z'
  })
  createdAt: string;

  @ApiProperty({
    description: 'Last update timestamp',
    example: '2024-01-10T15:30:00.000Z'
  })
  updatedAt: string;

  @ApiProperty({
    description: 'User who created the reservation',
    example: '550e8400-e29b-41d4-a716-446655440002'
  })
  createdBy: string;

  @ApiProperty({
    description: 'User who last updated the reservation',
    example: '550e8400-e29b-41d4-a716-446655440002',
    required: false
  })
  updatedBy?: string;

  @ApiProperty({
    description: 'Whether the current user can modify this reservation',
    example: true
  })
  canModify: boolean;

  @ApiProperty({
    description: 'Whether the current user can cancel this reservation',
    example: true
  })
  canCancel: boolean;

  @ApiProperty({
    description: 'Warnings or notices about this reservation',
    type: [String],
    example: ['Some instances have conflicts', 'Resource maintenance scheduled'],
    required: false
  })
  warnings?: string[];

  @ApiProperty({
    description: 'Custom recurrence rule (for CUSTOM frequency)',
    example: 'FREQ=WEEKLY;BYDAY=MO,WE,FR;INTERVAL=2',
    required: false
  })
  customRule?: string;
}
